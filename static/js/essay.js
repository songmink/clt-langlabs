$(document).ready(function(){
        // below is permission change operations
    var ajax_URL = $('#activity_admin').data("ajaxurl")
    var activity_id = $('#activity_admin').data("activityid")
    csrftoken=$("input[name=csrfmiddlewaretoken]").val()
    $(".activity_admin_togg").click(function(){
      $("#activity_admin_div").toggle(20)
    })
    $(".perm_togg").click(function(){
      if ($(this).hasClass('fa-toggle-on')){
          var permission = $(this).closest('div').data('codename')
          var username = $(this).closest('div.admin_row').data('username')
          var changeFlag = ajaxChangePermission(ajax_URL, username, permission, 'essay', activity_id, 'remove_perm', csrftoken)
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
          var changeFlag = ajaxChangePermission(ajax_URL, username, permission, 'essay', activity_id, 'assign_perm', csrftoken)
          console.log("changeSuccess is : "+changeFlag)
          // make ajax call to change permission 
          if(changeFlag){
            $(this).removeClass('fa-toggle-off text-muted')
            $(this).addClass('fa-toggle-on text-primary')
          }
      }
    })
    $(".control_togg").click(function(){
      if ($(this).hasClass('fa-toggle-on')){
          var permission = 'no_permission'
          var username = 'no user'
          var changeFlag = ajaxChangePermission(ajax_URL, username, permission, 'essay', activity_id, 'disable_control', csrftoken)
          console.log("changeSuccess is : "+ changeFlag)
          // make ajax call to change permission
          if(changeFlag){
              $(this).removeClass('fa-toggle-on text-primary')
              $(this).addClass('fa-toggle-off text-muted')
          }
      }else{
          var permission = "no_permission"
          var username = "no user"
          console.log(permission)
          var changeFlag = ajaxChangePermission(ajax_URL, username, permission, 'essay', activity_id, 'enable_control', csrftoken)
          console.log("changeSuccess is : "+changeFlag)
          // make ajax call to change permission 
          if(changeFlag){
            $(this).removeClass('fa-toggle-off text-muted')
            $(this).addClass('fa-toggle-on text-primary')
          }
      }
    })
    $('.column_togg').click(function(){
      var column_togg_class = $(this).data('columnclass')
      if(column_togg_class=='view_activity'){
        var toggObjects = $('.view_activity')
      }
      if( toggObjects.hasClass('text-primary') && toggObjects.hasClass('text-muted')){
          toggObjects.each(function(i){
            if($(this).hasClass('text-primary')){
              $(this).trigger( "click" )
            }
          })
      }else{
          toggObjects.each(function(i){
                $(this).trigger( "click" )
            })
      }

    })

});
// below is permission change functions

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








