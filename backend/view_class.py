# coding: utf-8

from django.urls import resolve
f=resolve('/api/v1/incoming/').func
f.initkwargs
vc = f.view_class(**initkwargs)
vc = f.view_class(**f.initkwargs)
