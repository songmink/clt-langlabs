// Post message by django channel
$(document).ready(function () {
    // start channel handshaking
    var formChat = document.getElementById('overdub');
    var roomName = formChat.getAttribute('data-activity-type') + '-' + formChat.getAttribute('data-activity-id');
    var chatSocket = new WebSocket(
        'ws://' + window.location.host + '/overdub/' + roomName);  // Set the route on /core/routing.py

    chatSocket.onmessage = function (e) {
        var data = JSON.parse(e.data);
        var message = data.message;
        var user = data.user;

        // Post or Comment 
        if (data.parent) {
            $('#'+data.parent+'-comments').find('ul').prepend(message);
            (user == $('#navbar').data('username') ? '' : alertMessage('alert-success', 'A new comment arrived.'));
            
        } else {
            $('#posts').prepend(message);
            (user == $('#navbar').data('username') ? '' : alertMessage('alert-success', 'A new post arrived.'));
        }
        
    };

    chatSocket.onopen = function (e) {
        alertMessage('alert-info', 'Chat connection opened.');
        console.error('Chat socket closed unexpectedly: ' + e);
    };

    chatSocket.onclose = function (e) {
        alertMessage('alert-warning', 'Chat connection closed!');
        console.error('Chat socket closed unexpectedly: ' + e);
    };

    // save post and send chat window
    $('#chatTrigger').click(function () {
        console.log('Try submit...');

        // Post
        // START: post with upload file
        // TODO: if there are recorded files, uploaded files, upload first and save all post info to chat, else save post only
        var csrftoken = $('input[name=csrfmiddlewaretoken]').val();
        var formData = new FormData();
        var filename = $('#selected').data('filename')+'.wav';
        var blobId = $('#selected').find('audio').data('blob-id');
        

        formData.append('text', $('#postTextarea').val());
        formData.append('activity_id', sendPost.dataset.activityId);
        formData.append('activity_type', sendPost.dataset.activityType);
        formData.append('user', sendPost.dataset.user);
        formData.append('user_is_instructor', $('#activity_title').data('userisinstructor'));
        formData.append('post_area', $('#posts').val());
        formData.append('posts', $('#posts2').val());

        if (blob.length){
            var file = blob[blobId];
            formData.append('file', new File([file],filename));
        }

        $.ajax({
            url: sendPost.value,
            type: 'POST',
            csrftoken: csrftoken,
            processData: false,
            contentType: false,
            data: formData,
            start: function (e) {
                $('#modal-progress').modal('show');
            },
            stop: function (e) {
                $('#modal-progress').modal('hide');
            },
            progressall: function (e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                var strProgress = progress + '%';
                $('.progress-bar').css({'width': strProgress});
                $('.progress-bar').text(strProgress);
            },
            success: function (data) {
                $('#postTextarea').val('');
                // remove 'comment remove button'
                var message = data.replace('<small id="removeButton"><a class="text-muted removePost" style="text-decoration:none;cursor:pointer;"><i class="fas fa-times text-danger"></i></a></small>','');

                chatSocket.send(JSON.stringify({
                    'parent': '',
                    'message': message,
                    'user': $('#navbar').data('username')
                }));
                $('#selected').empty();
                $('#sound-clips :button').attr('disabled', false);
                $('#btn-record').attr('disabled', false);
                alertMessage('alert-success', 'Your post is submitted.');
                console.log('Post submitted!');
            },
            error : function(jqXHR,errmsg) {
                $('#results').html('<div class="alert-box alert radius" data-alert>Oops! We have encountered an error: '+errmsg+
                    ' <a href="#" class="close">&times;</a></div>'); // add the error to the dom
                console.log(jqXHR.status + ': ' + errmsg); // provide a bit more info about the error to the console
            },
        });
        console.log('Finish!');
        return false;
    });

    // toggles comments (replies) from a post
    $('#posts').on('click', '.chatlist', function(e) {
        if ($(e.target).is('.fileLink'))  return;
        if ($(e.target).is('.attachDIV')) return;
        $(this).next().find('.comment').slideToggle('fast');

        // comment under post 
        var postId = $(this).parent().attr('id');
        $('#send-'+postId+'-comment').click(function () {

            $.ajax({
                url: sendPost.value,
                type: 'POST',
                csrftoken: $('input[name=csrfmiddlewaretoken]').val(),
                data: {
                    text: $('#'+postId+'-comment').val(),
                    activity_id: sendPost.dataset.activityId,
                    activity_type: sendPost.dataset.activityType,
                    parent_post: postId,

                    user: sendPost.dataset.user,
                    user_is_instructor: $('#activity_title').data('userisinstructor'),

                },
                success: function (data) {
                    $('#'+postId+'-comment').val('');
                    // remove 'comment remove button' on the chat 
                    var message = data.replace('<small id="removeButton"><a class="text-muted removePost" style="text-decoration:none;cursor:pointer;"><i class="fas fa-times text-danger"></i></a></small>','');
                    chatSocket.send(JSON.stringify({
                        'parent': postId,
                        'message': message,
                        'user': $('#navbar').data('username')
                    }));
                    alertMessage('alert-success', 'Your comment is submitted.');
                    console.log('Comment submitted!');
                },
                error : function(jqXHR,errmsg) {
                    $('#results').html('<div class="alert-box alert radius" data-alert>Oops! We have encountered an error: '+errmsg+
                        ' <a href="#" class="close">&times;</a></div>'); // add the error to the dom
                    console.log(jqXHR.status + ': ' + errmsg); // provide a bit more info about the error to the console
                },
            });
        });
    });

});
