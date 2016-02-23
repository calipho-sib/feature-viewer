
var nxClient;

function nxFeatureViewer(nx, entry, div, options) {
    nxClient = nx;
    return new Promise(function(resolve, reject) {
        var ft;
        var isoform = entry;
        var sequence = "";
        if (entry.startsWith("NX_")) {
            var isoNb = isoform.split("-")[1] ? isoform : isoform.split("-")[0] + "-1";
            var nxEntry = isoform.split("-")[0];
            nx.getProteinSequence(nxEntry).then(function (data) {
                var isoSeq = data.filter(function(iso) {return iso.uniqueName === isoNb});
                var sequence = isoSeq[0].sequence;
                FeatureViewer.prototype.isoform = isoNb;
                FeatureViewer.prototype.entry = nxEntry;
                FeatureViewer.prototype.nxClient = nx;
                FeatureViewer.prototype.addNxFeature = addNxFeature;
                ft = new FeatureViewer(sequence, div, options);
                resolve(ft);
            })
        }
    });

}

function filterFeatures(featuresForViewer, viewer) {
    var isoName = viewer.isoform;
    for (var i = 0; i < featuresForViewer.length; i++) {
        if (Object.keys(featuresForViewer[i]).length !== 0 && featuresForViewer[i].hasOwnProperty(isoName)) {
            var feature = jQuery.extend({}, featuresForViewer[i][isoName]);
            viewer.addFeature(feature);
        }
    }
}

function mergeData(oneData, metaData, viewer) {
    featuresForViewer = [];

    for (var i = 0; i < oneData.length; i++) {
        var feat = NXUtils.convertMappingsToIsoformMap(oneData[i], metaData[i].name, metaData[i].filter);
        var featForViewer = NXViewerUtils.convertNXAnnotations(feat, metaData[i]);
        featuresForViewer.push(featForViewer);
    }
    return featuresForViewer;
}

function getFeaturesByview(nx, list, entry) {
    
    var data = [];
    for (var feat in list) {
        switch (list[feat]) {
        case "sequence":
            data.push(nx.getProteinSequence(entry));
            break;
        case "antibody":
            data.push(nx.getAntibody(entry));
            break;
        case "isoform-mapping":
            data.push(nx.getIsoformMapping(entry));
            break;
        default:
            data.push(nx.getAnnotationsByCategory(entry, list[feat]));
            break;
        }
    }
    return data;
}

function addNxFeature(featuresName, featuresStyle) {
    var that = this;
    return new Promise(function(resolve, reject) {
        Promise.all(getFeaturesByview(that.nxClient, featuresName, that.entry))
            .then(function (oneData) {
                var featuresForViewer = mergeData(oneData, featuresStyle);
                filterFeatures(featuresForViewer, that);
                resolve(that);
            }).catch(function (err) {
                // catch any error that happened so far
                console.log("Argh, broken: " + err.message);
                console.log("Error at line : " + err.stack);
            });
        
    });
}

if ( typeof module === "object" && typeof module.exports === "object" ) {
    module.exports = nxFeatureViewer;
}