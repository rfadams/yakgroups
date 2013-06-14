from django.conf.urls.defaults import *

urlpatterns = patterns('yakgroups.discuss.views',
		(r'^createEmptyDiscussion/$', 'create_empty_discussion'),
		(r'^deleteEmptyDiscussion/$', 'delete_empty_discussion'),
		(r'^saveNewDiscussion/$', 'save_new_discussion'),
		(r'^displayAllDiscussions/$', 'display_all_discussions', {'initial_load': False}),
		(r'^displayCurrentDiscussion/$', 'display_current_discussion'),
		(r'^saveCurrentDiscussionReply/$', 'save_current_discussion_reply'),
		(r'^assignRelatedToDo/$', 'assign_related_todo'),
		(r'^removeRelatedToDo/$', 'remove_related_todo'),
)