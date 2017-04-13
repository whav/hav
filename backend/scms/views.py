import os
import json
from django.shortcuts import render
from django.views.generic import TemplateView

CONTENT_PATH = os.path.join(
    os.path.dirname(__file__),
    'content'
)

def debugView(request, **kwargs):

    return render(
        request,
        'scms/debug.html',
        context={
            'urlKwargs': json.dumps(kwargs, indent=4),
            'content': populate_menu()
        }
    )


def populate_menu(root=CONTENT_PATH):
    content = []
    for dir, dirs, files in os.walk(root):
        content.append((os.path.relpath(dir, start=root), dirs, files))
    return content


class CollectionView(TemplateView):

    def get_template_names(self):
        return [
            'scms/collections/%s.html' % self.kwargs.get('collection_name'),
            'scms/collections/default.html'
        ]

    def get_context_data(self, **kwargs):
        return {
            'collection': self.kwargs.get('collection_name')
        }


class LandingPage(TemplateView):
    template_name = 'scms/start.html'