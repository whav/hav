from io import StringIO
import os
from django.test import TestCase
from django.core.management import call_command, CommandError

from apps.hav_collections.models import Collection
from apps.sets.models import Node


class TestCSVImport(TestCase):

    csv_file = os.path.join(os.path.dirname(__file__), "./meta.csv")

    def setUp(self) -> None:
        self.root_node = Node.add_root(name="test")
        self.collection = Collection.objects.create(
            name="test", short_name="test", root_node=self.root_node
        )

    def run_command(self, *args, **kwargs):
        output = StringIO()
        call_command("csv_import", *args, stdout=output)
        return output.getvalue()

    def testCommandErrors(self):

        with self.assertRaises(CommandError):
            self.run_command()
            self.run_command(self.csv_file)

    def testCommandSuccess(self):
        self.run_command(self.csv_file, self.root_node.pk)
