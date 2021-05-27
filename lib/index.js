/*
 * feature-viewer
 * https://github.com/calipho-sib/feature-viewer
 *
 * Copyright (c) 2015 Calipho - SIB
 * Licensed under the GNU GPL v2 license.
 */

/**
 @class FeatureViewer
 */


global.jQuery = $ = require("jquery");
d3 = require("d3");
require("bootstrap/js/src/tooltip.js");
require("bootstrap/js/src/popover.js");

const drawGraph = require("../src/feature-viewer.js");
 
//Optionnal : usage with nextprot
const Nextprot = require("nextprot/src/nextprot-core.js");
const NXUtils = require("nextprot/src/nextprot-utils.js")["NXUtils"];
const NXViewerUtils = require("nextprot/src/nextprot-utils.js")["NXViewerUtils"];

//Optionnal : usage with nextprot
const nxFeatureViewer = require("../src/fv.nextprot.js");

require("biojs-events").mixin(drawGraph.prototype);
module.exports = { drawGraph, Nextprot, NXUtils, NXViewerUtils, nxFeatureViewer };