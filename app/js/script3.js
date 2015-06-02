($(function () {

    var Nextprot = window.Nextprot;
    var nx = new Nextprot.Client();
    var entry = nx.getEntryName();
    var isoName = entry + "-1";
    //var cpt = 0;
    var ft;
    var seqView;
    var currentSeq;
    var isoforms;
    var features={};
    var selectedRect;

    function nxIsoformChoice(isoforms) {
        if ($("#nx-isoformChoice").length > 0) {
            var datas = {
                "isoforms": (function () {
                    var listIsoforms = {
                        "visible": [],
                        "more": []
                    };
                    isoforms.sort(function (a, b) {
                        return parseInt(a.uniqueName.split("-")[1]) - parseInt(b.uniqueName.split("-")[1])
                    }).forEach(function (o, index) {
                        if (index <= 3) listIsoforms.visible.push(o);
                        else listIsoforms.more.push(o);
                    });
                    return listIsoforms;
                }())
            };
            var template = HBtemplates['isoformChoice.tmpl'];
            var results = template(datas);
            $("#nx-isoformChoice").append(results);
            /////////// EventListener to change isoform
            getInfoForIsoform.isoform();

            $("#nx-isoformChoice li:first-child").addClass("active");
        }
    }

    var CreateData = {
        classic: function (data,property, category) {
            //features[property] = {};
            data.forEach(function (o) {
                    for (var name in o.targetingIsoformsMap) {
                        if (o.targetingIsoformsMap.hasOwnProperty(name)) {
                            var start = o.targetingIsoformsMap[name].firstPosition,
                                end = o.targetingIsoformsMap[name].lastPosition,
                                evidence = o.evidences.map(function(d) {return d.assignedBy}).filter(function(item, pos, self) {
                                    return self.indexOf(item) == pos;});
                            if (!features[name]) features[name] = {};
                            if (!features[name][property]) features[name][property] = [];
                            features[name][property].push({
                                x: start,
                                y: end,
                                length: end-start+1,
                                id:start.toString()+"_"+end.toString(),
                                category: category,
                                description: o.description,
                                cvCode: o.cvTermAccessionCode,
                                evidence: evidence,
                                evidenceLength: evidence.length
                            });
                        }
                    }
                }
            );
        },
        antibody: function (data,property,category) {
            //features[property] = {};
            data.forEach(function (o) {
                    for (var name in o.isoformSpecificity) {
                        if (o.isoformSpecificity.hasOwnProperty(name)) {
                            var start = o.isoformSpecificity[name].positions[0].first,
                                end = o.isoformSpecificity[name].positions[0].second,
                                evidence = [o.assignedBy];

                            if (!features[name]) features[name] = {};
                            if (!features[name][property]) features[name][property] = [];

                            features[name][property].push({
                                x: start,
                                y: end,
                                length: end - start,
                                id:start.toString()+"_"+end.toString(),
                                category: category,
                                description: o.xrefs[0].accession,
                                cvCode: o.xrefs[0].resolvedUrl,
                                evidence: evidence,
                                evidenceLength: evidence.length
                            });
                        }
                    }
                }
            );
        },
        dsB: function (data,property) {
            //features[property] = {};
            data.forEach(function (o) {
                    for (var name in o.targetingIsoformsMap) {
                        if (o.targetingIsoformsMap.hasOwnProperty(name)) {
                            var start = o.targetingIsoformsMap[name].firstPosition,
                                end = o.targetingIsoformsMap[name].lastPosition;
                            if (!features[name]) features[name] = {};
                            if (!features[name][property]) features[name][property] = [];
                            features[name][property].push([
                                {
                                    x: start,
                                    y: 0
                                }, {
                                    x: end,
                                    y: 0
                                }, {
                                    x: end,
                                    y: 0
                                }
                            ]);
                        }
                    }
                }
            );
        },
        peptide: function (data,property,category) {

            //features[property] = {};
            data.forEach(function (o) {
                    for (var name in o.isoformSpecificity) {
                        if (o.isoformSpecificity.hasOwnProperty(name)) {
                            var start = o.isoformSpecificity[name].positions[0].first,
                                end = o.isoformSpecificity[name].positions[0].second,
                                evidence = o.evidences.map(function(d) {return d.assignedBy}).filter(function(item, pos, self) {
                                    return self.indexOf(item) == pos;}),
                                pepName = "";
                            var seq="";
                            for (ev in o.evidences) if (o.evidences[ev].databaseName === "PeptideAtlas" || o.evidences[ev].databaseName === "SRMAtlas") pepName = o.evidences[ev].accession;
                            if (category === "SRM peptide") isoforms.forEach(function (d) {if (d.uniqueName === name) seq= d.sequence.substring(start-1,end)});
                            if (!features[name]) features[name] = {};
                            if (!features[name][property]) features[name][property] = [];
                            features[name][property].push({
                                x: start,
                                y: end,
                                length: end - start,
                                id:start.toString()+"_"+end.toString(),
                                category: category,
                                description: o.evidences[0].accession,
                                evidence: evidence,
                                sequence: seq,
                                pepDescription: pepName,
                                evidenceLength: evidence.length
                            });
                        }
                    }
                }
            );
        }
    };

    var getInfoForIsoform = {
        isoform: function () {
            $(".isoformNames").click(getInfoForIsoform.reload);
            $("#moreIsoforms a").click(function () {
                var parentThis = $(this).text();
                console.log(parentThis);
                $("#extendIsoformChoice").text(parentThis);
            });
        },
        reload: function (event) {
            var isoID = $(this).text();
            console.log(isoID);
            $(".chart").html("");
            createSVG(isoforms,isoID);
            addFeatures(isoID);
            fillTable(isoID);
            featureSelection();
            inverseSelection();
        }
    };

    function createSVG(sequences,isoName) {
        sequences.forEach(function (o) {
            if (o.uniqueName === isoName) {
                currentSeq = o.sequence;
                ft = new FeatureViewer(currentSeq, ".chart", {
                    showAxis: true,
                    showSequence: true,
                    brushActive: true,
                    verticalLine: false
                });
                seqView = new Sequence(currentSeq);
                seqView.render('#seqViewer', {
                    'showLineNumbers': true,
                    'wrapAminoAcids': true,
                    'charsPerLine': 60
                });

            }
        });
    }

    function addFeatures(isoName) {
        console.log(features);

        if (features[isoName].proPep && features[isoName].proPep.length != 0) {
            ft.addFeature({
                data: features[isoName].proPep,
                name: "Propeptide",
                className: "pro",
                color: "#B3B3B3",
                type: "rect"
            });
        }

        if (features[isoName].matures && features[isoName].matures.length != 0) {
            ft.addFeature({
                data: features[isoName].matures,
                name: "Mature protein",
                className: "mat",
                color: "#B3B3C2",
                type: "rect"
            });
        }

        if (features[isoName].signalPep && features[isoName].signalPep.length != 0) {
            ft.addFeature({
                data: features[isoName].signalPep,
                name: "Signal peptide",
                className: "sign",
                color: "#B3B3E1",
                type: "rect"
            });
        }
        if (features[isoName].disBonds && features[isoName].disBonds.length != 0) {
            ft.addFeature({
                data: features[isoName].disBonds,
                name: "Disulfide bond",
                className: "dsB",
                color: "#B3B3E1",
                type: "path"
            });
        }
        if (features[isoName].antibody && features[isoName].antibody.length != 0) {
            ft.addFeature({
                data: features[isoName].antibody,
                name: "Antibody",
                className: "anti",
                color: "#B3C2F0",
                type: "rect"
            });
        }
        if (features[isoName].initMeth && features[isoName].initMeth.length != 0) {
            ft.addFeature({
                data: features[isoName].initMeth,
                name: "Initiator meth",
                className: "initMeth",
                color: "#B3B3D1",
                type: "unique"
            });
        }
        if (features[isoName].modifRes && features[isoName].modifRes.length != 0) {
            ft.addFeature({
                data: features[isoName].modifRes,
                name: "Modified residue",
                className: "modifRes",
                color: "#B3C2B3",
                type: "unique"
            });
        }
        if (features[isoName].crossLink && features[isoName].crossLink.length != 0) {
            ft.addFeature({
                data: features[isoName].crossLink,
                name: "Cross-link",
                className: "crossLink",
                color: "#B3C2C2",
                type: "unique"
            });
        }
        if (features[isoName].glycoSite && features[isoName].glycoSite.length != 0) {
            ft.addFeature({
                data: features[isoName].glycoSite,
                name: "Glycosylation",
                className: "glycoSite",
                color: "#B3C2D1",
                type: "unique"
            });
        }
        if (features[isoName].peptides && features[isoName].peptides.length != 0) {
            ft.addFeature({
                data: features[isoName].peptides,
                name: "Peptide",
                className: "pep",
                color: "#B3E1D1",
                type: "multipleRect"
            });
        }
        if (features[isoName].srmPeptides && features[isoName].srmPeptides.length != 0) {
            ft.addFeature({
                data: features[isoName].srmPeptides,
                name: "Srm Peptide",
                className: "srmPep",
                color: "#B3E1F0",
                type: "multipleRect"
            });
        }
    }

    function fillTable(isoName) {
        if ($("#featuresTable").length > 0) {
            var number = 0;
            for (feat in features[isoName]) number += features[isoName][feat].length;
            var datas = {
                features: features[isoName],
                featuresLength: number
            };
            //datas.PeptideLength = datas.Peptides.length;

            var template = HBtemplates['featureTable.tmpl'];
            var results = template(datas);
            $("#featuresTable").html(results);
        }
    }

    function featureSelection() {
        $(".featPosition").click(function() {
            $(".tableHighlight").removeClass("tableHighlight");
            $(this).parent().parent().addClass("tableHighlight");
            var position = $(this).text().split(" - ").map(Number);
            if (position.length === 1) position.push(position[0]);
            var svgId = "#" + "f" + position[0] + "_" + position[1];

            console.log(svgId);
            position[0]-=1;
            seqView.selection(position[0],position[1],"#C50063");
            ft.selection(svgId);

            var ElementTop = $("#stringSelected").position().top-200;
            var scrollPosition = $("#scroller").scrollTop();
            var scrollingLength = ElementTop + scrollPosition;
            $("#scroller").animate({scrollTop: scrollingLength}, 1000);

        })
    }
    function inverseSelection() {
        $(".element").click(function (d) {
            var featSelected = this.id.slice(1);
            var featPos = featSelected.split("_").map(Number);
            featPos[0]-=1;
            seqView.selection(featPos[0],featPos[1],"#C50063");
            $(".tableHighlight").removeClass("tableHighlight");
            $("#"+featSelected).addClass("tableHighlight");
            var ElementTop = $("#"+featSelected).position().top-60;
            var scrollPosition = $("#featTableScroller").scrollTop();
            var scrollingLength = ElementTop + scrollPosition;
            $("#featTableScroller").animate({scrollTop: scrollingLength}, 1000);
            var ElementTop2 = $("#stringSelected").position().top-200;
            var scrollPosition2 = $("#scroller").scrollTop();
            var scrollingLength2 = ElementTop2 + scrollPosition2;
            $("#scroller").animate({scrollTop: scrollingLength2}, 1000);
        })
    }

    $(function () {
        var startTime = new Date().getTime();
        Promise.all([nx.getProteinSequence(entry), nx.getProPeptide(entry), nx.getMatureProtein(entry), nx.getSignalPeptide(entry), nx.getDisulfideBond(entry),
            nx.getAntibody(entry), nx.getInitMeth(entry), nx.getModifResidue(entry), nx.getCrossLink(entry), nx.getGlycoSite(entry), nx.getPeptide(entry),
            nx.getSrmPeptide(entry)]).then(function (oneData) {
            var endTime2 = new Date().getTime();
            var time2 = endTime2 - startTime;
            console.log('Execution time: ' + time2);
            isoforms=oneData[0];
            nxIsoformChoice(oneData[0]);

            Handlebars.registerHelper('link_to', function (type, options) {
                if (type === "Peptide"){
                    var url = "https://db.systemsbiology.net/sbeams/cgi/PeptideAtlas/GetPeptide?searchWithinThis=Peptide+Name&searchForThis=" + this.pepDescription + ";organism_name=Human";
                    return "<a href='" + url + "'>" + this.pepDescription + "</a>";
                }
                else if (type ==="SRM peptide"){
                    var url = "https://db.systemsbiology.net/sbeams/cgi/PeptideAtlas/GetTransitions?organism_name=Human;default_search=1;peptide_sequence_constraint=" + this.sequence + ";apply_action=QUERY";
                    return "<a href='" + url + "'>" + this.pepDescription + "</a>";
                }
                else if (type === "Antibody") {
                    var url = this.cvCode;
                    return "<a href='" + url + "'>" + this.description + "</a>";
                }
                else if (this.cvCode) {
                    var url = "http://www.nextprot.org/db/term/" + this.cvCode;
                    return "<a href='" + url + "'>" + this.description + "</a>";
                }
                else return this.description;
            });
            Handlebars.registerHelper('position', function (length, options) {
                if (length === 1) return this.x;
                else return this.x + " - " + this.y;
            });
            CreateData.classic(oneData[1],"proPep", "Propeptide");
            CreateData.classic(oneData[2],"matures", "Mature protein");
            CreateData.classic(oneData[3],"signalPep", "Signal peptide");
            CreateData.classic(oneData[4],"disBonds", "Disulfide bond");
            CreateData.antibody(oneData[5],"antibody","Antibody");
            CreateData.classic(oneData[6],"initMeth","Initiator meth");
            CreateData.classic(oneData[7],"modifRes", "Modified residue");
            CreateData.classic(oneData[8],"crossLink", "Cross-link");
            CreateData.classic(oneData[9],"glycoSite","Glycosylation");
            CreateData.peptide(oneData[10],"peptides","Peptide");
            CreateData.peptide(oneData[11],"srmPeptides","SRM peptide");

            createSVG(isoforms,isoName);
            addFeatures(isoName);
            fillTable(isoName);
            featureSelection();
            inverseSelection();

            var endTime = new Date().getTime();
            var time = endTime - startTime;
            console.log('Execution time: ' + time);
        }).catch(function (err) {
            // catch any error that happened so far
            console.log("Argh, broken: " + err.message);
            console.log("Error at line : " + err.stack);
        });
    });
    //d3.helper2 = {};
    //
    //d3.helper2.engrenage = function(object){
    //    var engrenageDiv;
    //    var bodyNode2 = d3.select('body').node();
    //
    //    function engrenage(selection){
    //        console.log("fonction working");
    //
    //        selection.on('click', function(pD, pI){
    //            console.log("click working");
    //            // Append tooltip
    //            engrenageDiv = d3.select('body')
    //                           .append('div')
    //                           .attr('class', 'selection2');
    //            var absoluteMousePos = d3.mouse(bodyNode);
    //            engrenageDiv.style({
    //                left: (pD.x)+'px',
    //                top: 0+'px',
    //                'background-color': 'rgba(0, 0, 0, 0.8)',
    //                width: pD.length,
    //                height: '500px',
    //                'max-height': '43px',
    //                position: 'absolute',
    //                'z-index': 1000,
    //                'box-shadow': '0 1px 2px 0 #656565'
    //            });
    //        });
    //
    //    }
    //    return engrenageDiv;
    //}
        // .call(d3.helper.engrenage());




    // $(function () {
    //     var startTime = new Date().getTime();
    //     [nx.getProteinSequence(entry), nx.getProPeptide(entry), nx.getMatureProtein(entry), nx.getSignalPeptide(entry), nx.getDisulfideBond(entry),
    //      nx.getAntibody(entry), nx.getInitMeth(entry), nx.getModifResidue(entry), nx.getCrossLink(entry), nx.getGlycoSite(entry), nx.getPeptide(entry),
    //       nx.getSrmPeptide(entry)].reduce(function (array, dataPromise) {
    //         return array.then(function () {
    //             return dataPromise;
    //         }).then(function (oneData) {
    //             cpt += 1;
    //             switch (cpt) {
    //                 case 1:
    //                     oneData.forEach(function (o) {
    //                         if (o.uniqueName === isoName) {
    //                             ft = new FeatureViewer(o.sequence);
    //                         }
    //                     });
    //                     ft.create(".chart", {
    //                         showAxis: true,
    //                         showSequence: true,
    //                         brushActive: true,
    //                         verticalLine:true
    //                     });
    //                     break;

    //                 case 2:
    //                     var proPep = CreateData.classic(oneData);
    //                     if (proPep.length != 0) {
    //                         ft.addFeature({
    //                             data: proPep,
    //                             name: "Propeptide",
    //                             className: "pro",
    //                             color: "#B3B3B3",
    //                             type: "rect"
    //                         });
    //                     }
    //                     break;

    //                 case 3:
    //                     var matures = CreateData.classic(oneData);
    //                     if (matures.length != 0) {
    //                         ft.addFeature({
    //                             data: matures,
    //                             name: "Mature protein",
    //                             className: "mat",
    //                             color: "#B3B3C2",
    //                             type: "rect"
    //                         });
    //                     }
    //                     break;
    //                 case 4 :
    //                     var signalPep = CreateData.classic(oneData);
    //                     if (signalPep.length != 0) {
    //                         ft.addFeature({
    //                             data: signalPep,
    //                             name: "Signal peptide",
    //                             className: "sign",
    //                             color: "#B3B3E1",
    //                             type: "rect"
    //                         });
    //                     }

    //                     break;

    //                 case 5 :
    //                     var disBonds = CreateData.classic(oneData);
    //                     if (disBonds.length != 0) {
    //                         ft.addFeature({
    //                             data: disBonds,
    //                             name: "Disulfide bond",
    //                             className: "dsB",
    //                             color: "#B3B3E1",
    //                             type: "path"
    //                         });
    //                     }
    //                     break;

    //                 case 6 :
    //                     var antibody = CreateData.antibody(oneData);
    //                     if (antibody.length != 0) {
    //                         ft.addFeature({
    //                             data: antibody,
    //                             name: "Antibody",
    //                             className: "anti",
    //                             color: "#B3C2F0",
    //                             type: "rect"
    //                         });
    //                     }
    //                     break;

    //                 case 7 :
    //                     var initMeth = CreateData.classic(oneData);
    //                     if (initMeth.length != 0) {
    //                         ft.addFeature({
    //                             data: initMeth,
    //                             name: "Initiator meth",
    //                             className: "initMeth",
    //                             color: "#B3B3D1",
    //                             type: "unique"
    //                         });
    //                     }
    //                     break;
    //                 case 8 :
    //                     var modifRes = CreateData.classic(oneData);
    //                     if (modifRes.length != 0) {
    //                         ft.addFeature({
    //                             data: modifRes,
    //                             name: "Modified residue",
    //                             className: "modifRes",
    //                             color: "#B3C2B3",
    //                             type: "unique"
    //                         });
    //                     }
    //                     break;
    //                 case 9 :
    //                     var crossLink = CreateData.classic(oneData);
    //                     if (crossLink.length != 0) {
    //                         ft.addFeature({
    //                             data: crossLink,
    //                             name: "Cross-link",
    //                             className: "crossLink",
    //                             color: "#B3C2C2",
    //                             type: "unique"
    //                         });
    //                     }
    //                     break;
    //                 case 10 :
    //                     var glycoSite = CreateData.classic(oneData);
    //                     if (glycoSite.length != 0) {
    //                         ft.addFeature({
    //                             data: glycoSite,
    //                             name: "Glycosylation",
    //                             className: "glycoSite",
    //                             color: "#B3C2D1",
    //                             type: "unique"
    //                         });
    //                     }
    //                     break;

    //                 case 11 :
    //                     var peptides = CreateData.peptide(oneData);
    //                     if (peptides.length != 0) {
    //                         ft.addFeature({
    //                             data: peptides,
    //                             name: "Peptide",
    //                             className: "pep",
    //                             color: "#B3E1D1",
    //                             type: "multipleRect"
    //                         });
    //                     }
    //                     break;

    //                 case 12 :
    //                     var srmPeptides = CreateData.peptide(oneData);
    //                     if (srmPeptides.length != 0) {
    //                         ft.addFeature({
    //                             data: srmPeptides,
    //                             name: "Srm Peptide",
    //                             className: "srmPep",
    //                             color: "#B3E1F0",
    //                             type: "multipleRect"
    //                         });
    //                     }
    //                     var endTime = new Date().getTime();
    //                     var time = endTime - startTime;
    //                     console.log('Execution time: ' + time);
    //                     break;
    //             }
    //         });
    //     }, Promise.resolve())
    //         .then(function () {
    //             console.log("All done");
    //         })
    //         .catch(function (err) {
    //             // catch any error that happened along the way
    //             console.log("Argh, broken: " + err.message);
    //             console.log("Error at line : " + err.stack);
    //         })
    // });


    // var ft = new FeatureViewer("FDSJKLFJDSFKLJDFHADJKLFHDSJKLFHDAFJKLDHFJKLDASFHDJKLFHDSAJKLFHDAKLFJDHSAFKLDLSNCDJKLFENFIUPERWDJKPCNVDFPIEHFDCFJDKOWFPDJWFKLXSJFDW9FIPUAENDCXAMSFNDUAFIDJFDLKSAFJDSAKFLJDSADJFDW9FIPUAENDCXAMSFNDAAAAAAAAAAAFJDSAKFL");
    // ft.create(".chart", {
    // 	showAxis: true,
    // 	showSequence: true,
    // 	brushActive: true,
    // 	verticalLine:true
    // });
    // ft.addFeature({
    //     data: [{x:20,y:32},{x:46,y:100},{x:123,y:167}],
    //     name: "test feature 0",
    //     className: "test0",
    //     color: "#0F8292",
    //     type: "rect"
    // })
    // ft.addFeature({
    //     data: [{x:32,y:47},{x:58,y:72}],
    //     name: "test feature 1",
    //     className: "test1",
    //     color: "#066B78",
    //     type: "rect"
    // })
    // ft.addFeature({
    //     data: [{x:52,y:52},{x:92,y:92}],
    //     name: "test feature 2",
    //     className: "test2",
    //     color: "#007800",
    //     type: "unique"
    // })
    // ft.addFeature({
    //     data: [{x:130,y:184},{x:40,y:142},{x:80,y:110}],
    //     name: "test feature 3",
    //     className: "test3",
    //     color: "#780C43",
    //     type: "path"
    // })
    // ft.addFeature({
    //     data: [{x:120,y:154},{x:22,y:163},{x:90,y:108},{x:10,y:25},{x:193,y:210},{x:78,y:85},{x:96,y:143},{x:14,y:65},{x:56,y:167}],
    //     name: "test feature 4",
    //     className: "test4",
    //     color: "#C50063",
    //     type: "multipleRect"
    // })
    // ft.addFeature({
    //     data: [{x:5,y:12},{x:41,y:87},{x:133,y:172}],
    //     name: "test feature 5",
    //     className: "test5",
    //     color: "#CFB915",
    //     type: "rect"
    // })

}));