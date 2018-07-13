$( document ).ready(function() {
    render_chart();
});

function render_chart(){
    var stack = d3.layout.stack();
    var dataset = {
                "categories": ['Lun','Mar','Mié','Jue','Vie','Sáb'],
                "series": ["Álgebra III","Computación Cuántica","Física de los agujeros negros"],
                "colors": ["#3498db","#e74c3c","#2ecc71"],
                "layers": [
                        [
                            {"tstart":9,"tend":13,"day":"Lun","slot":1},
							{"tstart":9,"tend":13,"day":"Mié","slot":1},
                        ],
                        [
							{"tstart":18,"tend":22,"day":"Lun","slot":1},
                            {"tstart":12,"tend":18,"day":"Mar","slot":1}
                        ],[
                            {"tstart":8,"tend":16,"day":"Jue","slot":1},
							{"tstart":9,"tend":13,"day":"Sáb","slot":1},
                        ]
                    ]
                }

    //n = dataset["series"].length, // Number of Layers
	n = d3.max(dataset["layers"].map(function(x){
			return d3.max(x.map(function(y){
				return y.slot;
			}));
		}));
	
    m = dataset["layers"].length, // Number of Samples in 1 layer

    yGroupMax = d3.max(dataset["layers"], function(layer) { return d3.max(layer, function(d) { return d.tend; }); });
    yGroupMin = d3.min(dataset["layers"], function(layer) { return d3.min(layer, function(d) { return d.tstart; }); });

    var margin = {top: 50, right: 50, bottom: 50, left: 100},
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .domain(dataset["categories"])
        .rangeRoundBands([0, width], .08);

    var y = d3.scale.linear()
        .domain([7, 22])
        .range([0, height]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickSize(5)
        .tickPadding(6)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = d3.select("#chart1").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var layer = svg.selectAll(".layer")
        .data(dataset["layers"])
        .enter().append("g")
        .attr("class", "layer");

    var rect = layer.selectAll("rect")
        .data(function(d,i){d.map(function(b){b.colorIndex=i;return b;});return d;})
        .enter().append("rect")
        .attr("x", function(d, i, j) { return x(d.day) + x.rangeBand() / n * (d.slot-1); })
        .attr("width", x.rangeBand() / n)
        .attr("y", function(d) { return y(d.tstart); })
        .attr("height", function(d) { return (d.tend-d.tstart)*(y(2)-y(1))})
        .attr("class","bar")
        .style("fill",function(d){return dataset["colors"][d.colorIndex];})

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.select("g")
            .attr("class", "y axis")
            .call(yAxis);

        svg.append("text")
        .attr("x", width/3)
        .attr("y", 0)
        .attr("dx", ".71em")
        .attr("dy", "-.71em")
        .text("Horarios de cursada");

    // add legend
    var legend = svg.append("g")
      .attr("class", "legend")

    legend.selectAll('text')
      .data(dataset["colors"])
      .enter()
      .append("rect")
      .attr("x", width-margin.right)
      .attr("y", function(d, i){ return i *  20;})
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", function(d) {
        return d;
      })

    legend.selectAll('text')
      .data(dataset["series"])
      .enter()
    .append("text")
    .attr("x", width-margin.right + 25)
    .attr("y", function(d, i){ return i *  20 + 9;})
    .text(function(d){return d});

    var tooltip = d3.select("body")
    .append('div')
    .attr('class', 'tooltip');

    tooltip.append('div')
    .attr('class', 'day');
    tooltip.append('div')
    .attr('class', 'timeRange');

    svg.selectAll("rect")
    .on('mouseover', function(d) {
        if(!d.day)return null;
		//console.log(d);
        tooltip.select('.day').html("<b>" + dataset.series[d.colorIndex] + "</b>");
        tooltip.select('.timeRange').html(timeToText(d.tstart) + " - " + timeToText(d.tend) + "hs");

        tooltip.style('display', 'block');
        tooltip.style('opacity',2);

    })
    .on('mousemove', function(d) {

        if(!d.day)return null;

        tooltip.style('top', (d3.event.layerY + 10) + 'px')
        .style('left', (d3.event.layerX - 25) + 'px');
    })
    .on('mouseout', function() {
        tooltip.style('display', 'none');
        tooltip.style('opacity',0);
    });

}

function timeToText(t){
	var hours = Math.floor(t);
	var minutes = t-hours;
	
	return (t<10?"0":"") + hours + ":" + (minutes<10?"0":"") + minutes;
}