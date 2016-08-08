// Packages
// Github authentication
var GithubStrategy = require("passport-github").Strategy;
// Google authentication
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

// Load the user model
var User = require("../app/models/user");

// Load the authentication info
var configAuth = require("./auth");

// Exports
module.exports = function (passport) {

    // Handle sessions

    // Serialize users
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Deserialize users
    passport.deserializeUser((id, done) => {
        // Try to find the user
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });

    // Google login
    passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL
    },
        (token, refreshToken, profile, done) => {

            // Run asynchronously
            process.nextTick(() => {

                // Try to find the user with their Google ID
                User.findOne({ "google.id": profile.id }, (err, user) => {

                    // Return any errors
                    if (err) {
                        return done(null, err);
                    }

                    // If a user is found log them in
                    if (user) {
                        return done(null, user);
                    } else {
                        // Create a new user
                        var newUser = new User();

                        // Google login info
                        newUser.google.id = profile.id;
                        newUser.google.token = token;
                        newUser.google.name = profile.displayName;
                        newUser.google.email = profile.emails[0].value;

                        // Grader info
                        newUser.grader.firstLogin = true;
                        newUser.grader.points = 0;
                        newUser.grader.problemsSolved = [];

                        // Save the user
                        newUser.save((err) => {
                            // Check for errors
                            if (err) {
                                throw err;
                            }

                            // Continue
                            return done(null, newUser);
                        });
                    }
                });
            });
        }));
};
