import pathlib
from django.core.exceptions import ImproperlyConfigured, ValidationError

_sources = set()


def register(root):

    path = pathlib.Path(root).resolve()

    if not path.is_absolute():
        raise ImproperlyConfigured('You need to register absolute paths.')

    if not path.is_dir():
        raise ImproperlyConfigured('The registered path needs to point to a directory.')

    if path in _sources:
        raise ImproperlyConfigured('This path has already been registered')

    _sources.add(path)


def validate_file_path(path):
    path = pathlib.Path(path).resolve()
    for sp in _sources:
        try:
            path.relative_to(sp)
        except ValueError:
            pass
    else:
        raise ValidationError('The path ${0} is not within a registered source.'.format(path.to_posix()))




