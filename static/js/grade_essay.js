$( document ).ready(function() {

  

  // fake the rich text editor using another div
  $("#id_draft").addClass("hidden"); 
  $("#id_review").addClass("hidden"); 
  $( "#id_draft" ).after( '<div id="DraftTextArea" class="form-control" style="border-radius:4px 4px 4px 4px;"></div>' );
  $( "#id_review" ).after( '<div id="ReviewTextArea" class="form-control" style="border-radius:4px 4px 4px 4px;"></div>' );
  rteInit("#DraftTextArea")
  rteInit("#ReviewTextArea")
  $( "#DraftTextArea" ).append( $("#id_draft").val());
  $( "#ReviewTextArea" ).append( $("#id_review").val());
  $( "form" ).submit(function( event ) {
      $( "#id_draft" ).val($("#DraftTextArea").html())
      $( "#id_review" ).val($("#ReviewTextArea").html())
    });
  if($('#div_id_flagged').size()==1){
    $('#div_id_flagged').append(' <small><i class="fa questionMark fa-question" style="cursor:pointer;" data-toggle="tooltip" data-placement="right" title="Flag the content of this post to be in appropriate and other students will not be able to view its content."></i></small>')  
  }

  $('.questionMark').mouseenter(function(e) {
  // console.log('mouseenter')
     $(this).tooltip('show')
     $(this).addClass('fa-question-circle')
     $(this).removeClass('fa-question')
  })
  .mouseleave(function(e) {
    // console.log('mouseleave')
     $(this).tooltip('hide')
     $(this).removeClass('fa-question-circle')
     $(this).addClass('fa-question')
  });

})


function rteInit(blockkk)
    {
        tinymce.init({
            selector: blockkk,
            inline: true,
            schema: 'html5',
            element_format: 'html',
            end_container_on_empty_block: true,
            skin : 'flat_design_tinymce',

            style_formats: [
            {title: 'Headers', items: [
                {title: 'Header 1', format: 'h1'},
                {title: 'Header 2', format: 'h2'},
                {title: 'Header 3', format: 'h3'},
                {title: 'Header 4', format: 'h4'},
                {title: 'Header 5', format: 'h5'},
                {title: 'Header 6', format: 'h6'}
            ]},

            {title: 'Font Sizes', items: [
                {title: 'Tiny text', inline: 'span', styles: {fontSize: '10px'}},
                {title: 'Small text', inline: 'span', styles: {fontSize: '13px'}},
                {title: 'Normal text', inline: 'span', styles: {fontSize: '15px'}},
                {title: 'Big text', inline: 'span', styles: {fontSize: '18px'}},
                {title: 'Huge text', inline: 'span', styles: {fontSize: '22px'}}
            ]},

            {title: 'Inline', items: [
                {title: 'Bold', icon: 'bold', format: 'bold'},
                {title: 'Italic', icon: 'italic', format: 'italic'},
                {title: 'Underline', icon: 'underline', format: 'underline'},
                {title: 'Strikethrough', icon: 'strikethrough', format: 'strikethrough'},
                {title: 'Superscript', icon: 'superscript', format: 'superscript'},
                {title: 'Subscript', icon: 'subscript', format: 'subscript'},
                {title: 'Code', icon: 'code', format: 'code'}
            ]},

            {title: 'Blocks', items: [
                {title: 'Paragraph', format: 'p'},
                {title: 'Blockquote', format: 'blockquote'},
                {title: 'Div', format: 'div'},
                {title: 'Pre', format: 'pre'}
            ]},

            {title: 'Alignment', items: [
                {title: 'Left', icon: 'alignleft', format: 'alignleft'},
                {title: 'Center', icon: 'aligncenter', format: 'aligncenter'},
                {title: 'Right', icon: 'alignright', format: 'alignright'},
                {title: 'Justify', icon: 'alignjustify', format: 'alignjustify'}
            ]}
        ],
            plugins: [ "link image emoticons textcolor" ],
            toolbar1: "insertfile undo redo | styleselect | forecolor backcolor emoticons | link image",
            image_advtab: true,
            forced_root_block: false,
            entity_encoding: 'raw',
            menubar: false
        }); 
}



