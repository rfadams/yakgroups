var gen = new Object();

gen.removePermDisplay = true; //Determines if statusUpdateBar will display for 1-click and fade or remain through multiple clicks
gen.ajaxReceive = null;
gen.hashArray = null; //used to load pages with a hash value
gen.hashTabArray = null;


gen.ajaxSendMessage = 'Saving...';

$(function(){
	gen.setupAjaxErrorSuccess();
});

gen.json = function(url, data, funct, sendMsg){
	sendMsg = sendMsg || 'Saving...';

	data['time'] = (new Date()).getTime();

	gen.ajaxReceive = funct;
	gen.ajaxSendMessage = sendMsg;
	
	$.getJSON(url, data, funct);

	gen.ajaxSendMessage = 'Saving...';
}

gen.jsonPost = function(url, data, funct, sendMsg){
	sendMsg = sendMsg || 'Saving...';

	var time = (new Date()).getTime();

	gen.ajaxReceive = funct;
	gen.ajaxSendMessage = sendMsg;

	$.post(url+'?time='+time, data, funct, "json");

	gen.ajaxSendMessage = 'Saving...';
}

gen.setupAjaxErrorSuccess = function(){
	$('#statusUpdateBar').ajaxError(function(e, r, s){
		gen.removePermDisplay = false;
		gen.statusPermDisplay(
			'There was an error contacting the server... ',
			'Try again',
			function(){
				$.getJSON(
					s.url,
					function(data){
						gen.ajaxReceive(data);
						$('#statusUpdateBar').fadeOut('slow', gen.fadeInGroupTitleBar);
					});
			},
			'error'
			);
		gen.removePermDisplay = true;
		$(this).data('AjaxError',true);
	});

	$('#statusUpdateBar').ajaxSuccess(function(){
		if($(this).data('AjaxError') == true){
			$(this).fadeOut('slow', gen.fadeInGroupTitleBar).data('AjaxError', false);
		}
	});

	$('#ajaxStatus').ajaxSend(function(){
		$(this)
		.removeClass('ui-state-highlight')
		.addClass('ui-state-error')
		.html(gen.ajaxSendMessage)
		.show();
	});

	$('#ajaxStatus').ajaxError(function(){
		$(this)
		.fadeOut(1000);
	});

	$('#ajaxStatus').ajaxSuccess(function(){
		$(this)
		.addClass('ui-state-highlight')
		.removeClass('ui-state-error')
		.html('Success!')
		.wait(1000)
		.fadeOut('1000');
	});
}

gen.statusTempDisplay = function(message){
	var statusBar = $('#statusUpdateBar');

	if(arguments.length == 2){
		statusBar.addClass('ui-state-error');
	}else{
		statusBar.removeClass('ui-state-error');
	}

	gen.hideGroupTitleBar();

	statusBar
	.html(message)
	.show()
	.wait(5000)
	.fadeOut('slow', gen.fadeInGroupTitleBar);
}

gen.statusPermDisplay = function(message, linkText, linkFunct){
	var statusBar = $('#statusUpdateBar');
	var link = $('<a href="">'+linkText+'</a>').click(linkFunct);

	if(arguments.length == 4){
		statusBar.addClass('ui-state-error');
	}else{
		statusBar.removeClass('ui-state-error');
	}

	gen.hideGroupTitleBar();

	statusBar
	.html(message + ' ')
	.append(link)
	.show();

	if(gen.removePermDisplay){
		statusBar
		.click(function(){
			$(this).wait(5000).fadeOut('slow', gen.fadeInGroupTitleBar);return false;
		});
	}else{
		statusBar
		.click(function(){
			return false;
		});
	}
}

gen.fadeInGroupTitleBar = function(){
	$('#groupTitleBar').fadeIn();
}

gen.hideGroupTitleBar = function(){
	$('#groupTitleBar').hide();
}

gen.button = function(id, text, action, focus){
	var button = $('#'+id);
	
	button
	.unbind('click')
	.click(action);

	if(text!="")
		button
		.html(text);

//	if(focus){
//		button
//		.unbind('blur')
//		.addClass('ui-state-hover')
//		.focus()
//		.blur(function(){
//			$(this).removeClass('ui-state-hover');
//		});
//	}
	
	return button;
}

gen.restyleErrorForm = function(data){
	$.each(data.error_keys, function(i, item){
		$('#id_'+item)
		.css({
			'margin-top':'0',
			'border': '1px solid red'
		});
	});
}

gen.scrollWithTextarea = function(id){
	var window = $('#'+id);
	var scrollPos = window.attr('scrollTop');

	window.attr('scrollTop', (scrollPos+15));
}

gen.restyleFormErrors = function(data){
	$.each(data.errors, function(i, item){
		$('#id_'+item).addClass('errorField');
	});
}

gen.setHash = function(val){
	window.location.hash = val;
}

gen.loadHash = function(){

	gen.hashArray = window.location.hash.toLowerCase().split('/');
	gen.hashTabArray = gen.hashArray.slice().slice(2, gen.hashArray.length);

	if (gen.hashArray.length == 0 || gen.hashArray[0] == "")
		return;

	tabCalls = {
		calendar: null,
		discuss: discuss.loadHash,
		files: files.loadHash
	}

	tabCalls[gen.hashArray[1]]();

}



//END OF General////////////////////////////////////////////////////////////////////////////////



