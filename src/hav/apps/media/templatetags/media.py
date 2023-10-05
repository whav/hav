from logging import getLogger

from django import template
from django.template.defaultfilters import date as django_date_filter
from django.utils.safestring import mark_safe
from psycopg2.extras import DateTimeTZRange

from hav.utils.daterange import Resolutions, ReverseDateTimeRange

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


@register.simple_tag()
def maplink(lat: float, lon: float):
    # uri_base = "geo:"
    geo_uri = "https://www.openstreetmap.org/?mlat={lat}&mlon={lon}#map10/{lat}/{lon}&layers=H"
    return mark_safe(
        f"<a href='{geo_uri.format(lat=lat, lon=lon)}' target='_blank'>{round(lat,4)},\
        {round(lon,4)}</a>"
    )
