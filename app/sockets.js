// Filesytem operations
var fs = require("fs");
// User model
var User = require("./models/user.js");

module.exports = function (io, sessionMiddleware) {

    // Use authentication middleware
    io.use((socket, next) => {
        sessionMiddleware(socket.request, {}, next);
    });

    // Check if new connections are logged in
    io.on("connection", (socket) => {

        if (typeof socket.request.session.passport !== "undefined") {
            console.log("Logged in: " + socket.request.session.passport.user);
        } else {
            // Make the Socket redirect the user to the homepage
            socket.emit("redirect", "/");
        }

        // Get list of users
        socket.on("users-request", (data) => {
            // Get array of users
            User.find({}, (err, users) => {
                // Check for errors
                if (err) {
                    console.log("Error getting list of users: " + err);
                } else {
                    // Generate an array of users
                    var userArr = [];
                    users.forEach((val, index, arr) => {
                        userArr.push({
                            name: val.google.name
                        });
                    });

                    // Send the array of users to the socket
                    socket.emit("users-response", userArr);
                }
            });
        });
    });



};