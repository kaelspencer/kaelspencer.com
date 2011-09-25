from __future__ import absolute_import
from django.conf.urls.defaults import *
from . import views

urlpatterns = patterns('',
   url(r'^$', views.new),
   url(r'^(?P<pid>[a-zA-Z0-9]{10})/$', views.existing),
   url(r'^(?P<pid>[a-zA-Z0-9]{10})$', views.existing),
)

