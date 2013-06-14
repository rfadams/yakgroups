from django.conf.urls.defaults import *

urlpatterns = patterns('yakgroups.sites.views',
		(r'^createSite/$', 'add_site'),
		(r'^directory/$', 'directory'),
)

urlpatterns += patterns('yakgroups.sites.views',
		(r'^$', 'site'),
		(r'^siteForms/$', 'site_forms'),
		(r'^renameSite/$', 'rename_site'),
		(r'^loadQuickTour/$', 'load_quick_tour'),
		(r'^login/$', 'login'),
		(r'^login/success/$', 'success'),
		(r'^logout/$', 'logout'),
		(r'^getSiteID/$', 'get_site_id'),
		(r'^getAllSiteInfo/$', 'get_all_site_info'),
		(r'^getAllSiteInfoTest/$', 'get_all_site_info_test'),

)