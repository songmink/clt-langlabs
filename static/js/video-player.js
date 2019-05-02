// video-player.js

// video play variables
var time_update_interval = 0;
var video = $('#overdubVideo');
var url = video.attr('data-media');
var ytPlayer;
var ytMute = document.getElementById('youtube-mute');
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
    var videoId = matchYoutubeUrl(url);
    var tag = document.createElement('script');
    var firstScript = document.getElementsByTagName('script')[0];

    tag.src = 'https://www.youtube.com/iframe_api';
    tag.id = video;
    firstScript.parentNode.insertBefore(tag, firstScript);

    window.onYouTubeIframeAPIReady = function () {
        ytPlayer = new window.YT.Player('player', {
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