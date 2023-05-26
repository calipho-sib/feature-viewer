# neXtProt - The knowledge resource on human proteins

This is a code repository for the SIB - Swiss Institute of Bioinformatics CALIPHO group neXtProt project

See: https://www.nextprot.org/

# neXtProt feature viewer

[![DOI](https://zenodo.org/badge/36719341.svg)](https://zenodo.org/badge/latestdoi/36719341)

> The feature viewer is a super easy javascript library to use in order to draw the different features covering a sequence for a better visualization.

**Full documentation and live demo** : http://calipho-sib.github.io/feature-viewer/examples/   

This version is made in Javascript using the D3 library. For the TypeScript version, see : https://github.com/Lisanna/feature-viewer-typescript   

![Feature viewer](/assets/FV_SCSHT.png)

## Getting Started

**1.** You can get the library in your project using NPM/Yarn
```
//NPM//
npm install feature-viewer

//Yarn//
yarn add feature-viewer
```

Or Include the feature-viewer from jsDelivr CDN in the header of your html
```html
<script src="https://cdn.jsdelivr.net/gh/calipho-sib/feature-viewer@v1.1.0/dist/feature-viewer.bundle.js"></script>
```

**NOTE** : If you already got the dependencies (D3, Bootstrap & Jquery) in your project, use the simple minified version instead of the bundle :
```html
<script src="https://cdn.jsdelivr.net/gh/calipho-sib/feature-viewer@v1.1.0/dist/feature-viewer.min.js"></script>
```

**2.** Specify a div in your html
```
<div id="fv1"></div>
```

**3.** Create an instance of FeatureViewer in JavaScript with the sequence (or a length), the div in which it will be display and the rendering options of your choice.
```javascript

var ft = new FeatureViewer.createFeature('MALWMRLLPLLALLALWGPGPGAGSLQPLALEGSLQKRGIVEQCCTSICSLYQLE',
                           '#fv1',
                            {
                                showAxis: true,
                                showSequence: true,
                                brushActive: true, //zoom
                                toolbar:true, //current zoom & mouse position
                                bubbleHelp:true, 
                                zoomMax:50 //define the maximum range of the zoom
                            });
                            
//Instead of a sequence, you can also initialize the feature viewer with a length (integer) :
var ft = new FeatureViewer.createFeature(213,'#fv1');
```

To import Feature Viewer into an ES2015 application, you can import specific symbols from specific Feature Viewer modules:
```javascript
import { createFeature } from "feature-viewer";
```

In Node:
```javascript
const { createFeature } = require("feature-viewer");
```

**4.** Finally, add the features
   ```javascript
ft.addFeature({
       data: [{x:20,y:32},{x:46,y:100},{x:123,y:167}],
       name: "test feature 1",
       className: "test1", //can be used for styling
       color: "#0F8292",
       type: "rect" // ['rect', 'path', 'line']
   });
   ```
   
**5.** Et voila!

![Feature viewer](/assets/feature-viewer.png)


## Functionalities

* Zoom into the Feature-viewer by selecting a part of the sequence with your mouse. Zoom out with a right-click.    
You can also zoom programmatically with the methods **```zoom(start,end)```** and **```resetZoom()```**


* A tooltip appears when the mouse is over a feature, giving its exact positions, and optionally, a description.
 
 
* beside the positions for each element, you can also give a description & an ID, allowing you to link click event on the feature to the rest of your project.

## Options

* Show axis
* Show sequence
* Brush active (zoom)
* Toolbar (current zoom & position)
* Bubble help 
* Zoom max
* Features height
* Offset

## ClearInstance()

You may sometimes want to reload your feature-viewer with new parameters. To avoid memory leaks, the method **```clearInstance()```** will clear each element & listener for you before you delete the feature-viewer instance.


## Documentation

Check out this page for a better understanding of how to use the feature viewer and its possibilities :
* http://calipho-sib.github.io/feature-viewer/examples/   

## Use it with NeXtProt API

<img src="/assets/FVDemo.png" width="100%" />

It is possible to fill the feature viewer with protein features from [NeXtProt](https://www.nextprot.org/), the human protein database.   

- First, find your protein of interest in NeXtProt and get the neXtProt accession (NX_...). (You can find your protein by entering an accession number of another database, like UniProt or Ensembl)   
- Then, check the type of feature in the [NeXtProt API](https://api.nextprot.org/) that you would like to add to your viewer. For example, "propeptide" or "mature-protein".
- Include the feature viewer bundle with nextprot to your html  : feature-viewer.nextprot.js
- Finally, create your feature-viewer like this :

```javascript
//initalize nextprot Client
var applicationName = 'demo app'; //please provide a name for your application
var clientInfo='calipho group at sib'; //please provide some information about you

const { nxFeatureViewer, Nextprot } = FeatureViewer;

var nx = new Nextprot.Client(applicationName, clientInfo);
        
//var entry = "NX_P01308";
var isoform = "NX_P01308-1";

// feature viewer options
var options = {showAxis: true, showSequence: true,
brushActive: true, toolbar:true,
bubbleHelp: true, zoomMax:20 };

// Create nextprot feature viewer
nxFeatureViewer(nx, isoform, "#div2", options).then(function(ff){
// Add first custom feature
ff.addFeature({
    data: [{x:20,y:32},{x:46,y:100},{x:123,y:167}],
    name: "test feature 1",
    className: "test1",
    color: "#0F8292",
    type: "rect",
    filter: "type1"
});
// Add second feature from nextprot
var styles = [
    {name: "Propeptide",className: "pro",color: "#B3B3B3",type: "rect",filter:"Processing"}, 
    {name: "Mature protein",className: "mat",color: "#B3B3C2",type: "rect",filter:"Processing"}
 ]; 
ff.addNxFeature(["propeptide","mature-protein"], styles);

```

## Examples 

https://api.nextprot.org/entry/NX_P01308/proteomics

## Support

If you have any problem or suggestion please open an issue [here](https://github.com/calipho-sib/feature-viewer/issues).

## Development

`git clone https://github.com/calipho-sib/feature-viewer.git` 

`npm install`  (will install the development dependencies)

`npm start`  (will start the development server on localhost:8080)

...make your changes and modifications...

`npm run build` (will create the bundle js & css in build/)

`npm publish` (will publish in npm)



## License 

Copyright (c) 2015, SIB Swiss Institute of Bioinformatics

This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later version.
