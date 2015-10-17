"use strict";

var chalk = require("chalk"),
    fs = require("fs"),
    homedir = require("os-homedir"),
    path = require("path"),
    pathExists = require("path-exists").sync,
    util = require("util");

var defaultColorMap = {  // jscs: ignore requireMultipleVarDecl
    file: chalk.cyan.bold,
    location: null,
    message: chalk.bold,
    rule: chalk.gray.bold,
    separator: chalk.dim,
    source: null,
    caret: chalk.green.bold,
    summary: chalk.red.bold
};

/**
 * @param {object[]} errorsCollection
 * @param {object} [config]
 */
module.exports = function(errorsCollection, config)
{
    if (!config || typeof config.clangFormatter !== "object")
        config = loadConfig();
    else
        config = config.clangFormatter;

    var colorize = typeof config.colorize === "boolean" ? config.colorize : chalk.enabled,
        colorMap = defaultColorMap;

    if (colorize && typeof config.colors === "object")
        colorMap = setColorMap(config.colors);

    var output = "\n",
        errorCount = 0;

    /**
     * Format every error set.
     */
    errorsCollection.forEach(function(errors)
    {
        if (!errors.isEmpty())
        {
            /**
             * Format every error.
             */
            var errorList = errors.getErrorList(),
                lines = errors._file.getLines();

            errorList.forEach(function(error)
            {
                ++errorCount;
                output += explainError(lines, error, errors._verbose, colorize, colorMap);
            });
        }
    });

    if (errorCount)
    {
        var summary = util.format("\n%d error%s found.", errorCount, errorCount === 1 ? "" : "s");

        colorMap.summary.enabled = colorize;
        output += colorMap.summary(summary);
    }

    console.log(output);
};

function loadConfig()
{
    var dir = process.cwd(),
        home = homedir(),
        visitedHome,
        rcPath;

    while (true)
    {
        visitedHome = dir === home;
        rcPath = path.join(dir, ".clangformatterrc");

        if (pathExists(rcPath))
            return JSON.parse(fs.readFileSync(rcPath, "utf8"));

        var previousDir = dir;

        dir = path.dirname(dir);

        // If it hasn't changed, we were at the root
        if (dir === previousDir)
            break;
    }

    rcPath = path.join(home, ".clangformatterrc");

    if (!visitedHome && pathExists(rcPath))
        return JSON.parse(fs.readFileSync(rcPath, "utf8"));

    return {};
}

function setColorMap(map)
{
    function parseStyle(style)
    {
        if (typeof style === "string")
        {
            var parsedStyle = chalk,
                styles = style.split(".");

            for (var i = 0; i < styles.length; ++i)
            {
                parsedStyle = parsedStyle[styles[i]];

                if (parsedStyle === undefined)
                    return undefined;
            }

            return parsedStyle;
        }

        return style;
    }

    var colors = {};

    Object.keys(defaultColorMap).forEach(function(key)
    {
        var color;

        if (map.hasOwnProperty(key))
            color = parseStyle(map[key]);

        colors[key] = color || defaultColorMap[key];
    });

    return colors;
}

function colorizeText(colorize, colorMap, color, text)
{
    if (colorize)
    {
        var func = colorMap[color];

        if (func)
        {
            // enabled flag is in func
            func.enabled = true;
            return func(text);
        }
    }

    return text;
}

function explainError(lines, error, showRule, colorize, colorMap)
{
    var line = lines[error.line - 1].replace("\t", " "),
        source = colorizeText(colorize, colorMap, "source", line),
        file = colorizeText(colorize, colorMap, "file", error.filename),
        location = colorizeText(colorize, colorMap, "location", error.line + ":" + (error.column + 1)),
        sep = colorizeText(colorize, colorMap, "separator", ":"),
        caret = line.substr(0, error.column).replace(/./g, " ") + colorizeText(colorize, colorMap, "caret", "^"),
        message = error.message;

    if (showRule)
    {
        var match = message.match(/([a-z][\w\-]*?): (.+)/);

        if (match)
        {
            var rule = colorizeText(colorize, colorMap, "rule", " [" + match[1] + "]");

            message = colorizeText(colorize, colorMap, "message", match[2]) + rule;
        }
    }
    else
        message = colorizeText(colorize, colorMap, "message", message);

    return file + sep + location + sep + " " + message + "\n" + source + "\n" + caret + "\n";
}
