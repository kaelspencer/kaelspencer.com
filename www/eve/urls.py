from django.conf import settings
from django.conf.urls import patterns, include, url
from django.views.generic.base import TemplateView
from . import views

urlpatterns = patterns('',
    url(r'^industry/$', TemplateView.as_view(template_name='industry.html'), name='eve_url_industry'),
    url(r'^industry/(?P<itemid>\d+)/$', views.industry_detail),
    url(r'^shopper/', TemplateView.as_view(template_name='shopper.html'), name='eve_url_shopper'),
)
