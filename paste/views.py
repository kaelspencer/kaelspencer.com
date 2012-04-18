from django.conf import settings
from django.shortcuts import render_to_response, get_object_or_404, RequestContext
from .models import Paste
from django.forms import ModelForm
from django.core.context_processors import csrf
from django.http import HttpResponseRedirect
from chosen import widgets as chosenwidgets

class NewPasteForm(ModelForm):
    class Meta:
        model = Paste
        exclude = ('url','lexedbody','lexedcss')
        widgets = {
            'lexer': chosenwidgets.ChosenSelect(),
            'expiration': chosenwidgets.ChosenSelect(),
        }
        

def view(request, template, form):
    context = {'MEDIA_URL': settings.MEDIA_URL,
               'form': form,
               'recentList': recentList()}
    context.update(csrf(request))
    
    return render_to_response(template, context)

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
               'recentList': recentList()}
    context.update(csrf(request))
    
    return render_to_response('paste.new.html', context)

def existing(request, pid):
    p = get_object_or_404(Paste, url=pid)
    
    context = {'MEDIA_URL': settings.MEDIA_URL,
               'paste': p,
               'recentList': recentList()}
    context.update(csrf(request))
    
    return render_to_response('paste.view.html', context, context_instance=RequestContext(request))

def recentList():
    recent = Paste.objects.filter(exposed=True).order_by('-pastedate')[:10]
    html = '<ul class="grid_2 alpha omega">'
    
    for p in recent:
        html = html + '<li><a href=' + p.get_absolute_url() + '>' + p.title + '</a></li>'
    
    html = html + '</ul><div class="clear"></div>'
    
    return html
