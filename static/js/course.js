$(document).ready(function(){
    var ajax_URL = $('#course_admin').data("ajaxurl")
    var course_id = $('#course_admin').data("courseid")
    csrftoken=$("input[name=csrfmiddlewaretoken]").val()
    $(".course_admin_togg").click(function(){
      $("#course_admin_div").toggle(20)
    })
    $(".perm_togg").click(function(){
      if ($(this).hasClass('fa-toggle-on')){
          var permission = $(this).closest('div').data('codename')
          var username = $(this).closest('div.admin_row').data('username')
          var changeFlag = ajaxChangePermission(ajax_URL, username, permission, 'course', course_id, 'remove_perm', csrftoken)
          console.log("changeSuccess is : "+ changeFlag)
          // make ajax call to change permission
          if(changeFlag){
              $(this).removeClass('fa-toggle-on text-primary')
              $(this).addClass('fa-toggle-off text-muted')
          }
      }else{
          var permission = $(this).closest('div').data('codename')
          var username = $(this).closest('div.admin_row').data('username')
          console.log(permission)
          var changeFlag = ajaxChangePermission(ajax_URL, username, permission, 'course', course_id, 'assign_perm', csrftoken)
          console.log("changeSuccess is : "+changeFlag)
          // make ajax call to change permission 
          if(changeFlag){
            $(this).removeClass('fa-toggle-off text-muted')
            $(this).addClass('fa-toggle-on text-primary')
          }
      }
    })
    
    //turn to inline mode
    $.fn.editable.defaults.mode = 'inline';
    if($(".editable_lesson_title").size()!=0){
    
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
      })

    }

	});

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

function ajaxChangePermission(ajax_URL, username, code_name, objecttype, objectid, operationType, csrftoken) {
    var changeSuccess=false
    $.ajax({
      type: "POST",
      url: ajax_URL,
      async: false,
      beforeSend: function(xhr) {
              xhr.setRequestHeader("X-CSRFToken", csrftoken);
      },
      data: { object_username:username ,codename: code_name, object_type: objecttype, object_id: objectid, operation_type: operationType }
    })
    .done(function( msg) {
      // alert( );
      console.log(' codename: '+ code_name+'/object_type: '+objecttype+'/object_id: '+ objectid+ '/operation_type: '+operationType)
      console.log("Permission Changed: " + msg )
      if(msg=="successful change"){
        changeSuccess = true
      }else{
        changeSuccess = false
      }
      
    })
    .fail(function( jqXHR, textStatus) {
      // alert( "Request failed: " + textStatus );
      console.log("Request failed: " + textStatus)
      changeSuccess = false
    });
    // console.log(changeSuccess)
    return changeSuccess
}