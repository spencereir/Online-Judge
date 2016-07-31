// Connect to the Socket.io server
var socket = io.connect("127.0.0.1:8081");

// Redirect user
socket.on("redirect", function (destination) {
    window.location.href = destination;
});

// Check if the socket is connected
var connected = false;
socket.on("connect", function() {
    connected = true;
    console.log("Socket.io connected!");
});
socket.on("connect_error", function() {
    connected = false;
    onsole.log("Socket.io connection error!");
});