// socket.io specific code
var socket = io.connect("http://localhost:9000/discussionsPosts");

socket.on('connect', function () {

    // SPECIFY THREAD ID TO SPECIFY ROOM
    socket.emit( 'join',  $('#activityID').val() );

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
            //Post textarea is not empty 
            if ($('#postTextarea').val().trim()){
                // send Post to server and get a reply of post id
                socket.emit('user message', $("#postTextarea").val());
                clear();
                return false;
            }
        });
        // Prepend comments for posts 
        $( "#posts" ).on( "keydown", "textarea", function(event) {
            if ( event.which == 13 && $(this).val!="" ) {
               event.preventDefault();
               console.log($(this).val())
               // comment($('#activityUSER').val(), $(this).val(), $(this).closest(".comment"))
               socket.emit('user comment',$(this).val(), $(this).closest(".comment").parent().prev().data('postid'));
               //clear the input
               $(this).val('')
            }
        });

        function clear () {
            $('#postTextarea').val('')
        };
    });
    

    function message (from, msg, created, msgID) {
        console.log(from+" says: "+msg);
        var temp = '<li class="left clearfix chatlist" data-postid='+msgID+'><span class="chat-img pull-left"><img src="http://placehold.it/50/55C1E7/fff&amp;text=U" alt='+from+' class="img-circle img-responsive" /></span><div class="chat-body clearfix"><div class="header"><strong class="primary-font">'+from.substr(0,1).toUpperCase()+from.substr(1)+'</strong> <small class="pull-right text-muted"><span class="glyphicon glyphicon-time"></span>'+created+'</small></div><p>'+msg+'</p></div></li><div><ul class="comment"> <li class="left clearfix commentlist"><span class="chat-img pull-left"><img src="http://placehold.it/50/55C1E7/fff&amp;text=U" alt={{ user.username }} class="img-circle  img-responsive" /></span><div class="chat-body clearfix"><textarea class="form-control" rows="2"></textarea></div></li></ul></div>' ;
        $( "#posts2" ).prepend(temp);
    }
    function comment (from, msg, created, msgID, parentPost) {
        var pp =$("li[data-postid="+parentPost+"]").next().find('.comment')
        console.log(from+" says(comment): "+msg);
        console.log(parentPost)
        testtt=pp
        var temp =  '<li class="left clearfix commentlist" data-postid='+msgID+'><span class="chat-img pull-left"><img src="http://placehold.it/50/55C1E7/fff&amp;ltext=U" alt='+from+' class="img-circle  img-responsive" /></span><div class="chat-body clearfix"><div class="header"><strong class="primary-font">'+from.substr(0,1).toUpperCase()+from.substr(1)+'</strong> <small class="pull-right text-muted"><span class="glyphicon glyphicon-time"></span>'+created+'</small></div><p>'+msg+'</p></div></li>';
        pp.prepend(temp);
    }