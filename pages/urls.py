from django.conf import settings
from django.conf.urls.defaults import patterns, include, url
from django.views.generic.simple import direct_to_template

urlpatterns = patterns('',
    url(r'^playfair/', direct_to_template, {'template': 'playfair.html'}, name="playfair")
)
