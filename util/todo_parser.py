import datetime as dt
from dateutil import parser, relativedelta
import re

def _add_months(w):
	now = dt.datetime.combine(dt.date.today(), dt.time(0,0))
	new = now+relativedelta.relativedelta(months=+int(w))
	return new - now

def _add_weeks(w):
	return dt.timedelta(weeks=int(w))

def _add_days(w):
	return dt.timedelta(days=int(w))

def _add_hours(w):
	return dt.timedelta(hours=int(w))

def _add_minutes(w):
	return dt.timedelta(minutes=int(w))

def end_time(time, useCurrDate, useCurrTime, deltas):
	if useCurrTime or useCurrDate: # Uses parsed date, but current time
		temp = dt.datetime.now()
		if useCurrTime:
			curr_time = dt.time(temp.hour, temp.minute)
		else:
			curr_time = dt.time(0, 0)
		if useCurrDate:
			curr_date = dt.date(temp.year, temp.month, temp.day)
		else:
			curr_date = dt.date(time.year, time.month, time.day)
		now = dt.datetime.combine(curr_date, curr_time)
	else: #No time aspect, just uses parsed date
		now = time

	for item in deltas:
		now = now + item

	return now

#_keyword': [
			#spaces before/after to check,
			#funct to call,
#]
_keywords = {
	'by': [1, None],
	'and': [1, None],
	'from': [1, None],
#	'&': [1, None], #Doesn't work b/c it get's removed by cleaner
	'on': [1, None],
#	'the': [1, None],
	'at': [1, None],
	'due': [1, None],
	'in': [1, None],
	'of': [1, None],
	'am': [-1, None],
	'pm': [-1, None],

	'today': [0, _add_days],
	'tomorrow': [0, _add_days],
	'tomorow': [0, _add_days],
	'tommorrow': [0, _add_days],
	'tommorow': [0, _add_days],
	'next': [1, _add_weeks],
	'month': [-1, _add_months],
	'months': [-1, _add_months],
	'week': [-1, _add_weeks],
	'weeks': [-1, _add_weeks],
	'day': [-1, _add_days],
	'days': [-1, _add_days],
	'hour': [-1, _add_hours],
	'hours': [-1, _add_hours],
	'min': [-1, _add_minutes],
	'mins': [-1, _add_minutes],
	'minute': [-1, _add_minutes],
	'minutes': [-1, _add_minutes],

#	'john': [0, None],
#	'jim': [0, None],
#	'sam': [0, None],
}

_members = []#['john', 'jim', 'sam']

_digit_precontext = (
	'jan', 'january',
	'feb', 'february',
	'mar', 'march',
	'apr', 'april',
	'may', 'may',
	'jun', 'june',
	'jul', 'july',
	'aug', 'august',
	'sep', 'september',
	'oct', 'october',
	'nov', 'november',
	'dec', 'december',
)

_digit_postcontext = (
	'month', 'months',
	'week', 'weeks',
	'day', 'days',
	'hour', 'hours',
	'min', 'mins',
	'minute', 'minutes',
	'am', 'pm',
)

_week_days = (
	'mon', 'monday',
	'tue', 'tues', 'tuesday',
	'wed', 'wedn', 'wednesday'
	'thu', 'thur', 'thurs', 'thursday',
	'fri', 'friday'
	'sat', 'saturday',
	'sun', 'sunday',
)

_number_postfixes = (
	'st', 'nd', 'rd', 'th'
)

#x = 'Today, 10:30 pm Group_Meeting pm: to discuss-32 the next "big idea"' #2009-11-19 22:30:00
#x = 'Due in 3 days 2 hours 35 mins: Big "meeting-howabout", nees more planning!!$@#4' #2009-11-22 03:17:00
#x = 'Tomorrow, 7pm: Meeting in the pm' #2009-11-20 19:00:00
#x = 'Project Phase 2 due by Mon at 7 pm' #2009-11-23 19:00:00
#x = 'Sep Project 2 Phase 2 by John Jim Nov 2 due at 10:00 pm' #2009-11-02 22:00:00
#x = ' Nov 2, due at 2:00 pm-Meeting 2 about Nov Report' #2009-11-02 02:00:00 #can't split the pm-meeting. ok?
#x = ' Due at 1/20/2009, 2:00 pm: Meeting on the 2nd half of the project join-hands' #2009-01-20 14:00:00
#x = ' Meeting on the 2nd half of the project join-hands on 28th Nov' #2009-11-28 00:00:00
#x = ' Meeting on the 2nd half of the project join-hands on the 28th Nov' #2009-11-28 00:00:00 #leaves 'on the' in title. ok?
#x = 'Meeting 2 in 300 days' #2010-09-15 00:00:00
#x = 'Meeting 2 in 25 days' #2009-12-14 00:00:00
#x = 'Meeting 2 2pm' #2009-11-19 14:00:00
#x = 'Meeting 2 Next Saturday 2pm' #2009-11-28 14:00:00
#x = 'Nov 2 Meeting about Nov Report at 2:00 pm' #2009-11-02 14:00:00
#x = 'Meeting about Nov Report on Nov 2' #2009-11-02 00:00:00

#x = 'Embedded Systems Test 3 next Friday' #2009-11-24 00:00:00
#x = 'Nov 24th 2010 Meeting at 2 pm' #2010-11-24 14:00:00
#x = 'Nov 24th 2010 Meeting' #2010-11-24 00:00:00
#x = 'Final phase of project by Sam Jim due the 28th' #Fails by design. ok?
#x = 'half of 3rd paper Dec 2nd' #2009-12-02 00:00:00 #pops the 'of'. ok? Because 'of' next to '2nd'
#x = '2nd half of paper Dec 2nd' #2009-12-02 00:00:00
#x = 'Project about the 3 ponies due next Friday 7am' #2009-11-27 07:00:00
#x = 'Meeting 3rd Nov by Sam, John' #2009-11-03 00:00:00
#x = 'Meeting Sat by Sam'
#x = 'Meeting 3'

def parse_todo(s, members=[]):
	s = s.strip()
	tmp = re.sub(r'(/|-)(?=.(?<!(\d/\d)|(\d-\d)))|:(?=..(?<!\d:\d\d))|[^a-zA-Z0-9 ](?<!:|/|-)', '', s).lower()

	s_split = re.split(' ', s)

	clean = re.split(' ', tmp)
	clean_length = len(clean)

	date_related = []
	found_members = []
	del_locs = []
	_members = [name.lower() for name in members]

#	for item in _members:
#		_keywords[item.lower()] = [0, None]
#		_keywords[item.lower()+'s'] = [0, None]

	for i, item in enumerate(clean): #loop through each item in the cleaned array
		if item.isdigit() and len(item)<=3: #if it's a digit <3 chars long
			if ((i+1)<clean_length and clean[(i+1)] in _digit_postcontext) or ((i-1)>=0 and clean[(i-1)] in _digit_precontext):
				date_related.append(item)
				del_locs.append(i)

		else: #if it's not a digit
			if _keywords.has_key(item): #if item is one of the _keywords to watch for
				check_loc = i + _keywords.get(item)[0] #get loc of related item
				if _keywords.has_key(clean[check_loc]) or valid_datetime_parse(clean[check_loc]) or clean[check_loc] in _week_days: #if related item is valid
					date_related.append(item)
					del_locs.append(i)
				elif clean[check_loc] in _members:
					del_locs.append(i)
			elif item in _members:
				found_members.append(item)
				del_locs.append(i)
			elif item[:-1] in _members: #Checking for " John's "; the apostrophe gets removed by the cleaner
				found_members.append(item[:-1])
				del_locs.append(i)
			elif item in _week_days:
				date_related.append(item[0:3])
				del_locs.append(i)
			elif valid_datetime_parse(item): #if item is datetime.parse()-able
				if item in _digit_precontext and (i+1)<clean_length and not ((clean[i+1].isdigit() and len(clean[i+1])<=2)) and not (clean[i+1][-2:] in _number_postfixes) and not (clean[i-1][-2:] in _number_postfixes):
					pass #If it's a month, but not followed by <=2 numbers and not followed by a number with a postfix ('st', 'nd', etc) and not preceded by a number with a postfix, then ignore it
				elif item[-2:] in _number_postfixes and (((i+1)>=clean_length or (clean[i+1] != 'of' and clean[i+1] not in _digit_precontext)) and ((i-1)<0 or clean[i-1] not in _digit_precontext)):
					pass #if e.g. '28th' and not (not followed by 'of' or month) and not (preceded by the month), then pass it
				else:
					date_related.append(item)
					del_locs.append(i)

#	print '-=Result=-'
#	print 'Date Related: ' + ''.join((item + ' ') for item in date_related)
#	print 'Member Related: ' + ''.join((item + ' ') for item in found_members)
#	print 'Todo Title: ' + ''.join((item + ' ') for i, item in enumerate(s_split) if i not in del_locs)
#	print 'Clean:', clean

	delta_list = []
	useCurrentDate = False
	useCurrentTime = False

	for i, item in enumerate(date_related):
		if _keywords.has_key(item): #looks for particular keyword checks
			if item == 'today':
				delta_list.append(_keywords[item][1](0))
				break
			elif item == 'tomorrow' or item == 'tomorow' or item == 'tommorrow' or item == 'tommorow':
				delta_list.append(_keywords[item][1](1))
				break
			elif item == 'next':
				if date_related[i+1] == 'month':
					delta_list.append(_keywords[date_related[i+1]][1](1))
				elif date_related[i+1] == 'week':
					delta_list.append(_keywords[date_related[i+1]][1](1))
				elif valid_datetime_parse(date_related[i+1]):
					now = dt.datetime.now()
					day = parser.parse(date_related[i+1])
					if((day - now).days < 3):
						delta_list.append(_keywords[item][1](1))
				break
#			elif item in _members:
#				found_members.append(item)
#			elif item[:-1] in _members:
#				found_members.append(item[:-1])
			elif _keywords[item][1] is not None:
				if date_related[i-1].isdigit():
					delta_list.append(_keywords[item][1](date_related[i-1]))
					useCurrentDate = True
					if item[:6] == 'minute' or item[:4] == 'hour':
						useCurrentTime = True

	time_used = False
	for item in date_related:
		if re.search(r'\d{1,2}:\d{1,2}', item) or re.search(r'[ap]m', item):
			time_used = True
			break

	t = parser.parse(''.join([(item + ' ') for item in date_related]), fuzzy=True)
	if len(date_related) == 0:
		time = None
		#print 'No parseable date data'
	elif len(delta_list) != 0:
		time = end_time(t, useCurrentDate, useCurrentTime, delta_list)
		#print 'Due DateTime1: ' + str(end_time(t, useCurrentDate, useCurrentTime, delta_list))
	else:
		time = t
		#print 'Due DateTime2: ' + str(t)

	final_title = ''.join((item + ' ') for i, item in enumerate(s_split) if i not in del_locs)
	if time:
		final_date = dt.date(time.year, time.month, time.day)
		if time_used:
			final_time = dt.time(time.hour, time.minute)
		else:
			final_time = None
	else:
		final_date = None
		final_time = None

	return (final_title.strip(), final_date, final_time, found_members)

def valid_datetime_parse(s):
	if len(s.strip())==0:
		return False
	try:
		parser.parse(s)
		return True
	except:
		return False

def make_pretty_datetime(date, time):
	months = (
		'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
	)

	final_date = ''
	final_hour = ''
	final_minute = ''
	final_postfix = ''

	if date is not None:
		final_date = months[(int(date.month)-1)] + ' ' + str(date.day)

	if time is not None:
		if time.hour >= 0 and time.hour <= 11:
			final_postfix = 'am '
		else:
			final_postfix = 'pm '
		if time.minute != 0:
			if time.minute > 0 and time.minute < 10:
				final_minute = '0'
			final_minute = ':' + final_minute + str(time.minute)
		if time.hour > 12:
			final_hour = str((time.hour - 12))
		else:
			final_hour = str(time.hour)

	final_time = final_hour + final_minute + final_postfix

	return (final_date, final_time)

#print x
#print parse_todo(x)
