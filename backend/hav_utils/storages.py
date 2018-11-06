import hashlib
import base64
from urllib.parse import urlencode, urljoin

from django.utils.module_loading import import_string
from django.conf import settings
from django.core.files.storage import FileSystemStorage, DefaultStorage


class ProtectedFileSystemStorage(FileSystemStorage):

    def __init__(self, *args, secret_key=settings.IMAGESERVER_CONFIG.get('secret'), **kwargs):
        self.secret_key = secret_key
        super().__init__(*args, **kwargs)

    def deconstruct(self):
        name, args, kwargs = super().deconstruct()
        # remove location and base_url as these are defined by environment variables
        # and may change at any time
        if 'location' in kwargs:
            kwargs.pop('location')
        if 'base_url' in kwargs:
            kwargs.pop('base_url')
        return name, args, kwargs

    def url(self, name):
        name = name.lstrip('/')
        name = urljoin('webassets/', name)
        digested_name = '{}:{}'.format(name, self.secret_key).encode('utf-8')
        md5_digest = hashlib.md5(digested_name).digest()
        key = base64.b64encode(md5_digest).decode('utf-8')
        # Make the key look like Nginx expects.
        key = key.replace('+', '-').replace('/', '_').rstrip('=')
        # prepend the key to the name
        path = urljoin('{}/'.format(key), name)
        return super().url(path)

    def thumbnail_urls(self, name, operation='crop', **kwargs):
        default_kwargs = {
            'width': 300,
            'height': 300,
            'type': 'auto'
        }

        default_kwargs.update(kwargs)

        kwargs = {k: v for k, v in default_kwargs.items() if v is not None}

        kwargs.update({
            'file': name
        })

        query = '{}?{}'.format(operation, urlencode(kwargs, safe='/'))
        # todo: any prefix necessary for nginx reverse proxy?
        return self.url(query)



default_storage = DefaultStorage()

configured_storages = {}

for key, storage_config in settings.STORAGES.items():

    if 'storage_class' in storage_config:
        print(storage_config['storage_class'])
        StorageClass = import_string(storage_config['storage_class'])
    else:
        StorageClass = FileSystemStorage

    configured_storages[key] = StorageClass(
        location=storage_config.get('location', default_storage.location),
        base_url=storage_config.get('base_url', default_storage.base_url)
    )

if 'default' not in configured_storages:
    configured_storages['default'] = default_storage


def getStorage(name='default'):
    return configured_storages[name]
