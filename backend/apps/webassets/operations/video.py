import subprocess
import re
import logging
import json

from distutils.spawn import find_executable

logger = logging.getLogger(__name__)


FFMPEG = find_executable('ffmpeg')
FFPROBE = find_executable('ffprobe')


class FFProbe(object):

    _cache = {}

    def _ffprobe(self, source):
        cmd = [
            FFPROBE,
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            '-show_streams',
            source
        ]
        popen = subprocess.Popen(cmd, stdout=subprocess.PIPE, universal_newlines=True)
        return_code = popen.wait()
        if return_code:
            raise subprocess.CalledProcessError(return_code, cmd)

        return json.loads(popen.stdout.read())

    def ffprobe(self, source):
        return self._cache.setdefault(source, self._ffprobe(source))


ffprobe = FFProbe().ffprobe


IDET_RESULT_PARSER = re.compile(
    r'TFF:\s*(?P<tff>\d+)\s*BFF:\s*(?P<bff>\d+)\s*Progressive:\s*(?P<progressive>\d+)\s*Undetermined:\s*(?P<undetermined>\d+)',
    re.MULTILINE
)

def is_interlaced(source):
    logger.info('Detecting interlaced status for {}'.format(source))
    cmd = [
            FFMPEG,
            '-filter:v', 'idet',
            '-frames:v', '200',
            '-an',
            '-f', 'rawvideo',
            '-y', '/dev/null',
            '-i', source
        ]
    popen = subprocess.Popen(cmd, stdout=subprocess.PIPE, universal_newlines=True)
    popen.wait()
    output = popen.stdout.read().strip()

    matches = IDET_RESULT_PARSER.findall(output)
    if len(matches) is None:
        logger.warning('No match found for idet filter output parsing. Full output was: {}'.format(output))
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
        # undecided
        return None


def convert(source, target, *args, logger=logger):
    logger.info('Converting video. Source file: {}, target file: {}'.format(source, target))
    cmd = [
            FFMPEG,
            '-i', source,
            '-c:v', 'libx264',          # x264 codec
            '-crf', '22',               # constant rate factor
            '-c:a', 'aac',              # audio codec aac
            '-movflags', 'faststart',   # this moves the moov atom to the front of the file
            '-y',                       # overwrite output files
            target
        ]

    popen = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, universal_newlines=True)
    for line in iter(popen.stdout.readline, ""):
        logger.info(line)

    popen.stdout.close()
    return_code = popen.wait()

    if return_code:
        raise subprocess.CalledProcessError(return_code, cmd)

    return return_code


convert.extension = '.mp4'

