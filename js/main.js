var width = 960,
    height = 480;
var month = ["01","02","03","04","05","06","07","08","09","10","11","12"],
    columns = [],
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
var graticule = d3.geo.graticule();
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
var g = svg.append("g");
var coordinates = [];
			
d3.json("us.json", function(error, us) {
    d3.csv("data.csv", function(error, data) {
        g.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                console.log(d)
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
                var magnitude = d.DAMAGE_PROPERTY + 1
                magnitude = Math.LN10(magnitude)
                return magnitude;
            })
            .style("fill", "red")
            .style("opacity", 0.5);
    });
    g.insert("path", ".graticule")
        .datum(topojson.feature(us, us.objects.land))
        .attr("class", "land")
        .attr("d", path);
    g.insert("path", ".graticule")
        .datum(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b && !(a.id / 1000 ^ b.id / 1000); }))
        .attr("class", "county-boundary")
        .attr("d", path);
});

function splitMonthYear(line) {
    var year = line.substring(0,4);
    var month = line.substring(4);
    return[month, year];
}
