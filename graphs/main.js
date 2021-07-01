// data load
// reference for d3.autotype: https://github.com/d3/d3-dsv#autoType


/** CONSTANTS */
// constants help us reference the same values throughout our code
const width = window.innerWidth * 0.4,
height = window.innerHeight / 1.5,
paddingInner = 0.2,
margin = { top: 20, bottom: 40, left: 75, right: 40 };


var state = {
  data : [],
  filteredData : [],
}

var svg;
var xScale;
var yScale;
var yAxis;
var groups;


function init(){
/** SCALES */
// reference for d3.scales: https://github.com/d3/d3-scale
  xScale = d3
    .scaleLinear()
    .domain([0,d3.max(state.data, d => d.count)])
    .range([margin.left,width - margin.right]);
    
  /** MAIN CODE */
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
  



 


  draw()

}




function draw(){

  yScale = d3
    .scaleBand()
    .domain(state.filteredData.map(d => d.activity))
    .range([height - margin.bottom, margin.top])
    .paddingInner(paddingInner);

  // reference for d3.axis: https://github.com/d3/d3-axis
  yAxis = d3.axisLeft(yScale)
      .ticks(state.filteredData.length)
      .tickSizeInner(5)
      .tickSizeOuter(5);


  /* append background rects
  groups = svg
  .selectAll("g")
  .data(state.filteredData)
  .enter()
  .append("g")
  .attr("class","bararea")
  .attr("y", d=>yScale(d.activity))
  .attr("x", margin.left)


  var bgrect = groups
  .append("rect")
  .attr("class","rect")
  .attr("y", d=>yScale(d.activity))
  .attr("x", margin.left)
  .attr("height", yScale.bandwidth())
  .attr("width", width-margin.left)
  .attr("fill","lightgray")
  .attr("opacity",0.4)



  // append rects with bar
  var rect = groups
  .append("rect")
  .attr("class","rect")
  .attr("y", d => yScale(d.activity))
  .attr("x", d => margin.left)
  .attr("height", yScale.bandwidth())
  .attr("width", d => xScale(d.count))
  .attr("fill","darkblue")


  // append text
  var text = groups
  .append("text")
  .attr("class", "label")
  // this allows us to position the text in the center of the bar
  .attr("y", d => yScale(d.activity) + (yScale.bandwidth()/4))
  .attr("x", d => xScale(d.count) )
  .text(d => d.count)
  .attr("dy", "1.25em");*/

  var bar = svg.selectAll(".bar")
  .data(state.filteredData)
  .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d, i) { return "translate("+margin.left+"," + yScale(d.activity) + ")"; });

  bar.append("rect")
    .attr("height", yScale.bandwidth())
    .attr("width", d=>xScale(d.count));

  bar.append("text")
    .attr("text-anchor", "end")
    .attr("x", function(d) { return xScale(d.count) - 6; })
    .attr("y", yScale.bandwidth() / 2)
    .attr("dy", ".35em")
    .text(function(d, i) { return i; });

  d3.select("#sortbutton").on("click",function(){
    state.filteredData = state.data.sort(function(a,b){return b.count-a.count;})
    yScale.domain(state.filteredData.map(d=>d.activity));
    bar.transition()
        .duration(750)
        .delay(function(d, i) { return i * 50; })
        .attr("transform", function(d, i) { return "translate("+margin.left+"," + yScale(d.activity) + ")"; });

  })

  svg
  .append("g")
  .attr("class", "axis")
  .attr("transform", `translate(${margin.left}, 0)`)
  .call(yAxis);



}


d3.csv("squirrelActivities.csv", d3.autoType).then(data => {
  console.log(data);
  state.data = data;
  state.filteredData = data;
  init();


});