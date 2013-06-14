from django.shortcuts import render_to_response, get_object_or_404
from django.http import HttpResponseRedirect, HttpResponse
from django.template import RequestContext
from django.db.models import Q
from yakgroups.util import json
from yakgroups.util import ygauth

import string
import random
import re
from django.contrib import auth
from django.conf import settings

from yakgroups.sites.forms import *
from yakgroups.sites.models import *

from yakgroups.discuss.forms import NewDiscussionForm
from yakgroups.discuss.views import *

from yakgroups.members.models import MemberInfo
from yakgroups.members.views import show_settings_box
from yakgroups.files.views import display_all_files


def homepage(request):
	"""Displays home page"""

	return render_to_response('sites/homepage.html', {}, context_instance=RequestContext(request))

def site(request, url):
	"""Displays new site"""

	s = get_object_or_404(GroupSite, Q(random_name=url) | Q(name=url))

	#Following line is required for authentication to work properly in the case of anon users just adding new members
	if request.session.get('fresh_site', False):
		del request.session['fresh_site']

	if s.group_leader != 0 and not ygauth.auth_user(request, url, s):
			return HttpResponseRedirect('/' + url + '/site/login/')

	r = re.compile('MSIE \d', re.I)
	result = re.search(r, request.META['HTTP_USER_AGENT'])

	if result != None:
		result = result.group()
		data = {}

		if not request.session.get('saw_ie_warning', False):
			if int(result[-1:]) <= 7:
				data['ieVersion'] = result[-1:]
			else:
				request.session["saw_ie_warning"] = True
			return render_to_response('sites/ieLandingPage.html', data, context_instance=RequestContext(request))
	#del request.session["saw_ie_warning"]

	if request.user.is_authenticated():
		email = request.user.email
		user = MemberInfo.objects.get(id = request.user.id)
		unique_url = user.unique_url
	else:
		email = ''
		unique_url = ''
	
	if s.name != s.random_name + '000' and url == s.random_name:
		return HttpResponseRedirect('/' + s.name) #If s.name has been modified, forward them there

	if s.name == s.random_name + '000':
		s.name = s.name[:-3] #Modifes s.name to remove the '000' from the end

	data = {
		'site': s,
		'user_email': email,
		'unique_url': unique_url,
	}
	return render_to_response('sites/main.html', data, context_instance=RequestContext(request))
	#return render_to_response('sites/default.html', data)


def site_forms(request, url):
	"""Displays new site"""

	s = get_object_or_404(GroupSite, Q(random_name=url) | Q(name=url))

	if s.name != s.random_name + '000' and url == s.random_name:
		return HttpResponseRedirect('/' + s.name)

	data = {
		'login_form': LoginForm(initial={'url': url}),
	}
	#return render_to_response('main.html', data)
	return render_to_response('sites/default.html', data, context_instance=RequestContext(request))


def add_site(request):
	"""Add new group site"""
	if request.method == 'POST':
		while True:
			site_name = string.join(random.sample(string.lowercase + string.digits, 6), '')
			#print site_name
			if GroupSite.objects.filter(Q(random_name=site_name) | Q(name=site_name)).count() == 0:
				new_site = GroupSite(random_name=site_name, name=site_name + '000')
				new_site.save()
				break
		request.session['new_site'] = True
		return HttpResponseRedirect('/' + new_site.random_name)


def rename_site(request, url):
	"""Rename group site"""
	data = {}
	if request.method == 'POST':
		site = get_object_or_404(GroupSite, Q(random_name=url) | Q(name=url))
		form = RenameSiteForm(request.POST, instance=site)
		if form.is_valid():
			new_site = form.save(commit=False)
			new_site.name_changed = True
			new_site.save()
			return json.to_json_response({'s': True, 'title': new_site.title})
		else:
			data = {'s': False, 'errors': form.errors.keys()}
	else:
		form = RenameSiteForm()

	data['form'] = json.clean_json(json.render_to_json('sites/renameSiteForm.html', {'form': form}))
	
	return json.to_json_response(data)

def load_quick_tour(request, url):
	content = json.clean_json(json.render_to_json('sites/quickTour.html', {'MEDIA_URL': settings.MEDIA_URL}))
	return json.to_json_response({'content': content})


def login(request, url=None):
	"""Log users into YakGroups"""
#	site = get_object_or_404(GroupSite, Q(random_name=url) | Q(name=url))
	if request.method == 'POST':
		form = LoginForm(request.POST)

		if form.is_valid():
			auth.login(request, form.cleaned_data['user'])
			if form.cleaned_data['url']=='directory':
				address = '/site/directory/'
			else:
				address = '/' + form.cleaned_data['url']
			return HttpResponseRedirect(address)

	else:
		if url==None:
			if request.user.is_authenticated():
				return HttpResponseRedirect('/site/directory/')

			address = 'directory'
		else:
			address = url
		form = LoginForm(initial={'url': address})
		
	data = {
		'login_form': form,
	}
	return render_to_response('sites/default.html', data, context_instance=RequestContext(request))

def logout(request, url):
	"""Logout function"""
	auth.logout(request)
	try:
		del request.session['yg_auth_user']
	except KeyError:
		pass
	return HttpResponseRedirect('/' + url + '/site/login/')


def directory(request):
	"""Create / Update a user profile"""

#	sites = GroupSite.objects.filter()
	if not request.user.is_authenticated():
		return HttpResponseRedirect('/login/')

	user = MemberInfo.objects.get(id=request.user.id)

	data = {
		'user': user
	}
	return render_to_response('members/directory.html', data, context_instance=RequestContext(request))



def get_site_id(request, url):
	"""AJAX view to return site id"""
	if request.method == 'GET':
		site = get_object_or_404(GroupSite, Q(random_name=url) | Q(name=url))
		response = {'site': site.id}
		return json.to_json_response(response)

def get_all_site_info(request, url):
	"""AJAX view to return all site info on initial loading of the site"""
	site = get_object_or_404(GroupSite, Q(random_name=url) | Q(name=url))
	
	if not ygauth.auth_user(request, url, site):
		return

	discuss = {
		'new_discussion_form': display_new_discussion_form(request, url, True),
		'all_discussions': display_all_discussions(request, url, True)
	}

	files = {
		'all_files': display_all_files(request, url, True),
	}

	if request.user.is_authenticated():
		user = request.user.id
	else:
		user = 0

	response = {
		'site': site.id,
		'url': site.random_name,
		'media_url': settings.MEDIA_URL,
		'user': user,
		'discuss': discuss,
		'files': files,
		'settings_box': show_settings_box(request, url, True),
	}

	return json.to_json_response(response)

def get_all_site_info_test(request, url):
	"""AJAX view to return all site info on initial loading of the site"""
	site = get_object_or_404(GroupSite, Q(random_name=url) | Q(name=url))

	if not ygauth.auth_user(request, url, site):
		return

	#new_discussion_form = json.render_to_json('discuss/newDiscussion.html', {'form': NewDiscussionForm(), 'site': site.id})

	discuss = {
		'new_discussion_form': display_new_discussion_form(request, url, True),
		'all_discussions': display_all_discussions(request, url, True)
	}

	response = {
		'site': site.id,
		'discuss': discuss,
	}

	return HttpResponse(json.json_encode(response))

def success(request, url):
	"""Display Generic Success Page"""
	data = {
		'site': url,
		'return_url': '/' + url
	}
	return render_to_response('success.html', data, context_instance=RequestContext(request))