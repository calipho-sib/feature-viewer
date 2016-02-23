//initalize nextprot Client
var FeatureViewer = require("feature-viewer");

var applicationName = 'demo app'; //please provide a name for your application
var clientInfo='calipho group at sib'; //please provide some information about you
var nx = new Nextprot.Client(applicationName, clientInfo);

//        var entry = "NX_P01308";
var isoform = "NX_P01308-1";

// feature viewer options
var options = {showAxis: true, showSequence: true,
   brushActive: true, toolbar:true,
   bubbleHelp: true, zoomMax:20 };

// Init nextprot feature viewer
nxFeatureViewer(nx, isoform, "#div1", options).then(function(ff){
    // Add first custom feature
    ff.addFeature({
        data: [{x:20,y:32},{x:46,y:100},{x:123,y:167}],
        name: "test feature 1",
        className: "test1",
        color: "#0F8292",
        type: "rect",
        filter: "type1"
    });
    // Add second custom feature
    ff.addFeature({
        data: [{x:10,y:40},{x:30,y:80},{x:90,y:100}],
        name: "test feature 2",
        className: "test2",
        color: "#6f920f",
        type: "rect",
        filter: "type1"
    });
    // Add third feature from nextprot
    var styles = [
        {name: "Propeptide",className: "pro",color: "#B3B3B3",type: "rect",filter:"Processing"}, 
        {name: "Mature protein",className: "mat",color: "#B3B3C2",type: "rect",filter:"Processing"}
     ]; 
    ff.addNxFeature(["propeptide","mature-protein"], styles);

    // Add fourth feature from nextprot
    var styles2 = [
        {name: "Variant",className: "variant",color: "rgba(0,255,154,0.3)",type: "unique",filter:"Variant"},
        {name: "Disulfide bond",className: "dsB",color: "#B3B3E1",type: "path",filter:"Modified Residue"}
     ];
    ff.addNxFeature(["variant","disulfide-bond"], styles2).then(function(ff) {
        // add fifth custom feature below fourth feature
        ff.addFeature({
            data: [{x:5,y:60},{x:20,y:20},{x:50,y:100}],
            name: "test feature 3",
            className: "test3",
            color: "#923c0f",
            type: "rect",
            filter: "type1"
        });
    });
    //@biojs-instance=ff
    ff.onAll(function(name,data){
        console.log(arguments);
    });
});