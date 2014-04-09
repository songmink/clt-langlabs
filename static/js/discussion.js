$(document).ready(function(){

	$( "#posts" ).on( "click", ".chatlist", function() {
		$(this).next().find('.comment').slideToggle( "fast" );
	});

	// $("#sendPost").click(function() {
 //        // Send Post URL
	// 	var postURL = $(this).val()
	// 	//Post textarea is not empty 
	// 	if ($('#postTextarea').val().trim()){
	// 		var input_string = $("#postTextarea").val()
	// 		var csrf = $("input[name='csrfmiddlewaretoken']").val()
	// 		var activityType = $('#activityType').val()
	// 		var activityID = $('#activityID').val()
	// 		$.ajax({
	// 			url : postURL,
	// 			type : "POST",
	// 			data : {
	// 			text : input_string,
	// 			activity_type : activityType,
	// 			activity_id : activityID,
	// 			csrfmiddlewaretoken: csrf
	// 			},
	// 			success : function(json) {
	// 				console.log(json)
	// 				postReload()
	// 			}
	// 			});
	// 	}
	// });

});

// function postReload(){
// 	// Current Page URL for reload posts
// 	var currentpage = document.URL
// 	$("#posts").load(currentpage+" #posts2",function(){
// 		console.log('posts upload success')
// 		// clear input textarea
// 		$('#postTextarea').val('')
// 	}); 
// }

// function poll(){
// 	// Current Page URL for reload posts
// 	var currentpage = document.URL
// 	$("#posts").load(currentpage+" #posts2",function(){
// 		console.log('poll')
// 		setTimeout(function(){
// 			poll();
// 		}, 5000);
// 	}); 
// }


