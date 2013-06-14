import threading

from django.core.mail import *
from django.template import loader, Context, Template


class YakEmail(object):

	def __init__(self, username=None):
		self.username = username or 'do_not_reply@yakgroups.com'
		self.connection = SMTPConnection(username=self.username)
		self.emails = []

	def add_email(self, to_addy, subject, from_addy, template=None, context=None, content=None):
		if template == None and content == None:
			raise Exception, 'Need either template or content'

		if template == None:
			text_c = Context({'text': content})
			text_t = Template('{{ text }}')
		else:
			text_c = Context(context)
			text_t = loader.get_template(template)
		
		text_content = text_t.render(text_c)

		html_c = Context({'text': text_content})
		html_t = Template('{{ text|urlize|linebreaksbr }}')

		html_content = html_t.render(html_c)
		if isinstance(to_addy, list) or isinstance(to_addy, tuple):
			email = EmailMultiAlternatives(subject=subject, body=text_content, from_email=from_addy, to=to_addy)
		else:
			email = EmailMultiAlternatives(subject=subject, body=text_content, from_email=from_addy, to=[to_addy])
		email.attach_alternative(html_content, "text/html")

		self.emails.append(email)

	def send_all_emails(self):
		t = threading.Thread(target=self.connection.send_messages, args=[self.emails], kwargs={})
		t.setDaemon(True)
		t.start()
		#return self.connection.send_messages(self.emails)



