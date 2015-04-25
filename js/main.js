var width = 960,
    height = 480;
var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    columns = [],
	orderedColumns = [],
    curFrame = 0,
    interval,
    frameLength = 500,
    isPlaying = false,
    sliderMargin = 65;
var dateScale, sliderScale, slider;

var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);
var path = d3.geo.path()
    .projection(projection);
//var graticule = d3.geo.graticule();
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
var g = svg.append("g");
var coordinates = [];
			
d3.json("us-10m.json", function(error, us) {
    d3.csv("data.csv", function(error, data) {
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
                return magnitude;
            })
            .attr("time_index", function(d) {
				return d.TIME_INDEX;	
			})
            .style("opacity", 0);
		//Generate sliders	
		//console.log(orderedColumns);
		dateScale = createDataScale(orderedColumns);
		generateSlider();
    });
	//Draw Map Components
    g.insert("path", ".graticule")
        .datum(topojson.feature(us, us.objects.land))
        .attr("class", "land")
        .attr("d", path);
    /*g.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("class", "state-boundary")
        .attr("d", path);*/
	//Generate sliders

});

/*
 * Play through animation
 */
function play() {
	totalFrames = getMaxTimeIndex(orderedColumns);
	interval = setInterval( function() {
		curFrame++;
		//Find and update slider bar to reference current frame
		console.log(curFrame, totalFrames)
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
			//console.log("Check: ", d.TIME_INDEX, ">", index)
			if (d.TIME_INDEX == index) {
				return 0.75;	
			} else if(d.TIME_INDEX < index) {
				return 0.1;	
			}
			return 0.0;
		})
	//Update Web Text
	var date = splitMonthYear(index);
	d3.select("#date p#month").html(months[date[1]]);
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
					//return months[date[0]] + " " + date[1];
					return "\'" + date[1]; 
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
    var year = Math.floor(index / 12) + 50;
	var month = index % 12;
    return[month, year];
}
