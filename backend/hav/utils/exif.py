import exiftool
# from collections import Counter

def get_exif_data(file):

    file = str(file)

    with exiftool.ExifTool() as et:
        meta = et.get_metadata(file)

    # remove some possibly sensitive data from the metadata
    if 'SourceFile' in meta:
        meta.pop('SourceFile')

    meta = {k: v for k, v in meta.items() if not str(k).startswith('File:')}
    # category_keys = [k.split(':', maxsplit=1)[0] for k in meta.keys()]

    return meta

