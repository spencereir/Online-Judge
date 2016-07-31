// Packages
// Filesystem operations
var fs = require("fs");
// Coloured console output
var colours = require("colors/safe");
// Express (web server)
var express = require("express");
var app = express();
// Mongoose (database)
var mongoose = require("mongoose");
// Passport (user authentication)
var passport = require("passport");
// connect-flash (flashdata session messages)
var flash = require("connect-flash");
// Morgan (express logs)
var morgan = require("morgan");
// Cookie parser (pasrse cookies)
var cookieParser = require("cookie-parser");
// Body parser (parse request bodies)
var bodyParser = require("body-parser");
// Express session (simple sessions)
var session = require("express-session");
// connect-mongo (persistent sessions)
const MongoStore = require("connect-mongo")(session);
// Socket.io
var io = require("socket.io");
// HackerRank
var hr = require("hackerrank-node-wrapper");

// Database configuration
var configDB = require("./config/database.js");

// Session configuration
var configSession = require("./config/session.js");

// HackerRank configuration
var hrConfig = require("./config/hr.js");
var HackerRank = new hr(hrConfig.apiKey);

// Configuration

// Command line

// Coloured console output themes
colours.setTheme({
    success: ["green"],
    important: ["cyan", "underline"],
    error: ["yellow", "bgRed", "underline", "bold"]
});

// Set the port to listen on (checks if port was set in options)
const port = 8080;

// Get HackerRank languages
HackerRank.getLanguages((err, res) => {
    // Check for errors
    if(err) {
        console.log(Colours.error("Error getting languages from HackerRank. Error: " + err));
    } else {
        // Write to a file
        fs.writeFile("languages.json", res.body, (err) => {
            // Check for errors
            if(err) {
                console.log(Colours.error("Error writing languages from HackerRank. Error: " + err));
            }
        });
    }
});

// Connect to database
mongoose.connect(configDB.url, (err) => {
    // Check if there was an error
    if (err) {
        // Check if the connection was refused
        if (err.errno == "ECONNREFUSED") {
            console.log(colours.error("The connection to the database at " + configDB.url + " was refused. Double check that the server is up and that the URL is correct."));
        } else {
            console.log(colours.error("Unknown error connection to database: " + err));
        }

        // Stop the server
        process.exit(1);
    }
});

// Passport configuration
require('./config/passport')(passport);

// Setup session middleware
var sessionMiddleware = session({
    secret: configSession.sessionSecret,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
});

// Setup Express
// Log requests to the console
app.use(morgan("dev"));
// Parse cookies
app.use(cookieParser());
// Parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use EJS for templating
app.set("view engine", "ejs");

// Use sessions
app.use(sessionMiddleware);
// Start Passport
app.use(passport.initialize());
// Persistent Passport login sessions
app.use(passport.session());
// Store flash messages in session
app.use(flash());

// Start the Socket.io server
var server = require("http").createServer(app).listen(8081);
var sio = io.listen(server);

// Use Socket.io routes
require("./app/sockets.js")(sio, sessionMiddleware);

// Express Routes
require("./app/routes.js")(app, passport, express, sio, sessionMiddleware);

// Start the app
app.listen(port, () => {
    // Success
    console.log(colours.success("Server is listening on port " + colours.important(port) + "."));
}).on("error", (err) => {
    // Check if it was an error with the port
    if (err.errno == "EADDRINUSE") {
        console.log(colours.error("Error starting server on port " + colours.important(port) + ". Make sure that no other programs are listening on port " + colours.important(port) + "."));
    } else {
        console.log(colours.error("Unknown error: " + err));
    }

    // Stop the server
    process.exit(1);
});
