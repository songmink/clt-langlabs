// socket.io specific code
var socket = io.connect("192.168.1.8:8001/discussionsPosts");

socket.on('connect', function () {

    // SPECIFY THREAD ID TO SPECIFY ROOM
    socket.emit( 'join',  'discussion' ,$('#activityID').val() );

    socket.emit('nickname', $('#activityUSER').val(), function (set) {
            if (set) {
                $('#connectingDIV').removeClass('show').addClass('hidden');
                $('#connectedDIV').removeClass('hidden').addClass('show');
                clear();
                console.log("user is added to discussion")
            }else{
                $('#sysMessage').html("<i class='fa fa-frown-o fa-5x'></i> Server Error, please contact site admin for assistance")
            }
        }); 
    });

    socket.on('announcement', function (msg) {
        console.log("announcement: "+msg)
    });

    socket.on('nicknames', function (nicknames) {
        console.log('nicknames: '+nicknames)
    });

    socket.on('msg_to_room', message);
    socket.on('cmt_to_room', comment);

    socket.on('reconnect', function () {
        console.log("reconnect: "+"reconnected to the server")
    });

    socket.on('reconnecting', function () {
        console.log('reconnecting: '+'attempting to reconnect the server')
    });

    socket.on('error', function (e) {
        var temp = e ? e : 'A unknown error occurred'
        console.log('error: '+ temp)
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
                    console.log($("#postTextarea").html())
                    // get the attached files
                    var tempATT=[]
                    $("#inputAttachments").find('.fileLink').each(function(index){ tempATT.push($(this).attr('href'))})
                    var tempATT_name=[]
                    $("#inputAttachments").find('.fileName').each(function(index){ tempATT_name.push($(this).text())})
                    // get the attached audio
                    var tempATT_audio=''
                    tempATT_audio+=$("#inputAttachments").find('.audioName').first().text();
                    // send Post to server and get a reply of post id
                    console.log("tempATT")
                    console.log(tempATT)
                    console.log("tempATT_name")
                    console.log(tempATT_name)
                    socket.emit('user message', {msg : $("#postTextarea").html() ,attaches: tempATT, attachesName:tempATT_name, audioURL:tempATT_audio});
                    clear();
                    return false;
                }
            }else{
                 console.log("Please save recording before sending post or click cancel")
                 $('.notificationButton').trigger("click");
            }

        });
        // Prepend comments for posts 
        $( "#posts" ).on( "keydown", "textarea", function(event) {
            if ( event.which == 13 && $(this).val!="" ) {
               event.preventDefault();
               console.log($(this).val())
               // comment($('#activityUSER').val(), $(this).val(), $(this).closest(".comment"))
               socket.emit('user comment',{cmt : $(this).val(),parentID: $(this).closest(".comment").parent().prev().data('postid')});
               //clear the input
               $(this).val('')
            }
        });

        function clear () {
            $('#postTextarea').html('')
            $("#inputAttachments").html('')
        };
    });
    

    function message (message) {
        var mess=eval ("(" + message + ")");
        from = mess.fromMessage
        msg = mess.message
        created = mess.createTime
        msgID = mess.msgID
        console.log(mess.message)
        console.log(from+" says: "+msg.msg);
        if(msg.attaches.length>0){
            var tempAttachments ='<p class="attachDIV well " style="padding:8px;margin-bottom:0px;border-radius:0px;border:0px;background-color:#F8F8F8;">'
            for(var i=0; i<msg.attaches.length;i++){
                   tempAttachments+='<span><a class="fileLink text-muted" href="'+msg.attaches[i]+'"  > <i class="icon-file-alt"></i> '+msg.attachesName[i]+'</a></span>'
            }
            tempAttachments+='</p>'
        }else{
            tempAttachments=''
        }
        // temporarily add audio to links below the message
        if(msg.audioURL) tempAttachments+='<div id="'+msg.audioURL.slice(0,-4)+'" class="audioDiv"></div>'
        // if(msg.audioURL) tempAttachments+='<p class="attachDIV well " style="padding:8px;">'+'<span><a class="fileLink text-muted" href="'+recorderServer+recorderDirectory+"/"+msg.audioURL+'"  > <i class="icon-file-alt"></i> '+msg.audioURL+'</a></span>'+'</p>'
        var temp = '<li class="left clearfix chatlist" data-postid='+msgID+'><span class="chat-img pull-left"><img src="http://placehold.it/50/55C1E7/fff&amp;text=U" alt='+from+' class="img-circle img-responsive" /></span><div class="chat-body clearfix"><div class="header"><strong class="primary-font">'+from.substr(0,1).toUpperCase()+from.substr(1)+'</strong> <small class="pull-right text-muted"><span class="glyphicon glyphicon-time"></span>'+created+'</small></div><p>'+msg.msg+'</p>'+tempAttachments+'</div></li><div><ul class="comment"> <li class="left clearfix commentlist"><span class="chat-img pull-left"><img src="http://placehold.it/50/55C1E7/fff&amp;text=U" alt={{ user.username }} class="img-circle  img-responsive" /></span><div class="chat-body clearfix"><textarea class="form-control" rows="2"></textarea></div></li></ul></div> ' ;
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
    function comment (message) {
        var mess=eval ("(" + message + ")");
        from = mess.fromMessage
        msg = mess.message
        created = mess.createTime
        msgID = mess.msgID
        parentPost = mess.parentPost
        var pp =$("li[data-postid="+parentPost+"]").next().find('.comment')
        console.log(from+" says(comment): "+msg.cmt);
        console.log(parentPost)
        testtt=pp
        var temp =  '<li class="left clearfix commentlist" data-postid='+msgID+'><span class="chat-img pull-left"><img src="http://placehold.it/50/55C1E7/fff&amp;ltext=U" alt='+from+' class="img-circle  img-responsive" /></span><div class="chat-body clearfix"><div class="header"><strong class="primary-font">'+from.substr(0,1).toUpperCase()+from.substr(1)+'</strong> <small class="pull-right text-muted"><span class="glyphicon glyphicon-time"></span>'+created+'</small></div><p>'+msg.cmt+'</p></div></li>';
        pp.prepend(temp);
    }