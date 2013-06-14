from django.conf.urls.defaults import *
#from django.contrib.auth.views import login, logout
from django.contrib import admin
import django.views.generic.simple
#from django.contrib.auth import views as auth_views

from django.conf import settings

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

#urlpatterns = patterns('',
#		# Example:
#		# (r'^yakgroups/', include('yakgroups.foo.urls')),
#
#		# Uncomment the admin/doc line below and add 'django.contrib.admindocs'
#		# to INSTALLED_APPS to enable admin documentation:
#		# (r'^admin/doc/', include('django.contrib.admindocs.urls')),
#
#		# Uncomment the next line to enable the admin:
#		(r'^$', 'yakgroups.sites.views.homepage'),
#		(r'^admin/', include(admin.site.urls)),
#)

urlpatterns = patterns('',
		(r'^$', django.views.generic.simple.direct_to_template, {'template': 'homepage.html'}),
		(r'^terms/$', django.views.generic.simple.direct_to_template, {'template': 'sites/terms.html'}),
		
    (r'^', include('snapboard.urls')), #REQUIRED for snapboard urls to render
#		(r'^forums$', include('snapboard.urls')),
#    (r'^accounts/login/$', auth_views.login,{'template_name': 'snapboard/signin.html'}, 'auth_login'),
#    (r'^accounts/logout/$', auth_views.logout,{'template_name': 'snapboard/signout.html'}, 'auth_logout'),
    (r'^admin/', include(admin.site.urls)),
)



# Patterns for modules
urlpatterns += patterns('',
		#(r'^(?P<url>.*)/calendar/', 'yakgroups.sites.views.site', {'info': 'calendar'}),
		(r'^site/', include('sites.urls')),
		(r'^login$', 'django.views.generic.simple.redirect_to', {'url': '/login/'}),
		(r'^login/$', 'yakgroups.sites.views.login'),
		#(r'^asdfqwer/$', django.views.generic.simple.direct_to_template, {'template': 'sites/appHome.html'}),
		(r'^(?P<url>\w+)/site/', include('sites.urls')),
		(r'^(?P<url>\w+)/members/', include('members.urls')),
		(r'^(?P<url>\w+)/todos/', include('todos.urls')),
		(r'^(?P<url>\w+)/discuss/', include('discuss.urls')),
		(r'^(?P<url>\w+)/files/', include('files.urls')),
)

# Patterns for Group Sites
urlpatterns += patterns('',
		(r'^(?P<site>\w+)/$', 'django.views.generic.simple.redirect_to', {'url': '/%(site)s'}),
		(r'^(?P<url>\w+)$', include('sites.urls')),
)

#Genertic Views
#urlpatterns += patterns('',
#		#(r'^accounts/login/$', login),
#		(r'^accounts/logout/$', logout),
#)

if settings.DEBUG:
	urlpatterns += patterns('',
    (r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT, 'show_indexes': True}),
  )
