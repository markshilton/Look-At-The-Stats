/*
This file includes the D3.js code to draw the 'racing dots' chart I use in my Look At The Stats! blog.
You'll also need to load up D3 in your document to make this work. Check out D3 at http://www.d3js.org
*/

chartCode = function(){

	function drawRacingDotsChart(divID){
		
		var divID = divID
		var RankID = "Rank" + divID
		var GapID = "Gap" + divID

		console.log(divID)
		console.log(RankID + ", " + GapID)

		//Set the view dimensions
		var svgWidth = 480;
		var listLength = 20;
		var dotSpacing  = 20;
		var svgPadding = 20;
		var labelPadding = 150;
		var svgHeight = dotSpacing * listLength + (2 * svgPadding);

		var dotRadius = 4

		//Viz code from here down. Add the json file reference here
		d3.json("data/chartData.json",function(json){
			console.log (json)

			//Set up the SVG area
			var svg = d3.select("chart")
						.append("svg")
						.attr("width", svgWidth)
						.attr("height", svgHeight);

			//Set scale for data display			
			var xScale = d3.scale.linear()
							.domain([0, d3.max(json, function(d){return d[GapID];})])
							.range([svgWidth - svgPadding, labelPadding + svgPadding]); 

			//Define the x-axis
			var xAxis = d3.svg.axis()
							.scale(xScale)
							.orient("bottom")
							.ticks(5)
							.tickSize("-" + svgHeight, 0, 0)

			//Draw the data points	
			var circles = svg.selectAll("circle")
							.data(json)
							.enter()
							.append("circle")
							.attr("cx", function(d){
								return xScale(d.Gap);
								})
							.attr("cy", function(d, i){
								return (i * dotSpacing) + (dotSpacing/2);
								})
							.attr("r", dotRadius + "px")
							.attr("fill", "#2B8CBE")
							.on("mouseover", function(){
									d3.select(this)
										.attr("fill", "orange")	
										.attr("r", "5px")
										.append("title")
										.text(function(d){return "+" + d[GapID]})
							})
							.on("mouseout", function(){
									d3.select(this)
										.attr("fill", "#2B8CBE")	
										.attr("r", dotRadius + "px")
							});

			//Label the data  points
			var labels = svg.selectAll("text")
							.data(json)
							.enter()
							.append("text")
							.text(function(d){
								if(d.Rank == 1){	
									return d.Rank + ". " + d.name + ": " + d.Time;
									}
								else {
									return d.Rank + ". " + d.name;
									}
								})
							.attr("x", function(d){
								return xScale(d.Gap) - 7;
								})
							.attr("y", function(d, i){
								return (i * dotSpacing) + ((dotSpacing/2) + (dotRadius/2));
								})
							.attr("text-anchor", "end")
							.attr("font-family", "sans-serif")
							.attr("font-size", "10px");

			//Draw the X-axis
			var drawXAxis = svg.append("g")
								.attr("class", "axis")
								.attr("transform", "translate(0, " + (listLength * dotSpacing) + ")")
								.call(xAxis)				
		});
	};

};