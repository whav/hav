import os
from unittest import TestCase
from hav.apps.archive.operations.hash import generate_hash

file_path = os.path.join(os.path.dirname(__file__), "file.bin")
file_hash = "0f44d2842c92c273968c1410f941f0e1d1ad8321"


class HashTest(TestCase):
    def test_has_generator(self):
        calculated_hash = generate_hash(file_path)
        self.assertEqual(calculated_hash, file_hash)
