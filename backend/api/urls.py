from django.urls import include, path, re_path
from django.views.generic import RedirectView
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView

api_urls = [
    re_path(r'^v1/', include('api.v1.urls', namespace='v1')),
    re_path(r'^__api_auth__/', include('rest_framework.urls', namespace='rest_framework')),
    re_path(r'graphql', csrf_exempt(GraphQLView.as_view(graphiql=True))),
    re_path(r'^$', RedirectView.as_view(pattern_name='api:v1:api_root', permanent=False)),
    path(r'', include('api.public.urls', namespace='public')),
]
