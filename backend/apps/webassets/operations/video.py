import subprocess


def convert(source, target, *args):
    task = subprocess.run([
        'ffmpeg',
        '-i', source,
        '-c:v', 'libx264',          # x264 codec
        '-crf', '22',               # constant rate factor
        '-c:a', 'aac',              # audio codec aac
        '-movflags', 'faststart',   # this moves the moov atom to the front of the file
        '-y',                       # overwrite output files
        target
    ],
        check=True
    )
    return task


convert.extension = '.mp4'

