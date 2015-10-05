"use strict";

var chalk = require("chalk"),
    util = require("util");

/**
 * @param {object[]} errorsCollection
 * @param {object} [options]
 * @param {boolean} [options.colorize=true] - Whether to colorize the output.
 * @param {object} [options.colors] - An object which specifies colors for the output.
 */
module.exports = function(errorsCollection, options)
{
    options = options || {};

    // If options.colorize is truthy, use that value. Otherwise
    // use chalk.enabled, which will be set to false if the user
    // passed --no-colors to the command line.
    var colorize = !!options.colorize === true ? true : chalk.enabled;

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
                console.log(explainError(lines, error, errors._verbose, colorize));
            });
        }
    });

    if (errorCount)
    {
        /**
         * Printing summary.
         */
        console.log(util.format("\n%d code style error%s found.", errorCount, errorCount === 1 ? "" : "s"));
    }
};

var colorMap = {
    file: chalk.red.bold,
    location: chalk.gray.bold,
    error: chalk.red.bold,
    message: chalk.gray.bold,
    separator: chalk.dim,
    source: null,
    caret: chalk.green.bold
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

    var keys = Object.keys(map);

    for (var key in keys)
    {
        if (keys.hasOwnProperty(key) && colorMap.hasOwnProperty(key))
        {
            var style = parseStyle(map[key]);

            if (style !== undefined)
                colorMap[key] = style;
        }
    }
}

function explainError(lines, error, verbose, colorize)
{
    function colorizeText(color, text)
    {
        var func = colorMap[color];

        if (func)
        {
            // enabled flag is in func
            func.enabled = colorize;
            return func(text);
        }

        return text;
    }

    var line = lines[error.line - 1].replace("\t", " "),
        file = colorizeText("file", error.filename),
        location = colorizeText("location", error.line + ":" + (error.column + 1)),
        sep = colorizeText("separator", ":"),
        caret = line.substr(0, error.column).replace(/./g, " ") + colorizeText("caret", "^"),
        source = colorizeText("source", line),
        message = error.message;

    if (verbose)
    {
        var match = message.match(/([a-z][\w\-]*?): (.+)/);

        if (match)
            message = match[2] + " [" + match[1] + "]";
    }

    message = colorizeText("message", message);

    return file + sep + location + sep + " " + message + "\n" + source + "\n" + caret;
}
