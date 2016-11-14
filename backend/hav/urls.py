from django.conf.urls import url, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'content/', include('cms.urls')),
    url(
        r'^$',
        TemplateView.as_view(template_name='index.html')
    )
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
