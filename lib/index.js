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
var d3 = require("d3");
require("bootstrap/js/tooltip.js");
require("bootstrap/js/popover.js");

var FeatureViewer = require("../src/feature-viewer.js");


require("biojs-events").mixin(FeatureViewer.prototype);
module.exports = FeatureViewer;