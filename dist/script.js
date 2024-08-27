const width = 960;
const height = 600;

const educationDataUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const countyDataUrl = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

Promise.all([d3.json(countyDataUrl), d3.json(educationDataUrl)])
    .then(data => {
        const countyData = data[0];
        const educationData = data[1];

        const path = d3.geoPath();

        const svg = d3.select("#map")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const colorScale = d3.scaleThreshold()
            .domain(d3.range(10, 70, 10))
            .range(d3.schemeBlues[7]);

        const educationMap = new Map(educationData.map(d => [d.fips, d]));

        svg.append("g")
            .selectAll("path")
            .data(topojson.feature(countyData, countyData.objects.counties).features)
            .enter().append("path")
            .attr("class", "county")
            .attr("d", path)
            .attr("data-fips", d => d.id)
            .attr("data-education", d => educationMap.get(d.id).bachelorsOrHigher)
            .attr("fill", d => colorScale(educationMap.get(d.id).bachelorsOrHigher))
            .on("mouseover", function(event, d) {
                const education = educationMap.get(d.id).bachelorsOrHigher;
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`Education: ${education}%`)
                    .attr("data-education", education)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition().duration(500).style("opacity", 0);
            });

        const tooltip = d3.select("body").append("div")
            .attr("id", "tooltip")
            .style("opacity", 0);

        const legend = d3.select("#legend");

        const legendWidth = 300;
        const legendHeight = 10;

        const legendSvg = legend.append("svg")
            .attr("width", legendWidth)
            .attr("height", 50);

        const legendScale = d3.scaleLinear()
            .domain([0, 70])
            .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
            .tickSize(legendHeight)
            .tickValues(colorScale.domain())
            .tickFormat(d => d + "%");

        legendSvg.append("g")
            .selectAll("rect")
            .data(colorScale.range().map(color => {
                const d = colorScale.invertExtent(color);
                if (!d[0]) d[0] = legendScale.domain()[0];
                if (!d[1]) d[1] = legendScale.domain()[1];
                return d;
            }))
            .enter().append("rect")
            .attr("x", d => legendScale(d[0]))
            .attr("y", 0)
            .attr("width", d => legendScale(d[1]) - legendScale(d[0]))
            .attr("height", legendHeight)
            .attr("fill", d => colorScale(d[0]));

        legendSvg.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(legendAxis);
    });
