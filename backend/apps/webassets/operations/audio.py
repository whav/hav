import subprocess

import logging

def convert(source, target, *args, logger=logging.getLogger(__name__)):
    logger.info('Audio conversion starting.')
    task = subprocess.run([
        'ffmpeg',
        '-i', source,
        '-c:a', 'aac',              # audio codec aac
        '-movflags', 'faststart',   # this moves the moov atom to the front of the file
        '-y',                       # overwrite output files
        target
    ],
        check=True
    )
    return task

convert.extension = '.m4a'
