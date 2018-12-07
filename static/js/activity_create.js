$( document ).ready(function() {
  // Handler for .ready() called.

  $("#div_id_lesson").find('label').after('&nbsp;&nbsp;&nbsp;<button id="modalFire" type="button" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-plus"></span>New</button>');
  
  // toggle modal using the '+' sign
  $( "#modalFire" ).click(function() {
	    $('#myModal').modal('toggle')
	});
  
  $('#myModal').on('hide.bs.modal', function (e) {
  	// obtain the current URL and use it to refresh the content we want
  	    var currentURL = window.location.href
        $("#id_lesson").parent().load(currentURL +  '  #id_lesson')
	})
  // fake the rich text editor using another div
  $("#id_instructions").addClass("hidden"); 
  $( "#id_instructions" ).after( '<div id="InstructionTextArea" class="form-control" style="border-radius:4px 4px 4px 4px;"></div>' );
  
  // initialize the text edior
  rteInit()
  $( "#InstructionTextArea" ).append( $("#id_instructions").val());
  $( "form" ).submit(function( event ) {
      $( "#id_instructions" ).val($("#InstructionTextArea").html())
    });

  // Add explaination to private mode
  if($('#div_id_private_mode').length==1){
    $('#div_id_private_mode').append(' <small><i class="fa questionMark fa-question" style="cursor:pointer;" data-toggle="tooltip" data-placement="right" title="In Private mode student only interact with instructors and their posts will not be viewable by other students."></i></small>')
    
  }

  // Add explaination to read_after_post
  if($('#div_id_read_after_post').length==1){
    $('#div_id_read_after_post').append(' <small><i class="fa questionMark fa-question " style="cursor:pointer;" data-toggle="tooltip" data-placement="right" title="In Read After Post mode a student cannot view other students\' posts until they have published a post of their own."></i></small>')
  }

  // Add explaination to read_after_post
  if($('#div_id_is_active').length==1){
    $('#div_id_is_active').append(' <small><i class="fa questionMark fa-question " style="cursor:pointer;" data-toggle="tooltip" data-placement="right" title="Students can participate in the activity only while it is active. On the other hand, students cannot access an inactive activity and it will not appear in their activity list. For example, deactivate an activity after an assignment deadline or while you are populating the activity content."></i></small>')
  }

  $('.questionMark').mouseenter(function(e) {

     $(this).tooltip('show')
     $(this).addClass('fa-question-circle')
     $(this).removeClass('fa-question')
  })
  .mouseleave(function(e) {

     $(this).tooltip('hide')
     $(this).removeClass('fa-question-circle')
     $(this).addClass('fa-question')
  });


})


function rteInit()
    {
        tinymce.init({
            selector: "#InstructionTextArea",
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



