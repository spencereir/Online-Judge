// Packages
// Filesystem operations
var fs = require("fs");
// Query strings
var qs = require("querystring");
// Simple exists
var exists = require("simple-exist");
// User model
var User = require("./models/user.js");
// Coloured console messages
var colours = require("colors/safe");
// Input validation
var validator = require("validator");

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
            res.render("pages/index.ejs");
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
            res.render("pages/login.ejs");
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

    // First time account setup
    app.get("/setup", (req, res) => {
        // Check if the user is logged in and it's their first login
        if(req.isAuthenticated() && req.user.grader.firstLogin) {
            // Render the first time setup page
            res.render("pages/protected/setup.ejs", {
                errorsObj: req.query // Display any errors
            });
        } else {
            // Go to the homepage
            res.redirect("/");
        }
    });

    // First time account setup
    app.post("/setup", (req, res) => {

        // Errors
        var errors = [];

        // Check if any required info was missing
        if(!req.body.username) {
            // Add an error
            errors.push("You must provide a username.");
        } else {
            // Check if the username is already taken
            User.findOne({
                grader: {
                    username: req.body.username
                }
            }, (err, doc) => {
                // Check if we found a doc
                if(typeof doc != "undefined") {
                    // Add an error
                    errors.push("That username is already taken. Please choose a different one.");
                }
            });

            // Check if the name is long enough or too long
            if(req.body.username.length < 3) {
                // Add an error
                errors.push("Your username must be at least 3 characters long.");
            } else if(req.body.username.length > 20) {
                // Add an error
                errors.push("Your username must be up to 20 characters long.");
            }

            // Check if username is alphanumeric
            if(!validator.isAlpha(req.body.username)) {
                // Add an error
                errors.push("Your username must be alphanumeric.");
            }
        }
        
        // Check for errors
        if(errors.length > 0) {
            res.redirect("/setup?" + qs.stringify(errors));
        } else {
            // Find the user
            User.findById(req.user._id, (err, doc) => {
                // Check for errors
                if(err) {
                    // Error 404: resource not found
                    res.sendStatus(404);
                } else {
                    // Update info
                    if(typeof req.body.username != "undefined") {
                        doc.grader.username = req.body.username;
                    }
                    if(req.body.age != "") {
                        doc.grader.age = req.body.age;
                    }
                    if(req.body.school != "") {
                        doc.grader.school = req.body.school;
                    }
                    if(req.body.website != "") {
                        doc.grader.websitee = req.body.website;
                    }
                    doc.grader.firstLogin = false;
                    // Save the user
                    doc.save();
                    // Go to the settings page
                    res.redirect("/settings");
                }
            });
        }
    });

    // Settings page
    app.get("/settings", isLoggedIn, (req, res) => {
        // Render the settings page
        res.render("pages/protected/settings.ejs", {
            user: req.user // Get the user from the session
        });
    });

    // Users page
    app.get("/users", isLoggedIn, (req, res) => {
        // Render the users page
        res.render("pages/protected/users.ejs");
    });

    // Problems page
    app.get("/problems", isLoggedIn, (req, res) => {
        // Render the problems page
        res.render("pages/protected/problems.ejs");
    });

    // Individual problem page
    app.get("/problem", isLoggedIn, (req, res) => {
        // Check if a problem ID was specified
        if(!req.query.pid) {
            // Redirect to list of problems
            res.redirect("/problems");
        } else {
            // Render the problem page
            res.render("pages/protected/problem.ejs", {pid: req.query.pid});
        }
    });

    // Logout
    app.get("/logout", (req, res) => {
        // Log the session out
        req.logout();
        // Redirect to the homepage
        res.redirect("/");
    });

    // =========
    // Misc. API
    // =========

    app.post("/changeSettings", isLoggedIn, (req, res) => {
        // Find the user that requested the change
        User.findById(req.user._id, (err, doc) => {
            // Check for errors
            if(err) {
                // Error 404: resource not found
                res.sendStatus(404);
            } else {
                // Update the user's info
                switch(req.body.name) {
                    case "name":
                        // Change the user name
                        doc.google.name = req.body.value;
                        break;
                    default:
                        // Error 400: bad request
                        res.sendStatus(400);
                        break;
                }
                // Save the updated user
                doc.save();
                // Send a successful error code
                res.sendStatus(200);
            }
        });
    });

    // =========
    // 404 Error
    // =========

    // DO NOT PUT ANY ROUTES BELOW THIS ONE
    // DO NOT PUT ANY ROUTES BELOW THIS ONE
    // DO NOT PUT ANY ROUTES BELOW THIS ONE
    
    app.get("*", (req, res) => {
        // Page not found, return 404 error
        res.status(404).send('Error: page not found. <a href="/">Try going home.</a>');
    });
};

// Check if a user is logged in
function isLoggedIn(req, res, next) {
    // Check if it's the user's first time logging in
    if(req.user.grader.firstLogin) {
        // Go to the first time setup page
        res.redirect("/setup");
    // Check if the user is logged in
    } else if (req.isAuthenticated()) {
        // Continue to the next page
        return next();
    } else {
        // Redirect to the homepage
        res.redirect("/");
    }
}