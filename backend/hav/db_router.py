from whav.models import ImageCollection


class WhavDBRouter(object):

    whavModels = [
        ImageCollection
    ]

    def allow_migrate(self, db, *args, **kwargs):
        if db == 'whav':
            return False
        return None

    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'whav':
            return 'whav'
        return None

    def db_for_read(self, model, **hints):
        if model._meta.app_label == 'whav':
            return 'whav'
        return None

