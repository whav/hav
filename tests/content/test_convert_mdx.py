import importlib

import pytest
from django.apps import apps

from hav.apps.theme.mdx import convert as _convert
from hav.apps.theme.mdx import is_changed


def folders(media_id):
    return {"13027": 254}.get(media_id)


def names(node_id):
    return {"84": "Gangtok"}.get(node_id)


def convert(source):
    return _convert(source, folders, names)


def test_gallery_from_existing_content():
    source = """import { Gallery } from './components/wrappers';
import Media from './components/media';

##### <i>Places where Nebesky-Wojkowitz has conducted research:</i>
<Gallery>
<Media id="11615"  caption="Kalimpong" link_to_node_with_id="190" />

<Media id="13027" caption="Darjeeling"  link_to_parent_node />
<Media id="8182" />
</Gallery>
More text.
"""
    assert convert(source) == (
        """##### <i>Places where Nebesky-Wojkowitz has conducted research:</i>

[![Kalimpong](media:11615)](node:190)
[![Darjeeling](media:13027)](node:254)
![](media:8182)

More text.
""",
        [],
    )


def test_folders_and_maps():
    source = (
        "import Node from './components/folder';\n\n"
        '<Node id="277" />\n<HAVFolder id="84" caption="Gangtok" media_id={5} />\n\n'
        "<HAVMap lat={35.6037} lng={82.4853} zoom={5} />\n<HAVMap lat={1} lng={2} />\n"
    )
    assert convert(source) == (
        "![](node:277)\n[![Gangtok](media:5)](node:84)\n\n"
        "![](geo:35.6037,82.4853?z=5)\n![](geo:1,2)\n",
        [],
    )


def test_folder_with_preview_media_keeps_folder_name():
    assert convert('<HAVFolder id="84" media_id={5} />')[0] == (
        "[![Gangtok](media:5)](node:84)\n"
    )


def test_windows_line_endings():
    text, _ = convert('a\r\n<Gallery>\r\n<Media id="1" />\r\n</Gallery>\r\n\r\nb')
    assert text == "a\n\n![](media:1)\n\nb\n"


def test_captions_are_escaped():
    text, _ = convert("<Media id='1' caption='a [b] *c*' />")
    assert text == r"![a \[b\] \*c\*](media:1)" + "\n"


# imports, exports and expressions


def test_prose_starting_with_import_or_export_is_kept():
    source = (
        "Salt and wool were the goods of the\nexport trade.\nimport of tea from Lhasa"
    )
    assert convert(source) == (source + "\n", [])


def test_multi_line_and_side_effect_imports_are_removed():
    source = (
        "import {\n  Gallery,\n  Wrapper,\n} from './components/wrappers';\n"
        "import './styles.css';\n\nText"
    )
    assert convert(source) == ("Text\n", [])


def test_exports_are_kept_and_reported():
    text, warnings = convert("export const meta = { title: 'x' }\n\nText")
    assert text.startswith("export const meta")
    assert "export statement not converted: export const meta = { title: 'x' }" in (
        warnings
    )


def test_jsx_comments_are_removed_other_expressions_reported():
    text, warnings = convert("a {/* a\ncomment */} b {count * 2}")
    assert text == "a  b {count * 2}\n"
    assert warnings == ["expression not converted: {count * 2}"]


# html


def test_unsupported_html_is_reported():
    source = '<div class="featured_media_set">\n\n<Media id="1" />\n\n</div>'
    text, warnings = convert(source)
    assert "![](media:1)" in text
    assert warnings == [
        'not supported: <div class="featured_media_set">',
        "not supported: </div>",
    ]


def test_allowed_html_is_not_reported():
    assert convert("<small>a <b>b</b><br />c <i>d</i></small>")[1] == []


def test_leftover_components_are_reported():
    text, warnings = _convert(
        '<Media id="2" link_to_parent_node />\n<Foo />', folders, names
    )
    assert text == "![](media:2)\n<Foo />\n"
    assert warnings == ["media 2 not found, link dropped", "not supported: <Foo />"]


def test_is_changed_ignores_line_endings_and_blank_lines():
    assert not is_changed("a\r\n\r\n\r\nb\r\n", "a\n\nb\n")
    assert is_changed("<Media id='1' />", "![](media:1)\n")


# data migration


@pytest.mark.django_db
def test_data_migration_converts_descriptions(collection, create_media):
    migration = importlib.import_module(
        "hav.apps.sets.migrations.0005_convert_mdx_descriptions"
    )
    media = create_media()
    node = collection.root_node
    node.description = (
        "import Media from './components/media';\n\n"
        f'<Gallery>\n<Media id="{media.pk}" caption="A" link_to_parent_node />\n</Gallery>'
    )
    node.save()
    markdown = "# Already Markdown\r\n\r\n\r\nText"
    other = node.add_child(name="other", description=markdown)

    migration.convert_descriptions(apps, None)

    node.refresh_from_db()
    other.refresh_from_db()
    assert node.description == f"[![A](media:{media.pk})](node:{media.set_id})\n"
    assert other.description == markdown  # untouched
