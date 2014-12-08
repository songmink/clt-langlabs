
// Record Flag: check if user has unuploaded recording before sending
var recordingFlag = false
$(document).ready(function(){
    // Information of user
    var userinfo = $("#recordTrigger").data('userinfo')

    //  Toggle for comments from posts
	$( "#posts" ).on( "click", ".chatlist", function(e) {
        if($(e.target).is('.fileLink')){
            return;}
        if($(e.target).is('.attachDIV')){
            // console.log($(e.target))
            return;}
		$(this).next().find('.comment').slideToggle( "fast" );
	});

    //  Trigger upload events
   $("#uploadTrigger").click(function() {
       $("#fileupload").trigger("click");
   })
	//  Toggle for attached files
	$( "#connectedDIV" ).on( "mouseenter", ".attachedFile, .attachedAudio", function() {
		$(this).find('.removeIcon').css("opacity",0.95);})
	             .on( "mouseleave", ".attachedFile", function() {
		$(this).find('.removeIcon').css("opacity",0.05);})
	$("#connectedDIV").on( "click", ".removeIcon", function() {
		$(this).closest('span').remove()

	});


    //***initialize the rich text editor********************************************************
       rteInit()
    // **initialize the recorder****************************************************************
       recorderInit()
       $("#CLTREC_container").hide("fast")
       var toggleFlag = 1
       $("#recordTrigger").click(function() {
           $("#CLTREC_container").toggle("fast")
           
           if(toggleFlag == 0){
              toggleFlag=1
              recordingFlag = false
              // console.log('executed')
              // console.log(recordingFlag)
           }else{
              recorderInit()
              toggleFlag=0
           }
            
       })
    //*************************jquery upload plugin*********************************************
	/*jslint unparam: true */
	/*global window, $ */
	function csrfSafeMethod(method) {
	    // these HTTP methods do not require CSRF protection
	    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
	}
	$(function () {
	    'use strict';
	    // Change this to the location of your server-side upload handler:
	    var url = '/upload/';
	    // var csrftoken = $.cookie('csrftoken');
	    var csrftoken=$("input[name=csrfmiddlewaretoken]").val()
	    $('#fileupload').fileupload({
	        url: url,
	        crossDomain: false,
	        beforeSend: function(xhr, settings) {
	            // if (!csrfSafeMethod(settings.type)) {
	                xhr.setRequestHeader("X-CSRFToken", csrftoken);
	            // }
	        },
	        dataType: 'json',
	        done: function (e, data) {
	            $.each(data.result.files, function (index, file) {
	                // $('<p/>').text(file.name).appendTo('#files');
	                // console.log(file)
	                var attFile='<span class="attachedFile" style="cursor:pointer;"><a class="fileLink text-muted" href='+ file.url +'  ><i class="icon-file-alt"></i> <span class="fileName">'+file.name+'</span></a> <small> <i class="icon-remove removeIcon" style="color:grey; opacity:0.01;"></i></small></span>'
	                $('#inputAttachments').append(attFile)
	            });
	        },
	        progressall: function (e, data) {
	            var progress = parseInt(data.loaded / data.total * 100, 10);
	            $('#progress .progress-bar').css({
	            	"transition": "width 0.65s",
	            	"width":'100%',
		            }
	            );
	            setTimeout(function(){$('#progress .progress-bar').css({
	            	"transition": "width 0s",
	            	"width":'0%',
		            })},1000);
	        }
	    }).prop('disabled', !$.support.fileInput)
	        .parent().addClass($.support.fileInput ? undefined : 'disabled');
	});
	// *******************************************************************

});

function rteInit()
    {
        tinymce.init({
            selector: "#postTextarea",
            inline: true,
            schema: 'html5',
            element_format: 'html',
            end_container_on_empty_block: true,
            skin : 'flat_design_tinymce',

            style_formats: [
            {title: 'Headers', items: [
                {title: 'Header 1', format: 'h1'},
                {title: 'Header 2', format: 'h2'},
                {title: 'Header 3', format: 'h3'},
                {title: 'Header 4', format: 'h4'},
                {title: 'Header 5', format: 'h5'},
                {title: 'Header 6', format: 'h6'}
            ]},

            {title: 'Font Sizes', items: [
                {title: 'Tiny text', inline: 'span', styles: {fontSize: '10px'}},
                {title: 'Small text', inline: 'span', styles: {fontSize: '13px'}},
                {title: 'Normal text', inline: 'span', styles: {fontSize: '15px'}},
                {title: 'Big text', inline: 'span', styles: {fontSize: '18px'}},
                {title: 'Huge text', inline: 'span', styles: {fontSize: '22px'}}
            ]},

            {title: 'Inline', items: [
                {title: 'Bold', icon: 'bold', format: 'bold'},
                {title: 'Italic', icon: 'italic', format: 'italic'},
                {title: 'Underline', icon: 'underline', format: 'underline'},
                {title: 'Strikethrough', icon: 'strikethrough', format: 'strikethrough'},
                {title: 'Superscript', icon: 'superscript', format: 'superscript'},
                {title: 'Subscript', icon: 'subscript', format: 'subscript'},
                {title: 'Code', icon: 'code', format: 'code'}
            ]},

            {title: 'Blocks', items: [
                {title: 'Paragraph', format: 'p'},
                {title: 'Blockquote', format: 'blockquote'},
                {title: 'Div', format: 'div'},
                {title: 'Pre', format: 'pre'}
            ]},

            {title: 'Alignment', items: [
                {title: 'Left', icon: 'alignleft', format: 'alignleft'},
                {title: 'Center', icon: 'aligncenter', format: 'aligncenter'},
                {title: 'Right', icon: 'alignright', format: 'alignright'},
                {title: 'Justify', icon: 'alignjustify', format: 'alignjustify'}
            ]}
        ],
            plugins: [ "link image emoticons textcolor" ],
            toolbar1: "insertfile undo redo | styleselect | forecolor backcolor emoticons | link image",
            image_advtab: true,
            forced_root_block: false,
            entity_encoding: 'raw',
            menubar: false
        }); 

    //RTE for comment
        // tinymce.init({
        //     selector: "div.commentBox",
        //     inline: true,
        //     skin : 'flat_design_tinymce',
        //     plugins: [
        //         "link image",
        //         "emoticons textcolor"
        //         ],
        //     toolbar: "undo redo | styleselect | forecolor backcolor emoticons | link image",
        //     menubar: false
        // }); 
    }
// *************************recorder**************************
var audioName = '';
var recorderID = 'recorder'
var recorderServer =  $("#recordTrigger").data('recorderserver')
var recorderHandler = $("#recordTrigger").data('recorderhandler')
var recorderDirectory = $("#recordTrigger").data('recorderdirectory')
var userinfo = $("#recordTrigger").data('userinfo')
var swfobjectURL =  $("#recordTrigger").data('swfurl')

function recorderInit(){

        var recMessageArray = new Array();
        recMessageArray[0] = "entering demo mode.";
        recMessageArray[1] = "Ready to go!";
        recMessageArray[2] = "Recording";
        recMessageArray[3] = "Stopped recording";
        recMessageArray[4] = "Stopped playing";
        recMessageArray[5] = "Moved to beginning";
        recMessageArray[6] = "Playing";
        recMessageArray[7] = "Starting to save";
        recMessageArray[8] = "hmm. nothing to save";
        recMessageArray[9] = "Truncating the file to 10 seconds";
        recMessageArray[10] = "Encoding to MP3";
        recMessageArray[11] = "...";
        recMessageArray[12] = "Encoding error";
        recMessageArray[13] = "Encode complete";
        recMessageArray[14] = "Uploading...";
        recMessageArray[15] = "Upload complete";
        recMessageArray[16] = "Pause recording";
        recMessageArray[17] = "Pause playing";      

        if (swfobject.hasFlashPlayerVersion("10")) {

            // check if SWF hasn't been removed, if this is the case, create a new alternative content container
            if ( $('#'+recorderID) ) swfobject.removeSWF( recorderID );     
            
            /**SWF Container: Bare Bones Recorder*/
            $('<div/>', { id: recorderID }).appendTo('#CLTREC_container');

            var d = new Date();
            var timestamp = d.getFullYear()+""
                            +(d.getMonth()+1)+""
                            +d.getDate()+""
                            +d.getHours()+""
                            +d.getMinutes()+""
                            +d.getSeconds()+""
            var att = {
                id          : recorderID,
                name        : recorderID,
                data        : swfobjectURL, 
                width       : "430", 
                height      : "180"
            };
            
            var barebones  = "myFilename="  + userinfo+"_"+timestamp;
                barebones += "&myServer="   + recorderServer;
                barebones += "&myHandler="  + recorderHandler;
                barebones += "&myDirectory="+ recorderDirectory;
                barebones += "&timeLimit="  + "30";
                barebones += "&showLink="   + "N";
                barebones += "&hideFlash"   + "Y";
            audioName = userinfo+"_"+timestamp
                        
            var params = { 
                flashvars   : barebones
            };                        
            // Now create the new (or reinitialized) scrubber
            swfobject.createSWF(att, params, recorderID);
        }
}

        function recorderMessage(x,y){
            switch(x){
                case 1:
                    recordingFlag = false; //no recording
                    break;
                case 2:
                    recordingFlag = true;  //there is recording
                    // console.log("case 2")
                    break;
                case 15:
                    // console.log("upload complete")
                    var attFile='<span class="attachedAudio" style="cursor:pointer;"><a class="audioLink text-muted" href='+ recorderServer+recorderDirectory+"/"+audioName+".mp3"+'  ><i class="icon-file-alt"></i> <span class="audioName">'+audioName+".mp3"+'</span></a> <small> <i class="icon-remove removeIcon" style="color:grey; opacity:0.01;"></i></small></span>'
                    $('#inputAttachments').append(attFile)
                    $( "#recordTrigger" ).trigger( "click" );
                    recordingFlag = false; //no recording pending
                    break;   
            };
        }
        
        function thisMovie(movieName) {
            if (navigator.appName.indexOf("Microsoft") != -1) {
                return window[movieName];
            } else {
                return document[movieName];
            }
        }
// ***********************************************












