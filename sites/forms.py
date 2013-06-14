import re

from django.shortcuts import get_object_or_404
from django import forms

from django.db.models import Q
from django.contrib import auth

from yakgroups.sites.models import *
from yakgroups.members.models import *

class RenameSiteForm(forms.ModelForm):
	class Meta:
		model = GroupSite
		fields = ('name', 'title')
	
	def clean_name(self):
		name = self.cleaned_data['name']
		rex = re.compile(r"\W")
		if rex.search(name):
			raise forms.ValidationError("Only letters, numbers, and underscores allowed. No spaces.")
		if len(name) < 3:
			raise forms.ValidationError("Group name needs to be at least 3 characters.")
		if GroupSite.objects.filter(random_name=name).count() != 0:
			raise forms.ValidationError("Group site with this Name already exists.")
		return name


class LoginForm(forms.Form):
	"""Form to login users"""

	email = forms.CharField()
	password = forms.CharField(widget=forms.PasswordInput)
	url = forms.CharField(required=False, widget=forms.HiddenInput)
	
#	def clean_email(self):
#		email = self.cleaned_data['email']
#		
#		if MemberInfo.objects.filter(email=email).count() == 0:
#			raise forms.ValidationError('Email address not found')

	def clean(self):
		"""Clean Login Form make sure email is in the db and check if email/pass combo is valid"""

		cleaned_data = self.cleaned_data
		email = cleaned_data.get('email')
		password = cleaned_data.get('password')
		url = cleaned_data.get('url')

		if email and password:
			
			if url!='directory':
				site = get_object_or_404(GroupSite, Q(random_name=url) | Q(name=url))
				if site.group_leader != 0 and not MemberInfo.objects.filter((Q(sites__name=url) | Q(sites__random_name=url)) & Q(email=email)):
					raise forms.ValidationError("User account is not valid for this Group Site")
					return cleaned_data

			user = auth.authenticate(username=email, password=password)
			cleaned_data['user'] = user

			if user is None:
				raise forms.ValidationError("Email and/or password is not valid")
			else:
				if not user.is_active:
					raise forms.ValidationError("User account has been disabled")

		return cleaned_data






	
