from django.db import models
from django.contrib.postgres.fields import ArrayField
from pycountry import languages


class LanguageField(models.CharField):
    field_defaults = {
        'max_length': 3,
        'db_index': True,
        'choices': [(l.alpha_3, l.name) for l in languages]
    }

    def __init__(self, *args, **kwargs):
        for k, v in self.field_defaults.items():
            kwargs.setdefault(k, v)
        return super().__init__(*args, **kwargs)


class MultipleLanguageField(ArrayField):
    def __init__(self, *args, **kwargs):
        args = [LanguageField, *args[1:]]
        return super().__init__(*args, **kwargs)
