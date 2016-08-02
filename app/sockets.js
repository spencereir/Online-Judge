// Filesytem operations
var fs = require("fs");
// User model
var User = require("./models/user.js");
// Problems model
var Problem = require("./models/problem.js");

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
                            username: val.grader.username,
                            name: val.google.name,
                            school: val.grader.school,
                            points: val.grader.points
                        });
                    });

                    // Send the array of users to the socket
                    socket.emit("users-response", userArr);
                }
            });
        });

        // Get list of problems
        socket.on("problems-request", (data) => {
            // Get array of problems
            Problem.find({}, (err, problems) => {
                // Check for errors
                if(err) {
                    console.log("Error getting list of problems: " + err);
                } else {
                    // Generate an array of problems
                    var problemArr = [];
                    problems.forEach((val, index, arr) => {
                        problemArr.push({
                            name: val.name,
                            pid: val.pid,
                            points: val.points,
                            partial: val.partial,
                            languages: val.languages
                        });
                    });

                    // Send the array of problems to the socket
                    socket.emit("problems-response", problemArr);
                }
            })
        });

        // Get info for an individual problem
        socket.on("problem-request", (data) => {
            // Get problem data
            Problem.find({pid: data}, (err, problem) => {
                // Check for errors
                if(err) {
                    console.log("Error getting info for problem " + pid + ": " + err);
                } else if(problem.length > 0) {
                    // Send the problem data to the user
                    socket.emit("problem-response", problem[0]);
                } else {
                    // The problem doesn't exist, redirect the user
                    socket.emit("redirect", "/problems");
                }
            });
        });

        // Get info for a user profile
        socket.on("profile-request", (data) => {
            // Get profile data
            User.findOne({ "grader.username": data }, (err, doc) => {
                // Check for errors
                if(err) {
                    console.log(err);
                }
                // Check if we found a doc
                if(typeof doc != "undefined") {
                    var userObj = {
                        name: doc.google.name,
                        grader: doc.grader
                    };
                    // Send the user data to the socket
                    socket.emit("profile-response", userObj);
                } else {
                    // The user doesn't exist, redirect the user
                    socket.emit("redirect", "/users");
                }
            });
        });
    });
};