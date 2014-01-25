from django.conf import settings
from django.conf.urls.defaults import patterns, include, url
from django.views.generic.base import TemplateView

urlpatterns = patterns('',
    url(r'^industry/', TemplateView.as_view(template_name='industry.html')),
    url(r'^shopper/', TemplateView.as_view(template_name='shopper.html')),
)
