(
  function() {
    racingDots = function(params){ 
    //Select the correct page element and then set up the svg canvas for us to draw on
    var height = params.dotSpacing * params.listLength + (2 * params.svgPadding);
    var width = params.width;
    
    var svg = d3.select(params.chart)
            .append("svg")
            .attr("height", height)
            .attr("width", width)
    
    //Load the data
    d3.json((params.data) + (params.refresh ? ("#" + Math.random()) : ""), function(error, json) {
      if (error){console.log(error);}
      else {var chartData = json;}
    
      //Draw the chart

      //Set scale for data display      
      var xScale = d3.scale.linear()
              .domain([0, d3.max(chartData, function(d){return d.Gap;})])
              .range([params.width - params.svgPadding, params.labelPadding + params.svgPadding]); 

      //Define the x-axis
      var xAxis = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks(5)
              .tickSize("-" + params.height, 0, 0)

      //Draw the data points  
      var circles = svg.selectAll("circle")
              .data(chartData)
              .enter()
              .append("circle")
              .attr("cx", d3.max(chartData, function(d){return d.Gap;}))
              .transition().attr("cx", function(d){return xScale(d.Gap);}).duration(1000).delay(500)
              .attr("cy", function(d, i){return (i * params.dotSpacing) + (params.dotSpacing/2);})
              .attr("r", params.dotRadius + "px")
              .attr("fill", "#2B8CBE")

      //Label the data  points
      var labels = svg.selectAll("text")
              .data(chartData)
              .enter()
              .append("text")
              .text(function(d){
                if(d.Rank == 1){return d.Rank + ". " + d.name + ": " + d.Time;}
                else {return d.Rank + ". " + d.name + ": +" + d.Gap;}
                })
              .attr("x", function(d){return xScale(d.Gap) - 7;})
              .attr("y", function(d, i){return (i * params.dotSpacing) + ((params.dotSpacing/2) + (params.dotRadius/2));})
              .attr("text-anchor", "end")
              .attr("font-family", "sans-serif")
              .attr("font-size", "10px")
              .attr("opacity", 0).transition().attr("opacity", 1).duration(400).delay(1300);

      //Draw the X-axis
      var drawXAxis = svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0, " + (params.listLength * params.dotSpacing) + ")")
                .call(xAxis)
                .attr("text-anchor", "end")
                .attr("font-family", "sans-serif")
                .attr("font-size", "10px");
      })
    }
  }
)();