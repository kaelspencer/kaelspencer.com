from __future__ import absolute_import
from django.conf.urls.defaults import *
from . import views

urlpatterns = patterns('',
   url(r'^$', views.new),
)

