// Web socket for a live chat
$(function () {
    var formChat = document.getElementById('live-chat');

    var roomName = formChat.getAttribute('data-activity-type') + formChat.getAttribute('data-activity-id');
    var userName = formChat.getAttribute('data-username');

    var chatSocket = new WebSocket(
        'ws://' + window.location.host + '/live-chat/' + roomName);

    chatSocket.onmessage = function (e) {
        var                    data                = JSON.parse(e.data);
        var                    message             = data['message'];
        document.querySelector('#chat-log').value += (message + '\n');
    };

    chatSocket.onclose = function (e) {
        console.error('Chat socket closed unexpectedly');
    };

    document.querySelector('#chat-message-input').focus();
    document.querySelector('#chat-message-input').onkeyup = function (e) {
        if (e.keyCode === 13) { // enter, return
            document.querySelector('#chat-message-submit').click();
        }
    };

    document.querySelector('#chat-message-submit').onclick = function (e) {
        var messageInputDom = document.querySelector('#chat-message-input');
        var message         = userName + ": " + messageInputDom.value;
        chatSocket.send(JSON.stringify({
            'message': message
        }));

        messageInputDom.value = '';
    };

    // auto load the end of chat page
    var textarea = document.getElementById('chat-log');
    setInterval(function () {
        textarea.scrollTop = textarea.scrollHeight;
    }, 1000);
});