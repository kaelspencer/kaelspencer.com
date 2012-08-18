import functools
from django.views.generic import View, dates
from .models import Entry

class EntryView(View):
    date_field = 'pub_date'
    month_format = '%m'
    make_object_list = True
    context_object_name = 'object_list'
    
    def get_queryset(self):
        return Entry.objects.all() if self.request.user.is_staff else Entry.objects.published()

class EntryFrontPage(EntryView, dates.ArchiveIndexView):
    template_name = 'front_page.html'

class EntryArchiveIndex(EntryView, dates.ArchiveIndexView):
    template_name = 'archive_overview.html'
    
class EntryArchiveYear(EntryView, dates.YearArchiveView):
    template_name = 'archive_year.html'
    
class EntryArchiveMonth(EntryView, dates.MonthArchiveView):
    template_name = 'front_page.html'
    
class EntryArchiveDay(EntryView, dates.DayArchiveView):
    template_name = 'front_page.html'
    
class EntryArchiveDetail(EntryView, dates.DateDetailView):
    template_name = 'detail.html'    
