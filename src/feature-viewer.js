var FeatureViewer = (function () {

    function FeatureViewer(sequence, div, options) {
//        var nxSeq = sequence.startsWith('NX_') ? true : false;
        var self = this;
        // if (!div) var div = window;
        this.events = {
            FEATURE_SELECTED_EVENT: "feature-viewer-position-selected"
        };

        // if (!div) var div = window;
        var div = div;
        var el = document.getElementById(div.substring(1));
        var svgElement;
        var sequence = sequence;
        var features = [];
        var SVGOptions = {
            showSequence: false,
            brushActive: false,
            verticalLine: false
        };
        var pathLevel = 0;
        var svg;
        var svgContainer;
        var filter;
        var yData = [];
        var yAxisSVG;
        var yAxisSVGgroup;
        var Yposition = 20;
        var level = 0;
        var seqShift = 0;
        var zoom = false;
        var zoomMax = 50;
        var featureSelected = {};

        function colorSelectedFeat(feat, object) {
            //change color && memorize
            if (featureSelected !== {}) d3.select(featureSelected.id).style("fill", featureSelected.originalColor);
            if (object.type !== "path" && object.type !== "line"){
                featureSelected = {"id": feat, "originalColor": d3.select(feat).style("fill") || object.color};
                d3.select(feat).style("fill", "orangered");
            }
        }

        /**
         * Private Methods
         */

            //Init box & scaling
        d3.select(div)
            .style("position", "relative")
            .style("padding", "0px")
            .style("z-index", "2");

        var margin = {
                top: 10,
                right: 20,
                bottom: 20,
                left: 110
            },
            width = $(div).width() - margin.left - margin.right - 17,
            height = 600 - margin.top - margin.bottom;
        var scaling = d3.scale.linear()
            .domain([1, sequence.length])
            .range([5, width-5]);
        var scalingPosition = d3.scale.linear()
            .domain([0, width])
            .range([1, sequence.length]);

        function updateLineTooltip(mouse,pD){
            var xP = mouse-110;
            var elemHover = "";
            for (var l=0; l<pD.length;l++) {
                if (scaling(pD[l].x) < xP && scaling(pD[l+1].x) > xP) {
                    if ((xP - scaling(pD[l].x)) < (scaling(pD[l+1].x) - xP )) {
                        elemHover = pD[l];
                    }
                    else elemHover = pD[l+1];
                    break;
                }
            }
            return elemHover;
        }
        
        d3.helper = {};

        d3.helper.tooltip = function (object) {
            var tooltipDiv;
            var selectedRect;
            var bodyNode = d3.select(div).node();

            function tooltip(selection) {

                selection.on('mouseover.tooltip', function (pD, pI) {
                    // Clean up lost tooltips
                    d3.select('body').selectAll('div.tooltip').remove();
                    // Append tooltip
                    var absoluteMousePos = d3.mouse(bodyNode);
                    var rightside = (absoluteMousePos[0] > width);
                    if (rightside) {
                        tooltipDiv = d3.select(div)
                            .append('div')
                            .attr('class', 'tooltip3');
                    } else {
                        tooltipDiv = d3.select(div)
                            .append('div')
                            .attr('class', 'tooltip2');
                        tooltipDiv.style({
                            left: (absoluteMousePos[0] - 15) + 'px'
                        });
                    }
                    tooltipDiv.style({
                        top: (absoluteMousePos[1] - 55) + 'px',
                        'background-color': 'rgba(0, 0, 0, 0.8)',
                        width: 'auto',
                        'max-width': '170px',
                        height: 'auto',
                        'max-height': '43px',
                        padding: '5px',
                        "font": '10px sans-serif',
                        'text-align': 'center',
                        position: 'absolute',
                        'z-index': 45,
                        'box-shadow': '0 1px 2px 0 #656565' 
                    });
                    if (object.type === "path") {
                        var first_line = '<p style="margin:2px;color:white">start : <span style="color:orangered">' + pD[0].x + '</span></p>';
                        var second_line = '<p style="margin:2px;color:white">end : <span style="color:orangered">' + pD[1].x + '</span></p>';
                    } else if (object.type === "line") {
                        var elemHover = updateLineTooltip(absoluteMousePos[0],pD);
                        var first_line = '<p style="margin:2px;color:white">start : <span style="color:orangered" id="tLineX">' + elemHover.x + '</span></p>';
                        var second_line = '<p style="margin:2px;color:white">end : <span style="color:orangered" id="tLineC">' + elemHover.y + '</span></p>';
                    } else if (object.type === "unique" || pD.x === pD.y) {
                        var first_line = '<p style="margin:2px;color:orangered">' + pD.x + '</p>';
                        if (pD.description) var second_line = '<p style="margin:2px;color:white;font-size:9px">' + pD.description + '</p>';
                        else var second_line = '';
                    } else {
                        var first_line = '<p style="margin:2px;color:orangered">' + pD.x + ' - ' + pD.y + '</p>';
                        if (pD.description) var second_line = '<p style="margin:2px;color:white;font-size:9px">' + pD.description + '</p>';
                        else var second_line = '';
                    }

                    tooltipDiv.html(first_line + second_line);
                    if (rightside) {
                        tooltipDiv.style({
                            left: (absoluteMousePos[0] + 10 - (tooltipDiv.node().getBoundingClientRect().width)) + 'px'
                        })
                    }
                })
                    .on('mousemove.tooltip', function (pD, pI) {
                    
                        if (object.type === "line") {
                            var absoluteMousePos = d3.mouse(bodyNode);
                            var elemHover = updateLineTooltip(absoluteMousePos[0],pD);
                            $('#tLineX').text(elemHover.x);
                            $('#tLineC').text(elemHover.y);  
                        }
                        // Move tooltip
                        // IE 11 sometimes fires mousemove before mouseover
                        if (tooltipDiv === undefined) { return; }
                        var absoluteMousePos = d3.mouse(bodyNode);
                        var rightside = (absoluteMousePos[0] > width);
                        if (rightside) {
                            tooltipDiv.attr("class", "tooltip3");
                            tooltipDiv.style({
                                left: (absoluteMousePos[0] + 10 - (tooltipDiv.node().getBoundingClientRect().width)) + 'px',
                                top: (absoluteMousePos[1] - 55) + 'px'
                            });
                        } else {
                            tooltipDiv.attr("class", "tooltip2");
                            tooltipDiv.style({
                                left: (absoluteMousePos[0] - 15) + 'px',
                                top: (absoluteMousePos[1] - 55) + 'px'
                            })
                        }
                    })
                    .on('mouseout.tooltip', function (pD, pI) {
                        // Remove tooltip
                        tooltipDiv.remove();
                    })
                    .on('click', function (pD, pI) {
                        var xTemp;
                        var yTemp;
                        var xRect;
                        var widthRect;
                        var elemHover;

                        if(this.nodeName === "text") {
                            var rect = "#"+this.previousSibling.id;
                            console.log(rect);
                            if(rect.nodeName !== "#") colorSelectedFeat(rect, object);
                        }
                        else colorSelectedFeat(this, object);

                        var svgWidth = d3.select(".background").attr("width");
                        d3.select('body').selectAll('div.selectedRect').remove();
                        // Append tooltip
                        selectedRect = d3.select(div)
                            .append('div')
                            .attr('class', 'selectedRect');
                        if (object.type === "path") {
                            xTemp = pD[0].x;
                            yTemp = pD[1].x;
                        } else if (object.type === "line") {
                            var absoluteMousePos = d3.mouse(bodyNode);
                            elemHover = updateLineTooltip(absoluteMousePos[0],pD);
                            xTemp = elemHover.x - 0.5;
                            yTemp = elemHover.x + 0.5;
                        } else if (object.type === "unique" || pD.x === pD.y) {
                            xTemp = pD.x - 0.4;
                            yTemp = pD.y + 0.4;
                        } else {
                            xTemp = pD.x;
                            yTemp = pD.y;
                        }

                        if (scaling(xTemp) < 0 && scaling(yTemp) > svgWidth) {
                            xRect = margin.left;
                            widthRect = parseInt(svgWidth) + 5;
                        } else if (scaling(xTemp) < 0) {
                            xRect = margin.left;
                            widthRect = (scaling(yTemp));
                        } else if (scaling(yTemp) > svgWidth) {
                            xRect = scaling(xTemp) + margin.left;
                            widthRect = parseInt(svgWidth) - scaling(xTemp);
                            widthRect =  widthRect + 5;
                        } else {
                            xRect = scaling(xTemp) + margin.left;
                            widthRect = (scaling(yTemp) - scaling(xTemp));
                        }
                        selectedRect.style({
                            left: xRect + 'px',
                            top: ($(div + " .svgHeader").length) ? 60 + 'px' : 10 + 'px',
                            'background-color': 'rgba(0, 0, 0, 0.2)',
                            width: widthRect + 'px',
                            height: (Yposition + 50) + 'px',
                            position: 'absolute',
                            'z-index': -1,
                            'box-shadow': '0 1px 2px 0 #656565'
                        });

                        if (CustomEvent) {
                            var event = new CustomEvent(self.events.FEATURE_SELECTED_EVENT, {
                                detail: {
                                    start: object.type === "path" ? pD[0].x : object.type === "line" ? elemHover.x : pD.x,
                                    end: object.type === "path" ? pD[1].x : object.type === "line" ? elemHover.y : pD.y,
                                    id: object.type === "path" ? pD[0].id : object.type === "line" ? elemHover.id : pD.id,
                                    description:object.type === "path" ? pD[0].description : object.type === "line" ? elemHover.description : pD.description
                                }
                            });
                            svgElement.dispatchEvent(event);
                        } else {
                            console.warn("CustomEvent is not defined....");
                        }
                        if (self.trigger) self.trigger(self.events.FEATURE_SELECTED_EVENT, {
                            start: object.type === "path" ? pD[0].x : object.type === "line" ? elemHover.x : pD.x,
                            end: object.type === "path" ? pD[1].x : object.type === "line" ? elemHover.y : pD.y,
                            id: object.type === "path" ? pD[0].id : object.type === "line" ? elemHover.id : pD.id,
                            description:object.type === "path" ? pD[0].description : object.type === "line" ? elemHover.description : pD.description
                        });

                    });
            }

            tooltip.attr = function (_x) {
                if (!arguments.length) return attrs;
                attrs = _x;
                return this;
            };

            tooltip.style = function (_x) {
                if (!arguments.length) return styles;
                styles = _x;
                return this;
            };

            return tooltip;
        };

        //COMPUTING FUNCTION
        var X = function (d) {
            return scaling(d.x);
        };
        var displaySequence = function (seq) {
            return width / seq > 5;
        };
        var rectWidth = function (d) {
            return (scaling(d.y) - scaling(d.x));
        };
        function rectX(object) {
            if (object.x === object.y) {
                return scaling(object.x-0.4);
            }
            return scaling(object.x);
        };
        function rectWidth2(d){
            if (d.x === d.y) {
                if (scaling(d.x + 0.4) - scaling(d.x - 0.4) < 2) return 2;
                else return scaling(d.x + 0.4) - scaling(d.x - 0.4);
            }
            return (scaling(d.y) - scaling(d.x));
        };
        var uniqueWidth = function (d) {
            return (scaling(1));
        };

        this.onFeatureSelected = function (listener) {
            svgElement.addEventListener(self.events.FEATURE_SELECTED_EVENT, listener);
            //$(document).on(self.events.FEATURE_SELECTED_EVENT, listener);
        };

        function addLevel(array) {
            var leveling = [];
            array.forEach(function (d) {
                if (leveling === []) {
                    leveling.push(d.y);
                    d.level = 0;
                } else {
                    var placed = false;
                    for (var k = 0; k < leveling.length; k++) {
                        if (d.x > leveling[k]) {
                            placed = true;
                            d.level = k;
                            leveling[k] = d.y;
                            break;
                        }
                    }
                    if (placed === false) {
                        leveling.push(d.y);
                        d.level = leveling.length - 1;
                    }
                }
            });
            return leveling.length;
        }

        function addLevelToBond(array) {
            var leveling = [];
            var newArray = [];
            array.forEach(function (d) {
                if (leveling === []) {
                    leveling.push(d[2].x);
                    d[1].y = 1;
                } else {
                    var placed = false;
                    for (var k = 0; k < leveling.length; k++) {
                        if (d[0].x > leveling[k]) {
                            placed = true;
                            d[1].y = k + 1;
                            leveling[k] = d[2].x;
                            break;
                        }
                    }
                    if (placed === false) {
                        leveling.push(d[2].x);
                        d[1].y = leveling.length;
                    }
                }
            });
            return leveling.length;
        }

        var lineBond = d3.svg.line()
            .interpolate("step-before")
            .x(function (d) {
                return scaling(d.x);
            })
            .y(function (d) {
                return -d.y * 10 + pathLevel;
            });
        var lineGen = d3.svg.line()
          .interpolate("cardinal")
          .x(function(d) {
            return scaling(d.x);
          })
          .y(function (d) {
                return lineYscale(-d.y) * 10 + pathLevel;
            });
        var lineYscale = d3.scale.linear()
            .domain([0,-30])
            .range([0,-20]);
        var line = d3.svg.line()
            .interpolate("linear")
            .x(function (d) {
                return scaling(d.x);
            })
            .y(function (d) {
                return d.y + 6;
            });

        //Create Axis
        var xAxis = d3.svg.axis()
            .scale(scaling)
            .tickFormat(d3.format("d"))
            .orient("bottom");

        function addXAxis(position) {
            svgContainer.append("g")
                .attr("class", "x axis Xaxis")
                .attr("transform", "translate(0," + (position + 20) + ")")
                .call(xAxis);
        }

        function updateXaxis(position) {
            svgContainer.selectAll(".Xaxis")
                .attr("transform", "translate(0," + (position + 20) + ")")
        }

        function updateSVGHeight(position) {
            svg.attr("height", position + 60 + "px")
        }

        var yAxisScale = d3.scale.ordinal()
            .domain([0, yData.length])
            .rangeRoundBands([0, 500], .1);
        var yAxis = d3.svg.axis()
            .scale(yAxisScale)
            .tickValues(yData) //specify an array here for values
            .tickFormat(function (d) {
                return d
            })
            .orient("left");

        function addYAxis() {
            yAxisSVG = svg.append("g")
                .attr("class", "pro axis")
                .attr("transform", "translate(0," + margin.top + ")");
            updateYaxis();
        }

        function updateYaxis() {

            yAxisSVGgroup = yAxisSVG
                .selectAll(".yaxis")
                .data(yData)
                .enter()
                .append("g");
            yAxisSVGgroup
                .append("polygon") // attach a polygon
                .attr("class", function (d) {
                    if (d.filter) return d.filter.split(" ").join("_") + "Arrow";
                    return "Arrow";
                })
                .style("stroke", "") // colour the line
                .style("fill", "#DFD5D3") // remove any fill colour
                .attr("points", function (d) {
                    return (margin.left - 105) + "," + (d.y - 3) + ", " + (margin.left - 105) + "," + (d.y + 12) + ", " + (margin.left - 15) + "," + (d.y + 12) + ", " + (margin.left - 7) + "," + (d.y + 4.5) + ", " + (margin.left - 15) + "," + (d.y -3); // x,y points
                });
            yAxisSVGgroup
                .append("text")
                .attr("class", "yaxis")
                .attr("text-anchor", "start")
                .attr("x", function () {
                    return margin.left - 102
                })
                .attr("y", function (d) {
                    return d.y + 8
                })
                .text(function (d) {
                    return d.title
                });
        }

        function forcePropagation(item) {
            item.on('mousedown', function () {
                brush_elm = svg.select(".brush").node();
                new_click_event = new Event('mousedown');
                new_click_event.pageX = d3.event.pageX;
                new_click_event.clientX = d3.event.clientX;
                new_click_event.pageY = d3.event.pageY;
                new_click_event.clientY = d3.event.clientY;
                brush_elm.dispatchEvent(new_click_event);
            });
        }

        /** export to new utils file  */
        var preComputing = {
            path: function (object) {
                object.data.sort(function (a, b) {
                    return a.x - b.x;
                });
                var level = addLevel(object.data);
                object.data = object.data.map(function (d) {
                    return [{
                        x: d.x,
                        y: 0,
                        id: d.id,
                        description: d.description,
                        color: d.color
                    }, {
                        x: d.y,
                        y: d.level + 1,
                        id: d.id
                    }, {
                        x: d.y,
                        y: 0,
                        id: d.id
                    }]
                })
                pathLevel = level * 10 + 5;
                object.height = level * 10 + 5;
            },
            line: function (object) {
                if (!object.height) object.height = 10;
                var shift = parseInt(object.height);
                object.data.sort(function (a, b) {
                    return a.x - b.x;
                });
                if (object.data[0].x !== 1) {
                    object.data.unshift({
                        x:1,
                        y:0
                    })
                }
                if (object.data[object.data.length -1] !== sequence.length -1){
                    object.data.push({
                        x:sequence.length-1,
                        y:0
                    })
                }
                var level = Math.max.apply(Math,object.data.map(function(o){return o.y;}))
                lineYscale.range([0, -(shift)]).domain([0, -(level)]);
                
                object.data = [object.data.map(function (d) {
                    return {
                        x: d.x,
                        y: d.y,
                        id: d.id
                    }
                })]
                pathLevel = shift * 10 + shift;
                object.shift = shift * 10 + shift;
            },
            multipleRect: function (object) {
                object.data.sort(function (a, b) {
                    return a.x - b.x;
                });
                level = addLevel(object.data);
                pathLevel = level * 10 + 5;
            }
        };

        var fillSVG = {
            typeIdentifier: function (object) {
                if (object.type === "rect") {
                    preComputing.multipleRect(object);
                    yData.push({
                        title: object.name,
                        y: Yposition,
                        filter: object.filter
                    });
                    fillSVG.rectangle(object, sequence, Yposition, level);
                } else if (object.type === "text") {
                    fillSVG.sequence(object.data, Yposition);
                    yData.push({
                        title: object.name,
                        y: Yposition,
                        filter: object.filter
                    });
                    scaling.range([5, width-5]);
                } else if (object.type === "unique") {
                    fillSVG.unique(object, sequence, Yposition);
                    yData.push({
                        title: object.name,
                        y: Yposition,
                        filter: object.filter
                    });
                } else if (object.type === "multipleRect") {
                    preComputing.multipleRect(object);
                    fillSVG.multipleRect(object, sequence, Yposition, level);
                    yData.push({
                        title: object.name,
                        y: Yposition,
                        filter: object.filter
                    });
                    Yposition += (level - 1) * 10;
                } else if (object.type === "path") {
                    preComputing.path(object);
                    fillSVG.path(object, sequence, Yposition);
                    Yposition += pathLevel;
                    yData.push({
                        title: object.name,
                        y: Yposition - 10,
                        filter: object.filter
                    });
                } else if (object.type === "line") {
                    preComputing.line(object);
                    fillSVG.line(object, sequence, Yposition);
                    Yposition += pathLevel;
                    yData.push({
                        title: object.name,
                        y: Yposition - 10,
                        filter: object.filter
                    });
                }
            },
            sequence: function (seq, position, start) {
                //Create group of sequence
                if (!start) var start = 0;
                svgContainer.append("g")
                    .attr("class", "seqGroup")
                    .selectAll(".AA")
                    .data(seq)
                    .enter()
                    .append("text")
                    .attr("clip-path", "url(#clip)")
                    .attr("class", "AA")
                    .attr("text-anchor", "middle")
                    .attr("x", function (d, i) {
                        return scaling.range([5, width-5])(i + 1 + start)
                    })
                    .attr("y", position)
                    .attr("font-size", "10px")
                    .attr("font-family", "monospace")
                    .text(function (d, i) {
                        return d
                    });
            },
            rectangle: function (object, sequence, position) {
                //var rectShift = 20;
                var rectHeight =(object.height) ? object.height : 12;
                
                var rectShift = rectHeight + rectHeight/3;
                var lineShift = rectHeight/2 - 6;
//                var lineShift = rectHeight/2 - 6;

                var rectsPro = svgContainer.append("g")
                    .attr("class", "rectangle")
                    .attr("clip-path", "url(#clip)")
                    .attr("transform", "translate(0," + position + ")");

                for (var i = 0; i < level; i++) {
                    rectsPro.append("path")
                        .attr("d", line([{
                            x: 1,
                            y: (i * rectShift + lineShift)
                        }, {
                            x: sequence.length,
                            y: (i * rectShift + lineShift)
                        }]))
                        .attr("class", function () {
                            return "line" + object.className
                        })
                        .style("z-index", "0")
                        .style("stroke", object.color)
                        .style("stroke-width", "1px");
                }

                var rectsProGroup = rectsPro.selectAll("." + object.className + "Group")
                    .data(object.data)
                    .enter()
                    .append("g")
                    .attr("class", object.className + "Group")
                    .attr("transform", function (d) {
                        return "translate(" + rectX(d) + ",0)"
                    });

                rectsProGroup
                    .append("rect")
                    .attr("class", "element " + object.className)
                    .attr("id", function (d) {
                        return "f" + d.id
                    })
                    .attr("y", function (d) {
                        return d.level * rectShift
                    })
                    .attr("width", rectWidth2)
                    .attr("height", rectHeight)
                    .style("fill", function(d) { return d.color || object.color })
                    .style("z-index", "13")
                    .call(d3.helper.tooltip(object));

                rectsProGroup
                    .append("text")
                    .attr("class", "element " + object.className + "Text")
                    .attr("y", function (d) {
                        return d.level * rectShift + rectHeight/2
                    })
                    .attr("dy", "0.35em")
                    .style("font-size", "10px")
                    .text(function (d) {
                        return d.description
                    })
                    .style("fill", "black")
                    .style("z-index", "15")
                    .style("visibility", function (d) {
                        if (d.description) {
                            return (scaling(d.y) - scaling(d.x)) > d.description.length * 8 ? "visible" : "hidden";
                        } else return "hidden";
                    })
                    .call(d3.helper.tooltip(object));


                //rectsPro.selectAll("." + object.className)
                //    .data(object.data)
                //    .enter()
                //    .append("rect")
                //    .attr("clip-path", "url(#clip)")
                //    .attr("class", "element "+object.className)
                //    .attr("id", function(d) { return "f"+d.id })
                //    .attr("x", X)
                //    .attr("width", rectWidth)
                //    .attr("height", 12)
                //    .style("fill", object.color)
                //    .style("z-index", "13")
                //    .call(d3.helper.tooltip(object));

                forcePropagation(rectsProGroup);
                var uniqueShift = level < 2 ? rectHeight-15 > 0 ? rectHeight-15 : 0 : 0;
                Yposition += (level - 1) * (rectShift + lineShift + 1) + uniqueShift;
            },
            unique: function (object, sequence, position) {
                var rectsPro = svgContainer.append("g")
                    .attr("class", "uniquePosition")
                    .attr("transform", "translate(0," + position + ")");

                rectsPro.append("path")
                    .attr("d", line([{
                        x: 1,
                        y: 0
                    }, {
                        x: sequence.length,
                        y: 0
                    }]))
                    .attr("class", function () {
                        return "line" + object.className
                    })
                    .style("z-index", "0")
                    .style("stroke", object.color)
                    .style("stroke-width", "1px");

                rectsPro.selectAll("." + object.className)
                    .data(object.data)
                    .enter()
                    .append("rect")
                    .attr("clip-path", "url(#clip)")
                    .attr("class", "element " + object.className)
                    .attr("id", function (d) {
                        return "f" + d.id
                    })
                    .attr("x", function (d) {
                        return scaling(d.x - 0.4)
                    })
                    .attr("width", function (d) {
                        if (scaling(d.x + 0.4) - scaling(d.x - 0.4) < 2) return 2;
                        else return scaling(d.x + 0.4) - scaling(d.x - 0.4);
                    })
                    .attr("height", 12)
                    .style("fill", function(d) {return d.color ||  object.color})
                    .style("z-index", "3")
                    .call(d3.helper.tooltip(object));

                forcePropagation(rectsPro);
            },
            path: function (object, sequence, position) {
                var pathsDB = svgContainer.append("g")
                    .attr("class", "pathing")
                    .attr("transform", "translate(0," + position + ")");

                pathsDB.append("path")
                    .attr("d", lineBond([{
                        x: 1,
                        y: 0
                    }, {
                        x: sequence.length,
                        y: 0
                    }]))
                    .style("z-index", "0")
                    .style("stroke", object.color)
                    .style("stroke-width", "1px");

                pathsDB.selectAll("." + object.className)
                    .data(object.data)
                    .enter()
                    .append("path")
                    .attr("clip-path", "url(#clip)")
                    .attr("class", "element " + object.className)
                    .attr("id", function (d) {
                        return "f" + d[0].id
                    })
                    .attr("d", lineBond)
                    .style("fill", "none")
                    .style("stroke", function(d) {return d[0].color || object.color})
                    .style("z-index", "3")
                    .style("stroke-width", "2px")
                    .call(d3.helper.tooltip(object));

                forcePropagation(pathsDB);
            },
            line: function (object, sequence, position) {
                var histog = svgContainer.append("g")
                    .attr("class", "lining")
                    .attr("transform", "translate(0," + position + ")");

                histog.append("path")
                    .attr("d", lineBond([{
                        x: 1,
                        y: 0
                    }, {
                        x: sequence.length,
                        y: 0
                    }]))
                    .style("z-index", "0")
                    .style("stroke", object.color)
                    .style("stroke-width", "1px");

                histog.selectAll("." + object.className)
                    .data(object.data)
                    .enter()
                    .append("path")
                    .attr("clip-path", "url(#clip)")
                    .attr("class", "element " + object.className)
                    .attr("d", lineGen)
//                    .style("fill", "none")
                    .style("stroke", object.color)
                    .style("z-index", "3")
                    .style("stroke-width", "2px")
//                    .style("shape-rendering", "crispEdges")
                    .call(d3.helper.tooltip(object));

                forcePropagation(histog);
            },
            multipleRect: function (object, sequence, position, level) {
                var rectHeight = 8;
                var rectShift = 10;
                var rects = svgContainer.append("g")
                    .attr("class", "multipleRects")
                    .attr("transform", "translate(0," + position + ")");

                for (var i = 0; i < level; i++) {
                    rects.append("path")
                        .attr("d", line([{
                            x: 1,
                            y: (i * rectShift - 2)
                        }, {
                            x: sequence.length,
                            y: (i * rectShift - 2)
                        }]))
                        .attr("class", function () {
                            return "line" + object.className
                        })
                        .style("z-index", "0")
                        .style("stroke", object.color)
                        .style("stroke-width", "1px");
                }

                rects.selectAll("." + object.className)
                    .data(object.data)
                    .enter()
                    .append("rect")
                    .attr("clip-path", "url(#clip)")
                    .attr("class", "element " + object.className)
                    .attr("id", function (d) {
                        return "f" + d.id
                    })
                    .attr("x", X)
                    .attr("y", function (d) {
                        return d.level * rectShift
                    })
                    .attr("width", rectWidth)
                    .attr("height", rectHeight)
                    .style("fill", function(d) { return d.color || object.color })
                    .style("z-index", "13")
                    .call(d3.helper.tooltip(object));

                forcePropagation(rects);
            }
        };

        this.showFilteredFeature = function(className, color){
            var featureSelected = yAxisSVG.selectAll("."+className+"Arrow");
            var minY = margin.left - 105;
            var maxY = margin.left - 7;

            var gradient = svg
                .append("linearGradient")
                .attr("y1", "0")
                .attr("y2", "0")
                .attr("x1", minY)
                .attr("x2", maxY)
                .attr("id", "gradient")
                .attr("spreadMethod", "pad")
                .attr("gradientUnits", "userSpaceOnUse");

            gradient
                .append("stop")
                .attr("offset", "0.3")
                .attr("stop-color", "#DFD5D3")
                .attr("stop-opacity", 1);


            var redgrad = gradient
                .append("stop")
                .attr("offset", "1")
                .attr("stop-opacity", 1)
                .attr("stop-color", "#DFD5D3");

            redgrad
                .attr("stop-color", color);


            var selection = yAxisSVG.selectAll("."+className+"Arrow")
                .style("fill", "url(#gradient)")
                .style("stroke", "")
                .attr("filter", "url(#dropshadow)");
            selection
                .attr("points", function (d) {
                    return (margin.left - 105) + "," + (d.y - 3) + ", " + (margin.left - 105) + "," + (d.y + 12) + ", " + (margin.left - 10) + "," + (d.y + 12) + ", " + (margin.left - 2) + "," + (d.y + 4.5) + ", " + (margin.left - 10) + "," + (d.y -3); // x,y points
                });
        };
        this.hideFilteredFeature = function(className){
            yAxisSVG.selectAll("."+className+"Arrow")
                .style("fill", "rgba(95,46,38,0.2)")
                .attr("filter", "")
                .attr("points", function (d) {
                    return (margin.left - 105) + "," + (d.y - 3) + ", " + (margin.left - 105) + "," + (d.y + 12) + ", " + (margin.left - 15) + "," + (d.y + 12) + ", " + (margin.left - 7) + "," + (d.y + 4.5) + ", " + (margin.left - 15) + "," + (d.y -3); // x,y points
                });
        };

        var transition = {
            rectangle: function (object) {
                svgContainer.selectAll("." + object.className + "Group")
                    .data(object.data)
                    .attr("transform", function (d) {
                        return "translate(" + rectX(d) + ",0)"
                    });

                svgContainer.selectAll("." + object.className)
                    .attr("width", rectWidth2);
                svgContainer.selectAll("." + object.className + "Text")
                    .style("visibility", function (d) {
                        if (d.description) {
                            return (scaling(d.y) - scaling(d.x)) > d.description.length * 8 ? "visible" : "hidden";
                        } else return "hidden";
                    });
            },
            multiRec: function (object) {
                svgContainer.selectAll("." + object.className)
                    .data(object.data)
                    //.transition()
                    //.duration(500)
                    .attr("x", function (d) {
                        return scaling(d.x)
                    })
                    .attr("width", function (d) {
                        return scaling(d.y) - scaling(d.x)
                    });
            },
            unique: function (object) {
                svgContainer.selectAll("." + object.className)
                    .data(object.data)
                    //.transition()
                    //.duration(500)
                    .attr("x", function (d) {
                        return scaling(d.x - 0.4)
                    })
                    .attr("width", function (d) {
                        if (scaling(d.x + 0.4) - scaling(d.x - 0.4) < 2) return 2;
                        else return scaling(d.x + 0.4) - scaling(d.x - 0.4);
                    });
            },
            path: function (object) {
                svgContainer.selectAll("." + object.className)
                    .data(object.data)
                    //.transition()
                    //.duration(500)
                    .attr("d", lineBond.y(function (d) {
                        return -d.y * 10 + object.height;
                    }));
            },
            line: function (object) {
                svgContainer.selectAll("." + object.className)
                    .data(object.data)
                    //.transition()
                    //.duration(500)
                    .attr("d", lineGen.y(function (d) {
                        return lineYscale(-d.y) * 10 + object.shift;
                    }));
            },
            text: function (object, start) {
                svgContainer.selectAll("." + object.className)
                    .data(object.data)
                    //.transition()
                    //.duration(500)
                    .attr("x", function (d, i) {
                        return scaling(i + 1 + start)
                    });
            }
        };

        var brush = d3.svg.brush()
            .x(scaling)
            //.on("brush", brushmove)
            .on("brushend", brushend);

        function addBrush() {
            svgContainer.append("g")
                .attr("class", "brush")
                .call(brush)
                .selectAll("rect")
                .attr('height', Yposition + 50);
        }

        // Show peptide selected in brush
        //function brushmove() {
        //    var extent = brush.extent();
        //    rectsPep2.classed("selected", function (d) {
        //        is_brushed = extent[0] <= d.x && d.x <= extent[1] && extent[0] <= d.y && d.y <= extent[1];
        //        return is_brushed;
        //    });
        //}

        function brushend() {
            d3.select(div).selectAll('div.selectedRect').remove();
            if (featureSelected !== {}) {
                d3.select(featureSelected.id).style("fill", featureSelected.originalColor);
                featureSelected = {};
            }
            // Check if brush is big enough before zooming
            var extent = brush.extent();
            var extentLength = Math.abs(extent[0] - extent[1]);

            if (extent[0] < extent[1]) var start = parseInt(extent[0] - 1),
                end = parseInt(extent[1] + 1);
            else var start = parseInt(extent[1] + 1),
                end = parseInt(extent[0] - 1);

            var seq = displaySequence(extentLength);
            if (!brush.empty() && extentLength > zoomMax) {
                var zoomScale = (sequence.length / extentLength).toFixed(1);
                $(div + " .zoomUnit").text(zoomScale.toString());

                if (SVGOptions.showSequence && seq && svgContainer.selectAll(".AA").empty()) {
                    seqShift = start;
                    fillSVG.sequence(sequence.substring(start, end), 20, seqShift);
                }

                //modify scale
                scaling.domain(extent);
                scalingPosition.range(extent);


                transition_data(features, seqShift);
                reset_axis();

                //rectsPep2.classed("selected", false);
                d3.select(div).selectAll(".brush").call(brush.clear());
            } else {
                d3.select(div).selectAll(".brush").call(brush.clear());
                //resetAll();
            }
        }

        // If brush is too small, reset view as origin
        function resetAll() {

            //reset scale

            $(".zoomUnit").text("1");
            scaling.domain([1, sequence.length]);
            scalingPosition.range([1, sequence.length]);
            var seq = displaySequence(sequence.length);

            if (seq === false && !svgContainer.selectAll(".AA").empty()) svgContainer.selectAll(".seqGroup").remove();

            transition_data(features, 0);
            reset_axis();
        }

        function transition_data(features, start) {
            features.forEach(function (o) {
                if (o.type === "rect") {
                    transition.rectangle(o);
                } else if (o.type === "multipleRect") {
                    transition.multiRec(o);
                } else if (o.type === "unique") {
                    transition.unique(o);
                } else if (o.type === "path") {
                    transition.path(o);
                } else if (o.type === "line") {
                    transition.line(o);
                } else if (o.type === "text") {
                    transition.text(o, start);
                }
            });
        }

        /** export to new axis file? */
        function reset_axis() {
            svgContainer
                .transition().duration(500)
                .select(".x.axis")
                .call(xAxis);
        }

        function addVerticalLine() {
            var vertical = d3.select(".chart")
                .append("div")
                .attr("class", "Vline")
                .style("position", "absolute")
                .style("z-index", "19")
                .style("width", "1px")
                .style("height", (Yposition + 50) + "px")
                .style("top", "30px")
                // .style("left", "0px")
                .style("background", "#000");

            d3.select(".chart")
                .on("mousemove.Vline", function () {
                    mousex = d3.mouse(this)[0] - 2;
                    vertical.style("left", mousex + "px")
                });
            //.on("click", function(){
            //    mousex = d3.mouse(this);
            //    mousex = mousex[0] + 5;
            //    vertical.style("left", mousex + "px")});
        }

        this.addRectSelection = function (svgId) {
            var featSelection = d3.select(svgId);
            var elemSelected = featSelection.data();
            var xTemp;
            var yTemp;
            var xRect;
            var widthRect;
            var svgWidth = d3.select(".background").attr("width");
            d3.select('body').selectAll('div.selectedRect').remove();

            var objectSelected = {type:featSelection[0][0].tagName, color:featSelection.style("fill")};
            colorSelectedFeat(svgId, objectSelected);

            // Append tooltip
            var selectedRect = d3.select(div)
                .append('div')
                .attr('class', 'selectedRect');

            if (elemSelected[0].length === 3) {
                xTemp = elemSelected[0][0].x;
                yTemp = elemSelected[0][1].x;
            } else if (elemSelected[0].x === elemSelected[0].y) {
                xTemp = elemSelected[0].x - 0.5;
                yTemp = elemSelected[0].y + 0.5;
            } else {
                xTemp = elemSelected[0].x;
                yTemp = elemSelected[0].y;
            }
            if (scaling(xTemp) < 0) {
                xRect = margin.left;
                widthRect = (scaling(yTemp));
            } else if (scaling(yTemp) > svgWidth) {
                xRect = scaling(xTemp) + margin.left;
                widthRect = svgWidth - scaling(xTemp);
            } else {
                xRect = scaling(xTemp) + margin.left;
                widthRect = (scaling(yTemp) - scaling(xTemp));
            }
            selectedRect.style({
                left: xRect + 'px',
                top: 60 + 'px',
                'background-color': 'rgba(0, 0, 0, 0.2)',
                width: widthRect + 'px',
                height: (Yposition + 50) + 'px',
                position: 'absolute',
                'z-index': -1,
                'box-shadow': '0 1px 2px 0 #656565'
            });
        };

        function initSVG(div, options) {

            if (typeof options === 'undefined') {
                var options = {
                    'showAxis': false,
                    'showSequence': false,
                    'brushActive': false,
                    'verticalLine': false,
                    'toolbar': false,
                    'bubbleHelp': false,
                    'zoomMax': 50
                }
            }

            if (!$.fn.popover) {
                options.bubbleHelp = false;
                console.warn("The bubble help requires tooltip and popover bootrstrap js libraries. The feature viewer will continue to work, but without the info bubble");
            }

            // Create SVG
            if (options.zoomMax) {
                zoomMax = options.zoomMax;
            }

            if (options.toolbar === true) {
                //console.log($(div + " .svgHeader").length);
                var headerOptions = $(div + " .svgHeader").length ? d3.select(div + " .svgHeader") : d3.select(div).append("div").attr("class", "svgHeader");
                //console.log(headerOptions);

                if (!$(div + ' .header-zoom').length) {
                    var headerZoom = headerOptions
                        .append("div")
                        .attr("class", "panel panel-default header-zoom")
                        .style("display", "inline-block")
                        .style("width", "150px")
                        .style("margin", "20px 0px 0px")
                        .style("padding", "0px");
                    headerZoom
                        .append("div")
                        .attr("class", "panel-heading")
                        .style("padding", "0px 15px")
                        .style("border-right", "1px solid #DDD")
                        .style("display", "inline-block")
                        .style("width", "80px")
                        .append("h5")
                        .style("padding", "0px")
                        .style("height", "10px")
                        .style("color", "#777")
                        .text("ZOOM");
                    headerZoom
                        .append("div")
                        .attr("class", "panel-body")
                        .style("display", "inline-block")
                        .style("padding", "0px")
                        .append("h5")
                        .style("padding-left", "15px")
                        .style("height", "10px")
                        .text("x ")
                        .append("span")
                        .attr("class", "zoomUnit")
                        .text("1");
                }
                if (!$(div + ' .header-position').length) {
                    var headerPosition = headerOptions
                        .append("div")
                        .attr("class", "panel panel-default header-position")
                        .style("display", "inline-block")
                        .style("width", "175px")
                        .style("margin", "20px 20px 0px")
                        .style("padding", "0px");
                    headerPosition
                        .append("div")
                        .attr("class", "panel-heading")
                        .style("padding", "0px 15px")
                        .style("border-right", "1px solid #DDD")
                        .style("display", "inline-block")
                        .append("h5")
                        .style("padding", "0px")
                        .style("height", "10px")
                        .style("color", "#777")
                        .text("POSITION");
                    headerPosition
                        .append("div")
                        .attr("class", "panel-body")
                        .style("display", "inline-block")
                        .style("padding", "0px")
                        .append("h5")
                        .style("padding-left", "15px")
                        .style("height", "10px")
                        .append("span")
                        .attr("id", "zoomPosition")
                        .text("0");
                }
                if (options.bubbleHelp === true) {
                    if (!$(div + ' .header-help').length) {
                        var helpContent = "<div><strong>To zoom in :</strong> Left click to select area of interest</div>" +
                            "<div><strong>To zoom out :</strong> Right click to reset the scale</div>" +
                            "<div><strong>Zoom max  :</strong> Limited to <strong>" + zoomMax.toString() + " units</strong></div>";
                        var headerHelp = headerOptions
                            .append("div")
                            .attr("class", "pull-right")
                            .style("display", "inline-block")
                            .style("margin", "25px 35px 0px 0px")
                            .style("padding", "0px");
                        var buttonHelp = headerHelp
                            .append("a")
                            .attr("type", "button")
                            .attr("class", "header-help")
                            .attr("data-toggle", "popover")
                            .attr("data-placement", "left")
                            .attr("title", "Help")
                            .attr("data-content", helpContent)
                            .style("font-size", "1.5em");
                        buttonHelp
                            .append("span")
                            .attr("class", "label label-as-badge")
                            .text("?");
                        $(function () {
                            $('[data-toggle="popover"]').popover({html: true});
                        })
                    }
                }
            }
            svg = d3.select(div).append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .style("z-index", "2")
                .on("contextmenu", function (d, i) {
                    d3.event.preventDefault();
                    resetAll();
                    // react on right-clicking
                });
            svgElement = el.getElementsByTagName("svg")[0];


            svgContainer = svg
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //Create Clip-Path
            var defs = svgContainer.append("defs");

            defs.append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width)
                .attr("height", height);

            var filter = defs.append("filter")
                .attr("id", "dropshadow")
                .attr("height", "200%");

            filter.append("feGaussianBlur")
                .attr("in", "SourceAlpha")
                .attr("stdDeviation", 3)
                .attr("result", "blur");
            filter.append("feOffset")
                .attr("in", "blur")
                .attr("dx", -2)
                .attr("dy", 2)
                .attr("result", "offsetBlur");

            var feMerge = filter.append("feMerge");

            feMerge.append("feMergeNode")
                .attr("in", "offsetBlur");
            feMerge.append("feMergeNode")
                .attr("in", "SourceGraphic");

            svgContainer.on('mousemove', function () {
                var absoluteMousePos = d3.mouse(d3.select(".background").node());
                $(div + " #zoomPosition").text(Math.round(scalingPosition(absoluteMousePos[0])));
            });

            if (options.showSequence) {
                SVGOptions.showSequence = true;
                if (displaySequence(sequence.length)) {
                    fillSVG.sequence(sequence, Yposition);
                }
                features.push({
                    data: sequence,
                    name: "Sequence",
                    className: "AA",
                    color: "black",
                    type: "text"
                });
                yData.push({
                    title: "Sequence",
                    y: Yposition - 8
                });
            }
            if (options.showAxis) addXAxis(Yposition);
            addYAxis();
            if (options.brushActive) {
                SVGOptions.brushActive = true;
                zoom = true;
                addBrush();
            }
            if (options.verticalLine) {
                SVGOptions.verticalLine = true;
                addVerticalLine();
            }

            updateSVGHeight(Yposition);

        }

        initSVG(div, options);

        this.addFeature = function (object) {
            Yposition += 20;
            features.push(object);
            fillSVG.typeIdentifier(object);
            updateYaxis();
            updateXaxis(Yposition);
            updateSVGHeight(Yposition);
            if (SVGOptions.brushActive) {
                svgContainer.selectAll(".brush rect")
                    .attr('height', Yposition + 50);
            }
            if (SVGOptions.verticalLine) d3.selectAll(".Vline").style("height", (Yposition + 50) + "px");


        }

    }

    return FeatureViewer;
})();
if ( typeof module === "object" && typeof module.exports === "object" ) {
    module.exports = FeatureViewer;
}