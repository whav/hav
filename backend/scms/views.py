import os
import json
from django.shortcuts import render

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