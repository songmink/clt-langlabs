$(document).ready(function(){
    // below is permission change operations
    var ajax_URL = $('#activity_admin').data("ajaxurl")
    var activity_id = $('#activity_admin').data("activityid")
    // initialize the rich text editor
    rteInit()

    csrftoken=$("input[name=csrfmiddlewaretoken]").val()
    $(".activity_admin_togg").click(function(){
      $("#activity_admin_div").toggle(20)
    })
    $(".perm_togg").click(function(){
      if ($(this).hasClass('fa-toggle-on')){
          var permission = $(this).closest('div').data('codename')
          var username = $(this).closest('div.admin_row').data('username')
          var changeFlag = ajaxChangePermission(ajax_URL, username, permission, 'essay', activity_id, 'remove_perm', csrftoken)
          // console.log("changeSuccess is : "+ changeFlag)
          // make ajax call to change permission
          if(changeFlag){
              $(this).removeClass('fa-toggle-on text-primary')
              $(this).addClass('fa-toggle-off text-muted')
          }
      }else{
          var permission = $(this).closest('div').data('codename')
          var username = $(this).closest('div.admin_row').data('username')
          // console.log(permission)
          var changeFlag = ajaxChangePermission(ajax_URL, username, permission, 'essay', activity_id, 'assign_perm', csrftoken)
          // console.log("changeSuccess is : "+changeFlag)
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
          // console.log("changeSuccess is : "+ changeFlag)
          // make ajax call to change permission
          if(changeFlag){
              $(this).removeClass('fa-toggle-on text-primary')
              $(this).addClass('fa-toggle-off text-muted')
          }
      }else{
          var permission = "no_permission"
          var username = "no user"
          // console.log(permission)
          var changeFlag = ajaxChangePermission(ajax_URL, username, permission, 'essay', activity_id, 'enable_control', csrftoken)
          // console.log("changeSuccess is : "+changeFlag)
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

    $(".activity_members_togg").click(function(){
      $("#activity_members_div").toggle(20)
    })

  // activity copy related code 
  $(".activity_copy_togg").click(function(){
      $("#activity_copy_div").toggle(20)
    })

  $("#activity_copy_btn").click(function(){
    var ajax_temp_URL= $(this).data('ajaxurl')
    var activity_temp_type = $(this).data('activitytype')
    var activity_temp_id = $(this).data('activityid')
    var course_temp_name = $("#activity_copy_course").val()
    var course_temp_id = $("option").filter(function(i,e){
    return $(this).text()==course_temp_name ;
    }).data('courseid')
    var csrftoken=$("input[name=csrfmiddlewaretoken]").val()
    ajaxCopyActivity(ajax_temp_URL, activity_temp_type, activity_temp_id, course_temp_name, course_temp_id, csrftoken)
  })

  // save or submit a draft
  $(".draftEditBtn").click(function(){
    var ajax_temp_URL = $(this).data('ajaxurl')
    var temp_operation = $(this).data('operation')
    var temp_essay_id = $(this).data("essayid")
    var temp_draft_title = $("#draft_title").val().trim()
    var temp_draft_content = tinymce.get('essayTextarea').getContent()
    ajaxEditEssayDraft(ajax_temp_URL, temp_operation, temp_essay_id, temp_draft_title, temp_draft_content, csrftoken)
  })

  // Publish comments
  $( "#essay_discussion" ).on( "keypress", "textarea", function(event) {

      if ( event.which == 13 && $(this).val!="" ) {
         event.preventDefault();

         var ajaxURL = $("#essay_discussion").data('ajaxurl')
         var content = $(this).val()
         var activityID = $(this).closest('ul').data('responseid')
         var activityType = $("#essay_discussion").data('activitytype')

         sendComment( ajaxURL,activityType, activityID, content, csrftoken)
      }
  });
  // toggle with draft version
  $( "#essay_discussion" ).on( "click", '.draftToggle',function(event) {
    event.preventDefault();
    $(this).closest("div").find(".draftToggle").removeClass('active')
    $(this).addClass('active')
    // console.log($(this).closest("div").find(".draftToggle.active").find('input').first().val())
    var tempShow = $(this).closest("div").find(".draftToggle.active").find('input').first().val()
    $("#"+tempShow).show()
    $(this).closest("div").find(".draftToggle").not(".active").find('input').each(function(){
      var temp_noShow = $(this).val()
      $("#"+temp_noShow).hide()
      // console.log("bad"+$(this).val())
    })
    
  });

  // toggle between draftbook and discussion
  if($(".essaySectionToggle").size()>0){
      $( ".essaySectionToggle" ).on( "click", '.sectionToggle',function(event) {
        event.preventDefault();
        $(this).closest("div").find(".sectionToggle").removeClass('active')
        $(this).addClass('active')
        // console.log($(this).closest("div").find(".sectionToggle.active").find('input').first().val())
        var tempShow = $(this).closest("div").find(".sectionToggle.active").find('input').first().val()
        $("#"+tempShow).show("fast")
        $(this).closest("div").find(".sectionToggle").not(".active").find('input').each(function(){
          var temp_noShow = $(this).val()
          $("#"+temp_noShow).hide("fast")
          // console.log("bad"+$(this).val())
        })
      });
  }
  // toggle between the drafts of different users
  if($(".userResponseToggle")){
      $( ".userResponseToggle" ).on( "click",function(event) {
        // console.log($(this).data('userdraft'))
        var tempShow = $(this).data('userdraft')
        if($("#"+tempShow).size()>0){
          $(".allUserResponses").each(function(){
            $(this).hide()
          })
          $("#"+tempShow).show()
        }
      });
  }

  $( ".userResponseAllToggle" ).on( "click",function(event) {
    
        $(".allUserResponses").each(function(){
          $(this).show()
        })

    });

});
// below is permission change functions

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

// change permission
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
      // console.log(' codename: '+ code_name+'/object_type: '+objecttype+'/object_id: '+ objectid+ '/operation_type: '+operationType)
      // console.log("Permission Changed: " + msg )
      if(msg=="successful change"){
        changeSuccess = true
      }else{
        changeSuccess = false
      }
      
    })
    .fail(function( jqXHR, textStatus) {
      // alert( "Request failed: " + textStatus );
      // console.log("Request failed: " + textStatus)
      changeSuccess = false
    });
    // console.log(changeSuccess)
    return changeSuccess
}

// copy activity
function ajaxCopyActivity(ajax_URL, activitytype, activityid, coursename, courseid, csrftoken){

    $.ajax({
      type: "POST",
      url: ajax_URL,
      async: false,
      beforeSend: function(xhr) {
              xhr.setRequestHeader("X-CSRFToken", csrftoken);
      },
      data: { activity_type: activitytype, activity_id: activityid, course_name: coursename, course_id: courseid}
    })
    .done(function( msg) {
      // alert( );
      // console.log('/activitytype: '+activitytype+'/activityid: '+ activityid+ '/coursename: '+coursename+'/courseid: '+courseid)
      // console.log("Course Copied: " + msg )
      if(msg.indexOf("success_redirect")!=-1){
          window.location.href = msg.slice(16)
      }
      
    })
    .fail(function( jqXHR, textStatus) {
      // console.log("Request failed: " + textStatus)
    });

}

// initializa rich text editor
function rteInit()
    {
        tinymce.init({
            selector: "#essayTextarea",
            skin : 'flat_design_tinymce',
            auto_focus: "essayTextarea",
            statusbar : false,

            toolbar1: "undo redo | forecolor backcolor styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent | emoticons link print",
            plugins: [
              "advlist autolink lists link image charmap print preview hr anchor pagebreak",
              "searchreplace wordcount visualblocks visualchars code fullscreen",
              "insertdatetime media nonbreaking save table contextmenu directionality",
              "emoticons template paste textcolor "
            ],
            menubar: false
        }); 
}

// Save or Submit essay draft
function ajaxEditEssayDraft(ajax_URL, operation, essay_id, draft_title, draft_content, csrftoken){

    // console.log(ajax_URL)
    $.ajax({
      type: "POST",
      url: ajax_URL,
      async: false,
      beforeSend: function(xhr) {
              xhr.setRequestHeader("X-CSRFToken", csrftoken);
      },
      data: { operation: operation, essay_id: essay_id, draft_title: draft_title, draft_content: draft_content}
    })
    .done(function( msg) {
      // alert( );
      // console.log('/operation: '+operation+'/essay_id: '+ essay_id+ '/draft_title: '+draft_title+'/draft_content: '+draft_content)
      // console.log("New Essay Response Edited: " + msg )
      if(msg=='Success' && operation=='submit'){
        // clean up existing contents
        $("#draft_title").val('')
        tinymce.get('essayTextarea').setContent("")
        $( "#submittedDrafts" ).load( window.location.href+" #submittedDrafts2");
        $( "#essay_discussion" ).load( window.location.href+" #essay_discussion2");
      }
      
    })
    .fail(function( jqXHR, textStatus) {
      // console.log('/operation: '+operation+'/essay_id: '+ essay_id+ '/draft_title: '+draft_title+'/draft_content: '+draft_content)
      // console.log("Request failed: " + textStatus)
    });

}

// Traditional way of posting comments
function sendComment(ajax_URL, activitytype, activityid, commentContent, csrftoken){

    $.ajax({
      type: "POST",
      url: ajax_URL,
      async: false,
      beforeSend: function(xhr) {
              xhr.setRequestHeader("X-CSRFToken", csrftoken);
      },
      data: { activity_type: activitytype, activity_id: activityid, text: commentContent}
    })
    .done(function( msg) {
      // alert( );
      // console.log('/activitytype: '+activitytype+'/activityid: '+ activityid+ '/text: '+commentContent)
      // console.log("Essay Comment: " + msg )
      if(msg == 'Post Success'){
          // window.location.href = msg.slice(16)
          // console.log("Post Success and need to manually reload page")

          $( "#essay_discussion" ).load( window.location.href+" #essay_discussion2");
      }
      
    })
    .fail(function( jqXHR, textStatus) {
      // console.log("Request failed: " + textStatus)
    });

}





