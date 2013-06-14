
var currentView = "4";
var aniComplete = true;

$(function(){
	//$('#contactInfoLink').attr('href', 'mailto:robert@yakgroups.com').html('robert@yakgroups.com');
	$('.promo')
	.mouseover(function(){
		$(this).addClass('promo-hover');
		var id = $(this).attr("id").split("_")[1];
		if(aniComplete && currentView != id){
			$('#bodyLeft_'+currentView)
			.fadeOut("slow", function(){
				$('#bodyLeft_'+currentView).fadeIn("fast");
				aniComplete = true;
			});
			$('#description_'+currentView)
			.fadeOut("slow", function(){
				$('#description_'+currentView).fadeIn("fast");
			});
			aniComplete = false;
		}
		currentView = id;
	})
	.mouseout(function(){
		$(this).removeClass('promo-hover');
		var id = "4";
		if(aniComplete && currentView != id){
			$('#bodyLeft_'+currentView)
			.fadeOut("slow", function(){
				$('#bodyLeft_'+currentView).fadeIn("fast");
				aniComplete = true;
			});
			$('#description_'+currentView)
			.fadeOut("slow", function(){
				$('#description_'+currentView).fadeIn("fast");
			});
			aniComplete = false;
		}
		currentView = id;
	});
});