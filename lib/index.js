"use strict";

var chalk = require("chalk"),
    util = require("util");

// jscs: disable requireMultipleVarDecl

var colorMap = {
    file: chalk.cyan.bold,
    location: chalk.gray.bold,
    error: chalk.red.bold,
    message: chalk.gray.bold,
    separator: chalk.dim,
    source: null,
    caret: chalk.green.bold
};

// jscs: enable

/**
 * @param {object[]} errorsCollection
 * @param {object} [options]
 * @param {boolean} [options.colorize=true] - Whether to colorize the output.
 * @param {object} [options.colors] - An object which specifies colors for the output.
 */
module.exports = function(errorsCollection, options)
{
    var output = "";

    options = options || {};

    // If options.colorize is truthy, use that value. Otherwise
    // use chalk.enabled, which will be set to false if the user
    // passed --no-colors to the command line.
    var colorize = !!options.colorize === true ? true : chalk.enabled,
        log = typeof options.log === "boolean" ? options.log : true;

    if (colorize && typeof options.colors === "object")
        setColorMap(options.colors);

    var errorCount = 0;

    /**
     * Formatting every error set.
     */
    errorsCollection.forEach(function(errors)
    {
        if (!errors.isEmpty())
        {
            /**
             * Formatting every single error.
             */
            var errorList = errors.getErrorList(),
                lines = errors._file.getLines();

            errorList.forEach(function(error)
            {
                ++errorCount;
                output += explainError(lines, error, errors._verbose, colorize);
            });
        }
    });

    if (errorCount)
    {
        var summary = util.format("\n\u2716 %d error%s", errorCount, errorCount === 1 ? "" : "s");

        colorMap.error.enabled = colorize;
        output += colorMap.error(summary);
    }

    if (log)
        console.log(output);

    return output;
};

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

    Object.keys(map).forEach(function(key)
    {
        if (colorMap.hasOwnProperty(key))
        {
            var style = parseStyle(map[key]);

            if (style !== undefined)
                colorMap[key] = style;
        }
    });
}

function colorizeText(colorize, color, text)
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

function explainError(lines, error, verbose, colorize)
{
    var line = lines[error.line - 1].replace("\t", " "),
        source = colorizeText(colorize, "source", line),
        file = colorizeText(colorize, "file", error.filename),
        location = colorizeText(colorize, "location", error.line + ":" + (error.column + 1)),
        sep = colorizeText(colorize, "separator", ":"),
        caret = line.substr(0, error.column).replace(/./g, " ") + colorizeText(colorize, "caret", "^"),
        message = error.message;

    if (verbose)
    {
        var match = message.match(/([a-z][\w\-]*?): (.+)/);

        if (match)
            message = match[2] + " [" + match[1] + "]";
    }

    message = colorizeText(colorize, "message", message);

    return file + sep + location + sep + " " + message + "\n" + source + "\n" + caret + "\n";
}
