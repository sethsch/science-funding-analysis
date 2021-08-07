import { boxplot, boxplotStats } from './lib/d3-boxplot-0.7.6/src/boxplot.js';
import { sortableBar } from './sortableBar.js'


var state = {
  data : [],
  fileredData : [],
  network: [],
  neighborNodes : [],
  communityNodes : [],
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
  netHeight = window.innerHeight * 0.75;

const panelDims = {
  width: width,
  height: height,
  paddingInner: paddingInner,
  margin: margin
  
}

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
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




  //let subj_area = "International Relations"
  let subj_area = "Neurosciences & Neurology"
  //"Government & Law"
  //"Business & Economics"

  const osf = data['osf']
  const osf_ra = data['osf']['Research Areas'][subj_area]
  var citations = osf_ra['citation_stats'][9].value
  var osf_citations_full = osf['citation_stats'][9].value

  var area_citations = []
  var funders = Object.keys(data)
  for (var i = 0; i < funders.length; i++){
    if (!(subj_area in data[funders[i]]['Research Areas'])) {
    }
    else {
      let cit_stats = data[funders[i]]['Research Areas'][subj_area]['citation_stats'][9].value
      for (var j = 0; j < cit_stats.length; j++) {
        area_citations.push(cit_stats[j]);
      }
      
    }
  }
 
  console.log('area citations',area_citations)
 
  

  d3.select("#subject-title").text(subj_area
                                  //+ " - "
                                  //osf_ra['num_pubs']+" publications, "+
                                  //d3.format(".0%")(osf_ra['pct_of_all'])
                                   )

  //// Publications Graphic

  

  let iconColor = "#242424"
  let filledColor = "#65c268"

  
  let pubPlotWidth =  $("#pubs-img-graph").width() * 0.8;

  let iconSize = pubPlotWidth/20
  let pubPlotHeight = iconSize*7
  //'rgb(173, 212, 174)'
  let base_pub_icon = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" fill=${iconColor} class="bi bi-file-text" viewBox="0 0 16 16"><path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"/><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/></svg>`
  let fill_pub_icon = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" fill=${iconColor} class="bi bi-file-text" viewBox="0 0 16 16"><rect x="2" y="1" width="12" height="14" style="fill: ${filledColor};"></rect><path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"/><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/></svg>`
  

  var pub_svg = d3.select("#pubs-img-graph").append("svg").attr("width",pubPlotWidth).attr("height",pubPlotHeight)
    
  let pub_list = [...Array(100).keys()]
  console.log("publist",pub_list)

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
    .attr("height",iconSize)
    .attr("width",iconSize)
    .attr("class","icons")
    //.style("filter", "url(#drop-shadow)")
    .attr("x",function(i) {
      if (i < 20) { return 6 + (i*iconSize);}
      else if (i<40){ return 6 + (i-20)*iconSize;}
      else if (i<60){ return 6 + (i-40)*iconSize;}
      else if (i<80){ return 6 + (i-60)*iconSize;}
      else {return 6 + (i-80)*iconSize;}
    })
    .attr("y",function(i){
      console.log("y val i",i)
      if (i < 20) { return 10;}
      else if (i<40){ return (1.16*iconSize) + 10;}
      else if (i<60){ return (1.16*iconSize)*2 + 10;}
      else if (i<80){ return (1.16*iconSize)*3 + 10;}
      else {return (1.16*iconSize)*4 + 10;}
    })
    .html(function(i){
      // TO DO: swap in teh total number of pubs for the selected funder
      if (i < Math.round(osf_ra['num_pubs']/1057*100,0)){
        return fill_pub_icon;
      }
      else {return base_pub_icon;}
    })

    pub_svg.append("text")
      .attr("class","pubs-text")
      .attr("x","95%")
      .attr("y","92%")
      .attr("dominant-baseline","middle")
      .attr("text-anchor","end")
      .attr("font-size","24px")
      .text(`${osf_ra['num_pubs']} of 1,057 publications`)


  


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
  kw.text(makeParagraph(osf_ra['top_50_kw'],"keyword",30,false));

  let exceptions = ["Open Society","Soros"]
  let top_cofunders = osf_ra['top_cofunders']
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
  //cofunders.text(makeParagraph(osf_ra['top_cofunders'],"funder",10,true))
  let top_journals = osf_ra['journals_20']
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
  //journals.text(toTitleCase(makeParagraph(osf_ra['journals_20'],'journal',10,true)))
  

  let top_authors = osf_ra['authors_top25']
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

  //authors.text(makeParagraph(osf_ra['authors_top25'],'author',15,true))
   
    
  



 

console.log("did we get osf?",osf)

const plotWidth = 800;
const margin = {left: 40, right: 40, top: 20, bottom: 20}
const plotHeight = 500;
const bandwidth = 60;


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


    var plotcats = [subj_area+" (OSF)",subj_area+" (Other Funders)","All Research Areas (OSF)"]
    const dataset = [citations,area_citations,osf_citations_full]
    const filt_datasets = []
    dataset.forEach(function(ds){
      let norm_ds = []
      for (var i = 0; i<ds.length; i++){
        //let nval = (ds[i] - d3.min(ds,d=>d)) / (d3.max(ds,d=>d) - d3.min(ds,d=>d))
        if (ds[i] > 0) {norm_ds.push(ds[i])}
        
      }
      filt_datasets.push(norm_ds)
    })
    var maxTicks = []
    var medTicks = []
    const stats = dataset.map(function(d) {
      let s = boxplotStats(d);
      s["mean"] = d3.mean(d);
      s["labelNums"] = s.fiveNums.concat(s["mean"]).slice(1)
      medTicks.push(s.fiveNums[2])
      //tickNums.push(s.fiveNums[3])
      maxTicks.push(s.fiveNums[4])
      return s;
    })
    maxTicks.push(d3.mean(medTicks))
    var tickNums = [...new Set(maxTicks)];

    console.log("stats",stats)
    var all_citations = []
    dataset.forEach(function(citation_dist){
      for (var i = 0; i<citation_dist.length; i++){
        all_citations.push(citation_dist[i])
      }
    })

  let svg = d3.select("#boxplot").append("svg").attr("width",plotWidth).attr("height",plotHeight)
  svg
    .append('g')
    .attr('class', 'plots')
      // set the dimensions and margins of the graph
    const H = plotHeight,
      W = plotWidth,
      M = ({L: 5, R: 5, T: 25, B: 50})
    
    
    const vertical = true;
    const minimalStyle = false;
    const useSymbolTick = true;
    const colorOption = true;
    const jitter = 0.1;
    var opacity = 0.7;
    const colors = d3.schemeCategory10
    const scale = d3.scalePow()
      .exponent(0.25)
      .domain([0,d3.max(all_citations,d=>d)])
      .range(vertical ? [H - M.T - M.B, M.T] : [M.L, W - M.L - M.R])

    const band = d3.scaleBand()
      //.domain(d3.range(stats.length))
      .domain(plotcats)
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
      .boxwidth(minimalStyle == true ? 12 : 45)
      .vertical(vertical)
      .key(d => d)

    svg.select('g.plots')
      .attr('transform', 'translate(' + [M.L, M.T] + ')')
      .selectAll('.plot').data(stats)
      .join('g')
      .attr('class', 'plot')
      .transition()
      .attr('transform', (_, i) => `translate(${vertical == true ? [band(plotcats[i]), 0] : [0, band(plotcats[i])]})`)
      .attr('color', (_, i) => colorOption == true ? colors[i / 2|0] : '#000')
      .call(plot)


  // Add scales to axis
  var y_axis = d3.axisLeft()
    .scale(scale)
    .tickValues(tickNums)
    //.ticks(6,",.5")

  
  var bandAxis = d3.axisBottom()
    .scale(band)
    .tickSize(0)
    

  //Append group and insert axis
  svg.append("g")
    .call(y_axis)
    .attr("class","y-axis")
    .attr("transform",`translate(${M.L+30},${M.T})`)
  
  svg.select(".y-axis")
    .append("text")
    .attr("class","y-axis-title")
    .attr("transform",`translate(${M.L - 30},${M.T - 10})`)
    .text("Citations to date")

  
  svg.append("g")
    .call(bandAxis)
    .call(g => g.select(".domain").remove())
    .attr("transform",`translate(${M.L},${plotHeight - M.B + 5})`)
    .attr("class","x-axis")

  svg.select(".x-axis").selectAll(".tick text")
    .call(wrap,band.bandwidth() * 0.75)
  

  var boxplots = svg.select("g.plots").selectAll(".plot");
    //.join('g')
    //.selectAll("line")
    //.datum(stats)

  boxplots.selectAll(".point.outlier").style("r",3)
  
  boxplots.each(function(x){

    console.log('fivenumticks',this)
    console.log("the data is",x)

    var labels = d3.select(this).selectAll(".box-ticklabel").data(x.labelNums)
    labels
      .enter()
      .append("text")
      .attr("class","box-ticklabel")
      .attr("transform",(d)=>`translate(${band.bandwidth()/4},${scale(d)+2})`)
      .text(function(d,i){
        if (i < 4) {
          return String(Math.round(d,0));
        }
        else {return ""}
      })


    var ticks = d3.select(this).selectAll(".box-tickline").data(x.labelNums)
    ticks
        .enter()
        .append('line')
        .attr("class","box-tickline")
        .attr("x1",band.bandwidth()/4 )
        .attr("x2",band.bandwidth()/8 + band.bandwidth()/4 + 2)
        .attr('y1', d=>scale(d))
        .attr('y2', d=>scale(d))
        .attr("opacity",function(d,i){
          if (i < 4){
            return 1;
          }
          else {return 0;}
        })

    // TO DO: customize which labels and summaries will show
    var annotations = d3.select(this).selectAll(".box-ticknotes").data(x.labelNums)

    annotations.enter()
      .append('text')
      .attr("class","box-ticknotes")
      .text(function(_,i){
        if (i < 4) {
          return ['25ᵗʰ', 'mean', '75ᵗʰ', 'Top Cited', 'mean'][i];
        }
        else {return ""}
      })
      .attr('transform', function (d, i) {
        if (i !== 3) {
          return  `translate(${band.bandwidth()/8},${scale(d)+2})`;
        }
        else {
          return `translate(${band.bandwidth()/8},${scale(d)-10})`
        }
      })
      .attr("text-anchor",function(d,i){
        if (i != 3){
          return "end";
        }
        else {return "middle";}
      })
    

   

  })
  console.log("fiveNums",stats)
    
 
 



let citation_info = d3.select("#citation-stats").append("p")

// consider using pre-computed or later computed if we're going to drop the 0's
let citation_infoText = "<ul><li>% of Publications w. 0 citations to date: "+
                                  d3.format(".0%")(osf_ra["citation_stats"][1].value) + "</li>" +
                        "<li>Top 25%: " + osf_ra["citation_stats"][4].value + "+ citations </li>" +
                        "<li>Top 10%: " + String(parseInt(osf_ra["citation_stats"][6].value)) + "+ citations</li></ul>"



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


let oa_plotHeight = 360;
var oa_plotWidth = $("#oa-stats").parent().width();
let oa_margin = {top: 40, bottom: 40, right: 20, left: 120};

let oa_svg = d3.select("#oa-stats")
.append("svg")
.attr("width","100%")
.attr("height",oa_plotHeight)
.style("display", "block");



//console.log(osf,"at oa sumary break")
// TO DO: re-arrange based on keys rather htan index to make no-oa first or last...
let oa = osf_ra["oa_summary"]
let oa_allOSF = osf["oa_summary"]
let fullstat = [{oa_type: "NO_OA",value: 0}, {oa_type:"BOTH",value: 0},{oa_type:"PUBLISHER_HOSTED",value:0},{oa_type:"AUTHOR_HOSTED",value:0}]
var funders = Object.keys(data)
for (var i = 0; i < funders.length; i++){
  if (!(subj_area in data[funders[i]]['Research Areas'])) {
  }
  else {
    let oa_stat = data[funders[i]]['Research Areas'][subj_area]['oa_summary']
    for (var j = 0; j < oa_stat.length; j++) {
      if (oa_stat[j]['oa_type'] == "NO_OA") { 
        fullstat[0].value += oa_stat[j].value
      }
      else if (oa_stat[j] == "BOTH") {
        fullstat[1].value += oa_stat[j].value
      }
      else if (oa_stat[j] == "PUBLISHER_HOSTED") {
        fullstat[2].value += oa_stat[j].value
      }
      else { fullstat[3].value += oa_stat[j].value}
    }
  }
}
let oa_datasets = [oa,fullstat,oa_allOSF]




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
let oa_stacks = []
var order = ["NO_OA", "PUBLISHER_HOSTED", "AUTHOR_HOSTED", "BOTH"];
for (let i = 0; i < oa_datasets.length; i++){
  let ordered_oa = _.sortBy(oa_datasets[i],function(obj){
    return _.indexOf(order,obj.oa_type)
  })
  oa_stacks.push(stack(ordered_oa,"oa_type"))
  
}
console.log("oa stacks",oa_stacks)
let bandCats = ["Funded by OSF","Other Funders","Other Research Areas (OSF)"]
let series = [[],[],[],[]]
for (let i = 0; i < oa_stacks.length; i++){
  for (let j = 0; j < oa_stacks[i].length; j++){
    let d = oa_stacks[i][j]
    if (d.name === "NO_OA") {
      series[0].push([d.startValue,d.endValue,bandCats[i],d.name,d.value])
    }
    else if (d.name === "PUBLISHER_HOSTED") {
      series[1].push([d.startValue,d.endValue,bandCats[i],d.name,d.value])
    }
    else if (d.name === "AUTHOR_HOSTED") {
      series[2].push([d.startValue,d.endValue,bandCats[i],d.name,d.value])
    }
    else if (d.name === "BOTH") {
      series[3].push([d.startValue,d.endValue,bandCats[i],d.name,d.value])
    }
  }
}
console.log("series",series,order)

let oa_xScale = d3.scaleLinear()
  .range([oa_margin.left, oa_plotWidth - oa_margin.right])

let oa_yScale = d3.scaleBand()
.domain(bandCats)
.range([oa_margin.bottom, oa_plotHeight - oa_margin.top])
.padding(0.5)

let oa_color = d3.scaleOrdinal()
.domain(order)
.range(d3.schemeSpectral[4])
.unknown("#ccc")

let oa_xAxis = g => g
    .attr("transform", `translate(0,${oa_margin.top + oa_yScale.bandwidth()})`)
    .call(d3.axisTop(oa_xScale).ticks(oa_plotWidth / 100, "%"))
    .call(g => g.selectAll(".domain").remove())

let oa_yAxis = g => g
.attr("transform", `translate(${oa_margin.left-10},-3)`)
.call(d3.axisLeft(oa_yScale).tickSizeOuter(0).tickSize(0))
.call(g => g.selectAll(".domain").remove())

let formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")
let oa_formatPercent = d3.format(".0%")


oa_svg.append("g")
.selectAll("g")
.data(series)
.enter().append("g")
.selectAll("rect")
.data(d => d)
.join("rect")
  .attr("fill", d => oa_color(d[3]))
  .attr("x", d => oa_xScale(d[0]))
  .attr("y", (d, i) => oa_yScale(d[2]))
  .attr("width", d => oa_xScale(d[1]) - oa_xScale(d[0]))
  .attr("height", oa_yScale.bandwidth())

console.log(oa_svg.selectAll(".oa-rect"),oa_svg.selectAll(".oa-rect").data())

oa_svg.append("g")
  .selectAll("g")
  .data(series)
  .enter().append("g")
  .selectAll("rect")
  .data(d => d)
  .join("text")
  .attr("fill", d => d3.lab(oa_color(d[3])).l < 50 ? "white" : "black")
  .attr("transform", d => `translate(${oa_xScale(d[0]) + 6}, ${oa_yScale(d[2])})`)
  .call(text => text.append("tspan")
    .attr("class","oa-rect-text")
    .attr("x", 0)
    .attr("y", oa_yScale.bandwidth()/2)
    .attr("fill-opacity", 0.7)
    .text(d => d[4] > 0 ? oa_formatPercent(d[4]): "")
  )
  .call(text => text.append("tspan")
      .attr("font-weight", "bold")
      .attr("y",  "1.9em")
      .attr("x", "0")
      //.text(d =>  d[4] > 0 ? d[3].replace("_HOSTED","").replace("NO_OA","PAYWALLED"): "")
  )



oa_svg.append("g")
  .call(oa_xAxis);

oa_svg.append("g")
  .attr("class","oa-y-axis")
  .call(oa_yAxis)

oa_svg.select(".oa-y-axis").selectAll(".tick text")
  .call(wrap,oa_margin.left)

var legend_svg = d3.select("#oa-legend").append("svg")
  .attr("height",50)
  .attr("width","100%")
  

  
legend_svg
  .selectAll("rect")
  .data(order)
  .join("rect")
  .attr("stroke","white")
  .attr("fill", d => oa_color(d))
  .attr("x", (d,i) => (oa_plotWidth*0.275)+(i * 100))
  .attr("y", 2)
  .attr("width",75)
  .attr("height",25)


  legend_svg.selectAll(".legend-labels")
  .data(order)
  .join("text")
  .attr("class","legend-labels")
  .attr("font-family", "Lato")
  .attr("font-size", 10)
  .attr("fill","black")
  .attr("x", (d,i) => (oa_plotWidth*0.275)+(i * 100)+3)
  .attr("y", 40)
  .call(text => text.append("tspan")
    .attr("font-weight", "bold")
    .text(d =>  d.replace("_HOSTED","").replace("NO_OA","PAYWALLED"))
  )
  


/*
//let ordered_oa = _.sortBy(oa, function(obj){ 
//  return _.indexOf(order, obj.oa_type);
//});
// reorder oa summary var into right order
//let oa_stack = stack(ordered_oa,"oa_type");


//console.log("did we sort oa",ordered_oa,"stacked",oa_stack)

let oa_xScale = d3.scaleLinear([0, 1], [margin.left, oa_plotWidth - margin.right])
let oa_yScale = d3.scaleBand()
  .domain([subj_area+" (OSF)",subj_area+" (Other Funders)", "All Research Areas (OSF)"])
  .range([0,oa_plotHeight - margin.top])




let oa_formatPercent = oa_xScale.tickFormat(null, "%")



oa_svg.append("g")
  .attr("stroke", "white")
  .selectAll("rect")
  .data(oa_stack)
  .join("rect")
  .attr("fill", d => oa_color(d.name))
  .attr("x", d => oa_xScale(d.startValue))
  // replace with band
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

  */
  


    
})
////////////////////



//var netwidth = 800;
//var netheight = 600;
var info_box = d3.select("#network-info").append("div")
var info_boxHeader = info_box.append("h6").attr("class","info-box-header")
var info_boxLinks = info_box.append("ul").attr("id","hovered-node-link-list")


var element = d3.select('#network-graph').node();
var netwidth = element.getBoundingClientRect().width * 0.96;


var netheight = d3.select('#network-info').node().getBoundingClientRect().height * 0.96;

var netcolor = d3.scaleOrdinal(d3.schemeCategory10);

d3.json("funderSubjStats.json").then(function(graph) {

    const osf = graph['osf']
    const osf_ra = graph['osf']['Research Areas']["Government & Law"]
    var nodes = osf_ra['nodes']
    var links = osf_ra['links']

    let top_cofunders = osf_ra['top_cofunders']
    var five_top_funders = top_cofunders.slice(0,5).map(d=>d.funder)


    var label = {
        'nodes': [],
        'links': []
    };

    nodes.forEach(function(d, i) {
        label.nodes.push({node: d});
        label.nodes.push({node: d});
        label.links.push({
            source: i * 2,
            target: i * 2 + 1
        });
    });

    var labelLayout = d3.forceSimulation(label.nodes)
        .force("charge", d3.forceManyBody().strength(-50))
        .force("link", d3.forceLink(label.links).distance(0).strength(1));

    var graphLayout = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-3000))
        .force("center", d3.forceCenter(netwidth / 2, netheight / 2))
        .force("x", d3.forceX(netwidth / 2).strength(1))
        .force("y", d3.forceY(netheight / 2).strength(1))
        .force("link", d3.forceLink(links).id(function(d) {return d.id; }).distance(50).strength(1))
        .on("tick", ticked);

  



    var adjlist = [];

    links.forEach(function(d) {
        adjlist[d.source.index + "-" + d.target.index] = true;
        adjlist[d.target.index + "-" + d.source.index] = true;
    });

    function neigh(a, b) {
        return a == b || adjlist[a + "-" + b];
    }
    const circScale = d3.scaleSqrt()
    .domain([1, d3.max(nodes,d=>d.value)])
    .range([5, 20]);

    const linkScale = d3.scaleSqrt()
    .domain([1, d3.max(links,d=>d.value)])
    .range([0.25, 4]);

   
    var svg = d3.select("#zoom-netgraph").attr("width", netwidth).attr("height", netheight);
    var container = svg.append("g");

    svg.call(
      d3.zoom()
            .scaleExtent([.1, 5])
            .on("zoom", function() { container.attr("transform", d3.event.transform); })
    );

    var link = container.append("g").attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke", "#aaa")
        .attr("class","link-line")
        .attr("id",d=>"link_"+d.source.index+"_"+d.target.index)
        .attr("stroke-width", d=>linkScale(d.value));

    var node = container.append("g").attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("id",d=>"node-"+String(d.index))
        .attr("name",d=>d.id)
        .attr("r", d=>circScale(d.value))
        .attr("fill", function(d) { return netcolor(d.group); })
        
    node.on("mouseover", focus).on("mouseout", unfocus);
  

    node.call(
      d3.drag()
            //.on("start",dragstarted)
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
    );
    console.log("label nodes",five_top_funders)

  

    var labelNode = container.append("g").attr("class", "labelNodes")
        .selectAll("text")
        .data(label.nodes)
        .enter()
        .append("text")
        .attr("class", "node-label")
        .attr("id",d=>"node-label-"+String(d.index))
        .attr("fill", "#555")
        .attr("font-family", "Lato")
        .text(function(d,i) {  
            if (i%2 == 0) {
                return "";
            }
            else {
                let labelstring =  String(d.node.id).replace("Foundations","").replace("Foundation","").replace("University of","Univ.").replace("University","Univ.").replace("College","")  
                let regExp = /\(([^)]+)\)/
                var matches = regExp.exec(labelstring)
                labelstring = matches ? matches[0].replace("(","").replace(")","") : labelstring;
                return labelstring;
            }
        })
        .attr("font-size",function(d){
          if (String(d.node.id).includes("Open Society") || String(d.node.id).includes("Soros")){
            let labelstring =  String(d.node.id).replace("Foundations","").replace("Foundation","").replace("University of","Univ.").replace("University","Univ.").replace("College","")  
            return labelstring.length > 13 ? "0.8em" : "1em";
          }
          else if (five_top_funders.includes(d.node.id)) {return "0.8em";}
          else {return "0.6em";}
        })
        .style("pointer-events", "none"); // to prevent mouseover/drag capture

    node.on("mouseover", focus).on("mouseout", unfocus);


    // maintain a list of active links for hover behavior
    var link_dests = [];
    var link_names = [];
    
    node.on("mouseenter",function(){
        link_names = []
        console.log('enter this',this)
        var node_id = d3.select(this).attr("id")
        var node_name = d3.select(this).attr("name")

            
        d3.select(this).select(".node-label")
          .transition()
          .delay(300)
          .attr("font-size",function(d){
            if (String(d.id).includes("Open Society") || String(d.id).includes("Soros")){
              let labelstring =  String(d.id).replace("Foundations","").replace("Foundation","").replace("University of","Univ.").replace("University","Univ.").replace("College","")  
              return labelstring.length > 13 ? "0.8em" : "1em";
            }
            else if (five_top_funders.includes(d.id)) {return "0.8em";}
            else {return "0.6em";}
          })

        /*d3.select(this).select(".node-circle")
          .transition()
          .duration(300)
          .attr("r",d=>circScale(d.value)*1.5)*/
      
     
        

        //console.log("node id",this)
        d3.selectAll(".link-line")
          .attr("opacity",function(e){
            let id = String(node_id).replace("node-","")
            //console.log("e",e)
            if(String(e.source.index) === id ||String(e.target.index) === id ){
              link_dests.push(String(e.source.index))
              link_dests.push(String(e.target.index))

              if (String(e.source.index) === id){
                link_names.push([e.target.id,e.value])
              } 
              else{link_names.push([e.source.id,e.value])}

              //return "black";
              return 1
            }
            else{return 1;}
            //console.log("link console log",e.source,e.target)
          })

        info_boxHeader.text(node_name)
        //info_boxLinks.selectAll("li").remove()
        d3.selectAll(".link-list-item").remove()

        link_names = link_names.filter(d=> d[0]!= node_name && d[0] != "")
        link_names = [...new Set(link_names)]

        link_names.sort((a,b)=>b[1]-a[1])
    
       
        info_boxLinks.selectAll(".link-list-item")
        .data(link_names)
        .enter()
        .append("li")
        .attr("class","link-list-item")
        .attr("id",d=>d[0]+String(Math.random()*73831))
        .text(d=>d[0]+" ("+d[1]+")")
        .exit()
        .remove()
    
  
        //.attr("stroke","blue")
    
    })
    
      






    function ticked() {

        node.call(updateNode);
        link.call(updateLink);

        labelLayout.alphaTarget(0.3).restart();
        labelNode.each(function(d, i) {
            if(i % 2 == 0) {
                d.x = d.node.x;
                d.y = d.node.y;
            } else {
                var b = this.getBBox();

                var diffX = d.x - d.node.x;
                var diffY = d.y - d.node.y;

                var dist = Math.sqrt(diffX * diffX + diffY * diffY);

                var shiftX = b.width * (diffX - dist) / (dist * 2);
                shiftX = Math.max(-b.width, Math.min(0, shiftX));
                var shiftY = 16;
                this.setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
            }
        });
        labelNode.call(updateNode);

    }

    function fixna(x) {
        if (isFinite(x)) return x;
        return 0;
    }

    function focus(d) {
        var index = d3.select(d3.event.target).datum().index;
        node.style("opacity", function(o) {
            return neigh(index, o.index) ? 1 : 0.1;
        });
        labelNode.attr("display", function(o) {
        return neigh(index, o.node.index) ? "block": "none";
        });
        link.style("opacity", function(o) {
            return o.source.index == index || o.target.index == index ? 1 : 0.1;
        });
    }

    function unfocus() {
    labelNode.attr("display", "block");
    node.style("opacity", 1);
    link.style("opacity", 1);
    }

    function updateLink(link) {
        link.attr("x1", function(d) { return fixna(d.source.x); })
            .attr("y1", function(d) { return fixna(d.source.y); })
            .attr("x2", function(d) { return fixna(d.target.x); })
            .attr("y2", function(d) { return fixna(d.target.y); });
    }

    function updateNode(node) {
        node.attr("transform", function(d) {
            return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
        });
    }

    function dragstarted(d) {
      d3.event.sourceEvent.stopPropagation();
        if (!d3.event.active) graphLayout.alphaTarget(0.1).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) graphLayout.alphaTarget(0);
        //d.fx = null;
        //d.fy = null;
        //d.fx = d3.event.x;
        //d.fy = d3.event.y;
        d.fx = d.x;
        d.fy = d.y;
    }
    

    
  
    

}); 






