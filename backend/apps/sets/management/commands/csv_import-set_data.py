import os
import argparse
import csv
import sys
from django.core.management.base import BaseCommand

from apps.hav_collections.models import Collection
from apps.ingest.utils import (
    cached_get_or_create_tags,
    get_or_create_subnodes_from_path,
)


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("csv_file", type=argparse.FileType("r"))
        parser.add_argument("collection_slug", type=str)
        parser.add_argument(
            "--create_nodes",
            default=False,
            action="store_true",
            help="create non-existing nodes",
        )

    def handle(self, *args, **options):
        csv_file = options["csv_file"]
        collection = Collection.objects.get(slug=options["collection_slug"])

        if collection:
            while True:
                i = input(
                    f"About to import node-data to collection: '{collection}'.\
 Continue? [Y/N]\n"
                ).lower()
                if i == "n" or i == "no":
                    sys.exit("Operation aborted by user.")
                elif i == "y" or i == "yes":
                    break

        for line in csv.DictReader(csv_file):
            # clean up node path given in CSV
            target_node_path = os.path.normpath(line["HAV:Node"]).strip("/")

            target_node = get_or_create_subnodes_from_path(
                target_node_path,
                collection.root_node,
                create_new_nodes=options["create_nodes"],
            )

            if not target_node:
                print(f"\nNode: {target_node_path} not found, skipping…")
                continue

            description = line.get("HAV:Node:Description")
            if description:
                target_node.description = description
                edited = True
            tags = line.get("HAV:Node:Tags", []).split("\n")
            if tags:
                tag_list = [cached_get_or_create_tags(t, collection)[0] for t in tags]
                target_node.tags.set(tag_list)
                edited = True
            if edited:
                target_node.save()
