from django.conf import settings
from django.shortcuts import render_to_response, get_object_or_404, RequestContext
from .models import Paste
from django.forms import ModelForm
from django.core.context_processors import csrf
from django.http import HttpResponseRedirect
from chosen import widgets as chosenwidgets
from datetime import datetime

class NewPasteForm(ModelForm):
    class Meta:
        model = Paste
        exclude = ('url','lexedbody','lexedcss')
        widgets = {
            'lexer': chosenwidgets.ChosenSelect(),
            'expiration': chosenwidgets.ChosenSelect(),
        }

def new(request):
    if request.method == 'POST':
        form = NewPasteForm(request.POST)
        
        if form.is_valid():
            p = form.save()
            return HttpResponseRedirect('/p/' + p.url + '/')
    else:
        form = NewPasteForm()
    
    context = {'MEDIA_URL': settings.MEDIA_URL,
               'form': form,
               'recentList': recentList(request.get_full_path())}
    context.update(csrf(request))
    
    return render_to_response('paste.new.html', context)

def existing(request, pid):
    p = get_object_or_404(Paste, url=pid)
    
    context = {'MEDIA_URL': settings.MEDIA_URL,
               'paste': p,
               'recentList': recentList(request.get_full_path())}
    context.update(csrf(request))
    
    return render_to_response('paste.view.html', context, context_instance=RequestContext(request))

# Upgrade to 1.4 and this won't need to be done.
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

def recentList(path):
    recent = Paste.objects.filter(exposed=True).order_by('-pastedate')[:13]
    pastes = []
    
    for p in recent:
        pasteDict = {}
        
        pasteDict['dt'] = get_pretty_time(datetime.now() - p.pastedate)
        pasteDict['url'] = p.get_absolute_url()
        pasteDict['title'] = p.title
        pasteDict['lexer'] = p.lexer
        
        pastes.append(pasteDict)
        
    return pastes
