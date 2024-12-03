import React, { Component } from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import * as d3 from 'd3';

class SinglePollutants extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPollutant: null,
            timeRange: [0, 100],  // Initial time range percentage
        };
    }

    handlePollutantChange = (option) => {
        this.setState({ selectedPollutant: option.value });
    }

    handleSliderChange = (range) => {
        this.setState({ timeRange: range });
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
            "C6H6(GT)": null,  // No corresponding PT08 column for C6H6
            "PT08.S5(O3)": "PT08.S5(O3)"  // Ozone has only PT08
        };
        const sensorColumn = sensorColumnMap[selectedPollutant];

        const data = csv_data.filter(d => d[gtColumn] !== null);

        // Filter data based on time range
        const startDate = new Date(data[0].Date);
        const endDate = new Date(data[data.length - 1].Date);
        const totalTime = endDate - startDate;
        const filteredData = data.filter(d => {
            const date = new Date(d.Date);
            const timePassed = date - startDate;
            const percentPassed = (timePassed / totalTime) * 100;
            return percentPassed >= timeRange[0] && percentPassed <= timeRange[1];
        });

        // Set up D3 scales
        const xScale = d3.scaleTime()
            .domain([new Date(filteredData[0].Date), new Date(filteredData[filteredData.length - 1].Date)])
            .range([0, 800]); // Width of the graph
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => Math.max(d[gtColumn], sensorColumn ? d[sensorColumn] : 0))])
            .range([400, 0]); // Height of the graph

        // Clear previous SVG elements
        d3.select(".timeSeries").selectAll("*").remove();

        // Append new SVG elements
        const svg = d3.select(".timeSeries")
            .attr("width", 900)
            .attr("height", 450)
            .append("g")
            .attr("transform", "translate(50, 20)");

        // Add X Axis
        svg.append("g")
            .attr("transform", "translate(0, 400)")
            .call(d3.axisBottom(xScale));

        // Add Y Axis
        svg.append("g")
            .call(d3.axisLeft(yScale));

        // Add GT line
        svg.append("path")
            .datum(filteredData)
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => xScale(new Date(d.Date)))
                .y(d => yScale(d[gtColumn]))
            );

        // Add Sensor line if applicable
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

        // Add legend
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
            "CO(GT)", "NMHC(GT)", "NOx(GT)", "NO2(GT)", "C6H6(GT)", "PT08.S5(O3)"  // Include all relevant pollutants
        ];

        return (
            <div>
                <Dropdown
                    options={options}
                    onChange={this.handlePollutantChange}
                    placeholder="Select a pollutant"
                />
                <Slider
                    range
                    defaultValue={[0, 100]}
                    onChange={this.handleSliderChange}
                />
                <svg className="timeSeries"></svg>
            </div>
        );
    }
}

export default SinglePollutants;
