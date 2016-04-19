//Create a new Feature Viewer and add some rendering options
var FV = require("feature-viewer");

window.onload = function() {

    var ft2 = new FV("FDSJKLFJDSFKLJDFHADJKLFHDSJKLFHDAFJKLDHFJKLDASFHDJKLFHDSAJKLFHDAKLFJDHSAFKLDLSNCDJ" +
    "KLFENFIUPERWDJKPCNVDFPIEHFDCFJDKOWFPDJWFKLXSJFDW9FIPUAENDCXAMSFNDUAFIDJFDLKSAFJDSAKFLJDSADJFDW9FIPUAENDCXAMSFNDAAAAAAAAAAAFJDSAKFL", "#div1", {
        showAxis: true,
        showSequence: true,
        brushActive: true,
        toolbar: true,
        bubbleHelp: true,
        zoomMax: 10
    });

//Add some features
    ft2.addFeature({
        data: [{x: 20, y: 32}, {x: 46, y: 100}, {x: 123, y: 167}],
        name: "test feature 1",
        className: "test1",
        color: "#968D73",
        type: "rect"
    });
    ft2.addFeature({
        data: [{x: 52, y: 52}, {x: 92, y: 92}],
        name: "test feature 2",
        className: "test2",
        color: "#667580",
        type: "rect"
    });
    
        ft2.addFeature({
        data: [{x: 130, y: 184}, {x: 40, y: 142}, {x: 80, y: 110}],
        name: "test feature 4",
        className: "test4",
        color: "#4F4C41",
        type: "path"
    });
    
    var dataDemo = [];
    var dataDemo2 = [];
    for (var i=1;i<213;i++) {
        var count = Math.floor(Math.random() *261);
        var count2 = Math.floor(Math.random() * 261);
        dataDemo.push({
            x: i,
            y:count2
        })
        dataDemo2.push({
            x: i,
            y:-count
        })
    };
    console.log(dataDemo);
    console.log(dataDemo2);
    ft2.addFeature({
        data: [dataDemo, dataDemo2],
        name: "test feature 3",
        className: "test3",
        color: ["#667580","#4F4C41"],
        type: "line",
        filter: "type2",
        height: "10",
        interpolation:"step"
    });


    
//Beside positions of each element, you can also give a specific description, which will appears in the tooltip when mouse hover, and a specific ID, for example to link a click event on the feature with something else in your project.
    ft2.addFeature({
        data: [{x: 120, y: 154, description: "aaaaa", id: "a1"}, {x: 22, y: 163, description: "bbbbb", id: "b1"},
            {x: 90, y: 108, description: "ccccc", id: "c1"}, {x: 10, y: 25, description: "ddddd", id: "d1"},
            {x: 193, y: 210, description: "eeeee", id: "e1"}, {x: 78, y: 85, description: "fffff", id: "f1"},
            {x: 96, y: 143, description: "ggggg", id: "g1"}, {x: 14, y: 65, description: "hhhhh", id: "h1"},
            {x: 56, y: 167, description: "jjjjj", id: "j1"}],
        name: "test feature 5",
        className: "test5",
        color: "#5C832F",
        type: "rect"
    });

    //@biojs-instance=ft2
    ft2.onAll(function(name,data){
        console.log(arguments);
    });
};
