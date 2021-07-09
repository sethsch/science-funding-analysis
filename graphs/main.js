import { boxplot, boxplotStats } from './lib/d3-boxplot-0.7.6/src/boxplot.js';
import { sortableBar } from './sortableBar.js'


var state = {
  data : [],
  fileredData : [],
  network: [],
}

const mainDims = {
  width : window.innerWidth * 0.4,
  height : window.innerHeight / 1.5,
  paddingInner : 0.2,
  margin : { top: 20, bottom: 40, left: 75, right: 40 }
} 


const width = window.innerWidth * 0.5,
height = window.innerHeight *0.5,
paddingInner = 0.2,
margin = { top: 20, bottom: 40, left: 75, right: 40 };

const netWidth = window.innerWidth * 0.4,
  netHeight = window.innerHeight * 0.5;

const panelDims = {
  width: width,
  height: height,
  paddingInner: paddingInner,
  margin: margin
  
}


var chartArea = d3.select("panel-area").append("g")
.attr("width",width )
.attr("height",height )


var panels = chartArea.selectAll(".panel")
  .data([0,1,2,3,4,5])
  .enter()
  .append("svg")
  .attr("id",d=>"panel_"+String(d))
  .attr("class","panel")
  .attr("width",width/6 )
  .attr("height",height)
  .attr("transform", function(d, i) { return "translate("+width/6 * i +",0)"; });

d3.selectAll(".panel")
  .append("rect")
  //.attr('x', function(d,i) {return window.innerWidth/6 * i;})
  //.attr('y', 0)
  .attr("class","bluerect")
  .attr("width",width/6 * 0.95)
  .attr("height",height)
  .attr("fill","blue")
  //.attr("opacity",0)


d3.csv("squirrelActivities.csv", d3.autoType).then(data => {
  console.log(data);
  state.data = data;
  state.filteredData = data;
  sortableBar(state,"#d3-container",mainDims);
  //sortableBar(state,"#panel_3",panelDims)

  

});


d3.csv("/data/researchAreas_funder_associations.csv",d3.autoType).then(data=> {
  var cellWidth = 80;
  var cellHeight = 33;

  var funders = ["Mellon",	"Packard",	"Gates",	"OSF",	"RWJ",	"Hewlett",	"Ford"]
  
  d3.selectAll("thead td").data(funders).on("click", function(e) {
    //console.log("click",e,data)
    let col = e.target.innerHTML
    tr.sort(function(a, b) { return b[col] - a[col]; });
  });
  
  var tr = d3.select("tbody").selectAll("tr")
      .data(data)
    .enter().append("tr");
  
  tr.append("th")
      .attr("class","subj-col")
      .text(function(d) { return d.subject; });
  
  tr.selectAll("td")
      .data(function(d) { return funders.map(function(k) { return d[k]  }); })
    .enter().append("td").append("svg")
      .attr("class","cell-space")
      .attr("width", cellWidth)
      .attr("height", cellHeight)
    .append("rect")
      .attr("height", cellHeight)
      .attr("width", function(d) { return d * cellWidth; })

  tr.selectAll(".cell-space")
    .append("text")
      .attr("class","perc-text")
      .attr("text-anchor","middle")
      .attr("x",cellWidth/2)
      .attr("y",cellHeight/2)
      .attr("dy",".35em")
      .text(d=>d3.format(".0%")(d))  // rounded percentage, "12%"



})

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);


function drag(simulation) {
  
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
  
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}
state.network = graph;
//console.log("global state",state);



const links = state.network.links.map(d => Object.create(d));
const nodes = state.network.nodes.map(d => Object.create(d));
const radius = 5;
const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(netWidth / 2, netHeight / 2));

const svg = d3.select("#network-graph").append("svg")
    .attr("width",netWidth)
    .attr("height",netHeight)

const link = svg.append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
  .selectAll("line")
  .data(links)
  .join("line")
    .attr("stroke-width", d => Math.sqrt(d.value))
    .attr("class","link-line")
    .attr("id",d=>"link_"+d.source.index+"_"+d.target.index)

const node = svg.append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
  .selectAll("circle")
  .data(nodes)
  .join("circle")
    .attr("r", radius)
    .attr("id",d=>d.index)
    .attr("fill", d=>colorScale(d.group))
    .call(drag(simulation));

const texts = svg.selectAll("text.label")
    .data(nodes)
    .enter().append("text")
    .attr("class", "label")
    .attr("id",d=>d.index)
    .attr("fill", "black")
    .attr("font-size","0px")
    .text(function(d) {  return d.id;  });

//node.append("title")
//    .text(d => d.id);

// maintain a list of active links for hover behavior
var link_dests = [];

node.on("mouseenter",function(){
  d3.select(this)
    .transition()
    .duration(500)
    .attr("r",radius*2)

  var node_id = d3.select(this).attr("id")
  //console.log("node id",node_id)

  d3.selectAll(".link-line")
    .attr("stroke",function(e){
      //console.log("e",e)
      if(String(e.source.index) === String(node_id) ||String(e.target.index) === String(node_id) ){
        link_dests.push(String(e.source.index))
        link_dests.push(String(e.target.index))

        return "black";
      }
      else{return "#999";}
      //console.log("link console log",e.source,e.target)
    })
    //.attr("stroke","blue")

  d3.selectAll(".label")
    .transition()
    .duration(800)
    .delay(400)
    .attr("font-size",function(e){
      //console.log(e,'linkdest',link_dests)
      if(String(e.index) === String(node_id) ){
        return "14px";
      }
      else if (link_dests.includes(String(e.index))){
        return "10px";
      }
      else{return "0px";}
    })
    .attr("transform",function(d){
      //console.log(e,'linkdest',link_dests)
      if(String(e.index) === String(node_id) ){
        return "translate(" + (d.x + 5) + "," + (d.y + 10) + ")";
      }
    })
})

node.on("mouseout",function(){
  // clear active link list
  link_dests = [];      
  d3.select(this)
    .transition()
    .duration(250)
    .attr("r",radius)

  d3.selectAll(".link-line")
    .attr("stroke","#999")

  d3.selectAll(".label")
    .attr("font-size","0px")
    .attr("transform", function(d) {
      return "translate(" + (d.x - 5) + "," + (d.y - 10) + ")";
  })

})

simulation.on("tick", () => {
  link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

  node
    .attr("cx", function(d) { return d.x = Math.max(radius, Math.min(netWidth - radius, d.x)); })
    .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(netHeight - radius, d.y)); });

  texts
  .attr("transform", function(d) {
      return "translate(" + (d.x - 5) + "," + (d.y - 10) + ")";
  });
});

//invalidation.then(() => simulation.stop());


//// SUBJECTS TABLE SCRATCH




d3.json("funderSubjStats.json",d3.autoType).then( data => {
  console.log("json data",data)





  const osf = data['osf']['Research Areas']['Government & Law']
  const citations = osf['citation_stats'][9].value
  const plotWidth = 500;
  const margin = {left: 20, right: 20}
  const plotHeight = 250;
  const bandwidth = 40;
  

    

  let summary = d3.select("#summary")
    .append("g")

   
    
    
  summary.data(osf["top_25_kw"])
    .enter()
    .append("text")
    .attr("class","kw-text")
    //.attr("y",(d,i)=>10+i*20)
    .text(d=>d.keyword+" ("+String(d.value)+")")




 

  console.log("did we get osf?",osf)

  let svg = d3.select("#boxplot").append("svg").attr("width",plotWidth).attr("height",plotHeight)

  let stats = boxplotStats(citations)

  console.log("stats",stats)

  let x = d3.scaleLinear()
    .domain(d3.extent(citations))
    .range([margin.left, plotWidth-margin.right*2])

  let plot = boxplot()
    .scale(x)
    .showInnerDots(false)
    .opacity(0.8)
    .bandwidth(bandwidth)
    .boxwidth(8)

  svg.append("g").attr('transform',`translate(${margin.left}, 0)`).datum(stats).call(plot)

  svg.append('g')
  .attr('class', 'axis')
  .attr('transform', `translate(${margin.left}, ${bandwidth-10})`)
  .attr('color', '#888')
  .call(d3.axisBottom()
          .scale(x)
          .ticks(4)
          .tickValues(stats.fiveNums.slice(1,5)) 
        )

  d3.selectAll(".point").attr("r",3)


 

})







