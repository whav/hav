import os
import argparse
import csv
from datetime import datetime
from pathlib import Path
from functools import lru_cache
from rest_framework.test import RequestsClient
from django.conf import settings
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist
from django.urls import reverse

from apps.sets.models import Node
from apps.media.models import MediaCreator, MediaCreatorRole, MediaType, License, Tag
from apps.ingest.models import IngestQueue
from sources.filesystem.utils import encodePath


# hacky, cached ORM query helper
@lru_cache(maxsize=1024)
def get_pk_from_csvfield(querystring, model):
    '''a hacky, cached ORM lookup helper bending the data from the CSV fields
    into what the respective queried models expect.
    '''
    try:
        if model == MediaCreator:
            # CSV data comes as string in the form "name surname"
            return model.objects.get(
                first_name=querystring.split()[0],
                last_name=querystring.split()[1]).pk
        elif model == MediaType:
            # CSV data comes as string in the form "type:name" (e.g. analoge:trans_35)
            qss = querystring.split(':')
            if qss[0] == 'analoge':
                mtype = 1
            elif qss[0] == 'digital':
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
    except ObjectDoesNotExist as err:
        raise ObjectDoesNotExist(f"{model} matching query '{querystring}' does not exist.") from err


# cached get_or_create helper for tags
@lru_cache(1024)
def cached_get_or_create_tags(tagname, target_collection):
    return Tag.objects.get_or_create(name=tagname,
                                     collection=target_collection)


# simple get_or_create-like helper for treebeard child-nodes
def get_or_create_node(nodename, parentnode):
    ''' get or create a child named "nodename" for given parentnode; return
    a tuple containing the childnode and "True" or "False" depending if it
    has been newly created or not
    '''
    matches = [n for n in parentnode.get_children() if n.name == nodename]
    if not matches:
        newnode = parentnode.add_child(name=nodename)
        return newnode, True
    elif len(matches) == 1:
        return matches[0], False
    else:
        raise MultipleObjectsReturned(f"found multiple target nodes {matches} for parent: {parentnode}")


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("csv_file", type=argparse.FileType("r"))
        parser.add_argument("set_id", type=int)
        parser.add_argument("ingest_user", type=str)
        parser.add_argument("-b", "--api_base_url", type=str, default="http://localhost:8000")
        parser.add_argument(
            "--dry-run", nargs="?", dest="dry_run", const=True, default=False
        )

    def handle(self, *args, **options):
        timestamp = int(datetime.now().timestamp())
        base_url = options['api_base_url']
        print(base_url)
        user = User.objects.get(username=options['ingest_user'])
        # set up client and auth headers
        client = RequestsClient()
        headers = {'Authorization': 'Token ' + settings.DRF_AUTH_TOKEN}

        media_data_from_csv = self.media_data_from_csv_maker()

        csv_file = options["csv_file"]
        target_parent_node = Node.objects.get(pk=options["set_id"])
        collection = target_parent_node.get_collection()

        # root_path = Path(csv_file.name).resolve().parent
        root_path = Path(settings.INCOMING_FILES_ROOT)

        csv_reader = csv.DictReader(csv_file)
        fieldnames = csv_reader.fieldnames

        tracklog = []
        target_q = None
        for line_number, line in enumerate(csv_reader):
            # clean up Sourcefile path given in CSV
            rel_file_path = str(Path(line["SourceFile"]))
            absolute_file_path = root_path.joinpath(rel_file_path)
            if not absolute_file_path.exists():
                raise CommandError(
                    f"Referenced file {absolute_file_path} (line: {line_number}) does not exist."
                )

            source_id = base_url + '/api/v1/sources/incoming/' + str(encodePath(rel_file_path)) + '=/'
            print(source_id)
            media_data = media_data_from_csv(source_id, line, collection)
            target_file_node = self.get_or_create_subnodes_from_path(rel_file_path,
                                                                     target_parent_node)
            if not target_q or not target_q.target == target_file_node:
                target_q = IngestQueue.objects.create(
                    target=target_file_node,
                    created_by=user,
                    name=f"CSV-Ingest to {target_file_node.name}"
                )
                ingest_url = reverse("api:v1:ingest:ingest_queue_ingest",
                                     kwargs={"pk": str(target_q.pk)})
                print(ingest_url)

            print(f"Target node: {target_file_node}")
            resp = client.post(base_url + str(ingest_url), json=media_data, headers=headers)
            line['csv_import_status'] = resp.status_code
            line['csv_import_mediapk'] = resp.json()['pk']
            tracklog.append(line)
            print(resp)
            print("===" * 10)

        with open(os.path.basename(csv_file.name) + "_"
                    + str(timestamp) + "_importtracklog.csv", 'w') as of:
            fieldnames.append('csv_import_status')
            fieldnames.append('csv_import_mediapk')
            csvwriter = csv.DictWriter(of, fieldnames)
            csvwriter.writeheader()
            for row in tracklog:
                print(type(row), row)
                csvwriter.writerow(row)

    @staticmethod
    def media_data_from_csv_maker():
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
        cd_city = "HAV:ContentDescription:City"
        cd_author = "HAV:ContentDescription:Author"

        def append_to_tags(tags, extrataglist):
            for tag in extrataglist:
                tags.append(f"{tag[0]}:{tag[1]}") if tag[1] else None
            return tags

        def media_data_from_csv(source_id, csv_line_dict, collection):
            # throw all extra fields into tags for the time being
            tags = csv_line_dict[cd_tags].split(", ")
            extratags = [("country", csv_line_dict[cd_country]),
                         ("province/state", csv_line_dict[cd_provincestate]),
                         ("city", csv_line_dict[cd_city]),
                         ("signature", csv_line_dict[md_sig]),
                         ("orig_signature", csv_line_dict[md_origsig]),
                         ("desctiption_author", csv_line_dict[cd_author])
                         ]
            tags = append_to_tags(tags, extratags)

            return {
                "date": csv_line_dict[md_origmdate],
                "creators": [{"creator": get_pk_from_csvfield(cr[0], MediaCreator),
                              "role": get_pk_from_csvfield(cr[1], MediaCreatorRole)} for cr in zip(csv_line_dict[md_creator].split('\n'), csv_line_dict[md_role].split('\n'))],
                "media_license": get_pk_from_csvfield(csv_line_dict[md_license],
                                                      License),
                "media_type": get_pk_from_csvfield(csv_line_dict[md_origmtype],
                                                   MediaType),
                "source": source_id,
                "media_title": csv_line_dict[cd_title],
                "attachments": [],
                "media_tags": [{"id": str(cached_get_or_create_tags(t,
                                collection)[0].id)} for t in tags],
                "media_description": csv_line_dict[cd_description],
            }

        return media_data_from_csv

    @staticmethod
    def get_or_create_subnodes_from_path(relative_path, target_node):
        ''' take string containing a relative path and a targed parent node;
        get/create subnodes for each path segment and return the last node
        '''
        for path_segment in os.path.dirname(os.path.normpath(relative_path)).split(os.sep):
            new_node, created = get_or_create_node(path_segment, target_node)
            if created:
                print(f"Node {new_node} has been created in parent-node {target_node}")
            target_node = new_node
        return target_node
