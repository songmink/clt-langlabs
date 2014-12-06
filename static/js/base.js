$(document).ready(function(){

	// subscribe to a new course 
   var subscribeURL  =  $("#courseSubscribeButton").data('subscribeurl')
   $("#courseSubscribeButton").click(function(event){
        event.preventDefault();
        // console.log('coocool')
        var GOTOURL=subscribeURL.replace('ToReplace',$('#accesscodearea').val() )
        window.location.href = GOTOURL;
   })

});