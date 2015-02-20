// socket.io specific code

// connect to name space
var connectstr = $('#connectingDIV').data('protocol')+"://"+$('#connectingDIV').data('host') + ":" + $('#connectingDIV').data('port');
var socket = io.connect(connectstr + "/discussionsPosts");

// "read after post" check
if( ($('#activity_title').data('userpostnum')===0  &&  $('#activity_title').data('readafterpost')=='True') && $('#activity_title').data('userisinstructor')===false){
    var read_after_post_lock = true;
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
                        '</div>');
} else {
    var read_after_post_lock = false;
}

socket.on('connect', function () {

    // SPECIFY THREAD ID TO SPECIFY ROOM
    socket.emit( 'join',  'discussion' ,$('#activityID').val() );

    // Nickname event to declare user identity
    socket.emit('nickname', $('#activityUSER').val(), function (set) {
            if (set) {
                $('#connectingDIV').removeClass('show').addClass('hidden');
                $('#connectedDIV').removeClass('hidden').addClass('show');
                clear();
            }else{
                $('#sysMessage').html("<i class='fa fa-frown-o fa-5x'></i> Server Error, please contact site admin for assistance");
            }
        });
    });

    socket.on('announcement', function (msg) {
    });

    socket.on('nicknames', function (nicknames) {
    });

    // receive broadcast message
    socket.on('msg_to_room', message);

    // receive broadcast comment
    socket.on('cmt_to_room', comment);

    socket.on('reconnect', function () {
    });

    socket.on('reconnecting', function () {
    });

    socket.on('error', function (e) {
        var temp = e ? e : 'A unknown error occurred';
    });



    function clear () {
        $('#postTextarea').val('');
    }

    var testtt=0;
    
    // DOM manipulation
    $(function () {
        // Prepend post to the top of posts
        $("#sendPost").click(function() {
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
                    // send Post to server and get a reply of post id
                    socket.emit('user message', {msg : $("#postTextarea").html() ,attaches: tempATT, attachesName:tempATT_name, audioURL:tempATT_audio});
                    clear();
                    if(read_after_post_lock === true) {
                        read_after_post_lock = false;
                        $("#readafterpost_div").remove();
                    }
                    if($('#posts2').size()=== 0 && $('#activity_title').data('readafterpost')=='True') {
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

        });
        // Prepend comments for posts 
        $( "#posts" ).on( "keydown", "textarea", function(event) {
            if ( event.which == 13 && $(this).val !== "" ) {
               event.preventDefault();
               // comment($('#activityUSER').val(), $(this).val(), $(this).closest(".comment"))
               socket.emit('user comment',{cmt : $(this).val(),parentID: $(this).closest(".comment").parent().prev().data('postid')});
               //clear the input
               $(this).val('');
            }
        });

        function clear () {
            $('#postTextarea').html('');
            $("#inputAttachments").html('');
        }
    });
    
    // receive message and generate the content to web page
    function message (message) {
        if( read_after_post_lock === false) {
            var mess=eval ("(" + message + ")");
            from = mess.fromMessage;
            msg = mess.message;
            created = mess.createTime;
            msgID = mess.msgID;
            var tempAttachments;
            if(msg.attaches.length>0) {
                tempAttachments ='<p class="attachDIV well " style="padding:8px;margin-bottom:0px;border-radius:0px;border:0px;background-color:#F8F8F8;">';
                for(var i=0; i<msg.attaches.length;i++) {
                       tempAttachments+='<span><a class="fileLink text-muted" href="'+msg.attaches[i]+'"  > <i class="icon-file-alt"></i> '+msg.attachesName[i]+'</a></span>';
                }
                tempAttachments+='</p>';
            } else {
                tempAttachments='';
            }
            // temporarily add audio to links below the message
            if(msg.audioURL) tempAttachments+='<div id="'+msg.audioURL.slice(0,-4)+'" class="audioDiv"></div>';
            // if(msg.audioURL) tempAttachments+='<p class="attachDIV well " style="padding:8px;">'+'<span><a class="fileLink text-muted" href="'+recorderServer+recorderDirectory+"/"+msg.audioURL+'"  > <i class="icon-file-alt"></i> '+msg.audioURL+'</a></span>'+'</p>'
            
            var thumbNail;
            if(private_users.search('<User: '+from+'>') != -1){
                    thumbNail = '<span><i class="fa fa-graduation-cap fa-2x pull-left fa-fw text-muted" style="font-size:2.1em;"></i></span>';
                } else {
                    thumbNail = '<span><i class="fa fa-user fa-2x pull-left fa-fw text-muted" style="font-size:2.1em;"></i></span>';
                }
            var temp = '<li class="left clearfix chatlist" data-postid='+msgID+'>'+thumbNail+'<div class="chat-body clearfix"><div class="header"><strong class="primary-font">'+from.substr(0,1).toUpperCase()+from.substr(1)+'</strong> <small class="pull-right text-muted"><span class="glyphicon glyphicon-time"></span>'+created+'</small></div><p>'+msg.msg+'</p>'+tempAttachments+'</div></li><div><ul class="comment">'+thumbNail_comment+'</ul></div> ' ;
            $( "#posts2" ).prepend(temp);
            if(msg.audioURL){
                jwplayer(msg.audioURL.slice(0,-4)).setup({
                    file: recorderServer+recorderDirectory+"/"+msg.audioURL,
                    width: "100%",
                    skin: $("#recordTrigger").data('playerskin'),
                    height: 30
                });
            }

        }
    }

    // receive the comment and show them on web page
    function comment (message) {
        if( read_after_post_lock === false) {
            var mess=eval ("(" + message + ")");
            from = mess.fromMessage;
            msg = mess.message;
            created = mess.createTime;
            msgID = mess.msgID;
            parentPost = mess.parentPost;
            var pp =$("li[data-postid="+parentPost+"]").next().find('.comment');
            testtt=pp;
            var thumbNail;
            if(private_users.search('<User: '+from+'>') != -1){
                    thumbNail = '<span><i class="fa fa-graduation-cap fa-2x pull-left fa-fw text-muted" style="font-size:2.1em;"></i></span>';
                }else{
                    thumbNail = '<span><i class="fa fa-user fa-2x pull-left fa-fw text-muted" style="font-size:2.1em;"></i></span>';
                }
            var temp =  '<li class="left clearfix commentlist" data-postid='+msgID+'>'+thumbNail+'<div class="chat-body clearfix"><div class="header"><strong class="primary-font">'+from.substr(0,1).toUpperCase()+from.substr(1)+'</strong> <small class="pull-right text-muted"><span class="glyphicon glyphicon-time"></span>'+created+'</small></div><p>'+msg.cmt+'</p></div></li>';
            pp.prepend(temp);
        }
    }
