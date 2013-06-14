import re
import string
import random

from django import forms
from django.db.models import Q
from django.forms.util import ErrorList
#from django.core.mail import EmailMultiAlternatives
#from django.template import loader, Context, Template

from django.contrib.localflavor.us.forms import USPhoneNumberField
from django.forms.formsets import BaseFormSet

from yakgroups.members.models import *
from yakgroups.sites.models import *
from yakgroups.util.util import YakEmail

class AddMembersExtraInfoForm(forms.Form):
	description = forms.CharField(max_length=100, required=True, label='Group Description', help_text='Brief description of class and/or project. 100 characters max.')

class AddMembersForm(forms.ModelForm):
	"""Form to Add Members"""
	
	first_name = forms.CharField(required=True)
	email = forms.EmailField(required=True)
	phone = USPhoneNumberField(required=False)
	
	class Meta:
		model = MemberInfo
		fields = ('first_name', 'email', 'phone')

class BaseAddMembersFormSet(BaseFormSet):
	"""Base Class for AddMembersFormSet"""
				
	def save(self, url, description):
		"""Save the AddMembersForm instances"""
		#name = self.cleaned_data['first_name']
		#email = self.cleaned_data['email']
		#phone = self.cleaned_data['phone']
		#print len(self.cleaned_data)
		#print url
		yak_email = YakEmail(username="welcome@yakgroups.com")
		for i, f in enumerate(self.cleaned_data):
			#print f
			if len(f)>0:
				name = f['first_name']
				email = f['email']
				phone = f['phone']
				
				s = GroupSite.objects.get(Q(random_name=url) | Q(name=url))
				#user = MemberInfo.objects.filter(email=email)
				#print email
				if MemberInfo.objects.filter(email=email).count()!=0:
					user = MemberInfo.objects.get(email=email)
					user.sites.add(s)
					user.first_name = name
					user.phone = phone
					user.save()
				else:
					rex = re.compile(r'\W')
					username = '%s%s' % (rex.sub('_', email), MemberInfo.objects.count())
					user = MemberInfo.objects.create_user(username, email, 'pass')
					user.first_name = name
					user.phone = phone
					user.unique_url = string.join(random.sample(string.lowercase + string.digits, 10), '')
					user.sites.add(s)
					user.save()

				if i == 0 and s.group_leader == 0:
					s.group_leader = user.id
					group_leader = user
					s.save()
				else:
					group_leader = MemberInfo.objects.get(id=s.group_leader)

				context = {
						'group_leader': group_leader,
						'description': description,
						'url': url,
						'user': user,
				}
				yak_email.add_email(to_addy=user.email, subject='Howdy! You have been invited to YakGroups', from_addy='YakGroups Welcome', template='members/welcomeEmail.html', context=context)

#				subject, from_email = 'Howdy! You have been invited to YakGroups', 'welcome@yakgroups.com'
#				to = user.email
#				text_t = loader.get_template('members/welcomeEmail.html')
#				text_c = Context({
#						'group_leader': group_leader,
#						'description': description,
#						'url': url,
#						'user': user,
#				})
#
#
#				text_content = text_t.render(text_c)
#
#				html_c = Context({'text': text_content})
#				html_t = Template('{{ text|urlize|linebreaksbr }}.')
#
#				html_content = html_t.render(html_c)
#				msg = EmailMultiAlternatives(subject, text_content, from_email, [to])
#				msg.attach_alternative(html_content, "text/html")
#				msg.send()
		yak_email.send_all_emails()

class RegisterUserForm(forms.ModelForm):

	first_name = forms.CharField(required=True)
	email = forms.EmailField(required=True)
	phone = USPhoneNumberField(required=False, label="Phone (Optional)")
	password = forms.CharField(required=True, widget=forms.PasswordInput)
	password_verify = forms.CharField(required=True, widget=forms.PasswordInput, label='Verify Password')

	class Meta:
		model = MemberInfo
		fields = ('first_name', 'email', 'phone')

	def save_new_user(self): #not tested at all as of 1/6/2010
		"""Save the new user"""
		rex = re.compile(r'\W')
		cd = self.cleaned_data
		email = cd.get('email')
		username = '%s%s' % (rex.sub('_', email), MemberInfo.objects.count())
		password = cd.get('password')

		user = MemberInfo.objects.create_user(username, email, password)

		return user

	def update_user(self, user):
		"""Update the user"""
		rex = re.compile(r'\W')
		cd = self.cleaned_data
		user.first_name = cd.get('first_name')
		user.email = cd.get('email')
		user.username = '%s%s' % (rex.sub('_', user.email), MemberInfo.objects.count())
		user.phone = cd.get('phone')
		user.set_password(cd.get('password'))
		user.password_changed = True
		user.save()

		return user

	def clean(self):
		#pass
		cd = self.cleaned_data
		email = cd.get('email')
		password = cd.get('password')
		password_verify = cd.get('password_verify')

		if password and password_verify and password != password_verify:
			msg = u'Passwords did not match.'
			self._errors['password'] = ErrorList([msg])
			self._errors['password_verify'] = ErrorList([msg])

			del cd['password']
			del cd['password_verify']

		#print self.instance

		member = MemberInfo.objects.filter(email=email)
		if email and member.count() > 0 and member[0] != self.instance:
			self._errors['email'] = ErrorList([u'This email is taken.'])
			#raise forms.ValidationError("This email is taken, possibly by you! Try logging in! You may already have an account from YakGroups.com!")

		return cd