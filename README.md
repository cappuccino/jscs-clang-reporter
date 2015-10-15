jscs-clang-reporter
===================

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Build status][appveyor-image]][appveyor-url]

This reporter for [JSCS](http://jscs.info) provides more concise output than the JSCS `console` reporter, but more information than the JSCS one-line reporters. The output is formatted similar to the error output from `clang`.

Here is sample output in verbose mode (passing `-v|--verbose` on command line):

![ ](docs/report.png)



## Installation

Install into your project with `npm` in the usual way:

```sh
npm i jscs-clang-reporter
```



## Usage

To use with JSCS, specify the path to the reporter on the command line:

```sh
jscs -r node_modules/jscs-clang-reporter lib
```

Note that the reporter will obey the `--no-colors` flag if it passed on the command line.

If you are using the reporter programmatically, for example with [gulp-jscs](https://www.npmjs.com/package/gulp-jscs), simply pass the same path:

```js
gulp.task("default", () => {
    return gulp.src("src/app.js")
        .pipe(jscs())
        .pipe(jscs.reporter("node_modules/jscs-clang-reporter"));
});
```



## Customization

You can configure the behavior of the reporter by creating a `.clangformatterrc` file in JSON format. The reporter searches for this file starting at the current working directory, then traversing up to the root of the filesystem. If the current user's home directory was not traversed, that is searched as well.

There are two possible properties in `.clangformatterrc`, `colorize` and `colors`.


### colorize

Output is colorized by default, unless `-n|--no-colors` is passed on the command line. If colorizing was not disabled on the command line and this property is set to a boolean, this property will be used to determine colorizing.


### colors

Use this property to customize the colors used by the reporter. If colorization is off, this property is ignored.

By default, the elements of each error message are colorized with the following [chalk](https://github.com/chalk/chalk) colors (`null` means no colorizing):

Name      | Color
:-------  | :-----
file      | green.bold
location  | bold
message   | bold
rule      | bold.dim
separator | dim
source    | null
caret     | magenta.bold
summary   | red.bold

A formatted error message has the following structure:

```
<file>:<location>: <message> <rule>
<source>
<caret>
```

The elements of the message are:

- **file** - The filename where the error occurred.
- **location** - The one-based line:column within the entire source where the issue occurred.
- **message** - The error message.
- **rule** - If verbose mode is on, the name of the offending rule in `[]`.
- **source** - The line of code within the file where the issue occurred.
- **caret** - `^` marks the position within `<source>` where the error occurred.
- **separator** - The ":" characters in the first line are colorized with the "separator" color in the color map.

In addition, **summary** refers to the color used for the summary of how many errors were found.

You can customize these colors by passing your own color map in the `colors` property. The map should be an object whose keys are one of the element names listed above, and whose values are the equivalent of the dotted `chalk` function, but without the "chalk." prefix.

Here is a sample color map:

```json
{
    "colors": {
        "file": "bgBlue.yellow",
	     "location": "blue.underline",
	     "message": "bgGreen.bold",
	     "separator": "green",
	     "source": "inverse",
	     "caret": "cyan.bold",
	     "summary": null
	 }
}
```

You do not need to set all of the values in the map if you only wish to override a few colors; only the elements whose keys are in the map will be affected. To turn off colorizing for an element, pass `null` as the value. Invalid element keys or styles will cause that item in the map to be ignored.

[npm-url]: https://npmjs.org/package/jscs-clang-reporter
[npm-image]: http://img.shields.io/npm/v/jscs-clang-reporter.svg?style=flat

[travis-url]: https://travis-ci.org/cappuccino/jscs-clang-reporter
[travis-image]: https://travis-ci.org/cappuccino/jscs-clang-reporter.svg?branch=master

[appveyor-url]: https://ci.appveyor.com/project/aparajita/jscs-clang-reporter
[appveyor-image]: https://ci.appveyor.com/api/projects/status/p6oiux8x9j2y7k9j?svg=true
