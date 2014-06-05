from django.conf import settings
from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.views.generic.base import TemplateView
from .blog.views import EntryFrontPage
from wiki.urls import get_pattern as get_wiki_pattern
from django_notify.urls import get_pattern as get_notify_pattern

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', EntryFrontPage.as_view(), name='www_url_index'),
    url(r'^about/$', TemplateView.as_view(template_name='about.html'), name='www_url_about'),
    url(r'^admin/', include('smuggler.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^blog/', include('www.blog.urls'), name='www_url_blog'),
    url(r'^eve/', include('www.eve.urls')),
    url(r'^p/', include('www.paste.urls')),
    url(r'^pages/', include('www.pages.urls')),
    url(r'^photos/', TemplateView.as_view(template_name='photos.html'), name='www_url_photos'),
    url(r'^notify/', get_notify_pattern()),
    url(r'^wiki/', get_wiki_pattern())
)

if settings.DEBUG:
    urlpatterns += patterns('',
        url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT,
        }),
   )

