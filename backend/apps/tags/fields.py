from django import forms
from .models import Tag, CollectionTag, ManagedTag
from .sources import TAGGING_SOURCES

source_names = set(TAGGING_SOURCES.keys())


def resolve_types(types=[]):
    if not types:
        return Tag.objects.select_subclasses()
    types = set(types)
    if not types.issubset(source_names):
        difference = types.difference(source_names)
        raise ValueError(f'The following tag sources are unknown: {", ".join(list(difference))}')

    sources = [TAGGING_SOURCES[t] for t in types]
    # print(sources)
    # import ipdb; ipdb.set_trace()
    return Tag.objects.\
        filter(managedtag__source__in=sources).\
        order_by('pk').select_subclasses(ManagedTag)


class SingleTagSelectField(forms.ModelChoiceField):

    def __init__(self,  types, **kwargs):
        qs = resolve_types(types)
        super().__init__(qs, **kwargs)


class MultipleTagSelectField(forms.ModelMultipleChoiceField):

    def __init__(self, *args, types=[], **kwargs):
        if types:
            kwargs.update({'limit_choices_to': resolve_types(types)})
        super().__init__(*args, **kwargs)
