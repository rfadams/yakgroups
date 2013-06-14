from django import forms

from yakgroups.discuss.models import *

class NewDiscussionForm(forms.ModelForm):
	title = forms.CharField(max_length=150)
	body = forms.CharField(widget=forms.Textarea)

	class Meta:
		model = Topic
		fields = ('title',)

class DiscussionReplyForm(forms.ModelForm):
	class Meta:
		model = Post
		fields = ('topic', 'body',)

#class RelatedToDoForm(forms.Form):
#	site = forms.IntegerField(min_value=0)
#	topic = forms.IntegerField(min_value=0)
#	todo = forms.IntegerField(min_value=0)