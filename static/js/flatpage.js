$(document).ready(function() {
    ActivityCopy.init();
    ActivityPermissionsAdmin.init();

    $('.videoAttachment').click(function() {
        var videoDiv = $(this).parent('div').find('.videoPlayDiv');
        videoDiv.find('video').get(0).pause();
        videoDiv.toggle();
    });

    // tooltips
    $('.aa-tooltip').tooltip();
});
