
var FeatureViewer = require("feature-viewer");
//Create a new Feature Viewer and add some rendering options

window.onload = function() {
    //Create a new Feature Viewer and add some rendering options
    var ft2 = new FeatureViewer("FDSJKLFJDSFKLJDFHADJKLFHDSJKLFHDAFJKLDHFJKLDASFHDJKLFHDSAJKLFHDAKLFJDHSAFKLDLSNCDJKLFENFIUPERWDJKPCNVDFPIEHFDCFJDKOWFPDJWFKLXSJFDW9FIPUAENDCXAMSFNDUAFIDJFDLKSAFJDSAKFLJDSADJFDW9FIPUAENDCXAMSFNDAAAAAAAAAAAFJDSAKFL","#div1", {
        showAxis: true,
        showSequence: true,
        brushActive: true,
        toolbar:true,
        bubbleHelp:true,
        zoomMax:10
                });

    //Add some features
    ft2.addFeature({
        data: [{x:20,y:32},{x:46,y:100},{x:123,y:167}],
        name: "test feature 1",
        className: "test1",
        color: "#005572",
        type: "rect",
        filter: "type1"
    });
    ft2.addFeature({
        data: [{x:52,y:52},{x:92,y:92}],
        name: "test feature 2",
        className: "test2",
        color: "#006588",
        type: "rect",
        filter: "type2"
    });
    ft2.addFeature({
        data: [{x:130,y:184},{x:40,y:142},{x:80,y:110}],
        name: "test feature 3",
        className: "test3",
        color: "#eda64f",
        type: "path",
        filter: "type2"
    });
    ft2.addFeature({
        data: [{x:120,y:154},{x:90,y:108},{x:10,y:25},{x:193,y:210},{x:78,y:85},{x:96,y:143},{x:14,y:65},{x:56,y:167}],
        name: "test feature 4",
        className: "test4",
        color: "#F4D4AD",
        type: "rect",
        height: 8,
        filter: "type1"
    });
    var dataDemo = [];
    for (var i=1;i<100;i++) {
        var count = Math.floor((Math.random() * 20) + 1);
        dataDemo.push({
            x: i*2,
            y:count
        })
    }
    ft2.addFeature({
        data: dataDemo,
        name: "test feature 5",
        className: "test5",
        color: "#008B8D",
        type: "line",
        filter: "type2",
        height: "5"
    });

    //Beside positions of each element, you can also give a specific description, which will appears in the tooltip when mouse hover, and a specific ID, for example to link a click event on the feature with something else in your project.
    ft2.addFeature({
        data: [{x:120,y:154,description:"aaaaa",id:"a1"},{x:22,y:163,description:"bbbbb",id:"b1"},
               {x:90,y:108,description:"ccccc",id:"c1"},{x:10,y:25,description:"ddddd",id:"d1"},
               {x:193,y:210,description:"eeeee",id:"e1"},{x:78,y:85,description:"fffff",id:"f1"},
               {x:96,y:143,description:"ggggg",id:"g1"},{x:14,y:65,description:"hhhhh",id:"h1", color:"#12E09D"},
               {x:56,y:167,description:"jjjjj",id:"j1"}],
        name: "test feature 6",
        className: "test6",
        color: "#81BEAA",
        type: "rect",
        filter: "type2"
    });
    //@biojs-instance=ft2
    ft2.onAll(function(name,data){
        console.log(arguments);
    });
};
