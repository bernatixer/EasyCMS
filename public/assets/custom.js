startEditor();

var socket = io.connect('http://localhost:3000');

socket.on('tabCreated', function() {
    window.location.href = 'http://localhost:3000/' + $('#tabName').val();
});
