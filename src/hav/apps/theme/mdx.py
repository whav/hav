"""Conversion of MDX content (node descriptions) to the Markdown syntax.

Used by the `convert_mdx` command (preview) and the sets data migration.
"""

import re

# import statements, also spanning lines (without crossing a blank line)
IMPORT_RE = re.compile(
    r"^import\s(?:(?!\n\s*\n)[^;])*?\bfrom\s*(['\"])[^'\"\n]+\1[ \t]*;?[ \t]*\n?"
    r"|^import\s*(['\"])[^'\"\n]+\2[ \t]*;?[ \t]*\n?",
    re.M,
)
EXPORT_RE = re.compile(r"^export\s+(?:const|let|var|function|default)\b.*", re.M)
JSX_COMMENT_RE = re.compile(r"\{\s*/\*.*?\*/\s*\}", re.S)
EXPRESSION_RE = re.compile(r"\{[^{}\n]*\}")
HTML_TAG_RE = re.compile(r"</?[A-Za-z][^>]*>")
GALLERY_RE = re.compile(r"<Gallery>(.*?)</Gallery>", re.S)
ATTR = r"""\w+(?:\s*=\s*(?:"[^"]*"|'[^']*'|\{[^}]*\}))?"""
TAG_RE = re.compile(rf"<(Media|HAVMedia|Node|HAVFolder|HAVMap)((?:\s+{ATTR})*)\s*/?>")
ATTR_RE = re.compile(r"""(\w+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}))?""")


def _attrs(raw):
    attrs = {}
    for m in ATTR_RE.finditer(raw):
        name, dq, sq, expr = m.groups()
        if expr is not None:
            attrs[name] = expr.strip().strip("\"'")
        else:
            attrs[name] = dq if dq is not None else sq if sq is not None else True
    return attrs


def _escape(caption):
    return re.sub(r"([\\\[\]*_`])", r"\\\1", caption)


def convert(source, media_folder, node_name):
    """Return (markdown, warnings).

    media_folder(media_id) -> folder id or None
    node_name(node_id) -> folder name or None
    """
    from hav.apps.theme.content import ALLOWED_HTML_RE

    warnings = []

    def tag(m):
        name, attrs = m.group(1), _attrs(m.group(2))
        caption = _escape(str(attrs.get("caption", "")))
        if name == "HAVMap":
            zoom = f"?z={attrs['zoom']}" if "zoom" in attrs else ""
            return f"![](geo:{attrs.get('lat')},{attrs.get('lng')}{zoom})"
        if name in ("Node", "HAVFolder"):
            if "media_id" in attrs:
                # a media tile linking to the folder: keep the folder name as caption
                caption = caption or _escape(node_name(attrs.get("id")) or "")
                return f"[![{caption}](media:{attrs['media_id']})](node:{attrs['id']})"
            return f"![{caption}](node:{attrs.get('id')})"

        image = f"![{caption}](media:{attrs.get('id')})"
        folder = attrs.get("link_to_node_with_id")
        if folder is None and attrs.get("link_to_parent_node"):
            folder = media_folder(attrs.get("id"))
            if folder is None:
                warnings.append(f"media {attrs.get('id')} not found, link dropped")
        return f"[{image}](node:{folder})" if folder else image

    text = source.replace("\r\n", "\n")
    text = IMPORT_RE.sub("", text)
    text = JSX_COMMENT_RE.sub("", text)
    # a gallery is a paragraph of tiles: drop the tags and the blank lines
    text = GALLERY_RE.sub(
        lambda m: "\n\n" + re.sub(r"\n\s*\n", "\n", m.group(1).strip()) + "\n\n", text
    )
    text = TAG_RE.sub(tag, text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip() + "\n"

    for line in EXPORT_RE.findall(text):
        warnings.append(f"export statement not converted: {line}")
    for expression in EXPRESSION_RE.findall(text):
        warnings.append(f"expression not converted: {expression}")
    for html in HTML_TAG_RE.findall(text):
        if not ALLOWED_HTML_RE.fullmatch(html):
            warnings.append(f"not supported: {html}")
    return text, warnings


def is_changed(old, new):
    """Whether a conversion changed more than line endings and blank lines."""

    def normalize(text):
        return re.sub(r"\n{3,}", "\n\n", text.replace("\r\n", "\n")).strip()

    return normalize(old) != normalize(new)
