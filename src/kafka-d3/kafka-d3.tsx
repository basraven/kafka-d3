import React, { Component } from 'react'; // let's also import Component
import  * as d3 from 'd3';


type GraphState = {
  time: Date,
  topics: Array<any>,
  consumers: Array<any>,
  messages: Array<any>,
  // labels: any,
  messagelabelLayout: any,
  topiclabelLayout: any,
  consumerlabelLayout: any,
  messageLayout: any,
  nodeLayout: any,
  svg: any,
  container: any,
  message: any,
  topic: any,
  consumer: any,
  topicLink: any,
  labelMessage: any,
  labelTopic: any,
  labelConsumer: any,
}

type GraphOps = {
  width: number
  height: number,
  color: any,
  defaultScale: number,
  endNodeRemoveDist: number,
  messageTargetAttraction: number,
  messageRepel: number;
  nodeCharge: number;
  departureDelay: number;
  messageRemoveDist: number;
}


function fixna(x) {
  if (isFinite(x)) return x;  
    return 0;
  }  


const updateLayouts = ({ messages, nodeLayout, topics, consumers, message, topic, consumer, topicLink, labelMessage, labelTopic, labelConsumer}, {messageRepel, nodeCharge, width, height}) => ({
  messagelabelLayout: d3.forceSimulation(
    messages.map(message => {
      return { "message" : message }
    })
  )
    .force("charge", d3.forceManyBody()
    .strength(-50)),
    
  topiclabelLayout: d3.forceSimulation(
      topics.map(topic => {
        return { "topic" : topic }
      })
    )
    .force("charge", d3.forceManyBody()
    .strength(-5000)),
  
  consumerlabelLayout: d3.forceSimulation(
    consumers.map(consumer => {
      return { "consumer" : consumer }
    })
  )
    .force("charge", d3.forceManyBody()
    .strength(-50)),

  messageLayout: d3.forceSimulation(messages)
    .alphaMin(0.0001)
    .force("charge", d3.forceManyBody()
    .strength(messageRepel)),
    
  nodeLayout: d3.forceSimulation([...topics, ...consumers])
    .alphaMin(0.05) // Reduces jitter, but makes less fluent animation
    .force("charge", d3.forceManyBody()
      .strength(nodeCharge))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX(width / 2).strength(0.01))
    .force("y", d3.forceY(height / 2).strength(0.01))
    .force("link", d3.forceLink((() => { 
      let links : Array<any> = [] ;
      messages.forEach((item) => {
        let existing = links.find( element => element.source == item.source && element.target == item.target ) ;
        if(!existing){
          links.push({
            source : item.source,
            target : item.target,
            index : 1
          })
        }
      })
      return links
    })()).id( d => {return d.id; })
      .distance(30)
      .strength(0.5))
});

const updateSvgObjects = ({ message, topic, consumer, topicLink, labelMessage, labelTopic, labelConsumer, container, messages, topics, consumers }, {height, width, color, messageRepel, departureDelay}) => ({
  
  topic: topic
  .data(topics)
  .enter()
  .append("circle")
  .attr("r", 5)
  .attr("name", (topic) => topic.id )
  .attr("fill", (d) => { return color(d.partition); })
  .merge(topic),
  
  consumer: consumer
  .data(consumers)
  .enter()
  .append("circle")
  .attr("r", 5)
  .attr("name", (consumer) => consumer.id )
  .attr("fill", (d) => { return color(4); })
  .merge(consumer),
  
  message: message
      .data(messages)
      // .remove()
      .enter()
      .append("circle")
      .attr("r", 3)
      .attr("name", (message) => message.id )

      .attr("x", function(this: any, message, index, messages) {
          // Set starting position on tick 1
          message = setSourceIfAvailable(message, this.topics)
          message.departureDelay = departureDelay  
          return message.x
          
      }
        .bind({
          d3: d3,
          departureDelay : departureDelay,
          width: width,
          topics: topics,
        })
      )
        
        .attr("y", function(this: any, message, index, messages) {
          // Set starting position on tick 1
          message = setSourceIfAvailable(message, this.topics)
          message.departureDelay = departureDelay  
          return message.y
        }
          .bind({
            departureDelay : departureDelay,
            height: height,    
            topics: topics,
          })
        )
      .attr("fill", (d) => { return color(d.group); })
      .merge(message),

  topicLink : topicLink
  .data(( () => {
    let links : Array<any> = [] ;
    messages.forEach((item) => {
      let existing = links.find( element => element.source == item.source && element.target == item.target ) ;
      if(!existing){
        links.push({
          source : item.source,
            target : item.target,
            index : 1
          })
        }
      })
      return links
    })())
    .enter()
    .append("line")
    // .attr("stroke", "#fff")
    // .attr("stroke-opacity", 0.1)
    // .attr("stroke-width", "1px")
    .merge(topicLink),
    // Labels
    
    // TODO: enable labels for message? Not sure about that
    // labelMessage: labelMessage
    //   .data(
      //     messages.map(message => {
        //       return { "message" : message }
        //     })
        //   )
        //   .enter()
        //   .append("text")
        //   .text(function(d, i) { 
  //     return  d.message.id;
  //   })
  //   .style("fill", "#555")
  //   .style("font-family", "Arial")
  //   .style("font-size", 12)
  //   .style("pointer-events", "none")  // to prevent mouseover/drag capture
  //   .merge(labelMessage),
  
  labelTopic: labelTopic
  .data(
    topics.map(topic => {
      return { "topic" : topic }
    })
    )
    .enter()
    .append("text")
    .text(function(d, i) { 
      return  d.topic.id;
    })
    .style("fill", "#555")
    .style("font-family", "Arial")
    .style("font-size", 12)
    .style("pointer-events", "none")  // to prevent mouseover/drag capture
    .merge(labelTopic),
    
    labelConsumer: labelConsumer
    .data(
      consumers.map(consumer => {
        return { "consumer" : consumer }
      })
      )
      .enter()
      .append("text")
      .text(function(d, i) { 
        return  d.consumer.id;
      })
      .style("fill", "#555")
      .style("font-family", "Arial")
    .style("font-size", 12)
    .style("pointer-events", "none")  // to prevent mouseover/drag capture
    .merge(labelConsumer)

});


const initSvgContainer = ({messages, topics, consumers}, {width, height}) => ({
  // TODO: Check if we can remove the .data() here
  message: d3.select("#viz").append("g").attr("class", "messages").selectAll("g").data(messages),
  topic: d3.select("#viz").append("g").attr("class", "topics").selectAll("g").data(topics),
  consumer: d3.select("#viz").append("g").attr("class", "consumers").selectAll("g").data(consumers),
  topicLink: d3.select("#viz").append("g").attr("class", "topicLinks").selectAll("line").data((()=>{
    let links : Array<any> = [] ;
    messages.forEach((item) => {
      let existing = links.find( element => element.source == item.source && element.target == item.target ) ;
      if(!existing){
        links.push({
          source : item.source,
          target : item.target,
          index : 1
        })
      }
    })
    return links
  })()),
  labelMessage : d3.select("#viz").append("g").attr("class", "labelMessage").selectAll("text").data(
    messages.map(message => {
      return { "message" : message }
    })
  )
    .text(function(d, i) { 
      return  d.message.id;
    }
  ),
  labelTopic : d3.select("#viz").append("g").attr("class", "labelTopic").selectAll("text").data(
    topics.map(topic => {
      return { "topic" : topic }
    })
  )
    .text(function(d, i) { 
      return  d.topic.id;
    }
  ),
  labelConsumer : d3.select("#viz").append("g").attr("class", "labelConsumer").selectAll("text").data(
    consumers.map(consumer => {
      return { "consumer" : consumer }
    })
  )
    .text(function(d, i) { 
      return  d.consumer.id;
    }
  ),
  svg: d3.select("#viz")
      // FIXME: zoom is not working properly in Grafana
      .call(
        d3.zoom()
        .scaleExtent([0.5, 20])
        .on("zoom", () => { d3.select("#viz").attr("transform", d3.event.transform); })
      )
      .attr("width", width).attr("height", height),
      // .attr("transform", ("scale(" + defaultScale + ")") ),
  container : d3.select("#viz").append("g")
});



// const updateMessageLinks = ({ consumers, messageLayout }, {width, height, messageTargetAttraction}) => ({
//   totalLayout: messageLayout
//   .force("link", d3.forceLink([
//     {
//       source: "topic A",
//       target: "consumer A",
//       index : 1
//     }
//   ]).id( d => {
//     console.log(d)
//     return d.id; 
//   }).distance(300).strength(1))
// })

// const updateTargetPosition = ({ messages, consumers, messageLayout, nodeLayout}, {messageRemoveDist, width, height, messageTargetAttraction}) => ({
//       messageLayout: messageLayout

//     .force("x", d3.forceX().x((message)=>{
//       if(message.departureDelay == 1){
//         let target = consumers.find(el => el.id == message.target)
//         if(target){
//           return target.x
//         }
//       }
//       return message.x
//     }
//       // function(this: any, message, index, messages) {
//       //   if(message.departureDelay == 1){
//       //     let consumers = this.consumers;
//       //     let target = consumers.find(el => el.id == message.target)

//       //     console.log(message.target, target)
//       //     if(target){
//       //       return target.x
//       //     }
//       //   }
//       // }.bind({
//       //   width: width,
//       //   messageLayout: messageLayout,
//       //   consumers: consumers,
//       // })  
//       )  
//       .strength(0.1)
//       ) 
//       .force("y", d3.forceY().y((message) => {
//         if(message.departureDelay == 1){
//           let target = consumers.find(el => el.id == message.target)
//           if(target){
//             return target.y
//           }
//         }
//         return message.y
//       }
//         // function(this: any, message, index, messages){
//         // if(!message.departureDelay){
//         //   let target = this.consumers.find(element => element.id == message.target)
//         //   if(target){
//         //     return target.y
//         //   }  
//         // }
//     //     // throw "dafaq"
//     //   }.bind({
//     //     height: height,
//     //     messageLayout: messageLayout,
//     //     consumers : consumers
//     //   })  
//     )   
//       .strength(0.1)
//     ),  
//     messages : messages.filter((message, index, messages) => {
//       // Remove arrived messages
//       let endNode = consumers.find(element => element.id == message.target);
//       let endNodeDistance = Math.sqrt( ( message.x - endNode.x ) * (message.x - endNode.x ) + ( message.y - endNode.y ) * ( message.y - endNode.y ) );
//       if(endNodeDistance > messageRemoveDist){
//           console.log("removed ", message.id)
//           return true
//       }
//       return false
//     })
    
// });    

// const updateSourcePosition = ({ topics, messages}, { width, height, departureDelay}) => ({
//       messages: messages.map((message)=> {
//         if(!message.departureDelay){
//           let source = topics.find(element => element.id == message.source)
//           if(source){
//             message.departureDelay = departureDelay
//             message.sourceX = source.x
//             message.sourceY = source.y
//           }else{
//             console.log("No target")
//             message.sourceX = width / 2
//             message.sourceY = height / 2
//           }
//         }
//         return message
//       })
    
// });    

const nodeTicked = function(this: any) {
  // console.log("node ticked")
  

  function updateNode(node) {
      node.attr("transform", function(this: any, node) {
          return "translate(" + fixna(node.x) + "," + fixna(node.y) + ")";
      });    
  }    
  

  if(this.state != undefined){

   

    if(this.state.topic){
      this.state.topic.call(updateNode );
    }  
    
    if(this.state.consumer){
      this.state.consumer.call(updateNode);
    }  

    // if(this.state.topicLink){
    //   (() => {        
    //       let nodes : Array<any> = [...this.state.consumers, ...this.state.topics];
    //       this.state.topicLink
    //       .attr("x1", (d) => {
    //           let node = nodes.find(element => element.id == d.source )
    //           return fixna(node.x); 
    //         })
    //       .attr("x2", (d) => {
    //           let node = nodes.find(element => element.id == d.target )
    //           return fixna(node.x); 
    //         })
    //       .attr("y1", (d) => {
    //           let node = nodes.find(element => element.id == d.source )
    //           return fixna(node.y); 
    //         })
    //       .attr("y2", (d) => {
    //           let node = nodes.find(element => element.id == d.target )
    //           return fixna(node.y); 
    //         })
    //   })()      
    // }
    
  
  
    // this.state.messagelabelLayout.alphaTarget(0.3).restart();
    // this.state.topiclabelLayout.alphaTarget(0.5).restart();
    // this.state.consumerlabelLayout.alphaTarget(0.1).restart();
  
  
    if(this.state.labelTopic){
      this.state.labelTopic.each(function(this: any, d, i) {
              d.x = d.topic.x + 10;
              d.y = d.topic.y;
      
      });        
      this.state.labelTopic.call(updateNode);
    }  

    if(this.state.labelConsumer){
      this.state.labelConsumer.each(function(d, i) {
              d.x = d.consumer.x + 10;
              d.y = d.consumer.y;
      });        
      this.state.labelConsumer.call(updateNode);
    }  
  }  
   
}


const setSourceIfAvailable = (message, topics) => {
  let source = topics.find(element => element.id == message.source)
  if(source){ // Should always be true
    if(source.x && source.y){ // If source is now rendered, otherwise skip
      message.sourceX = source.x
      message.sourceY = source.y

      message.x = message.sourceX;
      message.y = message.sourceY;
    }
  }
  return message
}

const messageTicked = function(this: any) {
    console.log("message ticked")
    
  
    const updateNode = (node) => {
        node.attr("transform", (nodeItem) => {
          return "translate(" + fixna(nodeItem.x) + "," + fixna(nodeItem.y) + ")";
        });    
    }    
    
    const updateMessage = (message, topics) => {
      // TODO: update to another function
      message.attr("transform", function(message){
        // TODO: relocate departure delay behavior, but working properly, Sets initial X and Y based on attribute
        if(message.sourceX){
          message.x = message.sourceX;
        }
        if(message.sourceY){
          message.y = message.sourceY;
        }
        
        if(message.departureDelay){
          if(message.departureDelay == 1){ // message cna now go to target            
            if(message.sourceX){
              delete message.sourceX;
            }
            if(message.sourceY){
              delete message.sourceY
            }
          } else{ // Either a normal "step" OR the source was not rendered yet and might be rendered now! (still performing step!)
            // if(message.sourceX == undefined || message.sourceY == undefined ){ // Source was not rendered while message was being rendered
            message = setSourceIfAvailable(message, topics)
            // }
            message.departureDelay = message.departureDelay - 1; // Step
          }
        }
        if (! (isNaN(message.x) && isNaN(message.y) ) ) {
          return "translate(" + fixna(message.x) + "," + fixna(message.y) + ")";
        }
        return null
        });    
    }    
  
    if(this.state != undefined){
  
      if(this.state.message){
        // TODO: pushing this.state.topics can be prettier
        updateMessage(this.state.message, this.state.topics);
        // TODO: Enable...?
        // this.setState(updateSvgObjects, ()=>{
        //   this.setState(updateTargetPosition)
        // })     
      }  

      if(this.state.labelMessage){
        this.state.labelMessage.each(function(d, i) {
          d.x = d.message.x + 10;
          d.y = d.message.y;
        });  
        updateNode(this.state.labelMessage);
      }    
    }      
}
  
  


export class KafkaD3 extends Component<GraphOps, GraphState> {

  public static defaultProps = {
      width: 800,
      height: 1000,
      defaultScale: 0.25,
      color: d3.scaleOrdinal(d3.schemeCategory10),
      endNodeRemoveDist: 30,
      messageTargetAttraction: 0.5,
      messageRepel: -5,
      nodeCharge: -50,
      departureDelay: 30000000000,
      messageRemoveDist: 100
  };

  public defaultState = {
    topics: [],
    consumers: [],
    messages: []
  };
  
  initDrawing(this: any){
    this.setState(this.defaultState)
  }

  // Before the component mounts, we initialise our state
  componentWillMount(this: any) {
    this.initDrawing()
  }

  refresh(callback: any){
    // TODO: remove ugly nesting
    this.setState(updateSvgObjects,
      () => {
        this.setState(updateLayouts,
          () => {
            this.state.messageLayout.on('tick', messageTicked.bind(this))
            this.state.nodeLayout.on('tick', nodeTicked.bind(this))
            this.setState({
              messageLayout : this.state.messageLayout,
              nodeLayout : this.state.nodeLayout
            },
            () => {
              // this.setState(updateTargetPosition, () => {
                this.handleDrag()
                callback()
              // })
            })
          });
      });
  }

  
  handleDrag(){

    function dragstarted(this: any, d: any) {
        d3.event.sourceEvent.stopPropagation();
        // TODO: Fix variable alfa target here
        if (!d3.event.active){ 
          this.alphaTarget(0.3).restart()
        };
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(this: any, d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(this: any, d) {
        if (!d3.event.active) {
          this.alphaTarget(0);
        }
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
            
    this.state.consumer.call(
      d3.drag()
      .on("start", dragstarted.bind(this.state.nodeLayout))
      .on("drag", dragged.bind(this.state.nodeLayout))
      .on("end", dragended.bind(this.state.nodeLayout))
      );
      
    }
            
            
            
  // After the component did mount, we set the state each second.
  componentDidMount(this: any) {
        
        (() =>{ // init some data
          this.state.consumers.push({
            "id": "consumer A",
            "group": 1,
            "size" : 10,
          })
          this.state.topics.push({
            "id": "topic A",
            "group": 1,
            "size" : 10,
          })
          this.state.consumers.push({
            "id": "consumer B",
            "group": 1,
            "size" : 10,
          })
          this.state.topics.push({
            "id": "topic B",
            "group": 1,
            "size" : 10,
          })
          this.state.consumers.push({
            "id": "consumer C",
            "group": 1,
            "size" : 10,
          })
          this.state.topics.push({
            "id": "topic C",
            "group": 1,
            "size" : 10,
          })
  
          this.state.messages.push({
            "id": ("Generated " + Math.random()),
            "group": 1,
            "size" : 10,
            "source" : "topic A",
            "target" : "consumer A"
          })
          this.setState({
            messages: this.state.messages,
            topics: this.state.topics,
            consumers: this.state.consumers
          }, ()=>{
            // Now the data is initialized
            
            //TODO: solve ugly nesting
            this.setState(
              initSvgContainer, () => {
                this.refresh(
                  () => {
                    console.log("refresh")
                  }
                )
              }
            )     

          })
        })()        
  }
  // render will know everything!
  render() {
  return <svg id='viz'></svg>
  }
}

export default KafkaD3