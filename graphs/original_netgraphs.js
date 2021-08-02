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
    var nodes = osf_ra['nodes']
    //var links = osf_ra['links']
    /*var node_vals = []
    for (let i = 0; i < osf_ra['nodes'].length; i++){
      let val = osf_ra['top_cofunders'].filter(d=>d.funder === osf_ra['nodes'][i])
      
      let a = {"id":osf_ra['nodes'][i], "group": getRandomInt(8), "value": val[0].value}
      nodes.push(a)
      
    }*/
    //console.log("console logging...","node vals",nodes)
    
    //nodes = nodes.map(d => Object.create(d));
    var links = osf_ra['links'].map(d=>Object.create(d))
    //var links = osf_ra['links']
    var five_top_funders = top_cofunders.slice(0,5).map(d=>d.funder)

   
  

    

    /// insert my own netgraph here
  
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
        .force("charge", d3.forceManyBody().strength(-150))
        .force("center", d3.forceCenter(netWidth / 2, netHeight / 2))
        //.force("x", d3.forceX(netWidth / 2).strength(0.6))
        //.force("y", d3.forceY(netHeight / 2).strength(0.6))
    


    
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
      function mouseoverLinks(){
        if (toggle == 0){
          //Reduce the opacity of all but the neighbouring nodes
          let d = d3.select(this).node().__data__;
          console.log("this is what the d on click is in connected nodes",d)
          //.node().__data__;
          link.style("stroke-opacity", function (o) {
              return d.index==o.source.index | d.index==o.target.index ? 1 : 0.6;
          });
          //Reduce the op
        }   
      }
      function mouseoutLinks(){
        if (toggle == 0){
          //Put them back to opacity=1
          d3.selectAll(".link-line")
          .attr("stroke-opacity", 0.6)
        }
      }
          
      
      //and add one line to the node set up

    var info_box = d3.select("#network-info").append("div")
    var info_boxHeader = info_box.append("h6").attr("class","info-box-header")
    var info_boxLinks = info_box.append("ul").attr("id","hovered-node-link-list")

    
    var node = net_svg.selectAll('.node')
      .data(nodes)
      .enter().append("g")
      .attr("class","node")
      .attr("id",d=>"node-"+String(d.index))
      .attr("name",d=>d.id)
      .call(drag(simulation))
        .on('dblclick', connectedNodes)
        .on('mouseover',mouseoverLinks)
        .on("mouseout",mouseoutLinks)
      
     
  

    var node_circle = node
      .append("circle")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.25)
        .attr("r", d=>circScale(d.value))
        .attr("class","node-circle")
        .attr("id",d=>"node-circle-"+String(d.index))
        .attr("name",d=>d.id)
        .attr("group",d=>d.group)
        .attr("fill", d=>colorScale(d.group))
        
        
       
       //Added code 

    var five_top_funders = top_cofunders.slice(0,5).map(d=>d.funder)

    var node_label = node
      .append("text")
        .attr("class", "node-label")
        .attr("id",d=>"node-label-"+String(d.index))
        .attr("group",d=>d.group)
        .attr("fill", "black")
        .attr("text-anchor","middle")
        // TO DO: edit to ensure the labels for the largest nodes and the main targets are present
        .attr("font-size",function(d){
          if (String(d.id).includes("Open Society") || String(d.id).includes("Soros")){
            let labelstring =  String(d.id).replace("Foundations","").replace("Foundation","").replace("University of","Univ.").replace("University","Univ.").replace("College","")  
            return labelstring.length > 13 ? "0.6em" : "0.85em";
          }
          else if (five_top_funders.includes(d.id)) {return "0.6em";}
          else {return "0em";}
        })
        .text(function(d) {  
          let labelstring =  String(d.id).replace("Foundations","").replace("Foundation","").replace("University of","Univ.").replace("University","Univ.").replace("College","")  
          let regExp = /\(([^)]+)\)/
          var matches = regExp.exec(labelstring)
          labelstring = matches ? matches[0].replace("(","").replace(")","") : labelstring;
          return labelstring;
        })

    
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
              return labelstring.length > 13 ? "0.6em" : "0.85em";
            }
            else if (five_top_funders.includes(d.id)) {return "0.6em";}
            else {return "0.5em";}
          })

        d3.select(this).select(".node-circle")
          .transition()
          .duration(300)
          .attr("r",d=>circScale(d.value)*1.5)
      
     
        info_boxHeader.text(node_name)

        //console.log("node id",this)
        d3.selectAll(".link-line")
          .attr("stroke",function(e){
            let id = String(node_id).replace("node-","")
            //console.log("e",e)
            if(String(e.source.index) === id ||String(e.target.index) === id ){
              link_dests.push(String(e.source.index))
              link_dests.push(String(e.target.index))

              if (String(e.source.index) === id){
                link_names.push([e.target.id,e.value])
              } 
              else{link_names.push([e.source.id,e.value])}

              return "black";
            }
            else{return "#999";}
            //console.log("link console log",e.source,e.target)
          })

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
    
    node.on("mouseout",function(){
      // clear active link list
      link_dests = [];    
      
      var node_id = d3.select(this).attr("id")


      d3.select(this).select(".node-label")
      .transition()
      .delay(500)
      .attr("font-size",function(d){
        if (String(d.id).includes("Open Society") || String(d.id).includes("Soros")){
          let labelstring =  String(d.id).replace("Foundations","").replace("Foundation","").replace("University of","Univ.").replace("University","Univ.").replace("College","")  
          return labelstring.length > 13 ? "0.6em" : "0.85em";
        }
        else if (five_top_funders.includes(d.id)) {return "0.6em";}
        else {return "0em";}
      })


      d3.select(this).select(".node-circle")
        .transition()
        .delay(750)
        .attr("r",d=>circScale(d.value))
    
      d3.selectAll(".link-line")
        .attr("stroke","#999")
    
    })
    
    simulation.on("tick", () => {
      link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

      node.attr("transform", function(d) { return "translate(" + Math.max(radius, Math.min(netWidth - radius, d.x)) + "," + Math.max(radius, Math.min(netHeight - radius, d.y)) + ")"; });

    });
    