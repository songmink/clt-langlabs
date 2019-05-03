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
var sendPost = document.querySelector('#chatTrigger');
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
                $('#sound-clips').append('<div id="'+clipName+'" style="border:1px solid aqua; padding: 5px; margin: 5px;"></div>');
                $('#'+clipName).append('<lavel>'+clipName+'</lavel><br>');
                $('#'+clipName).append('<audio id="'+clipName+'-blob" controls src="'+audioURL+'" data-blob-id='+last+'></audio><br>');
                $('#'+clipName).append('<button id="'+clipName+'-select" type="button" class="clip-select btn btn-success btn-sm select"><i class="fas fa-paperclip"></i> Select</button> ');
                $('#'+clipName).append('<button id="'+clipName+'-delete" type="button" class="btn btn-danger btn-sm delete"><i class="fas fa-trash-alt"></i> Delete</button> ');
                $('#'+clipName).append('<button id="'+clipName+'-deselect" type="button" class="btn btn-warning btn-sm deselect" hidden><i class="fas fa-undo"></i> Deselect</button> ');
                
                $('#'+clipName+'-select').click(() => {
                    $('#selected').attr('data-filename', clipName);
                    $('#'+clipName).appendTo('#selected');
                    $('#'+clipName+'-select').hide();
                    $('#'+clipName+'-deselect').attr('hidden', false);
                    $('#sound-clips :button').attr('disabled', true);
                    $('#btn-record').attr('disabled', true);
                });

                $('#'+clipName+'-deselect').click(() => {
                    $('#'+clipName).appendTo('#sound-clips');
                    $('#'+clipName+'-select').show();
                    $('#'+clipName+'-deselect').attr('hidden', true);
                    $('#sound-clips :button').attr('disabled', false);
                    $('#btn-record').attr('disabled', false);
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
