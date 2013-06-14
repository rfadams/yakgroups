from django.shortcuts import get_object_or_404#, render_to_response
#from django.http import HttpResponse, HttpResponseRedirect
#from django.template import RequestContext
from django.db.models import Q
from yakgroups.util import json
from yakgroups.util.todo_parser import *
from yakgroups.util import ygauth

from yakgroups.sites.models import *
from yakgroups.todos.forms import *
from yakgroups.todos.models import ToDo
from yakgroups.discuss.models import Topic
from yakgroups.files.models import File
from yakgroups.members.models import MemberInfo

import datetime

def quickadd_todo(request, url):
	if request.method == 'GET':
		site = get_object_or_404(GroupSite, Q(random_name=url) | Q(name=url))
		form = QuickAddTodoForm(request.GET)
	
		if form.is_valid() and ygauth.auth_user(request, url, site):
			new_todo = form.save(commit=False)

			members = MemberInfo.objects.filter(sites=site)
			members_list = members.values_list('first_name', flat=True)

			parse_data = parse_todo(new_todo.title, members_list)
			pretty_datetime = make_pretty_datetime(parse_data[1], parse_data[2])

			new_todo.title = parse_data[0]
			new_todo.due_date = parse_data[1]
			new_todo.due_time = parse_data[2]
			new_todo.pretty_date = pretty_datetime[0]
			new_todo.pretty_time = pretty_datetime[1]

			if not request.user.is_anonymous():
				new_todo.creator = request.user

			new_todo.order = ToDo.objects.filter(site=site).count() + 1
			new_todo.save()

			new_todo.assigned_members = members.filter(first_name__in=parse_data[3])

			new_todo.members = [member.first_name for member in new_todo.assigned_members.all()]

			return json.to_json_response(new_todo, include=('id', 'complete', 'title', 'members', 'due_date', 'pretty_date', 'pretty_time'))
		else:
			return json.to_json_response({'s': False, 'errors': form.errors.keys()})

def get_all_todos(request, url):
	if request.method == 'GET':
		site = get_object_or_404(GroupSite, Q(random_name=url) | Q(name=url))

		if not ygauth.auth_user(request, url, site):
			return

		todos = ToDo.objects.filter(site=site.id).order_by('order')

		for i, todo in enumerate(todos):
			todos[i].members = [member.first_name for member in todo.assigned_members.all()]

		return json.to_json_response(todos, include=('id', 'complete', 'title', 'members', 'due_date', 'pretty_date', 'pretty_time'))

def reorder_todos(request, url):
	site = get_object_or_404(GroupSite, Q(random_name=url) | Q(name=url))
	if ygauth.auth_user(request, url, site):
		todos_list = [int(item) for item in request.GET.getlist('todo[]')]
		todos = ToDo.objects.in_bulk(todos_list)

		for i, item in enumerate(todos_list):
			todos[item].order = i + 1
			todos[item].save()

		return json.to_json_response({'s': True})

def toggle_complete_status(request, url):
	site = get_object_or_404(GroupSite, Q(random_name=url) | Q(name=url))
	if ygauth.auth_user(request, url, site):
		id = request.GET.get('id')

		#sometimes the value for complete gets returned as 'true' or 'false' or 1 or 0. Not sure why
		if request.GET.get('complete') == 'true':
			complete = 1
		elif request.GET.get('complete') == 'false':
			complete = 0
		else:
			complete = int(request.GET.get('complete'))

		todo = ToDo.objects.get(id=id, site=site)

		if complete:
			todo.complete = 0
		else:
			todo.complete = 1

		todo.save()

		return json.to_json_response(todo, include=('id', 'complete'))

def viewmodify_todo_details(request, url):
	if request.method == 'POST':
		todo = get_object_or_404(ToDo, id=request.POST.get('id'))
		form = ToDoDetailsForm(request.POST, instance=todo)
		if form.is_valid():
			todo = form.save(commit=False)

			if todo.complete:
				todo.complete = 1
			else:
				todo.complete = 0
			
			parse_data = parse_todo(form.cleaned_data['due_date_string'])
			pretty_datetime = make_pretty_datetime(parse_data[1], parse_data[2])

			todo.due_date = parse_data[1]
			todo.due_time = parse_data[2]
			todo.pretty_date = pretty_datetime[0]
			todo.pretty_time = pretty_datetime[1]

			todo.save()
			form.save_m2m()
			todo.form_success = True
		else:
			todo.form_success = False
			todo.error_keys = form.errors.keys()

	else:
		site = get_object_or_404(GroupSite, Q(random_name=url) | Q(name=url))
		id = request.GET['id']

		if not ygauth.auth_user(request, url, site):
			return

		todo = get_object_or_404(ToDo, Q(id=id) & Q(site=site))
		form = ToDoDetailsForm(instance=todo)

	
	if todo.due_time is None:
		due_datetime = todo.due_date
	else:
		due_datetime = datetime.datetime.combine(todo.due_date, todo.due_time)

	#todo_description = todo.description.replace("\n", "<br />")

	data = {
		'todo': todo,
		#'todo_description': todo_description,
		'due_datetime': due_datetime
	}

	todo.members = [member.first_name for member in todo.assigned_members.all()]
	todo.table = json.render_to_json('todos/viewToDoDetails.html', data)
	todo.form = json.render_to_json('todos/modifyToDoDetails.html', {'form': form, 'todo': todo})
	
	return json.to_json_response(todo, include=('id', 'title', 'complete',
																							'table', 'form', 'members',
																							'due_date', 'pretty_time', 'pretty_date',
																							'form_success', 'error_keys'))

def update_todo_date(request,url):
	if request.method == 'POST':
		todo = get_object_or_404(ToDo, id=request.POST.get('id'))
		form = ToDoUpdateDateForm(request.POST, instance=todo)
		if form.is_valid():
			todo = form.save(commit=False)

			pretty_datetime = make_pretty_datetime(todo.due_date, todo.due_time)
			todo.pretty_date = pretty_datetime[0]
			todo.pretty_time = pretty_datetime[1]

			todo.save()

			todo.members = [member.first_name for member in todo.assigned_members.all()]

		return json.to_json_response(todo, include=('id', 'complete', 'title', 'members', 'due_date', 'pretty_date', 'pretty_time'))

def remove_related_topic(request, url):
	site = get_object_or_404(GroupSite, Q(id=request.POST['site']) & (Q(random_name=url) | Q(name=url)))
	form = RelatedToDoForm(request.POST)
	if request.method == 'POST' and form.is_valid() and ygauth.auth_user(request, url, site):
		todo_id = form.cleaned_data['todo']
		topic_id = form.cleaned_data['item']

		todo = get_object_or_404(ToDo, id=todo_id)
		topic = get_object_or_404(Topic, id=topic_id)
		#topic.todos.remove(todo)
		todo.topic_set.remove(topic)

		#todos = topic.todos.all().order_by('order')

		topics_table = json.render_to_json('todos/relatedDiscussionsTable.html', {'todo': todo})

		return json.to_json_response({'topics_table': topics_table})

def remove_related_file(request, url):
	site = get_object_or_404(GroupSite, Q(id=request.POST['site']) & (Q(random_name=url) | Q(name=url)))
	form = RelatedToDoForm(request.POST)
	if request.method == 'POST' and form.is_valid() and ygauth.auth_user(request, url, site):
		todo_id = form.cleaned_data['todo']
		file_id = form.cleaned_data['item']

		todo = get_object_or_404(ToDo, id=todo_id)
		file = get_object_or_404(File, id=file_id)
		#file.todos.remove(todo)
		todo.file_set.remove(file)

		#todos = file.todos.all().order_by('order')

		files_table = json.render_to_json('todos/relatedFilesTable.html', {'todo': todo})

		return json.to_json_response({'files_table': files_table})
