$(document).ready(function(){
    //  Toggle for comments from posts
	$( "#posts" ).on( "click", ".chatlist", function(e) {
        if($(e.target).is('.fileLink')){
            return;}
		$(this).next().find('.comment').slideToggle( "fast" );
	});

    //  Trigger upload events
   $("#uploadTrigger").click(function() {
       $("#fileupload").trigger("click");
   })
	//  Toggle for attached files
	$( "#connectedDIV" ).on( "mouseenter", ".attachedFile", function() {
		$(this).find('.removeIcon').css("opacity",0.95);})
	             .on( "mouseleave", ".attachedFile", function() {
		$(this).find('.removeIcon').css("opacity",0.05);})
	$("#connectedDIV").on( "click", ".removeIcon", function() {
		$(this).closest('span').remove()
	});
    //  initialize the rich text editor
	rteInit()
    
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
	                console.log(file)
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
//      visualblocks_default_state: true,
            plugins: [ "link image emoticons textcolor" ],
            toolbar1: "insertfile undo redo | styleselect | forecolor backcolor emoticons | link image",
            image_advtab: true,
            forced_root_block: false,
        //document_base_url: root_path,
        //content_css: 'editor.css',
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

