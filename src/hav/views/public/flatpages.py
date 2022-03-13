from pathlib import Path

from django.http.response import Http404
from django.template.loader import TemplateDoesNotExist, select_template
from django.views.generic import TemplateView


class FlatpageView(TemplateView):

    template_name = "flatpages/base.html"
    slug = None

    def get_context_data(self, **kwargs):
        slug = kwargs.pop("slug", self.slug)
        suffixes = "mdx", "md"
        try:
            template = select_template([f"flatpages/{slug}.{s}" for s in suffixes])
        except TemplateDoesNotExist:
            raise Http404("Template not found")

        template_path = Path(template.origin.name).resolve()
        content = open(template_path).read()

        ctx = super().get_context_data(**kwargs)
        ctx.update({"content": content})
        return ctx
