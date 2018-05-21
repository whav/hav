import subprocess

import logging

def convert(source, target, *args, logger=logging.getLogger(__name__)):
    logger.info('Converting video. Source file: {}, target file: {}'.format(source, target))
    cmd = [
            'ffmpeg',
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

