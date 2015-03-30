var Charting = (function() {

    var collection, results, raceSets, maxAxis, chartData, svg, sector, height, width
    sectors = ['split1', 'split2', 'split3', 'sector1', 'sector2', 'sector3'];

    buildPourOverCollection = function (params, data){        
        //Initialise the PourOver collection
        collection = new PourOver.Collection(data)

        //Build the filters and add them to the collection
        var venues = PourOver.makeExactFilter("venue", ["Pietermaritzburg", "Cairns", "Fort William", "Leogang", "Mont Sainte-Anne", "Windham", "Meribel", "Hafjell"]),
        categories = PourOver.makeExactFilter("category", ["Men", "Women"]),
        split1Rank = PourOver.makeRangeFilter("split1Rank", [[1,params.listLength]]),
        split2Rank = PourOver.makeRangeFilter("split2Rank", [[1,params.listLength]]),
        split3Rank = PourOver.makeRangeFilter("split3Rank", [[1,params.listLength]]),
        sector1Rank = PourOver.makeRangeFilter("sector1Rank", [[1,params.listLength]]),
        sector2Rank = PourOver.makeRangeFilter("sector2Rank", [[1,params.listLength]]),
        sector3Rank = PourOver.makeRangeFilter("sector3Rank", [[1,params.listLength]]);

        collection.addFilters([venues, categories, split1Rank, split2Rank, split3Rank, sector1Rank, sector2Rank, sector3Rank])

        //Create initial query sets
        collection.filters.venue.query(params.venue);
        collection.filters.category.query(params.category);
        collection.filters.split1Rank.query([1,params.listLength]);
        collection.filters.split2Rank.query([1,params.listLength]);
        collection.filters.split3Rank.query([1,params.listLength]);
        collection.filters.sector1Rank.query([1,params.listLength]);
        collection.filters.sector2Rank.query([1,params.listLength]);
        collection.filters.sector3Rank.query([1,params.listLength]);

        raceSets = {"split1Set" : collection.filters.split1Rank.current_query,
            "split2Set" : collection.filters.split2Rank.current_query,
            "split3Set" : collection.filters.split3Rank.current_query,
            "sector1Set" : collection.filters.sector1Rank.current_query,
            "sector2Set" : collection.filters.sector2Rank.current_query,
            "sector3Set" : collection.filters.sector3Rank.current_query};

        return collection

    }

    //Get the data for the top n positions at a given split or sector
    getChartData = function(collection, result_set, sortField){
        var venue_set = collection.filters.venue.current_query,
        category_set = collection.filters.category.current_query,
        output_set = venue_set.and(category_set).and(result_set),
        results = sortChartData(collection.get(output_set.cids), sortField);        
        return results;
        }

    //Helper function to sort the chart data in ascending order
    sortChartData = function(results, sortField){
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

        var gap = sector + "Gap",
        rank = sector + "Rank";

        //Set scale for data display      
        var xScale = d3.scale.linear()
                .domain([0, maxAxis])
                .range([params.width - params.svgPadding, params.labelPadding + params.svgPadding]); 

        //Define the x-axis
        var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
                .ticks(5)
                .tickSize(  params.height, 0, 0)

        //Draw the data points  
        var circles = svg.selectAll("circle")
                .data(chartData);

        //Update old elements as required
        circles.attr("class", "update")
                .enter()
                .append("circle")
                .attr("cx", maxAxis)
                .transition().attr("cx", function(d){return xScale(d[gap]);}).duration(1000).delay(500)
                .attr("cy", function(d, i){return (i * params.dotSpacing) + (params.dotSpacing/2);})
                .attr("r", params.dotRadius + "px")
                .attr("fill", "#2B8CBE")

        //Label the data  points
        var labels = svg.selectAll("text")
                .data(chartData)
                .enter()
                .append("text")
                .text(function(d){
                  if(d[rank] == 1){return d['name'] + ": " + d[sector];}
                  else {return d['name'] + ": +" + d[gap];}
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

    //Helper function to loop through all six charts that need to be drawn/refreshed
    updateCharts = function(params){
          for(i=0; i < sectors.length; i++){
            sector = sectors[i]
            drawChart(params)
          }

        }

    //Do the inital data load, create PourOver collection and draw the charts
    initCharts = function(params){ 
        d3.json((params.data) + (params.refresh ? ("#" + Math.random()) : ""), function(error, json) {
          collection = buildPourOverCollection(params, json)
          for (i = 0; i < sectors.length; i++){
                sector = sectors[i]
                var split3Data = getChartData(collection, raceSets['split3Set'], 'split3Rank');
                maxAxis = d3.max(split3Data, function(d){return d['split3Gap'];});
                chartData = getChartData(collection, raceSets[sectors[i] + "Set"], sectors[i] + "Rank")

                height = params.dotSpacing * params.listLength + (2 * params.svgPadding),
                width = params.width;
                svg = d3.select('#' + sector)
                            .append("svg")
                            .attr("height", height)
                            .attr("width", width);
                
                drawChart(params)
            }          
        })
        }

  }
)();