// Request problem data when connected
socket.on("connect", function () {
    socket.emit("problem-request", pid);
});

socket.on("code-submission-response", function(data) {
    console.log(data);
});

socket.on("submission-status", function(data) {
    console.log("SUBMISSION STATUS: " + data);
});

socket.on("submission-results", function(data) {
    console.log("SUBMISSION RESULTS: " + data);
});

// Get the problem data
socket.on("problem-response", function (problem) {
    // Fill in problem info
    $("#problem-name").text(problem.name);
    $("#problem-statement").html(marked(problem.statement));
    $("#problem-info").text(problem.points + " points, " + ((problem.partial) ? "" : "no ") + " partials. Allowed languages: " + convertLanguages(problem.languages).join(", "));
    languages = problem.languages;

    // Fill the languages dropdown
    for (var key in hrLanguages.languages.names) {
        if (hrLanguages.languages.names.hasOwnProperty(key)) {
            // Check if this language is allowed
            if (languages.indexOf(hrLanguages.languages.names[key]) > -1) {
                dropdown.push({
                    name: hrLanguages.languages.names[key],
                    code: hrLanguages.languages.codes[key],
                    lang: getKeyByValue(hrLanguages.languages.names, hrLanguages.languages.names[key])
                });
            }
        }
    }

    // Sort the dropdown
    dropdown.sort(function (a, b) { return (a.lang > b.lang) ? 1 : ((b.lang > a.lang) ? -1 : 0); });

    // Fill the dropdown
    dropdown.forEach(function (val, index, arr) {
        $("#lang-dropdown-list").append('<li><a class="set-lang noselect" data-target="#" data-name="' + val.name + '" data-lang="' + val.lang + '" data-code="' + val.code + '">' + val.name + '</a></li>');
    });

    // Remove the loading item
    $("#lang-dropdown-list li").first().remove();

    // Set the current language
    curLang = dropdown[0];

    // Set the editor language
    editor.getSession().setMode("ace/mode/" + (dropdown[0].lang == "c" || dropdown[0].lang == "cpp") ? "c_cpp" : dropdown[0].lang);

    // Set the dropdown button text
    $("#lang-button").html(dropdown[0].name + ' <span class="caret"></span>');
});

// Dropdown languages
var dropdown = [];

// Current language
var curLang;

// Problem editor
var editor = ace.edit("editor");
ace.require("ace/ext/language_tools");

// Preferences
editor.setOptions({
    useWrapMode: true,
    highlightActiveLine: true,
    showPrintMargin: false,
    theme: 'ace/theme/cobalt',
    mode: 'ace/mode/javascript',
    basicBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
});

// Change language
$(document).on("click", ".set-lang", function (event) {
    // Set the current language
    curLang = {
        name: $(this).data("name"),
        code: $(this).data("code"),
        lang: $(this).data("lang")
    };

    // Set the editor language
    editor.getSession().setMode("ace/mode/" + ($(this).data("name") == "c" || $(this).data("name") == "cpp") ? "c_cpp" : $(this).data("name"));

    // Set the dropdown button text
    $("#lang-button").html($(this).data("name") + ' <span class="caret"></span>');
});

// Submit code
$("#submit-button").click(function() {
    // Create the code object
    var code = {
        code: editor.getValue(),
        lang: curLang.code,
        pid: pid
    };

    // Send the submission to the server
    socket.emit("code-submission", code);
});

// Functions

// Converts languages list into a nice formatted one
function convertLanguages(languages) {
    languages.forEach(function (val, index, arr) {
        arr[index] = hrLanguages.languages.names[val];
    });
    return languages;
}

// Get a key for a value
function getKeyByValue(obj, value) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            if (obj[prop] === value)
                return prop;
        }
    }
}

// Other

// HackerRank's languages list
var hrLanguages = { "languages": { "names": { "c": "C", "cpp": "C++", "java": "Java", "csharp": "C#", "php": "PHP", "ruby": "Ruby", "python": "Python 2", "perl": "Perl", "haskell": "Haskell", "clojure": "Clojure", "scala": "Scala", "bash": "Bash", "lua": "Lua", "erlang": "Erlang", "javascript": "Javascript", "go": "Go", "d": "D", "ocaml": "OCaml", "pascal": "Pascal", "sbcl": "Common Lisp (SBCL)", "python3": "Python 3", "groovy": "Groovy", "objectivec": "Objective-C", "fsharp": "F#", "cobol": "COBOL", "visualbasic": "VB.NET", "lolcode": "LOLCODE", "smalltalk": "Smalltalk", "tcl": "Tcl", "whitespace": "Whitespace", "tsql": "T-SQL", "java8": "Java 8", "db2": "DB2", "octave": "Octave", "r": "R", "xquery": "XQuery", "racket": "Racket", "rust": "Rust", "fortran": "Fortran", "swift": "Swift", "oracle": "Oracle", "mysql": "MySQL" }, "codes": { "c": 1, "cpp": 2, "java": 3, "python": 5, "perl": 6, "php": 7, "ruby": 8, "csharp": 9, "mysql": 10, "oracle": 11, "haskell": 12, "clojure": 13, "bash": 14, "scala": 15, "erlang": 16, "lua": 18, "javascript": 20, "go": 21, "d": 22, "ocaml": 23, "r": 24, "pascal": 25, "sbcl": 26, "python3": 30, "groovy": 31, "objectivec": 32, "fsharp": 33, "cobol": 36, "visualbasic": 37, "lolcode": 38, "smalltalk": 39, "tcl": 40, "whitespace": 41, "tsql": 42, "java8": 43, "db2": 44, "octave": 46, "xquery": 48, "racket": 49, "rust": 50, "swift": 51, "fortran": 54 } } };