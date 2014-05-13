$( document ).ready(function() {
  // Handler for .ready() called.
  // $("#div_id_lesson").find('label').after('<span id="modalFire"> + </span>');
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

  

});