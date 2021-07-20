from django.views.generic import TemplateView


class LandingPage(TemplateView):
    template_name = "home.html"
