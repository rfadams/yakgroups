var todo = new Object();

todo.isActive = true;

var draggableExist = false;
var newDraggable;
var $todoList;
var $calCells;
var helperClone;
var todoItemTemplate;
var quickAddInput;

$(function(){
	$todoList = $('#todoList');
	$bodyTag = $('body');
	
	todoItemTemplate = $('#todoItemTemplate');
	quickAddInput = $('#quickAddInput');

	todo.setupToDoList();
	todo.setupQuickAddForm();
	todo.getAllToDos();
});



//function calCreateNewEventFunct(event, ui){
//	var eventText = ui.draggable.children(".todoTitle").html();
//	var eventID = 'calEvent_'+ui.draggable.attr('id');
//	var calNewEvent = $('<div id="'+eventID+'" class="calEvent">'+eventText+'</div>')
//
//	$('#'+eventID).remove();
//
//	$(this).append(calNewEvent);
//	$('#'+eventID).ellipsis();
//}

//function calCellHoverEffectFunct(e){
//	$(this).toggleClass('calCellActive');
//}

// START OF TRANSITION TO OBJECT NOTATION
todo.details = null; //Info on current todo. To get id, todo.details.id
todo.detailsDivHeight = 0;
todo.allToDos = new Array(0);

todo.setupToDoList = function(){
	$todoList
	.sortable({
		axis: 'y',
		tolerance: 'pointer',
		sort: todo.todoListSortingFunct,
		update: todo.reorderToDos,
		stop: function(event, ui){
			ui.item.show();
			if(draggableExist){
				newDraggable.remove();helperClone.remove();
			}
			draggableExists = false;
		}
	});

	$('.todoCheckBox').live('click', todo.toggleCompleteStatus);

	$('.todoCheckBox').live("mouseover", function(){
		if ($(this).parent().data("complete")==0)
			$(this).children('.todoCheckOff').addClass('todoCheckHover');
	});
	$('.todoCheckBox').live("mouseout", function(){
		if ($(this).parent().data("complete")==0)
			$(this).children('.todoCheckOff').removeClass('todoCheckHover');
	});

	$('.todo').live('click', todo.showToDoDetails);
	$('.calEvent').live('click', todo.showToDoDetails);

	$('#todoDetailsClose').click(todo.hideToDoDetails)
}

todo.setupQuickAddForm = function(){
	$("#addTodoForm")
	.submit(todo.quickAddSend);
}

todo.quickAddSend = function(){
	
	var data;
	var todoTitle = quickAddInput.val();
	
	if(jQuery.trim(todoTitle)=="")
		return false;

	data = {
		site: site.siteID(),
		title: todoTitle
	};
	
	gen.json(
		window.location.pathname + '/todos/',
		data,
		function(data){
			todo.addNewToDoItem(data, false);
			quickAddInput.val("").focus();
			todo.toggleToDoListTut("hide");
		}
		);

	return false;
}

todo.createNewToDoItem = function(data){
	var newToDo = todoItemTemplate.clone();
	var pretty_time = '';
	var members = '&nbsp;';

	(data.pretty_time != '') ? pretty_time=data.pretty_time + ' ' : pretty_time='';

	if(data.members.length != 0){
		members = 'Assigned To: ';
		$.each(data.members, function(i, item){
			members = members + item;
			if((i+1) != data.members.length)
				members = members + ", ";
		});
	}
	
	newToDo
	.attr('id', 'todo_'+data.id)
	.removeClass('hidden')
	.children('.todoTitle')
	.attr('id', 'todoTitle_'+data.id)
	.html('<span>'+data.title+'</span>')
	.end()
	.children('.todoBottom')
	.children('.todoAssignedMembers')
	.attr('id', 'todoAssignedMembers_'+data.id)
	.html(members)
	.end()
	.children('.todoDueDate')
	.attr('id', 'todoDueDate_'+data.id)
	.html(pretty_time + data.pretty_date);
	
	return newToDo;
}

todo.configureToDoItem = function(data){
	$('#todoTitle_'+data.id).ellipsis();
	$('#todo_'+data.id).data("id", data.id);
	$('#todo_'+data.id+' .todoExpand').data("id", data.id);
	todo.toggleToDoCheckmark(data);
}

todo.updateToDoItem = function(data){
	$('#todo_'+data.id).replaceWith(todo.createNewToDoItem(data));
	if(todo.details != null)
		$('#todo_'+data.id).addClass('droppableHover');
	todo.configureToDoItem(data);
	todo['id_'+data.id] = data;
}

todo.addNewToDoItem = function(data, scrollTop){
	var scrollPos = 0;
	
	if(!scrollTop)
		scrollPos = $todoList.attr("scrollHeight");

	$todoList
	.append(todo.createNewToDoItem(data))
	.attr({
		scrollTop: scrollPos
	});

	todo['id_'+data.id] = data;
	todo.allToDos.push('id_'+data.id);
	cal.updateCalEvent(data.id);

	todo.configureToDoItem(data);
}

todo.todoListSortingFunct = function(e, ui){
	if(e.pageX > 328){
		if(!draggableExist){
			draggableExist = true;
			newDraggable = $('<div>'+ui.item.children(".todoTitle").html()+'</div>')
			.addClass("todoDraggable")
			.addClass("ui-state-hover")
			.appendTo($bodyTag)
			.ellipsis()
			.css({
				'top': e.pageY,
				'left': e.pageX
			});


			helperClone = ui.item
			.clone()
			.appendTo($bodyTag)
			.css({
				'top': ui.offset.top,
				'left': 11
			})
			.animate({
				'top': ui.placeholder.offset().top
			}, 500);

			ui.item.hide();
		}else{
			newDraggable.css({
				'top': e.pageY,
				'left': e.pageX
			});
		}
	}else{
		if(draggableExist){
			draggableExist = false;
			newDraggable.remove();
			helperClone.remove();
			ui.item.show();
		}
	}
}

todo.getAllToDos = function(){
	data = {
		site: null //site.siteID() //This should be modified in the future when site.siteID() uses listeners
	}

	gen.json(
		window.location.pathname + '/todos/getAllToDos/',
		data,
		function(data){
			$.each(data, function(i, item){
				todo.addNewToDoItem(item, true);
			});
			cal.createAllEvents();
			todo.toggleToDoListTut("show");
		},
		'Loading ToDo List...'
		);
}

todo.toggleToDoListTut = function(action){
	if(action == "show" && !site.settingsBoxDisplayed && todo.allToDos.length == 0){
		$('#todoListTut').fadeIn();
	}else{
		$('#todoListTut').hide();
	}
}

todo.reorderToDos = function(){
	var serial = $todoList.sortable('serialize');

	data = {
		site: site.siteID(),
		order: 'serial'
	};

	gen.json(
		window.location.pathname + '/todos/reorderToDos/?' + serial,
		data,
		function(data){}
		);
}

todo.toggleCompleteStatus = function(){
	var todoItem = $(this).parent();
	var todo_id = todoItem.data("id");

	data = {
		site: site.siteID(),
		id: todo_id,
		complete: todoItem.data("complete")
	};

	gen.json(
		window.location.pathname + '/todos/toggleCompleteStatus/',
		data,
		todo.toggleToDoCheckmark
		);

	return false;
}

todo.toggleToDoCheckmark = function(data){
	var todoItem = $('#todo_'+data.id);
	var checkMark = todoItem.children('.todoCheckBox').children('span');

	if(data.complete==0){
		todoItem.removeClass('todoComplete');
		checkMark.removeClass('todoCheckOn');
		checkMark.addClass('todoCheckOff');
	}else{
		todoItem.addClass('todoComplete');
		checkMark.addClass('todoCheckOn');
		checkMark.removeClass('todoCheckOff');
	}
	checkMark.removeClass('todoCheckHover');
	todoItem.data("complete", data.complete);

	if(todo.details && todo.details.id == data.id){
		todo.details.complete = data.complete;
		if(data.complete == 1){
			$('#todoDetailsCompleteStatus_'+data.id).html('Yes');
			$('#id_complete').attr('checked', true);
		}else if (data.complete == 0){
			$('#todoDetailsCompleteStatus_'+data.id).html('No');
			$('#id_complete').attr('checked', false);
		}
	}

}

todo.showToDoDetails = function(event, ui){
	var todoItem = $(this);
	var todoID = todoItem.data('id');

	if(!todo.isActive){
		return false;
	}

	todo.loadToDoDetails(todoID);
	$('#todoList div').removeClass('droppableHover');
	$('#todo_'+todoID).addClass('droppableHover');

	return false;
}

todo.hideToDoDetails = function(){
	$('#todoDetails').hide();
	todo.details = null;
	$('#tabs').show();
	$('#todoList div').removeClass('droppableHover');
	return false;
}

todo.loadToDoDetails = function(todo_id){
	data = {
		site: site.siteID(),
		id: todo_id
	};

	gen.json(
		window.location.pathname + '/todos/viewmodifyToDoDetails/',
		data,
		function(data){
//			$('#todoDetailsHeader').html(data.title);
			todo.details = data;

			$('#todoDetails').show();
			$('#tabs').hide();



			$('#todoDetailsTable').html(data.table).attr('scrollTop', 0);
			$('#modifyToDoDetailsFormContent').html(data.form);

			todo.createViewToDoDetailsTable();
		},
		'Loading...'
		);
}

todo.sendModifyToDoDetailsForm = function(){
	var data = $('#modifyToDoDetailsForm').serialize();

	gen.jsonPost(
		window.location.pathname + '/todos/viewmodifyToDoDetails/',
		data,
		function(data){
			var scrollPos = $('#todoDetailsForm').attr('scrollTop');
			todo.details = data;

			if(data.form_success){
				$('#todoDetailsTable').html(data.table);
				$('#modifyToDoDetailsFormContent').html(data.form);

				todo.createViewToDoDetailsTable();

				$('#todoDetailsTable').attr('scrollTop', (scrollPos+10));

				todo.updateToDoItem(data);
				cal.updateCalEvent(data.id);

		}else{
				$('#modifyToDoDetailsFormContent').html(data.form);
				
				todo.createModifyToDoDetailsForm();
				todo.restyleModifyToDoDetailsForm();

				$('#todoDetailsForm').attr('scrollTop', ($('#modifyToDoDetailsFormContent ul.errorlist:first').position().top - 10));
			}
		}
		);
		return false;
}

todo.createViewToDoDetailsTable = function(){
	var data = todo.details;
	var detailsTable = $('#todoDetailsTable')
	var detailsForm = $('#todoDetailsForm');
	var scrollPos = detailsForm.attr('scrollTop');

	$('#todoDetailsHeader').html('ToDo Details: ' + data.title);

	detailsForm.hide();
	detailsTable.show().attr('scrollTop', scrollPos);

	$('#todoDetailsActionButton')
	.html('Edit')
//	.addClass('ui-state-hover')
//	.focus()
//	.blur(function(){
//		$(this).removeClass('ui-state-hover');
//	})
	.unbind('click')
	.click(todo.createModifyToDoDetailsForm);

	$('#todoDetailsCancelButton')
	.html('Close')
	.unbind('click')
	.click(todo.hideToDoDetails);

	todo.configureRelatedTopicsTable();
	todo.configureRelatedFilesTable();
}

todo.createModifyToDoDetailsForm = function(){
	var data = todo.details;
	var detailsTable = $('#todoDetailsTable')
	var detailsForm = $('#todoDetailsForm');
	var scrollPos = detailsTable.attr('scrollTop');

	$('#todoDetailsHeader').html('Edit: ' + data.title);

	detailsTable.hide();
	detailsForm.show();

	$('#id_id').val(data.id);

	$('#modifyToDoDetailsForm').submit(todo.sendModifyToDoDetailsForm);

	$('#todoDetailsActionButton')
	.html('Save')
//	.addClass('ui-state-hover')
//	.focus()
//	.blur(function(){
//		$(this).removeClass('ui-state-hover');
//	})
	.unbind('click')
	.click(todo.sendModifyToDoDetailsForm);

	$('#todoDetailsCancelButton')
	.html('Cancel')
	.unbind('click')
	.click(todo.createViewToDoDetailsTable);

	$('#id_description').elastic({onResize: function(){
			var detailsForm = $('#todoDetailsForm');
			var oldHeight = todo.detailsDivHeight;
			var newHeight = detailsForm.attr('scrollHeight');
			var heightDiff = (newHeight-oldHeight);
			var scrollPos = detailsForm.attr('scrollTop');
			todo.detailsDivHeight = detailsForm.attr('scrollHeight');

			detailsForm.attr('scrollTop', (scrollPos+heightDiff));
	}});
	todo.detailsDivHeight = detailsForm.attr('scrollHeight');
	detailsForm.attr('scrollTop', scrollPos);

	todo.configureRelatedTopicsTable();
	todo.configureRelatedFilesTable();
}

todo.restyleModifyToDoDetailsForm = function(){
	var data = todo.details;
	$.each(data.error_keys, function(i, item){
		$('#id_'+item)
		.css({
			'margin-top':'0',
			'border': '1px solid red'
		});
	});
}

todo.removeRelatedTopic = function(topic_id, todo_id){
	var data = {
		site: site.siteID(),
		item: topic_id,
		todo: todo_id
	};

	gen.jsonPost(
		window.location.pathname + '/todos/removeRelatedTopic/',
		data,
		function(data){
			$('#relatedTopicsView').html(data.topics_table);
			$('#relatedTopicsModify').html(data.topics_table);
			todo.configureRelatedTopicsTable();
		}
		);
}

todo.configureRelatedTopicsTable = function(){
	$('#relatedTopicsTable .relatedTopicLink').each(function(){
		var link = $(this);
		var id = link.attr('id').split('_')[1];
		link.click(function(){
			todo.hideToDoDetails();
			site.tabs.tabs('select', 1);
			discuss.displayCurrentDiscussion(id);
			
			return false;
		});
	});

	$('#relatedTopicsView .relatedTopicRemoveLink').each(function(){
		var link = $(this);
		var id = link.attr('id').split('_')[1];
		link.click(function(){todo.removeRelatedTopic(id, todo.details.id);return false;});
	});

	$('#relatedTopicsModify .relatedTopicRemoveLink').each(function(){
		var link = $(this);
		var id = link.attr('id').split('_')[1];
		link.click(function(){todo.removeRelatedTopic(id, todo.details.id);return false;});
	});
}

todo.removeRelatedFile = function(file_id, todo_id){
	var data = {
		site: site.siteID(),
		item: file_id,
		todo: todo_id
	};

	gen.jsonPost(
		window.location.pathname + '/todos/removeRelatedFile/',
		data,
		function(data){
			$('#relatedFilesView').html(data.files_table);
			$('#relatedFilesModify').html(data.files_table);
			todo.configureRelatedFilesTable();
		}
		);
}

todo.configureRelatedFilesTable = function(){
	$('#relatedFilesTable .relatedFileLink').each(function(){
		var link = $(this);
		var currHref = link.attr('href');
		link.attr('href', site.media_url+'/storage/'+site.url+'/'+currHref);
	});

	$('#relatedFilesView .relatedFileRemoveLink').each(function(){
		var link = $(this);
		var id = link.attr('id').split('_')[1];
		link.click(function(){todo.removeRelatedFile(id, todo.details.id);return false;});
	});

	$('#relatedFilesModify .relatedFileRemoveLink').each(function(){
		var link = $(this);
		var id = link.attr('id').split('_')[1];
		link.click(function(){todo.removeRelatedFile(id, todo.details.id);return false;});
	});
}
//function asdf(){
//	var detailsTable = $('#todoDetailsTable')
//	var detailsForm = $('#todoDetailsForm');
//	var scrollPos = detailsTable.attr('scrollTop');
//
//	console.log('Table ScrollPos: ' + scrollPos);
//	console.log('Table ScrollHeight: ' + detailsTable.attr('scrollHeight'));
//	console.log('Table ScrollTop: ' + detailsTable.attr('scrollTop'));
//	console.log('Form ScrollHeight: ' + detailsForm.attr('scrollHeight'));
//	console.log('Form ScrollTop: ' + detailsForm.attr('scrollTop'));
//}




//END OF ToDoList////////////////////////////////////////////////////////////////////////////////



