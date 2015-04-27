// collection_edit.js

$(document).ready(function () {

    // tooltips for question marks
    if ($('#div_id_accesscode')) {
        $('#div_id_accesscode .control-label').after(' <small><i class="fa questionMark fa-question" style="cursor:pointer;" data-toggle="tooltip" data-placement="right" title="Enter a 10 character code that students will use to subscribe to this course (e.g. l@ng@bzRoXXX)"></i></small>');
    }

/*
    if ($('#div_id_is_active')) {
        $('#div_id_is_active').append(' <small><i class="fa questionMark fa-question" style="cursor:pointer;" data-toggle="tooltip" data-placement="right" title="Check this box to allow students to participate in the course, uncheck this box to only allow instructors to view the course"></i></small>');
    }

    if ($('#div_id_is_public')) {
        $('#div_id_is_public').append(' <small><i class="fa questionMark fa-question" style="cursor:pointer;" data-toggle="tooltip" data-placement="right" title="wat?"></i></small>');
    }
*/
    $('.questionMark').mouseenter(function() {

        $(this).tooltip('show')
        $(this).addClass('fa-question-circle')
        $(this).removeClass('fa-question')
    })
    .mouseleave(function() {
 
        $(this).tooltip('hide')
        $(this).removeClass('fa-question-circle')
        $(this).addClass('fa-question')
    });

});
