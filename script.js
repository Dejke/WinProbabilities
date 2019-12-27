
/*
    CONSTANTS
*/
let GRAPH_SIZE = { width: 1000, height: 550 };
let GRAPH_MARGIN = { top: 20, bot: 20, left: 0, right: 0 };
let GRAPH_TOTAL_SIZE = { width: GRAPH_SIZE.width + GRAPH_MARGIN.left + GRAPH_MARGIN.right, height: GRAPH_SIZE.height + GRAPH_MARGIN.top + GRAPH_MARGIN.bot };

let BAR_SIZE = { width: 1000, height: 60 };

let PREGEN_BOX_VALUES = [3, 5, 7];
/* 
    INITIALIZATION 
*/
var boX = 5;

let data = { };
data[boX] = calculateProbailities(boX);

var graphSvg = d3.select("#graphContainer")
    .append("svg")
    .attr("width", GRAPH_TOTAL_SIZE.width)
    .attr("height", GRAPH_TOTAL_SIZE.height);
var graph = graphSvg
    .append("g")
    .attr("transform", "translate(" + GRAPH_MARGIN.left + ", " + GRAPH_MARGIN.top + ")");
var caret = graphSvg
    .append("line")
    .attr("transform", `translate(0, ${GRAPH_MARGIN.top})`)
    .attr("x1", GRAPH_SIZE.width / 2)
    .attr("x2", GRAPH_SIZE.width / 2) //initial values for x pos
    .attr("y1", 0)
    .attr("y2", GRAPH_SIZE.height)
    .attr("stroke-dasharray", "8")
    .style("stroke", "#dddddd")
    .style("stroke-width", "2px")
    .style("opacity" ,"0.7");

var areaFunction = d3.area()
    .x((d, i) => (i))
    .y((d) => GRAPH_SIZE.height)
    .y1((d) => ((1 - d) * GRAPH_SIZE.height));

var graphContainer = document.getElementById("graphContainer");


var winrateDisplay = document.getElementById("winrateDisplay");
var bar = d3.select("#barContainer")
    .append("svg")
    .attr("width", BAR_SIZE.width)
    .attr("height", BAR_SIZE.height);

document.body.onmousemove = updateSlider;

/*
    START
*/
drawGraph();
console.log("here now");
generateData();


async function generateData() {
    PREGEN_BOX_VALUES.forEach((n) => { data[n] = calculateProbailities(n) });
}
//For each index, goes through the probability of each event and adds it to the array at that index.
//Percentages are cumulative
function calculateProbailities(boX) {
    var output = Array.from({ length: 2 * boX }, () => Array.from({ length: 1000 }, () => 0));
    for (var i = 0; i < 1000; i++) {
        recursiveProbabiltities(0, 0, boX, i, 1, output);

    }
    return output;
}


function recursiveProbabiltities(wins, losses, boX, i, prob, output) {
    var winrate = i / GRAPH_SIZE.width;

    if (wins < boX && losses < boX) {
        recursiveProbabiltities(wins + 1, losses, boX, i, prob * winrate, output);
        recursiveProbabiltities(wins, losses + 1, boX, i, prob * (1 - winrate), output);
    }
    else {
        indexOfOutcome = outcomeIndex(wins, losses);


        for (var j = 0; j <= indexOfOutcome; j++) {
            output[j][i] += prob;
        }

    }
}

function outcomeIndex(wins, losses) {
    //In display order, top down. Ex: 30 31 32 23 13 03
    if (wins > losses) {
        //boX = wins;
        return losses;
    }
    else {
        return 2 * losses - wins - 1;
    }
}


function drawGraph() {
    graph.selectAll("path").remove();

    console.log(data[boX]);
    graph.selectAll("path")
        .data(data[boX])
        .enter()
        .append("path")
        .attr("d", areaFunction)
        .attr("fill", createColor);
}

function createColor(d, i) { //d unused, matches inputs from .attr
    index = 2 * boX - i - 1; //Really stupid way to invert the colors
    var lightness;
    var hue;
    var saturation;
    if (index < boX) {
        lightness = 25 + index * 15 / boX;
        hue = "110";
        saturation = "40";
    }
    else {
        lightness = 25 + (2 * boX - index) * 15 / boX;
        hue = "360";
        saturation = "55";
    }

    var color = `hsl(${hue},${saturation}%, ${lightness}%)`;
    return color;

}



function updateSlider(e) { 
    
    /*
        Update caret
    */
    var graphOffset = document.getElementById("graphContainer").getBoundingClientRect().x;
   
    var percent = Math.max(0, Math.min(1, 1- ( (e.screenX - graphOffset)/GRAPH_TOTAL_SIZE.width)));;

    var currentWR = percent * 100;
    winrateDisplay.innerText = `chance to win a game = ${currentWR.toFixed(1)}%`;

    var caretPos = Math.min(GRAPH_TOTAL_SIZE.width -2 , Math.max(1,(e.screenX - graphOffset)));
    caret
        .attr("x1", caretPos)
        .attr("x2", caretPos);


    /*
        Update bar visual
    */
    
    var index = Math.round(percent*1000);

    var barData = data[boX].map((arr) => arr[index]);
    console.log
    bar.selectAll("rect").remove();
    bar
        .selectAll("rect")
        .data(barData)
        .enter()
        .append("rect")
        .attr("width", (val) => val*BAR_SIZE.width)
        .attr("x", val => (1-val)*BAR_SIZE.width)
        .attr("height", BAR_SIZE.height)
        .attr("fill", (val, index) => createColor(val,2*boX-index-1));
    //todo: change rect to group, attach text thing to each rect.
    //Also make sure it always updates when it has to, extract update function
    
}
