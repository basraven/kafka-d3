import React, { Component } from 'react'; // let's also import Component
import  * as d3 from 'd3';

type GraphState = {
  time: Date,
  topics: Array<any>,
  producers: Array<any>,
  messages: Array<any>,
  labels: any,
  messagelabelLayout: any,
  topiclabelLayout: any,
  producerlabelLayout: any,
  messageLayout: any,
  nodeLayout: any,
  topicLinks: Array<any>,
  svg: any,
  container: any,
  message: any,
  topic: any,
  producer: any,
  topicLink: any,
  labelMessage: any,
  labelTopic: any,
  labelProducer: any,
}

type GraphOps = {
  width: number
  height: number,
  color: any,
  refreshSpeed: number,
  endNodeRemoveDist: number,
  messageTargetAttraction: number,
  messageRepel: number;
}




// const setTicked = ({messageLayout  }, {}) => ({
//   messageLayout : messageLayout.on('tick', function(){})
// });

const setSvgObjects = ({ container, messages, topics, producers, topicLinks }, {color}) => ({
  message: container.append("g").attr("class", "messages")
      .selectAll("g")
      .data(messages)
      .enter()
      .append("circle")
      .attr("r", 5)
      .attr("fill", (d) => { return color(d.group); }),

    topic: container.append("g").attr("class", "topics")
      .selectAll("g")
      .data(topics)
      .enter()
      .append("circle")
      .attr("r", 17)
      .attr("fill", (d) => { return color(d.partition); }),

    producer: container.append("g").attr("class", "producers")
      .selectAll("g")
      .data(producers)
      .enter()
      .append("circle")
      .attr("r", 12)
      .attr("fill", (d) => { return color(4); }),

    // Remove me
    // topicLink: container.append("g").attr("class", "topicLinks")
    //     .selectAll("line")
    //     .data(topicLinks)
    //     .enter()
    //     .append("line")
});





const setLayouts = ({ labels, messages, nodeLayout, topics, producers, topicLinks, message, topic, producer, topicLink, labelMessage, labelTopic, labelProducer}, {messageRepel, messageTargetAttraction, width, height}) => ({
     
    messagelabelLayout: d3.forceSimulation(labels.messages)
    .force("charge", d3.forceManyBody()
      .strength(-50)),
    
    topiclabelLayout: d3.forceSimulation(labels.topics)
    .force("charge", d3.forceManyBody()
      .strength(-5000)),
    
    producerlabelLayout: d3.forceSimulation(labels.producers)
    .force("charge", d3.forceManyBody()
      .strength(-50)),
    
    messageLayout: d3.forceSimulation(messages)
    .force("charge", d3.forceManyBody()
      .strength(messageRepel)),
    // .force("x", d3.forceX().x(d => {
    //       let nodes = nodeLayout.nodes()
    //       let targetNode = nodes.find(element => element.id == d.target);
    //       d.targetX = targetNode.x 
    //       if(!targetNode.x){ console.log(d.targetX) }
    //       return d.targetX
    //   })
      // .strength(messageTargetAttraction))
    // .force("y", d3.forceY().y(d => {
    //     let nodes = nodeLayout.nodes()
    //     let targetNode = nodes.find(element => element.id == d.target);
    //     d.targetY = targetNode.y
    //     return d.targetY
    // })
      // .strength(messageTargetAttraction))
    // .on("tick", 
    
    
    
    
    
    
    // ),
      
    nodeLayout: d3.forceSimulation([...topics, ...producers])
    .force("charge", d3.forceManyBody()
      .strength(-3000))
    .force("center", d3.forceCenter(width / 2, height/ 2))
    .force("x", d3.forceX(() => { return width / 2} )
      .strength(0.1))
    .force("y", d3.forceY(width / 2)
      .strength(0.1))
    .force("link", d3.forceLink(topicLinks).id( d => {return d.id; })
      .distance(300)
      .strength(1)),
    // .on("tick", ticked.bind('bla')
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    // ),

    svg: d3.select("#viz")
      .attr("width", width)
      .attr("height", height),
    container : d3.select("#viz").append("g")
});

const ticked = function(this: any) {
  function fixna(x) {
      if (isFinite(x)) return x;
      return 0;
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
  
    
    function updateNodeTarget(node) {
    //     .force("x", d3.forceX().x(function(d) {
    //     return width / 5
    //     }).strength(1)
    //   )
        // node.attr("transform", function(d) {
        //     return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
        // });
    }
    if(this.state  != undefined){

      
      if(this.state.message){
        this.state.message.call(updateNode);
        this.state.message.call(updateNodeTarget);
      }

      if(this.state.topic){
        this.state.topic.call(updateNode);
      }
      
      if(this.state.producer){
        this.state.producer.call(updateNode);
      }
      
      if(this.state.topicLink){
        this.state.topicLink.call(updateLink);
      }
    
    
      // messagelabelLayout.alphaTarget(0.3).restart();
      // topiclabelLayout.alphaTarget(0.5).restart();
      // producerlabelLayout.alphaTarget(0.1).restart();
    
    
      
      if(this.state.labelMessage){
        this.state.labelMessage.each(function(d, i) {
          d.x = d.message.x;
          d.y = d.message.y;
        });
        this.state.labelMessage.call(updateNode);
      }
      
      if(this.state.labelTopic){
        this.state.labelTopic.each(function(d, i) {
                d.x = d.topic.x;
                d.y = d.topic.y;
        });
        this.state.labelTopic.call(updateNode);
      }

      if(this.state.labelProducer){
        this.state.labelProducer.each(function(d, i) {
                d.x = d.producer.x;
                d.y = d.producer.y;
        });
        this.state.labelProducer.call(updateNode);
      }
    }
   
  }

export class KafkaD3 extends Component<GraphOps, GraphState> {

  public static defaultProps = {
      width: 800,
      height: 1000,
      color: d3.scaleOrdinal(d3.schemeCategory10),
      topicLinks: [],
      refreshSpeed: 300,
      endNodeRemoveDist: 30,
      messageTargetAttraction: 0.7,
      messageRepel: -60

  };

  
  
  

  // The tick function sets the current state. TypeScript will let us know
  // which ones we are allowed to set.
  // TODO: remove
  tick() {
    this.setState({
      time: new Date()
    });
  }

  initState(){
    this.setState({
      labels : {
        'messages': [],
        'topics' : [],
        'partitions' : [],
        'producers': []
      },
      topics: [],
      producers: [],
      // FIXME: default state should be located somewhere else, but this also works
      messages: []
    });
  }

  // Before the component mounts, we initialise our state
  componentWillMount() {
    this.tick();
    this.initState();
  }

  refreshLabels(){
    //TODO: check if actually working, not really used right now
    this.state.topics.forEach((d, i) => {
      this.state.labels.topics.push({topic: d})
      this.setState({
        'labels' : this.state.labels.topics
      })
    });
    this.state.producers.forEach((d, i) => {
      this.state.labels.producers.push({producer: d})
      this.setState({
        'labels' : this.state.labels.producers
      })  
    });
  }

  

  oldsetSvgObjects(){
    // TODO: Do in a single call
    // this.setState({
    //   container: this.state.svg.append("g"),
    //   message: this.state.container.append("g").attr("class", "messages")
    //     .selectAll("g")
    //     .data(this.state.messages)
    //     .enter()
    //     .append("circle")
    //     .attr("r", 5)
    //     .attr("fill", (d) => { return this.props.color(d.group); }),

    //   topic: this.state.container.append("g").attr("class", "topics")
    //     .selectAll("g")
    //     .data(this.state.topics)
    //     .enter()
    //     .append("circle")
    //     .attr("r", 17)
    //     .attr("fill", (d) => { return this.props.color(d.partition); }),

    //   producer: this.state.container.append("g").attr("class", "producers")
    //     .selectAll("g")
    //     .data(this.state.producers)
    //     .enter()
    //     .append("circle")
    //     .attr("r", 12)
    //     .attr("fill", (d) => { return this.props.color(4); }),

    //   // Remove me
    //   topicLink: this.state.container.append("g").attr("class", "topicLinks")
    //       .selectAll("line")
    //       .data(this.state.topicLinks)
    //       .enter()
    //       .append("line")
    // })
  }

  handleDrag(){
        
    function dragstarted(this: any, d) {
        d3.event.sourceEvent.stopPropagation();
        // TODO: Fix variable alfa target here
        // FIXME: not sure if this now still works
        if (!d3.event.active){  this.target.alphaTarget(0.3).restart() };
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(this: any, d) {
        if (!d3.event.active) this.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    
      
    this.state.message.call(
      d3.drag()
          .on("start", dragstarted.bind(this.state.messageLayout))
          .on("drag", dragged.bind(this.state.messageLayout))
          .on("end", dragended.bind(this.state.messageLayout))
    );
    this.state.topic.call(
        d3.drag()
            .on("start", dragstarted.bind(this.state.nodeLayout))
            .on("drag", dragged.bind(this.state.nodeLayout))
            .on("end", dragended.bind(this.state.nodeLayout))
    );

    this.state.producer.call(
        d3.drag()
            .on("start", dragstarted.bind(this.state.nodeLayout))
            .on("drag", dragged.bind(this.state.nodeLayout))
            .on("end", dragended.bind(this.state.nodeLayout))
    );

  }

 
  refresh(){

  }


  // After the component did mount, we set the state each second.
  componentDidMount() {
  
    ( () => {
      this.state.messages.push({
        "id": ("Generated " + Math.random()),
        "group": 1,
        "size" : 10,
        "source" : "producer A",
        "target" : "topic A"
      })
      this.state.messages.push({
        "id": ("Generated " + Math.random()),
        "group": 1,
        "size" : 10,
        "source" : "producer A",
        "target" : "topic A"
      })
      this.state.messages.push({
        "id": ("Generated " + Math.random()),
        "group": 1,
        "size" : 10,
        "source" : "producer A",
        "target" : "topic A"
      })
      
    })()


    this.setState(setLayouts, () =>{
        this.setState(setSvgObjects, () => {
          this.state.messageLayout.on('tick', ticked.bind(this))
          this.setState({
            messageLayout : this.state.messageLayout
          })
      })
    });
    
    console.log(setSvgObjects)

    // this.state.svg.call(
    //   d3.zoom()
    //   .scaleExtent([.1, 400])
    //   .on("zoom", () => { this.state.container.attr("transform", d3.event.transform); })
    // );

    // this.handleDrag();


    // this.refresh();

    setInterval(() => {
      this.state.messages.push({
        "id": ("Generated " + Math.random()),
        "group": 1,
        "size" : 10,
        "source" : "producer A",
        "target" : "topic A"
      })
      this.setState({
        messages: this.state.messages
      })
    }, 1000);


  
  }
  // render will know everything!
  render() {
  return <p><svg id='viz'></svg>
            {/* <p>
              iets hier {JSON.stringify(this.state.messages)}
            </p>
             The current time is {this.state.time.toLocaleTimeString()}
              */}
             </p>
  }
}

export default KafkaD3