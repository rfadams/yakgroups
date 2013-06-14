from django.shortcuts import render_to_response, get_object_or_404
from django.http import HttpResponseRedirect
from django.template import RequestContext
from django.db.models import Q
from django.contrib import auth

from yakgroups.util import ygauth


from django.forms.formsets import formset_factory
from django.contrib.auth.models import User

from yakgroups.members.forms import *
from yakgroups.members.models import MemberInfo
from yakgroups.util import json

def add_group_members(request, url):
	"""Display and catch AddMembersForm"""
	
	extra = 3
	initial = []
	data = {}
	info_initial = {'description': ''}

	if request.method == 'POST' and request.POST['submitType'] != '':
		formCopy = request.POST.copy()
		mod = 0
		del formCopy['form-TOTAL_FORMS'], formCopy['form-INITIAL_FORMS']
		
		if request.POST['submitType'] == 'addRowSubmit':
			del formCopy['submitType']
			extra = 1
		
		if request.POST['submitType'] == 'removeRowSubmit':
			del formCopy['submitType']
			extra = 0
			last_row_values = [formCopy[key] for key in sorted(formCopy, reverse=True)[:3] if formCopy[key].strip() != '']
			if int(request.POST['form-TOTAL_FORMS']) > 1 and len(last_row_values) == 0:
				mod = -3

		info_initial['description'] = formCopy['description']
		del formCopy['description']

		template = ['email', 'first_name', 'phone']
		form_keys = sorted(formCopy)
		for i in range(0,(len(formCopy)+mod)/3):
			values = [formCopy[key] for key in form_keys[(i*3):(i*3+3)]]
			initial.append(zip(template, values))


	FormSet = formset_factory(AddMembersForm, formset=BaseAddMembersFormSet, extra=extra)

	if request.method == 'POST' and request.POST['submitType'] == 'saveSubmit':
		form = FormSet(request.POST)
		info_form = AddMembersExtraInfoForm(request.POST)
		if form.is_valid() and info_form.is_valid():
			form.save(url, info_form.cleaned_data['description'])

			#if request.user.is_anonymous():
			request.session['fresh_site'] = True

			return json.to_json_response({'s': True})
		else:
			data['s'] = False
	else:
		form = FormSet(initial=initial)
		info_form = AddMembersExtraInfoForm(initial=info_initial)
		data['s'] = False

	data['form'] = json.clean_json(json.render_to_json('members/add_members.html', {'form': form, 'info_form': info_form}))

	
	#return render_to_response('members/add_members.html', data, context_instance=RequestContext(request))
	return json.to_json_response(data)
	
def user_profile(request, url, unique_url=None):
	"""Create / Update a user profile"""

	#site = get_object_or_404(GroupSite, Q(random_name=url) | Q(name=url))
	if unique_url:
		user = get_object_or_404(MemberInfo, unique_url=unique_url)
		name = user.first_name
	elif request.user.is_authenticated():
		user = get_object_or_404(MemberInfo, id=request.user.id)
		name = user.first_name
	else:
		return HttpResponseRedirect('/' + url)

	if request.method == 'POST':
		form = RegisterUserForm(request.POST, instance=user)
		if form.is_valid():
			if user:
				form.update_user(user)
				u = auth.authenticate(username=form.cleaned_data['email'], password=form.cleaned_data['password'])
				auth.login(request, u)
				return HttpResponseRedirect('/' + url)
			else:
				pass
	else:
		form = RegisterUserForm(instance=user)

	data = {
		'user': user,
		'name': name,
		'form': form,
		'unique_url': unique_url,
	}
	return render_to_response('members/userProfile.html', data, context_instance=RequestContext(request))

def show_settings_box(request, url, initial_load):
	"""Determines if settings box should be displayed and what kind"""

	data = {}
	site = get_object_or_404(GroupSite, Q(random_name=url) | Q(name=url))

	if site.name_changed == True:
		data['name_changed'] = True
	else:
		data['name_changed'] = False

	#print request.user.is_authenticated(), request.user.is_anonymous(), request.user

	if site.name_changed == False and site.group_leader == 0:
		data['show_settings'] = 1
		data['group_leader'] = True
	else:
		if request.user.is_authenticated():
			user = MemberInfo.objects.get(email=request.user.email)
			data['show_settings'] = user.show_settings
		else:
			data['show_settings'] = 1

		if site.group_leader == 0 or site.group_leader == user.id:
			data['group_leader'] = True
		

	if request.session.get('new_site', False):
		data['new_site'] = True
		del request.session['new_site']
	else:
		data['new_site'] = False

	return data

def disable_show_settings_box(request, url):
	"""Sets the show_settings value for a particular user"""

	site = get_object_or_404(GroupSite, Q(random_name=url) | Q(name=url))
	if not request.user.is_anonymous() and ygauth.auth_user(request, url, site):
		user = MemberInfo.objects.get(email=request.user.email)
		user.show_settings = False
		user.save()

	return json.to_json_response({'s': True})

		
def success(request, url):
	"""Display Generic Success Page"""
	data = {
		'site': url,
		'return_url': '/' + url + '/members/addMembers/'
	}
	return render_to_response('success.html', data, context_instance=RequestContext(request))