var width = 960,
    height = 480;
	
var timeOffset = 0; //This offsets the data collection to January 1996
var margin = {top: -5, right: -5, bottom: -5, left: -5},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    columns = [],
	orderedColumns = [],
    curFrame = 0,
    interval,
    frameLength = 500,
    isPlaying = false,
	shouldColor = true,
    sliderMargin = 65;
	
var dateScale, sliderScale, slider;

var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var zoomBehavior = d3.behavior.zoom()
	.scaleExtent([1,10])
	.on("zoom", zoomFunc);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
	.attr("transform", "translate(" + margin.left + "," + margin.right + ")")
	.call(zoomBehavior);

var g = svg.append("g");


/*
 * This function maps 2 ranges of values to another set of values
 */
Number.prototype.map = function(inMax, inMin, outMax, outMin) {
	var val = ( this - inMin ) * ( outMax - outMin ) / ( inMax - inMin ) + outMin;
	return Math.floor(val);
}


d3.json("us-10m.json", function(error, us) {
    d3.csv("data.csv?v=4", function(error, data) {
		//orderedColumns.push(data.TIME_INDEX);
		//console.log(orderedColumns);
        g.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                orderedColumns.push(d.TIME_INDEX)
                var coor = projection([d.BEGIN_LON, d.BEGIN_LAT])
                if (coor !== null)
                    return coor[0];
				else
					return 0.0
			})
            .attr("cy", function(d) {
                var coor = projection([d.BEGIN_LON, d.BEGIN_LAT])
                if (coor !== null)
                    return coor[1]
                else
                    return 0.0
            })
            .attr("r", function(d) {
                var magnitude = d.DAMAGE_PROPERTY
                if (magnitude < 1)
                    return 1;
                //console.log(magnitude)
                return Math.log10(magnitude);
            })
            .attr("time_index", function(d) {
				return d.TIME_INDEX - timeOffset;	
			})
            .style("opacity", 0)
			.style("fill", function(d) {
				var type = parseInt(d.TYPE);
				switch(type) {
				case 0:
					return "red";
				case 1:
					return "#67a9cf";
				case 2:
					return "yellow";
				case 3:
					return "gray";
				default:
					return "blue";	
				}
			})
		//Generate sliders	
		//console.log(orderedColumns);
		dateScale = createDataScale(orderedColumns);
		generateSlider();
		updateDateText(0);
    });
	//Draw Map Components
    g.insert("path", ".graticule")
        .datum(topojson.feature(us, us.objects.land))
        .attr("class", "land")
        .attr("d", path);

});

/*
 * Play through animation
 */
function play() {
	totalFrames = getMaxTimeIndex(orderedColumns);
	interval = setInterval( function() {
		curFrame++;
		//Find and update slider bar to reference current frame
		d3.select("#slider-div .d3-slider-handle")
			.style("left", (100 * curFrame / totalFrames) + "%");
		slider.value(curFrame);
		//If being played when slider is at end, restart animation
		if ( curFrame == totalFrames )
			curFrame = 0;
		drawGlyphs(curFrame)		
		//Stop Animation when there is no more data to display
		if ( curFrame == totalFrames - 1 )
			return;	
	}, 100)
}

/*
 * This function handles when the Play Button is played
 */
function buttonPlayPress() {
	if (isPlaying == true) {
		document.getElementById("playButton").value = "Play Animation";
		clearInterval(interval);
		isPlaying = false;
		return;	
	}
	else {
		document.getElementById("playButton").value = "Pause";
		isPlaying = true;
		play();
	}
	
}

/*
 * Animation definition for circles
 */
function drawGlyphs(index) { 
	var circle = d3.selectAll("circle");
	circle
		.transition()
		.style("opacity", function(d) {
			if (d.TIME_INDEX == index - timeOffset) {
				return 0.75;	
			} else if(d.TIME_INDEX < index - 30) {
				return 0.1;	
			} else if (d.TIME_INDEX < index) {
				return 0.1;	
			}
			return 0.0;
		})
		.style("stroke", function(d) {
			if(d.TIME_INDEX == index) {
				return "#000";	
			} else if (d.TIME_INDEX < index) {
				return "#67a9cf";	
			}
		})
	//Update Web Text
	updateDateText(index);
}

/*
 * Updates Date HTML text
 */
function updateDateText(index) {
	//Update Date Values
	var date = splitMonthYear(index);
	document.getElementById("timeLabel").innerHTML = months[date[0]] + " " + (date[1] + 1900);
	var winter = 0xd3e1ff;
	var summer = 0xfc913a;
	var colorMap = date[0].map(1, 12, winter, summer)
	//document.getElementById("timeLabel").style.color = "#" + colorMap.toString(16)
	//document.getElementById("timeLabel").style.color = "red";
}

/*
 *Generate Slider for animation
 */
function generateSlider() {
	//sliderScale = d3.scale.linear().domain([0,orderedColumns.length - 1]);
    sliderScale = getMaxTimeIndex(orderedColumns);
	var val = slider ? slider().value() : 0;
    slider = d3.slider()
		//.scale(sliderScale)
		.axis(true)
		.min(0)
		.max(sliderScale)
		.value(val)
		.on("slide", function(event, value) {
			currentFrame = value;
			if (true) {
				drawGlyphs(currentFrame)	
			}
		})
		.axis(
			//Create Slider Axis Titles
			d3.svg.axis()
				.scale(500)
				.tickFormat(function(d) {
					var date = splitMonthYear(d);
					var dateString = String(date[1]);
					return "\'" + dateString.substr(dateString.length - 2); 
				})
		);
 
	//Associate slider with CSS classes	
	d3.select("#axis").remove();
    d3.select("#slider-dev").remove();
	d3.select("#slider-container")
		.append("div")
		.attr("id", "slider-div")
		.style("width", 500 + "px")
		.on("mousemove", sliderBar)
		.on("mouseout", function() {
			d3.select("#slider-probe").style("display", "none");
		})
		.call(slider);

}

function getMaxTimeIndex(timeIndexColumns) {
	var maxIndex = timeIndexColumns.length - 1;
	return timeIndexColumns[maxIndex];	
}

/*
 * Find the range of dates in the given dataset
 */
function createDataScale(range) {
	return range.length - 1;
}
/*
 * Generates the slider bar
 */
function sliderBar() {
	var place = d3.mouse(this)[0];
	d3.select("#slider-probe")
		.style("left", d3.mouse(this)[0] + "px")
		.style("display", "block")
		.select("p");
		//.html(months[place.getMonth()] + " " + place.getFullYear());
}

function splitMonthYear(index) {
    var year = Math.floor(index / 12) + 96;
	var month = index % 12;
    return[month, year];
}

/*
 * Function allows for zooming behavior
 * 
 */
function zoomFunc() {
	g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}