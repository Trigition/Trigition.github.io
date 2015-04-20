var width = 960,
    height = 480;

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
            .attr("r", 10)
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
