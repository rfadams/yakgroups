(function($) {
	$.fn.ellipsis = function(enableUpdating){
		var s = document.documentElement.style;
		if (!('textOverflow' in s || 'OTextOverflow' in s)) {
			return this.each(function(){
				var el = $(this);
				if(el.css("overflow") == "hidden"){
					var originalText = el.html();
					var w = el.width();

					var t = $(this.cloneNode(true)).hide().css({
						'position': 'absolute',
						'width': 'auto',
						'overflow': 'visible',
						'max-width': 'inherit'
					});
					el.after(t);

					var text = originalText;
					while(text.length > 0 && t.width() > el.width()){
						text = text.substr(0, text.length - 1);
						t.html(text + "...");
					}
					el.html(t.html());

					t.remove();

					if(enableUpdating == true){
						var oldW = el.width();
						setInterval(function(){
							if(el.width() != oldW){
								oldW = el.width();
								el.html(originalText);
								el.ellipsis();
							}
						}, 200);
					}
				}
			});
		} else return this;
	}

	$.fn.wait = function(time, type, callback) {
		time = time || 1000;
		type = type || "fx";
		callback = callback || null;
		return this.queue(type, function() {
			var self = this;
			setTimeout(function() {
				if(callback != null)
					callback();
				$(self).dequeue();
			}, time);
		});
	}
})(jQuery);

//(function($){
//
//    $.fn.autoResize = function(options) {
//
//        // Just some abstracted details,
//        // to make plugin users happy:
//        var settings = $.extend({
//            onResize : function(){},
//            animate : true,
//            animateDuration : 150,
//            animateCallback : function(){},
//            extraSpace : 20,
//            limit: 1000
//        }, options);
//
//        // Only textarea's auto-resize:
//        this.filter('textarea').each(function(){
//
//                // Get rid of scrollbars and disable WebKit resizing:
//            var textarea = $(this).css({resize:'none','overflow-y':'hidden'}),
//
//                // Cache original height, for use later:
//                origHeight = textarea.height(),
//
//                // Need clone of textarea, hidden off screen:
//                clone = (function(){
//
//                    // Properties which may effect space taken up by chracters:
//                    var props = ['height','width','lineHeight','textDecoration','letterSpacing'],
//                        propOb = {};
//
//                    // Create object of styles to apply:
//                    $.each(props, function(i, prop){
//                        propOb[prop] = textarea.css(prop);
//                    });
//
//                    // Clone the actual textarea removing unique properties
//                    // and insert before original textarea:
//                    return textarea.clone().removeAttr('id').removeAttr('name').css({
//                        position: 'absolute',
//                        top: 0,
//                        left: -9999
//                    }).css(propOb).attr('tabIndex','-1').insertBefore(textarea);
//
//                })(),
//                lastScrollTop = null,
//                updateSize = function() {
//
//                    // Prepare the clone:
//                    clone.height(0).val($(this).val()).scrollTop(10000);
//
//                    // Find the height of text:
//                    var scrollTop = Math.max(clone.scrollTop(), origHeight) + settings.extraSpace,
//                        toChange = $(this).add(clone);
//
//                    // Don't do anything if scrollTip hasen't changed:
//                    if (lastScrollTop === scrollTop) { return; }
//                    lastScrollTop = scrollTop;
//
//                    // Check for limit:
//                    if ( scrollTop >= settings.limit ) {
//                        $(this).css('overflow-y','');
//                        return;
//                    }
//                    // Fire off callback:
//                    settings.onResize.call(this);
//
//                    // Either animate or directly apply height:
//                    settings.animate && textarea.css('display') === 'block' ?
//                        toChange.stop().animate({height:scrollTop}, settings.animateDuration, settings.animateCallback)
//                        : toChange.height(scrollTop);
//                };
//
//            // Bind namespaced handlers to appropriate events:
//            textarea
//                .unbind('.dynSiz')
//                .bind('keyup.dynSiz', updateSize)
//                .bind('keydown.dynSiz', updateSize)
//                .bind('change.dynSiz', updateSize);
//
//        });
//
//        // Chain:
//        return this;
//
//    };
//
//
//
//})(jQuery);


(function(jQuery){

	$.fn.elastic = function(options) {

//	jQuery.fn.extend({
//		elastic: function() {

			var settings = $.extend({
            onResize : function(){}
        }, options);

			//	We will create a div clone of the textarea
			//	by copying these attributes from the textarea to the div.
			var mimics = [
				'paddingTop',
				'paddingRight',
				'paddingBottom',
				'paddingLeft',
				'fontSize',
				'lineHeight',
				'fontFamily',
				'width',
				'fontWeight'];

			return this.each( function() {

				// Elastic only works on textareas
				if ( this.type != 'textarea' ) {
					return false;
				}

				var $textarea	=	jQuery(this),
					$twin		=	jQuery('<div />').css({'position': 'absolute','display':'none','word-wrap':'break-word'}),
					lineHeight	=	parseInt($textarea.css('line-height'),10) || parseInt($textarea.css('font-size'),'10'),
					minheight	=	parseInt($textarea.css('height'),10) || lineHeight*3,
					maxheight	=	parseInt($textarea.css('max-height'),10) || Number.MAX_VALUE,
					goalheight	=	0,
					i 			=	0;

				// Opera returns max-height of -1 if not set
				if (maxheight < 0) { maxheight = Number.MAX_VALUE; }

				// Append the twin to the DOM
				// We are going to meassure the height of this, not the textarea.
				$twin.appendTo($textarea.parent());

				// Copy the essential styles (mimics) from the textarea to the twin
				var i = mimics.length;
				while(i--){
					$twin.css(mimics[i].toString(),$textarea.css(mimics[i].toString()));
				}


				// Sets a given height and overflow state on the textarea
				function setHeightAndOverflow(height, overflow){
					curratedHeight = Math.floor(parseInt(height,10));
					if($textarea.height() != curratedHeight){
						$textarea.css({'height': curratedHeight + 'px','overflow':overflow});
						settings.onResize.call(this);
					}
				}


				// This function will update the height of the textarea if necessary
				function update() {

					// Get curated content from the textarea.
					var textareaContent = $textarea.val().replace(/&/g,'&amp;').replace(/  /g, '&nbsp;').replace(/<|>/g, '&gt;').replace(/\n/g, '<br />');

					var twinContent = $twin.html();

					if(textareaContent+'&nbsp;' != twinContent){

						// Add an extra white space so new rows are added when you are at the end of a row.
						$twin.html(textareaContent+'&nbsp;');

						// Change textarea height if twin plus the height of one line differs more than 3 pixel from textarea height
						if(Math.abs($twin.height()+lineHeight - $textarea.height()) > 3){

							var goalheight = $twin.height()+lineHeight;
							if(goalheight >= maxheight) {
								setHeightAndOverflow(maxheight,'auto');
							} else if(goalheight <= minheight) {
								setHeightAndOverflow(minheight,'hidden');
							} else {
								setHeightAndOverflow(goalheight,'hidden');
							}

						}

					}

				}

				// Hide scrollbars
				$textarea.css({'overflow':'hidden'});

				// Update textarea size on keyup
				$textarea.keyup(function(){ update(); });

				// And this line is to catch the browser paste event
				$textarea.live('input paste',function(e){ setTimeout( update, 250); });

				// Run update once when elastic is initialized
				update();

			});

//        }
//    });
	};
})(jQuery);

if(jQuery)(
	function(jQuery){
		jQuery.extend(jQuery.fn,{
			uploadify:function(options) {
				jQuery(this).each(function(){
					settings = jQuery.extend({
					id             : jQuery(this).attr('id'), // The ID of the object being Uploadified
					uploader       : 'uploadify.swf', // The path to the uploadify swf file
					script         : 'uploadify.php', // The path to the uploadify backend upload script
					expressInstall : null, // The path to the express install swf file
					folder         : '', // The path to the upload folder
					height         : 30, // The height of the flash button
					width          : 110, // The width of the flash button
					cancelImg      : 'cancel.png', // The path to the cancel image for the default file queue item container
					wmode          : 'opaque', // The wmode of the flash file
					scriptAccess   : 'sameDomain', // Set to "always" to allow script access across domains
					fileDataName   : 'Filedata', // The name of the file collection object in the backend upload script
					method         : 'POST', // The method for sending variables to the backend upload script
					queueSizeLimit : 999, // The maximum size of the file queue
					simUploadLimit : 1, // The number of simultaneous uploads allowed
					queueID        : false, // The optional ID of the queue container
					displayData    : 'percentage', // Set to "speed" to show the upload speed in the default queue item
					onInit         : function() {}, // Function to run when uploadify is initialized
					onSelect       : function() {}, // Function to run when a file is selected
					onQueueFull    : function() {}, // Function to run when the queue reaches capacity
					onCheck        : function() {}, // Function to run when script checks for duplicate files on the server
					onCancel       : function() {}, // Function to run when an item is cleared from the queue
					onError        : function() {}, // Function to run when an upload item returns an error
					onProgress     : function() {}, // Function to run each time the upload progress is updated
					onComplete     : function() {}, // Function to run when an upload is completed
					onAllComplete  : function() {}  // Functino to run when all uploads are completed
				}, options);
				var pagePath = location.pathname;
				pagePath = pagePath.split('/');
				pagePath.pop();
				pagePath = pagePath.join('/') + '/';
				var data = {};
				data.uploadifyID = settings.id;
				data.pagepath = pagePath;
				if (settings.buttonImg) data.buttonImg = escape(settings.buttonImg);
				if (settings.buttonText) data.buttonText = escape(settings.buttonText);
				if (settings.rollover) data.rollover = true;
				data.script = settings.script;
				data.folder = escape(settings.folder);
				if (settings.scriptData) {
					var scriptDataString = '';
					for (var name in settings.scriptData) {
						scriptDataString += '&' + name + '=' + settings.scriptData[name];
					}
					data.scriptData = escape(scriptDataString.substr(1));
				}
				data.width          = settings.width;
				data.height         = settings.height;
				data.wmode          = settings.wmode;
				data.method         = settings.method;
				data.queueSizeLimit = settings.queueSizeLimit;
				data.simUploadLimit = settings.simUploadLimit;
				if (settings.hideButton)   data.hideButton   = true;
				if (settings.fileDesc)     data.fileDesc     = settings.fileDesc;
				if (settings.fileExt)      data.fileExt      = settings.fileExt;
				if (settings.multi)        data.multi        = true;
				if (settings.auto)         data.auto         = true;
				if (settings.sizeLimit)    data.sizeLimit    = settings.sizeLimit;
				if (settings.checkScript)  data.checkScript  = settings.checkScript;
				if (settings.fileDataName) data.fileDataName = settings.fileDataName;
				if (settings.queueID)      data.queueID      = settings.queueID;
				if (settings.onInit() !== false) {
					jQuery(this).css('display','none');
					jQuery(this).after('<div id="' + jQuery(this).attr('id') + 'Uploader"></div>');
					swfobject.embedSWF(settings.uploader, settings.id + 'Uploader', settings.width, settings.height, '9.0.24', settings.expressInstall, data, {'quality':'high','wmode':settings.wmode,'allowScriptAccess':settings.scriptAccess});
					if (settings.queueID == false) {
						jQuery("#" + jQuery(this).attr('id') + "Uploader").after('<div id="' + jQuery(this).attr('id') + 'Queue" class="uploadifyQueue"></div>');
					}
				}
				if (typeof(settings.onOpen) == 'function') {
					jQuery(this).bind("uploadifyOpen", settings.onOpen);
				}
				jQuery(this).bind("uploadifySelect", {'action': settings.onSelect, 'queueID': settings.queueID}, function(event, ID, fileObj) {
					if (event.data.action(event, ID, fileObj) !== false) {
						var byteSize = Math.round(fileObj.size / 1024 * 100) * .01;
						var suffix = 'KB';
						if (byteSize > 1000) {
							byteSize = Math.round(byteSize *.001 * 100) * .01;
							suffix = 'MB';
						}
						var sizeParts = byteSize.toString().split('.');
						if (sizeParts.length > 1) {
							byteSize = sizeParts[0] + '.' + sizeParts[1].substr(0,2);
						} else {
							byteSize = sizeParts[0];
						}
						if (fileObj.name.length > 20) {
							fileName = fileObj.name.substr(0,20) + '...';
						} else {
							fileName = fileObj.name;
						}
						queue = '#' + jQuery(this).attr('id') + 'Queue';
						if (event.data.queueID) {
							queue = '#' + event.data.queueID;
						}
						jQuery(queue).append('<div id="' + jQuery(this).attr('id') + ID + '" class="uploadifyQueueItem">\
								<div class="cancel">\
									<a href="javascript:jQuery(\'#' + jQuery(this).attr('id') + '\').uploadifyCancel(\'' + ID + '\')"><img src="' + settings.cancelImg + '" border="0" /></a>\
								</div>\
								<span class="fileName">' + fileName + ' (' + byteSize + suffix + ')</span><span class="percentage"></span>\
								<div class="uploadifyProgress">\
									<div id="' + jQuery(this).attr('id') + ID + 'ProgressBar" class="uploadifyProgressBar"><!--Progress Bar--></div>\
								</div>\
							</div>');
					}
				});
				if (typeof(settings.onSelectOnce) == 'function') {
					jQuery(this).bind("uploadifySelectOnce", settings.onSelectOnce);
				}
				jQuery(this).bind("uploadifyQueueFull", {'action': settings.onQueueFull}, function(event, queueSizeLimit) {
					if (event.data.action(event, queueSizeLimit) !== false) {
						alert('The queue is full.  The max size is ' + queueSizeLimit + '.');
					}
				});
				jQuery(this).bind("uploadifyCheckExist", {'action': settings.onCheck}, function(event, checkScript, fileQueueObj, folder, single) {
					var postData = new Object();
					postData = fileQueueObj;
					postData.folder = pagePath + folder;
					if (single) {
						for (var ID in fileQueueObj) {
							var singleFileID = ID;
						}
					}
					jQuery.post(checkScript, postData, function(data) {
						for(var key in data) {
							if (event.data.action(event, checkScript, fileQueueObj, folder, single) !== false) {
								var replaceFile = confirm("Do you want to replace the file " + data[key] + "?");
								if (!replaceFile) {
									document.getElementById(jQuery(event.target).attr('id') + 'Uploader').cancelFileUpload(key, true,true);
								}
							}
						}
						if (single) {
							document.getElementById(jQuery(event.target).attr('id') + 'Uploader').startFileUpload(singleFileID, true);
						} else {
							document.getElementById(jQuery(event.target).attr('id') + 'Uploader').startFileUpload(null, true);
						}
					}, "json");
				});
				jQuery(this).bind("uploadifyCancel", {'action': settings.onCancel}, function(event, ID, fileObj, data, clearFast) {
					if (event.data.action(event, ID, fileObj, data, clearFast) !== false) {
						var fadeSpeed = (clearFast == true) ? 0 : 250;
						jQuery("#" + jQuery(this).attr('id') + ID).fadeOut(fadeSpeed, function() { jQuery(this).remove() });
					}
				});
				if (typeof(settings.onClearQueue) == 'function') {
					jQuery(this).bind("uploadifyClearQueue", settings.onClearQueue);
				}
				var errorArray = [];
				jQuery(this).bind("uploadifyError", {'action': settings.onError}, function(event, ID, fileObj, errorObj) {
					if (event.data.action(event, ID, fileObj, errorObj) !== false) {
						var fileArray = new Array(ID, fileObj, errorObj);
						errorArray.push(fileArray);
						jQuery("#" + jQuery(this).attr('id') + ID + " .percentage").text(" - " + errorObj.type + " Error");
						jQuery("#" + jQuery(this).attr('id') + ID).addClass('uploadifyError');
					}
				});
				jQuery(this).bind("uploadifyProgress", {'action': settings.onProgress, 'toDisplay': settings.displayData}, function(event, ID, fileObj, data) {
					if (event.data.action(event, ID, fileObj, data) !== false) {
						jQuery("#" + jQuery(this).attr('id') + ID + "ProgressBar").css('width', data.percentage + '%');
						if (event.data.toDisplay == 'percentage') displayData = ' - ' + data.percentage + '%';
						if (event.data.toDisplay == 'speed') displayData = ' - ' + data.speed + 'KB/s';
						if (event.data.toDisplay == null) displayData = ' ';
						jQuery("#" + jQuery(this).attr('id') + ID + " .percentage").text(displayData);
					}
				});
				jQuery(this).bind("uploadifyComplete", {'action': settings.onComplete}, function(event, ID, fileObj, response, data) {
					if (event.data.action(event, ID, fileObj, unescape(response), data) !== false) {
						jQuery("#" + jQuery(this).attr('id') + ID + " .percentage").text(' - Completed');
						jQuery("#" + jQuery(this).attr('id') + ID).fadeOut(250, function() { jQuery(this).remove()});
					}
				});
				if (typeof(settings.onAllComplete) == 'function') {
					jQuery(this).bind("uploadifyAllComplete", {'action': settings.onAllComplete}, function(event, uploadObj) {
						if (event.data.action(event, uploadObj) !== false) {
							errorArray = [];
						}
					});
				}
			});
		},
		uploadifySettings:function(settingName, settingValue, resetObject) {
			var returnValue = false;
			jQuery(this).each(function() {
				if (settingName == 'scriptData' && settingValue != null) {
					if (resetObject) {
						var scriptData = settingValue;
					} else {
						var scriptData = jQuery.extend(settings.scriptData, settingValue);
					}
					var scriptDataString = '';
					for (var name in scriptData) {
						scriptDataString += '&' + name + '=' + escape(scriptData[name]);
					}
					settingValue = scriptDataString.substr(1);
				}
				returnValue = document.getElementById(jQuery(this).attr('id') + 'Uploader').updateSettings(settingName, settingValue);
			});
			if (settingValue == null) {
				if (settingName == 'scriptData') {
					var returnSplit = unescape(returnValue).split('&');
					var returnObj   = new Object();
					for (var i = 0; i < returnSplit.length; i++) {
						var iSplit = returnSplit[i].split('=');
						returnObj[iSplit[0]] = iSplit[1];
					}
					returnValue = returnObj;
				}
				return returnValue;
			}
		},
		uploadifyUpload:function(ID) {
			jQuery(this).each(function() {
				document.getElementById(jQuery(this).attr('id') + 'Uploader').startFileUpload(ID, false);
			});
		},
		uploadifyCancel:function(ID) {
			jQuery(this).each(function() {
				document.getElementById(jQuery(this).attr('id') + 'Uploader').cancelFileUpload(ID, true, false);
			});
		},
		uploadifyClearQueue:function() {
			jQuery(this).each(function() {
				document.getElementById(jQuery(this).attr('id') + 'Uploader').clearFileUploadQueue(false);
			});
		}
	})
})(jQuery);

var swfobject=function(){var D="undefined",r="object",S="Shockwave Flash",W="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",R="SWFObjectExprInst",x="onreadystatechange",O=window,j=document,t=navigator,T=false,U=[h],o=[],N=[],I=[],l,Q,E,B,J=false,a=false,n,G,m=true,M=function(){var aa=typeof j.getElementById!=D&&typeof j.getElementsByTagName!=D&&typeof j.createElement!=D,ah=t.userAgent.toLowerCase(),Y=t.platform.toLowerCase(),ae=Y?/win/.test(Y):/win/.test(ah),ac=Y?/mac/.test(Y):/mac/.test(ah),af=/webkit/.test(ah)?parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,X=!+"\v1",ag=[0,0,0],ab=null;if(typeof t.plugins!=D&&typeof t.plugins[S]==r){ab=t.plugins[S].description;if(ab&&!(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&!t.mimeTypes[q].enabledPlugin)){T=true;X=false;ab=ab.replace(/^.*\s+(\S+\s+\S+$)/,"$1");ag[0]=parseInt(ab.replace(/^(.*)\..*$/,"$1"),10);ag[1]=parseInt(ab.replace(/^.*\.(.*)\s.*$/,"$1"),10);ag[2]=/[a-zA-Z]/.test(ab)?parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/,"$1"),10):0}}else{if(typeof O.ActiveXObject!=D){try{var ad=new ActiveXObject(W);if(ad){ab=ad.GetVariable("$version");if(ab){X=true;ab=ab.split(" ")[1].split(",");ag=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}}catch(Z){}}}return{w3:aa,pv:ag,wk:af,ie:X,win:ae,mac:ac}}(),k=function(){if(!M.w3){return}if((typeof j.readyState!=D&&j.readyState=="complete")||(typeof j.readyState==D&&(j.getElementsByTagName("body")[0]||j.body))){f()}if(!J){if(typeof j.addEventListener!=D){j.addEventListener("DOMContentLoaded",f,false)}if(M.ie&&M.win){j.attachEvent(x,function(){if(j.readyState=="complete"){j.detachEvent(x,arguments.callee);f()}});if(O==top){(function(){if(J){return}try{j.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee,0);return}f()})()}}if(M.wk){(function(){if(J){return}if(!/loaded|complete/.test(j.readyState)){setTimeout(arguments.callee,0);return}f()})()}s(f)}}();function f(){if(J){return}try{var Z=j.getElementsByTagName("body")[0].appendChild(C("span"));Z.parentNode.removeChild(Z)}catch(aa){return}J=true;var X=U.length;for(var Y=0;Y<X;Y++){U[Y]()}}function K(X){if(J){X()}else{U[U.length]=X}}function s(Y){if(typeof O.addEventListener!=D){O.addEventListener("load",Y,false)}else{if(typeof j.addEventListener!=D){j.addEventListener("load",Y,false)}else{if(typeof O.attachEvent!=D){i(O,"onload",Y)}else{if(typeof O.onload=="function"){var X=O.onload;O.onload=function(){X();Y()}}else{O.onload=Y}}}}}function h(){if(T){V()}else{H()}}function V(){var X=j.getElementsByTagName("body")[0];var aa=C(r);aa.setAttribute("type",q);var Z=X.appendChild(aa);if(Z){var Y=0;(function(){if(typeof Z.GetVariable!=D){var ab=Z.GetVariable("$version");if(ab){ab=ab.split(" ")[1].split(",");M.pv=[parseInt(ab[0],10),parseInt(ab[1],10),parseInt(ab[2],10)]}}else{if(Y<10){Y++;setTimeout(arguments.callee,10);return}}X.removeChild(aa);Z=null;H()})()}else{H()}}function H(){var ag=o.length;if(ag>0){for(var af=0;af<ag;af++){var Y=o[af].id;var ab=o[af].callbackFn;var aa={success:false,id:Y};if(M.pv[0]>0){var ae=c(Y);if(ae){if(F(o[af].swfVersion)&&!(M.wk&&M.wk<312)){w(Y,true);if(ab){aa.success=true;aa.ref=z(Y);ab(aa)}}else{if(o[af].expressInstall&&A()){var ai={};ai.data=o[af].expressInstall;ai.width=ae.getAttribute("width")||"0";ai.height=ae.getAttribute("height")||"0";if(ae.getAttribute("class")){ai.styleclass=ae.getAttribute("class")}if(ae.getAttribute("align")){ai.align=ae.getAttribute("align")}var ah={};var X=ae.getElementsByTagName("param");var ac=X.length;for(var ad=0;ad<ac;ad++){if(X[ad].getAttribute("name").toLowerCase()!="movie"){ah[X[ad].getAttribute("name")]=X[ad].getAttribute("value")}}P(ai,ah,Y,ab)}else{p(ae);if(ab){ab(aa)}}}}}else{w(Y,true);if(ab){var Z=z(Y);if(Z&&typeof Z.SetVariable!=D){aa.success=true;aa.ref=Z}ab(aa)}}}}}function z(aa){var X=null;var Y=c(aa);if(Y&&Y.nodeName=="OBJECT"){if(typeof Y.SetVariable!=D){X=Y}else{var Z=Y.getElementsByTagName(r)[0];if(Z){X=Z}}}return X}function A(){return !a&&F("6.0.65")&&(M.win||M.mac)&&!(M.wk&&M.wk<312)}function P(aa,ab,X,Z){a=true;E=Z||null;B={success:false,id:X};var ae=c(X);if(ae){if(ae.nodeName=="OBJECT"){l=g(ae);Q=null}else{l=ae;Q=X}aa.id=R;if(typeof aa.width==D||(!/%$/.test(aa.width)&&parseInt(aa.width,10)<310)){aa.width="310"}if(typeof aa.height==D||(!/%$/.test(aa.height)&&parseInt(aa.height,10)<137)){aa.height="137"}j.title=j.title.slice(0,47)+" - Flash Player Installation";var ad=M.ie&&M.win?"ActiveX":"PlugIn",ac="MMredirectURL="+O.location.toString().replace(/&/g,"%26")+"&MMplayerType="+ad+"&MMdoctitle="+j.title;if(typeof ab.flashvars!=D){ab.flashvars+="&"+ac}else{ab.flashvars=ac}if(M.ie&&M.win&&ae.readyState!=4){var Y=C("div");X+="SWFObjectNew";Y.setAttribute("id",X);ae.parentNode.insertBefore(Y,ae);ae.style.display="none";(function(){if(ae.readyState==4){ae.parentNode.removeChild(ae)}else{setTimeout(arguments.callee,10)}})()}u(aa,ab,X)}}function p(Y){if(M.ie&&M.win&&Y.readyState!=4){var X=C("div");Y.parentNode.insertBefore(X,Y);X.parentNode.replaceChild(g(Y),X);Y.style.display="none";(function(){if(Y.readyState==4){Y.parentNode.removeChild(Y)}else{setTimeout(arguments.callee,10)}})()}else{Y.parentNode.replaceChild(g(Y),Y)}}function g(ab){var aa=C("div");if(M.win&&M.ie){aa.innerHTML=ab.innerHTML}else{var Y=ab.getElementsByTagName(r)[0];if(Y){var ad=Y.childNodes;if(ad){var X=ad.length;for(var Z=0;Z<X;Z++){if(!(ad[Z].nodeType==1&&ad[Z].nodeName=="PARAM")&&!(ad[Z].nodeType==8)){aa.appendChild(ad[Z].cloneNode(true))}}}}}return aa}function u(ai,ag,Y){var X,aa=c(Y);if(M.wk&&M.wk<312){return X}if(aa){if(typeof ai.id==D){ai.id=Y}if(M.ie&&M.win){var ah="";for(var ae in ai){if(ai[ae]!=Object.prototype[ae]){if(ae.toLowerCase()=="data"){ag.movie=ai[ae]}else{if(ae.toLowerCase()=="styleclass"){ah+=' class="'+ai[ae]+'"'}else{if(ae.toLowerCase()!="classid"){ah+=" "+ae+'="'+ai[ae]+'"'}}}}}var af="";for(var ad in ag){if(ag[ad]!=Object.prototype[ad]){af+='<param name="'+ad+'" value="'+ag[ad]+'" />'}}aa.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+ah+">"+af+"</object>";N[N.length]=ai.id;X=c(ai.id)}else{var Z=C(r);Z.setAttribute("type",q);for(var ac in ai){if(ai[ac]!=Object.prototype[ac]){if(ac.toLowerCase()=="styleclass"){Z.setAttribute("class",ai[ac])}else{if(ac.toLowerCase()!="classid"){Z.setAttribute(ac,ai[ac])}}}}for(var ab in ag){if(ag[ab]!=Object.prototype[ab]&&ab.toLowerCase()!="movie"){e(Z,ab,ag[ab])}}aa.parentNode.replaceChild(Z,aa);X=Z}}return X}function e(Z,X,Y){var aa=C("param");aa.setAttribute("name",X);aa.setAttribute("value",Y);Z.appendChild(aa)}function y(Y){var X=c(Y);if(X&&X.nodeName=="OBJECT"){if(M.ie&&M.win){X.style.display="none";(function(){if(X.readyState==4){b(Y)}else{setTimeout(arguments.callee,10)}})()}else{X.parentNode.removeChild(X)}}}function b(Z){var Y=c(Z);if(Y){for(var X in Y){if(typeof Y[X]=="function"){Y[X]=null}}Y.parentNode.removeChild(Y)}}function c(Z){var X=null;try{X=j.getElementById(Z)}catch(Y){}return X}function C(X){return j.createElement(X)}function i(Z,X,Y){Z.attachEvent(X,Y);I[I.length]=[Z,X,Y]}function F(Z){var Y=M.pv,X=Z.split(".");X[0]=parseInt(X[0],10);X[1]=parseInt(X[1],10)||0;X[2]=parseInt(X[2],10)||0;return(Y[0]>X[0]||(Y[0]==X[0]&&Y[1]>X[1])||(Y[0]==X[0]&&Y[1]==X[1]&&Y[2]>=X[2]))?true:false}function v(ac,Y,ad,ab){if(M.ie&&M.mac){return}var aa=j.getElementsByTagName("head")[0];if(!aa){return}var X=(ad&&typeof ad=="string")?ad:"screen";if(ab){n=null;G=null}if(!n||G!=X){var Z=C("style");Z.setAttribute("type","text/css");Z.setAttribute("media",X);n=aa.appendChild(Z);if(M.ie&&M.win&&typeof j.styleSheets!=D&&j.styleSheets.length>0){n=j.styleSheets[j.styleSheets.length-1]}G=X}if(M.ie&&M.win){if(n&&typeof n.addRule==r){n.addRule(ac,Y)}}else{if(n&&typeof j.createTextNode!=D){n.appendChild(j.createTextNode(ac+" {"+Y+"}"))}}}function w(Z,X){if(!m){return}var Y=X?"visible":"hidden";if(J&&c(Z)){c(Z).style.visibility=Y}else{v("#"+Z,"visibility:"+Y)}}function L(Y){var Z=/[\\\"<>\.;]/;var X=Z.exec(Y)!=null;return X&&typeof encodeURIComponent!=D?encodeURIComponent(Y):Y}var d=function(){if(M.ie&&M.win){window.attachEvent("onunload",function(){var ac=I.length;for(var ab=0;ab<ac;ab++){I[ab][0].detachEvent(I[ab][1],I[ab][2])}var Z=N.length;for(var aa=0;aa<Z;aa++){y(N[aa])}for(var Y in M){M[Y]=null}M=null;for(var X in swfobject){swfobject[X]=null}swfobject=null})}}();return{registerObject:function(ab,X,aa,Z){if(M.w3&&ab&&X){var Y={};Y.id=ab;Y.swfVersion=X;Y.expressInstall=aa;Y.callbackFn=Z;o[o.length]=Y;w(ab,false)}else{if(Z){Z({success:false,id:ab})}}},getObjectById:function(X){if(M.w3){return z(X)}},embedSWF:function(ab,ah,ae,ag,Y,aa,Z,ad,af,ac){var X={success:false,id:ah};if(M.w3&&!(M.wk&&M.wk<312)&&ab&&ah&&ae&&ag&&Y){w(ah,false);K(function(){ae+="";ag+="";var aj={};if(af&&typeof af===r){for(var al in af){aj[al]=af[al]}}aj.data=ab;aj.width=ae;aj.height=ag;var am={};if(ad&&typeof ad===r){for(var ak in ad){am[ak]=ad[ak]}}if(Z&&typeof Z===r){for(var ai in Z){if(typeof am.flashvars!=D){am.flashvars+="&"+ai+"="+Z[ai]}else{am.flashvars=ai+"="+Z[ai]}}}if(F(Y)){var an=u(aj,am,ah);if(aj.id==ah){w(ah,true)}X.success=true;X.ref=an}else{if(aa&&A()){aj.data=aa;P(aj,am,ah,ac);return}else{w(ah,true)}}if(ac){ac(X)}})}else{if(ac){ac(X)}}},switchOffAutoHideShow:function(){m=false},ua:M,getFlashPlayerVersion:function(){return{major:M.pv[0],minor:M.pv[1],release:M.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(Z,Y,X){if(M.w3){return u(Z,Y,X)}else{return undefined}},showExpressInstall:function(Z,aa,X,Y){if(M.w3&&A()){P(Z,aa,X,Y)}},removeSWF:function(X){if(M.w3){y(X)}},createCSS:function(aa,Z,Y,X){if(M.w3){v(aa,Z,Y,X)}},addDomLoadEvent:K,addLoadEvent:s,getQueryParamValue:function(aa){var Z=j.location.search||j.location.hash;if(Z){if(/\?/.test(Z)){Z=Z.split("?")[1]}if(aa==null){return L(Z)}var Y=Z.split("&");for(var X=0;X<Y.length;X++){if(Y[X].substring(0,Y[X].indexOf("="))==aa){return L(Y[X].substring((Y[X].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var X=c(R);if(X&&l){X.parentNode.replaceChild(l,X);if(Q){w(Q,true);if(M.ie&&M.win){l.style.display="block"}}if(E){E(B)}}a=false}}}}();

//END OF plugins////////////////////////////////////////////////////////////////////////////////



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


