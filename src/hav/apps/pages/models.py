from django.db import models


class Page(models.Model):
    """A static page (landing page, imprint, ...), served at /<slug>/."""

    slug = models.SlugField(unique=True, help_text='"index" is the landing page.')
    title = models.CharField(max_length=200)
    content = models.TextField(help_text="Markdown, see hav.apps.theme.content.")

    class Meta:
        ordering = ["slug"]

    def __str__(self):
        return self.title
