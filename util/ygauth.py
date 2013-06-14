from django.db.models import Q
from yakgroups.members.models import MemberInfo

#def not_auth_user(request, url, site):
#	if not request.session.get('yg_not_auth_user', True):
#		return False
#	if not request.user.is_authenticated() or not MemberInfo.objects.filter((Q(sites__name=url) | Q(sites__random_name=url)) & Q(sites__id=site) & Q(email=request.user.email)):
#		return True
#	else:
#		request.session['yg_not_auth_user'] = False
#		return False

def auth_user(request, url, site):
	if site.group_leader == 0 or request.session.get('fresh_site', False):
		return True
	else:
		if request.session.get('yg_auth_user', False) == site: #Done this way so that an auth-user is not auth'ed on all sites
			#print 'from ygauth', request.session.get('yg_auth_user', False)
			return True
		elif request.user.is_authenticated() and MemberInfo.objects.filter((Q(sites__name=url) | Q(sites__random_name=url)) & Q(sites__id=site.id) & Q(email=request.user.email)):
			request.session['yg_auth_user'] = site
			return True
		else:
			return False