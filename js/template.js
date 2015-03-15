(function() {
  vis = {}
  var chart, svg, height, width;

    vis.init = function(params) {
      if (!params) {params = {};}

      chart = d3.select(params.chart || "#chart");
      height = params.dotSpacing * params.listLength + (2 * params.svgPadding) || 500;
      width = params.width || 960;
      chart.selectAll("svg").data([{height: height, width: width}]).enter().append("svg");
      
      svg = chart.select("svg");
      svg
       .attr("height", function(d) {return d.height;})
       .attr("width", function(d) {return d.width;})
      
      vis.loaddata(params);
    }


    vis.loaddata = function(params) {
      if (!params) {params = {};}

      d3.json((params.data || "data/data.json") + (params.refresh ? ("#" + Math.random()) : ""), function(error, json) {
        vis.json = json;
        vis.draw(params);
      })
    }


    vis.draw = function(params) {
      // code for drawing stuff ...

      //Set scale for data display      
      var xScale = d3.scale.linear()
              .domain([0, d3.max(vis.json, function(d){return d.Gap;})])
              .range([params.width - params.svgPadding, params.labelPadding + params.svgPadding]); 

      //Define the x-axis
      var xAxis = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks(5)
              .tickSize("-" + params.height, 0, 0)

      //Draw the data points  
      var circles = svg.selectAll("circle")
              .data(vis.json)
              .enter()
              .append("circle")
              .attr("cx", function(d){
                return xScale(d.Gap);
                })
              .attr("cy", function(d, i){
                return (i * params.dotSpacing) + (params.dotSpacing/2);
                })
              .attr("r", params.dotRadius + "px")
              .attr("fill", "#2B8CBE")
              .on("mouseover", function(){
                  d3.select(this)
                    .attr("fill", "orange") 
                    .attr("r", "5px")
                    .append("title")
                    .text(function(d){return "+" + d.GapID})
              })
              .on("mouseout", function(){
                  d3.select(this)
                    .attr("fill", "#2B8CBE")  
                    .attr("r", params.dotRadius + "px")
              });

      //Label the data  points
      var labels = svg.selectAll("text")
              .data(vis.json)
              .enter()
              .append("text")
              .text(function(d){
                if(d.Rank == 1){  
                  return d.Rank + ". " + d.name + ": " + d.Time;
                  }
                else {
                  return d.Rank + ". " + d.name + ": +" + d.Gap;
                  }
                })
              .attr("x", function(d){
                return xScale(d.Gap) - 7;
                })
              .attr("y", function(d, i){
                return (i * params.dotSpacing) + ((params.dotSpacing/2) + (params.dotRadius/2));
                })
              .attr("text-anchor", "end")
              .attr("font-family", "sans-serif")
              .attr("font-size", "10px");

      //Draw the X-axis
      var drawXAxis = svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0, " + (params.listLength * params.dotSpacing) + ")")
                .call(xAxis)
                .attr("text-anchor", "end")
                .attr("font-family", "sans-serif")
                .attr("font-size", "10px");
    }
})();