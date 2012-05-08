from __future__ import absolute_import
from django.conf.urls.defaults import *
from .views import ExistingDetailView
from . import views

urlpatterns = patterns('',
   url(r'^$', views.new, name='paste_url_index'),
   url(r'^(?P<slug>[a-zA-Z0-9]{10})/$', ExistingDetailView.as_view()),
)

