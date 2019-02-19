// utils.js

// ajax stuff
var Ajax = (function () {
    var post = function (ajax_url, data, csrftoken, callback) {
        $.ajax({
            url: ajax_url,
            data: data,
            type: 'POST',
            async: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-CSRFToken', csrftoken);
            }
        })
            .done(callback)
            .fail(function (jqXHR, textStatus) {});
    };

    return {
        post: post
    };

})();