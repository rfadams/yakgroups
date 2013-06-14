import os
import sys

apache_configuration= os.path.dirname(__file__)
project = os.path.dirname(apache_configuration)
workspace = os.path.dirname(project)
sys.path.append(workspace)

sys.path.append('/www/yakgroups.com/public/yakgroups/')

os.environ['DJANGO_SETTINGS_MODULE'] = 'yakgroups.settings'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()