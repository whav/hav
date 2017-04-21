from django.conf import settings
from django.core.files.storage import FileSystemStorage, DefaultStorage

default_storage = DefaultStorage()
configured_storages = {}

for key, storage_config in settings.STORAGES.items():
    configured_storages[key] = FileSystemStorage(location=storage_config.get('path', default_storage.location))

if 'default' not in configured_storages:
    configured_storages['default'] = default_storage


def getStorage(name='default'):
    return configured_storages[name]
