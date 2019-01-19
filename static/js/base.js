$(function(){
  // subscribe to a new course 
  var subscribeURL = $("#courseSubscribeButton").data('subscribeurl');
  $("#courseSubscribeButton").click(function(event){
      event.preventDefault();
      var GOTOURL              = subscribeURL.replace('ToReplace',$('#accesscodearea').val() );
          window.location.href = GOTOURL;
  });

  // search table content
  $(".search").keyup(function () {
    var searchTerm  = $(".search").val();
    var listItem    = $('.results tbody').children('tr');
    var searchSplit = searchTerm.replace(/ /g, "'):containsi('");
    
  $.extend($.expr[':'], {'containsi': function(elem, i, match, array){
        return (elem.textContent || elem.innerText || '').toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
    }
  });
    
  $(".results tbody tr").not(":containsi('" + searchSplit + "')").each(function(e){
    $(this).attr('visible','false');
  });

  $(".results tbody tr:containsi('" + searchSplit + "')").each(function(e){
    $(this).attr('visible','true');
  });

  var jobCount = $('.results tbody tr[visible="true"]').length;
    $('.counter').text(jobCount + ' item');

  if(jobCount == '0') {$('.no-result').show();}
    else {$('.no-result').hide();}
          });

});
 