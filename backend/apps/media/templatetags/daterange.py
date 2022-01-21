from django import template
from psycopg2.extras import DateTimeTZRange
from hav_utils.daterange import ReverseDateTimeRange, Resolutions
from django.template.defaultfilters import date as django_date_filter

from logging import getLogger

register = template.Library()

logger = getLogger(__name__)


@register.filter
def daterange(dt_range: DateTimeTZRange):
    rdt = ReverseDateTimeRange(dt_range.lower, dt_range.upper)
    resolution = rdt.get_resolution()

    logger.debug(f"{dt_range.lower} {dt_range.upper}")
    if resolution == Resolutions.YEAR:
        return dt_range.upper.strftime("%Y")
    elif resolution == Resolutions.MONTH:
        return dt_range.upper.strftime("%b %Y")
    elif resolution == Resolutions.DAY:
        return django_date_filter(dt_range.upper, "DATE_FORMAT")

    return (
        f"{django_date_filter(dt_range.lower)} - {django_date_filter(dt_range.upper)}"
    )
