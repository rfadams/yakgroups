var site = new Object();

site.id = null;
site.url = null;
site.media_url = null;
site.user = null;
site.settingsBox = "+";
site.settingsBoxDisplayed = false; //Primarily for a todo.toggleToDoListTut
site.new_site = null;

$(function(){
	//site.getSiteID();
	site.getAllSiteInfo();
	site.tabs = $('#tabs').tabs();

	$('#tabs').bind('tabsselect', function(event, ui) {
		var tabs = ['/Calendar', '/Discuss', '/Files']
		gen.setHash(tabs[ui.index]);
	});

	$('#settingsLink').toggle(site.toggleSettingsBoxDisplay, site.toggleSettingsBoxDisplay);
	//$('#settingsLink').wait(1700, "fx", site.toggleSettingsBoxDisplay);

	$('#stepsModal').dialog({
		autoOpen: false,
		resizable: false,
		modal: true,
		show: 'fold',
		hide: 'fold',
		closeOnEscape: false,
		draggable: false
	});

	site.setupStepsLinks();
});

site.getSiteID = function(){
	gen.json(
		window.location.pathname + '/site/getSiteID/',
		{},
		function(data){
			site.id = data.site
		}
		);
	return site.id;
}

site.siteID = function(){
	if(site.id == null)
		return site.getSiteID();
	else
		return site.id;
}

site.getAllSiteInfo = function(){
	gen.json(
		window.location.pathname + '/site/getAllSiteInfo/',
		{},
		function(data){
			site.id = data.site;
			site.url = data.url;
			site.media_url = data.media_url;
			site.user = data.user;
			discuss.loadData(data.discuss);
			site.loadSettingsBoxData(data.settings_box);
			files.loadData(data.files);
			gen.loadHash();
		}
		);
}

site.loadSettingsBoxData = function(data){
	if(data.show_settings){
		site.toggleSettingsBoxDisplay();
	}
	if(data.name_changed){
		$("#stepsTable th:nth-child(2)")
		.html("Step 2 (Done):")
		.css('text-decoration', 'line-through');
		$("#stepsTable td:nth-child(2)")
		.html('Site has been renamed');
	}
	if(!data.group_leader){
		$("#stepsTable")
		.html('<tr><th>Welcome to YakGroups!</th></tr><tr><td><a id="quickTourLink" href="">Quick 1-minute Tour of YakGroups</a><div class="stepsTableButton"><button id="stepsTableButton" type="button" class="ui-state-default">Done</button></div></td></tr>')
		.addClass('stepsTable2');

		$('#quickTourLink').click(site.loadQuickTour);

		$('#settingsBox').addClass('settingsBox2');
		
		$('#stepsTableButton').click(site.toggleSettingsBoxDisplay);

		$('#settingsLink').html('Help');
	}
	if(data.new_site){
		site.new_site = data.new_site;
	}
}

site.toggleSettingsBoxDisplay = function(){

	if(site.settingsBox == "+"){
		var boxPresent = false;
		site.settingsBoxDisplayed = true;
		todo.toggleToDoListTut("hide");
		$('#subHeader, #todoListHeader, #todoList, #vDivider, #tabs')
		.animate({
			top: site.settingsBox+'=300px'
		},"slow", function(){
			if(!boxPresent)
				$('#settingsBox').fadeIn(function(){if(site.new_site){site.loadAddGroupMembersForm();site.new_site=false}});
			boxPresent = true;
			site.settingsBox = "-";
		});
		$('#todoDetails')
			.animate({
				top: '410px'
			},"slow");
		$('#stepsTableButton').click(site.toggleSettingsBoxDisplay);
		
	}else{
		site.settingsBoxDisplayed = false;
		$('#settingsBox').fadeOut(function(){
				$('#subHeader, #todoListHeader, #todoList, #vDivider, #tabs')
				.animate({
					top: site.settingsBox+'=300px'
				},"slow");
				$('#todoDetails')
				.animate({
					top: '110px'
				},"slow", function(){
					todo.toggleToDoListTut("show");
					$('#settingsLink').animate({backgroundColor: '#FACC14'}, 500).animate({backgroundColor: 'white'}, 2500);
				});

				data = {
					site: site.siteID()
				};

				gen.json(
					window.location.pathname + '/members/disableShowSettingsBox/',
					data,
					function(data){}
				);


				site.settingsBox = "+";
		});
		
	}
}

site.setupStepsLinks = function(){
	$('#addGroupMembersLink').click(site.loadAddGroupMembersForm);
	$('#nameSiteLink').click(site.loadRenameSiteForm);
	$('#quickTourLink').click(site.loadQuickTour);
}

site.loadQuickTour = function(){
	data = {
		site: site.siteID()
	};

	gen.json(
		window.location.pathname + '/site/loadQuickTour/',
		data,
		function(data){
			$('#stepsModalContent').html(data.content);

			$('#stepsModal')
			.dialog('option',
			{
				title: 'Step 3: Quick Tour',
				height: 500,
				width: 600,
				buttons: {
					Close: function() {
						$(this).dialog('close');
					}
				}
			})
			.dialog('open');

		},
		'Loading...'
		);
	return false;
}

site.loadAddGroupMembersForm = function(){
	data = {
		site: site.siteID()
	};

	gen.json(
		window.location.pathname + '/members/addGroupMembers/',
		data,
		function(data){
			site.setupAddGroupMembersForm(data);

			$('#stepsModal')
			.dialog('option',
			{
				title: 'Step 1: Add Group Members',
				height: 400,
				width: 600,
				buttons: {
					'Add Group Members Later': function() {
						$(this).dialog('close');
					},
					'Save and Email New Members': function() {
						$('#submitType').val('saveSubmit');
						site.submitAddGroupMembersForm();
					}
				}
			})
			.dialog('open');
			
		},
		'Loading...'
		);
	return false;
}

site.setupAddGroupMembersForm = function(data){
	$('#stepsModalContent').html(data.form);
	$('#addGroupMembersForm').submit(site.submitAddGroupMembersForm);
	$('#addRowSubmit').click(function(){$('#submitType').val('addRowSubmit');site.submitAddGroupMembersForm();});
	$('#removeRowSubmit').click(function(){$('#submitType').val('removeRowSubmit');site.submitAddGroupMembersForm();});
}

site.submitAddGroupMembersForm = function(){
	var data = $('#addGroupMembersForm').serialize();

	gen.jsonPost(
		window.location.pathname + '/members/addGroupMembers/',
		data,
		function(data){
			
			if(data.s){
				$('#stepsModal').dialog('close');
				$("#stepsTable th:nth-child(1)")
				.html("Step 1 (Done):")
				.css('text-decoration', 'line-through');
			}else{
				site.setupAddGroupMembersForm(data);
			}
		});
	return false;
}

site.loadRenameSiteForm = function(){
	data = {
		site: site.siteID()
	};

	gen.json(
		window.location.pathname + '/site/renameSite/',
		data,
		function(data){
			$('#stepsModalContent').html(data.form);
			$('#renameSiteForm #id_name').keyup(site.updateRenameSiteForm).focus();

			$('#stepsModal')
			.dialog('option',
			{
				title: 'Step 2: Name your YakGroups Site',
				height: 300,
				width: 600,
				buttons: {
					'Rename Site Later': function() {
						$(this).dialog('close');
					},
					Save: function() {
						site.submitRenameSiteForm();
					}
				}
			})
			.dialog('open');
		},
		'Loading...'
		);
	return false;
}

site.submitRenameSiteForm = function(){
	$('submitType').val('save');
	var data = $('#renameSiteForm').serialize();

	gen.jsonPost(
		window.location.pathname + '/site/renameSite/',
		data,
		function(data){
			if(data.s){
				$('#stepsModal').dialog('close');

				$("#stepsTable th:nth-child(2)")
				.html("Step 2 (Done):")
				.css('text-decoration', 'line-through');
				$("#stepsTable td:nth-child(2)")
				.html('Site has been renamed');

				$('#groupTitleBar').html(data.title).fadeIn('slow');
			}else{
				$('#stepsModalContent').html(data.form);
				$('#renameSiteForm #id_name').keyup(site.updateRenameSiteForm);
				gen.restyleFormErrors(data);
			}
		});
	return false;
}

site.updateRenameSiteForm = function(){
	
	var re = /\W/;
	var val = $('#renameSiteForm #id_name').val();
	if(re.test(val)){
		$('#potentialSiteName > ul').remove();
		$('#potentialSiteName').prepend('<ul class="errorlist"><li>Only letters, numbers, and underscores allowed. No spaces.</li></ul>');
		$('#potentialSiteName #id_name').addClass('errorField');
	}else{
		$('#potentialSiteName > ul').remove();
		$('#potentialSiteName #id_name').removeClass('errorField');
	}
}



//END OF Site////////////////////////////////////////////////////////////////////////////////



