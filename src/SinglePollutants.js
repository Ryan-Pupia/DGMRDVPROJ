import React, { Component } from 'react';
import * as d3 from 'd3';

class SinglePollutants extends Component {
    componentDidUpdate(prevProps) {
        if (prevProps.csv_data !== this.props.csv_data || prevProps.choicePollutant !== this.props.choicePollutant || prevProps.timeRange !== this.props.timeRange) {
            this.renderTimeSeries();
        }
    }

    renderTimeSeries = () => {
        const { csv_data, choicePollutant, timeRange } = this.props;

        if (!choicePollutant) return;

        const sensorColumnMap = {
            "CO(GT)": "PT08.S1(CO)",
            "NMHC(GT)": "PT08.S2(NMHC)",
            "NOx(GT)": "PT08.S3(NOx)",
            "NO2(GT)": "PT08.S4(NO2)",
            "C6H6(GT)": null,  // No corresponding PT08 column for C6H6
            "PT08.S5(O3)": "PT08.S5(O3)"  // Ozone has only PT08
        };
        const gtColumn = choicePollutant.includes("PT08") ? null : choicePollutant;
        const sensorColumn = sensorColumnMap[choicePollutant] || (choicePollutant.includes("PT08") ? choicePollutant : null);

        // Determine the correct column to filter data on
        const dataColumn = gtColumn || sensorColumn;
        const data = csv_data.filter(d => d[dataColumn] !== null);

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
            .domain([0, d3.max(filteredData, d => Math.max(d[gtColumn] || 0, sensorColumn ? d[sensorColumn] : 0))])
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

        // Add GT line if applicable
        if (gtColumn) {
            svg.append("path")
                .datum(filteredData)
                .attr("fill", "none")
                .attr("stroke", "blue")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(d => xScale(new Date(d.Date)))
                    .y(d => yScale(d[gtColumn]))
                );
        }

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

        if (gtColumn) {
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
        }

        if (sensorColumn) {
            legend.append("rect")
                .attr("x", 750)
                .attr("y", gtColumn ? 20 : 0)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", "red");

            legend.append("text")
                .attr("x", 770)
                .attr("y", gtColumn ? 30 : 10)
                .attr("dy", "-0.25em")
                .style("text-anchor", "start")
                .text("Sensor");
        }
    }

    render() {
        return (
            <div>
                <svg className="timeSeries"></svg>
            </div>
        );
    }
}

export default SinglePollutants;
