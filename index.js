const D3Node = require('d3-node');
const d3Module = require('d3'); // v3.5.17
const topojson = require('topojson');
const france = require('./data/france.json');

const defaultStyle = `
.border{
  stroke-width:.3px;
  fill:none;
  stroke:#333;
}
svg {font: 10px sans-serif;}
.caption{font-weight: bold;}
.key path {display: none;}
.key line{
  stroke:#000;
  shape-rendering:crispEdges;
}
`;

// adapted from: https://bl.ocks.org/bricedev/97c53d6ed168902239f7

function choropleth(population, colorArray, svgStyles = defaultStyle) {
  var d3n = new D3Node({
    d3Module,
    svgStyles
  });

  const d3 = d3n.d3;
  const width = 960;
  const height = 500;
  const formatNumber = d3.format('s');

  const color = d3.scale.threshold()
    .domain([250000, 500000, 750000, 1000000, 1250000, 1500000, 1750000])
    .range(colorArray);

  const x = d3.scale.linear()
    .domain([77156, 2579208])
    .range([0, 300]);

  const xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .tickSize(13)
    .tickValues(color.domain())
    .tickFormat((d) => formatNumber(d));

  const projection = d3.geo.albers()
    .center([0, 49.5])
    .rotate([-2.8, 3])
    .parallels([45, 55])
    .scale(2500)
    .translate([width / 2, height / 2]);

  const path = d3.geo.path()
    .projection(projection);

  const svg = d3n.createSVG(width, height);

  const g = svg.append('g')
    .attr('class', 'key')
    .attr('transform', 'translate(' + 40 + ',' + 40 + ')');

  g.selectAll('rect')
    .data(color.range().map((currentColor) => {
      var d = color.invertExtent(currentColor);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
    .enter()
    .append('rect')
    .attr('height', 8)
    .attr('x', (d) => x(d[0]))
    .attr('width', (d) => x(d[1]) - x(d[0]))
    .style('fill', (d) => color(d[0]));

  g.call(xAxis).append('text')
    .attr('class', 'caption')
    .attr('y', -6)
    .text('Population');

  svg.selectAll('.departements')
    .data(topojson.feature(france, france.objects.regions).features)
    .enter().append('path')
    .attr('class', 'departements')
    .attr('d', path)
    .style('fill', (departement) => {
      var paringData = population.filter((population) => {
        return departement.properties.name === population.name;
      })[0];

      return paringData ? color(paringData.population) : color(0);
    });

  svg.append('path')
    .datum(topojson.mesh(france, france.objects.regions, (a, b) => { return a.properties.name !== b.properties.name || a === b; }))
    .attr('class','border')
    .attr('d', path);

  return d3n;
}

module.exports = choropleth;
