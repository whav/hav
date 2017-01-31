class MigrateOnlyHAVDBRouter(object):
    def allow_migrate(self, db, app_label, model=None, **hints):
        if db != 'default':
            return False
        return None