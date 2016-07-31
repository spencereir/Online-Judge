// Packages
var mongoose = require("mongoose");

// Problem schema
var problemSchema = mongoose.Schema({
    pid: String,
    name: String,
    statement: String,
    partial: Boolean,
    points: Number,
    languages: [String]
});

// Create and export the model
module.exports = mongoose.model("Problem", problemSchema);