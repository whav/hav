import argparse
import csv
import logging
import os
from datetime import datetime
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.urls import reverse
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

from .csv_file_helpers import csv_headers

logger = logging.getLogger(__name__)


def _check_logfile_path_permissions(path):
    logger.debug(f"Checking file permissions for CSV-Logfile path '{path}'.")
    assert os.path.isdir(path), "CSV-Logfile path does not exist."
    assert os.access(
        path, os.W_OK
    ), "CSV-Logfile path is not writeable by current user."
    logger.debug("Basic CSV-Logfile path checks passed.")


def _check_optional_retry_run_data_validity(is_retry_run, import_status_row):
    if is_retry_run and import_status_row is None:
        raise CommandError(
            "\nYou provided the '--retry' flag but your CSV-data does not contain a \
csv_import_status field. Make sure you are using the import-tracklog file of \
a previous import run as data source."
        )
    elif not is_retry_run and import_status_row:
        raise CommandError(
            "\nYou provided CSV-data from the import-tracklog file of a previous import run \
without providing the '--resume' flag."
        )


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
            "--fullsanitycheckreport",
            default=False,
            action="store_true",
            help="show all errors encountered during sanity check (otherwise truncated \
to a maximum of 10 errors by type to increase readability)",
        )
        parser.add_argument(
            "--sanitycheckonly",
            default=False,
            action="store_true",
            help="run sanity checks without importing data",
        )

    def handle(self, *args, **options):
        # get parameters from CLI
        base_url = options["api_base_url"]
        csv_file = options["csv_file"]
        target_parent_node = Node.objects.get(pk=options["set_id"])
        user = User.objects.get(username=options["ingest_user"])

        # some basic setup for csv_import tracklog
        timestamp = int(datetime.now().timestamp())
        csv_logfile_path = Path(settings.INGEST_LOG_DIR)
        logfile = csv_logfile_path.joinpath(
            os.path.basename(csv_file.name)
            + "_"
            + str(timestamp)
            + "_importtracklog.csv"
        )
        tracklog = []
        target_q = None
        success_cnt, failed_cnt = 0, 0

        # set up client and auth headers
        client = RequestsClient()
        headers = {"Authorization": "Token " + settings.DRF_AUTH_TOKEN}
        collection = target_parent_node.get_collection()

        # read data from ingest CSV-file
        csv_reader = csv.DictReader(csv_file)
        fieldnames = csv_reader.fieldnames
        csv_data = []
        for line_number, line in enumerate(csv_reader):
            csv_data.append([line_number, line])

        # some sanity checks before we proceed
        _check_logfile_path_permissions(csv_logfile_path)
        _check_optional_retry_run_data_validity(
            options["retry"], csv_data[0][1].get("csv_import_status")
        )
        check_sanity(
            csv_data,
            check_source_files=True,
            max_errors=None if options["fullsanitycheckreport"] else 10,
        )

        if options["sanitycheckonly"]:
            return

        # process data
        for line_number, line in csv_data:
            if options["retry"]:
                status_code = line.get("csv_import_status")
                if str(status_code) == "201":
                    # TODO: write code...status_code == "201":
                    self.stdout.write(f"Skipping {line[csv_headers['sourcefile']]}'.")
                    continue
                # re-import only the failed entries a previous run's tracklog file
                else:
                    self.stdout.write(
                        f"Attemting to reimport {line[csv_headers['sourcefile']]}(tracklog\
    line numer: {line_number})…"
                    )

            # clean up Sourcefile path given in CSV
            rel_file_path = os.path.normpath(line[csv_headers["sourcefile"]])

            source_id = (
                base_url
                + reverse("api:v1:filebrowser_root")
                + str(encodePath(rel_file_path))
                + "=/"
            )

            # handle Attachment Files if any
            attachments = line.get(csv_headers["cd_relfile"])
            attachment_ids = []
            if attachments:
                for a in attachments:
                    a_file_path = os.path.normpath(line[csv_headers["cd_relfile"]])

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
                os.path.normpath(line[csv_headers["targetnode"]])
                if line.get(csv_headers["targetnode"])
                else os.path.dirname(rel_file_path)
            )
            target_file_node = get_or_create_subnodes_from_path(
                target_node_path, target_parent_node
            )
            if not target_q or not target_q.target == target_file_node:
                target_q = IngestQueue.objects.create(
                    target=target_file_node,
                    created_by=user,
                    name=f"CSV-Ingest to {target_file_node.name[:50]}\
                            (Node: {target_file_node.id})",
                )
                ingest_url = reverse(
                    "api:v1:ingest:ingest_queue_ingest", kwargs={"pk": str(target_q.pk)}
                )

            self.stdout.write(f"Source file: {rel_file_path}")
            self.stdout.write(f"Target node: {target_file_node}")
            self.stdout.write(str(media_data))

            resp = client.post(
                base_url + str(ingest_url), json=media_data, headers=headers
            )

            self.stdout.write(str(resp.content))
            self.stdout.write(str(resp))
            self.stdout.write("===" * 10)

            new_media_pk = resp.json().get("pk")
            line["csv_import_status"] = resp.status_code
            if new_media_pk:
                line["csv_import_mediapk"] = new_media_pk
                success_cnt += 1
            else:
                line["csv_import_mediapk"] = "failed"
                line["csv_import_additionalinfo"] = resp.content.decode("UTF-8")
                failed_cnt += 1
            tracklog.append(line)

        self.stdout.write("saving tracklog…")
        try:
            with open(logfile, "w") as of:
                fieldnames.append("csv_import_status")
                fieldnames.append("csv_import_additionalinfo")
                fieldnames.append("csv_import_mediapk")
                csvwriter = csv.DictWriter(of, fieldnames)
                csvwriter.writeheader()
                for row in tracklog:
                    csvwriter.writerow(row)
        except Exception as e:
            self.stdout.write("ERROR: Writing LogFile failed:", str(e))

        self.stdout.write("===" * 10)
        self.stdout.write("\nImport Summary:")
        self.stdout.write("===" * 10)
        self.stdout.write(
            f"Successful imports: {success_cnt}\nFailed imports: {failed_cnt}\n"
        )
