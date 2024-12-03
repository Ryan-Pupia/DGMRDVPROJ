import React, { Component } from "react";
import FileUpload from "./FileUpload";
import StreamGraph from "./StreamGraph";
import ColumnList from "./ColumnList";
import Dropdown from "./Dropdown";
import ScatterPlots from "./ScatterPlots";
import SinglePollutants from "./SinglePollutants"; 
import "./DropdownSP.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      choicePollutant: "",
      pollutant: [],
      timeRange: [0, 100],
    };
  }


  set_data = (csv_data)=>{
    const pollutant = Object.keys(csv_data[0]).filter(
      (key)=>
        key!== "Date" && key!== "Time" && key!== "T" && key!== "RH" && key!== "AH"
    );

    this.setState({
      data: csv_data,
      pollutant,
      choicePollutant: pollutant[0],
    });

    console.log(csv_data);
  };

  polSel =(pollutant) => {
    this.setState({ choicePollutant: pollutant });
  };

  handleSliderChange = (event) => {
    const value = event.target.value;
    this.setState({ timeRange: [0, value] });
  }

  render(){
    const{ data, choicePollutant, pollutant, timeRange } = this.state;

    return(
      <div className="App">
        {/* File Upload */}
        <FileUpload set_data={this.set_data} />

        {/* Dropdown component */}
        {pollutant.length > 0 && (
          <div className="dropdown-container">
            <Dropdown
              columns={pollutant}
              onSelect={this.polSel}
            />
          </div>
        )}

        <label>Time Range:</label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={timeRange[1]} 
          onChange={this.handleSliderChange} 
        />



        {/* Column List */}
        <div className="column-list-container">
          <ColumnList csv_data={data} />
        </div>

        {/* Stream Graph */}
        <div>
          <StreamGraph csv_data={data} />
        </div>

        {/* Single Pollutants Visualization */}
        <div>
          {choicePollutant && (
            <SinglePollutants 
              csv_data={data} 
              columns={pollutant} 
              choicePollutant={choicePollutant} 
              timeRange={timeRange}
            />
          )}
        </div>


        {/* Scatter Plots */}
        {choicePollutant && (
          <div className="scatterplots-container">
            <ScatterPlots
              csv_data={data}
              choicePollutant={choicePollutant}
            />
          </div>
        )}
      </div>
    );
  }
}

export default App;

