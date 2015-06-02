/////////////

function Sequence(sequence) {
    var sequence = sequence;
    var seqInit = "";
    var lineJump = 0;
    var divID;

    function renderHtml(divId, options){
        divID=divId;
        if (typeof options === 'undefined') {
            var options = {
                'showLineNumbers': true,
                'wrapAminoAcids': true,
                'charsPerLine': 30
            }
        }
        if(typeof options.charsPerLine === 'undefined') {
            lineJump=30;
        }
        else lineJump = options.charsPerLine;

        var sources = "<div id=\"sequenceHeader\" style=\"border-bottom: 1px solid #E7EAEC;padding-bottom:5px;margin-bottom: 15px;\">" +
            "<div style=\"display:inline-block;\">" +
            "<span class=\"badge\" style=\"border-radius:70%;border: 2px solid black;color:#C50063;padding:8px 5px;background-color:white;margin-right:10px;vertical-align:middle;\">{{sequenceLength}}</span>" +
            "</div><h4 style=\"display:inline-block;vertical-align:middle;\">Protein Sequence</h4>" +
            "</div>" +
            "<div style=\"margin-top: 5px;\">" +
            "<div id=\"scroller\" style=\"max-height:400px;overflow:auto;white-space: nowrap;padding-right:20px;margin-right:10px;s\">" +
            "<div id=\"charNumbers\" style=\"font-family: monospace;font-size: 13px;display:inline-block;text-align:right; padding-right:5px; border-right:1px solid LightGray;\"></div>" +
            "<div id=\"fastaSeq\" display-option=\"" + lineJump + "\" style=\"font-family: monospace;font-size: 13px;display:inline-block;padding:5px;\">{{{sequence}}}</div></div>" +
            "<div id=\"coverageLegend\" style=\"margin-top: 10px;margin-left:15px;\"></div>" +
            "</div>";

        var template = Handlebars.compile(sources);
        var html = template({
            "sequence": sequence,
            "sequenceLength": sequence.length
        });
        $(divId).html(html);
        //console.log($(divId + #fastaSeq').text());

        if(!(options.wrapAminoAcids === false)) {
            sequenceLayout(divId +" #fastaSeq");
        }
        else $(divId +" #scroller").css("overflow-x","auto");
        if(!(options.showLineNumbers === false))
            lineNumbers(divId +" #fastaSeq",divId +" #charNumbers");

        seqInit = $(divId +" #fastaSeq").html();
    }

    function highlighting (start,end, color, options){
        var positions = [start,end];
        var hlSeq = seqInit;
        positions[0]=positions[0]+~~(positions[0]/10)+4*(~~(positions[0]/lineJump));
        positions[1]=positions[1]+~~(positions[1]/10)+4*(~~(positions[1]/lineJump));
        var highlightColor=color;
        hlSeq = hlSeq.substring(0,positions[0])+
        "<span id='stringSelected' style=\"background:" + color + ";color:white;\">" +
        hlSeq.substring(positions[0],positions[1]) +
        "</span>" +
        hlSeq.substring(positions[1],hlSeq.length);
        $(divID +" #fastaSeq").html(hlSeq);
    }
    function addLegend (hashLegend) {
        for (var i=0;i<hashLegend.length;i++) {
            if (hashLegend[i].underscore === true) {
                $(divID +" #coverageLegend").append("<div style=\"display:inline-block;background:" + hashLegend[i].color+";width:20px;height:20px;vertical-align:middle;margin:0px 5px 0px 10px;border-radius:50%; border: 1px solid grey;text-align:center; line-height:0.8;\">_</div><p style=\"display:inline-block;font-weight:bold;font-size:11px;font-style:italic;margin:0;padding-top:3px;vertical-align:top;\">" + hashLegend[i].name + "</p></div>");
                console.log("duh !");
            }
            else {
                $(divID +" #coverageLegend").append("<div style=\"display:inline-block;background:" + hashLegend[i].color+";width:20px;height:20px;vertical-align:middle;margin:0px 5px 0px 10px;border-radius:50%;\"></div><p style=\"display:inline-block;font-weight:bold;font-size:11px;font-style:italic;margin:0;padding-top:3px;vertical-align:top;\">" + hashLegend[i].name + "</p>");
                console.log("dah !");
            }
        }
    }
    function coverage(HashAA,start,end,highlightColor){
        HashAA.sort(function (a, b) {
            return a.start - b.start;
        });
        var jTranslation = function (i) {
            var j=i+~~(i/10)+4*(~~(i/lineJump));
            return j;
        };
        var timestart = new Date().getTime();
        if (!start) var start=0;
        if (!end) var end=0;
        if (!highlightColor) var highlightColor="#FFE5A3";
        var source = "";
        var pre ="";
        for (var i=0;i<HashAA.length;i++){
            if (HashAA[i].underscore) {
                pre = "<span style=\"text-decoration:underline;color:" + HashAA[i].color + ";\">";
                source+= pre;
            }
            else {
                pre = "<span style=\"color:" + HashAA[i].color + ";\">";
                source+= pre;
            }
            if (end) {
                if (start >= HashAA[i].start && start < HashAA[i].end && end >= HashAA[i].start && end < HashAA[i].end) {

                    source += seqInit.substring(jTranslation(HashAA[i].start), jTranslation(start)) + "<span id=\"peptideHighlighted\" style=\"background:" + highlightColor + ";\">" + seqInit.substring(jTranslation(start), jTranslation(end + 1));

                    source += "</span>" + seqInit.substring(jTranslation(end + 1), jTranslation(HashAA[i].end)) + "</span>";
                }
                else if (start >= HashAA[i].start && start < HashAA[i].end) {
                    source += seqInit.substring(jTranslation(HashAA[i].start), jTranslation(start)) + "</span><span id=\"peptideHighlighted\" style=\"background:" + highlightColor + ";\">"+ pre + seqInit.substring(jTranslation(start), jTranslation(HashAA[i].end)) + "</span>";
                }
                else if (end >= HashAA[i].start && end < HashAA[i].end) {
                    source += seqInit.substring(jTranslation(HashAA[i].start), jTranslation(end + 1)) + "</span></span>"+ pre + seqInit.substring(jTranslation(end+1), jTranslation(HashAA[i].end)) + "</span>";
                }
                else {
                    source += seqInit.substring(jTranslation(HashAA[i].start), jTranslation(HashAA[i].end)) + "</span>";
                }
            }
            else {
                source += seqInit.substring(jTranslation(HashAA[i].start), jTranslation(HashAA[i].end)) + "</span>";
            }
        }
        $(divID +" #fastaSeq").html(source);
        var timeend = new Date().getTime();

        console.log('Time to execute all: ', (timeend - timestart));
    }

    var lineNumbers = function(textAreaID,lineNumberID){
        var textContent = $(textAreaID).html().split("<br>");
        var NBC = parseInt($(textAreaID).attr("display-option"));
        var newTextContent = [];
        var charPerLine = 0;
        for (var i=0; i < textContent.length;i++){
            newTextContent.push((charPerLine + 1) + ("<br>"));
            charPerLine += NBC;
        }
        $(lineNumberID).html(newTextContent.join(""));

    };

    var sequenceLayout = function(textAreaID){

        var newLines = parseInt($(textAreaID).attr("display-option"));
        newLines = (newLines+(newLines/10)).toString();
        var seqFormat = $(textAreaID).html();
        seqFormat = seqFormat.toString().match(/.{1,10}/g).join(' ').match(new RegExp('.{1,'+newLines+'}','g')).join('<br>');

        $(textAreaID).html(seqFormat);
    };


    return {
        render:renderHtml,
        selection:highlighting,
        coverage:coverage,
        addLegend: addLegend
    }
}