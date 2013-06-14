//Code
var cal = new Object();
cal.defaultDate = new Date();
cal.currentDate = cal.defaultDate;

cal.currFirstDay = null;
cal.currLastDay = null;

cal.updateCalendar = function(){
	//$("#weeks").html("Weeks: " + cal.getWeeksInMonth() + "; " + cal.currentDate.toDateString());
	cal.updateHeader();
	cal.setFirstAndLastDayInMonth(1); //Change this to 0 to get week to start on Sunday
	cal.addAllRows();
}

cal.setupButtons = function(){
	$('#calPrevMonthButton').click(function(e){
		cal.changeMonth(-1);
		cal.updateCalendar();
	});
	$('#calNextMonthButton').click(function(e){
		cal.changeMonth(1);
		cal.updateCalendar();
	});
}

cal.changeMonth = function(modifier){
	cal.currentDate.setMonth(cal.currentDate.getMonth() + modifier);
}

cal.setFirstAndLastDayInMonth = function(firstDayOfTheWeek){
	var temp = cal.currentDate;
	cal.currFirstDay = (new Date(temp.getFullYear(), temp.getMonth(), 1)).getDay()-firstDayOfTheWeek;
	cal.currLastDay = (new Date(temp.getFullYear(), (temp.getMonth()+1), 0)).getDay()-firstDayOfTheWeek;

	if(firstDayOfTheWeek==1){
		cal.currFirstDay = cal.currFirstDay < 0 ? 6 : cal.currFirstDay;
		cal.currLastDay = cal.currLastDay < 0 ? 6 : cal.currLastDay;
	}
}

cal.getFirstDate = function(year, month){
	return (new Date(year, month, 1)).getDate();
}

cal.getLastDate = function(year, month){
	return (new Date(year, (month+1), 0)).getDate();
}

cal.getWeeksInMonth = function(){
	var temp = cal.currentDate;

	if(cal.currFirstDay==0 && temp.getMonth()==1)// 4 week February
		return 4;
	else if(cal.currFirstDay < cal.currLastDay || temp.getMonth() == 1) // Feb never has more than 5 weeks
		return 5;
	else
		return 6;
}

cal.setupCalEvents = function(){
	$calCells = $('#calTable td');
	$calCells
	.droppable({
		hoverClass: 'calCellActive',
		tolerance: 'pointer',
		accept: '.todo',
		drop: cal.createNewEventFromDrop
	});

	$calCells
	.sortable({
		connectWith: '.calCell',
		items: 'div:not(.calDate)',
		over: function(event, ui){
			$(this).toggleClass('calCellActive');
		},
		out: function(event, ui){
			$(this).toggleClass('calCellActive');
		},
		receive: cal.createNewEventFromDrop,
		start: function(event, ui){todo.isActive = false;},
		stop: function(event, ui){setTimeout(function(){todo.isActive = true;}, 300);}
	});
}

cal.updateHeader = function(){
	var m=new Array(12);
	m[0]="January";
	m[1]="February";
	m[2]="March";
	m[3]="April";
	m[4]="May";
	m[5]="June";
	m[6]="July";
	m[7]="August";
	m[8]="September";
	m[9]="October";
	m[10]="November";
	m[11]="December";
	
	$('#calMonth').html(m[cal.currentDate.getMonth()] + ' ' + cal.currentDate.getFullYear());
}

cal.addAllRows = function(){
	var day = 0;
	var newTable;
	var currMonth = cal.currentDate;
	var prevMonth = new Date(currMonth.getTime());
	var thisMonth = new Date(currMonth.getTime());
	var nextMonth = new Date(currMonth.getTime());
	var outputMonth;
	var calDateID;
	var tempMonthString;
	var tempDayString;

	prevMonth.setMonth(prevMonth.getMonth()-1);
	nextMonth.setMonth(nextMonth.getMonth()+1);

	var numOfWeeks = cal.getWeeksInMonth();
	var calTableHeight = '';
	var calCellDiffMonth = true;

	var firstDayOnCal = cal.getLastDate(currMonth.getFullYear(), (currMonth.getMonth()-1)) - cal.currFirstDay;
	
	var prevMonthLastDate = cal.getLastDate(currMonth.getFullYear(), (currMonth.getMonth()-1));
	var currMonthLastDate = cal.getLastDate(currMonth.getFullYear(), currMonth.getMonth());
	
	var iPrevMonth = 0;
	var iCurrMonth = 0;
	var iNextMonth = 0;

	switch(numOfWeeks){
		case 4: calTableHeight = "25%"; break;
		case 5: calTableHeight = "20%"; break;
		case 6: calTableHeight = "16.67%"; break;
	}

	//$('#calTable').empty();
	newTable = '<table id="calTable" class="calTable">';
	for(var row=0; row < numOfWeeks; row++){ //Loops through rows of the calendar
		newTable += '<tr style="height: '+calTableHeight+';">';
		for(var col=0; col < 7; col++){ //Loops through the columns (days) of the calendar
			if((firstDayOnCal + iPrevMonth) < prevMonthLastDate){		//Calc displayed of prev month
				iPrevMonth++;
				day = firstDayOnCal + iPrevMonth;
				calCellDiffMonth = true;
				prevMonth.setDate(day);
				outputMonth = prevMonth;
			}else if(iCurrMonth==currMonthLastDate){								//Calc displayed days of next month
				iNextMonth++;
				day = iNextMonth;
				calCellDiffMonth = true;
				nextMonth.setDate(day);
				outputMonth = nextMonth;
			}else{																									//Calc displayed days of curr month
				iCurrMonth++;
				day = iCurrMonth;
				calCellDiffMonth = false;
				thisMonth.setDate(day);
				outputMonth = thisMonth;
			}

			((outputMonth.getMonth()+1) >= 0 && (outputMonth.getMonth()+1) <= 9) ? tempMonthString="0"+(outputMonth.getMonth()+1) : tempMonthString=""+(outputMonth.getMonth()+1);
			(outputMonth.getDate() >= 0 && outputMonth.getDate() <= 9) ? tempDayString="0"+outputMonth.getDate() : tempDayString=""+outputMonth.getDate();
			calDateID = "cal_" + outputMonth.getFullYear() + "-" + tempMonthString + "-" + tempDayString;
			if(calCellDiffMonth){
				newTable += '<td id="'+calDateID+'" class="calCell calCellDiffMonth"><div class="calDate">' + day + '</div></td>';
			}else{
				newTable += '<td id="'+calDateID+'" class="calCell"><div class="calDate">' + day + '</div></td>';
			}
		}
		newTable += '</tr>';
	}
	newTable += '</table>';
	$('#calTable').replaceWith(newTable);
	cal.setupCalEvents();
	cal.createAllEvents();
}

cal.createNewEventFromDrop = function(event, ui){
	var todo_id
	if(ui.draggable)
		todo_id = ui.draggable.attr('id').split("_")[1];
	else if(ui.item)
		todo_id = ui.item.attr('id').split("_")[1];
	var todo_date = $(this).attr("id").split("_")[1]

	var data = {
		id: todo_id,
		due_date: todo_date
	};

	gen.jsonPost(
		window.location.pathname + '/todos/updateToDoDate/',
		data,
		function(data){
			//todo['id_'+data.id] = data;
			todo.updateToDoItem(data);
			cal.updateCalEvent(data.id);	
		}
		);
}

cal.createNewEvent = function(todoID){
	var eventText = todo['id_'+todoID].title;
	var eventID = 'calEvent_'+todoID;
	$('#'+eventID).remove();
	return $('<div id="'+eventID+'" class="calEvent ui-state-default"><span>'+eventText+'</span></div>');
}

cal.updateCalEvent = function(id){
	var calNewEvent = cal.createNewEvent(id);
	$('#cal_'+todo['id_'+id].due_date).append(calNewEvent);
	$('#calEvent_'+id).ellipsis().data('id', id);
}

cal.createAllEvents = function(){
	for(var i=0; i < todo.allToDos.length; i++){
		cal.updateCalEvent(todo[todo.allToDos[i]].id);
	}
}

//Run at start
$(function(){
	cal.updateCalendar();
	cal.setupButtons();
});



//END OF Calendar////////////////////////////////////////////////////////////////////////////////




