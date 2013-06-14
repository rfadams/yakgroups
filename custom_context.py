def more_settings(request):
    from django.conf import settings
    return {
			'JQUERY_URL': settings.JQUERY_URL,
			'JQUERYUI_URL': settings.JQUERYUI_URL,
			'CSSa': settings.CSS_A,
			'CSSb': settings.CSS_B,
			'JAVASCRIPT': settings.JAVASCRIPT
		}