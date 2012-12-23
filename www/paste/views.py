from django.conf import settings
from django.shortcuts import render_to_response, get_object_or_404, RequestContext
from .models import Paste
from django.forms import ModelForm
from django.core.context_processors import csrf
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseNotAllowed
from chosen import widgets as chosenwidgets
from datetime import datetime
from django.views.generic import DetailView
from django.views.decorators.csrf import csrf_exempt
from django.utils import simplejson

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

@csrf_exempt
def api_paste(request):

    if request.method == 'POST':
        json_data = simplejson.loads(request.raw_post_data)

        try:
            p = Paste()
            p.title = json_data['title']
            p.rawbody = json_data['text']
            p.lexer = json_data['lexer']
            p.exposed = False
            p.save()

            return HttpResponse(p.get_absolute_url())
        except KeyError:
            HttpResponseServerError('Malformed data!')
    else:
        return HttpResponseNotAllowed('Only POST is accepted')
