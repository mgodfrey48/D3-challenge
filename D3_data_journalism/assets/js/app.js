// define dimensions of svg container
var svgHeight = 600;
var svgWidth = 800;

// define chart margins
var margin = {
    top: 75,
    right: 75,
    bottom: 75,
    left: 75
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


//////// Functions for updating axes, markers, and tooltips /////////
// function used for initializing and updating x-scale var upon click on axis label
function xScale(publicHealthData, chosenXAxis) {
    // create scale
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(publicHealthData, d => d[chosenXAxis]) - 1, d3.max(publicHealthData, d => d[chosenXAxis]) + 2])
        .range([0, chartWidth]);

    return xLinearScale;
}

// function used for initializing and updating y-scale var upon click on axis label
function yScale(publicHealthData, chosenYAxis) {

    // create scale
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(publicHealthData, d => d[chosenYAxis]) - 1, d3.max(publicHealthData, d => d[chosenYAxis]) + 2])
        .range([chartHeight, 0]);

    return yLinearScale;
}

// function used for updating xAxis upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating yAxis upon click on axis label
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating initials between poverty and age
function renderXInitials(initialsGroup, newXScale, chosenXAxis) {

    initialsGroup.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]))

    return initialsGroup;
}

// function used for updating initials between healthcare and smoking
function renderYInitials(initialsGroup, newYScale, chosenYAxis) {

    initialsGroup.transition()
        .duration(1000)
        .attr("dy", d => newYScale(d[chosenYAxis]) + 3)

    return initialsGroup;
}

// function used for updating circles between poverty and age
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))

    return circlesGroup;
}
// function used for updating circles between healthcare and smoking
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]))

    return circlesGroup;
}

// function to update tooltips on axes changes
function updateToolTip(chosenXAxis, chosenYAxis, initialsGroup) {
    // update x value
    var xLabel;
    if (chosenXAxis === "poverty") {
        xLabel = `% In Poverty:`;
    }
    else {
        xLabel = `Age:`;
    }
    // update y value
    var yLabel;
    if (chosenYAxis === "healthcare") {
        yLabel = `% With Healthcare:`;
    }
    else {
        yLabel = `% Who Smoke:`;
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
        });

    initialsGroup.call(toolTip);

    initialsGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return initialsGroup;
}
//////// End of functions section ////////


//////// Import data and create the graph ////////
d3.csv("assets/data/data.csv").then(function (publicHealthData) {

    // Cast numeric variables as numbers
    publicHealthData.forEach(function (data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.smokes = +data.smokes;
    });

    // Set initial axes parameters
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";

    // Call initial scale functions for the axes
    var xLinearScale = xScale(publicHealthData, chosenXAxis);
    var yLinearScale = yScale(publicHealthData, chosenYAxis);

    // Create and append axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // Initialize the circles and state initials
    let radius = 10
    var circlesGroup = chartGroup.selectAll("circle")
        .data(publicHealthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", `${radius}`)
        .attr("fill", "#89bdd3")
        .attr("opacity", ".4");

    var initialsGroup = chartGroup.selectAll("aText")
        .data(publicHealthData)
        .enter()
        .append("text")
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d[chosenYAxis]) + 3)
        .attr("style", "color:white")
        .attr("text-anchor", "middle")
        .attr("font-size", `${radius}px`)
        .text(d => d.abbr);

    // Add tooltips to the graph markers
    initialsGroup = updateToolTip(chosenXAxis, chosenYAxis, initialsGroup);
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // Create x axis label group
    var xLabelGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2.5}, ${chartHeight})`);

    var povertyAxis = xLabelGroup.append("text")
        .attr("class", "poverty")
        .attr("dy", "2.5em")
        .attr("id", "poverty")
        .classed("active", true)
        .text("% In Poverty");

    var ageAxis = xLabelGroup.append("text")
        .attr("class", "age")
        .attr("dy", "3.5em")
        .attr("id", "age")
        .classed("inactive", true)
        .text("Age");

    // x axis labels event listener
    xLabelGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("id");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // updates x scale for new data
                xLinearScale = xScale(publicHealthData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxis(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates initials with new x values
                initialsGroup = renderXInitials(initialsGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                initialsGroup = updateToolTip(chosenXAxis, chosenYAxis, initialsGroup);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyAxis
                        .classed("active", true)
                        .classed("inactive", false);
                    ageAxis
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyAxis
                        .classed("active", false)
                        .classed("inactive", true);
                    ageAxis
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

    // Create y axis label group
    var yLabelGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    var healthcareAxis = yLabelGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (chartHeight * .6))
        .attr("dy", "2.5em")
        .attr("id", "healthcare")
        .classed("active", true)
        .text("% With Healthcare");

    var smokeAxis = yLabelGroup.append("text")
        .attr("y", 0 - (margin.left))
        .attr("x", 0 - (chartHeight * .6))
        .attr("dy", "1.5em")
        .attr("id", "smokes")
        .classed("inactive", true)
        .text("% Who Smoke");

    // y axis labels event listener
    yLabelGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("id");
            if (value !== chosenYAxis) {

                // replaces chosenYAxis with value
                chosenYAxis = value;

                // updates x scale for new data
                yLinearScale = yScale(publicHealthData, chosenYAxis);

                // updates y axis with transition
                yAxis = renderYAxis(yLinearScale, yAxis);

                // updates circles with new y values
                circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

                // updates initials with new y values
                initialsGroup = renderYInitials(initialsGroup, yLinearScale, chosenYAxis);

                // updates tooltips with new info
                initialsGroup = updateToolTip(chosenXAxis, chosenYAxis, initialsGroup);
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenYAxis === "healthcare") {
                    healthcareAxis
                        .classed("active", true)
                        .classed("inactive", false);
                    smokeAxis
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthcareAxis
                        .classed("active", false)
                        .classed("inactive", true);
                    smokeAxis
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

}).catch(function (error) {
    console.log(error);
});
