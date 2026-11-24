"""One-off conversion of MDX node descriptions to the Markdown syntax."""

import difflib
import re

from django.core.management.base import BaseCommand

from hav.apps.media.models import Media
from hav.apps.sets.models import Node

IMPORT_RE = re.compile(r"^(?:import|export)\b.*\n?", re.M)
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


def convert(source, media_folder):
    """Return (markdown, warnings). media_folder(media_id) -> folder id or None."""
    warnings = []

    def tag(m):
        name, attrs = m.group(1), _attrs(m.group(2))
        caption = _escape(str(attrs.get("caption", "")))
        if name == "HAVMap":
            zoom = f"?z={attrs['zoom']}" if "zoom" in attrs else ""
            return f"![](geo:{attrs.get('lat')},{attrs.get('lng')}{zoom})"
        if name in ("Node", "HAVFolder"):
            if "media_id" in attrs:
                return f"[![{caption}](media:{attrs['media_id']})](node:{attrs['id']})"
            return f"![{caption}](node:{attrs.get('id')})"

        image = f"![{caption}](media:{attrs.get('id')})"
        folder = attrs.get("link_to_node_with_id")
        if folder is None and attrs.get("link_to_parent_node"):
            folder = media_folder(attrs.get("id"))
            if folder is None:
                warnings.append(f"media {attrs.get('id')} not found, link dropped")
        return f"[{image}](node:{folder})" if folder else image

    text = IMPORT_RE.sub("", source.replace("\r\n", "\n"))
    # a gallery is a paragraph of tiles: drop the tags and the blank lines
    text = GALLERY_RE.sub(
        lambda m: "\n\n" + re.sub(r"\n\s*\n", "\n", m.group(1).strip()) + "\n\n", text
    )
    text = TAG_RE.sub(tag, text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip() + "\n"

    for left in re.findall(r"</?[A-Z]\w*[^>]*>", text):
        warnings.append(f"not converted: {left}")
    return text, warnings


def _media_folder(media_id):
    return Media.objects.filter(pk=media_id).values_list("set_id", flat=True).first()


class Command(BaseCommand):
    help = "Convert MDX node descriptions to Markdown (dry run unless --apply)."

    def add_arguments(self, parser):
        parser.add_argument("--apply", action="store_true", help="save the changes")

    def handle(self, *args, apply=False, **options):
        changed = 0
        for node in Node.objects.exclude(description="").order_by("pk"):
            converted, warnings = convert(node.description, _media_folder)
            if converted.strip() == node.description.strip() and not warnings:
                continue
            changed += 1
            self.stdout.write(
                self.style.MIGRATE_HEADING(f"node {node.pk}: {node.name}")
            )
            diff = difflib.unified_diff(
                node.description.splitlines(), converted.splitlines(), lineterm="", n=1
            )
            self.stdout.write("\n".join(list(diff)[2:]))
            for warning in warnings:
                self.stdout.write(self.style.WARNING(f"  {warning}"))
            if apply:
                node.description = converted
                node.save(update_fields=["description"])

        action = "Converted" if apply else "Would convert (use --apply)"
        self.stdout.write(f"{action}: {changed} descriptions.")
