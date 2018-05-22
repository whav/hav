import os
import shutil
import requests
from hav.utils.imaginary import generate_url

def convert(source, target, archivefile):
    # since the source argument is absolute
    # grab the relative path from the database
    # object directly
    relative_file_name = archivefile.file.name
    url = generate_url(
        os.path.join('archive/', relative_file_name),
        operation='convert',
        width=None,
        height=None,
        type='jpeg'
    )

    response = requests.get(url, stream=True)

    with open(target, 'wb') as out_file:
        shutil.copyfileobj(response.raw, out_file)
    del response


convert.extension = '.jpg'

