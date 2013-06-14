from django.db import models
import datetime

class GroupSite(models.Model):
	"""GroupSite Model: site id and info for a site"""
	
	random_name = models.CharField(editable=False, max_length=10, unique=True)
	name = models.CharField(blank=False, max_length=25, unique=True)
	title = models.CharField(blank=False, max_length=25)
	name_changed = models.BooleanField(editable=False, default=False)
	group_leader = models.IntegerField(editable=False, default=0)
	created = models.DateTimeField(editable=False, default=datetime.datetime.now)
	updated = models.DateTimeField(editable=False)
	
	def save(self):
		"""Overwrites save to  modify 'updated' on each save"""
		self.updated = datetime.datetime.now()
		super(GroupSite, self).save()

	def __unicode__(self):
		return u'%s: %s' % (self.pk, self.name)

	def get_site_name(self):
		if self.name_changed:
			return self.name
		else:
			return self.random_name

	def get_site_title(self):
		if self.name_changed:
			return self.title
		else:
			return "Unnamed"
