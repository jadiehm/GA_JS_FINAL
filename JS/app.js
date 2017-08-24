/* CENSUS API NOTES
  baseUrl: https://api.census.gov.data/
  format: baseUrl/yearCollected/datasetName?get=NAME,tableName&for=geography*&key=apikey
*/

$(document).ready(function() {
    var CONSTANTS = {
        API_KEY: "6d83e90a07eca747afdf37e4c9e3c4e9fe4bd341",
        BASE_URL: "https://api.census.gov/data/",
        TABLE_KEY: {
          B00001_001E: "Total population",
          B02001_002E: "Percentage white",
          B02001_003E: "Percentage black",
          B03001_003E: "Percent Hispanic",
          B16010_015E: "Percent with high school degree",
          C18120_006E: "Percent unemployed",
          C18130_001E: "Percent in poverty",
          B05002_013E: "Percent foreign born"
        },
        COUNTIES: null
    };

    var App = {
        init: function() {
          App.requestCensusData();
          App.drawCountyMap();
        },
        requestCensusData: function() {
          var yearCollected = 2015;
          var datasetName = "acs5";
          var tableTotalPop = "B02001_001E"; //Total unweighted pop
          var tableDemo = "B02001_002E"; //Dropdown demographic
          var geography = "county:*";
          var query_url_total = CONSTANTS.BASE_URL + yearCollected + "/" + datasetName + "?get=NAME," + tableTotalPop + "&for=" + geography + "&key=" + CONSTANTS.API_KEY;
          var query_url_demo = CONSTANTS.BASE_URL + yearCollected + "/" + datasetName + "?get=NAME," + tableDemo + "&for=" + geography + "&key=" + CONSTANTS.API_KEY;
          console.log(query_url_total);
          console.log(query_url_demo);

          var totalPopulationData = [];
          var demoData = [];

          var demoLookup = {};


          return $.when(
            //Make the initial call for the total population
            $.ajax(query_url_total, {
              dataType: "json",
              success: function(response) {
                response.forEach(function(item, i) {
                  if(i) {
                    var countyFips = item[2] + item[3];
                    var countyStateArray = item[0].split(', ')
                    demoLookup[countyFips] = {
                      totalPop: item[1],
                      stateName: countyStateArray[1],
                      countyName: countyStateArray[0]
                    }
                  }
                })

                //console.log(demoLookup)

                //Make the call for the other variable
                $.ajax(query_url_demo, {
                  dataType: "json",
                  success: function(response) {
                    response.forEach(function(item, i) {
                      if(i) {
                        var countyFips = item[2] + item[3];
                        demoLookup[countyFips]["demo"] = item[1];
                        demoLookup[countyFips]["percentage"] = (demoLookup[countyFips]["demo"]/demoLookup[countyFips]["totalPop"]);
                      }
                    })
                    App.colorMap(demoLookup);
                    //Push the response into the totalPolation array for comparison later
                    //demoData.push(response);
                    //console.log("demo", demoData);
                  },
                  error: function(error) {
                    console.log(error);
                  }
                })
                //Push the response into the totalPolation array for comparison later
                //totalPopulationData.push(response);
                //console.log("total", totalPopulationData);
              },
              error: function(error) {
                console.log(error);
              }
            })
          );
        },
        drawCountyMap: function() {
          //Margin conventions
          var margin = {top: 0, left: 0, bottom: 0, right: 0},
              divWidth = d3.select(".map-container").node().clientWidth,
              width = divWidth - margin.left - margin.right,
              mapRatio = 0.6,
              height = width * mapRatio;

          //Map projection and dimensions
          var projection = d3.geo.albersUsa()
              .scale(width * 1.325)
              .translate([width/2, height/2]);

          var path = d3.geo.path()
              .projection(projection);

          //Attach tooltips
          var tooltip = d3.select("body").append("div")
  		      .attr("class", "tooltip")
  		      .style("opacity", 0);

          //Color scale
          var color = d3.scale.linear().domain([0,100])
                      .range(['#ffffd4, #993404']);

          //Append svg
          var svgMap = d3.select(".map-container").append("svg")
        	   .attr("width", width + 'px')
        		 .attr("height", height + 'px');

          //Load in data
          queue()
		        .defer(d3.json, "data/us.json")
		        .await(appendMap);

          //Append map
          function appendMap(error, us) {
            //Add counties
            CONSTANTS.COUNTIES = svgMap.append("g")
          		 .attr("class", "county")
          		 .selectAll("path")
          		 .data(topojson.feature(us, us.objects.counties).features)
          		 .enter().append("path")
          		 .attr("d", path)
               .on("mouseover", App.countyMouseover)
               .on("mouseout", App.countyMouseout);

            //Add states
            svgMap.append("g")
         		   .attr("class", "state")
         		   .selectAll("path")
         		   .data(topojson.feature(us, us.objects.states).features)
         		   .enter().append("path")
         		   .attr("d", path);
          }

          //RESPONSIVENESS
          d3.select(window).on('resize', resize);

          function resize() {
            var newDivWidth = d3.select(".map-container").node().clientWidth,
                newWidth = newDivWidth - margin.left - margin.right,
                newHeight = newWidth * mapRatio;

            var newProjection = d3.geo.albersUsa()
                .scale(newWidth * 1.325)
                .translate([newWidth/2, newHeight/2]);

            path = d3.geo.path()
                .projection(newProjection);

            svgMap
                .style('width', newWidth + 'px')
                .style('height', newHeight + 'px');

            svgMap.selectAll('path').attr('d', path);
          }
        },
        colorMap: function(demoLookup) {
          CONSTANTS.COUNTIES
            .style("fill", function(d) {
              // return color(demoLookup)
              var id = d.id.toString();
              var fixedId = id.length === 5 ? id : "0" + id;
              if (fixedId in demoLookup) {
                return d3.interpolate('#ffffd4', '#993404')(demoLookup[fixedId]['percentage']);
            }
              // console.log()
            });
        },
        countyMouseover: function(demoLookup) {
          //Moves selction to front
        	d3.selection.prototype.moveToFront = function() {
        			return this.each(function(){
          		this.parentNode.appendChild(this);
        			});
        	};
          var sel = d3.select(this);
          sel.moveToFront();
          sel
            .transition().duration(100)
            .style({'stroke': '#262626', 'stroke-width': 2});
          //tooltip
          var tooltip = d3.select(".tooltip")

          tooltip
            .transition().duration(100)
            .style({'opacity': 1, 'left': (d3.event.pageX) + "px", 'top': (d3.event.pageY) + "px"});
          tooltip
            .html("<p>ADD TEXT HERE</p>");
        },
        countyMouseout: function(demoLookup) {
          //Moves selction to back
        	d3.selection.prototype.moveToBack = function() {
          		return this.each(function() {
              	var firstChild = this.parentNode.firstChild;
              	if (firstChild) {
                  	this.parentNode.insertBefore(this, firstChild);
              	}
          		});
        	};
          var sel = d3.select(this);
  			  sel.moveToBack();
          sel
		        .transition().duration(100)
		        .style({'stroke': 'white', 'stroke-width': 0.5});
          //tooltip
          var tooltip = d3.select(".tooltip")
            .transition().duration(100)
            .style({'opacity': 0});
        }
    };

    App.init();
});
