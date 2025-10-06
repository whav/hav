import os
from collections import defaultdict
from functools import lru_cache
from pathlib import Path
from re import Pattern

from colorama import Fore, Style
from django.conf import settings
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist
from django.core.management.base import CommandError

from hav.apps.media.models import (
    License,
    MediaCreator,
    MediaCreatorRole,
    MediaType,
    Tag,
)

from .management.commands.csv_file_helpers import (
    csv_headers,
    field_sanity_check_definitions,
)


def _check_field(
    line,
    line_number: int,
    field: str,
    is_mandatory: bool = True,
    target_types: list = [],
    target_regex: Pattern = None,
    target_values: list = [],
    description: str = "",
):
    value = line.get(field)

    # first check if we got empty field data and if that is OK
    if value == "" and not is_mandatory:
        return
    if value == "" and is_mandatory:
        return f"{Fore.RED}ERROR@CSV-line {line_number+1}:{Style.RESET_ALL} \
field '{field}', value: '{value}'\n This field is mandatory."

    # try to cast to int if we expect integers
    if int in target_types:
        try:
            value = int(value)
        except ValueError:
            pass

    # check against target_types
    type_error = 1 if type(value) not in target_types else 0
    # check against target_regex (if any)
    regex_error = 1 if target_regex and not target_regex.match(str(value)) else 0
    # check against target_values (if any)
    value_error = 1 if target_values and value not in target_values else 0

    # provide some useful feedback depending on error type
    if type_error or regex_error or value_error:
        error_msg = ""
        error_msg += f"{Fore.RED}ERROR@CSV-line {line_number+1}:{Style.RESET_ALL} field \
'{field}', value: '{value}'\n"
        if type_error:
            error_msg += f"'{value}' is {type(value)} ==>> expected: {target_types}.\n"
        if regex_error:
            error_msg += (
                f"'{value}' ==>> (expected value conforming to: {target_regex}\n"
            )
        if value_error:
            error_msg += f"'{value}' ==>> (expected values: {target_values})\n"
        error_msg += f"{Fore.CYAN}EXPLANATION:{Style.RESET_ALL} {description}"

        return error_msg
    return


def _check_folder_or_file_exists(
    fs_entity, is_file=False, needs_write_permission=False
):
    """Check if folder (default) or file (is_file=True) exists and that the
    current user has read (default) or read/write permissions (has_write_permission=True).
    """
    error_msg = ""
    exists_check = os.path.isdir if not is_file else os.path.isfile
    perm_check = os.R_OK if not needs_write_permission else os.R_OK | os.W_OK

    error_msg += (
        f"{Fore.RED}ERROR:{Style.RESET_ALL} '{fs_entity}' does not exist."
        if not exists_check(fs_entity)
        else ""
    )

    if not error_msg:
        error_msg += (
            f"{Fore.RED}ERROR:{Style.RESET_ALL} '{fs_entity}' failed permission check."
            if not os.access(fs_entity, perm_check)
            else ""
        )

    return error_msg


def check_sanity(csv_data, check_source_files=False, max_errors=10):
    print(f"{Fore.YELLOW}\n================{Style.RESET_ALL}\nstarting sanity-check")

    to_check = defaultdict(set)

    field_errors = []
    source_file_errors = []
    for line_number, line in csv_data:
        # check if referenced sourcefiles exist and are readable
        if check_source_files:
            sourcefile = Path(settings.INCOMING_FILES_ROOT).joinpath(
                os.path.normpath(line[csv_headers["sourcefile"]])
            )
            source_file_error = _check_folder_or_file_exists(
                sourcefile, is_file=True, needs_write_permission=True
            )
            source_file_errors += [source_file_error] if source_file_error else []

        # Check (some of) our fields of each csv line against a set of definitions
        # provided in field_sanity_check_definitions (as defined in csv_file_helper.py).
        for f2c in field_sanity_check_definitions:
            field_error = _check_field(
                line,
                line_number,
                f2c.name,
                is_mandatory=f2c.is_mandatory,
                target_types=f2c.target_types,
                target_regex=f2c.target_regex,
                target_values=f2c.target_values,
                description=f2c.description,
            )
            field_errors += [field_error] if field_error else []

        # prepate related files data to be checked (if any)
        if line.get(csv_headers["cd_relfile"]):
            # multiple related files' creators seperated by newline
            # multiple creators per related file separated by semicolon:
            # "relfile1creator1; relfile1creator2\nrelfile2creator1; relfile2creator2"
            relcreators = [
                c
                for _c in line[csv_headers["cd_relfilecreator"]].split("\n")
                for c in _c.split("; ")
            ]
            # same for related file creator roles
            relcreatorroles = [
                cr
                for _cr in line[csv_headers["cd_relfilerole"]].split("\n")
                for cr in _cr.split("; ")
            ]
            rellicences = line[csv_headers["cd_relfilelicense"]].split("\n")
        else:
            relcreators, relcreatorroles, rellicences = [], [], []
        # prepare creator data to be checked
        creators = filter(
            None, line[csv_headers["md_creator"]].split("\n") + relcreators
        )
        # prepare role data (from both creators/relfile creators)
        roles = filter(None, line[csv_headers["md_role"]].split("\n") + relcreatorroles)
        # prepare license data (one media at a time > csv_headers["md_license"] is always only one)
        licenses = filter(None, [line[csv_headers["md_license"]]] + rellicences)
        # get original mtype data
        origmtype = line.get(csv_headers["md_origmtype"])

        # populate to_check dict with prepared data for later consumption
        to_check[MediaCreator].update(creators)
        to_check[MediaCreatorRole].update(roles)
        to_check[License].update(licenses)
        # .update takes iterables > use .add for single items
        to_check[MediaType].add(origmtype)

    print(
        f"{Fore.YELLOW}|| checking basic csv data field consistency... {Style.RESET_ALL}",
        end="",
    )
    if not field_errors:
        print(f"{Fore.GREEN}all good.{Style.RESET_ALL}", end="")
    else:
        print(f"\n{len(field_errors)} field errors: ", end="")
        print() if not max_errors or len(field_errors) < max_errors else print(
            f"showing last {max_errors}..."
        )
        for e in field_errors[:max_errors]:
            print(e, "\n-")

    # check if creator/role/..-entities referenced in CSV data exist in our DB
    print(
        f"\n{Fore.YELLOW}|| checking if data entities referenced in CSV data \
exist in our DB... {Style.RESET_ALL}",
        end="",
    )

    referenced_entity_errors = []
    for model, values in to_check.items():
        for v in values:
            ref_error = _check_referenced_entity_exists_in_db(v, model)
            referenced_entity_errors += [ref_error] if ref_error else []
    if not referenced_entity_errors:
        print(f"{Fore.GREEN}all good.{Style.RESET_ALL}")
    else:
        print(f"\n{len(referenced_entity_errors)} referenced entity errors: ", end="")
        print() if not max_errors or len(
            referenced_entity_errors
        ) < max_errors else print(f"showing last {max_errors}...")
        for e in referenced_entity_errors[:max_errors]:
            print(e)

    # report source_file_errors if we have been checking for them
    if check_source_files:
        print(
            f"{Fore.YELLOW}|| checking if source files referenced in CSV data \
exist are available in the incoming folder... {Style.RESET_ALL}",
            end="",
        )
        if not source_file_errors:
            print(f"{Fore.GREEN}all good.{Style.RESET_ALL}")
        else:
            print(f"\n{len(source_file_errors)} source file errors: ", end="")
            print() if not max_errors or len(
                source_file_errors
            ) < max_errors else print(f"showing last {max_errors}...")
            for e in source_file_errors[:max_errors]:
                print(e)

    # raise SanityCheckError if we got field errors, missing source files or have
    # referenced entities not yet available in the DB
    if field_errors or referenced_entity_errors or source_file_errors:
        raise CommandError("Sanity-check failed", returncode=1)

    print(f"{Fore.GREEN}Sanity-check complete{Style.RESET_ALL}\n=============\n")
    return


def _check_referenced_entity_exists_in_db(querystring, model):
    if _get_pk_from_csvfield(querystring, model):
        return ""
    else:
        return f"{Fore.RED}ERROR@reference:{Style.RESET_ALL} {model} matching query\
'{querystring}' does not exist."


# hacky, cached ORM query helper
@lru_cache(maxsize=1024)
def _get_pk_from_csvfield(querystring, model):
    """a hacky, cached ORM lookup helper bending the data from the CSV fields
    into what the respective queried models expect.
    """
    try:
        if model == MediaCreator:
            # CSV data comes as string in the form "name surname"
            if querystring.isupper() and len(querystring) == 3:
                return model.objects.get(display_name=querystring).pk
            elif "," in querystring:
                last_name, first_name = querystring.split(", ")
            else:
                try:
                    first_name, last_name = querystring.split()
                except ValueError:
                    first_name, last_name = "", querystring
            return model.objects.get(first_name=first_name, last_name=last_name).pk
        elif model == MediaType:
            # CSV data comes as string in the form "type:name" (e.g. analoge:trans_35)
            qss = querystring.split(":")
            if qss[0] == "analoge" or qss[0] == "analog":
                mtype = 1
            elif qss[0] == "digital":
                mtype = 2
            else:
                raise ValueError(f"Unknown mediatype: {qss[0]}")
            return model.objects.get(name=qss[1], type=mtype).pk
        elif model == License:
            # CSV Data holds License short name
            return model.objects.get(short_name=querystring).pk
        else:
            # CSV Data is equal to the name field of the model (for MediaCreatorRole)
            return model.objects.get(name=querystring).pk
    except ObjectDoesNotExist:
        return None


# cached get_or_create helper for tags
@lru_cache(1024)
def _cached_get_or_create_tags(tagname, target_collection):
    return Tag.objects.get_or_create(name=tagname, collection=target_collection)


# simple get_or_create-like helper for treebeard child-nodes
def _get_or_create_node(nodename, parentnode, create_new_node=True):
    """get or create a child named "nodename" for given parentnode; return
    a tuple containing the childnode and "True" or "False" depending if it
    has been newly created or not
    """
    matches = [n for n in parentnode.get_children() if n.name == nodename]
    if not matches and create_new_node:
        newnode = parentnode.add_child(name=nodename)
        return newnode, True
    elif not matches:
        return None, False
    elif len(matches) == 1:
        return matches[0], False
    else:
        raise MultipleObjectsReturned(
            f"found multiple target nodes {matches} for parent: {parentnode}"
        )


def get_or_create_subnodes_from_path(relative_path, target_node, create_new_nodes=True):
    """take string containing a relative path and a targed parent node;
    get/create subnodes for each path segment and return the last node
    """
    for path_segment in relative_path.split(os.sep):
        new_node, created = _get_or_create_node(
            path_segment, target_node, create_new_node=create_new_nodes
        )
        if created:
            print(f"Node {new_node} has been created in parent-node {target_node}")
        if not new_node:
            return None
        target_node = new_node
    return target_node


def _generate_source_creators_license_data(scl_data, is_attachment=False):
    """Prepare the basic "source", "creators" and "license" json data for an
    archvive media or its related media files (i.e. attachments)."""

    # Since multiple related media files can be provided per archive media in our
    # import CSV rows, the data for the respective creators/roles is separeated
    # by semicolons to allow for multiple creator/role pairs also there
    cr_splitchar = "\n" if not is_attachment else "; "

    # some naming inconsistancy here
    license_keyname = "media_license" if not is_attachment else "license"

    return {
        "source": scl_data[0],
        license_keyname: _get_pk_from_csvfield(scl_data[3], License),
        "creators": [
            {
                "creator": _get_pk_from_csvfield(cr[0], MediaCreator),
                "role": _get_pk_from_csvfield(cr[1], MediaCreatorRole),
            }
            for cr in zip(
                scl_data[1].split(cr_splitchar),
                scl_data[2].split(cr_splitchar),
            )
        ],
    }


def media_data_from_csv(source_id, csv_line_dict, collection, attachment_ids):
    archive_media_base_data = [
        source_id,
        csv_line_dict[csv_headers["md_creator"]],
        csv_line_dict[csv_headers["md_role"]],
        csv_line_dict[csv_headers["md_license"]],
    ]

    attachments_base_data = (
        zip(
            attachment_ids,
            csv_line_dict[csv_headers["cd_relfilecreator"]].split("\n"),
            csv_line_dict[csv_headers["cd_relfilerole"]].split("\n"),
            csv_line_dict[csv_headers["cd_relfilelicense"]].split("\n"),
        )
        if attachment_ids
        else []
    )

    # throw all extra fields into tags for the time being
    tags = csv_line_dict.get(csv_headers["cd_tags"], []).split("\n")
    extratags = [
        ("country", csv_line_dict.get(csv_headers["cd_country"])),
        ("province/state", csv_line_dict.get(csv_headers["cd_provincestate"])),
        ("municipality", csv_line_dict.get(csv_headers["cd_municipality"])),
        ("city", csv_line_dict.get(csv_headers["cd_city"])),
        ("location", csv_line_dict.get(csv_headers["cd_location"])),
        ("location_detail", csv_line_dict.get(csv_headers["cd_locationdetail"])),
        ("media_shorthandle", csv_line_dict.get(csv_headers["md_shorthandle"])),
        ("rotate", csv_line_dict.get(csv_headers["md_rotate"])),
        ("maxResolution", csv_line_dict.get(csv_headers["md_maxres"])),
    ]
    extratags.extend(
        [
            ("description_author", _da)
            for _da in csv_line_dict.get(csv_headers["description_author"]).split("\n")
            if _da
        ]
    )
    tags.extend(f"{e[0]}:{e[1]}" for e in extratags if e[1])

    # try splitting csv_headers["cd_gpsdata"] in lat and lon
    _gpsdata = csv_line_dict[csv_headers["cd_gpsdata"]]
    if _gpsdata:
        lat, lon = _gpsdata.split(", ")
        lat, lon = round(float(lat), 6), round(float(lon), 6)
        print(f"GPS data provided: {lat}, {lon}")
    else:
        print("No GPS data provided.")
        lat, lon = None, None

    md = {
        # generate the source, creators, license JSON data for the archive media
        **_generate_source_creators_license_data(archive_media_base_data),
        "date": csv_line_dict[csv_headers["md_origmdate"]],
        "media_type": _get_pk_from_csvfield(
            csv_line_dict[csv_headers["md_origmtype"]], MediaType
        ),
        "media_title": csv_line_dict[csv_headers["cd_title"]],
        # generate the source, creators, license JSON data for attached media it any
        "attachments": [
            _generate_source_creators_license_data(attachment_data, is_attachment=True)
            for attachment_data in attachments_base_data
        ],
        "media_description": csv_line_dict.get(csv_headers["cd_description"], ""),
        "media_identifier": ", ".join(
            filter(
                None,
                [
                    csv_line_dict.get(csv_headers["md_origsig"]),
                    csv_line_dict.get(csv_headers["md_sig"]),
                ],
            )
        ),
        "embargo_end_date": csv_line_dict.get(csv_headers["md_embargoend"]) or None,
        "is_private": True
        if csv_line_dict[csv_headers["md_isprivate"]].lower() in ["true", "1"]
        else False,
        "media_tags": [
            {"id": str(_cached_get_or_create_tags(t, collection)[0].id)} for t in tags
        ],
    }

    # DRF's decimalfield serializer is not accepting empty/none values
    # so add lat/lon keys only if we got something.
    if lat and lon:
        md.update({"media_lat": lat, "media_lon": lon})

    return md
