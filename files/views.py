import os
import sys

from django.conf import settings
from django.shortcuts import get_object_or_404, render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext
from django.db.models import Q
from yakgroups.util import json
from yakgroups.util import ygauth

from yakgroups.sites.models import GroupSite
from django.contrib.auth.models import User
from yakgroups.files.models import *
from yakgroups.todos.forms import RelatedToDoForm


def file_test(request, url):
	site = get_object_or_404(GroupSite, Q(random_name=url) | Q(name=url))
	return render_to_response('files/filesTest.html', {'site': site}, context_instance=RequestContext(request))

def file_uploads(request, url):
	site = get_object_or_404(GroupSite, Q(random_name=url) | Q(name=url))

	try:
		os.makedirs(settings.MEDIA_ROOT+'storage/'+site.random_name)
	except OSError:
		pass

	f = request.FILES['Filedata']
	file_count = File.objects.filter(site=site, original_name=f.name).count()

	if file_count==0:
		destination = open(settings.MEDIA_ROOT+'storage/'+site.random_name+'/'+f.name, 'wb+')
		new_name = f.name
	else:
		name_split = f.name.split('.')
		new_name = ''
		for i, name in enumerate(name_split[:-1]):
			if i == 0:
				new_name = new_name + name
			else:
				new_name = new_name + '.' + name
		new_name = new_name + '-' + str(file_count) + '.' + name_split.pop()
		destination = open(settings.MEDIA_ROOT+'storage/'+site.random_name+'/'+new_name, 'wb+')

	for chunk in f.chunks():
			destination.write(chunk)
	destination.close()

	file = File(site=site, original_name=f.name, name=new_name)
	if request.POST.get('user', 0):
		file.creator = User.objects.get(id=request.POST['user'])
	file.save()

	return json.to_json_response({'s': True})
#	return render_to_response('files/filesTest.html', {'site': site}, context_instance=RequestContext(request))

def display_all_files(request, url, initial_load):
	site = get_object_or_404(GroupSite, Q(random_name=url) | Q(name=url))

	if ygauth.auth_user(request, url, site):
		files = File.objects.filter(site=site).order_by('-updated')
		all_files = json.render_to_json('files/allFiles.html', {'files': files, 'site': site, 'media_url': settings.MEDIA_URL})
		if initial_load:
			return all_files
		return json.to_json_response({'all_files': all_files})

def assign_related_todo(request, url):
	site = get_object_or_404(GroupSite, Q(id=request.POST['site']) & (Q(random_name=url) | Q(name=url)))
	form = RelatedToDoForm(request.POST)
	if request.method == 'POST' and form.is_valid() and ygauth.auth_user(request, url, site):
		todo_id = form.cleaned_data['todo']
		file_id = form.cleaned_data['item']

		todo = get_object_or_404(ToDo, id=todo_id)
		file = get_object_or_404(File, id=file_id)
		file.todos.add(todo)

		return json.to_json_response({'s': True})