var files = new Object();


//$(function(){
//
//});

files.loadData = function(data){
	files.displayAllFiles(data);
	gen.button('filesActionButton', 'Refresh', files.getAllFiles, false);

	$("#uploadify").uploadify({
		'uploader': '/static/js/uploadify.swf',
		'script': 'http://'+window.location.host+'/'+site.url+'/files/fileUploads/',
		'cancelImg': site.media_url+'/images/cancel.png',
		'folder': '/static/storage',
		'queueID': 'uploadifyQueue',
		'auto': true,
		'multi': true,
		'scriptAccess': 'always',
		'buttonText': 'Upload File(s)',
		'scriptData': {'user': site.user},
		//'onInit': function(){$('#uploadifyUploader').attr('title', 'Select multiple files at once to upload');},
		'onSelectOnce': function(e, data){$('#filesTut').hide(); $('#uploadifyQueue').show();},
		'onAllComplete': function(e, data){$('#uploadifyQueue').hide(); $('#filesTut').show(); files.getAllFiles();}
	});

	$('#uploadifyUploader').attr('title', 'Select multiple files at once to upload').css('cursor', 'pointer');
}

files.loadHash = function(){
	site.tabs.tabs('select', 2);
}

files.getAllFiles = function(){
	var data = {
		site: site.siteID()
	};

	gen.json(
		window.location.pathname + '/files/displayAllFiles/',
		data,
		function(data){
			files.displayAllFiles(data);
		},
		"Loading..."
		);
}

files.displayAllFiles = function(data){
	$('#allFilesTable').replaceWith(data.all_files);
	$('#allFilesTable .pointer a').each(
		function(){
			var original = $(this);
			var url = original.attr('href');
			var row = original.parent().parent();
			row.click(function(){window.open(url);});
			original.click(function(){row.click(); return false;})

			row.droppable({
				hoverClass: 'droppableHover',
				tolerance: 'pointer',
				accept: '.todo',
				drop: files.dropAllFiles
			});

		}
	);
}

files.dropAllFiles = function(event, ui){
	var file_id = event.target.id.split("_")[1];
	var todo_id = ui.draggable.attr('id').split("_")[1];
	files.assignRelatedToDo(file_id, todo_id, null);
}

files.assignRelatedToDo = function(file_id, todo_id, callback){
	var data = {
		site: site.siteID(),
		item: file_id,
		todo: todo_id
	};

	gen.jsonPost(
		window.location.pathname + '/files/assignRelatedToDo/',
		data,
		function(data){
			if(callback != null)
				callback(data);
		}
		);
}


//END OF FILES////////////////////////////////////////////////////////////////////////////////


