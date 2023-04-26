import os
from collections import defaultdict
from functools import lru_cache

from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist

from hav.apps.media.models import (
    License,
    MediaCreator,
    MediaCreatorRole,
    MediaType,
    Tag,
)

# MediaDescription Fieldnames from CSV
md_origmdate = "HAV:MediaDescription:OriginalMediaDate"
md_origmtype = "HAV:MediaDescription:OriginalMediaType"
md_creator = "HAV:MediaDescription:MediaCreator"
md_role = "HAV:MediaDescription:MediaCreatorRole"
md_license = "HAV:MediaDescription:License"
md_sig = "HAV:MediaDescription:Signature"
md_origsig = "HAV:MediaDescription:OriginalSignature"
# ContentDescription Fieldnames from CSV
cd_title = "HAV:ContentDescription:Title"
cd_description = "HAV:ContentDescription:Description"
cd_tags = "HAV:ContentDescription:Tags"
cd_country = "HAV:ContentDescription:Country"
cd_provincestate = "HAV:ContentDescription:Province-State"
cd_municipality = "HAV:ContentDescription:Municipality"
cd_city = "HAV:ContentDescription:City"
cd_location = "HAV:ContentDescription:Location"
cd_locationdetail = "HAV:ContentDescription:LocationDetail"
cd_author = "HAV:Description:Author"
cd_relfile = "HAV:ContentDescription:RelatedFiles"
cd_relfilecreator = "HAV:ContentDescription:RelatedFilesCreator"
cd_relfilerole = "HAV:ContentDescription:RelatedFilesCreatorRole"
cd_relfilelicense = "HAV:ContentDescription:RelatedFilesLicense"
# new stuff
md_embargoend = "HAV:MediaDescription:EmbargoEndDate"
md_isprivate = "HAV:MediaDescription:IsPrivate"
cd_gpsdata = "HAV:ContentDescription:GPSData"
md_rotate = "HAV:MediaDescription:Rotate"
md_maxres = "HAV:MediaDescription:ResolutionLimit"
md_shorthandle = "HAV:MediaDescription:ShortHandleOverride"


class SanityCheckError(Exception):
    pass


def check_sanity(csv_data):
    print("\n================\nstarting sanity-check")
    to_check = defaultdict(set)
    for line_number, line in csv_data:
        # multiple related files' creators seperated by newline
        # multiple creators per related file separated by semicolon:
        # "relfile1creator1; relfile1creator2\nrelfile2creator1; relfile2creator2"
        relcreators = [
            c for _c in line[cd_relfilecreator].split("\n") for c in _c.split("; ")
        ]
        # same for related file creator roles
        relcreatorroles = [
            cr for _cr in line[cd_relfilerole].split("\n") for cr in _cr.split("; ")
        ]

        creators = filter(None, line[md_creator].split("\n") + relcreators)
        roles = filter(None, line[md_role].split("\n") + relcreatorroles)
        # one media at a time > md_license is always only one
        licenses = filter(
            None, [line[md_license]] + line[cd_relfilelicense].split("\n")
        )
        to_check[MediaCreator].update(creators)
        to_check[MediaCreatorRole].update(roles)
        to_check[License].update(licenses)
        to_check[MediaType].add(line[md_origmtype])
    pklist = []
    for model, values in to_check.items():
        for v in values:
            pklist.append(get_pk_from_csvfield(v, model))
    if None in pklist:
        raise SanityCheckError("Sanity-check failed…")
    else:
        print("\nSanity-check complete\n=============\n")


# hacky, cached ORM query helper
@lru_cache(maxsize=1024)
def get_pk_from_csvfield(querystring, model):
    """a hacky, cached ORM lookup helper bending the data from the CSV fields
    into what the respective queried models expect.
    """
    try:
        if model == MediaCreator:
            # CSV data comes as string in the form "name surname"
            if "," in querystring:
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
        print(f"{model} matching query '{querystring}' does not exist.")
        return None


# cached get_or_create helper for tags
@lru_cache(1024)
def cached_get_or_create_tags(tagname, target_collection):
    return Tag.objects.get_or_create(name=tagname, collection=target_collection)


# simple get_or_create-like helper for treebeard child-nodes
def get_or_create_node(nodename, parentnode, create_new_node=True):
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
        new_node, created = get_or_create_node(
            path_segment, target_node, create_new_node=create_new_nodes
        )
        if created:
            print(f"Node {new_node} has been created in parent-node {target_node}")
        if not new_node:
            return None
        target_node = new_node
    return target_node


def generate_source_creators_license_data(scl_data, is_attachment=False):
    """Prepare an the basic "source", "creators" and "license" json data for an
    for archvive media or its related media files (i.e. attachments)."""

    # Since multiple related media files can be provided per archive media in our
    # import CSV rows, the data for the respective creators/roles is separeated
    # by semicolons to allow for multiple creator/role pairs also there
    cr_splitchar = "\n" if not is_attachment else "; "

    # some naming inconsistancy here
    license_keyname = "media_license" if not is_attachment else "license"

    return {
        "source": scl_data[0],
        license_keyname: get_pk_from_csvfield(scl_data[3], License),
        "creators": [
            {
                "creator": get_pk_from_csvfield(cr[0], MediaCreator),
                "role": get_pk_from_csvfield(cr[1], MediaCreatorRole),
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
        csv_line_dict[md_creator],
        csv_line_dict[md_role],
        csv_line_dict[md_license],
    ]

    attachments_base_data = (
        zip(
            attachment_ids,
            csv_line_dict[cd_relfilecreator].split("\n"),
            csv_line_dict[cd_relfilerole].split("\n"),
            csv_line_dict[cd_relfilelicense].split("\n"),
        )
        if attachment_ids
        else []
    )

    # throw all extra fields into tags for the time being
    tags = csv_line_dict.get(cd_tags, []).split("\n")
    extratags = [
        ("country", csv_line_dict.get(cd_country)),
        ("province/state", csv_line_dict.get(cd_provincestate)),
        ("municipality", csv_line_dict.get(cd_municipality)),
        ("city", csv_line_dict.get(cd_city)),
        ("location", csv_line_dict.get(cd_location)),
        ("location_detail", csv_line_dict.get(cd_locationdetail)),
        ("media_shorthandle", csv_line_dict.get(md_shorthandle)),
        ("rotate", csv_line_dict.get(md_rotate)),
        ("MaxResolution", csv_line_dict.get(md_maxres)),
    ]
    extratags.extend(
        [
            ("description_author", _da)
            for _da in csv_line_dict.get(cd_author).split("\n")
            if _da
        ]
    )
    tags.extend(f"{e[0]}:{e[1]}" for e in extratags if e[1])

    # try splitting cd_gpsdata in lat and lon
    try:
        lat, lon = csv_line_dict[cd_gpsdata].split(", ")
        lat, lon = round(float(lat), 6), round(float(lon), 6)
    except ValueError as err:
        print(err)
        lat, lon = None, None

    md = {
        # generate the source, creators, license JSON data for the archive media
        **generate_source_creators_license_data(archive_media_base_data),
        "date": csv_line_dict[md_origmdate],
        "media_type": get_pk_from_csvfield(csv_line_dict[md_origmtype], MediaType),
        "media_title": csv_line_dict[cd_title],
        # generate the source, creators, license JSON data for attached media it any
        "attachments": [
            generate_source_creators_license_data(attachment_data, is_attachment=True)
            for attachment_data in attachments_base_data
        ],
        "media_description": csv_line_dict.get(cd_description, ""),
        "media_identifier": ", ".join(
            filter(
                None,
                [
                    csv_line_dict.get(md_origsig),
                    csv_line_dict.get(md_sig),
                ],
            )
        ),
        "embargo_end_date": csv_line_dict.get(md_embargoend) or None,
        "is_private": True if csv_line_dict[md_isprivate].lower() == "true" else False,
        "media_tags": [
            {"id": str(cached_get_or_create_tags(t, collection)[0].id)} for t in tags
        ],
    }

    # DRF's decimalfield serializer is not accepting empty/none values
    # so add lat/lon keys only if we got something.
    if lat and lon:
        md.update({"media_lat": lat, "media_lon": lon})

    return md
