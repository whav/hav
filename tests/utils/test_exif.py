import subprocess
from pathlib import Path

import pytest

from hav.utils.exif import get_exif_data

TESTDATA = Path(__file__).parents[1] / "webassets/testdata"


@pytest.mark.parametrize("name", ["image.jpg", "image.nef", "sound.mp3"])
def test_get_exif_data(name):
    meta = get_exif_data(TESTDATA / name)
    assert "ExifTool:ExifToolVersion" in meta
    assert "SourceFile" not in meta
    assert not any(key.startswith("File:") for key in meta)


def test_values():
    meta = get_exif_data(TESTDATA / "image.jpg")
    assert meta["EXIF:Make"] == "SONY"
    assert meta["EXIF:ISO"] == 250
    # -n: numbers instead of formatted strings ("1/250")
    assert meta["EXIF:ExposureTime"] == 0.004


def test_missing_file(tmp_path):
    with pytest.raises(subprocess.CalledProcessError):
        get_exif_data(tmp_path / "missing.jpg")
