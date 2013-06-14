from django.db import models
import datetime

from django.contrib.auth.models import User
from yakgroups.sites.models import GroupSite
from yakgroups.members.models import MemberInfo

class ToDo(models.Model):
	site = models.ForeignKey(GroupSite)
	order = models.IntegerField(editable=False, default=0)
	complete = models.BooleanField(default=False)
	title = models.CharField(max_length=100)
	due_date = models.DateField(blank=True, null=True)
	due_time = models.TimeField(blank=True, null=True)
	pretty_date = models.CharField(blank=True, max_length=10)
	pretty_time = models.CharField(blank=True, max_length=10)
	description = models.TextField(blank=True)
	assigned_members = models.ManyToManyField(MemberInfo, blank=True, related_name='todos')
	creator = models.ForeignKey(User, null=True)
	created = models.DateTimeField(editable=False, default=datetime.datetime.now)

	def all_topics(self):
		return self.topic_set.filter(empty=False).order_by('-updated')

	def all_files(self):
		return self.file_set.order_by('-updated')

	def __unicode__(self):
		return u'%s: %s' % (self.pk, self.title)