from django import template
from blog.models import Entry

register = template.Library()

@register.inclusion_tag('blog_recent.html', takes_context=True)
def show_recent_blog_list(context):
    recent = Entry.objects.all()[:10] if context['request'].user.is_staff else Entry.objects.published()[:10]
    entries = []
    
    for e in recent:
        entryDict = {}
        
        entryDict['headline'] = e.headline
        entryDict['pub_date'] = e.pub_date
        entryDict['url'] = e.get_absolute_url()
        
        entries.append(entryDict)
        
    return {
        'recent_entries': entries,
        'context': context
    }
