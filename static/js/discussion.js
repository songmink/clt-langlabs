// discussion.js

//= requires utils.js
//= requires global.js
//= requires socket.js

// Record Flag: check if user has unuploaded recording before sending
var recordingFlag = false;
$(document).ready(function() {

    ChatClient.init();
    ActivityCopy.init();
    ActivityPermissionsAdmin.init();
    RichTextEditor.init('discussion');
    Recorder.init();
    FileUploader.init();

    // Toggle for attached files
    $( "#connectedDIV" ).on( "mouseenter", ".attachedFile, .attachedAudio", function() {
        $(this).find('.removeIcon').css("opacity",0.95);
    })
    .on( "mouseleave", ".attachedFile", function() {
        $(this).find('.removeIcon').css("opacity",0.05);
    });

    // removes an attached object
    $("#connectedDIV").on( "click", ".removeIcon", function() {
        $(this).closest('span').remove();
    });

    // toggles comments (replies) from a post
    $('#posts').on('click', '.chatlist', function(e) {
        if ($(e.target).is('.fileLink'))  return;
        if ($(e.target).is('.attachDIV')) return;
        $(this).next().find('.comment').slideToggle( "fast" );
    });

    // tooltips
    $('.aa-tooltip').tooltip();
    $('.private_public_label').tooltip();

    $(".activity_members_togg").click(function(){
        $("#activity_members_div").toggle(20);
    });

    // deletes a post/comment
    $('#posts').on('click', '.removePost', function() {
        var ajax_url = $('#posts').data('ajaxurl');
        var post_id = $(this).closest('li').data('postid');
        var data = {'post_id': post_id};
        var csrftoken = $("input[name=csrfmiddlewaretoken]").val();
        Ajax.post(ajax_url, data, csrftoken, function() {
            $("#"+post_id).remove();
        });
    });
});

