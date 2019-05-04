$(document).ready(function() {
    RichTextEditor.init('flatpage');

    // FileUploader.init();
    $('#uploadTrigger').click(function() {
      $('#fileupload').click();
    });

    // Delete attached file
    $("#inputAttachments").on('click', '.removeAttachment', function() {
      var target = $(this);
      var ajax_url = $('#inputAttachments').data('ajaxurl');
      var document_accessURL = $(this).closest('span').find('input').val();
      var data = {'document_accessURL' : document_accessURL};
      var csrftoken = $("input[name=csrfmiddlewaretoken]").val();
      Ajax.post(ajax_url, data, csrftoken, function() {
          target.closest('span').remove();
      });
    });

});

$(function () {
    'use_strict';

    $("#fileupload").fileupload({
        crossDomain: false,
        dataType: 'json',
        done: function (e, data) {  
            $.each(data.result.files, function (index, file) {
                var attFile = '<span class="attachedFile" style="cursor:pointer;">'
                              +'<small><i class="fas fa-times removeAttachment text-danger" style="cursor:pointer; padding-right:15px;" data-toggle="tooltip" data-placement="top" data-original-title="Remove"></i></small>'
                              +'<i class="fas fa-file" style="padding-right: 3px;"></i><a class="fileLink text-muted" href='
                              + file.url
                              + '  target="_blank"><span class="fileName">'
                              + file.name
                              + '</span></a><input type="hidden" name="attachments" value='
                              + file.url
                              +' /><br /></span>';
                $('#inputAttachments').append(attFile);
            });
            $('.removeAttachment').mouseenter(function(e) {

               $(this).tooltip('show');
               $(this).addClass('fa-times-circle');
               $(this).removeClass('fa-times');
            })
            .mouseleave(function(e) {

               $(this).tooltip('hide');
               $(this).removeClass('fa-times-circle');
               $(this).addClass('fa-times');
            });
        }
    });
});

