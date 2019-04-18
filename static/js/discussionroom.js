// Web socket for a live chat
$(function () {
    var formChat = document.getElementById('overdub');

    var roomName = formChat.getAttribute('data-activity-type') + '-' + formChat.getAttribute('data-activity-id');

    var chatSocket = new WebSocket(
        'ws://' + window.location.host + '/overdub/' + roomName);  // Set the route on /core/routing.py

    chatSocket.onmessage = function (e) {
        var data = JSON.parse(e.data);
        var message = data.message;
        $('#posts').prepend(message);
    };

    chatSocket.onclose = function (e) {
        console.error('Chat socket closed unexpectedly');
    };

    document.querySelector('#sendPost').onclick = function (e, message) {
        // var messageInputDom = document.querySelector('#postTextarea');
        // var message = messageInputDom.value;

        chatSocket.send(JSON.stringify({
            'message': message,
        }));

        messageInputDom.value = '';
    };

});