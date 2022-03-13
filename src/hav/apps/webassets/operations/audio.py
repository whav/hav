import logging
import subprocess

logger = logging.getLogger(__name__)

from .utils import FFMPEG


def convert(source, target, *args, **hints):
    logger.info("Audio conversion starting.")
    task = subprocess.run(
        [
            FFMPEG,
            "-i",
            source,
            "-c:a",
            "aac",  # audio codec aac
            "-movflags",
            "faststart",  # this moves the moov atom to the front of the file
            "-y",  # overwrite output files
            target,
        ],
        check=True,
    )
    return task


convert.extension = ".m4a"


def create_waveform(source, target, *args, **hints):
    logger.info("Creating audio waveform.")
    return subprocess.run(
        [
            FFMPEG,
            "-i",
            source,
            "-filter_complex",
            "aformat=channel_layouts=mono,showwavespic=s=1024x768:colors=black",
            "-frames:v",
            "1",
            "-y",
            target,
        ],
        check=True,
    )


create_waveform.extension = "png"
