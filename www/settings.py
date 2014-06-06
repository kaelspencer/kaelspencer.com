# Django settings for www project.

import os
import json
import platform
from unipath import FSPath as Path

ADMINS = (
    ('Kael', 'kaelspencer@gmail.com'),
)

MANAGERS = ADMINS

BASE = Path(__file__).absolute().ancestor(1)

# Presume that only the production server will run on hoth
# This isn't the best longterm solution.
PRODUCTION = ("endor" in platform.node())

if PRODUCTION:
    print "Production: true"
else:
    print "Production: false"

SECRETS = json.load(open('secrets.json'))
SECRET_KEY = str(SECRETS['secret_key'])

if PRODUCTION:
    DATABASES = SECRETS['databases_production']

    DEBUG = False
    TEMPLATE_DEBUG = False
else:
    DATABASES = SECRETS['databases_debug']

    DEBUG = True
    TEMPLATE_DEBUG = True

TIME_ZONE = 'UTC'
USE_TZ = True

LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale
USE_L10N = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = BASE.child('media')

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = '/media/'

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = ''

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = '/static/'

# URL prefix for admin static files -- CSS, JavaScript and images.
# Make sure to use a trailing slash.
# Examples: "http://foo.com/static/admin/", "/static/admin/".
ADMIN_MEDIA_PREFIX = '/admin_media/'

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

MIDDLEWARE_CLASSES = (
#    'django.middleware.cache.UpdateCacheMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
#    'django.middleware.cache.FetchFromCacheMiddleware',
)

if DEBUG:
    # TODO: Enable Debug Toolbar.
    # Issue with the debug toolbar. Failing to import. The new version tries
    # to update Django to 1.6.5
    # MIDDLEWARE_CLASSES += (
    #     'debug_toolbar.middleware.DebugToolbarMiddleware',
    # )

    INTERNAL_IPS = (
        '127.0.0.1'
    )

ROOT_URLCONF = 'www.urls'

TEMPLATE_DIRS = [BASE.child('templates')]

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'django.contrib.admindocs',
    'django.contrib.markup',
    'blog',
    'paste',
    'pages',
    'smuggler',
    'honeypot',
    'eve',
    'django.contrib.humanize',
    'south',
    'django_notify',
    'mptt',
    'sekizai',
    'sorl.thumbnail',
    'wiki',
    'wiki.plugins.attachments',
    'wiki.plugins.notifications',
    'wiki.plugins.images',
    'wiki.plugins.macros',
)

# TODO: Enable Debug Toolbar.
# Issue with the debug toolbar. Failing to import. The new version tries to
# update Django to 1.6.5
# if DEBUG:
#     INSTALLED_APPS += (
#         'debug_toolbar',
#     )

#     DEBUG_TOOLBAR_CONFIG = {
#         'DISABLE_PANELS': False,
#     }

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': [],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.core.context_processors.request',
    'django.contrib.messages.context_processors.messages',
    'www.context_processors.get_current_path',
    'sekizai.context_processors.sekizai',
)

#CACHE_MIDDLEWARE_SECONDS = 5
#CACHE_MIDDLEWARE_KEY_PREFIX = ''

#CACHES = {
#    'default': {
#        'BACKEND': 'django.core.cache.backends.memcached.PyLibMCCache',
#        'LOCATION': '127.0.0.1:11211',
#        'TIMEOUT': 3600,
#    }
#}

WIKI_MARKDOWN_KWARGS = {'extensions': ['footnotes', 'attr_list', 'headerid', 'extra', 'codehilite', ]}
WIKI_ACCOUNT_SIGNUP_ALLOWED = False
