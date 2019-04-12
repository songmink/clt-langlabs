// Web socket for a live chat
$(function () {
    var formChat = document.getElementById('overdub');

    var roomName = formChat.getAttribute('data-activity-type') + formChat.getAttribute('data-activity-id');
    var userName = formChat.getAttribute('data-username');

    var chatSocket = new WebSocket(
        'ws://' + window.location.host + '/overdub/' + roomName);  // Set the route on /core/routing.py

    chatSocket.onmessage = function (e) {
        var data = JSON.parse(e.data);
        var message = data['text'];
        console.log(data);
        document.querySelector('#postTextarea').value += (message + '\n');
    };

    chatSocket.onclose = function (e) {
        console.error('Chat socket closed unexpectedly');
    };

    document.querySelector('#chat-message-input').focus();
    document.querySelector('#chat-message-input').onkeyup = function (e) {
        if (e.keyCode === 13) { // enter, return
            document.querySelector('#sendPost').click();
        }
    };

    document.querySelector('#sendPost').onclick = function (e) {
        var messageInputDom = document.querySelector('#postTextarea');
        var message = userName + ': ' + messageInputDom.value;
        chatSocket.send(JSON.stringify({
            'message': message
        }));

        messageInputDom.value = '';
    };

    // auto load the end of chat page
    var chatarea = document.getElementById('posts');
    setInterval(function () {
        chatarea.scrollTop = chatarea.scrollHeight;
    }, 1000);
});