import subprocess
import logging
import json
import os
import re

from distutils.spawn import find_executable

logger = logging.getLogger(__name__)


FFMPEG = find_executable("ffmpeg")
FFPROBE = find_executable("ffprobe")


class FFProbe(object):
    def __init__(self, source):
        if not os.path.exists(source):
            raise ValueError("Source file {} does not exitst.".format(repr(source)))

        self.source = source

        cmd = [
            FFPROBE,
            "-v",
            "quiet",
            "-print_format",
            "json",
            "-show_format",
            "-show_streams",
            source,
        ]

        result = subprocess.run(
            cmd, check=True, stdout=subprocess.PIPE, universal_newlines=True
        )
        self._ffprobe = json.loads(result.stdout)

    @property
    def duration(self):
        try:
            return float(self._ffprobe["format"]["duration"])
        except KeyError:
            return None


class BatchFFProbe(object):
    """
    A collection of FFProbe instances that cache their results for each source.
    """

    _cache = {}

    def ffprobe(self, source):
        return self._cache.setdefault(source, FFProbe(source))


ffprobe = BatchFFProbe().ffprobe


IDET_RESULT_PARSER = re.compile(
    r"TFF:\s*(?P<tff>\d+)\s*BFF:\s*(?P<bff>\d+)\s*Progressive:\s*(?P<progressive>\d+)\s*Undetermined:\s*(?P<undetermined>\d+)",
    re.MULTILINE,
)


def is_interlaced(source, frames=200, at_beginning=True):
    logger.info("Detecting interlaced status for {}".format(source))
    args = [
        "-filter:v",
        "idet",
        "-frames:v",
        str(frames),
        "-an",
        "-f",
        "rawvideo",
        "-y",
        "/dev/null",
        "-i",
        source,
    ]

    if not at_beginning:
        probe = FFProbe(source)
        # start at 10 percent of total duration
        args = ["-ss", str(int(probe.duration / 10)), *args]

    cmd = [FFMPEG, *args]
    result = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=True,
        universal_newlines=True,
    )
    output = result.stdout
    matches = IDET_RESULT_PARSER.findall(output)

    if len(matches) == 0:
        logger.warning(
            "No match found for idet filter output parsing. Full output was: {}".format(
                output
            )
        )
        return None

    # last match is used for decision
    tff, bff, progressive, undetermined = (int(x) for x in matches[-1])
    interlaced = tff + bff
    frames = (interlaced, progressive, undetermined)
    max_detected = max(frames)

    if max_detected == interlaced:
        return True
    elif max_detected == progressive:
        return False
    else:
        return None
