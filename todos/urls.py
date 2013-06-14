from django.conf.urls.defaults import *

urlpatterns = patterns('yakgroups.todos.views',
		(r'^$', 'quickadd_todo'),
		(r'^getAllToDos/$', 'get_all_todos'),
		(r'^reorderToDos/$', 'reorder_todos'),
		(r'^toggleCompleteStatus/$', 'toggle_complete_status'),
		(r'^viewmodifyToDoDetails/$', 'viewmodify_todo_details'),
		(r'^updateToDoDate/$', 'update_todo_date'),
		(r'^removeRelatedTopic/$', 'remove_related_topic'),
		(r'^removeRelatedFile/$', 'remove_related_file'),
)