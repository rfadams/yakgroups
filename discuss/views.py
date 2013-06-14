from django.shortcuts import get_object_or_404#, render_to_response
#from django.http import HttpResponse, HttpResponseRedirect
#from django.template import RequestContext
from django.db.models import Q
from yakgroups.util import json
from yakgroups.util import ygauth

from yakgroups.discuss.models import *
from yakgroups.discuss.forms import *
from yakgroups.sites.models import GroupSite
from yakgroups.todos.models import ToDo
from yakgroups.todos.forms import RelatedToDoForm

from yakgroups.util.todo_parser import *
from yakgroups.util.util import YakEmail
from yakgroups.members.models import MemberInfo
import datetime


def create_empty_discussion(request, url):
	site = get_object_or_404(GroupSite, Q(id=request.GET['site']) & (Q(random_name=url) | Q(name=url)))
	if ygauth.auth_user(request, url, site): 
		topic = Topic(site=site)
		if request.user.is_authenticated():
			topic.creator = request.user
		topic.save()
		return json.to_json_response(topic, include=('id',))

def delete_empty_discussion(request, url):
	site = get_object_or_404(GroupSite, Q(id=request.POST['site']) & (Q(random_name=url) | Q(name=url)))
	if request.method == 'POST' and ygauth.auth_user(request, url, site):
		topic = get_object_or_404(Topic, id=request.POST['discussion'], site=site, empty=True)
		topic.delete()
		return json.to_json_response({'s': True})

def save_new_discussion(request, url):
	site = get_object_or_404(GroupSite, Q(id=request.POST['site']) & (Q(random_name=url) | Q(name=url)))
	topic = get_object_or_404(Topic, id=request.POST['new_discussion_id'], site=site, empty=True)
	form = NewDiscussionForm(request.POST, instance=topic)
	if request.method == 'POST' and form.is_valid() and ygauth.auth_user(request, url, site):
		topic = form.save(commit=False)
		topic.empty = False
		topic.save()
		post = Post(topic=topic, body=form.cleaned_data['body'])
		if request.user.is_authenticated():
			post.creator = request.user
		post.save()
		form.cleaned_data['success'] = True

		members = MemberInfo.objects.filter(sites=site)
		if members.count() > 0:
			email = YakEmail()
			for m in members:
				r = ReadStatus(member=m, topic=topic)
				if request.user.is_authenticated() and m.id == request.user.id:
					r.read = True
				r.save()
				if request.user.is_authenticated() and request.user.id == m.id:
					continue
				email.add_email(to_addy=m.email, subject=topic.title, from_addy=site.get_site_title()+' YakGroup', template='discuss/emailPost.html', context={'topic': topic, 'post': post})
			email.send_all_emails()

		return json.to_json_response(form.cleaned_data)
	else:
		discussion_form = json.render_to_json('discuss/newDiscussion.html', {'form': form, 'site': site.id})
		response = {
			'error_keys': form.errors.keys(),
			'form': discussion_form,
			'success': False
		}

		return json.to_json_response(response)

def display_all_discussions(request, url, initial_load):
	site = get_object_or_404(GroupSite, (Q(random_name=url) | Q(name=url)))

	if ygauth.auth_user(request, url, site):
		topics = Topic.objects.filter(site=site, empty=False).order_by('-updated')
		for t in topics:
			t.read = t.read_status(request.user)
		all_discussions = json.render_to_json('discuss/allDiscussions.html', {'topics': topics, 'user': request.user})
		if initial_load:
			return all_discussions

		return json.to_json_response({'all_discussions': all_discussions})

def display_new_discussion_form(request, url, initial_load):
	site = get_object_or_404(GroupSite, (Q(random_name=url) | Q(name=url)))
	if initial_load:
		return json.render_to_json('discuss/newDiscussion.html', {'form': NewDiscussionForm(), 'site': site.id})

def display_current_discussion(request, url):
	site = get_object_or_404(GroupSite, Q(id=request.GET['site']) & (Q(random_name=url) | Q(name=url)))
	if ygauth.auth_user(request, url, site):
		topic = Topic.objects.get(id=request.GET['id'])
		posts = Post.objects.filter(topic=topic).order_by('updated')
		todos = topic.todos.all().order_by('order')

		if request.user.is_authenticated():
			r = ReadStatus.objects.get_or_create(member=request.user, topic=topic)
			r[0].read = True
			r[0].save()

		fdict = {}
		for todo in todos:
			for file in todo.file_set.all():
				fdict[file.id] = file

		current_discussion = json.render_to_json('discuss/currentDiscussion.html', {'posts': posts, 'topic': topic, 'todos': todos, 'files': fdict.values()})
		return json.to_json_response({'current_discussion': current_discussion})

def save_current_discussion_reply(request, url):
	site = get_object_or_404(GroupSite, Q(id=request.POST['site']) & (Q(random_name=url) | Q(name=url)))
	form = DiscussionReplyForm(request.POST)
	if request.method == 'POST' and form.is_valid() and ygauth.auth_user(request, url, site):
		post = Post(topic=form.cleaned_data['topic'], body=form.cleaned_data['body'])
		if request.user.is_authenticated():
			post.creator = request.user
			post.author = post.creator.first_name
		else:
			post.author = 'Anon'
		post.save()

		if request.user.is_authenticated():
			ReadStatus.objects.filter(Q(topic=form.cleaned_data['topic']) & ~Q(member=request.user)).update(read=False)

		members = MemberInfo.objects.filter(sites=site)
		if members.count > 0:
			email = YakEmail()
			for m in members:
				if request.user.is_authenticated() and request.user.id == m.id:
					continue
				email.add_email(to_addy=m.email, subject=post.topic.title, from_addy=site.get_site_title()+' YakGroup', template='discuss/emailPost.html', context={'topic': post.topic, 'post': post})
			email.send_all_emails()

		
		now = datetime.datetime.today()
		pretty_datetime = make_pretty_datetime(now.date(), now.time())

		post.created = pretty_datetime[1] + " " + pretty_datetime[0]
		post.body = post.body.replace('\n', '<br />')

		post.topic.save()

		return json.to_json_response(post, include=('author', 'created', 'body'))

def assign_related_todo(request, url):
	site = get_object_or_404(GroupSite, Q(id=request.POST['site']) & (Q(random_name=url) | Q(name=url)))
	form = RelatedToDoForm(request.POST)
	if request.method == 'POST' and form.is_valid() and ygauth.auth_user(request, url, site):
		todo_id = form.cleaned_data['todo']
		topic_id = form.cleaned_data['item']

		todo = get_object_or_404(ToDo, id=todo_id)
		topic = get_object_or_404(Topic, id=topic_id)
		topic.todos.add(todo)

		todos = topic.todos.all().order_by('order')

		todos_table = json.render_to_json('discuss/relatedTodosTable.html', {'todos': todos})

		return json.to_json_response({'todos_table': todos_table})

def remove_related_todo(request, url):
	site = get_object_or_404(GroupSite, Q(id=request.POST['site']) & (Q(random_name=url) | Q(name=url)))
	form = RelatedToDoForm(request.POST)
	if request.method == 'POST' and form.is_valid() and ygauth.auth_user(request, url, site):
		todo_id = form.cleaned_data['todo']
		topic_id = form.cleaned_data['item']

		todo = get_object_or_404(ToDo, id=todo_id)
		topic = get_object_or_404(Topic, id=topic_id)
		topic.todos.remove(todo)

		todos = topic.todos.all().order_by('order')

		todos_table = json.render_to_json('discuss/relatedTodosTable.html', {'todos': todos})

		return json.to_json_response({'todos_table': todos_table})


