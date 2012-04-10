from django.conf import settings
from django.conf.urls.defaults import patterns, include, url
from django.contrib import admin
from django.views.generic.simple import direct_to_template

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', direct_to_template, {'template': 'homepage.html'}, name="homepage"),
    url(r'^about/$', direct_to_template, {'template': 'about.html'}, name="about"),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^blog/', include('www.blog.urls')),
    url(r'^demo/$', direct_to_template, {'template': 'demo.html'}, name="demo"),
    url(r'^p/', include('www.paste.urls')),
    url(r'^photos/', direct_to_template, {'template': 'photos.html'}, name="photos"),
)

if settings.DEBUG:
    urlpatterns += patterns('',
        url(r'^media/(?P<path>.*)$', 'django.views.static.serve', {
            'document_root': settings.MEDIA_ROOT,
        }),
   )

