"use strict";

var captureStream = require("capture-stream"),
    configFile = require("jscs/lib/cli-config"),
    fs = require("fs"),
    Checker = require("jscs"),
    path = require("path"),
    reporter = require("../lib/index.js");

var baseDir = "test/fixtures";  // jscs: ignore

function readFixture(name)
{
    return fs.readFileSync(path.join(baseDir, name + ".txt"), "utf8");
}

function writeFixture(name, data)
{
    var fixturePath = path.join(baseDir, name + ".txt");

    console.log("Generated " + fixturePath);

    return fs.writeFileSync(fixturePath, data);
}

function check(checker, verbose)
{
    checker._verbose = verbose;

    var files = fs.readdirSync(baseDir),
        errors = [];

    files.forEach(function(file)
    {
        if (path.extname(file) === ".js")
        {
            var code = fs.readFileSync(path.join(baseDir, file), "utf8");

            errors.push(checker.checkString(code));
        }
    });

    var restore = captureStream(process.stdout);

    reporter(errors, { colorize: true, log: false });

    return restore(true);
}

function compareWithFixture(name, text)
{
    if (text === readFixture(name))
        console.log(name + " passed");
    else
        console.log(name + " failed: output did match fixture");
}

var generate = process.argv[2] === "generate",
    checker = new Checker(),
    config = configFile.load();

checker.registerDefaultRules();
checker.configure(config);

[false, true].forEach(function(verbose)
{
    var output = check(checker, verbose),
        name = "test" + (verbose ? "-verbose" : "");

    if (generate)
        writeFixture(name, output);
    else
        compareWithFixture(name, output);
});
