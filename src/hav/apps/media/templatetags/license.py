from django import template
from django.db.models import Q

from hav.apps.media.models import License

register = template.Library()

licenses_non_open = License.objects.filter(
    Q(short_name="c/p")
    | Q(short_name__startswith="ccbynd")
    | Q(short_name__startswith="ccbyncnd")
)

note_text = """This media could not be provided under a license conforming to open research data standards. The HAV does not serve as mediator between the copyright holder and interested third-parties.
Please contact the media creator or copyright-holder if you need to obtain additional rights."""


@register.inclusion_tag("ui/components/license.html")
def full_license_info(license: License):
    assert isinstance(license, License)

    license_note = note_text if license in licenses_non_open else None

    return {"license": license, "license_note": license_note}
