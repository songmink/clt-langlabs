// sockets.js

//= requires utils.js

//
// ChatClient:
//   
//    note: must be ran when $ is ready
//
(function() {
  
    /***[ private/utility functions ]***/
    var setReadAfterPostLock = function () {
        if( $('#activity_title').data('userpostnum') === 0 && 
            $('#activity_title').data('readafterpost') == 'True' && 
            $('#activity_title').data('userisinstructor') === false) {
      
            $("#posts").append(' <div id="readafterpost_div" class="col-xs-12  well " style="background-color:rgba(255, 227, 187, 0.21);">' +
                                    '<div class=" text-left col-xs-1" style="color:#7A8F24;">' +
                                        '<span class="fa-stack fa-2x">' +
                                            '<i class="fa fa-file-o fa-stack-2x"></i>' +
                                            '<i class="fa fa-lock fa-stack-1x"></i>' +
                                        '</span>'+
                                    '</div>'+
                                    '<div class="col-xs-10" style="color:#7A8F24; font-size:1.2em;margin-left:10px;">'+
                                        'Check out what everyone is saying after sending your first post. You can send :<br>'+
                                        '<i class="fa fa-pencil"></i> Rich Text Messages &nbsp;&nbsp;<i class="fa fa-volume-up"></i>' +
                                        'Voice Recordings &nbsp;&nbsp;<i class="fa fa-files-o"></i>  Files' +
                                    '</div>' +
                                '</div>'
            );
            return true;
        } else {
            return false;
        };
    };

    var clearTextarea = function () {
        $('#postTextarea').html('');
        $("#inputAttachments").html('');
    };

    // connection settings
    var url = $('#connectingDIV').data('protocol')+"://"+$('#connectingDIV').data('host') + ":" + $('#connectingDIV').data('port') + "/discussionsPosts";
    var connection_options = {
        'reconnect': 'true',
        'reconnection delay': 500,
        'max reconnection attempts': 3,
    };

    var attempt = 1; // reconnection attempt counter
    var s; // cache
    ChatClient = {

        /***[ module settings ]***/
        settings: {
            read_after_post_lock: setReadAfterPostLock(),
            sendPostButton: $('#sendPost'),
            post_area: $('#posts'),
            posts: $('#posts2'),
            activity_type: $('#activityType').val(),
            activity_id: $('#activityID').val(),
            user: $('#activityUSER').val(),
            user_is_instructor: $('#activity_title').data('userisinstructor'),
            ajax_url: $('#posts').data('saveajaxurl'),
            csrftoken: $("input[name=csrfmiddlewaretoken]").val(),
            remove_icon: '<small><a class="text-muted removePost" style="text-decoration:none;cursor:pointer;"><i class="fa fa-remove text-danger"></i></a></small>',
        },

        init: function() {
            s = this.settings;
            s.socket = io.connect(url, connection_options); // this needs to be done here, otherwise 'error' is not detected
            this.bindUIActions();
        },

        bindUIActions: function() {
            // connection stuff
            s.socket.on('connect', ChatClient.connect);
            s.socket.on('reconnect', ChatClient.reconnect);
            s.socket.on('reconnecting', ChatClient.reconnecting);
            s.socket.on('reconnect_failed', ChatClient.reconnectFailed);
            s.socket.on('error', ChatClient.connectFailed);
            // post receivers
            s.socket.on('msg_to_room', ChatClient.messageToRoom);
            s.socket.on('cmt_to_room', ChatClient.commentToRoom);
            // post senders
            s.post_area.on('keydown', 'textarea', ChatClient.sendComment);
            s.sendPostButton.on('click', ChatClient.sendPost);
            // these are here to shut up the chat server log output
            s.socket.on('announcement', function (){}); 
            s.socket.on('nicknames', function () {});   
        },

        /***[ module functions ]***/
        // connect: fires when a connection is established
        connect: function() {
            // specify thread to specify room 
            s.socket.emit('join', s.activity_type, s.activity_id);

            // nickname event to declare user identity
            s.socket.emit('nickname', s.user, function (set) {
                if (set) {
                    $('#connectingDIV').removeClass('show').addClass('hidden');
                    $('#connectedDIV').removeClass('hidden').addClass('show');
                    clearTextarea();
                }else {
                    $('#sysMessage').html("<i class='fa fa-frown-o fa-5x'></i> Server Error, please contact site admin for assistance");
                }
            });
        },

        // reconnect: fires when a reconnection is established
        reconnect: function() {
            console.log('connection reestablished');
        },

        // reconnecting: fires upon each reconnection attempt (see options passed to io.connect above)
        reconnecting: function() {
            console.log('reconnection attempt #' + attempt++);
        },

        // reconnectFailed: fires after `max reconnection attempts' is reached
        reconnectFailed: function() {
            console.log('connection could not be reestablished');
            // do something?
        },

        // connectFailed: e.g. fires if a user connects to a page and the chat server is down
        connectFailed: function() {
            console.log("couldn't connect to chat server");
            // warning on page?
            $('#connectingDIV').removeClass('show').addClass('hidden');
            $('#connectedDIV').removeClass('hidden').addClass('show');
            clearTextarea();
        },

        // messageToRoom: fires when a post is received from the chat server
        messageToRoom: function(response) {
            if (s.read_after_post_lock === false) {
                console.log(response)
                var new_post = $(response.trim());
                var post_creator = new_post.find('strong').html().toLowerCase();
                if (s.user == post_creator || s.user_is_instructor) {
                    new_post.find('small.pull-right').append(s.remove_icon);
                }
                s.posts.prepend(new_post);

            }
        },

        // commentToRoom: fires when a comment (reply to post) is received from the chat server
        commentToRoom: function(data) {
            if (s.read_after_post_lock === false) {
                var response = eval ("(" + data + ")");
                var new_post = $(response.rendered_string.trim());
                var post_creator = new_post.find('strong').html().toLowerCase()
                if (s.user == post_creator || s.user_is_instructor) {
                    new_post.find('small.pull-right').append(s.remove_icon)
                }
                var parent_post = $("li[data-postid="+ response.parent_post +"]").next().find('.comment');
                parent_post.prepend(new_post);
            }
        },

        // sends a post
        sendPost: function() {
            if(recordingFlag===false){  //check if there is un-uploaded recording
                //Post textarea is not empty 
                if ($('#postTextarea').html().trim()) {
                    // get the attached files
                    var tempATT=[];
                    $("#inputAttachments").find('.fileLink').each(function(index) {
                        tempATT.push($(this).attr('href'));
                    });
                    var tempATT_name=[];
                    $("#inputAttachments").find('.fileName').each(function(index) {
                        tempATT_name.push($(this).text());
                    });
                    // get the attached audio
                    var tempATT_audio='';
                    tempATT_audio+=$("#inputAttachments").find('.audioName').first().text();

                    // send post to chat server if it's up, otherwise do an ajax post
                    if (s.socket.socket.connected){
                        s.socket.emit('user message', {
                            msg : $("#postTextarea").html(),
                            attaches: tempATT,
                            attachesName: tempATT_name,
                            audioURL:tempATT_audio
                        });
                    }else {
                        ChatClient.fallbackAjaxPost({
                            text: $('#postTextarea').html(),
                            attachments: tempATT,
                            attaches_name: tempATT_name,
                            audioURL: tempATT_audio
                        });
                    }
                    
                    clearTextarea();
                    if (s.read_after_post_lock === true) {
                        s.read_after_post_lock = false;
                        $("#readafterpost_div").remove();
                    }
                    
                    if(s.posts.length=== 0 && $('#activity_title').data('readafterpost')=='True') {
                        $( "#posts" ).load( window.location.pathname+" #posts2", function( response, status, xhr ) {
                          if ( status == "error" ) {
                            var msg = "Sorry but there was an error: ";
                          }
                        });
                    }
                    return false;
                }
            } else {
                 $('.notificationButton').trigger("click");
            }

        },

        // sendComment: sends a comment to the chat server if it's up, otherwise does an ajax post
        sendComment: function(event) {
            if (event.which == 13 && $(this).val !== "") {
                event.preventDefault();
                if (s.socket.socket.connected) {
                    s.socket.emit('user comment',{
                        cmt : $(this).val(),
                        parentID: $(this).closest(".comment").parent().prev().data('postid')
                    });
               }else {
                    ChatClient.fallbackAjaxPost({
                        text: $(this).val(),
                        parent_post: $(this).closest('.comment').parent().prev().data('postid'),
                    });
                }
                $(this).val('');
            }
        },

        // fallbackAjaxPost: works as a fallback for posting when the chat server is down
        fallbackAjaxPost: function(data) {
            $.extend(data, {
               activity_id: s.activity_id,
               activity_type: s.activity_type, 
            });
            Ajax.post(s.ajax_url, data, s.csrftoken, function(response) {
                if (data.parent_post) { // it is a reply to a post
                    var parent_post = $("li[data-postid="+data.parent_post+"]").next().find('.comment');
                    parent_post.prepend(response);
                }else {
                    s.posts.prepend(response);
                }
            });
        },

    };
})();


