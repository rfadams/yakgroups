from django import forms

from yakgroups.files.models import *


class RelatedToDoForm(forms.Form):
	site = forms.IntegerField(min_value=0)
	file = forms.IntegerField(min_value=0)
	todo = forms.IntegerField(min_value=0)