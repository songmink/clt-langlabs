$(function () {
    // subscribe to a new course 
    var subscribeURL = $('#courseSubscribeButton').data('subscribeurl');
    $('#courseSubscribeButton').click(function (event) {
        event.preventDefault();
        var GOTOURL = subscribeURL.replace('ToReplace', $('#accesscodearea').val());
        window.location.href = GOTOURL;
    });

    // search table content
    $("#search-box").on("keyup", function() {
        var value = $(this).val().toLowerCase();
        $("#coursesTable tr").filter(function() {
          $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
      });
});