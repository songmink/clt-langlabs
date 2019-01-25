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

/*
 * Youtube player
 */

function ytVideo(url) {
    var ytScript = document.getElementById('youtube-api');
    var videoId = matchYoutubeUrl(url);


    if (ytScript === null && videoId === null) {
        var tag = document.createElement('script');
        var firstScript = document.getElementsByTagName('script')[0];

        tag.src = 'https://www.youtube.com/iframe_api';
        tag.id = ytScriptId;
        firstScript.parentNode.insertBefore(tag, firstScript);
    }

    onYouTubeIframeAPIReady = function () {
        ytPlayer = new window.YT.Player('overdubVideo', {
            heigh: '320',
            width: '480',
            videoId: videoId,
            // host      : 'https://youtube.com',
            playerVars: {
                origin: 'localhost:8000',
                color: 'white',
                autoplay: 0,
                controls: 1,
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
 * See: 'https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API'
 */

// Set up recorder's variables
var btnRecord = document.getElementById('btn-record');
var ytMute = document.getElementById('youtube-mute');
var recording = false;

var canvas = document.getElementById('analyser');
var soundClips  = document.querySelector('.sound-clips');
var mainSection = document.querySelector('.main-controls');

const filename = ()=> {
    var now = new Date().toISOString();
    var name = document.getElementById('record-ctrl').dataset.filename.replace(/ /g, '-')+'_'+now.replace(/:/g,'-');
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

})();

// visualiser setup - create web audio api context and canvas

var audioCtx = new(window.AudioContext || webkitAudioContext)();
var canvasCtx = canvas.getContext('2d');

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

                recording = true;
            }
        };

        // When stopped the recording, display the recording as a temporary file
        mediaRecorder.onstop = function (e) {
            console.log('data available after MediaRecorder.stop() called.');

            var clipName = prompt('Enter a name for your sound clip?', filename());
            if(clipName === null) {
                return;
            }else{

                console.log(clipName);

                var clipContainer = document.createElement('div');
                var clipInput = document.createElement('input');
                var audio = document.createElement('audio');
                var clipLabel = document.createElement('label');
                var deleteButton = document.createElement('button');
                var clipBr = document.createElement('br');

                clipContainer.classList.add('form-check');
                clipContainer.classList.add('clip');

                clipInput.classList.add('form-check-input');
                clipInput.setAttribute('type', 'radio');
                clipInput.setAttribute('id', filename());
                clipInput.setAttribute('name', 'temp');

                audio.setAttribute('controls', '');

                clipLabel.classList.add('form-check-label');
                clipLabel.setAttribute('for', filename());

                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
                deleteButton.className = 'btn btn-danger btn-sm delete';

                if (clipName === null) {
                    clipLabel.textContent = filename();
                } else {
                    clipLabel.textContent = clipName;
                }
                
                // Create temporary sound list
                clipContainer.appendChild(audio);
                clipContainer.appendChild(clipBr);
                clipContainer.appendChild(clipInput);
                clipContainer.appendChild(clipLabel);
                clipContainer.appendChild(deleteButton);

                soundClips.appendChild(clipContainer);

                audio.controls = true;
                var blob = new Blob(chunks, {
                    'type': 'audio/ogg; codecs=opus'
                });
                chunks = [];
                var audioURL = window.URL.createObjectURL(blob);
                audio.src = audioURL;
                console.log('recorder stopped');

                deleteButton.onclick = function (e) {
                    var evtTgt = e.target;
                    evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
                };

                clipLabel.onclick = function () {
                    var existingName = clipLabel.textContent;
                    var newClipName = prompt('Enter a new name for your sound clip?');
                    if (newClipName === null) {
                        clipLabel.textContent = existingName;
                    } else {
                        clipLabel.textContent = newClipName;
                    }
                };
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
    console.log('getUserMedia not supported on your browser!');
}

function visualize(stream) {
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