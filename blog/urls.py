from __future__ import absolute_import
from django.conf.urls.defaults import *

urlpatterns = patterns('blog.views',
   url(r'^/?$', 'archive_index', name="blog-index"),
   (r'^(?P<year>\d{4})/$', 'archive_year'),
   (r'^(?P<year>\d{4})/(?P<month>\d{2})/$', 'archive_month'),
   (r'^(?P<year>\d{4})/(?P<month>\d{2})/(?P<day>\d{2})/$', 'archive_day'),
   (r'^(?P<year>\d{4})/(?P<month>\d{2})/(?P<day>\d{2})/(?P<slug>[\w-]+)/$', 'entry_detail'),
)

