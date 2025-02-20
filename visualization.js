function averageOverMake(makes, data) {
    var averagedData = makes.map(m => {
        const makeData = data.filter(d => { return d.Make == m; });
        const meanAverageCityMPG = d3.mean(makeData.map(d => { return d.AverageCityMPG; }));
        const meanAverageHighwayMPG = d3.mean(makeData.map(d => { return d.AverageHighwayMPG; }));

        return {
            Make: m,
            EngineCylinders: d3.mean(makeData.map(d => { return d.EngineCylinders; })),
            AverageCityMPG: meanAverageCityMPG,
            AverageHighwayMPG: meanAverageHighwayMPG,
            AverageCombinedMPG: (meanAverageCityMPG + meanAverageHighwayMPG) / 2.0,
        };
    });

    return averagedData;
}

async function init() {
    // Set the default parameters
    var scene = 1;
    var measure = "AverageCityMPG";
    var selectedFuel = ["Diesel", "Electricity", "Gasoline"];
    var cylinderRange = [0, 12];

    //Read the raw data and extract the unique car makes
    const rawData = await d3.csv("https://flunky.github.io/cars2017.csv");
    const makes = [...new Set(rawData.map(d => { return d.Make; }))];

    // set the dimensions and margins of the graph
    const margin = { top: 10, right: 150, bottom: 40, left: 100 };
    const width = 1400 - margin.left - margin.right;
    const height = 650 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#narrative_visualization")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Process data according to parameters
    const inSelectedFuel = d => { return selectedFuel.includes(d.Fuel); };
    const inCylinderRange = d => { return d.EngineCylinders >= cylinderRange[0] && d.EngineCylinders <= cylinderRange[1]; };
    const filteredData = rawData.filter(inSelectedFuel).filter(inCylinderRange);
    var data = averageOverMake(makes, filteredData);
    data.sort((a, b) => { return a[measure] - b[measure]; });

    // Add X axis
    var x = d3.scaleLinear()
        .domain([0, 150])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(-height * 1.3))
        .select(".domain").remove();

    // Add Y axis
    var y = d3.scaleBand()
        .domain(data.map(d => { return d.Make; }))
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y))
        .select(".domain").remove();

    // Add X axis label:
    const measureLabel = measure.replace(/([a-z])([A-Z])/g, '$1 $2');
    var xLabel = svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + margin.top + 20)
        .text(measureLabel);

    // Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top)
        .text("Make");

    // Color scale: light blue (0 Cylinders) to dark blue (12 Cylinders)
    var color = d3.scaleLinear()
        .domain(cylinderRange)
        .range(["#66b3ff","#003366"]);

    // Add bars
    svg.append('g')
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", () => { return 0; })
        .attr("y", d => { return y(d.Make); })
        .attr("height", y.bandwidth())
        .attr("width", d => { return x(d[measure]); })
        .style("fill", d => { return color(d.EngineCylinders) });

    // Add legend
    const cylinderCount = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const legendWidth = 30;
    svg.append("g")
        .attr("class", "legendLinear")
        .attr("transform", "translate(" + (margin.left + width - 0.5 * margin.right) + "," + margin.top + ")");

    svg.select(".legendLinear")
        .selectAll(".legendColor")
        .data(cylinderCount)
        .enter()
        .append("rect")
        .attr("class", "legendColor")
        .attr("x", () => { return 0; })
        .attr("y", (d, i) => { return (i + 1) * 20; })
        .attr("height", 15)
        .attr("width", d => { return legendWidth; })
        .style("fill", d => { return color(d) });

    svg.select(".legendLinear")
        .selectAll(".legendLabel")
        .data(cylinderCount)
        .enter()
        .append("text")
        .attr("class", "legendLabel")
        .attr("x", () => { return legendWidth + 10; })
        .attr("y", (d, i) => { return (i + 1.7) * 20; })
        .attr("height", 15)
        .attr("width", d => { return legendWidth; })
        .text(d => { return d })
        .style("fill", "#333");

    svg.select(".legendLinear")
        .append("text")
        .text("Engine Cylinders")

    // Features of the annotation, by scene
    const annotations = [
        // Scene 1
        [
            {
                note: {
                    title: "Market Leader",
                    label: "Tesla takes the lead in Average City MPG, showcasing its advantage in electric vehicle efficiency.",
                    wrap: 400
                },
                x: 500,
                y: 10,
                dy: 50,
                dx: 50,
                color: "#333"
            }
        ],
        // Scene 2
        [
            {
                note: {
                    title: "Highway Efficiency Hero",
                    label: "Unlike most electric vehicles whose efficiency dips on the highway, Tesla bucks the trend with an increase in MPG, suggesting potential advancements in their battery technology.",
                    wrap: 200
                },
                x: 550,
                y: 10,
                dy: 50,
                dx: 50,
                color: "#333"
            }
        ],
        // Scene 3
        [
            {
                note: {
                    title: "Fleet Efficiency Focus",
                    label: "While Tesla dominates in terms of individual car efficiency, the title of most fuel-efficient electric fleet goes to Hyundai. This suggests Hyundai might excel in optimizing efficiency across their entire electric vehicle range.",
                    wrap: 300
                },
                x: 750,
                y: 20,
                dy: 150,
                dx: -50,
                color: "#333"
            }
        ],
        // Scene 4
        [
            {
                type: d3.annotationCalloutCircle,
                note: {
                    title: "Shifting Gears: Electric Takes the Lead",
                    label: "Electric vehicles surge in efficiency, leaving traditional cars behind. Fuel efficiency becomes a chasm, separating electric vehicles from the declining performance of gas-powered cars.",
                    wrap: 300
                },                        
                subject: {
                    radius: 75
                },
                x: 250,
                y: 75,
                dy: 100,
                dx: 150,
                color: "#333"
            },
            {
                note: {
                    title: "Electric Shift Leaves Smart Car Stuck in Gas Lane",
                    label: "Known for its 3-cylinder engines, Smart car got left behind as the industry embraced electric vehicles.",                    
                    wrap: 300
                },
                connector: {
                  end: "arrow"
                },
                x: 200,
                y: 115,
                dy: 200,
                dx: 150,
                color: "#333"
            }
        ],
    ];

    // Add annotation to the chart
    const makeAnnotations = d3.annotation()
        .annotations(annotations[0]);

    svg
        .append("g")
        .attr("class", "annotation");
    
    d3.select(".annotation")
        .call(makeAnnotations);
    
    d3.select("input#slider-range")
        .on("change", function() {
            if (scene < 4) {
                this.value = 12;
                this.disabled = true;
                return;
            }

            cylinderRange = [0, parseInt(this.value)];
            d3.select("output#slider-value")
                .property("value", cylinderRange[1]);
            update(cylinderRange, selectedFuel, measure);
            d3.select(".annotation")
                .call(d3.annotation());
        });

    d3.select("form#checkbox-selection")
        .selectAll(("input"))
        .on("change", function() {
            if (this.checked) {
                selectedFuel = selectedFuel.filter(d => { return d != this.value; });
            }
            else
            {
                selectedFuel.push(this.value);
                selectedFuel.sort();
            }
            update(cylinderRange, selectedFuel, measure);
            d3.select(".annotation")
                .call(d3.annotation());
        });

    d3.select("select#dropdown-selection")
        .on("change", function() {
            measure = this.value;
            update(cylinderRange, selectedFuel, measure);
            d3.select(".annotation")
                .call(d3.annotation());
        });

    d3.select("button#arrow-previous")
        .on("click", function() {
            scene -= 1;

            d3.select("button#arrow-next")
                .property("disabled", false);

            if (scene < 4) {
                d3.select("p#slider-label")
                    .property("style", "color:gray");
                cylinderRange = [0, 12];
                d3.select("input#slider-range")
                    .property("value", cylinderRange[1])
                    .property("disabled", true);
                d3.select("output#slider-value")
                    .property("value", cylinderRange[1]);

                selectedFuel = ["Electricity"];
                d3.select("form#checkbox-selection")
                    .select("input[value=Diesel]")
                    .property("checked", true);
                d3.select("form#checkbox-selection")
                    .select("input[value=Gasoline]")
                    .property("checked", true);

                d3.select("p#dropdown-label")
                    .property("style", "color:grey");
                d3.select("select#dropdown-selection")
                    .selectAll("option")
                    .property("disabled", true)

                d3.select("p#checkbox-label")
                    .property("style", "color:grey");
                d3.select("form#checkbox-selection")
                    .selectAll("input")
                    .property("disabled", true)
            }

            if (scene < 3) {
                measure = "AverageHighwayMPG";
                d3.select("select#dropdown-selection")
                    .select("option[value=" + measure + "]")
                    .property("selected", true);

                d3.select("p#checkbox-label")
                    .property("style", "color:grey");
                selectedFuel = ["Diesel", "Electricity", "Gasoline"];
                d3.select("form#checkbox-selection")
                    .selectAll("input")
                    .property("disabled", true)
                    .property("checked", false);
            }

            if (scene < 2) {
                d3.select("p#dropdown-label")
                    .property("style", "color:grey");
                measure = "AverageCityMPG";
                d3.select("select#dropdown-selection")
                    .selectAll("option")
                    .property("disabled", true)
                    .property("selected", false);
                d3.select("select#dropdown-selection")
                    .select("option[value=" + measure + "]")
                    .property("selected", true);
            }

            if (scene == 1) {
                this.disabled = true;
            }

            update(cylinderRange, selectedFuel, measure);
            d3.select(".annotation")
                .call(d3.annotation().annotations(annotations[scene - 1]));
        });

    d3.select("button#arrow-next")
        .on("click", function() {
            scene += 1;

            d3.select("button#arrow-previous")
                .property("disabled", false);

            if (scene >= 2) {
                
                measure = "AverageHighwayMPG";
                d3.select("select#dropdown-selection")
                    .select("option[value=" + measure + "]")
                    .property("selected", true);
            }

            if (scene >= 3) {
                measure = "AverageCombinedMPG";
                d3.select("select#dropdown-selection")
                    .select("option[value=" + measure + "]")
                    .property("selected", true);
                selectedFuel = ["Electricity"];
                d3.select("form#checkbox-selection")
                    .select("input[value=Diesel]")
                    .property("checked", true);
                d3.select("form#checkbox-selection")
                    .select("input[value=Gasoline]")
                    .property("checked", true);
            }

            if (scene == 4) {
                this.disabled = true;

                d3.select("p#slider-label")
                    .property("style", "color:black");
                selectedFuel = ["Diesel", "Electricity", "Gasoline"];
                d3.select("form#checkbox-selection")
                    .selectAll("input")
                    .property("checked", false);

                cylinderRange = [0, 4];
                d3.select("input#slider-range")
                    .property("value", cylinderRange[1])
                    .property("disabled", false);
                d3.select("output#slider-value")
                    .property("value", cylinderRange[1]);
                
                d3.select("p#dropdown-label")
                    .property("style", "color:black");
                d3.select("select#dropdown-selection")
                    .selectAll("option")
                    .property("disabled", false);
                
                d3.select("p#checkbox-label")
                    .property("style", "color:black");
                d3.select("form#checkbox-selection")
                    .selectAll("input")
                    .property("disabled", false);
            }

            update(cylinderRange, selectedFuel, measure);
            d3.select(".annotation")
                .call(d3.annotation().annotations(annotations[scene - 1]));
        });

    function update(cylinderRange, selectedFuel, measure) {
        // Process data according to parameters
        const inSelectedFuel = d => { return selectedFuel.includes(d.Fuel); };
        const inCylinderRange = d => { return d.EngineCylinders >= cylinderRange[0] && d.EngineCylinders <= cylinderRange[1]; };
        const filteredData = rawData.filter(inSelectedFuel).filter(inCylinderRange);
        var data = averageOverMake(makes, filteredData);

        // Update bars
        updateBars = svg.selectAll(".bar")
            .data(data);
        
        updateBars
            .enter()
            .append("rect")
            .merge(updateBars)
            .transition()
            .duration(1000)
                .attr("class", "bar")
                .attr("x", () => { return 0; })
                .attr("y", d => { return y(d.Make); })
                .attr("height", y.bandwidth())
                .attr("width", d => { return x(d[measure]); })
                .style("fill", d => { return color(d.EngineCylinders) });

        // Update label
        const measureLabel = measure.replace(/([a-z])([A-Z])/g, '$1 $2');
        xLabel.text(measureLabel);
    }

    update(cylinderRange, selectedFuel, measure);
}
