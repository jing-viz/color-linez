
//Width and height
var kCellCount = 9;
var kNewChessCount = 3;
var kMinMatchBallCount = 5;

var board_data = [];
var game_data;

var svg_sel;
var board_sel;
var cells_sel;
var chesses_sel;

var hud_sel;
var score_sel;

var kEmptyColorId = -1;
// svg.on('click', function() {
//     var coords = d3.mouse(this);
//     // console.log(coords);
// });

// https://en.wikipedia.org/wiki/Web_colors#HTML_color_names
var chess_colors = [
    "blueviolet",
    "deeppink",
    "limegreen",
    "steelblue",
    "rosybrown",
    "fuchsia",
    "orange",
];

function random_index(max_value) {
    var random = d3.randomUniform(0, max_value);
    var impl = function() {
        var id = parseInt(random());
        return id;
    }
    return impl();
}

function random_color_id() {
    return random_index(chess_colors.length);
}

function random_board_id() {
    return random_index(board_data.length);
}

function set_chess_color(selection) {
    selection
        .transition()
        .duration(500)
        .attr("stroke", function(d, i) {
            if (i === selected_board_id) {
                return "black";
            }
            else {
                return "none";
            }
        })
        .attr("fill", function(d, i) {
            if (d.color_id === kEmptyColorId) {
                return "lightgrey";
            }
            return chess_colors[d.color_id];
            })
        ;
}

function place_new_chesses() {
    for (var i=0;i<kNewChessCount;i++) {
       if (game_data.chess_count >= kCellCount * kCellCount) {
            // TODO: enter game_over state
            // new_game();
            // svg_sel.remove();
            // svg_sel = undefined;
            // resize();
            return;
        }

        var board_id = random_board_id();
        while (board_data[board_id].color_id !== kEmptyColorId) {
            board_id = random_board_id();
        }
        game_data.chess_count ++;
        board_data[board_id].color_id = random_color_id();
        game_data.graph.nodes[board_id].weight = 0;
    }
}

function check_connected_chesses(board_id) {
    function check_dir(dx, dy) {
        var center_color_id = board_data[board_id].color_id;
        var result = [];
        var x = board_data[board_id].i+dx, y = board_data[board_id].j+dy;
        while (x >=0 && x < kCellCount && y >= 0 && y < kCellCount) {
            var idx = y * kCellCount + x;
            // console.log("x" + x + "y" + y);
            if (board_data[idx].color_id != center_color_id) break;
            result.push(idx);
            
            x+=dx;
            y+=dy;
        }
        return result;
    }
    var results = [
        // [0, +/-1]
        check_dir(0, +1).concat(check_dir(0, -1)),
        // [+/-1, 0]
        check_dir(+1, 0).concat(check_dir(-1, 0)),
        // [+/-1, +/-1]
        check_dir(+1, +1).concat(check_dir(-1, -1)),
        // [+/-1, -/+1]
        check_dir(+1, -1).concat(check_dir(-1, +1)),
    ];

    results.forEach(function (result) {
        // console.log(result);
        if (result.length >= 4) {
            board_data[board_id].color_id = kEmptyColorId;
            for (var id of result) {
                board_data[id].color_id = kEmptyColorId;
                game_data.score++;
            }
        }
    });
}

var selected_board_id = -1;
function update_board_data(board_id) {
    if (selected_board_id === -1) {
        if (board_data[board_id].color_id !== kEmptyColorId) {
            selected_board_id = board_id;
        }
    }
    else {
        if (board_data[board_id].color_id === kEmptyColorId) {
            // move #selected_board_id -> empty slot #board_id
            var start = game_data.graph.nodes[selected_board_id];
            var end = game_data.graph.nodes[board_id];
            var result = astar.search(game_data.graph, start, end);
            console.log(result);

            if (result.length > 0) {
                // can we move the chess there?
                board_data[board_id].color_id = board_data[selected_board_id].color_id;
                board_data[selected_board_id].color_id = kEmptyColorId;

                game_data.graph.nodes[selected_board_id].weight = 1;
                game_data.graph.nodes[board_id].weight = 0;

                check_connected_chesses(board_id);            
                place_new_chesses();

                selected_board_id = -1;
            }
        }
        else {
            // selecting #board_id as #selected_board_id
            selected_board_id = board_id;
        }
    }

    chesses_sel.call(set_chess_color);        
}

function new_game() {
    for (var i=0;i<kCellCount;i++) {
        for (var j=0;j<kCellCount;j++) {
            board_data[j*kCellCount + i] = {
                board_id: j * kCellCount + i,
                color_id: kEmptyColorId,
            }
        }
    }

    game_data = {
        "score": 0,
        "chess_count": 0,
        "graph" : new Graph([
            [1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1,1,1],
        ]),
    };
}

function resize() {
    console.log("resize");
    var width = window.innerWidth, height = window.innerHeight;
    var widthMajor = true;
    var svgMajorSize = height;
    if (width < height) {
        widthMajor = false;
        svgMajorSize = width;
    }
    var kMarginSize = svgMajorSize * 0.05;
    var kBoardSize = svgMajorSize - kMarginSize * 2;
    var kCellSize = kBoardSize / kCellCount;
    var kBallRadius = kCellSize * 0.5 * 0.9;

    if (svg_sel === undefined) {
        svg_sel = d3.select("body")
                .append("svg")
                ;

        new_game();

        board_sel = svg_sel.append("g")
                        .attr("id", "board");
        hud_sel = svg_sel.append("g")
                        .attr("id", "hud");
        score_sel = hud_sel.selectAll("text")
                .data(game_data)
                .enter().append("text")
                .text(function(d) { return d.score; })
                ;

        // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/rect
        cells_sel = board_sel.selectAll("rect")
            .data(board_data)
            .enter().append("rect")
                .attr("fill", "lightgrey")
                .attr("stroke", "grey")
            ;

        // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/circle
        chesses_sel = board_sel.selectAll("circle")
            .data(board_data)
            .enter().append("circle")
                .attr("stroke", "none")
                .attr("stroke-width", 2)
                .call(set_chess_color)
                .on('click', function(d){
                    // http://jsfiddle.net/GordyD/0o71rhug/1/
                    var ele = d3.select(this);
                    // console.log(this);
                    // console.log(ele);
                    // console.log(ele.datum());
                    var board_id = ele.datum().board_id;
                    update_board_data(board_id);
                    // ele.call(set_chess_color);
                });            
    }

    for (var i=0;i<kCellCount;i++) {
        for (var j=0;j<kCellCount;j++) {
            board_data[j*kCellCount + i].cx = (i + 0.5) * kCellSize;
            board_data[j*kCellCount + i].cy = (j + 0.5) * kCellSize;
            board_data[j*kCellCount + i].x = i * kCellSize;
            board_data[j*kCellCount + i].y = j * kCellSize;
            board_data[j*kCellCount + i].i = i;
            board_data[j*kCellCount + i].j = j;
        }
    }

    svg_sel
        .transition()
        .attr("width", svgMajorSize)
        .attr("height", svgMajorSize)  
        ;

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Text_formatting
    board_sel
        .transition()
        .attr("transform", "translate(" + kMarginSize + ", " +  kMarginSize + ")")
        ;

    if (widthMajor) {
        hud_sel
            .transition()
            .attr("transform", "translate(" + (kMarginSize * 2 + kBoardSize) + ", " +  kMarginSize + ")")
            ;
    }
    else {
        hud_sel
            .transition()
            .attr("transform", "translate(" + kMarginSize + ", " + (kMarginSize * 2 + kBoardSize) + ")")
            ;        
    }

    cells_sel
        .transition()
        .attr("x", function(d, i) { return d.x; })
        .attr("y", function(d, i) { return d.y; })
        .attr("width", kCellSize)
        .attr("height", kCellSize)
        ;

    chesses_sel
        .transition()
        .attr("cx", function(d, i) { return d.cx; })
        .attr("cy", function(d, i) { return d.cy; })
        .attr("r", kBallRadius)
        ;

}

// http://stackoverflow.com/questions/11942500/how-to-make-force-layout-graph-in-d3-js-responsive-to-screen-browser-size
window.addEventListener('resize', resize); 
resize();
place_new_chesses();

