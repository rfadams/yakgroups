from django.db import models
import datetime

from django.contrib.auth.models import User
from yakgroups.sites.models import GroupSite
from yakgroups.todos.models import ToDo

class Topic(models.Model):
	site = models.ForeignKey(GroupSite)
	creator = models.ForeignKey(User, null=True)
	title = models.CharField(max_length=150, blank=True)
	todos = models.ManyToManyField(ToDo)
	empty = models.BooleanField(editable=False, default=True)
	updated = models.DateTimeField(editable=False)
	created = models.DateTimeField(editable=False, default=datetime.datetime.now)

	def save(self):
		"""Overwrites save to modify 'updated' on each save"""
		self.updated = datetime.datetime.now()
		super(Topic, self).save()

	def read_status(self, user):
		t = self.readstatus_set.filter(member=user)
		if t.count() > 0:
			return t[0].read
		else:
			return False


class Post(models.Model):
	topic = models.ForeignKey(Topic)
	creator = models.ForeignKey(User, null=True)
	body = models.TextField(blank=True)
	updated = models.DateTimeField(editable=False)
	created = models.DateTimeField(editable=False, default=datetime.datetime.now)

	def save(self):
		"""Overwrites save to modify 'updated' on each save"""
		self.updated = datetime.datetime.now()
		super(Post, self).save()

class ReadStatus(models.Model):
	member = models.ForeignKey(User, null=True)
	topic = models.ForeignKey(Topic)
	read = models.BooleanField(default=False)
	updated = models.DateTimeField(editable=False)

	def save(self, **kwargs):
		"""Overwrites save to modify 'updated' on each save"""
		self.updated = datetime.datetime.now()
		super(ReadStatus, self).save(**kwargs)
