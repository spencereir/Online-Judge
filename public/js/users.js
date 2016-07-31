// List options
var options = {
    valueNames: ["name", "points"]
};

// Initialize the list
var userList = new List("users-table-wrapper", options);

// Request the list of users when connected
socket.on("connect", function() {
    socket.emit("users-request");
});

// Get the list of users
socket.on("users-response", function(userArr) {
    // Remove everything already in table
    userList.clear();
    // Insert it into the table
    userArr.forEach(function(val, index, arr) {
        userList.add({ name: val.name, points: Math.floor(Math.random() * 100)});
    });
});

// Set beginning sort
userList.sort("points", { order: "desc" });

// Toggle carets
$("#users-list-thead-name").click(function() {
    // Hide the other caret
    $("#users-list-thead-points").find("span").hide();
    // Show my caret
    $(this).find("span").show();
    // Toggle my caret
    $(this).find("span").toggleClass("glyphicon-triangle-top glyphicon-triangle-bottom");
    // Toggle the other caret
    $("#users-list-thead-points").find("span").toggleClass("glyphicon-triangle-bottom glyphicon-triangle-top");
});

$("#users-list-thead-points").click(function() {
    // Hide the other caret
    $("#users-list-thead-name").find("span").hide();
    // Show my caret
    $(this).find("span").show();
    // Toggle my caret
    $(this).find("span").toggleClass("glyphicon-triangle-bottom glyphicon-triangle-top");
    // Toggle the other caret
    $("#users-list-thead-name").find("span").toggleClass("glyphicon-triangle-bottom glyphicon-triangle-top");
});