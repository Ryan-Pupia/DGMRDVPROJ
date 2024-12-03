import React, { Component } from 'react';
import * as d3 from 'd3';

class SinglePollutants extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPollutant: null,
            timeRange: [0, 100],  
        };
    }

    handlePollutantChange = (event) => {
        this.setState({ selectedPollutant: event.target.value });
    }

    handleSliderChange = (event) => {
        const value = event.target.value;
        this.setState({ timeRange: [0, value] });
    }

    renderTimeSeries = () => {
        const { csv_data } = this.props;
        const { selectedPollutant, timeRange } = this.state;

        if (!selectedPollutant) return;

        const gtColumn = selectedPollutant;
        const sensorColumnMap = {
            "CO(GT)": "PT08.S1(CO)",
            "NMHC(GT)": "PT08.S2(NMHC)",
            "NOx(GT)": "PT08.S3(NOx)",
            "NO2(GT)": "PT08.S4(NO2)",
            "C6H6(GT)": null,  //No corresponding PT08 column for C6H6
            "PT08.S5(O3)": "PT08.S5(O3)"  //03 has only PT08
        };
        const sensorColumn = sensorColumnMap[selectedPollutant];

        const data = csv_data.filter(d => d[gtColumn] !== null);

        const startDate = new Date(data[0].Date);
        const endDate = new Date(data[data.length - 1].Date);
        const totalTime = endDate - startDate;
        const filteredData = data.filter(d => {
            const date = new Date(d.Date);
            const timePassed = date - startDate;
            const percentPassed = (timePassed / totalTime) * 100;
            return percentPassed >= timeRange[0] && percentPassed <= timeRange[1];
        });

        const xScale = d3.scaleTime()
            .domain([new Date(filteredData[0].Date), new Date(filteredData[filteredData.length - 1].Date)])
            .range([0, 800]); 
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => Math.max(d[gtColumn], sensorColumn ? d[sensorColumn] : 0))])
            .range([400, 0]); 

        d3.select(".timeSeries").selectAll("*").remove();

        const svg = d3.select(".timeSeries")
            .attr("width", 900)
            .attr("height", 450)
            .append("g")
            .attr("transform", "translate(50, 20)");

        svg.append("g")
            .attr("transform", "translate(0, 400)")
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .call(d3.axisLeft(yScale));

        svg.append("path")
            .datum(filteredData)
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => xScale(new Date(d.Date)))
                .y(d => yScale(d[gtColumn]))
            );

        if (sensorColumn) {
            svg.append("path")
                .datum(filteredData)
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(d => xScale(new Date(d.Date)))
                    .y(d => yScale(d[sensorColumn]))
                );
        }

        //Legend
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(50,10)");

        legend.append("rect")
            .attr("x", 750)
            .attr("y", 0)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", "blue");

        legend.append("text")
            .attr("x", 770)
            .attr("y", 10)
            .attr("dy", "-0.25em")
            .style("text-anchor", "start")
            .text("GT");

        if (sensorColumn) {
            legend.append("rect")
                .attr("x", 750)
                .attr("y", 20)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", "red");

            legend.append("text")
                .attr("x", 770)
                .attr("y", 30)
                .attr("dy", "-0.25em")
                .style("text-anchor", "start")
                .text("Sensor");
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.selectedPollutant !== this.state.selectedPollutant ||
            prevState.timeRange !== this.state.timeRange) {
            this.renderTimeSeries();
        }
    }

    render() {
        const options = [
            "CO(GT)", "NMHC(GT)", "NOx(GT)", "NO2(GT)", "C6H6(GT)", "PT08.S5(O3)"  
        ];

        return (
            <div>
                <label>Select Pollutant:</label>
                <select onChange={this.handlePollutantChange} defaultValue="">
                    <option value="" disabled>Select a pollutant</option>
                    {options.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <br />
                <label>Time Range:</label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={this.state.timeRange[1]}
                    onChange={this.handleSliderChange}
                />
                <svg className="timeSeries"></svg>
            </div>
        );
    }
}

export default SinglePollutants;