// Packages
var mongoose = require("mongoose");

// Submission schema 
var submissionSchema = mongoose.Schema({
    pid: String,
    author: mongoose.Schema.Types.ObjectId,
    creation: Date,
    status: String,
    points: Number,
    code: String,
    language: String
});

// Create and export the model
module.exports = mongoose.model("Submission", submissionSchema);