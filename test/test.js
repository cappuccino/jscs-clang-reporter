"use strict";

var child_process = require("child_process"),
    fs = require("fs"),
    path = require("path");

function readFixture(name)
{
    return fs.readFileSync(path.join("test/fixtures", name + ".txt"), "utf8");
}

function test(verbose)
{
    var arg = verbose ? ["-v"] : [],
        type = verbose ? "Verbose" : "Non-verbose",
        result = child_process.spawnSync(
            "node_modules/.bin/jscs",
            arg.concat("-r . test/fixtures".split(" ")),
            { encoding: "utf8" }
        );

    if (result.status === 2)
    {
        if (result.stdout === readFixture("test" + (verbose ? "-verbose" : "")))
            console.log("%s test passed", type);
        else
            console.log("%s test failed: output did match fixture", type);
    }
    else
        console.log("%s test failed: expected status 2, got %d (%s)", type, result.status, result.stderr.trim());
}

test(false);
test(true);
