# ffmpeg -i input.avi -c:v libx264 -crf 22 -c:a aac -movflags faststart output.mp4
# ['ffmpeg', '-i', 'input.avi', '-c:v', 'libx264', '-crf', '22', '-c:a', 'aac', '-movflags', 'faststart', 'output.mp4']

import subprocess

def convert(source, target, *args):
    print(source, target)
    subprocess.Popen([
        'ffmpeg',
        '-i', source,
        '-c:v', 'libx264',
        '-crf', '22',
        '-c:a', 'aac',
        '-movflags',
        'faststart',
        target
    ])
    return


convert.extension = '.mp4'

