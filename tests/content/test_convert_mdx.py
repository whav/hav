from hav.apps.theme.management.commands.convert_mdx import convert


def folders(media_id):
    return {"13027": 254}.get(media_id)


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
    assert convert(source, folders) == (
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
    assert convert(source, folders) == (
        "![](node:277)\n[![Gangtok](media:5)](node:84)\n\n"
        "![](geo:35.6037,82.4853?z=5)\n![](geo:1,2)\n",
        [],
    )


def test_windows_line_endings():
    text, _ = convert(
        'a\r\n<Gallery>\r\n<Media id="1" />\r\n</Gallery>\r\n\r\nb', folders
    )
    assert text == "a\n\n![](media:1)\n\nb\n"


def test_captions_are_escaped():
    text, _ = convert("<Media id='1' caption='a [b] *c*' />", folders)
    assert text == r"![a \[b\] \*c\*](media:1)" + "\n"


def test_warnings():
    text, warnings = convert('<Media id="2" link_to_parent_node />\n<Foo />', folders)
    assert text == "![](media:2)\n<Foo />\n"
    assert warnings == ["media 2 not found, link dropped", "not converted: <Foo />"]
