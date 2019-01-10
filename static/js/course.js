// Permission changer
$(document).ready(function() {
    ajax_URL  = $('#course_admin').data("ajaxurl");
    course_id = $('#course_admin').data("courseid");
    csrftoken = $("input[name=csrfmiddlewaretoken]").val();

    // open and close the permission control pane
    $(".course_admin_togg").click(function(){
      $("#course_admin_div").toggle(200);
    });
    
    // turn on and off permissions for certain user by toggle switchs
    $(".perm-togg").on('click', function(){
        if ($(this).find('svg').hasClass('fa-toggle-on')){
            permission = $(this).closest('td').data('codename');
            username   = $(this).closest('tr.admin-row').data('username');
            if (permission !== null && username !== null ){
                // make ajax call to change permission
                changeFlag = ajaxChangePermission(ajax_URL, username, permission, 'course', course_id, 'remove_perm', csrftoken);
                if(changeFlag){
                    $(this)
                        .find('svg')
                        .removeClass('fa-toggle-on text-primary')
                        .addClass('fa-toggle-off text-muted');
                }
            } else {
                // send an error message on the console
                console.log("Check permission or username, something is missing.");
            }

        }else if ($(this).find('svg').hasClass('fa-toggle-off')){
            permission = $(this).closest('td').data('codename');
            username   = $(this).closest('tr.admin-row').data('username');
            if (permission !== null && username !== null ){
                // make ajax call to change permission
                changeFlag = ajaxChangePermission(ajax_URL, username, permission, 'course', course_id, 'assign_perm', csrftoken);
                if(changeFlag){
                    $(this)
                        .find('svg')
                        .removeClass('fa-toggle-off text-muted')
                        .addClass('fa-toggle-on text-primary');
                }
            } else {
                // send an error message on the console
                console.log("Check permission or username, something is missing.");
            }
        }
    });

    //turn to inline mode
    $.fn.editable.defaults.mode = 'inline';
    if($(".editable_lesson_title").length!=0){

      $(".editable_lesson_title").each(function(){
        $(this).editable({
          ajaxOptions: {
            beforeSend: function(xhr) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
                },
          },
          success: function(response, newValue) {
          if(response.status == 'error') return response.msg; //msg will be shown in editable form
          },
        });
      });

    }

    // course administration tooltips
    $('.ca-tooltip').tooltip();
});

// modal to display when user has just created a lesson
// console.log($('#has_created_lesson').data('flag'))
$(function() {
    if ($('#has_created_lesson').data('flag') == 'True') {
        $('#has_created_lesson').modal('show');
    }

    // If no activities have been created, give tour of course
    if ($('#no_activities').length != 0) {
        tour.init();
        tour.start();
    }
});


// tour settings
$(function () {
    user = $('#no_activities').data('username');
    tour = new Tour({
        steps: [
            {
                orphan : true,
                title  : function(){ return 'Welcome, ' + user + '!'; },
                content: '<p>This tour will walk you through some important features of your course.</p><p>If you are a seasoned langlabs user simply press "End Tour" to begin managing your course.</p>',
            },
            {
                element  : '.tour-step.tour-step-two',
                placement: 'bottom',
                title    : 'Course Administration',
                content  : '<p>The Edit option allows you to update course details.</p><p>For example, updating the course title or description, activating or deactivating the course, etc.</p>',
            },
            {
                element  : '.tour-step.tour-step-three',
                placement: 'bottom',
                title    : 'Course Administration',
                content  : '<p>The Delete option deletes the entire course with all associated activites and lessons.</p><p>A confirmation is required so do not worry if you accidentally misclick this option.</p>',
            },
            {
                element  : '.tour-step.tour-step-four',
                placement: 'bottom',
                title    : 'Course Administration',
                content  : '<p>The Course Membership Administration option allows you to grant instructor privileges to course subscribers (e.g. your T.A.).</p><p>Caution! they will have the ability to edit and delete anything from activities up to and including the course itself.</p>',
            },
            {
                element  : '.tour-step.tour-step-five',
                placement: 'bottom',
                title    : 'Course Administration',
                content  : '<p>The Course Copy option allows you to make a duplicate of this course with all the activities and lessons you created.</p><p>So if you teach the same course at a later time, you can simply copy this one and save the time of recreating content.</p>',
           },

            {
                element  : '.tour-step.tour-step-six',
                placement: 'bottom',
                title    : 'Activities',
                content  : '<p>Activities and lessons are the bread and butter of your course. In this dropdown menu you will find the options to create both.</p><p>Actvities are where your students will be interacting with you and each other. And lessons are a way of organizing your activities</p>',
            },
        ],
    });
}());

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

// Function to make changes to permission
function ajaxChangePermission(ajax_URL, username, code_name, objecttype, objectid, operationType, csrftoken) {
    var changeSuccess = false;
    $.ajax({
        type      : "POST",
        url       : ajax_URL,
        async     : false,
        beforeSend: function(xhr) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
        },
        data: { 
            object_username: username,
            codename       : code_name,
            object_type    : objecttype,
            object_id      : objectid,
            operation_type : operationType
        },
        success: function (msg) {
            if(msg=="successful change"){
                changeSuccess = true;
            } else {
                changeSuccess = false;
            }
        }
    });
    return changeSuccess;
}
