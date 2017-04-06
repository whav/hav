from wagtail.wagtailcore.models import Page
from wagtail.wagtailcore.fields import StreamField
from wagtail.wagtailcore import blocks
from wagtail.wagtailadmin.edit_handlers import FieldPanel, StreamFieldPanel
from wagtail.wagtailimages.blocks import ImageChooserBlock
from wagtail.wagtailembeds.blocks import EmbedBlock


class BaseMediaItemBlock(blocks.StructBlock):
    caption = blocks.RichTextBlock(required=False)


class ImageItemBlock(BaseMediaItemBlock):
    image = ImageChooserBlock(required=True)

    class Meta:
        template = 'cms/blocks/image_with_caption.html'


class MediaItemBlock(BaseMediaItemBlock):
    embed = EmbedBlock(required=True)

    class Meta:
        template = 'cms/blocks/oembed_with_caption.html'


class CarouselBlock(blocks.StreamBlock):

    image = ImageItemBlock()
    media = MediaItemBlock()

    class Meta:
        template = 'cms/blocks/carousel.html'


class HeadingBlock(blocks.CharBlock):
    class Meta:
        template = 'cms/blocks/heading.html'

class CmsPage(Page):
    body = StreamField([
        ('heading', blocks.CharBlock(
               classname="full title",
                template='cms/blocks/heading.html'
            )
         ),
        ('paragraph', blocks.TextBlock()),
        ('richtext', blocks.RichTextBlock()),
        ('raw', blocks.RawHTMLBlock()),
        ('image', ImageItemBlock()),
        ('other_media', MediaItemBlock()),
        ('carousel', CarouselBlock())
    ])

    content_panels = Page.content_panels + [
        StreamFieldPanel('body')
    ]
