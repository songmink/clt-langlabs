// Subscribe menu
$(document).ready(function(){
	// subscribe to a new course 
   var subscribeURL  =  $("#courseSubscribeButton").data('subscribeurl')
   $("#courseSubscribeButton").click(function(event){
        event.preventDefault();
        var GOTOURL=subscribeURL.replace('ToReplace',$('#accesscodearea').val() )
        window.location.href = GOTOURL;
   })
});
