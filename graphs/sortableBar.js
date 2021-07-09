
export function sortableBar(state,div_id,dims) {

  // data load
  // reference for d3.autotype: https://github.com/d3/d3-dsv#autoType


  /** CONSTANTS */
  // constants help us reference the same values throughout our code
 



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
      .range([dims.margin.left,dims.width - dims.margin.right]);
      
    /** MAIN CODE */
    svg = d3
      .select(div_id)
      .append("svg")
      .attr("width", dims.width + dims.margin.left + dims.margin.right)
      .attr("height", dims.height + dims.margin.top + dims.margin.bottom)
      .append("g")
    



  


    draw()

  }




  function draw(){

    yScale = d3
      .scaleBand()
      .domain(state.filteredData.map(d => d.activity))
      .range([dims.height - dims.margin.bottom, dims.margin.top])
      .paddingInner(dims.paddingInner);

    // reference for d3.axis: https://github.com/d3/d3-axis
    yAxis = d3.axisLeft(yScale)
        .ticks(state.filteredData.length)
        .tickSizeInner(5)
        .tickSizeOuter(5);

    var bar = svg.selectAll(".bar")
    .data(state.filteredData)
    .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d, i) { return "translate("+dims.margin.left+"," + yScale(d.activity) + ")"; });
    
    bar.append("rect")
      .attr("class","bg-rect")
      .attr("height",yScale.bandwidth())
      .attr("width",dims.width)
      .attr("fill","lightgray")
      .attr("opacity",0.3)

    bar.append("rect")
      .attr("class","bar-rect")
      .attr("height", yScale.bandwidth())
      .attr("width", d=>xScale(d.count));

    bar.append("text")
      .attr("text-anchor", "end")
      .attr("x", function(d) { return xScale(d.count) - 6; })
      .attr("y", yScale.bandwidth() / 2)
      .attr("dy", ".35em")
      .attr("fill","white")
      .text(function(d, i) { return d.count; })
    

    d3.selectAll(".sortbutton").on("click",function(){

      if (this.id === "descending"){
        state.filteredData = state.data.sort(function(a,b){return b.count-a.count;})
      }
      else {
        state.filteredData = state.data.sort(function(a,b){return a.count-b.count;})

      }
      
      yScale.domain(state.filteredData.map(d=>d.activity));

      svg.select('.axis')
              .transition()
                      .duration(750)
              .call(yAxis);

      bar.transition()
          .duration(750)
          .delay(function(d, i) { return i * 50; })
          .attr("transform", function(d, i) { return "translate("+dims.margin.left+"," + yScale(d.activity) + ")"; });

          
      /*svg
          .append("g")
          .attr("class", "axis")
          .attr("transform", `translate(${dims.margin.left}, 0)`)
          .call(yAxis);*/
    })

    svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${dims.margin.left}, 0)`)
    .call(yAxis);



  }


  init();
 

}