import argparse
import csv
import os
from datetime import datetime
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.urls import reverse
from rest_framework import status
from rest_framework.test import RequestsClient

from hav.apps.accounts.models import User
from hav.apps.ingest.models import IngestQueue
from hav.apps.ingest.utils import (
    check_sanity,
    get_or_create_subnodes_from_path,
    media_data_from_csv,
)
from hav.apps.sets.models import Node
from hav.apps.sources.filesystem.utils import encodePath


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("csv_file", type=argparse.FileType("r"))
        parser.add_argument("set_id", type=int)
        parser.add_argument("ingest_user", type=str)
        parser.add_argument(
            "--api_base_url",
            type=str,
            default="http://localhost:8000",
            help="override api base url",
        )
        parser.add_argument(
            "--retry",
            default=False,
            action="store_true",
            help="retry importing failed entries from the tracklog-file of a previous import run",
        )
        parser.add_argument(
            "--bullhead",
            default=False,
            action="store_true",
            help="continue import run despite Error 500 return-codes",
        )

    def handle(self, *args, **options):
        timestamp = int(datetime.now().timestamp())
        base_url = options["api_base_url"]
        user = User.objects.get(username=options["ingest_user"])
        # set up client and auth headers
        client = RequestsClient()
        headers = {"Authorization": "Token " + settings.DRF_AUTH_TOKEN}

        csv_file = options["csv_file"]
        target_parent_node = Node.objects.get(pk=options["set_id"])
        collection = target_parent_node.get_collection()

        csv_reader = csv.DictReader(csv_file)
        fieldnames = csv_reader.fieldnames

        csv_data = []
        for line_number, line in enumerate(csv_reader):
            csv_data.append([line_number, line])

        check_sanity(csv_data)

        tracklog = []
        target_q = None
        success_cnt, failed_cnt = 0, 0
        for line_number, line in csv_data:
            # retry from the tracklog of a previous import run…
            if options["retry"]:
                status_code = line.get("csv_import_status")
                if status_code is None:
                    raise CommandError(
                        "You provided the '--resume' flag but your CSV-data does not contain a\
csv_import_status field. Make sure you are using a tracklog of\
a previous import run as data source."
                    )
                if str(status_code) == "201":
                    # TODO: write code...status_code == "201":
                    print(f"Skipping '{line['SourceFile']}'.")
                    continue
                else:
                    print(
                        f"Attemting to reimport {line['SourceFile']}(tracklog\
line numer: {line_number})…"
                    )

            # clean up Sourcefile path given in CSV
            rel_file_path = os.path.normpath(line["SourceFile"])

            source_id = (
                base_url
                + reverse("api:v1:filebrowser_root")
                + str(encodePath(rel_file_path))
                + "=/"
            )

            # handle Attachment Files if any
            attachments = line["HAV:ContentDescription:RelatedFiles"]
            attachment_ids = []
            if attachments:
                for a in attachments:
                    a_file_path = os.path.normpath(
                        line["HAV:ContentDescription:RelatedFiles"]
                    )

                    attachment_ids.append(
                        base_url
                        + reverse("api:v1:filebrowser_root")
                        + str(encodePath(a_file_path))
                        + "=/"
                    )

            # prepare the actual JSON payload
            media_data = media_data_from_csv(
                source_id, line, collection, attachment_ids
            )
            target_node_path = (
                os.path.normpath(line["TargetNodePath"])
                if line.get("TargetNodePath")
                else os.path.dirname(rel_file_path)
            )
            target_file_node = get_or_create_subnodes_from_path(
                target_node_path, target_parent_node
            )
            if not target_q or not target_q.target == target_file_node:
                target_q = IngestQueue.objects.create(
                    target=target_file_node,
                    created_by=user,
                    name=f"CSV-Ingest to {target_file_node.name}",
                )
                ingest_url = reverse(
                    "api:v1:ingest:ingest_queue_ingest", kwargs={"pk": str(target_q.pk)}
                )

            print(f"Source file: {rel_file_path}")
            print(f"Target node: {target_file_node}")
            print(media_data)

            resp = client.post(
                base_url + str(ingest_url), json=media_data, headers=headers
            )

            # bullhead mode: don't crash on E500s
            if options["bullhead"] and status.is_server_error(resp.status_code):
                new_media_pk = None
            else:
                new_media_pk = resp.json().get("pk")

            print(resp.content)
            print(resp)
            print("===" * 10)

            line["csv_import_status"] = resp.status_code
            if new_media_pk:
                line["csv_import_mediapk"] = new_media_pk
                success_cnt += 1
            else:
                line["csv_import_mediapk"] = "failed"
                line["csv_import_additionalinfo"] = resp.content.decode("UTF-8")
                failed_cnt += 1
            tracklog.append(line)

        print("saving tracklog…")
        logfile = Path(settings.INGEST_LOG_DIR).joinpath(
            os.path.basename(csv_file.name)
            + "_"
            + str(timestamp)
            + "_importtracklog.csv"
        )

        try:
            with open(logfile, "w") as of:
                fieldnames.append("csv_import_status")
                fieldnames.append("csv_import_additionalinfo")
                fieldnames.append("csv_import_mediapk")
                csvwriter = csv.DictWriter(of, fieldnames)
                csvwriter.writeheader()
                for row in tracklog:
                    csvwriter.writerow(row)
        except Exception:
            print(
                "ERROR: Writing LogFile failed: ",
            )

        print("===" * 10)
        print("\nImport Summary:")
        print("===" * 10)
        print(f"Successful imports: {success_cnt}\nFailed imports: {failed_cnt}\n")
