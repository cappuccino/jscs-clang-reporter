"use strict";

/* eslint-disable */

// requireMultipleVarDecl
// requireLineBreakAfterVariableAssignment
let y = 7, z = 13;
let x = 13;

// requirePaddingNewLinesAfterBlocks
if (x)
{
    x = 0;
}
console.log("oops"); // requirePaddingNewLinesBeforeExport
module.exports = 7;

// requirePaddingNewlinesBeforeKeywords: do, for, if, switch, case, try, void, with
x = 0;
do
{
    x = 1;
}
while (x);

x = 0;
for (let key in object)
    x = 7;

x = 0;
if (x)
    x = 0;

x = 0;
switch (x)
{
    case 1:
        break;
    case 2:
        break;
    default:
        break;
}

x = 0;
try
{
    x = 7;
}
catch (e)
{
    // nothing
}

// validateAlignedFunctionParameters
function align1(foo,
                bar)
{
    // nothing
}

function align2(
    foo,
    bar)
{
    // nothing
}

function align3(
    foo,
    bar
)
{
    // nothing
}
