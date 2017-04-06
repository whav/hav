from whav.models import ImageCollection


class WhavDBRouter(object):

    def allow_migrate(self, db, app, **kwargs):
        # print('migrate?', db, app)
        if app == 'whav' or db == 'whav':
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

