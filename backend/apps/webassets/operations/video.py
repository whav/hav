import subprocess
import logging
from .utils import is_interlaced, FFProbe

from distutils.spawn import find_executable

logger = logging.getLogger(__name__)


FFMPEG = find_executable("ffmpeg")


def convert(source, target, *args):
    logger.info(
        "Converting video. Source file: {}, target file: {}".format(source, target)
    )
    args = [
        "-i",
        source,
        "-c:v",
        "libx264",  # x264 codec
        "-crf",
        "22",  # constant rate factor
        "-c:a",
        "aac",  # audio codec aac
        "-movflags",
        "faststart",  # this moves the moov atom to the front of the file
        "-y",  # overwrite output files
        target,
    ]

    # try to figure out if the source is interlaced
    interlaced = is_interlaced(source)
    # None is undecided, so try harder
    if interlaced is None:
        interlaced = is_interlaced(source, at_beginning=False)

    # add de-interlacing dependent on our detection routines
    if interlaced:
        logger.info("Interlace detection returned True. Using yadif filter.")
        args = [*args[:2], "-vf", "yadif", *args[2:]]
    else:
        logger.info(
            "Interlace detection returned {}. Skipping deinterlace filters.".format(
                repr(interlaced)
            )
        )

    popen = subprocess.Popen(
        [FFMPEG, *args],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
    )
    for line in iter(popen.stdout.readline, ""):
        logger.info(line)

    popen.stdout.close()
    return_code = popen.wait()

    if return_code:
        raise subprocess.CalledProcessError(return_code, args)

    return return_code


convert.extension = ".mp4"


def create_thumbnail(source, target):
    logger.info(
        "Creating video thumbnail. Source file: {}, target file: {}".format(
            source, target
        )
    )
    duration = FFProbe(source).duration
    args = [
        "-y",
        # "-ss", str(int(duration / 2)),
        "-i",
        source,
        "-f",
        "mjpeg",
        "-vframes",
        "1",
        target,
    ]
    subprocess.run([FFMPEG, *args], check=True)
