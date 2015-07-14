#Feature viewer
The feature viewer is a super easy javascript library to use in order to draw the different features covering a sequence for a better visualization.
![Sequence viewer](/assets/feature-viewer.png)

Live demo: https://cdn.rawgit.com/calipho-sib/feature-viewer/master/demo/index.html

#How to run

1) Include the library using bower or simply by including the javascript feature-viewer.js
```
bower install feature-viewer
```
2) Specify a div in your html
```
<div id="feature-viewer"></div>
```
3) Create an instance of FeatureViewer in javascript with the sequence, the div in which it will be display and the rendering options of your choice.
```
var ft = new FeatureViewer('MALWMRLLPLLALLALWGPGPGAGSLQPLALEGSLQKRGIVEQCCTSICSLYQLE',
                           '#div1',
                            {
                                showAxis: true,
                                showSequence: true,
                                brushActive: true, //zoom
                                toolbar:true //current zoom & mouse position
                            });
```
4) Finally, add the features
   ```
ft.addFeature({
       data: [{x:20,y:32},{x:46,y:100},{x:123,y:167}],
       name: "test feature 1",
       className: "test1", //can be used for styling
       color: "#0F8292",
       type: "rect" // ['rect', 'multipleRect', 'path', 'unique']
   });
   ```
5) Et voila!

![Sequence viewer](/assets/feature-viewer.png)


Note: that if you choose the later approach (by just using the feature-viewer.js) you should also include the dependencies :  jquery,d3 and bootstrap.js / bootstrap.min.css

#Functionalities

* Zoom into the Feature-viewer by selecting a part of the sequence with your mouse. Zoom out with a right-click.

* A tooltip appears when the mouse is over a feature, giving its exact positions, and optionally, a description.
 
* beside the positions for each element, you can also give a description & an ID, allowing you to link click event on the feature to the rest of your project.


Check out this page for a better understanding of how to use the sequence viewer and its possibilities :
* https://cdn.rawgit.com/calipho-sib/feature-viewer/master/demo/index.html


# Options

* Show axis
* Show sequence
* Brush active (zoom)
* Toolbar (current zoom & position)


