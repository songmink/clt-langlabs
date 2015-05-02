// modules.js

//= requires utils.js
//= requires

//
// ActivityPermissionsAdmin:
//   this module handles permission changes done by an instructor
//
(function(){

    var s; // cache
    ActivityPermissionsAdmin = {

        /***[ module settings ]***/
        settings: {
            activity_type: $('#activityType').val(),
            activity_id: $('#activity_admin').data('activityid'),
            ajax_url: $('#activity_admin').data('ajaxurl'),
            csrftoken: $('input[name=csrfmiddlewaretoken]').val(),
            activity_memb_toggle: $('.control_togg'),
            user_perm_toggle: $('.perm_togg'),
            user_perm_column_toggle: $('.column_togg'),
            activity_admin_toggle: $('.activity_admin_togg'),
            activity_admin_div: $('#activity_admin_div'),
        },

        init: function() {
            s = this.settings;
            this.bindUIActions();
        },

        bindUIActions: function() {
            s.activity_admin_toggle.click(ActivityPermissionsAdmin.toggleActivityAdminDiv);
            s.activity_memb_toggle.click(ActivityPermissionsAdmin.updateActivityPermissionControl);
            s.activity_memb_toggle.tooltip();
            s.user_perm_toggle.click(ActivityPermissionsAdmin.updateUserPermission);
            s.user_perm_column_toggle.click(ActivityPermissionsAdmin.userPermColumnToggle);
        },

        /***[ module functions ]***/
        // toggles activity admin div
        toggleActivityAdminDiv: function() {
            s.activity_admin_div.toggle(20);
        },

        // changes this activitiy's activity permission control
        updateActivityPermissionControl: function() {
            var data = {
                codename: "no permission",
                object_username: "no user",
                object_type: s.activity_type,
                object_id: s.activity_id
            };
            if (s.activity_memb_toggle.hasClass('fa-toggle-on')){
                data.operation_type = "disable_control";
                Ajax.post(s.ajax_url, data, s.csrftoken, function() {
                    s.activity_memb_toggle.removeClass('fa-toggle-on text-primary');
                    s.activity_memb_toggle.addClass('fa-toggle-off text-muted');
                    s.activity_memb_toggle.attr('title', 'toggle on and select the students who will have permission to view this activity').tooltip('fixTitle');
                });
            }else {
                data.operation_type = "enable_control";
                Ajax.post(s.ajax_url, data, s.csrftoken, function() {
                    s.activity_memb_toggle.removeClass('fa-toggle-off text-muted');
                    s.activity_memb_toggle.addClass('fa-toggle-on text-primary');
                    s.activity_memb_toggle.attr('title', 'toggle off to allow any student in the course to view this activity').tooltip('fixTitle');
                });
            }
        },

        // changes a user's permission to view this acitivty
        updateUserPermission: function() {
            var data = {
                codename: s.user_perm_toggle.closest('div').data('codename'),
                object_username: s.user_perm_toggle.closest('div.admin_row').data('username'),
                object_type: s.activity_type,
                object_id: s.activity_id
            };
            if (s.user_perm_toggle.hasClass('fa-toggle-on')){
                data.operation_type = 'remove_perm';
                Ajax.post(s.ajax_url, data, s.csrftoken, function() {
                    s.user_perm_toggle.removeClass('fa-toggle-on text-primary');
                    s.user_perm_toggle.addClass('fa-toggle-off text-muted');
                });
            }else {
                data.operation_type = 'assign_perm';
                Ajax.post(s.ajax_url, data, s.csrftoken, function() {
                    s.user_perm_toggle.removeClass('fa-toggle-off text-muted');
                    s.user_perm_toggle.addClass('fa-toggle-on text-primary');
                });
            }
        },

        // toggles permission of the entire column
        userPermColumnToggle: function() {
            var column_togg_class = s.user_perm_column_toggle.data('columnclass');
            if (column_togg_class == 'view_activity') {
                var toggObjects = $('.view_activity');
            }
            if (toggObjects.hasClass('text-primary') && toggObjects.hasClass('text-muted')) {
                toggObjects.each(function() {
                    if ($(this).hasClass('text-primary')) {
                        $(this).trigger('click');
                    }
                })
            }else {
                toggObjects.each(function(){
                    $(this).trigger('click');
                })
            }
        },

    };

})();


//
// ActivityCopy:
//   copies an activity
//
(function() {
    var s; // cache
    ActivityCopy = {

        /***[ module settings ]***/
        settings: {
            activity_copy_toggle: $('.activity_copy_togg'),
            activity_copy_div: $('#activity_copy_div'),
            activity_copy_button: $('#activity_copy_btn'),
        },

        init: function() {
            s = this.settings;
            this.bindUIActions();
        },

        bindUIActions: function() {
            s.activity_copy_toggle.click(ActivityCopy.toggleActivityCopyDiv);
            s.activity_copy_button.click(ActivityCopy.copyActivity);
        },

        /***[ module functions ]***/
        toggleActivityCopyDiv: function() {
            s.activity_copy_div.toggle(20);
        },

        copyActivity: function() {
            var ajax_url = s.activity_copy_button.data('ajaxurl');
            var csrftoken = $("input[name=csrfmiddlewaretoken]").val();
            var data = {
                activity_type: s.activity_copy_button.data('activitytype'),
                activity_id: s.activity_copy_button.data('activityid'),
                course_name: $('#activity_copy_course').val(),
                course_id: $('option').filter(function() {
                               return $(this).text() == $('#activity_copy_course').val();
                           }).data('courseid'),
            };
            Ajax.post(ajax_url, data, csrftoken, function(response) {
                if (response.indexOf('success_redirect') != -1) {
                    window.location.href = response.slice(16);
                }
            });
        },
    };
})();


//
// RichTextEditor:
//   initializes a rich text editor with appropriate settings
//
(function() {

    var s; // cache
    RichTextEditor = {

        /***[ module settings ]***/
        settings: {
            discussion_options: {
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
            },
            essay_options: {
                selector: "#essayTextarea",
                skin : 'flat_design_tinymce',
                auto_focus: "essayTextarea",
                statusbar : false,
                toolbar1: "undo redo | forecolor backcolor styleselect | bold italic | alignleft aligncenter alignright alignjustify | " +
                          "bullist numlist | outdent indent | emoticons link print",
                plugins: [
                  "advlist autolink lists link image charmap print preview hr anchor pagebreak",
                  "searchreplace wordcount visualblocks visualchars code fullscreen",
                  "insertdatetime media nonbreaking save table contextmenu directionality",
                  "emoticons template paste textcolor "
                ],
                menubar: false
            },
        },

        init: function(option) {
            s = this.settings;
            if (option == "discussion") {
                tinymce.init(s.discussion_options);
            }else if (option == "essay") {
                tinymce.init(s.essay_options);
            }
        },
    };
})();


//
// Recorder:
//   recorder for discussion/overdub rte
//
(function() {
    var s; // cache
    Recorder = {

        /***[ module settings ]***/
        settings: {
            activity_type: $('#activityType').val(),
            recorder_container: $('#CLTREC_container'),
            recorder_trigger: $('#recordTrigger'),
            container_is_hidden: true,
            audioName: '',
            recorderID: 'recorder',
            recorderServer:  $("#recordTrigger").data('recorderserver'),
            recorderHandler: $("#recordTrigger").data('recorderhandler'),
            recorderDirectory: $("#recordTrigger").data('recorderdirectory'),
            recorderLicense: $("#recordTrigger").data('recorderlicense'),
            userinfo: $("#recordTrigger").data('userinfo'),
            swfobjectURL: $("#recordTrigger").data('swfurl'),
        },

        init: function() {
            s = this.settings;
            Recorder.startRecorder();
            s.recorder_container.hide('fast');
            this.bindUIActions();
        },

        bindUIActions: function() {
            s.recorder_trigger.click(Recorder.recordButtonToggle);
            if (s.activity_type == "discussion") {
               recorderMessage =  Recorder.discussionRecorderMessage;
            }else {
               recorderMessage = Recorder.overdubRecorderMessage;
            }
            thisMovie = Recorder.thisMovie;
        },

        /***[ module functions ]***/
        recordButtonToggle: function () {
            s.recorder_container.toggle('fast');
            if (s.container_is_hidden) {
                Recorder.startRecorder();
                s.container_is_hidden = false;
            }else {
                s.container_is_hidden = true;
                recordingFlag = false; // wtf is this?
            }
        },

        startRecorder: function() {
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
                if ( $('#'+s.recorderID) ) swfobject.removeSWF(s.recorderID);

                /**SWF Container: Bare Bones Recorder*/
                $('<div/>', {id: s.recorderID}).appendTo('#CLTREC_container');

                var d = new Date();
                var timestamp = d.getFullYear()+""
                                +(d.getMonth()+1)+""
                                +d.getDate()+""
                                +d.getHours()+""
                                +d.getMinutes()+""
                                +d.getSeconds()+"";

                var att = {
                    id          : s.recorderID,
                    name        : s.recorderID,
                    data        : s.swfobjectURL,
                    width       : "430",
                    height      : "180"
                };

                s.audioName = s.userinfo+"_"+timestamp;

                var barebones  = "myFilename="  + s.audioName;
                    barebones += "&myServer="   + s.recorderServer;
                    barebones += "&myHandler="  + s.recorderHandler;
                    barebones += "&myDirectory="+ s.recorderDirectory;
                    barebones += "&licensekey=" + s.recorderLicense;
                    barebones += "&timeLimit="  + "300";
                    barebones += "&showLink="   + "N";
                    barebones += "&hideFlash"   + "Y";

                var params = {flashvars: barebones};

                // Now create the new (or reinitialized) scrubber
                swfobject.createSWF(att, params, s.recorderID);
            }
        },

        discussionRecorderMessage: function(x,y) {
            switch(x) {
                case 1:  recordingFlag = false; //no recording
                         break;
                case 2:  recordingFlag = true;  //there is recording
                         break;
                case 15: var attFile = '<span class="attachedAudio" style="cursor:pointer;"><a class="audioLink text-muted" href='
                                       + s.recorderServer
                                       + s.recorderDirectory
                                       + "/" + s.audioName
                                       + ".mp3" + '><i class="icon-file-alt"></i> <span class="audioName">'
                                       + s.audioName + ".mp3"
                                       + '</span></a> <small> <i class="icon-remove removeIcon" style="color:grey; opacity:0.01;"></i></small></span>';
                         $('#inputAttachments').append(attFile);
                         s.recorder_trigger.trigger( "click" );
                         recordingFlag = false; //no recording pending
                         break;
            };
        },

        overdubRecorderMessage: function(x,y) {
            switch(x) {
                case 1:  recordingFlag = false; //no recording
                         initialPause = 1;
                         jwplayer("overdubVideo").play(true);
                         break;
                case 2:  jwplayer("overdubVideo").play(true);
                         recordingFlag = true;  //there is recording
                         break;
                case 5:  jwplayer("overdubVideo").stop(true);
                         initialPause = 1
                         jwplayer("overdubVideo").play(true);
                         break;
                case 6:  jwplayer("overdubVideo").play(true);
                         break;
                case 15: var attFile = '<span class="attachedAudio" style="cursor:pointer;"><a class="audioLink text-muted" href='
                                       + s.recorderServer
                                       + s.recorderDirectory
                                       + "/" + s.audioName + ".mp3"
                                       + '><i class="icon-file-alt"></i> <span class="audioName">'
                                       + s.audioName + ".mp3"
                                       + '</span></a> <small> <i class="icon-remove removeIcon" style="color:grey; opacity:0.01;"></i></small></span>';
                         $('#inputAttachments').append(attFile);
                         s.recorder_trigger.trigger( "click" );
                         recordingFlag = false; //no recording pending
                         break;
                case 16: jwplayer('overdubVideo').play(false);
                         break;
                case 17: jwplayer('overdubVideo').play(true);
                         break;
            };
        },

        thisMovie: function(movieName) {
            if (navigator.appName.indexOf("Microsoft") != -1) {
                return window[movieName];
            }else {
                return document[movieName];
            }
        },
    };
})();


//
// FileUploader:
//   file uploader for discussion/overdub rte
//
(function() {
    var s; // cache
    FileUploader = {

        /***[ module settings ]***/
        settings: {
            upload_trigger: $('#uploadTrigger'),
            file_input: $('#fileupload'),
        },

        init: function() {
            s = this.settings;
            this.bindUIActions();
        },

        bindUIActions: function() {
            s.upload_trigger.click(FileUploader.upload);
            $(function() {
                'use strict';
                s.file_input.fileupload(FileUploader.options());
            })
            .prop('disabled', !$.support.fileInput)
            .parent().addClass($.support.fileInput ? undefined : 'disabled');
        },

        /***[ module functions ]***/
        upload: function() {
            s.file_input.trigger('click');
        },

        options: function() {
            var csrftoken = $("input[name=csrfmiddlewaretoken]").val();
            return {
                url: '/upload/',
                crossDomain: false,
                dataType: 'json',
                beforeSend: function(xhr, settings) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                },
                done: function(e, data) {
                    $.each(data.result.files, function (index, file) {
                        // $('<p/>').text(file.name).appendTo('#files');
                        var attFile = '<span class="attachedFile" style="cursor:pointer;"><a class="fileLink text-muted" href='
                                      + file.url
                                      + '  ><i class="icon-file-alt"></i> <span class="fileName">'
                                      + file.name
                                      + '</span></a> <small> <i class="icon-remove removeIcon" style="color:grey; opacity:0.01;"></i></small></span>';
                        $('#inputAttachments').append(attFile)
                    });
                },
                progressall: function(e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    $('#progress .progress-bar').css({
                        "transition": "width 0.65s",
                        "width":'100%',
                            }
                    );
                    setTimeout(function() {
                        $('#progress .progress-bar').css({
                            "transition": "width 0s",
                            "width":'0%',
                        })
                    }, 1000);
                }
            }
        },

    };
})();


//
// EssayResponseDiscussion:
//   handles sending and removing comments of an essay draft
//
(function() {
    var s; // cache
    EssayResponseDiscussion = {

        /***[ module settings ]***/
        settings: {
            essay_discussion: $('#essay_discussion'),
        },

        init: function() {
            s = this.settings;
            this.bindUIActions();
        },

        bindUIActions: function() {
            s.essay_discussion.on('keypress', 'textarea', EssayResponseDiscussion.sendPost);
            s.essay_discussion.on('click', '.removePost', EssayResponseDiscussion.removePost);
            s.essay_discussion.on('click', '.draftToggle', EssayResponseDiscussion.toggleDraft);
        },

        /***[ module functions ]***/
        sendPost: function(event) {
            if (event.which == 13 && $(this).val!="" ) {
                event.preventDefault();
                var activity_id = $(this).closest('ul').data('responseid'); // really should be object_id (see PostSaveView)
                var data = {
                    activity_type: "essay",
                    activity_id: activity_id,
                    text: $(this).val(),
                };
                var ajax_url = $("#essay_discussion").data('ajaxurl');
                var csrftoken = $("input[name=csrfmiddlewaretoken]").val();
                Ajax.post(ajax_url, data, csrftoken, function(new_comment) {
                    var draft_comments = "#draft_comments" + activity_id + " li";
                    var comment_form_position = $(draft_comments).length - 1;
                    $(draft_comments).eq(comment_form_position).before(new_comment);
                    $('textarea').val('');
                });
            }
        },

        removePost: function() {
            var ajax_url = $("#essay_responses").data("ajaxurl");
            var post_id = $(this).closest("li").data("postid");
            var csrftoken = $("input[name=csrfmiddlewaretoken]").val();
            Ajax.post(ajax_url, {post_id: post_id}, csrftoken, function(response){
                $("#"+post_id).remove();
            });
        },

        // toggles between submitted essay responses => toggles associated discussion
        toggleDraft: function(event) {
            event.preventDefault();
            $(this).closest("div").find(".draftToggle").removeClass('active');
            $(this).addClass('active');
            var tempShow = $(this).closest("div").find(".draftToggle.active").find('input').first().val();
            $("#"+tempShow).show();
            $(this).closest("div").find(".draftToggle").not(".active").find('input').each(function() {
                var temp_noShow = $(this).val()
                $("#"+temp_noShow).hide()
            });
        }
    };
})();


//
// JumpToUser:
//   toggles for jump-to-user well in essay activity
//
(function() {
    var s; // cache
    JumpToUser = {

        /***[ module settings ]***/
        settings: {
            all_user_responses_toggle: $(".userResponseAllToggle"),
        },

        init: function() {
            s = this.settings;
            if ($(".userResponseToggle")){
                s.user_response_toggle = $(".userResponseToggle");
            }
            this.bindUIActions();
        },

        bindUIActions: function() {
            if ($(".userResponseToggle")){
                s.user_response_toggle.click(JumpToUser.showUserResponses);
            }
            s.all_user_responses_toggle.click(JumpToUser.showAllUserResponses);
        },

        /***[ module functions ]***/
        showUserResponses: function() {
            console.log("show user responses");
            var tempShow = $(this).data('userdraft');
            if($("#"+tempShow).size()>0) {
                $(".allUserResponses").each(function() {
                    $(this).hide();
                });
                $("#"+tempShow).show();
            }
        },

        showAllUserResponses: function() {
            console.log("show all user responses");
            $('.allUserResponses').each(function() {
                $(this).show();
            });
        },
    };
})();


//
// TemplateModule:
//   what does it do?
//
(function() {
    var s; // cache
    ModuleName = {

        /***[ module settings ]***/
        settings: {

        },

        init: function() {
            s = this.settings;
            this.bindUIActions();
        },

        bindUIActions: function() {
            // example:
            // s.someSetting.someEvent(ModuleName.moduleFunction);
        },

        /***[ module functions ]***/
        moduleFunction: function() {},
    };
})();


