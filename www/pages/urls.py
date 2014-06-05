from django.conf import settings
from django.conf.urls import patterns, include, url
from django.views.generic.base import TemplateView

urlpatterns = patterns('',
    url(r'^playfair/', TemplateView.as_view(template_name='playfair.html'))
)
