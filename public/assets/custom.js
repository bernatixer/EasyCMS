startEditor();

var socket = io.connect('http://localhost:3000');

$("#newTab").click(function() {
    $("#newTabModal").addClass("is-active");
});

$(".modal-close").click(function() {
    $("#newTabModal").removeClass("is-active");
});

$(".modal-background").click(function() {
    $("#newTabModal").removeClass("is-active");
});

$(".modal-cancel").click(function() {
    $("#newTabModal").removeClass("is-active");
});

$("#createTab").click(function() {
    $("#newTabModal").removeClass("is-active");
    socket.emit('createTab', {
        name: $('#tabName').val()
    });
});

socket.on('tabCreated', function() {
    window.location.href = 'http://localhost:3000/' + $('#tabName').val();
});