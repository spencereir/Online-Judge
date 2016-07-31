// Packages
var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

// User schema
var userSchema = mongoose.Schema({
    google: {
        id: String,
        token: String,
        email: String,
        name: String
    },
    grader: {
        points: Number,
        problemsSolved: [String],
        school: String,
        age: Number,
        website: String
    }
});

// Methods

// Generate a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Check if a password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// Create and export the model
module.exports = mongoose.model("User", userSchema);