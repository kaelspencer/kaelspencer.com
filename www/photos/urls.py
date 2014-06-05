from __future__ import absolute_import
from django.conf.urls import *
from . import views

urlpatterns = patterns('',
   url(r'^$', views.new),
)

