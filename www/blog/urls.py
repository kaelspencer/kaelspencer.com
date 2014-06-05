from __future__ import absolute_import
from django.conf.urls import *
from .views import *

urlpatterns = patterns('',
   url(r'^/?$', EntryArchiveIndex.as_view()),
   (r'^(?P<year>\d{4})/$', EntryArchiveYear.as_view()),
   (r'^(?P<year>\d{4})/(?P<month>\d{2})/$', EntryArchiveMonth.as_view()),
   (r'^(?P<year>\d{4})/(?P<month>\d{2})/(?P<day>\d{2})/$', EntryArchiveDay.as_view()),
   (r'^(?P<year>\d{4})/(?P<month>\d{2})/(?P<day>\d{2})/(?P<slug>[\w-]+)/$', EntryArchiveDetail.as_view()),
)

