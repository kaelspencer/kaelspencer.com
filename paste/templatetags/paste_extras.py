from django import template
from paste.models import Paste
from datetime import datetime

register = template.Library()

def get_pretty_time(dt):
    seconds = dt.seconds + dt.days * (60 * 60 * 24)
    ret = ''
    val = 1
    
    if seconds < 60:
        ret = 'A minute'
    elif seconds < 60 * 60:
        val = seconds / 60
        ret = str(val) + ' minute'
    elif seconds < 60 * 60 * 24:
        val = seconds / (60 * 60)
        ret = str(val) + ' hour'
    elif seconds < 60 * 60 * 24 * 7:
        val = seconds / (60 * 60 * 24)
        ret = str(val) + ' day'
    elif seconds < 60 * 60 * 24 * 365:
        val = seconds / (60 * 60 * 24 * 7)
        ret = str(val) + ' week'
    else:
        val = seconds / (60 * 60 * 24 * 365)
        ret = str(val) + ' day'
    
    if val != 1:
        ret = ret + 's'
    
    ret = ret + ' ago'
    return ret

@register.inclusion_tag('recent.html', takes_context=True)
def show_recent_list(context):
    recent = Paste.objects.filter(exposed=True).order_by('-pastedate')[:13]
    pastes = []
    
    for p in recent:
        pasteDict = {}
        
        pasteDict['dt'] = get_pretty_time(datetime.now() - p.pastedate)
        pasteDict['url'] = p.get_absolute_url()
        pasteDict['title'] = p.title
        pasteDict['lexer'] = p.lexer
        
        pastes.append(pasteDict)
        
    return {
        'recent_list': pastes,
        'context': context
    }