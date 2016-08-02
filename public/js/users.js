// List options
var options = {
    valueNames: ["username", "name", "school", "points"]
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
        userList.add({ username: val.username, name: val.name, school: val.school, points: val.points});
    });
});

// Set beginning sort
userList.sort("points", { order: "desc" });