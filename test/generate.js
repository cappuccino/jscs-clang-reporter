"use strict";

var child_process = require("child_process"),
    fs = require("fs"),
    path = require("path");

function writeFixture(name, data)
{
    return fs.writeFileSync(path.join("test/fixtures", name + ".txt"), data, { encoding: "utf8" });
}

function generate(verbose)
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
        writeFixture("test" + (verbose ? "-verbose" : ""), result.stdout);
        console.log("%s fixture written", type);
    }
    else
        console.log("%s jscs failed: expected status 2, got %d (%s)", type, result.status, result.stderr.trim());
}

generate(false);
generate(true);
