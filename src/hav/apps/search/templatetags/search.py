from django import template
from collections import namedtuple
from copy import deepcopy
from functools import lru_cache
from urllib.parse import urlencode, unquote, urlparse, urlunparse, parse_qs

register = template.Library()

facet_names = {
    "creators": "created by",
    "creation_years": "created in",
}

facet_item_status = ["available", "applied"]


def filters_dict_from_string(filters_string: str):
    """
    Take filters_string of form 'filter_name1="filter_value1" AND filter_name1=
    "filter_value2" AND filter_name2=...' and return a dict of form {filer_name1:
    [filter_value1, filter_value2, ...], filter_name2: ...}.
    """
    fd = {}
    for f in filters_string.split(" AND "):
        _ = f.split("=")
        fd.setdefault(_[0], []).append(_[1].strip('"'))
    return fd


def filters_string_from_dict(filters_dict: dict):
    """
    Take filters_dict in the form {filer_name1: [filter_value1, filter_value2, ...],
    filter_name2: ...} and return a filters_string of form 'filter_name1=
    "filter_value1" AND filter_name1="filter_value2" AND filter_name2=...'.
    """
    return " AND ".join(
        [
            name + '="' + value + '"'
            for name, values in filters_dict.items()
            for value in values
        ]
    )


def filters_dict_add_filter(filters_dict, filter_name, filter_value):
    fd_out = deepcopy(filters_dict)
    fd_out.setdefault(filter_name, []).append(filter_value)
    return fd_out


def filters_dict_remove_filter(filters_dict, filter_name, filter_value):
    fd_out = deepcopy(filters_dict)
    if filter_value in fd_out[filter_name]:
        if len(fd_out[filter_name]) <= 1:
            del fd_out[filter_name]
        else:
            fd_out[filter_name].remove(filter_value)
    return fd_out


def make_url(filters_dict, url_as_list, get_args):
    get_args["filters"] = filters_string_from_dict(filters_dict)
    url_as_list[4] = urlencode(get_args, doseq=True)
    return urlunparse(url_as_list)


@register.simple_tag
def prepare_search_filters(url: str, facets_distribution: dict):
    parsed_url = urlparse(unquote(url))
    get_args = parse_qs(parsed_url.query)
    filters_string = get_args.get("filters")

    FacetItem = namedtuple("FacetItem", ["name", "value", "count"])

    facets_distribution_list = [
        FacetItem(name, value, count)
        for name, items in facets_distribution.items()
        for value, count in items.items()
    ]

    parsed_url_as_list = list(parsed_url)
    facets_distribution_with_state_and_url = {}

    if not filters_string:
        get_args["filters"] = []
        state = facet_item_status[0]  # available
        for facet_item in facets_distribution_list:
            fdict = {facet_item.name: [facet_item.value]}
            modify_filter_url = make_url(fdict, parsed_url_as_list, get_args)
            facets_distribution_with_state_and_url.setdefault(
                facet_names.get(facet_item.name) or facet_item.name, []
            ).append(
                {
                    "value": facet_item.value,
                    "hits": facet_item.count,
                    "state": state,
                    "url": modify_filter_url,
                }
            )

    else:
        # get_args.get("filters") returns a list of strings. In the case &filters=
        # should have been supplied more than once in the url, the last occurance counts
        applied_filters_dict = filters_dict_from_string(filters_string[-1])

        for facet_item in facets_distribution_list:
            applied_values = applied_filters_dict.get(facet_item.name)

            if applied_values and str(facet_item.value) in applied_values:
                fdict = filters_dict_remove_filter(
                    applied_filters_dict, facet_item.name, facet_item.value
                )
                state = facet_item_status[1]  # applied
            else:
                fdict = filters_dict_add_filter(
                    applied_filters_dict, facet_item.name, facet_item.value
                )
                state = facet_item_status[0]  # available

            modify_filter_url = make_url(fdict, parsed_url_as_list, get_args)
            facets_distribution_with_state_and_url.setdefault(
                facet_names.get(facet_item.name) or facet_item.name, []
            ).append(
                {
                    "value": facet_item.value,
                    "hits": facet_item.count,
                    "state": state,
                    "url": modify_filter_url,
                }
            )
    return {
        k: facets_distribution_with_state_and_url[k]
        for k in sorted(facets_distribution_with_state_and_url)
    }
