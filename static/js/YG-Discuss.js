var discuss = new Object();


$(function(){
	discuss.showAllDiscussions(false);
	discuss.setupDroppables();
});

discuss.initialData = null;
discuss.newDiscussionForm = null;
discuss.allDiscussions = null;
discuss.current_topic = null;

discuss.loadData = function(data){
	discuss.initialData = data;
	discuss.newDiscussionForm = data.new_discussion_form;
	discuss.allDiscussions = data.all_discussions;
	discuss.displayAllDiscussions();
}

discuss.loadHash = function(){
	if(gen.hashTabArray.length == 0){
		site.tabs.tabs('select', 1);
	}else{
		var topic_id = gen.hashTabArray[0].split('_');
		site.tabs.tabs('select', 1);
		discuss.displayCurrentDiscussion(topic_id[1]);
	}
}

discuss.showAllDiscussions = function(focus){
	$('#allDicussions').show();
	$('#currentDiscussion').hide();
	$('#newDiscussion').hide();

	gen.button('discussActionButton', 'Create New Discussion', discuss.createNewDiscussionForm, focus);
	gen.button('discussCancelButton', 'Refresh', discuss.getAllDiscussions, false);
}

discuss.createNewDiscussionForm = function(){
	$('#allDicussions').hide();
	$('#currentDiscussion').hide();
	$('#newDiscussion')
	.html(discuss.newDiscussionForm)
	.show();

	$('#id_body').elastic();

	gen.button('discussActionButton', 'Save', discuss.saveNewDiscussion, true);
	gen.button('discussCancelButton', 'Cancel', discuss.cancelNewDiscussionForm, false);

	var data = {
		site: site.siteID()
	};

	gen.json(
		window.location.pathname + '/discuss/createEmptyDiscussion/',
		data,
		function(data){
			$('#new_discussion_id').val(data.id);
			discuss.current_topic = data.id;
		}
		);
}

discuss.cancelNewDiscussionForm = function(){
	discuss.showAllDiscussions(true);

	var data = {
		site: site.siteID(),
		discussion: $('#new_discussion_id').val()
	};

	gen.jsonPost(
		window.location.pathname + '/discuss/deleteEmptyDiscussion/',
		data,
		function(data){
			$('#new_discussion_id').val(data.id);
		}
		);
}

discuss.saveNewDiscussion = function(){
	var data = $('#newDiscussionForm').serialize();
	var discussion = $('#new_discussion_id').val()

	gen.jsonPost(
		window.location.pathname + '/discuss/saveNewDiscussion/',
		data,
		function(data){
			if(data.success){
				discuss.getAllDiscussions();
				discuss.showAllDiscussions(true);
			}else{
				$('#newDiscussion').html(data.form);
				gen.restyleErrorForm(data);
				$('#new_discussion_id').val(discussion);
			}
		}
		);
}

discuss.getAllDiscussions = function(){
	var data = {
		site: site.siteID()
	};

	gen.json(
		window.location.pathname + '/discuss/displayAllDiscussions/',
		data,
		function(data){
			discuss.allDiscussions = data.all_discussions;
			discuss.displayAllDiscussions();
		},
		"Loading..."
		);
}

discuss.displayAllDiscussions = function(){
	$('#allDicussions').html(discuss.allDiscussions);
	$('#allDiscussionsTable .pointer').each(
		function(){
			var row = $(this);
			var id = row.attr('id').split("_")[1];

			row
			.data("id", id)
			.click(function(){return discuss.displayCurrentDiscussion(id);});
		}
	)
	.droppable({
		hoverClass: 'droppableHover',
		tolerance: 'pointer',
		accept: '.todo',
		drop: discuss.dropAllDiscussions
	});
}

discuss.dropAllDiscussions = function(event, ui){
	var topic_id = event.target.id.split("_")[1];
	var todo_id = ui.draggable.attr('id').split("_")[1];
	discuss.assignRelatedToDo(topic_id, todo_id, null);
}

discuss.assignRelatedToDo = function(topic_id, todo_id, callback){
	var data = {
		site: site.siteID(),
		item: topic_id,
		todo: todo_id
	};

	gen.jsonPost(
		window.location.pathname + '/discuss/assignRelatedToDo/',
		data,
		function(data){
			if(callback != null)
				callback(data);
		}
		);
}

discuss.removeRelatedToDo = function(topic_id, todo_id, callback){
	var data = {
		site: site.siteID(),
		item: topic_id,
		todo: todo_id
	};

	gen.jsonPost(
		window.location.pathname + '/discuss/removeRelatedToDo/',
		data,
		function(data){
			if(callback != null)
				callback(data);
		}
		);
}

discuss.setupDroppables = function(){
	$('#currentDiscussion')
	.droppable({
		hoverClass: 'droppableHover',
		tolerance: 'pointer',
		accept: '.todo',
		drop: discuss.dropPostCurrentDiscussion
	});

	$('#newDiscussion')
	.droppable({
		hoverClass: 'droppableHover',
		tolerance: 'pointer',
		accept: '.todo',
		drop: discuss.dropPostNewDiscussion
	});
}

discuss.configureRelatedToDosTable = function(){
	$('#relatedToDosTable .relatedToDoDetailsLink').each(function(){
		var link = $(this);
		var id = link.attr('id').split('_')[1];
		link.data('id', id).click(todo.showToDoDetails);
	});

	$('#relatedFilesTable .relatedFileLink').each(function(){
		var link = $(this);
		var currHref = link.attr('href');
		link.attr('href', site.media_url+'/storage/'+site.url+'/'+currHref);
	});

	$('#relatedTodosCurrent .relatedToDoRemoveLink').each(function(){
		var link = $(this);
		var id = link.attr('id').split('_')[1];
		link.data('id', id).click(function(){discuss.removeRelatedToDo(discuss.current_topic, id, discuss.dropResponseCurrentDiscussion); return false;});
	});

	$('#relatedTodosNew .relatedToDoRemoveLink').each(function(){
		var link = $(this);
		var id = link.attr('id').split('_')[1];
		link.data('id', id).click(function(){discuss.removeRelatedToDo(discuss.current_topic, id, discuss.dropResponseNewDiscussion); return false;});
	});
}

discuss.dropPostCurrentDiscussion = function(event, ui){
	var topic_id = discuss.current_topic;
	var todo_id = ui.draggable.attr('id').split("_")[1];
	discuss.assignRelatedToDo(topic_id, todo_id, discuss.dropResponseCurrentDiscussion);

}

discuss.dropResponseCurrentDiscussion = function(data){
	$('#relatedTodosCurrent').empty().html(data.todos_table);
	discuss.configureRelatedToDosTable();
	$('#currentDiscussion').attr({scrollTop: 100000});
}

discuss.dropPostNewDiscussion = function(event, ui){
	var topic_id = discuss.current_topic;
	var todo_id = ui.draggable.attr('id').split("_")[1];
	discuss.assignRelatedToDo(topic_id, todo_id, discuss.dropResponseNewDiscussion);
}

discuss.dropResponseNewDiscussion = function(data){
	$('#relatedTodosNew').empty().html(data.todos_table);
	discuss.configureRelatedToDosTable();
	$('#newDiscussion').attr({scrollTop: 100000});
}

discuss.displayCurrentDiscussion = function(topic_id){
	gen.button('discussActionButton', 'Reply', discuss.addReplyToCurrentDiscussion, true);
	gen.button('discussCancelButton', 'Back', discuss.showAllDiscussions, false);

	discuss.current_topic = topic_id;

	gen.setHash('/Discuss/topic_'+topic_id);

	var data = {
		site: site.siteID(),
		id: topic_id
	};

	gen.json(
		window.location.pathname + '/discuss/displayCurrentDiscussion/',
		data,
		function(data){
			$('#topic_'+topic_id+' td').css('font-weight', '');
			$('#currentDiscussion')
			.html(data.current_discussion)
			.show()
			.attr({scrollTop: 0});
			$('#allDicussions').hide();
			$('#newDiscussion').hide();
			discuss.configureRelatedToDosTable();
		},
		"Loading..."
		);

	return false;
}

discuss.addReplyToCurrentDiscussion = function(){
	$('#currentDiscussionsTable').append('<tr><th>Reply</th><td class="formTable"><textarea id="reply_id" name="reply"></textarea></td></tr>');
	gen.button('discussActionButton', 'Save', discuss.saveReplyToCurrentDiscussion, false);
	$('#reply_id').focus().elastic({onResize: function(){gen.scrollWithTextarea('currentDiscussion');}});

	$('#currentDiscussion')
	.attr({
		scrollTop: 100000
	});
}

discuss.saveReplyToCurrentDiscussion = function(){
	var replyBox = $('#reply_id');

	if($.trim(replyBox.val()) == ""){
		replyBox.css({
			'border': '1px solid red'
		});
		return;
	}

	var data = {
		site: site.siteID(),
		body: replyBox.val(),
		topic: discuss.current_topic
	};

	gen.jsonPost(
		window.location.pathname + '/discuss/saveCurrentDiscussionReply/',
		data,
		function(data){
			var css = "";
			$('#currentDiscussionsTable tr:last').remove();
			if ($('#currentDiscussionsTable tr:last').attr('class') == "")
				css = "tableAltRow";

			var row = '<tr class="'+css+'"><th>'+data.author+'<br />'+data.created+'</th><td>'+data.body+'</td></tr>';
			$('#currentDiscussionsTable').append(row);
			gen.button('discussActionButton', 'Reply', discuss.addReplyToCurrentDiscussion, true);
			discuss.getAllDiscussions();
		}
		);
}



//END OF DISCUSS////////////////////////////////////////////////////////////////////////////////




