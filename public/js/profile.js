// Request profile data when the socket connects
socket.on("connect", function() {
    socket.emit("profile-request", username);
});

// Get the profile data
socket.on("profile-response", function(data) {
    // Fill in the profile info
    $("#profile-name").text(data.name);
    $("#profile-points").text(data.grader.points + " points")
    if(typeof data.grader.age != "undefined" || data.grader.age != "") {
        $("#profile-age").text(data.grader.age);
    } else {
        $("#profile-age").text("not set");
    }
    if(typeof data.grader.school != "undefined" || data.grader.school != "") {
        $("#profile-school").text(data.grader.school);
    } else {
        $("#profile-school").text("not set");
    }
    if(typeof data.grader.website != "undefined" || data.grader.website != "") {
        $("#profile-website").text(data.grader.website);
    } else {
        $("#profile-website").text("not set");
    }
});