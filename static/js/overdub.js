// overdub.js

// video play variables
var time_update_interval = 0;
var video = $('#overdubVideo');
var url = video.attr('data-media');
var ytPlayer;

// select player: youtube or upload file?
$(function () {
    if (matchYoutubeUrl(url)) {
        ytVideo(url);
    } else {
        createJw(video);
    }
});

/** - Youtube iFrame API -
 * 
 *  See: https://developers.google.com/youtube/iframe_api_reference
 * 
 *  Youtube player will be controlled by HTML5 recording function. There is a 
 * mute function. The recording does not record youtube sound eventhough youtube 
 * sound is on. The mute funtion for Youtube is the only listener's choice. 
 * Users can record their voice hearing or without hearing the youtube sound.  
 */

function ytVideo(url) {
    var ytScript = document.getElementById('youtube-api');
    var videoId = matchYoutubeUrl(url);


    if (ytScript === null && videoId === null) {
        var tag = document.createElement('script');
        var firstScript = document.getElementsByTagName('script')[0];

        tag.src = 'https://www.youtube.com/iframe_api';
        tag.id = video;
        firstScript.parentNode.insertBefore(tag, firstScript);
    }

    window.onYouTubeIframeAPIReady = function () {
        ytPlayer = new window.YT.Player('overdubVideo', {
            heigh: '320',
            width: '480',
            videoId: videoId,
            // host      : 'https://youtube.com', // FIXME: DOM error because the orignal target is youtube  
            playerVars: {
                origin: 'localhost:8000', // TODO: change on a live server
                color: 'white',
                autoplay: 0,
                controls: 0,
                rel: 0,
                showinfo: 0,
                audohide: 0,
            },
            events: {
                onReady: initialize,
            },
        });
    };

    // youtube mute or unmute
    ytMute.checked = false; // initial mute button is uncheck, some browsers needs to refresh the cache. 
    ytMute.addEventListener('click', function () {
        if (ytMute.checked) {
            ytPlayer.mute();
        } else {
            ytPlayer.unMute();
        }
    });
}

// Youtube progress bar
$('#progress-bar').on('mouseup touchend', function (e) {
    // Calculate the new time for the video.
    // new time in seconds = total duration in seconds * ( value of range input / 100 )
    var newTime = ytPlayer.getDuration() * (e.target.value / 100);
    // Skip video to new time.
    ytPlayer.seekTo(newTime);
});

// Youtube init
function initialize() {

    // Update the controls on load
    updateTimerDisplay();
    updateProgressBar();

    // Clear any old interval.
    clearInterval(time_update_interval);

    // Start interval to update elapsed time display and
    // the elapsed part of the progress bar every second.
    time_update_interval = setInterval(function () {
        updateTimerDisplay();
        updateProgressBar();
    }, 1000);


    $('#volume-input').val(Math.round(ytPlayer.getVolume()));
}

// This function is called by initialize()
function updateProgressBar() {
    // Update the value of our progress bar accordingly.
    $('#progress-bar').val((ytPlayer.getCurrentTime() / ytPlayer.getDuration()) * 100);
}

function updateTimerDisplay() {
    // Update current time text display.
    $('#current-time').text(formatTime(ytPlayer.getCurrentTime()));
    $('#duration').text(formatTime(ytPlayer.getDuration()));
}

function formatTime(time) {
    time = Math.round(time);

    var minutes = Math.floor(time / 60),
        seconds = time - minutes * 60;

    seconds = seconds < 10 ? '0' + seconds : seconds;

    return minutes + ':' + seconds;
}

// Verification YouTube url
function matchYoutubeUrl(url) {
    var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if (url.match(p)) {
        return url.match(p)[1];
    }
    return false;
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
var ytMute = document.getElementById('youtube-mute');
var recording = false;

var canvas = document.getElementById('analyser');
var soundClips  = document.querySelector('.sound-clips');
var mainSection = document.querySelector('.main-controls');

var sendPost = document.querySelector('#sendPost');

const filename = ()=> {
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

    var promisifiedOldGUM = function (constraints, successCallback, errorCallback) {

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

//main block for doing the audio recording
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
            if(clipName === null) {
                return;
            }else{

                // recorded audio blob
                var blob = new Blob(chunks, {
                    // 'type': 'audio/ogg; codecs=opus' // MS Windows not support as a default
                    'type': 'audio/wav'
                    // 'type': 'audio/mpeg-3' // needs ffmpeg
                });
                chunks = [];

                var audioURL = window.URL.createObjectURL(blob);
                var clip = clipName+'.wav';

                // display a form for the recorded audio
                var csrf_token = $('input[name=csrfmiddlewaretoken]').val();
                $('#sound-clips').append('<form id="'+clipName+'" method="POST" style="border: 1px solid black; padding: 3px 3px 3px 3px;"></form>');
                $('#'+clipName).append('<audio controls src="'+audioURL+'"></audio>');
                $('#'+clipName).append('<input id="'+clipName+'" class="form-control" type="text" placeholder="'+clip+'" readonly>');
                $('#'+clipName).append('<button id="'+clipName+'-upload" type="button" class="btn btn-success btn-sm upload"><i class="fas fa-cloud-upload-alt"></i> Upload</button> ');
                $('#'+clipName).append('<button id="'+clipName+'-delete" type="button" class="btn btn-danger btn-sm delete"><i class="fas fa-trash-alt"></i> Delete</button> ');
                
                $('#'+clipName+'-upload').click((e) => {
                    // START: upload indivisual file and return the url

                    $.ajax({
                        url: '/upload/',
                        type: 'POST',
                        data: {
                            csrfmiddlewaretoken: csrf_token,
                            files: []
                        },

                        success: function(data) {
                            console.log('success');
                            console.log(data);
                        },
                        error: function (errmsg) {
                            console.log(errmsg);
                        }
                    });
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

        //TODO: comment part
        if (data.parent) {
            $('#'+data.parent+'-comments').find('ul').prepend(message);
        } else {
            $('#posts').prepend(message);
        }
        
    };

    chatSocket.onclose = function (e) {
        console.error('Chat socket closed unexpectedly');
    };

    // save post and send chat window
    $('#sendPost').click(function () {
        console.log('Try submit...');

        // TODO: File upload before posting, use formData
        var blobURL = $('input[type="radio"]:checked').val();
        var filename = $('input[type="radio"]:checked').attr('id') + ".wav";
        var uploadFile = document.getElementById('fileupload').value;

        // Select between upload file and recordings
        // if(blobURL == 'fileupload') {
        //     blobURL = uploadFile;
        // }

        console.log('BlobURL: ' + blobURL);

        // Post
        $.ajax({
            url: sendPost.value,
            type: 'POST',
            csrftoken: $('input[name=csrfmiddlewaretoken]').val(),
            data: {
                text: $('#postTextarea').val(),
                activity_id: sendPost.dataset.activityId,
                activity_type: sendPost.dataset.activityType,

                user: sendPost.dataset.user,
                user_is_instructor: $('#activity_title').data('userisinstructor'),

                post_area: $('#posts').val(),
                posts: $('#posts2').val(),

            },
            success: function (data) {
                $('#postTextarea').val('');
                // remove 'comment remove button'
                var message = data.replace('<small id="removeButton"><a class="text-muted removePost" style="text-decoration:none;cursor:pointer;"><i class="fas fa-times text-danger"></i></a></small>','');
                chatSocket.send(JSON.stringify({
                    'parent': '',
                    'message': message,
                }));
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
        var postId = $(this).parent().attr('id');
        
        // TODO: comment 
        $('#send-'+postId+'-comment').click(function (data) {
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
                    console.log('Post submitted!');
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

// Another player
// TODO: it will be replaced wirh HTML5 video player
function createJw(video) {
    // play all media except youtube video
    jwplayer('overdubVideo').setup({
        file: file,
        width: '100%',
        skin: skin,
        autostart: true,
        controls: false,
        mute: true
    });
    // Added auto buffering for overdub Video
    initialPause = 1;
    jwplayer('overdubVideo').onTime(function (time) {
        if (initialPause == 1) {
            jwplayer('overdubVideo').pause();
            jwplayer('overdubVideo').setVolume(100);
            initialPause = 0;

        }
    });
}
