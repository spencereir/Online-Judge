// List options
var options = {
    valueNames: ["name", "points", "partial", "languages"]
};

// Initialize the list
var problemList = new List("problems-table-wrapper", options);

// Request the list of problems when connected
socket.on("connect", function() {
    socket.emit("problems-request");
});

// Get the list of problems
socket.on("problems-response", function(problemArr) {
    // Remove everything already in table
    problemList.clear();
    // Insert it into the table
    problemArr.forEach(function(val, index, arr) {
        problemList.add({ name: val.name, points: Math.floor(Math.random() * 100), partial: val.partial, languages: val.languages.join(", ")});
    });
});

// Set beginning sort
problemList.sort("points", { order: "desc" });

// Toggle carets
$("#problems-list-thead-name").click(function() {
    // Hide the other caret
    $("#problems-list-thead-points").find("span").hide();
    // Show my caret
    $(this).find("span").show();
    // Toggle my caret
    $(this).find("span").toggleClass("glyphicon-triangle-top glyphicon-triangle-bottom");
    // Toggle the other caret
    $("#problems-list-thead-points").find("span").toggleClass("glyphicon-triangle-bottom glyphicon-triangle-top");
});

$("#problems-list-thead-points").click(function() {
    // Hide the other caret
    $("#problems-list-thead-name").find("span").hide();
    // Show my caret
    $(this).find("span").show();
    // Toggle my caret
    $(this).find("span").toggleClass("glyphicon-triangle-bottom glyphicon-triangle-top");
    // Toggle the other caret
    $("#problems-list-thead-name").find("span").toggleClass("glyphicon-triangle-bottom glyphicon-triangle-top");
});

// Convert 