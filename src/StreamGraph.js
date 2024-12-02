import React, { Component } from "react";
import * as d3 from "d3";

class StreamGraph extends Component {
    componentDidUpdate() {
      this.renderStreamGraph();
    }
  
    renderStreamGraph = () => {
      // get data
      const data = this.props.csv_data;
      console.log("In StreamGraph, data:", data)
    
      // set dimensions and margins
      const margin = { top: 40, right: 40, bottom: 40, left: 40 };
      const width = 500;
      const height = 300;
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
    
      // get max sum for y axis
      
    
      // create svg container

    
      // create area stacks
      
    
      // create x and y scales
      
      
      // create area generation
      
    
      // display streamgraph
      
    
      // add x-axis
    
      // add legend

    }
  
    render() {
      return (
        <div style={{ position: "relative" }}>
          <svg className="streamGraph"><g></g></svg>
        </div>
      );
    }
  }
  
  export default StreamGraph;