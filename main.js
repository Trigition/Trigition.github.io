<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>D3 Test</title>
        <style>
            .land {
                fill: #444;
            }
            
            .county-boundary {
                fill: none;
                stroke: #fff;
                stroke-width: .5px;
            }
            .state-boundary {
                fill: none:
                stroke: #fff;
            }
            .glyph {
                fill: #000;
            }
        </style>
        <script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
        <script src="http://d3js.org/topojson.v1.min.js"></script>
        <script src="papaparse.min.js"></script>
        <script src="jquery-2.1.3.js"></script>
        </head>
        <body>
        <script type="text/javascript">
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
					.style("opacity", 0.75);
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
            //d3.select(self.frameElement).style("height", height + "px");
            </script>
            Oh, hello.
        </body>
</html>
