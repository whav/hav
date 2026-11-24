from django.shortcuts import get_object_or_404
from django.views.generic import TemplateView

from hav.apps.pages.models import Page


class FlatpageView(TemplateView):

    template_name = "flatpages/base.html"
    slug = None

    def get_context_data(self, **kwargs):
        slug = kwargs.pop("slug", self.slug)
        page = get_object_or_404(Page, slug=slug)

        ctx = super().get_context_data(**kwargs)
        ctx.update({"page": page, "content": page.content})
        return ctx
