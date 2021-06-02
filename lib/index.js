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

const createFeature = require("../src/feature-viewer.js");
 
//Optional : usage with neXtProt
const Nextprot = require("nextprot/src/nextprot-core.js");
const NXUtils = require("nextprot/src/nextprot-utils.js")["NXUtils"];
const NXViewerUtils = require("nextprot/src/nextprot-utils.js")["NXViewerUtils"];

//Optional : usage with neXtProt
const nxFeatureViewer = require("../src/fv.nextprot.js");

require("biojs-events").mixin(createFeature.prototype);
module.exports = { createFeature, Nextprot, NXUtils, NXViewerUtils, nxFeatureViewer };