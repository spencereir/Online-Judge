// Setup X-editable
$.fn.editable.defaults.mode = "inline";

// Make elements editable
$(document).ready(function() {
    $("#name").editable();
});