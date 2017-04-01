const output = require('d3node-output');
const choropleth = require('../');
const fs = require('fs');
const csvString = fs.readFileSync('data/data.csv').toString();
const d3 = require('d3'); // v3.5.17
const population = d3.csv.parse(csvString);
const colorArray = ['#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#08519c','#08306b'];

// create output files
output('./example/output', choropleth(population, colorArray));
