from django.conf.urls.defaults import *

urlpatterns = patterns('yakgroups.members.views',
		(r'^addGroupMembers/$', 'add_group_members'),
		(r'^userProfile/$', 'user_profile'),
		(r'^userProfile/(?P<unique_url>\w+)/$', 'user_profile'),
		(r'^disableShowSettingsBox/$', 'disable_show_settings_box'),
		(r'^addMembers/success/$', 'success'),
)