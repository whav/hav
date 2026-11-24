import json
import subprocess


def get_exif_data(file):
    """All metadata exiftool finds, keyed "Group:Tag", without file system info."""
    result = subprocess.run(
        ["exiftool", "-json", "-G", "-n", "--", str(file)],
        capture_output=True,
        check=True,
    )
    meta = json.loads(result.stdout)[0]

    # remove some possibly sensitive data from the metadata
    meta.pop("SourceFile", None)
    return {k: v for k, v in meta.items() if not k.startswith("File:")}
