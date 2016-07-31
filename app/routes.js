// Packages
// Filesystem operations
var fs = require("fs");
// Simple exists
var exists = require("simple-exist");
// User model
var User = require("./models/user.js");
// Coloured console messages
var colours = require("colors/safe");

// Colours theme
colours.setTheme({
    success: ["green"],
    important: ["cyan", "underline"],
    error: ["yellow", "bgRed", "underline", "bold"]
});

// Get languages
var languages;
// Check if languages file exists
exists.exists("languages.json", (data) => {
    if(data) {
        // Read in languages
        fs.readFile("languages.json", (err, data) => {
            // Check for errors
            if(err) {
                throw err;
            } else {
                languages = JSON.parse(data);
            }
        });
    } else {
        console.log(colors.error("Error getting languages. Try running the server again."));
    }
});

// Express routes
module.exports = function (app, passport, express) {
console.log(colors.error("Error getting languages. Try running the server again."));
    // Home page
    app.get("/", (req, res) => {
        // Check if user is authenticated
        if(req.isAuthenticated()) {
            // Go to the profile page
            res.redirect("profile");
        } else {
            // Go to the homepage
            res.render("index.ejs");
        }
    });

    // Static files
    app.use(express.static("public"));

    // ======================
    // Account authentication
    // ======================

    // Google authentication
    app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

    // Callback after Google completed has authentication
    app.get("/auth/google/callback", passport.authenticate("google", {
        successRedirect: "/profile", // Redirect to profile
        failureRedirect: "/" // There was an error, go to homepage
    }));

    // ===========
    // Other pages
    // ===========

    // Profile page
    app.get("/profile", isLoggedIn, (req, res) => {
        // Render the login form with profile info
        res.render("protected/profile.ejs", {
            user: req.user // Get the user from the session
        });
    });

    // Users page
    app.get("/users", isLoggedIn, (req, res) => {
        // Render the users page
        res.render("protected/users.ejs");
    });

    // Logout
    app.get("/logout", (req, res) => {
        // Log the session out
        req.logout();
        // Redirect to the homepage
        res.redirect("/");
    });
};

// Check if a user is logged in
function isLoggedIn(req, res, next) {

    // Check if the user session is authenticated
    if (req.isAuthenticated()) {
        // Continue to the profile page
        return next();
    } else {
        // Redirect to the homepage
        res.redirect("/");
    }
}