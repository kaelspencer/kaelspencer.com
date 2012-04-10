from django.conf import settings
from django.shortcuts import render_to_response, get_object_or_404, RequestContext
from .models import Paste
from django.forms import ModelForm
from django.core.context_processors import csrf
from django.http import HttpResponseRedirect

class NewPasteForm(ModelForm):
    class Meta:
        model = Paste
        exclude = ('url','lexedbody','lexedcss')

def view(request, template, form):
    context = {'MEDIA_URL': settings.MEDIA_URL,
               'form': form}
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
               'form': form}
    context.update(csrf(request))
    
    return render_to_response('paste.new.html', context)

def existing(request, pid):
    p = get_object_or_404(Paste, url=pid)
    
    context = {'MEDIA_URL': settings.MEDIA_URL,
               'paste': p}
    context.update(csrf(request))
    
    return render_to_response('paste.view.lexed.html', context, context_instance=RequestContext(request))
    #return render_to_response('paste.view.html', context, context_instance=RequestContext(request))
