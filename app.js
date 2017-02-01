
//Width and height
var kCellCount = 9;
var kNewBallCount = 3;
var kMinMatchBallCount = 5;

var board = [];

//Create SVG element
var svg;
                // .attr("width", kBoardSize)
                // .attr("height", kBoardSize)
            // .append("rect")
            // .attr("width", kBoardSize)
            // .attr("height", kBoardSize)
            // .attr("stroke", "grey")
            ;
var canvas;
var cells;
var chesses;
// svg.on('click', function() {
//     var coords = d3.mouse(this);
//     // console.log(coords);
// });

function setSelectionFill(selection) {
    selection.transition()
             .duration(500)
             .attr("fill", function(d, i) { return d.color; })
}

function resize() {
    console.log("resize");
    var width = window.innerWidth, height = window.innerHeight;

    var svgSize = Math.min(width, height);
    var kMarginSize = svgSize * 0.03;
    var kBoardSize = svgSize - kMarginSize * 2;
    var kCellSize = kBoardSize / kCellCount;
    var kBallRadius = kCellSize * 0.9;

    if (svg === undefined) {
        svg = d3.select("body")
                .append("svg");
        for (var i=0;i<kCellCount;i++) {
            for (var j=0;j<kCellCount;j++) {
                board[j*kCellCount + i] = {
                    idx: j * kCellCount + i,
                    color: "lightgrey",
                }
            }
        }

        canvas = svg.append("g");

        // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect
        cells = canvas.selectAll("rect")
            .data(board)
            .enter()
            .append("rect")
                .attr("fill", "lightgrey")
                .attr("stroke", "grey")
            ;

        // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle
        chesses = canvas.selectAll("circle")
            .data(board)
            .enter()
            .append("circle")
                .attr("stroke", "none")
                .call(setSelectionFill)
                .on('click', function(d){
                    // http://jsfiddle.net/GordyD/0o71rhug/1/
                    var ele = d3.select(this);
                    // console.log(this);
                    // console.log(ele);
                    // console.log(ele.datum());
                    var idx = ele.datum().idx;
                    board[idx].color = "red";

                    ele.call(setSelectionFill);
                });            
    }

    for (var i=0;i<kCellCount;i++) {
        for (var j=0;j<kCellCount;j++) {
            board[j*kCellCount + i].cx = (i + 0.5) * kCellSize;
            board[j*kCellCount + i].cy = (j + 0.5) * kCellSize;
            board[j*kCellCount + i].x = i * kCellSize;
            board[j*kCellCount + i].y = j * kCellSize;
        }
    }

    svg
        .transition()
        .attr("width", svgSize)
        .attr("height", svgSize);

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Text_formatting
    canvas
        .transition()
        .attr("transform", "translate(" + kMarginSize + ", " +  kMarginSize + ")")
            ;

    cells
        .transition()
        .attr("x", function(d, i) { return d.x; })
        .attr("y", function(d, i) { return d.y; })
        .attr("width", kCellSize)
        .attr("height", kCellSize)
        ;

    chesses
        .transition()
        .attr("cx", function(d, i) { return d.cx; })
        .attr("cy", function(d, i) { return d.cy; })
        .attr("r", kBallRadius / 2)
        ;

}

// http://stackoverflow.com/questions/11942500/how-to-make-force-layout-graph-in-d3-js-responsive-to-screen-browser-size
window.addEventListener('resize', resize); 
resize();
