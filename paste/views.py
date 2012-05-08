from django.conf import settings
from django.shortcuts import render_to_response, get_object_or_404, RequestContext
from .models import Paste
from django.forms import ModelForm
from django.core.context_processors import csrf
from django.http import HttpResponseRedirect
from chosen import widgets as chosenwidgets
from datetime import datetime
from django.views.generic import DetailView

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
               'form': form}
    context.update(csrf(request))
    
    return render_to_response('paste.new.html', context, context_instance=RequestContext(request))

class ExistingDetailView(DetailView):
    context_object_name = 'paste'
    model = Paste
    slug_field = 'url'
    template_name = 'paste.view.html'
