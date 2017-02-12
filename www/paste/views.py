from django.conf import settings
from django.shortcuts import render_to_response, get_object_or_404, RequestContext
from .models import Paste
from django.forms import ModelForm, ChoiceField
from django.core.context_processors import csrf
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseNotAllowed
from chosen import widgets as chosenwidgets
from datetime import datetime
from django.views.generic import DetailView
from django.views.decorators.csrf import csrf_exempt
from django.utils import simplejson
from django.db.models import Q
import datetime
from django.utils import timezone
from honeypot.decorators import check_honeypot
import requests
from django.core.exceptions import ValidationError

EXPIRATION_CHOICES = (
    (0, u'Never'),
    (60, u'1 Minute'),
    (600, u'10 Minutes'),
    (3600, u'1 Hour'),
    (86400, u'1 Day'),
    (604800, u'1 Week'),
)

class NewPasteForm(ModelForm):
    class Meta:
        model = Paste
        exclude = ('url','lexedbody','lexedcss', 'active', 'expiration_date')
        widgets = {
            'lexer': chosenwidgets.ChosenSelect(),
        }
    expiration = ChoiceField(choices=EXPIRATION_CHOICES, widget=chosenwidgets.ChosenSelect())
    request = ''

    def set_request(self, request):
        self.request = request

    def clean(self):
        # If this is the POST request (a new paste being made), check on the recaptcha response.
        if (self.request.method == 'POST'):
            r = requests.post('https://www.google.com/recaptcha/api/siteverify',
                data = {'secret': settings.RECAPTCHA_SECRET, 'response': self.request.POST['g-recaptcha-response']})
            print(r.json())

            if r.json()['success'] == False:
                raise ValidationError(("You're not human!"), code='invalidRecaptcha')

        return super(NewPasteForm, self).clean()

@check_honeypot(field_name='pastetype')
def new(request):
    if request.method == 'POST':
        form = NewPasteForm(request.POST)
        form.set_request(request);

        if form.is_valid():
            p = form.save()

            expiration = int(form.cleaned_data['expiration'])

            if expiration > 0:
                p.expiration_date = datetime.timedelta(seconds=int(form.cleaned_data['expiration'])) + p.pastedate
                p.save()

            return HttpResponseRedirect('/p/' + p.url + '/')
    else:
        form = NewPasteForm()

    context = {'MEDIA_URL': settings.MEDIA_URL,
               'RECAPTCHA_SITE': settings.RECAPTCHA_SITE,
               'form': form}
    context.update(csrf(request))

    return render_to_response('paste.new.html', context, context_instance=RequestContext(request))

class ExistingDetailView(DetailView):
    context_object_name = 'paste'
    model = Paste
    slug_field = 'url'
    template_name = 'paste.view.html'

    def get_queryset(self):
        qs = super(ExistingDetailView, self).get_queryset()
        return qs.exclude(active=False).filter(Q(expiration_date__isnull=True) | Q(expiration_date__gt=timezone.now()))

@csrf_exempt
def api_paste(request):
    if request.method == 'POST':
        json_data = simplejson.loads(request.raw_post_data)

        try:
            p = Paste()
            p.title = json_data['title']
            p.rawbody = json_data['text']
            p.lexer = json_data['lexer']
            p.exposed = True
            p.save()

            return HttpResponse(p.get_absolute_url())
        except KeyError:
            HttpResponseServerError('Malformed data!')
    else:
        return HttpResponseNotAllowed('Only POST is accepted')
