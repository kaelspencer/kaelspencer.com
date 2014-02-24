from django.http import HttpResponseRedirect, HttpResponseNotAllowed
from django.shortcuts import render_to_response
from django.core.urlresolvers import reverse
from django.template import RequestContext
import exceptions

def industry_detail(request, itemid="0"):
    try:
        id = int(itemid)

        if id == 0:
            return HttpResponseRedirect(reverse('eve_url_industry'))
        else:
            return render_to_response('industry_detail.html', {'itemid': id}, context_instance=RequestContext(request))
    except exceptions.ValueError:
        return HttpResponseNotAllowed()
