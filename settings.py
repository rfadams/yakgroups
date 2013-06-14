# Django settings for yakgroups project.

#DEBUG = True
#TEMPLATE_DEBUG = DEBUG
#JSON_CONTENT_TYPE = 'text/html'
#MEDIA_ROOT = '/Users/rfadams/Documents/Django/yakgroups/static/'
#MEDIA_URL = '/static'
#DATABASE_PASSWORD = ''
#ADMIN_MEDIA_PREFIX = '/media/'
#TEMPLATE_DIRS = (
#		'/Users/rfadams/Documents/Django/yakgroups/templates/'
#)
#EMAIL_BACKEND = 'django.core.mail.backends.console'
##JQUERY_URL = 'http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.js'
##JQUERYUI_URL = 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/jquery-ui.js'
#JQUERY_URL = MEDIA_URL+'/js/jquery.js'
#JQUERYUI_URL = MEDIA_URL+'/js/jquery-ui.js'
#
#JS1 = '<script type="text/javascript" src="'+MEDIA_URL+'/js/jquery-plugins.js"></script>'
#JS2 = '<script type="text/javascript" src="'+MEDIA_URL+'/js/YG-Calendar.js"></script>'
#JS3 = '<script type="text/javascript" src="'+MEDIA_URL+'/js/YG-ToDoList.js"></script>'
#JS4 = '<script type="text/javascript" src="'+MEDIA_URL+'/js/YG-Site.js"></script>'
#JS5 = '<script type="text/javascript" src="'+MEDIA_URL+'/js/YG-General.js"></script>'
#JS6 = '<script type="text/javascript" src="'+MEDIA_URL+'/js/YG-Discuss.js"></script>'
#JS7 = '<script type="text/javascript" src="'+MEDIA_URL+'/js/YG-Files.js"></script>'
#JAVASCRIPT = JS5 + JS4 + JS1 + JS3 + JS2 + JS6 + JS7
#
#CSS1 = '<link rel="stylesheet" type="text/css" href="'+MEDIA_URL+'/css/screen.css" />'
#CSS2 = '<link rel="stylesheet" type="text/css" href="'+MEDIA_URL+'/css/jquery-ui.css" />'
#CSS3 = '<link rel="stylesheet" type="text/css" href="'+MEDIA_URL+'/css/YG.css" />'
#CSS_A = CSS1 + CSS2 + CSS3
#
#CSS4 = '<link rel="stylesheet" type="text/css" href="'+MEDIA_URL+'/css/YG-Homepage.css" />'
#CSS_B = CSS1 + CSS4

#---------------BEGIN SERVER CONFIG--------------------
DEBUG = True
TEMPLATE_DEBUG = DEBUG
JSON_CONTENT_TYPE = 'application/json'
MEDIA_ROOT = '/www/yakgroups.com/public/static/'
MEDIA_URL = 'http://static.yakgroups.com'
DATABASE_PASSWORD = '' #add password 
ADMIN_MEDIA_PREFIX = 'http://static.yakgroups.com/media/'
TEMPLATE_DIRS = (
		'/www/yakgroups.com/public/yakgroups/templates/'
)
JQUERY_URL = 'http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js'
JQUERYUI_URL = 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.2/jquery-ui.min.js'

JAVASCRIPT = '<script type="text/javascript" src="'+MEDIA_URL+'/js/YG-All.min.js"></script>'
CSS1 = '<link rel="stylesheet" type="text/css" href="'+MEDIA_URL+'/css/screen.css" />'
CSS_A = '<link rel="stylesheet" type="text/css" href="'+MEDIA_URL+'/css/YG-All.min.css" />'
CSS_B = CSS1 + '<link rel="stylesheet" type="text/css" href="'+MEDIA_URL+'/css/YG-Home.min.css" />'
#---------------END SERVER CONFIG--------------------

ADMINS = (
		# ('Your Name', 'your_email@domain.com'),
)

MANAGERS = ADMINS

DATABASE_ENGINE = 'mysql'						# 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
DATABASE_NAME = 'yakgroups'							# Or path to database file if using sqlite3.
DATABASE_USER = 'root'						 # Not used with sqlite3.
#DATABASE_PASSWORD = ''																# Not used with sqlite3.
DATABASE_HOST = ''						 # Set to empty string for localhost. Not used with sqlite3.
DATABASE_PORT = ''						 # Set to empty string for default. Not used with sqlite3.

CACHE_BACKEND = 'locmem://'
SESSION_ENGINE = 'django.contrib.sessions.backends.cached_db'

EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'welcome@yakgroups.com'
EMAIL_HOST_PASSWORD = '' #add password
EMAIL_PORT = 587

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'America/Chicago'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = False

# Absolute path to the directory that holds media.
# Example: "/home/media/media.lawrence.com/"
#MEDIA_ROOT = '/www/yakgroups.com/public/static/'

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash if there is a path component (optional in other cases).
# Examples: "http://media.lawrence.com", "http://example.com/media/"
#MEDIA_URL = 'http://static.yakgroups.com/'

# URL prefix for admin media -- CSS, JavaScript and images. Make sure to use a
# trailing slash.
# Examples: "http://foo.com/media/", "/media/".
#ADMIN_MEDIA_PREFIX = '/media/'

# Make this unique, and don't share it with anybody.
SECRET_KEY = '%6xe9c&(4%r7bo733k^0b53$4oo(jwjlq5_@d3r3wqog(is#@2'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
		'django.template.loaders.filesystem.load_template_source',
		'django.template.loaders.app_directories.load_template_source',
#			'django.template.loaders.eggs.load_template_source',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    "django.core.context_processors.auth",
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    "django.core.context_processors.request",
    "snapboard.views.snapboard_default_context",
		"yakgroups.custom_context.more_settings",
)

AUTHENTICATION_BACKENDS = (
		'emailauthentication.EmailBackend',
		#'django.contrib.auth.backends.ModelBackend',
)

#DEFAULT_CONTENT_TYPE = 'application/xhtml+xml'

MIDDLEWARE_CLASSES = (
		'django.middleware.common.CommonMiddleware',
		'django.contrib.sessions.middleware.SessionMiddleware',
		'django.contrib.auth.middleware.AuthenticationMiddleware',
#		'django.contrib.flatpages.middleware.FlatpageFallbackMiddleware',
		'pagination.middleware.PaginationMiddleware',
    'snapboard.middleware.threadlocals.ThreadLocals',
		'multihost.MultiHostMiddleware',

    # These are optional
    'snapboard.middleware.ban.IPBanMiddleware',
    'snapboard.middleware.ban.UserBanMiddleware',
)

MULTIHOST_URLCONF_MAP = {
     'forums.yg.com:8800'     :'snapboard.urls',
     'forums.yakgroups.com'		:'snapboard.urls',
   }

ROOT_URLCONF = 'yakgroups.urls'

STATIC_DOC_ROOT = MEDIA_ROOT

#TEMPLATE_DIRS = (
#		'/Users/rfadams/Documents/Django/yakgroups/templates/'
#)

INSTALLED_APPS = (
		'django.contrib.auth',
		'django.contrib.contenttypes',
		'django.contrib.sessions',
		'django.contrib.sites',
		'django.contrib.admin',
#		'django.contrib.flatpages',

		'pagination',
    'snapboard',

		'sites',
		'members',
		'todos',
		'discuss',
		'files',
)


# Set to False if your templates include the SNAPboard login form
USE_SNAPBOARD_LOGIN_FORM = True

# Select your filter, the default is Markdown
# Possible values: 'bbcode', 'markdown', 'textile'
SNAP_POST_FILTER = 'bbcode'
