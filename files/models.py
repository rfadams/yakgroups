import datetime

from django.db import models

from django.contrib.auth.models import User
from yakgroups.sites.models import GroupSite
from yakgroups.todos.models import ToDo

class File(models.Model):
	site = models.ForeignKey(GroupSite)
	creator = models.ForeignKey(User, null=True)
	original_name = models.CharField(max_length=250)
	name = models.CharField(max_length=250)
	todos = models.ManyToManyField(ToDo)
	updated = models.DateTimeField(editable=False)
	created = models.DateTimeField(editable=False, default=datetime.datetime.now)

	def save(self):
		"""Overwrites save to modify 'updated' on each save"""
		self.updated = datetime.datetime.now()
		super(File, self).save()