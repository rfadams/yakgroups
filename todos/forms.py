from django import forms

from yakgroups.todos.models import *
from yakgroups.members.models import MemberInfo

class QuickAddTodoForm(forms.ModelForm):
	class Meta:
		model = ToDo
		fields = ('title', 'site')

class ToDoDetailsForm(forms.ModelForm):
	#pk = forms.IntegerField(widget=forms.HiddenInput, initial=5)
	assigned_members = forms.ModelMultipleChoiceField(widget=forms.CheckboxSelectMultiple, required=False, queryset=None, label="Assigned Members")
	due_date_string = forms.CharField(label="Due Date", required=False, help_text='&nbsp;&nbsp;Example: "Nov 3 at 7:35pm" or "10am 11/12"')

	def __init__(self, *args, **kwargs):
		super(ToDoDetailsForm, self).__init__(*args, **kwargs)
		self.fields['due_date_string'].initial = self.instance.pretty_time + self.instance.pretty_date
		self.fields['assigned_members'].queryset=MemberInfo.objects.filter(sites=self.instance.site)

	class Meta:
		model = ToDo
		fields = ('title', 'due_date_string', 'complete', 'assigned_members', 'description')

class ToDoUpdateDateForm(forms.ModelForm):
	class Meta:
		model = ToDo
		fields = ('due_date',)

class RelatedToDoForm(forms.Form):
	site = forms.IntegerField(min_value=0)
	item = forms.IntegerField(min_value=0)
	todo = forms.IntegerField(min_value=0)
