(function() {
    buildPourOverCollection = function(seasonData){        
        //Initialise the PourOver collection

        var collection = new PourOver.Collection(seasonData)

        var venues = PourOver.makeExactFilter("venue", ["Pietermaritzburg", "Cairns", "Fort William", "Leogang", "Mont Sainte-Anne", "Windham", "Meribel", "Hafjell"]),
        categories = PourOver.makeExactFilter("category", ["Men", "Women"]),
        split1Rank = PourOver.makeRangeFilter("split1Rank", [[1,20]]),
        split2Rank = PourOver.makeRangeFilter("split2Rank", [[1,20]]),
        split3Rank = PourOver.makeRangeFilter("split3Rank", [[1,20]]),
        sector1Rank = PourOver.makeRangeFilter("sector1Rank", [[1,20]]),
        sector2Rank = PourOver.makeRangeFilter("sector2Rank", [[1,20]]),
        sector3Rank = PourOver.makeRangeFilter("sector3Rank", [[1,20]]);

        collection.addFilters([venues, categories, split1Rank, split2Rank, split3Rank, sector1Rank, sector2Rank, sector3Rank])

        collection.filters.venue.query("Hafjell");
        collection.filters.category.query("Men");
        collection.filters.split1Rank.query([1,20]);
        collection.filters.split2Rank.query([1,20]);
        collection.filters.split3Rank.query([1,20]);
        collection.filters.sector1Rank.query([1,20]);
        collection.filters.sector2Rank.query([1,20]);
        collection.filters.sector3Rank.query([1,20]);

        return collection
    }

    getChartData = function(collection, result_set, sortField){
        var venue_set = collection.filters.venue.current_query,
        category_set = collection.filters.category.current_query,
        output_set = venue_set.and(category_set).and(result_set);

          results = collection.get(output_set.cids);

        results.sort(function(a, b){
          if(a[sortField] == b[sortField])
          return 0;
        if(a[sortField] < b[sortField])
          return -1;
        if(a[sortField] > b[sortField])
          return 1;
        });

        return results;
        }

    
    //Draw the chart
    drawChart = function(params){
        var height = params.dotSpacing * params.listLength + (2 * params.svgPadding);
        var width = params.width;  

        var svg = d3.select('#' + params.sector)
                    .append("svg")
                    .attr("height", height)
                    .attr("width", width);

        var gap = params.sector + "Gap",
        rank = params.sector + "Rank";

        //Set scale for data display      
        var xScale = d3.scale.linear()
                .domain([0, d3.max(params.chartData, function(d){return d[gap];})])
                .range([params.width - params.svgPadding, params.labelPadding + params.svgPadding]); 

        //Define the x-axis
        var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
                .ticks(5)
                .tickSize("-" + params.height, 0, 0)

        //Draw the data points  
        var circles = svg.selectAll("circle")
                .data(params.chartData)
                .enter()
                .append("circle")
                .attr("cx", d3.max(params.chartData, function(d){return d[gap];}))
                .transition().attr("cx", function(d){return xScale(d[gap]);}).duration(1000).delay(500)
                .attr("cy", function(d, i){return (i * params.dotSpacing) + (params.dotSpacing/2);})
                .attr("r", params.dotRadius + "px")
                .attr("fill", "#2B8CBE")

        //Label the data  points
        var labels = svg.selectAll("text")
                .data(params.chartData)
                .enter()
                .append("text")
                .text(function(d){
                  if(d[rank] == 1){return d[rank] + ". " + d['name'] + ": " + d[params.sector];}
                  else {return d[rank] + ". " + d['name'] + ": +" + d[gap];}
                  })
                .attr("x", function(d){return xScale(d[gap]) - 7;})
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
    }

    racingDots = function(params){ 
        //Select the correct page element and then set up the svg canvas for us to draw on
        var sectors = ['sector1', 'sector2', 'sector3', 'split1', 'split2', 'split3'];  

        //Load the data
        d3.json((params.data) + (params.refresh ? ("#" + Math.random()) : ""), function(error, json) {
          var collection = buildPourOverCollection(json)

          var raceSets = {"split1Set" : collection.filters.split1Rank.current_query,
                          "split2Set" : collection.filters.split2Rank.current_query,
                          "split3Set" : collection.filters.split3Rank.current_query,
                          "sector1Set" : collection.filters.sector1Rank.current_query,
                          "sector2Set" : collection.filters.sector2Rank.current_query,
                          "sector3Set" : collection.filters.sector3Rank.current_query};

          for (i = 0; i < sectors.length; i++){
                    params.sector = sectors[i]
                    params.chartData = getChartData(collection, raceSets[sectors[i] + "Set"], sectors[i] + "Rank")
                    drawChart(params)}
          })
        }
  }
)();