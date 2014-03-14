$(document).ready(function(){

	$(".chatlist").click(function(){
	$(this).next().find('.comment').slideToggle( "fast" );
	});

});