import datetime

from django.db import models
from django.contrib.auth.models import User, UserManager

from yakgroups.sites.models import *


class MemberInfo(User):


	#name = models.CharField(blank=False, max_length=25)
	#email = models.EmailField(blank=False, max_length=50)
	phone = models.CharField(blank=True, max_length=20)
	sites = models.ManyToManyField(GroupSite)
	unique_url = models.CharField(editable=False, unique=True, max_length=10)
	password_changed = models.BooleanField(editable=False, default=False)
	show_settings = models.BooleanField(editable=False, default=True)
	free_for_life = models.BooleanField(default=True)
	created = models.DateTimeField(editable=False, default=datetime.datetime.now)
	updated = models.DateTimeField(editable=False)

	#UserManager to get the user create_user method, etc.
	objects = UserManager()

	def save(self):
		"""Overwrites save to modify 'updated' on each save"""
		self.updated = datetime.datetime.now()
		super(MemberInfo, self).save()

	def __unicode__(self):
		return u"%s" % (self.first_name)
