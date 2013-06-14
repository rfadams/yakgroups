from django.conf.urls.defaults import *

urlpatterns = patterns('yakgroups.files.views',
		(r'^fileTest/$', 'file_test'),
		(r'^fileUploads/$', 'file_uploads'),
		(r'^displayAllFiles/$', 'display_all_files', {'initial_load': False}),
		(r'^assignRelatedToDo/$', 'assign_related_todo'),
)