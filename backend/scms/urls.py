from django.conf.urls import url
from .views import debugView, CollectionView

urlpatterns = [
    url(r'(?P<collection_name>\w+)/$', CollectionView.as_view(), name='collection_detail'),
    url(r'^(?P<path>.*/)?', debugView)
]
