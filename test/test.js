"use strict";

var captureStream = require("capture-stream"),
    jscsConfigFile = require("jscs/lib/cli-config"),
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
    console.log(name);

    return fs.writeFileSync(path.join(baseDir, name + ".txt"), data);
}

function check(checker, configName, method)
{
    checker._verbose = configName.indexOf("show-rule") !== -1;

    var configPath = path.join(baseDir, configName + ".json"),
        configFile = fs.readFileSync(configPath, "utf8"),
        config;

    if (method === "rc")
        fs.writeFileSync(".clangformatterrc", configFile);
    else
        config = { clangFormatter: JSON.parse(configFile) };

    var errors = [];

    fs.readdirSync(baseDir).forEach(function(file)
    {
        if (path.extname(file) === ".js")
        {
            var code = fs.readFileSync(path.join(baseDir, file), "utf8");

            errors.push(checker.checkString(code));
        }
    });

    var restore = captureStream(process.stdout);

    reporter(errors, config);

    if (method === "rc")
        fs.unlinkSync(".clangformatterrc");

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
    config = jscsConfigFile.load();

if (generate)
    console.log("Generating fixtures...");

checker.registerDefaultRules();
checker.configure(config);

fs.readdirSync(baseDir).forEach(function(configName)
{
    if (path.extname(configName) === ".json")
    {
        configName = path.basename(configName, path.extname(configName));

        ["rc", "api"].forEach(function(method)
        {
            var output = check(checker, configName, method),
                name = configName + "-" + method;

            if (generate)
                writeFixture(name, output);
            else
                compareWithFixture(name, output);

            // Also compare rc version to API version, they should be the same
            if (method === "rc")
            {
                output = readFixture(name);
                compareWithFixture(configName + "-api", output);
            }
        });
    }
});
