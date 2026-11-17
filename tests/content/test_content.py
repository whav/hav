import pytest
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ValidationError
from django.test import RequestFactory
from django.urls import reverse

from hav.apps.theme.content import render_content, validate_content


@pytest.fixture
def request_():
    request = RequestFactory().get("/")
    request.user = AnonymousUser()
    return request


def folder_url(node):
    kwargs = {"collection_slug": node.get_collection().slug, "node_pk": node.pk}
    return reverse("hav:folder_view", kwargs=kwargs)


def media_url(media):
    kwargs = {"collection_slug": media.collection.slug, "media_pk": media.pk}
    return reverse("hav:media_view", kwargs=kwargs)


# markdown and html


def test_markdown():
    assert render_content("# Title\n\nSome *text*.") == (
        "<h1>Title</h1>\n<p>Some <em>text</em>.</p>\n"
    )


def test_front_matter_is_dropped():
    assert "title" not in render_content('---\ntitle: "x"\n---\n\nText')


def test_formatting_tags_are_kept():
    html = render_content("##### <i>Places</i>\n\n<small>a <b>b</b><br>c</small>")
    assert "<h5><i>Places</i></h5>" in html
    assert "<small>a <b>b</b><br>c</small>" in html


def test_lines_starting_with_tags_are_markdown():
    assert render_content("<br>\n*text*") == "<p><br>\n<em>text</em></p>\n"
    assert render_content("<br />\n##### <i>Head</i>") == (
        "<p><br /></p>\n<h5><i>Head</i></h5>\n"
    )


@pytest.mark.parametrize(
    "source",
    [
        "<script>alert(1)</script>",
        '<img src="x" onerror="alert(1)">',
        '<b onclick="alert(1)">x</b>',
        "[x](javascript:alert(1))",
        '<div style="x">\n\n<iframe src="https://example.org"></iframe>\n\n</div>',
    ],
)
def test_other_html_is_escaped(source):
    html = render_content(source)
    for bad in ("<script", "<img", "<b ", 'href="javascript', "<div", "<iframe"):
        assert bad not in html


def test_comments_are_dropped():
    assert render_content("a <!-- note --> b") == "<p>a  b</p>\n"


# embedded objects


def test_map():
    html = render_content("![](geo:35.6037,82.4853?z=5)")
    assert 'data-lat="35.603700"' in html
    assert 'data-lng="82.485300"' in html
    assert 'data-zoom="5"' in html
    assert "<p>" not in html


def test_map_default_zoom():
    assert 'data-zoom="5"' in render_content("![](geo:1,2)")


def test_ordinary_images_are_untouched():
    html = render_content("![](https://example.org/a.png)")
    assert html == '<p><img src="https://example.org/a.png" alt="" /></p>\n'


def test_paragraph_of_objects_is_a_gallery():
    maps = "\n".join(f"![](geo:{i},0)" for i in range(12))
    html = render_content(f"Intro\n\n{maps}\n\nOutro")
    assert html.startswith('<p>Intro</p>\n<div class="gallery">')
    assert html.endswith("</div>\n<p>Outro</p>\n")
    lats = [part.split('"')[0] for part in html.split('data-lat="')[1:]]
    assert lats == [f"{i}.000000" for i in range(12)]


def test_mixed_paragraph_is_no_gallery():
    html = render_content("Text ![](geo:1,2)")
    assert html.startswith("<p>Text ")
    assert "gallery" not in html


@pytest.mark.django_db
def test_media_tile(request_, create_media):
    media = create_media()
    html = render_content(f"![Kalimpong](media:{media.pk})", request_)
    assert "Kalimpong" in html
    assert f'href="{media_url(media)}"' in html
    assert html.startswith('<div class="gallery">')


@pytest.mark.django_db
def test_linked_media_tile(request_, create_media):
    media = create_media()
    html = render_content(f"[![x](media:{media.pk})](node:{media.set.pk})", request_)
    assert f'href="{folder_url(media.set)}"' in html
    assert f'href="{media_url(media)}"' not in html
    assert html.count("<a ") == 1  # no nested links


@pytest.mark.django_db
def test_folder_tile(request_, collection):
    node = collection.root_node
    html = render_content(f"![](node:{node.pk})", request_)
    assert f'href="{folder_url(node)}"' in html
    assert node.name in html


@pytest.mark.django_db
def test_links_to_objects(request_, collection):
    node = collection.root_node
    html = render_content(f"[see here](node:{node.pk})", request_)
    assert html == f'<p><a href="{folder_url(node)}">see here</a></p>\n'


@pytest.mark.django_db
def test_missing_objects_render_nothing(request_):
    html = render_content("A ![x](media:999999) [y](node:999999) B", request_)
    assert "content-tile" not in html
    assert '<a href="#">y</a>' in html


# validation


@pytest.mark.django_db
def test_valid_content(collection):
    node = collection.root_node
    validate_content(
        f"# <i>Hi</i>\n\n![](node:{node.pk})\n[x](node:{node.pk})\n\n"
        "![](geo:1.5,2?z=3) ![](https://example.org/a.png)\n\n```\n<Media />\n```\n"
    )


@pytest.mark.django_db
@pytest.mark.parametrize(
    "source, message",
    [
        ("![](media:999999)", "media:999999 does not exist"),
        ("[x](node:999999)", "node:999999 does not exist"),
        ("![](media:abc)", "media:abc is not a valid address"),
        ("![](geo:north)", "geo:north is not a valid address, use geo:LAT,LNG?z=ZOOM"),
        ('<Media id="1" />', 'HTML <Media id="1" /> is not supported'),
    ],
)
def test_invalid_content(source, message):
    with pytest.raises(ValidationError) as e:
        validate_content(source)
    assert e.value.messages == [message]
