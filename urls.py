from django.conf import settings
from django.conf.urls.defaults import patterns, include, url
from django.contrib import admin
from django.views.generic.base import TemplateView
from .blog.views import EntryArchiveIndex

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', EntryArchiveIndex.as_view()),
    url(r'^about/$', TemplateView.as_view(template_name='about.html')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^blog/', include('www.blog.urls')),
    url(r'^p/', include('www.paste.urls')),
    url(r'^pages/', include('www.pages.urls')),
    url(r'^photos/', TemplateView.as_view(template_name='photos.html')),
)

if settings.DEBUG:
    urlpatterns += patterns('',
        url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT,
        }),
   )

