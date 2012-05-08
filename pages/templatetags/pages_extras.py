from django import template
from django.core.urlresolvers import reverse

register = template.Library()

@register.simple_tag()
def nav_current(request, urls):
    for url in urls.split():
        rurl = reverse(url)
        
        # Special case the root because it will match everything.
        if rurl in request.path and (rurl != '/' or request.path == '/'):
            return ' id="current"'
        
    return ''
