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

function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
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
  /*
  d3.selectAll(".funder-table-head td").data(funders).on("click", function(e) {
    //console.log("click",e,data)
    let col = e.target.innerHTML
    tr.sort(function(a, b) { return b[col] - a[col]; });
  });
  
  var tr = d3.select("#funder-table-body").selectAll("tr")
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
*/


})

const colorScale = d3.scaleOrdinal(d3.schemePaired);


function toTitleCase(string = '') {
  const regex = /^[a-z]{0,1}|\s\w/gi;

  string = string.toLowerCase();

  string.match(regex).forEach((char) => {
    string = string.replace(char, char.toUpperCase());
  });

  return string;
}


//invalidation.then(() => simulation.stop());


//// SUBJECTS TABLE SCRATCH




d3.json("funderSubjStats.json",d3.autoType).then( data => {
  console.log("json data",data)




  let subj_area = "Business & Economics"
  const osf = data['osf']['Research Areas'][subj_area]
  var citations = osf['citation_stats'][9].value
 
  

  d3.select("#subject-title").text(subj_area
                                  //+ " - "
                                  //osf['num_pubs']+" publications, "+
                                  //d3.format(".0%")(osf['pct_of_all'])
                                   )

  //// Publications Graphic

  let pubPlotHeight = 36*7
  let pubPlotWidth = 800
  var pub_svg = d3.select("#pubs-img-graph").append("svg").attr("width",pubPlotWidth).attr("height",pubPlotHeight)
    
  let pub_list = [...Array(100).keys()]
  console.log("publist",pub_list)

  let base_pub_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-file-text" viewBox="0 0 16 16"><path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"/><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/></svg>'
  let green_pub_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" class="bi bi-file-text" viewBox="0 0 16 16"><rect x="2" y="1" width="12" height="14" style="fill: rgb(173, 212, 174);"></rect><path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"/><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/></svg>'
  
  // filters go in defs element
var defs = pub_svg.append("defs");
    // create filter with id #drop-shadow
  // height=130% so that the shadow is not clipped
  var filter = defs.append("filter")
  .attr("id", "drop-shadow")
  .attr("height", "110%");

  // SourceAlpha refers to opacity of graphic that this filter will be applied to
  // convolve that with a Gaussian with standard deviation 3 and store result
  // in blur
  filter.append("feGaussianBlur")
  .attr("in", "SourceAlpha")
  .attr("stdDeviation",10)
  .attr("result", "blur");

  // translate output of Gaussian blur to the right and downwards with 2px
  // store result in offsetBlur
  filter.append("feOffset")
  .attr("in", "blur")
  .attr("dx", 4)
  .attr("dy", 4)
  .attr("result", "offsetBlur");

  // overlay original SourceGraphic over translated blurred opacity by using
  // feMerge filter. Order of specifying inputs is important!
  var feMerge = filter.append("feMerge");

  feMerge.append("feMergeNode")
  .attr("in", "offsetBlur")
  feMerge.append("feMergeNode")
  .attr("in", "SourceGraphic");
  
  pub_svg.selectAll(".icons")
    .data(pub_list)
    .enter()
    .append("g")
    .append("svg")
    .attr("height",36)
    .attr("width",36)
    .attr("class","icons")
    //.style("filter", "url(#drop-shadow)")
    .attr("x",function(i) {
      if (i < 20) { return 6 + (i*36);}
      else if (i<40){ return 6 + (i-20)*36;}
      else if (i<60){ return 6 + (i-40)*36;}
      else if (i<80){ return 6 + (i-60)*36;}
      else {return 6 + (i-80)*36;}
    })
    .attr("y",function(i){
      console.log("y val i",i)
      if (i < 20) { return 10;}
      else if (i<40){ return 52;}
      else if (i<60){ return 94;}
      else if (i<80){ return 136;}
      else {return 178;}
    })
    .html(function(i){
      if (i < osf['num_pubs']){
        return green_pub_icon;
      }
      else {return base_pub_icon;}
    })

    pub_svg.append("text")
      .attr("class","pubs-text")
      .attr("x","90%")
      .attr("y","92%")
      .attr("dominant-baseline","middle")
      .attr("text-anchor","end")
      .attr("font-size","24px")
      .text(`${osf['num_pubs']} of 1,057 publications`)


  
   



  let kw = d3.select("#keywords-panel")
    .append("p")

  function makeParagraph(kw,attr_name,num_items,values=false){
    var p = "";
    var list_len;
    // if the specified number of items to print is more than the 
    // available items in the entry list, revert to the entry list's length
    if (num_items > kw.length) {
      list_len = kw.length;
    }
    else { list_len = num_items;}
  
    
    for (let i = 0; i < list_len; i++){
      if (i !== list_len-1){
        if (values != false) {
          p = p+kw[i][attr_name]+" ("+kw[i].value+"), "
        }
        else { p = p+kw[i][attr_name]+", "}

      }
      else {
        if (values != false) {
          p = p+kw[i][attr_name]+" ("+kw[i].value+")"
        }
        else {p = p+ kw[i][attr_name]}
      }
    }
    return p;

  }
  kw.text(makeParagraph(osf['top_50_kw'],"keyword",30,false));

  let exceptions = ["Open Society","Soros"]
  let top_cofunders = osf['top_cofunders']
  for (let i = 0;   i < exceptions.length; i++) {
    top_cofunders = top_cofunders.filter( d => ! String(d.funder).includes(exceptions[i]))
  }

  console.log("funder table",top_cofunders.slice(0,10))
  

  let cofunder_table = d3.select("#top-funders").append("tbody")
  let cof_rows = cofunder_table
    .selectAll("tr")
    .data(top_cofunders.slice(0,10))
    .enter()
    .append("tr");
  let cof_cells =  cof_rows.selectAll("td")
  // each row has data associated; we get it and enter it for the cells.
      .data(function(d,i) {
          console.log(d);
          return [d.funder,d.value];
      })
      .enter()
      .append("td")
      .attr("class",(d,i) => i == 0 ? "name-col" : i == 1 ? "pub-col" : "rank-col")
      .text(function(d) {
          return d;
      });

 

 
  //let cofunders = d3.select("#summary")
  //    .append("p")
  //cofunders.text(makeParagraph(osf['top_cofunders'],"funder",10,true))
  let top_journals = osf['journals_20']
  let journals_table = d3.select("#top-journals").append("tbody")
  let jour_rows = journals_table
    .selectAll("tr")
    .data(top_journals.slice(0,10))
    .enter()
    .append("tr");
  let jour_cells =  jour_rows.selectAll("td")
  // each row has data associated; we get it and enter it for the cells.
      .data(function(d,i) {
          console.log(d);
          return [d.journal,d.value];
      })
      .enter()
      .append("td")
      .attr("class",(d,i) => i == 0 ? "name-col" : i == 1 ? "pub-col" : "rank-col")
      .text(function(d) {
          return toTitleCase(String(d));
      });
 
  //let journals = d3.select("#summary")
  //  .append("p")
  //journals.text(toTitleCase(makeParagraph(osf['journals_20'],'journal',10,true)))
  

  let top_authors = osf['authors_top25']
  let authors_table = d3.select("#top-authors").append("tbody")
  let auth_rows = authors_table
    .selectAll("tr")
    .data(top_authors.slice(0,10))
    .enter()
    .append("tr");
  let auth_cells =  auth_rows.selectAll("td")
  // each row has data associated; we get it and enter it for the cells.
      .data(function(d,i) {
          console.log(d);
          return [d.author,d.value];
      })
      .enter()
      .append("td")
      .attr("class",(d,i) => i == 0 ? "name-col" : i == 1 ? "pub-col" : "rank-col")
      .text(function(d) {
          return toTitleCase(String(d));
      });


  //let authors = d3.select("#summary")
  //  .append("p")

  //authors.text(makeParagraph(osf['authors_top25'],'author',15,true))
   
    
  



 

console.log("did we get osf?",osf)

const plotWidth = 500;
const margin = {left: 40, right: 40, top: 20, bottom: 20}
const plotHeight = 250;
const bandwidth = 60;

let svg = d3.select("#boxplot").append("svg").attr("width",plotWidth).attr("height",plotHeight)

//citations = citations.filter(d=>d>0)

/*let stats = boxplotStats(citations)
 // render annotations
 const fiveNums = stats.fiveNums
 const iqr = stats.iqr
 const step = stats.step
 const whiskers = stats.whiskers
 const outliers = stats.points.filter(d => d.outlier)
 const farouts = stats.points.filter(d => d.farout)
 const fences = stats.fences.slice()
 const sixNums = fiveNums.slice()
 sixNums.push(d3.mean(citations))*/

//console.log("five nums",fiveNums)
//console.log("stats",stats)

let x = d3.scaleLinear()
  .domain(d3.extent(citations))
  .range([margin.left, plotWidth-margin.right])
/*
//const fencePath_x = fence => `M${x(fence.start)},0 L${x(fence.start)},5 L${x(fence.end)},5 L${x(fence.end)},0`
const fencePath = fence => `M0,${x(fence.start)} L5,${x(fence.start)} L5,${x(fence.end)} L0,${x(fence.end)}`


/*let x = d3.scaleLinear()
  .domain(d3.extent(citations))
  .range([plotHeight-margin.bottom,margin.top])


let plot = boxplot()
  .scale(x)
  .showInnerDots(false)
  .opacity(0.8)
  .bandwidth(bandwidth)
  .boxwidth(bandwidth/3)
  .vertical(true)



  svg.append('g')
    .attr('class', 'data')
    .attr('transform', `translate(${margin.left}, 0)`)
  svg.append('g')
    .attr('class', 'five-nums-ticks')
    .attr('transform', `translate(${margin.left}, 0)`)
  svg.append('g')
    .attr('class', 'five-nums-labels')
    .attr('transform', `translate(${margin.left}, 0})`)
  svg.append('g')
    .attr('class', 'fences-ticks')
    .attr('transform', `translate(${margin.left}, 0)`)
  svg.append('g')
    .attr('class', 'fences-labels')
    .attr('transform', `translate(${margin.left}, 0)`)
  svg.append('g')
    .attr('class', 'plot')
    .attr('transform', `translate(${margin.left}, 10})`)
  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(${margin.left}, ${plotHeight - margin-bottom})`)
    .attr('color', '#888')
    .call(d3.axisLeft().scale(x))
  svg.select('.axis').selectAll('line')
    .attr('stroke', '#888')
  svg.select('.axis').selectAll('path')
    .attr('stroke', '#888')
  svg.select('.axis').selectAll('text')
    .attr('fill', '#888')
    .style('font-family', 'sans-serif')
    .style('font-size', '11')

svg.select(".plot").datum(stats).transition().attr("color","steelblue").call(plot)*/





/* data dots
const dots = svg.select('.data').selectAll('circle').data(stats.points, d => d.value)
dots.enter()
  .append('circle')
  .attr('cx', d => x(d.value))
  .attr('r', 0)
  .attr('opacity', 0.0)
  .attr('fill', '#888')
  .merge(dots)
  .transition()
  .attr('cx', d => x(d.value))
  .attr('r', 3)
  .attr('opacity', 0.8)
dots.exit()
  .transition()
  .attr('r', 0)
  .attr('opacity', 0.0)
  .remove()


  // five numbers + mean
  const fiveNumsTicks = svg.select('.five-nums-ticks').selectAll('line').data(sixNums)
  fiveNumsTicks.enter()
    .append('line')
    .attr('y1', (_, i) => i === 5 ? -24 : -8)
    .attr('y2', 0)
    .attr('stroke', '#888')
    .attr('x1', x(fiveNums[2]))
    .attr('x2', x(fiveNums[2]))
    .merge(fiveNumsTicks)
    .transition()
    .attr('x1', x)
    .attr('x2', x)
  fiveNumsTicks.exit()
    .remove()

  const fiveNumsLabels = svg.select('.five-nums-labels').selectAll('text').data(sixNums)
  fiveNumsLabels.enter()
    .append('text')
    .style('font-family', 'sans-serif')
    .style('font-size', '13')
    .attr('fill', '#888')
    .attr('text-anchor', 'start')
    .text((_, i) => ['min', 'q1', 'q2', 'q3', 'max', 'mean'][i])
    .attr('transform', (_, i) => `translate(${x(fiveNums[2]) + 3}, ${i === 5 ? -16 : 0}) rotate(-45)`)
    .merge(fiveNumsLabels)
    .transition()
    .attr('transform', (d, i) => `translate(${x(d) + 3}, ${i === 5 ? -16 : 0}) rotate(-45)`)
  fiveNumsLabels.exit()
    .remove()

  /*fences
  const fencesTicks = svg.select('.fences-ticks').selectAll('path').data(fences)
  fencesTicks.enter()
    .append('path')
    .attr('fill', 'none')
    .attr('stroke', '#888')
    .attr('d', fencePath)
    .merge(fencesTicks)
    .transition()
    .attr('d', fencePath)
  fencesTicks.exit()
    .remove()

  const fencesLabels = svg.select('.fences-labels').selectAll('text').data(fences)
  fencesLabels.enter()
    .append('text')
    .style('font-family', 'sans-serif')
    .style('font-size', '13')
    .attr('fill', '#888')
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'hanging')
    .attr('transform', `translate(${x(fiveNums[2]) + 3}, 0)`)
    .text((d, i) => ['outer', 'inner', 'iqr', 'inner', 'outer'][i])
    .merge(fencesLabels)
    .transition()
    .attr('transform', d =>`translate(${x((d.start + d.end) * 0.5) + 3}, 0)`)
  fencesLabels.exit()
    .remove()*/


  svg
    .append('g')
    .attr('class', 'plots')

  
    const dataset = [citations,citations,citations,citations]
    const stats = dataset.map(function(d) {
      let s = boxplotStats(d);
      s["mean"] = d3.mean(d);
      return s;
    
    })
    console.log("stats",stats)
 




    const H = plotHeight,
          W = plotWidth,
          M = ({L: 5, R: 5, T: 5, B: 5})
    const vertical = true;
    const minimalStyle = false;
    const useSymbolTick = true;
    const colorOption = true;
    const jitter = 0.5;
    var opacity = 0.7;
    const colors = d3.schemeCategory10
    const scale = d3.scaleLinear()
      .domain([0,d3.max(citations,d=>d)])
      .range(vertical ? [H - M.T - M.B, M.T] : [M.L, W - M.L - M.R])

    const band = d3.scaleBand()
      .domain(d3.range(stats.length))
      .range(vertical == true ? [M.L, W - M.L - M.R] : [M.T, H - M.T - M.B])
      .paddingInner(minimalStyle == true ? 0 : 0.3)
      .paddingOuter(minimalStyle == true ? 2 : 0.2)
    const plot = boxplot()
      .scale(scale)
      .jitter(jitter)
      .opacity(opacity)
      .showInnerDots(false)
      //.symbol(useSymbolTick == true ? d3.boxplotSymbolTick : d3.boxplotSymbolDot)
      .bandwidth(band.bandwidth())
      .boxwidth(minimalStyle == true ? 6 : 30)
      .vertical(vertical)
      .key(d => d)

    svg.select('g.plots')
      .attr('transform', 'translate(' + [M.L, M.T] + ')')
      .selectAll('.plot').data(stats)
      .join('g')
      .attr('class', 'plot')
      .transition()
      .attr('transform', (_, i) => `translate(${vertical == true ? [band(i), 0] : [0, band(i)]})`)
      .attr('color', (_, i) => colorOption == true ? colors[i / 2|0] : '#000')
      .call(plot)

  const fiveNumsTicks = svg.select("g.plots").selectAll(".plot")
    .join('g')
    .selectAll("line")
    .data(stats)
    
  fiveNumsTicks
    .enter()
    .append("line")
    .attr("class","plot-annotations")
    .transition()
    .attr("y1",d=>scale(d.fiveNums[2]))
    .attr("y2",d=>scale(d.fiveNums[2]))
    .attr("x1",band.bandwidth()/4)
    .attr("x2",0)
    .attr('stroke', '#888')
    .merge(fiveNumsTicks)
    .transition()
    .attr("x1",scale)
    .attr("x2",scale)

  fiveNumsTicks.exit().remove()




    /*fiveNumsTicks = svg.select('.five-nums-ticks').selectAll('line').data(sixNums)
    fiveNumsTicks.enter()
      .append('line')
      .attr('y1', (_, i) => i === 5 ? -24 : -8)
      .attr('y2', 0)
      .attr('stroke', '#888')
      .attr('x1', x(fiveNums[2]))
      .attr('x2', x(fiveNums[2]))
      .merge(fiveNumsTicks)
      .transition()
      .attr('x1', x)
      .attr('x2', x)
    fiveNumsTicks.exit()
      .remove()
  
    const fiveNumsLabels = svg.select('.five-nums-labels').selectAll('text').data(sixNums)
    fiveNumsLabels.enter()
      .append('text')
      .style('font-family', 'sans-serif')
      .style('font-size', '13')
      .attr('fill', '#888')
      .attr('text-anchor', 'start')
      .text((_, i) => ['min', 'q1', 'q2', 'q3', 'max', 'mean'][i])
      .attr('transform', (_, i) => `translate(${x(fiveNums[2]) + 3}, ${i === 5 ? -16 : 0}) rotate(-45)`)
      .merge(fiveNumsLabels)
      .transition()
      .attr('transform', (d, i) => `translate(${x(d) + 3}, ${i === 5 ? -16 : 0}) rotate(-45)`)
    fiveNumsLabels.exit()
      .remove()*/



let citation_info = d3.select("#citation-stats").append("p")

// consider using pre-computed or later computed if we're going to drop the 0's
let citation_infoText = "<ul><li>% of Publications w. 0 citations to date: "+
                                  d3.format(".0%")(osf["citation_stats"][1].value) + "</li>" +
                        "<li>Top 25%: " + osf["citation_stats"][4].value + "+ citations </li>" +
                        "<li>Top 10%: " + String(parseInt(osf["citation_stats"][6].value)) + "+ citations</li></ul>"



citation_info.html(citation_infoText);



/// DENSITY PLOT
  // set the dimensions and margins of the graph
  var densityMargin = { top: 30, right: 30, bottom: 30, left: 50 },
    densityWidth = 480 - densityMargin.left - densityMargin.right,
    densityHeight = 240 - densityMargin.top - densityMargin.bottom;

  // append the svg object to the body of the page
  var dens_svg = d3.select("#density-plot")
    .append("svg")
    .attr("width", densityWidth + densityMargin.left + densityMargin.right)
    .attr("height", densityHeight + densityMargin.top + densityMargin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + densityMargin.left + "," + densityMargin.top + ")");



 /* YOUR LIST */
  

  // add the x Axis
  var densXscale = d3.scaleLinear()
    .domain([0, d3.max(citations,d=>d)])
    .range([0, densityWidth]);
    dens_svg.append("g")
    .attr("transform", "translate(0," + densityHeight + ")")
    .call(d3.axisBottom(densXscale));

  // set the parameters for the histogram
  var histogram = d3.histogram()
  .value(function(d){return d;})   // I need to give the vector of value
  .domain(densXscale.domain())  // then the domain of the graphic
  .thresholds(densXscale.ticks(10)); // then the numbers of bins

  // And apply this function to data to get the bins
  var bins = histogram(citations);

  // Y axis: scale and draw:
  var densYscale = d3.scaleLinear()
  .range([densityHeight, 0]);
  densYscale.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
  dens_svg.append("g")
  .call(d3.axisLeft(densYscale));

  // append the bar rectangles to the svg element
  dens_svg.selectAll("rect")
  .data(bins)
  .enter()
  .append("rect")
    .attr("x", 1)
    .attr("transform", function(d) { return "translate(" + densXscale(d.x0) + "," + densYscale(d.length) + ")"; })
    .attr("width", function(d) { return densXscale(d.x1) - densXscale(d.x0) -1 ; })
    .attr("height", function(d) { return densityHeight - densYscale(d.length); })
    .style("fill", function(d){ if(d.x0<140){return "orange"} else {return "#69b3a2"}})

  // Append a vertical line to highlight the separation
  dens_svg
  .append("line")
  .attr("x1", densXscale(40) )
  .attr("x2", densXscale(40) )
  .attr("y1", densYscale(0))
  .attr("y2", densYscale(45))
  .attr("stroke", "grey")
  .attr("stroke-dasharray", "4")
  dens_svg
  .append("text")
  .attr("x", densXscale(40))
  .attr("y", densYscale(50))
  .text("threshold: 140")
  .style("font-size", "15px")






///// OPEN ACCESS

let oa_plotHeight = 60;


let oa_svg = d3.select("#oa-stats")
.append("svg")
.attr("width","100%")
.attr("height",oa_plotHeight)
.style("display", "block");

var oa_plotWidth = $("#oa-stats").parent().width();


//console.log(osf,"at oa sumary break")
// TO DO: re-arrange based on keys rather htan index to make no-oa first or last...
let oa = osf["oa_summary"]
//let oa = [osf["oa_summary"][2],osf["oa_summary"][0],osf["oa_summary"][3],osf["oa_summary"][1]]



function stack(data,name_col){
  const total = d3.sum(data, d => d.value);
  let value = 0;
  return data.map(d => ({
    name: d[name_col],
    value: d.value / total,
    startValue: value / total,
    endValue: (value += d.value) / total
  }));
}
var order = ["NO_OA", "PUBLISHER_HOSTED", "AUTHOR_HOSTED", "BOTH"];
let ordered_oa = _.sortBy(oa, function(obj){ 
  return _.indexOf(order, obj.oa_type);
});
// reorder oa summary var into right order
let oa_stack = stack(ordered_oa,"oa_type");


console.log("did we sort oa",ordered_oa,"stacked",oa_stack)

let oa_xScale = d3.scaleLinear([0, 1], [margin.left, oa_plotWidth - margin.right])
let oa_color = d3.scaleOrdinal()
    .domain(oa_stack.map(d => d.name))
    .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), oa_stack.length))

let oa_formatPercent = x.tickFormat(null, "%")

var legend_svg = d3.select("#oa-legend").append("svg").attr("height",80).attr("width",400)
  
legend_svg
  .selectAll("rect")
  .data(oa_stack)
  .join("rect")
  .attr("stroke","white")
  .attr("fill", d => oa_color(d.name))
  .attr("x", (d,i) => (i * 100))
  .attr("y", 2)
  .attr("width",75)
  .attr("height",25)


  legend_svg.selectAll(".legend-labels")
  .data(oa_stack)
  .join("text")
  .attr("class","legend-labels")
  .attr("font-family", "sans-serif")
  .attr("font-size", 10)
  .attr("fill","black")
  .attr("x", (d,i) => (i * 100) + 2)
  .attr("y", 40)
  .call(text => text.append("tspan")
    .attr("font-weight", "bold")
    .text(d =>  d.name.replace("_HOSTED","").replace("NO_OA","PAYWALLED"))
  )

oa_svg.append("g")
  .attr("stroke", "white")
  .selectAll("rect")
  .data(oa_stack)
  .join("rect")
  .attr("fill", d => oa_color(d.name))
  .attr("x", d => oa_xScale(d.startValue))
  .attr("y", 2)
  .attr("width", d => oa_xScale(d.endValue) - oa_xScale(d.startValue))
  .attr("height", oa_plotHeight * 0.75 )
  .append("title")
  .text(d => `${d.name}
  ${oa_formatPercent(d.value)}`);

oa_svg.append("g")
.attr("font-family", "sans-serif")
.attr("font-size", 11)
.selectAll("text")
.data(oa_stack)
//.data(oa_stack.filter(d => oa_xScale(d.endValue) - oa_xScale(d.startValue) > 40))
.join("text")
.attr("fill", d => d3.lab(oa_color(d.name)).l < 50 ? "white" : "black")
.attr("transform", d => `translate(${oa_xScale(d.startValue) + 6}, 6)`)
.call(text => text.append("tspan")
    .attr("font-weight", "bold")
    .attr("y", d=> d.value < 0.1 ? "4.75em": "1.9em")
    .attr("x", d=> d.value < 0.1 ? "-1.25em": "0")

    .text(d =>  d.name.replace("_HOSTED","").replace("NO_OA","PAYWALLED"))
  )
.call(text => text.append("tspan")
    .attr("x", 0)
    .attr("y", "0.9em")
    .attr("fill-opacity", 0.7)
    .text(d => oa_formatPercent(d.value)));

  
   

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
    
    



    function getRandomInt(max) {
      return Math.floor(Math.random() * max);
    }
    //var nodes = []
    var nodes = osf['nodes']
    /*var node_vals = []
    for (let i = 0; i < osf['nodes'].length; i++){
      let val = osf['top_cofunders'].filter(d=>d.funder === osf['nodes'][i])
      
      let a = {"id":osf['nodes'][i], "group": getRandomInt(8), "value": val[0].value}
      nodes.push(a)
      
    }*/
    //console.log("console logging...","node vals",nodes)
    
    nodes = nodes.map(d => Object.create(d));
    const links = osf['links'].map(d=>Object.create(d))


  

    


    const circScale = d3.scaleSqrt()
    .domain([1, d3.max(nodes,d=>d.value)])
    .range([6, 20]);

    const linkScale = d3.scaleSqrt()
    .domain([1, d3.max(links,d=>d.value)])
    .range([0.25, 4]);

    //const links = state.network.links.map(d => Object.create(d));
    //const nodes = state.network.nodes.map(d => Object.create(d));
    const radius = 5;
    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-90))
        .force("center", d3.forceCenter(netWidth / 2, netHeight / 2))

  
    
    const net_svg = d3.select("#network-graph").append("svg")
        .attr("width",netWidth)
        .attr("height",netHeight)
        .attr("id","network-svg")
    
    const link = net_svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
        .attr("stroke-width", d => linkScale(d.value))
        .attr("class","link-line")
        .attr("stroke-opacity", 0.6)
        .attr("id",d=>"link_"+d.source.index+"_"+d.target.index)
    


      //Toggle stores whether the highlighting is on
      var toggle = 0;
      //Create an array logging what is connected to what
      var linkedByIndex = {};
      for (let i = 0; i < nodes.length; i++) {
          linkedByIndex[i + "," + i] = 1;
      };
      links.forEach(function (d) {
          linkedByIndex[d.source.index + "," + d.target.index] = 1;
      });
      //This function looks up whether a pair are neighbours
      function neighboring(a, b) {
          return linkedByIndex[a.index + "," + b.index];
      }
      function connectedNodes() {
          if (toggle == 0) {
              //Reduce the opacity of all but the neighbouring nodes
              let d = d3.select(this).node().__data__;
              console.log("this is what the d on click is in connected nodes",d)
              //.node().__data__;
              node.style("opacity", function (o) {
                  return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
              });
              link.style("opacity", function (o) {
                  return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
              });
              //Reduce the op
              toggle = 1;
          } else {
              //Put them back to opacity=1
              node.style("opacity", 1);
              link.style("opacity", 1);
              toggle = 0;
          }
      }
      //and add one line to the node set up

    const info_box = d3.select("#community-info")


    const node = net_svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
        .attr("r", d=>circScale(d.value))
        .attr("id",d=>d.index)
        .attr("name",d=>d.id)
        .attr("group",d=>d.group)
        .attr("fill", d=>colorScale(d.group))
        .call(drag(simulation))
        .on('dblclick', connectedNodes); //Added code 
    
        
    const texts = net_svg.selectAll("text.label")
        // TO DO: edit to ensure the labels for the largest nodes and the main targets are present
        .data(nodes)
        .enter().append("text")
        .attr("class", "label")
        .attr("id",d=>d.index)
        .attr("group",d=>d.group)
        .attr("fill", "black")
        // TO DO: edit to ensure the labels for the largest nodes and the main targets are present
        .attr("font-size",function(d){
          if (String(d.id).includes("Open Society") || String(d.id).includes("Soros")){
            return "0.8em";
          }
          else {return "0px";}
        })
        .text(function(d) {  return d.id  });

    
    //node.append("title")
    //    .text(d => d.id);
    
    // maintain a list of active links for hover behavior
    var link_dests = [];
    
    node.on("mouseenter",function(){
      d3.select(this)
        .transition()
        .duration(500)
        .attr("r",d=>circScale(d.value)*1.5)
    
      var node_id = d3.select(this).attr("id")
      var node_name = d3.select(this).attr("name")
      //console.log("node id",this)
    
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
        //.duration(800)
        //.delay()
        .attr("font-size",function(e){
          //console.log("the nodename on mouse enter",e.id)
          //console.log(e,'linkdest',link_dests)
          if(String(e.index) === String(node_id) ){
            return "0.8em";
          }
          else if (String(e.id).includes("Open Society") || String(e.id).includes("Soros")){
            return "0.8em";
          }
          else{return "0px";}
        })
        .attr("transform",function(d){
          //console.log(e,'linkdest',link_dests)
          if (String(d.id).includes("Open Society") || String(d.id).includes("Soros")){
            return "translate(" + (d.x - 5) + "," + (d.y - 5) + ")";
          }
          else if (String(d.index) === String(node_id) ){
            // let's keep the text in a constant position to make it UI friendly...
            return "translate("+String(netWidth/2)+",15)"
          }

            //return "translate(" + (d.x - 5) + "," + (d.y - 5) + ")";

            /* let's try an alternative, tracking to mouse
            else {
              //console.log(d3.pointer(event))
              var x = d3.pointer(event)[0] //- document.getElementById("#network-svg").getBoundingClientRect().x + 10
              var y = d3.pointer(event)[1] //- document.getElementById("#network-svg").getBoundingClientRect().y + 10
              return "translate(" + String(x) + "," + String(y) + ")";
            }*/
          
        }) 

    })
    
    node.on("mouseout",function(){
      // clear active link list
      link_dests = [];      
      d3.select(this)
        .transition()
        .duration(250)
        .attr("r",d=>circScale(d.value))
    
      d3.selectAll(".link-line")
        .attr("stroke","#999")
    
      d3.selectAll(".label")
        .attr("font-size",function(e){
          //console.log(e,'linkdest',link_dests)
          if (String(e.id).includes("Open Society") || String(e.id).includes("Soros")){
            return "0.8em";
          }
          else{return "0px";}
        }) 
        .attr("transform",function(d){
          if (String(d.id).includes("Open Society") || String(d.id).includes("Soros")){
            return "translate(" + (d.x - 5) + "," + (d.y - 5) + ")";
          }
          else {
            // let's keep the text in a constant position to make it UI friendly...
            return "translate("+String(netWidth/2)+",15)"
          }

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
          if (String(d.id).includes("Open Society") || String(d.id).includes("Soros")){
            return "translate(" + (d.x - 5) + "," + (d.y - 5) + ")";
          }
          else  {
            //return "translate(" + (d.x - 5) + "," + (d.y - 5) + ")";
            return "translate("+netWidth/2+",15)"
          };
      });
    });
    
 

})







