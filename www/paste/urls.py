from __future__ import absolute_import
from django.conf.urls.defaults import *
from .views import ExistingDetailView
from . import views

urlpatterns = patterns('',
   url(r'^$', views.new, name='paste_url_index'),
   url(r'^api/paste/$', views.api_paste, name='paste_url_api_paste'),
   url(r'^(?i)(?P<slug>[a-zA-Z0-9]{10})/$', ExistingDetailView.as_view()),
   url(r'^(?i)(?P<slug>[a-zA-Z0-9]{10})/full/$', ExistingDetailView.as_view(template_name='paste.view.full.html')),
)

