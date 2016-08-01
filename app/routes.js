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
        console.log(colours.error("Error getting languages. Try running the server again."));
    }
});

// Express routes
module.exports = function (app, passport, express) {

    // Home page
    app.get("/", (req, res) => {
        // Check if user is authenticated
        if(req.isAuthenticated()) {
            // Go to the settings page
            res.redirect("/settings");
        } else {
            // Go to the homepage
            res.render("index.ejs");
        }
    });

    // login page
    app.get("/login", (req, res) => {
        // Check if the user is authenticated
        if(req.isAuthenticated()) {
            // Go to the settings page
            res.redirect("/settings");
        } else {
            // Go to the login page
            res.render("login.ejs");
        }
    })

    // Static files
    app.use(express.static("public"));

    // ======================
    // Account authentication
    // ======================

    // Google authentication
    app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

    // Callback after Google completed has authentication
    app.get("/auth/google/callback", passport.authenticate("google", {
        successRedirect: "/settings", // Redirect to settings
        failureRedirect: "/" // There was an error, go to homepage
    }));

    // ===========
    // Other pages
    // ===========

    // Settings page
    app.get("/settings", isLoggedIn, (req, res) => {
        // Render the settings page
        res.render("protected/settings.ejs", {
            user: req.user // Get the user from the session
        });
    });

    // Users page
    app.get("/users", isLoggedIn, (req, res) => {
        // Render the users page
        res.render("protected/users.ejs");
    });

    // Problems page
    app.get("/problems", isLoggedIn, (req, res) => {
        // Render the problems page
        res.render("protected/problems.ejs");
    });

    // Individual problem page
    app.get("/problem", isLoggedIn, (req, res) => {
        console.log(req.query.pid);
        // Check if a problem ID was specified
        if(!req.query.pid) {
            // Redirect to list of problems
            res.redirect("/problems");
        } else {
            // Render the problem page
            res.render("protected/problem.ejs", {pid: req.query.pid});
        }
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
        // Continue to the next page
        return next();
    } else {
        // Redirect to the homepage
        res.redirect("/");
    }
}