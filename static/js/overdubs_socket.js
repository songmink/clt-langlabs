// socket.io specific code

// connect to namespaces
var connectstr = $('#connectingDIV').data('protocol')+"://"+$('#connectingDIV').data('host') + ":" + $('#connectingDIV').data('port');
var socket = io.connect(connectstr + "/discussionsPosts", {
   'reconnect': 'true',
   'reconnection delay': 500,
   'max reconnection attempts': 3
});

// read after post function
if( ($('#activity_title').data('userpostnum')==0  &&  $('#activity_title').data('readafterpost')=='True') && $('#activity_title').data('userisinstructor')==false){
    var read_after_post_lock = true
    $("#posts").append(' <div id="readafterpost_div" class="col-xs-12  well " style="background-color:rgba(255, 227, 187, 0.21);">\
                    <div class=" text-left col-xs-1" style="color:#7A8F24;">\
                    <span class="fa-stack fa-2x">\
                          <i class="fa fa-file-o fa-stack-2x"></i>\
                          <i class="fa fa-lock fa-stack-1x"></i>\
                    </span>\
                    </div>\
                     <div class="col-xs-10" style="color:#7A8F24; font-size:1.2em;margin-left:10px;"">Check out what everyone is saying after sending your first post. You can send :<br><i class="fa fa-pencil"></i> Rich Text Messages &nbsp;&nbsp;<i class="fa fa-volume-up"></i>  Voice Recordings &nbsp;&nbsp;<i class="fa fa-files-o"></i>  Files</div>\
                    </div>')
}else{
    var read_after_post_lock = false
}

socket.on('connect', function () {

    // SPECIFY THREAD ID TO SPECIFY ROOM
    socket.emit( 'join',  'overdub' ,$('#activityID').val() );

    socket.emit('nickname', $('#activityUSER').val(), function (set) {
            if (set) {
                $('#connectingDIV').removeClass('show').addClass('hidden');
                $('#connectedDIV').removeClass('hidden').addClass('show');
                clear();
            }else{
                $('#sysMessage').html("<i class='fa fa-frown-o fa-5x'></i> Server Error, please contact site admin for assistance")
            }
        }); 
    });

    socket.on('announcement', function (msg) {
        // console.log("announcement: "+msg)
    });

    socket.on('nicknames', function (nicknames) {
        // console.log('nicknames: '+nicknames)
    });

    socket.on('msg_to_room', message);
    socket.on('cmt_to_room', comment);

    socket.on('reconnect', function () {
        console.log("reconnected!");
    });

    var attempt = 0
    socket.on('reconnecting', function () {
       console.log("reconnection attempt "+ attempt++)
    });

    socket.on('reconnect_failed', function () {
       console.log("failed to reconnect")
    });

    socket.on('error', function () {
       console.log("couldn't connect to chat server");
       // warning on page?
       $('#connectingDIV').removeClass('show').addClass('hidden');
       $('#connectedDIV').removeClass('hidden').addClass('show');
       clear();

    });

    function clear () {
        $('#postTextarea').val('')
    };

var testtt=0;
// DOM manipulation
    $(function () {
        // Prepend post to the top of posts
        $("#sendPost").click(function() {
            if(recordingFlag==false){  //check if there is un-uploaded recording
                //Post textarea is not empty 
                if ($('#postTextarea').html().trim()){
                    // get the attached files
                    var tempATT=[]
                    $("#inputAttachments").find('.fileLink').each(function(index){ tempATT.push($(this).attr('href'))})
                    var tempATT_name=[]
                    $("#inputAttachments").find('.fileName').each(function(index){ tempATT_name.push($(this).text())})
                    // get the attached audio
                    var tempATT_audio=''
                    tempATT_audio+=$("#inputAttachments").find('.audioName').first().text();
                    // send Post to server and get a reply of post id

                    if (socket.socket.connected){
                        socket.emit('user message', {
                            msg : $("#postTextarea").html(),
                            attaches: tempATT, 
                            attachesName: tempATT_name,
                            audioURL:tempATT_audio
                        });
                    }else {
                        sendPost(csrftoken, {
                            text: $('#postTextarea').html(),
                            ajax_URL: $('#posts').data('saveajaxurl'),
                            activity_id: $('#activityID').val(),
                            activity_type: $('#activityType').val(),
                            attaches: tempATT,
                            attaches_name: tempATT_name,
                            audio_URL: tempATT_audio
                        });
                    }

                    clear();
                    if(read_after_post_lock == true){
                        read_after_post_lock = false
                        $("#readafterpost_div").remove()
                    }
                    if($('#posts2').size()==0 && $('#activity_title').data('readafterpost')=='True'){
                        $( "#posts" ).load( window.location.pathname+" #posts2", function( response, status, xhr ) {
                          if ( status == "error" ) {
                            var msg = "Sorry but there was an error: ";
                          }
                        });
                    }
                    return false;
                }
            }else{
                 $('.notificationButton').trigger("click");
            }

        });
        // Prepend comments for posts 
        $( "#posts" ).on( "keydown", "textarea", function(event) {
            if ( event.which == 13 && $(this).val!="" ) {
               event.preventDefault();
               // comment($('#activityUSER').val(), $(this).val(), $(this).closest(".comment"))

               if (socket.socket.connected) {
                   rv = socket.emit('user comment',{
                       cmt : $(this).val(),
                       parentID: $(this).closest(".comment").parent().prev().data('postid')});
               }else {
                   sendPost(csrftoken,{
                      text: $(this).val(),
                      ajax_URL: $('#posts').data('saveajaxurl'),
                      activity_id: $('#activityID').val(),
                      activity_type: $('#activityType').val(),
                      parent_post: $(this).closest('.comment').parent().prev().data('postid'),
                   });
               }

               //clear the input
               $(this).val('')
            }
        });

        function clear () {
            $('#postTextarea').html('')
            $("#inputAttachments").html('')
        };
    });
    

    // fallback method of posting comments when chat server is down
    function sendPost(csrftoken, argv) {
        console.log(argv.parent_post);
        $.ajax({
            type: "POST",
            url: argv.ajax_URL,
            async: "false",
            beforeSend: function(xhr){
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },
            data: {
                activity_type: argv.activity_type,
                activity_id: argv.activity_id,
                text: argv.text,
                attachments: argv.attaches,
                audioURL: argv.audio_URL,
                parent_post: argv.parent_post
            }
        })
        .done(function(response){
            if (argv.parent_post) {
                // it is a reply to a post
                var parent_post = $("li[data-postid="+argv.parent_post+"]").next().find('.comment');
                parent_post.prepend(response);
            }else{
                $('#posts2').prepend(response);
            }
        })
        .fail(function(jqXHR, textStatus){
        });
    }


    function message (message) {
        if( read_after_post_lock == false){
  
            user = $("#activityUSER").val();
            user_is_instructor = $('#activity_title').data('userisinstructor');
            var mess=eval ("(" + message + ")");
            from = mess.fromMessage
            msg = mess.message
            created = mess.createTime
            msgID = mess.msgID
            var deleteIcon;
            if(msg.attaches.length>0){
                var tempAttachments ='<p class="attachDIV well " style="padding:8px;margin-bottom:0px;border-radius:0px;border:0px;background-color:#F8F8F8;">'
                for(var i=0; i<msg.attaches.length;i++){
                       tempAttachments+='<span><a class="fileLink text-muted" href="'+msg.attaches[i]+'"  > <i class="icon-file-alt"></i> '+msg.attachesName[i]+'</a></span>'
                }
                tempAttachments+='</p>'
            }else{
                tempAttachments=''
            }
            if(from == user || user_is_instructor){
                deleteIcon = ' <small><a class="text-muted removePost" style="text-decoration:none;cursor:pointer;" ><i class="fa fa-remove text-danger"></i></a></small>';
            } else {
                deleteIcon = '';
            }
            // temporarily add audio to links below the message
            if(msg.audioURL) tempAttachments+='<div id="'+msg.audioURL.slice(0,-4)+'" class="audioDiv"></div>'
            if(private_users.search('<User: '+from+'>') != -1){
                var thumbNail = '<span><i class="fa fa-graduation-cap fa-2x pull-left fa-fw text-muted" style="font-size:2.1em;"></i></span>'
            }else{
                var thumbNail = '<span><i class="fa fa-user fa-2x pull-left fa-fw text-muted" style="font-size:2.1em;"></i></span>'
            }
            var temp = '<div id="'+msgID+'"><li class="left clearfix chatlist" data-postid='+msgID+'>'+thumbNail+'<div class="chat-body clearfix"><div class="header"><strong class="primary-font">'+from.substr(0,1).toUpperCase()+from.substr(1)+'</strong> <small class="pull-right text-muted"><span class="glyphicon glyphicon-time"></span>'+created+deleteIcon+'</small></div><p>'+msg.msg+'</p>'+tempAttachments+'</div></li><div><ul class="comment">'+thumbNail_comment+'</ul></div></div> ' ;
            $( "#posts2" ).prepend(temp);
            if(msg.audioURL){
                // set synchronization between audio and video player
                jwplayer(msg.audioURL.slice(0,-4)).setup({
                    file: recorderServer+recorderDirectory+"/"+msg.audioURL,
                    width: "100%",
                    skin: $("#recordTrigger").data('playerskin'),
                    height: 30
                });
                jwplayer(msg.audioURL.slice(0,-4)).onPlay(function(){
                    jwplayer("overdubVideo").play(true)
                })
                .onPause(function(){
                    jwplayer("overdubVideo").pause(true)
                })
                .onComplete(function(){
                    jwplayer("overdubVideo").stop(true)
                    initialPause = 1
                    jwplayer("overdubVideo").play(true)
                })
            }
        }
    }

    // Add comments to post 
    function comment (message) {
        if( read_after_post_lock == false){
            user = $("#activityUSER").val();
            user_is_instructor = $('#activity_title').data('userisinstructor');
            var mess=eval ("(" + message + ")");
            from = mess.fromMessage
            msg = mess.message
            created = mess.createTime
            msgID = mess.msgID
            parentPost = mess.parentPost
            var pp =$("li[data-postid="+parentPost+"]").next().find('.comment')
            testtt=pp
            var thumbNail, deleteIcon;
            if(private_users.search('<User: '+from+'>') != -1){
                thumbNail = '<span><i class="fa fa-graduation-cap fa-2x pull-left fa-fw text-muted" style="font-size:2.1em;"></i></span>'
            }else{
                thumbNail = '<span><i class="fa fa-user fa-2x pull-left fa-fw text-muted" style="font-size:2.1em;"></i></span>'
            }
            if(from == user || user_is_instructor){
                deleteIcon = ' <small><a class="text-muted removePost" style="text-decoration:none;cursor:pointer;" ><i class="fa fa-remove text-danger"></i></a></small>';
            } else {
                deleteIcon = '';
            }
            var temp =  '<li id="'+msgID+'" class="left clearfix commentlist" data-postid='+msgID+'>'+thumbNail+'<div class="chat-body clearfix"><div class="header"><strong class="primary-font">'+from.substr(0,1).toUpperCase()+from.substr(1)+'</strong> <small class="pull-right text-muted"><span class="glyphicon glyphicon-time"></span>'+created+deleteIcon+'</small></div><p>'+msg.cmt+'</p></div></li>';
            pp.prepend(temp);
        }
    }
