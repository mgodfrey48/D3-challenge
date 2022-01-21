// svg container
var svgHeight = 400;
var svgWidth = 600;

// margins
var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

// chart area minus margins
var chartHeight = svgHeight - margin.top - margin.bottom;
var chartWidth = svgWidth - margin.left - margin.right;

// create svg container
var svg = d3.select("#svg-area").append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

// shift everything over by the margins
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("assets/data/data.csv").then(function (publicHealthData) {

    // Step 1: Cast some variables as numbers
    // ==============================
    publicHealthData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
    });

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(publicHealthData, d => d.poverty) - 1, d3.max(publicHealthData, d => d.poverty) + 2])
        .range([0, chartWidth]);

    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(publicHealthData, d => d.healthcare) + 2])
        .range([chartHeight, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    let radius = 10

    var circlesGroup = chartGroup.selectAll("circle")
        .data(publicHealthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", `${radius}`)
        .attr("fill", "#89bdd3")
        .attr("opacity", ".4");


    var initialsGroup = chartGroup.selectAll("aText")
        .data(publicHealthData)
        .enter()
        .append("text")
        .attr("dx", d => xLinearScale(d.poverty))
        .attr("dy", d => yLinearScale(d.healthcare)+3)
        .attr("style", "color:white")
        .attr("text-anchor", "middle")
        .attr("font-size", `${radius}px`)
        .text(d => d.abbr);


    // Step 6: Initialize tool tip
    // ==============================
    // var toolTip = d3.tip()
    //   .attr("class", "tooltip")
    //   .offset([80, -60])
    //   .html(function(d) {
    //     return (`${d.rockband}<br>Hair length: ${d.hair_length}<br>Hits: ${d.num_hits}`);
    //   });

    // Step 7: Create tooltip in the chart
    // ==============================
    // chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    // circlesGroup.on("click", function(data) {
    //   toolTip.show(data, this);
    // })
    // onmouseout event
    //   .on("mouseout", function(data, index) {
    //     toolTip.hide(data);
    //   });

    // Create axes labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("% With Healthcare");

    chartGroup.append("text")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top - 1})`)
        .attr("class", "axisText")
        .text("% In Poverty");
}).catch(function (error) {
    console.log(error);
});
