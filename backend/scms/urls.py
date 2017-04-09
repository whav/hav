from django.conf.urls import url, include
from django.shortcuts import render

import json

def debugView(request, **kwargs):
    return render(
        request,
        'cms/debug.html',
        context={
            'urlKwargs': json.dumps(kwargs)
        }
    )

urlpatterns = [
    url(r'^(?P<path>.*/)?', debugView)
]
