from django.db import models
from django.utils.translation import ugettext_lazy as _
from django.utils.text import Truncator
from django.utils import timezone

class EntryManager(models.Manager):
    def published(self):
        return self.active().filter(pub_date__lte=timezone.now())

    def active(self):
        return super(EntryManager, self).get_query_set().filter(is_active=True)

CONTENT_FORMAT_CHOICES = (
    (u'mdown', u'Markdown'),
)

class Entry(models.Model):
    headline = models.CharField(max_length=200)
    slug = models.SlugField(unique_for_date='pub_date')
    is_active = models.BooleanField(help_text=_("Tick to make this entry live (see also the publication date). Note that administrators (like yourself) are allowed to preview inactive entries whereas the general public aren't."), default=False)
    pub_date = models.DateTimeField(verbose_name=_("Publication date"), help_text=_("For an entry to be published, it must be active and its publication date must be in the past."))
    content_format = models.CharField(choices=CONTENT_FORMAT_CHOICES, max_length=50)
    body = models.TextField()
    author = models.CharField(max_length=100)

    objects = EntryManager()

    class Meta:
        verbose_name_plural = 'entries'
        ordering = ('-pub_date',)
        get_latest_by = 'pub_date'

    def __unicode__(self):
        return self.headline

    def get_absolute_url(self):
        return "/blog/%s/%s/" % (self.pub_date.strftime("%Y/%m/%d").lower(), self.slug)

    def is_published(self):
        return self.is_active and self.pub_date <= timezone.now()
    is_published.boolean = True

    def save(self, *args, **kwargs):
        self.body = self.body
        super(Entry, self).save(*args, **kwargs)

    # A summary will be a maximum of 60 words. If the summary is truncated, the bottom of the entry
    # will contain a link to read more.
    def get_summary(self):
        summary = Truncator(self.body).words(60, html=True)

        if summary != Truncator(self.body).words(61, html=True):
            # If the body truncated at 60 words is not equal to the body truncated at 61, this is a true truncation.
            summary += '\n\n[Read more](' + self.get_absolute_url() + ' "' + self.headline + '")'

        return summary
