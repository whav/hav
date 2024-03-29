from urllib.parse import urlsplit, urlunsplit

from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.urls import reverse

from hav.apps.media.hashid import decode

from .models import Media

redirects = """
https://hav.univie.ac.at/media/xyoby5	https://hav.univie.ac.at/archive/file/hash/ee156e224fd0aa9f54ea9ef8e9f1a70ee43c426d
https://hav.univie.ac.at/media/drsj6n	https://hav.univie.ac.at/archive/file/hash/287e08842230e4041bd65e06dd908dfdec861880
https://hav.univie.ac.at/media/036c0p	https://hav.univie.ac.at/archive/file/hash/0c1779964c5e9d4de8c35a555eeb8186790948d2
https://hav.univie.ac.at/media/zyuz8o	https://hav.univie.ac.at/archive/file/hash/11bd38e4601d263a79ed8e39888d32cbbc3005d1
https://hav.univie.ac.at/media/r2prnj	https://hav.univie.ac.at/archive/file/hash/e4b1128b1e023c44e8c8bf5fe09515b285d4f512
https://hav.univie.ac.at/media/4vsys2	https://hav.univie.ac.at/archive/file/hash/78d1c5f2deb444b51029401b441ea2f2bf992e97
https://hav.univie.ac.at/media/0e2s32	https://hav.univie.ac.at/archive/file/hash/905f42483996dfce7c00f1d9bb218811f3a98815
https://hav.univie.ac.at/media/x046bi	https://hav.univie.ac.at/archive/file/hash/9ef3a4cef3d7319839d94f4f23d28fa59a65d93e
https://hav.univie.ac.at/media/j3wzj5	https://hav.univie.ac.at/archive/file/hash/b73c834d8d5b469f04c8c35b6632e24af016bfa2
https://hav.univie.ac.at/media/wcx2ha	https://hav.univie.ac.at/archive/file/hash/a84c1e8437e18bcf33a2c650eadadb1eb5d40f16
https://hav.univie.ac.at/media/nh4qd0	https://hav.univie.ac.at/archive/file/hash/e165edbf6cebc2480e33950366b6d03b782697dc
https://hav.univie.ac.at/media/ki9bou	https://hav.univie.ac.at/archive/file/hash/2bb9921b37f12150d53a431605c09a901b8308d9
https://hav.univie.ac.at/media/0ur2d7	https://hav.univie.ac.at/archive/file/hash/2c02cbbb55a2e2e73dadd55d32334a04953dd122
https://hav.univie.ac.at/media/g7dc0e	https://hav.univie.ac.at/archive/file/hash/a241aa201050a9035be54554c574a15aed41e00e
https://hav.univie.ac.at/media/8tnxqh	https://hav.univie.ac.at/archive/file/hash/e97b7dd6d3440f11fa103099079ddb8137171a03
https://hav.univie.ac.at/media/cbk5cc	https://hav.univie.ac.at/archive/file/hash/286b709d67d0668854338ab2819eb4ed121cb363
https://hav.univie.ac.at/media/yy9hf0	https://hav.univie.ac.at/archive/file/hash/b9ff2dff0b54e64257f5908496df734f5accf1ea
https://hav.univie.ac.at/media/qxszp8	https://hav.univie.ac.at/archive/file/hash/5c082ac00aaa6f8308ac4ff980ebce2dffc1b84f
https://hav.univie.ac.at/media/95dz2v	https://hav.univie.ac.at/archive/file/hash/f89f5ba092329298688b372065f73013afbcdd2e
https://hav.univie.ac.at/media/hw8gvf	https://hav.univie.ac.at/archive/file/hash/975caaf1d25dcaeef2e6b3361b56689516fe192b
https://hav.univie.ac.at/media/sqts22	https://hav.univie.ac.at/archive/file/hash/83f1cdb36cf1c854decf7468372e8fe076f1e1db
https://hav.univie.ac.at/media/4u8cbt	https://hav.univie.ac.at/archive/file/hash/fbfbe43b8ee10949eecbbf578d706a0c3b27c20a
https://hav.univie.ac.at/media/v2uiqf	https://hav.univie.ac.at/archive/file/hash/843157b77dcbb4afbfe6d3c4627e61f51d6055a4
https://hav.univie.ac.at/media/uqkaoy	https://hav.univie.ac.at/archive/file/hash/0dfe1eb8dcb5f8131b0db0576830047c26eb6b69
https://hav.univie.ac.at/media/8uugsj	https://hav.univie.ac.at/archive/file/hash/c4c0b7f5ef797fc59b8c8eae58f670be495c1231
https://hav.univie.ac.at/media/309qqc	https://hav.univie.ac.at/archive/file/hash/d4b63925d37e201b8cbf1dc577de01531e1aaeab
https://hav.univie.ac.at/media/ro3dv9	https://hav.univie.ac.at/archive/file/hash/99e1798d00deef53cc1c60faa3bd15cc37d86d01
https://hav.univie.ac.at/media/negdji	https://hav.univie.ac.at/archive/file/hash/faa7386487fc9971a27e985abade51189c0204b2
https://hav.univie.ac.at/media/322rqx	https://hav.univie.ac.at/archive/file/hash/fc19713b9cf885b8662291098f7d7cf84de0b1f9
https://hav.univie.ac.at/media/h2pmxu	https://hav.univie.ac.at/archive/file/hash/97cff10b8667004055957864e6e98ca6fffc28b6
https://hav.univie.ac.at/media/0sa68i	https://hav.univie.ac.at/archive/file/hash/418dbd94ff76cbf7eb543f69efa145f8780a44be
https://hav.univie.ac.at/media/w6otca	https://hav.univie.ac.at/archive/file/hash/cf714606354e612af34796193308a9741e2361f0
https://hav.univie.ac.at/media/nnbay4	https://hav.univie.ac.at/archive/file/hash/99c39adcd642f7693a6eb18876a09ec06afab330
https://hav.univie.ac.at/media/raxj36	https://hav.univie.ac.at/archive/file/hash/04846b5ec3ec0d590b93a0d6aa43fb2de0b0fbed
https://hav.univie.ac.at/media/mnojmd	https://hav.univie.ac.at/archive/file/hash/35ddaa4bd2d6a443156cf77c60d9e77de5ecacd0
https://hav.univie.ac.at/media/dw4s8y	https://hav.univie.ac.at/archive/file/hash/8f77ed91aa69802507c5600ea7b78cb09a3c128e
https://hav.univie.ac.at/media/jng9u3	https://hav.univie.ac.at/archive/file/hash/d2524cd596b4296c2d36692ae8b09eed92aeab63
https://hav.univie.ac.at/media/42pis8	https://hav.univie.ac.at/archive/file/hash/7cf19ea7d40114a151fe25ec2e565d2197b55669
https://hav.univie.ac.at/media/hbbv7g	https://hav.univie.ac.at/archive/file/hash/deaec0fdbe625b0f4185a629c4abf8a47fd7010a
https://hav.univie.ac.at/media/fd9bib	https://hav.univie.ac.at/archive/file/hash/88dc52a5d1243885ce1644e71820de1d276476a6
https://hav.univie.ac.at/media/ido0is	https://hav.univie.ac.at/archive/file/hash/7c8723cd3830e29ae7eac858e3bc72fdb86a2362
"""

redirects = redirects.strip().split("\n")
redirects = [x.split() for x in redirects]

relative_redirects = {}

for short_url, long_url in redirects:
    media_id = short_url.split("/")[-1]
    parts = urlsplit(long_url)
    relative_redirects[media_id] = urlunsplit(
        (
            "https",
            "hav.univie.ac.at",
            parts.path,
            parts.query,
            parts.fragment,
        )
    )


def redirect_to_archive(request, media_id):
    url = relative_redirects.get(media_id)
    if url:
        return HttpResponseRedirect(url)

    # For the record: I am not proud of this piece of code
    try:
        # try by id first
        media_id = int(media_id)
        media = Media.objects.get(pk=media_id)
    except (ValueError, Media.DoesNotExist):
        try:
            # next by shortcode
            media = Media.objects.get(short_code=media_id)
        except Media.DoesNotExist:
            # and finally try to decode a hashid
            try:
                media_id, *_ = decode(media_id)
            except ValueError:
                media_id = None

            media = get_object_or_404(Media, pk=media_id)

    archive_media_url = reverse("archive:media", kwargs={"pk": media.id})
    return HttpResponseRedirect(archive_media_url)
