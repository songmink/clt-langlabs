// collection_edit.js

$(document).ready(function () {

    // tooltips for question marks
    if ($('#div_id_accesscode').length != 0) {
        $('#div_id_accesscode .control-label').after(' <small><i class="fa questionMark fa-question" style="cursor:pointer;" data-toggle="tooltip" data-placement="right" title="Enter a 10 character code that students will use to subscribe to this course (e.g. l@ng@bzRoXXX)"></i></small>');
    }

    if ($('#div_id_is_active').length != 0) {
        $('#div_id_is_active').append(' <small><i class="fa questionMark fa-question" style="cursor:pointer;" data-toggle="tooltip" data-placement="right" title="Students can view and participate in a course only while it is active. On the other hand, students cannot view nor subscribe to an inactive course. For instance, deactivate the course while you populate its content and activate it when it is ready."></i></small>');
    }

    if ($('#div_id_is_public').length != 0) {
        $('#div_id_is_public').append(' <small><i class="fa questionMark fa-question" style="cursor:pointer;" data-toggle="tooltip" data-placement="right" title="Anyone in Lang Labs can participate in a public course and the subscription code is public. Uncheck this box to hide the subscription code and make the course private."></i></small>');
    }
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
