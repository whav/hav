from django.conf.urls import url, include
from .views import CollectionListView

app_name = "api"

urlpatterns = [
    # url('^$', start, name='api_root'),
    url(r"^collections/", CollectionListView.as_view()),
    # url(r'^sources/', include(source_patterns)),
    # url(r'^hav/', include(
    #     (hav_urls('hav'), app_name),
    #     namespace='hav_browser')
    # )
]
