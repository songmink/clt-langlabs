$( document ).ready(function() {
  // Handler for .ready() called.

  // combine "youtubeURL" and "file upload" together
  $("#div_id_media").addClass(" tab-pane active ")
  .find('label').remove();

  $("#div_id_upload_video").addClass(" tab-pane ")
  .find('label').remove();
  var newElements = '\
        <ul class="nav nav-tabs" style="margin-bottom:12px;">\
          <li class="active"><a href="#div_id_media" data-toggle="tab" style="padding: 5px 8px 0px 5px;"><label>Video URL (e.g. http://youtu.be/DJ9zIuFoQ5o)</a></li></label>\
          <li><a href="#div_id_upload_video" data-toggle="tab" style="padding: 5px 8px 0px 5px;"><label>Upload a Video</label></a></li>\
        </ul>\
        <div id="video_tabs" class="tab-content">\
        </div>\
        '

  $( newElements ).insertAfter( "#div_id_instructions" );
  $("#div_id_media").appendTo($("#video_tabs"));
  $("#div_id_upload_video").appendTo($("#video_tabs"));
});