// overdub.js

// play variables
var time_update_interval = 0;
var video                = $("#overdubVideo");
var url                  = video.attr('data-media');
var player;

// recorder controller variables
var recordButton = document.getElementById("btn-record");
var playButton   = document.getElementById("btn-play");
var removeButton = document.getElementById("btn-remove");
var saveButton   = document.getElementById("btn-save");
var youtubeMute  = document.getElementById("youtube-mute");
var recFlag      = false;
var filename     = document.getElementById("record-save").dataset.filename;
var canvas       = document.getElementById("wavedisplay");

// select player: youtube or upload file?
$(function () {
    if (matchYoutubeUrl(url)) {
        createVideo(url);
    } else {
        createJw(video);
    }
});

// display the youtube video on the page
function createVideo(url) {
    var youtubeScript = document.getElementById("youtube-api");
    var videoId       = matchYoutubeUrl(url);

    if (youtubeScript === null && videoId === null) {
        var tag         = document.createElement("script");
        var firstScript = document.getElementsByTagName("script")[0];

        tag.src = "https://www.youtube.com/iframe_api";
        tag.id  = youtubeScriptId;
        firstScript.parentNode.insertBefore(tag, firstScript);
    }

    onYouTubeIframeAPIReady = function () {
        player = new window.YT.Player('overdubVideo', {
            heigh  : '320',
            width  : '480',
            videoId: videoId,
            // host      : 'https://youtube.com',
            playerVars: {
                origin  : 'localhost:8000',
                color   : 'white',
                autoplay: 0,
                controls: 1,
                rel     : 0,
                showinfo: 0,
                audohide: 0,
            },
            events: {
                onReady: initialize,
            },
        });
    };
}

// recorder controller
$(function () {
    // init for Firefox
    youtubeMute.checked   = false;
    playButton.disabled   = true;
    removeButton.disabled = true;
    saveButton.disabled   = true;

    // youtube sound control
    youtubeMute.addEventListener("click", function () {
        if (youtubeMute.checked) {
            player.mute();
        } else {
            player.unMute();
        }
    });

    // record button event
    recordButton.addEventListener("click", function () {
        if (recFlag) {
            player.stopVideo();
            recFlag = false;

            // change the record button color and word
            recordButton.classList.remove("btn-danger");
            recordButton.classList.add("btn-secondary");
            recordButton.innerHTML = "<i class='fas fa-microphone-alt'></i> Record";

            // change the record save button
            playButton.disabled   = false;
            removeButton.disabled = false;
            saveButton.disabled   = false;

        } else {
            if (player.getPlayerState() != -1) {
                player.stopVideo();
            }
            player.playVideo();
            recFlag = true;

            // change the record button color and word
            recordButton.classList.remove("btn-secondary");
            recordButton.classList.add("btn-danger");
            recordButton.innerHTML = "<i class='fas fa-stop-circle'></i> Recording...";

            // change the buffer control buttons
            playButton.disabled   = true;
            removeButton.disabled = true;
            saveButton.disabled   = true;

        }

    });

    // TODO: Implement play buffer 
    playButton.addEventListener("click", function () {
        playSound();
    });

    // clear recorded buffer
    removeButton.addEventListener("click", function () {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        // change the buffer control buttons
        playButton.disabled   = true;
        removeButton.disabled = true;
        saveButton.disabled   = true;

    });

});

// Youtube progress bar
$('#progress-bar').on('mouseup touchend', function (e) {
    // Calculate the new time for the video.
    // new time in seconds = total duration in seconds * ( value of range input / 100 )
    var newTime = player.getDuration() * (e.target.value / 100);
    // Skip video to new time.
    player.seekTo(newTime);
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


    $('#volume-input').val(Math.round(player.getVolume()));
}

// This function is called by initialize()
function updateProgressBar() {
    // Update the value of our progress bar accordingly.
    $('#progress-bar').val((player.getCurrentTime() / player.getDuration()) * 100);
}

function updateTimerDisplay() {
    // Update current time text display.
    $('#current-time').text(formatTime(player.getCurrentTime()));
    $('#duration').text(formatTime(player.getDuration()));
}

function formatTime(time) {
    time = Math.round(time);

    var minutes = Math.floor(time / 60),
        seconds = time - minutes * 60;

    seconds = seconds < 10 ? '0' + seconds : seconds;

    return minutes + ":" + seconds;
}

// Verification YouTube url
function matchYoutubeUrl(url) {
    var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if (url.match(p)) {
        return url.match(p)[1];
    }
    return false;
}

// Another player
function createJw(video) {
    // play all media except youtube video
    jwplayer("overdubVideo").setup({
        file     : file,
        width    : "100%",
        skin     : skin,
        autostart: true,
        controls : false,
        mute     : true
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