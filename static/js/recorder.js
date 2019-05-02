// overdub.js

/*
 * set empty ytPlayer excep overdub 
 */ 
if($('#overdub').length != 0) {
    var ytPlayer;
}

/*
 * HTML5 Media Stream Recorder API
 *  See: 'https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API'
 * 
 *  This recording system will control the Youtube video. When a user start 
 * or stop the recording, youtube video will be started or stopped. However, the 
 * controller of Yuotube video on the screen does not control this recording 
 * system. In other words, during the recording, the user can stop the Youtube 
 * video but the recoding still work. Because users can control the Youtube video
 * without starting their record.
 */

// Set up recorder's variables
var btnRecord = document.getElementById('btn-record');
var recording = false;
var canvas = document.getElementById('analyser');
var mainSection = document.querySelector('.main-controls');
var sendPost = document.querySelector('#uploadTrigger');
var blob=[];

const filename = () => {
    var d = new Date();

    var curr_day = d.getDate();
    var curr_month = d.getMonth() + 1;
    var curr_year = d.getFullYear();

    var curr_hour = d.getHours();
    var curr_min = d.getMinutes();
    var curr_sec = d.getSeconds();
    
    var now =  curr_year+'-'+curr_month+'-'+curr_day+'-'+curr_hour+'-'+curr_min+'-'+curr_sec;

    var name = document.getElementById('record-ctrl').dataset.filename.replace(/ /g, '-')+'_'+now;
    return name;
};

// Media Device getUserMedia poly fill for checking old browsers that do not 
//     support getUserMedia() of HTML5

(function () {

    var promisifiedOldGUM = (constraints, successCallback, errorCallback) => {

        // First get ahold of getUserMedia, if present
        var getUserMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);

        // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
            // all button for record is disabled
            btnRecord.disabled = true;
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(function (successCallback, errorCallback) {
            getUserMedia.call(navigator, constraints, successCallback, errorCallback);
        });

    };

    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }

    // Some browsers partially implement mediaDevices. We can't just assign an object
    // with getUserMedia as it would overwrite existing properties.
    // Here, we will just add the getUserMedia property if it's missing.
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
    }

    // deletes a post/comment
    $('#posts').on('click', '.removePost', function() {
        var ajax_url = $('#posts').data('ajaxurl');
        var post_id = $(this).closest('li').data('postid');
        var data = {'post_id': post_id};
        var csrftoken = $('input[name=csrfmiddlewaretoken]').val();
        Ajax.post(ajax_url, data, csrftoken, function() {
            $('#'+post_id).remove();
        });
    });

})();

// Chat message
if (navigator.mediaDevices.getUserMedia) {
    console.log('getUserMedia supported.');

    var constraints = {
        audio: true
    };
    var chunks = [];

    var onSuccess = function (stream) {
        var mediaRecorder = new MediaRecorder(stream);

        visualize(stream);

        // Start record and Stop record
        btnRecord.onclick = function () {
            if (recording) {
                if(ytPlayer){
                    ytPlayer.stopVideo();
                }
                
                mediaRecorder.stop();
                console.log(mediaRecorder.state);
                console.log('recorder stopped');

                // change the record button color and word
                btnRecord.classList.remove('btn-danger');
                btnRecord.classList.add('btn-secondary');
                btnRecord.innerHTML = '<i class="fas fa-microphone-alt"></i> Record';
                sendPost.classList.remove('disabled');
                recording = false;
            } else {
                mediaRecorder.start();
                console.log(mediaRecorder.state);
                console.log('recorder started');

                if (ytPlayer){
                    if (ytPlayer.getPlayerState() != -1) {
                        ytPlayer.stopVideo();
                    }
                    ytPlayer.playVideo();
                }

                // change the record button color and word
                btnRecord.classList.remove('btn-secondary');
                btnRecord.classList.add('btn-danger');
                btnRecord.innerHTML = '<i class="fas fa-stop-circle"></i> Recording...';
                sendPost.classList.add('disabled');

                recording = true;
            }
        };

        // When stopped the recording, display the recording as a temporary file
        mediaRecorder.onstop = function () {
            console.log('data available after MediaRecorder.stop() called.');
            var fname = filename();

            var clipName = prompt('Enter a file name or use default file name for your sound clip?\n(If you click the cancel, you lost your recording.)', fname);
            if(clipName === '') {
                alertMessage('alert-warning', 'A file should have a name.');
                return;
            }else{

                // recorded audio blob
                var last = blob.length;
                blob[last] = new Blob(chunks, {
                    // 'type': 'audio/ogg; codecs=opus' // MS Windows not support as a default
                    'type': 'audio/wav'
                    // 'type': 'audio/mpeg-3' // needs ffmpeg
                });
                chunks = [];
                var audioURL = window.URL.createObjectURL(blob[last]);

                // display a form for the recorded audio
                $('#sound-clips').append('<div id="'+clipName+'"></div>');
                $('#'+clipName).append('<audio id="'+clipName+'-blob" controls src="'+audioURL+'" data-blob-id='+last+'></audio>');
                $('#'+clipName).append('<button id="'+clipName+'-select" type="button" class="clip-select btn btn-success btn-sm select"><i class="fas fa-paperclip"></i> Select</button> ');
                $('#'+clipName).append('<button id="'+clipName+'-delete" type="button" class="btn btn-danger btn-sm delete"><i class="fas fa-trash-alt"></i> Delete</button> ');
                
                $('#'+clipName+'-select').click(() => {
                    $('#selected').attr('data-filename', clipName);
                    $('#'+clipName+'-blob').appendTo('#selected');
                    $('#'+clipName+'-select').remove();
                    $('#'+clipName+'-delete').remove();
                });

                $('#'+clipName+'-delete').click((e) => {
                    var evtTgt = e.target;
                    evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
                });
            }
        };

        mediaRecorder.ondataavailable = function (e) {
            chunks.push(e.data);
        };
    };

    var onError = function (err) {
        console.log('The following error occured: ' + err);
    };

    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} else {
    alert('Your web browser does not support this recording system.');
    console.log('getUserMedia not supported on your browser!');
}

// visualiser setup - create web audio api context and canvas
function visualize(stream) {
    var audioCtx = new(window.AudioContext || webkitAudioContext)();
    var canvasCtx = canvas.getContext('2d');

    var source = audioCtx.createMediaStreamSource(stream);

    var analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    //analyser.connect(audioCtx.destination);

    draw();

    function draw() {
        var WIDTH = canvas.width;
        var HEIGHT = canvas.height;

        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
        canvasCtx.beginPath();

        var sliceWidth = WIDTH * 1.0 / bufferLength;
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {
            var v = dataArray[i] / 128.0;
            var y = v * HEIGHT / 2;

            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }
}

window.onresize = function () {
    canvas.width = mainSection.offsetWidth;
};
window.onresize();


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

        // Post or Comment 
        if (data.parent) {
            $('#'+data.parent+'-comments').find('ul').prepend(message);
        } else {
            $('#posts').prepend(message);
        }
        
    };

    chatSocket.onclose = function (e) {
        alertMessage('alert-warning', 'Chat connection closed!');
        console.error('Chat socket closed unexpectedly: ' + e);
    };

    // save post and send chat window
    $('#uploadTrigger').click(function () {
        console.log('Try submit...');

        // Post
        // START: post with upload file
        // TODO: if there are recorded files, uploaded files, upload first and save all post info to chat, else save post only
        var csrftoken = $('input[name=csrfmiddlewaretoken]').val();
        var formData = new FormData();
        var filename = $('#selected').data('filename')+'.wav';
        var blobId = $('#selected > audio').data('blob-id');
        

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
                }));
                $('#selected').empty();
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
                    }));
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
