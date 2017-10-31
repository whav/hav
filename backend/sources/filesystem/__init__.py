from django.core.exceptions import ImproperlyConfigured
import os


class FSSource(object):

    def __init__(self, root):
        if not os.path.exists(root):
            raise ImproperlyConfigured("Unable to locate directory at %s"  % str(root))
        self.root = root





