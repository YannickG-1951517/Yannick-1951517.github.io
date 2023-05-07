window.svg;

const SILENCE_TIME = 1000; // ms
const STALL_RATIO = 0.1; // 10% of the total events are stalls

// document.getElementById("testbutton").addEventListener("click", function() {
//     indexedDB.deleteDatabase("TAPE");
// });

// document.getElementById("getcontent").addEventListener("click", async function() {
//     let content = await getEventsFromDB(sessionStorage.getItem("file-name"));
//     console.log(content);
// });

window.addEventListener("beforeunload", (event) => {
    // event.returnValue = "\\o/";
});

window.onload = function() {
    if (sessionStorage.getItem("file-name") == undefined) {
        const request = getIndexDB().open("TAPE", 1);
        request.onerror = (event) => console.error("IndexDB Error: ", event);
        request.onupgradeneeded = (event) => {
            const db = request.result;
            const store = db.createObjectStore("qlog-file", {keyPath: "file"});
            store.createIndex("file", "file", {unique: true});
        }
        // request.onsuccess = (event) => {
        // }
    } else {
        updateName();
        fillOdditiesList();
        createTrimTypeButtons();
        createLastUsedButtons();
        createFileListButtons();
        showComponents();
    }
}

function loadTestfile (event) {
    let data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(testfile));
    
    let link = document.createElement("a");
    link.setAttribute("href", data);
    link.setAttribute("download", "TAPE_testfile.qlog");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// =================================================================================================
// File handling

let dropArea = document.getElementById ('drop-area');
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
});

function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}

;['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false)
});

;['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false)
});

function highlight (e) {
    dropArea.classList.add('highlight');
}

function unhighlight (e) {
    dropArea.classList.remove('highlight');
}

dropArea.addEventListener ('drop', handleDrop, false)

function handleDrop (e) {
    let dt = e.dataTransfer;
    let files = dt.files;

    handleFiles(files);
}

// function handleConfiguration (files) {
//     setConfiguration(files[0]);
// }

function handleFiles (files) {
    ProcessFile(files[0]);
    let accordion = document.getElementById("trim-accordion");
    console.log(bootstrap.Collapse.getInstance(accordion));
    if (document.getElementById("accordion-button").getAttribute("aria-expanded") == "true") {
        let toggler = new bootstrap.Collapse(accordion, {toggle: true});
    }
    showComponents();
}


// =================================================================================================
// UI elements/interactions

document.getElementById("slider-2").addEventListener("change", function() {
    let slider2 = document.getElementById("slider-2").checked;
    let input = document.getElementById("min");

    if (slider2) {
        input.disabled = false;
    } else {
        input.disabled = true;
    }

    if (window.svg != undefined) {
        createGraph(document.getElementById("graph-picker").value);
    }
});

document.getElementById("slider-1").addEventListener("change", function() {
    let slider1 = document.getElementById("slider-1").checked;
    let input = document.getElementById("max");

    if (slider1) {
        input.disabled = false;
    } else {
        input.disabled = true;
    }

    if (window.svg != undefined) {
        createGraph(document.getElementById("graph-picker").value);
    }
});

function showComponents () {
    document.getElementById("accordion").style.visibility = "visible";
    document.getElementById("parameters").style.visibility = "visible";
}

document.getElementById("graph-picker").addEventListener("change", async function() {
    let value = document.getElementById("graph-picker").value;
    
    document.getElementById("parameters").style.visibility = "visible";
    let min = document.getElementById("min");
    let max = document.getElementById("max");
    let parcedEvents = await getEventsFromDB(sessionStorage.getItem("file-name"));
    if (sessionStorage.getItem("configuration") != null) {
        let configuration = JSON.parse(sessionStorage.getItem("configuration"));
        min.value = configuration.min;
        max.value = configuration.max;
    } else {
        console.log(parcedEvents);
        max.value = parcedEvents[parcedEvents.length - 1].time;
        min.value = parcedEvents[0].time;
    }
    min.max = parcedEvents[parcedEvents.length - 1].time;
    max.max = parcedEvents[parcedEvents.length - 1].time;
    min.min = parcedEvents[0].time;
    max.min = parcedEvents[0].time;
    
});

document. getElementById("body").addEventListener("keydown", function(event) {
    if (event.key == "Enter") {
        createGraph(document.getElementById("graph-picker").value);
    }
});

function createGraphOptions () {
    let zone = d3.select("#draw-zone");
    let row = zone.append("div").classed("row mb-3", true);

    let yAxisZone = row.append("div").classed("col-4", true);
    yAxisZone.append("h3").text("Y axis");
    let ySlider = yAxisZone.append("div").classed("form-check form-switch", true);
    ySlider.append("input").classed("form-check-input", true).attr("type", "checkbox").attr("id", "y-slider").attr("checked", true);
    let yMaxIG = yAxisZone.append("div").classed("input-group input-group-sm mb-1", true);
    yMaxIG.append("div").classed("input-group-prepend", true).append("span").classed("input-group-text", true).text("max");
    yMaxIG.append("input").classed("form-control", true).attr("type", "number").attr("id", "y-max");
    let yMinIG = yAxisZone.append("div").classed("input-group input-group-sm", true);
    yMinIG.append("div").classed("input-group-prepend", true).append("span").classed("input-group-text", true).text("min");
    yMinIG.append("input").classed("form-control", true).attr("type", "number").attr("id", "y-min");

    let xAxisZone = row.append("div").classed("col-4", true);
    xAxisZone.append("h3").text("X axis");
    let xSlider = xAxisZone.append("div").classed("form-check form-switch", true);
    xSlider.append("input").classed("form-check-input", true).attr("type", "checkbox").attr("id", "x-slider").attr("checked", true);
    let xMaxIG = xAxisZone.append("div").classed("input-group input-group-sm mb-1", true);
    xMaxIG.append("div").classed("input-group-prepend", true).append("span").classed("input-group-text", true).text("max");
    xMaxIG.append("input").classed("form-control", true).attr("type", "number").attr("id", "x-max");
    let xMinIG = xAxisZone.append("div").classed("input-group input-group-sm", true);
    xMinIG.append("div").classed("input-group-prepend", true).append("span").classed("input-group-text", true).text("min");
    xMinIG.append("input").classed("form-control", true).attr("type", "number").attr("id", "x-min");

    let buttonZone = row.append("div").classed("col-4", true);
    let buttonRow = buttonZone.append("div").classed("row justify-content-around", true);
    buttonRow.append("button").classed("col-auto btn btn-primary", true).attr("type", "button").attr("id", "apply-zoom-btn").text("Apply zoom");
    buttonRow.append("button").classed("col-auto btn btn-primary", true).attr("type", "button").attr("id", "reset-zoom-btn").text("Reset zoom");
    let slider = buttonRow.append("div").classed("col-auto mt-1", true);
    let sliderGroup = slider.append("label").classed("switch", true);
    sliderGroup.append("input").attr("type", "checkbox").attr("id", "hover-slider");
    sliderGroup.append("span").classed("slider round", true);
    slider.append("label").classed("form-check-label", true).attr("for", "slider-1").text("Toggle tooltips");

    zone.append("hr").classed("hr", true);

    addGraphOptionLogic();
}

function addGraphOptionLogic () {
    document.getElementById("y-slider").addEventListener("change", changeYSlider);
    document.getElementById("x-slider").addEventListener("change", changeXSlider);
}

function changeYSlider() {
    if (document.getElementById("y-slider").checked) {
        document.getElementById("y-max").disabled = false;
        document.getElementById("y-min").disabled = false;
    } else {
        document.getElementById("y-max").disabled = true;
        document.getElementById("y-min").disabled = true;
    }
}

function changeXSlider() {
    if (document.getElementById("x-slider").checked) {
        document.getElementById("x-max").disabled = false;
        document.getElementById("x-min").disabled = false;
    } else {
        document.getElementById("x-max").disabled = true;
        document.getElementById("x-min").disabled = true;
    }
}

document.getElementById("clear-btn").addEventListener("click", clearGraph);
function clearGraph() {
    try {
        d3.select('#draw-zone').selectAll('*').remove();
        window.svg = undefined;
        document.getElementById("export-svg").style.visibility = "hidden";
        document.getElementById("clear-btn").style.visibility = "hidden";
    } catch (error) {
        window.alert("No graph to clear");
    }
    updateName();
}

document.getElementById("generate-btn").addEventListener("click", determineGraphType);
function determineGraphType() {
    let graphType = document.getElementById("graph-picker").value;

    if (sessionStorage.getItem("file-name") == undefined) {
        alert("No qlog file selected");
        return;
    }

    createGraph(graphType);
}

// =================================================================================================
// Actions as a result of user interaction

function createGraph(graphType) {
    console.log(graphType);
    if (window.svg != undefined) {
        clearGraph();
    }
    
    switch (graphType) {
        case "Events":
            createEventsPage();
            break;
        case "Stall-list":
            createStallListPage();
            break;
        case "Request-bubblechart":
            drawRequestBubbleChart();
            break;
        case "Playhead-progress":
            createPlayheadProgressPage();
            break;
        case "Event-type-overview": 
            createEventTypeOverviewPage();
            break;
        default:
            alert("No graph type selected");
            return;
    }
    adaptLastUsedList(graphType);
    document.getElementById("clear-btn").style.visibility = "visible";
    document.getElementById("export-svg").style.visibility = "visible";
}

function createEventsPage () {
    createGraphOptions();
    drawEventLineChart();
}

async function createStallListPage () {
    let StallEvents = await getEventsFromDB(sessionStorage.getItem("file-name"), "stall");

    if (StallEvents.length == 0) {
        alert("No stall events in qlog file");
        return;
    }

    drawStallButtons(StallEvents);
    drawStallLine(StallEvents);
    drawStallList(StallEvents);
}

function createPlayheadProgressPage () {
    drawPlayheadProgressLineChart();
}

async function createEventTypeOverviewPage () {
    let events = await getEventsFromDB(sessionStorage.getItem("file-name"));
    let orderedTypes = orderByType(events);
    drawTypesBarChart(orderedTypes);
    drawTypesBubbleChart(orderedTypes);
}

function setConfiguration (configuration) {
    let fr = new FileReader();
    fr.onload = function() {
        let fileContent = fr.result;
        try {
            let fileConfig = JSON.parse(fileContent)["Configuration"];
            // console.log(fileConfig);
            let min = document.getElementById("min");
            let max = document.getElementById("max");
            min.value = fileConfig.min;
            max.value = fileConfig.max;
            sessionStorage.setItem("configuration", JSON.stringify(fileConfig));
        } catch {
            alert("Wrong .json file (formatting might be wrong). Try inputting a different file.")
        }
    } 
    fr.readAsText(configuration);
}

function ProcessFile (file) {
    let fr = new FileReader();
    fr.onload = async function() {
        let fileContent = fr.result;

        await saveQlogToDB(file.name, fileContent);
        fillOdditiesList();

        let configuration = JSON.parse(fileContent)["Configuration"];
        console.log(configuration);
        handleConfiguration(configuration);
    }
    fr.readAsText(file);
    sessionStorage.setItem("file-name", file.name);
    updateName();
    adaptFileList(file.name);
}

function handleConfiguration (configuration) {
    console.log(configuration);
    if (configuration == undefined) {
        sessionStorage.removeItem("configuration");
        return;
    } else {
        let proceed = confirm("A configuration was found in the qlog file. Do you want to use it?");
        if (proceed) {
            let config = JSON.stringify(configuration["TAPE"]);
            sessionStorage.setItem("configuration", config);
            let min = document.getElementById("min");
            let max = document.getElementById("max");
            min.value = configuration["TAPE"].min;
            max.value = configuration["TAPE"].max;
        } else {
            sessionStorage.removeItem("configuration");
        }
    }
}

function updateName() {
    let filename = sessionStorage.getItem('file-name');
    if (filename == null) {
        document.getElementById("navbar-text").innerHTML = "";
        return;
    }
    document.getElementById("navbar-text").innerHTML = "Current session: '" + filename + "'";
}

document.getElementById("save-to-qlog").addEventListener("click", async function(event) {
    event.preventDefault();
    // let json = JSON.parse(sessionStorage.getItem("qlog-file"));
    const file = await getFileFromDB(sessionStorage.getItem("file-name"));
    console.log(file);
    let json = JSON.parse(file.content);
    // let json = file.content;
    console.log(json);

    const configuration = {
        "TAPE": {
        max: document.getElementById("max").value,
        min: document.getElementById("min").value,
    }};
    
    json["Configuration"] = configuration;
    
    console.log(json);

    let data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
    
    let link = document.createElement("a");
    link.setAttribute("href", data);
    if (sessionStorage.getItem("file-name").includes("-configurated.qlog")) {
        link.setAttribute("download", sessionStorage.getItem("file-name"));
    } else {
        link.setAttribute("download", sessionStorage.getItem("file-name").slice(0,-5) + "-configuration.qlog");
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

document.getElementById("save-to-json").addEventListener("click", function(event) {
    event.preventDefault();
    let obj = {
        name: sessionStorage.getItem("file-name"),
        Configuration: {
        max: document.getElementById("max").value,
        min: document.getElementById("min").value,}
    }

    // Convert it to a string and encode it as a data URI
    let data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));

    // Create an anchor element with the data URI as the href attribute and the file name as the download attribute
    let link = document.createElement("a");
    link.setAttribute("href", data);
    link.setAttribute("download", sessionStorage.getItem("file-name").slice(0, -5) + "-config.json");

    // Append the link to the document body and click it
    document.body.appendChild(link);
    link.click();

    // Remove the link from the document body
    document.body.removeChild(link);
});

function saveToSvg () {
    // TODO add a way to save the svg
    saveSvgAsPng(document.getElementById("svg"), sessionStorage.getItem("file-name") + ".png", {scale: 2});
    
}

async function createTrimTypeButtons () {
    let events = await getEventsFromDB(sessionStorage.getItem("file-name"));
    let types = orderByType(events);
    // let types = orderByType(sessionStorage.getItem("qlog-file"));
    let buttonZone = document.getElementById("trim-type-zone");
    buttonZone.innerHTML = "";
    for (let i = 0; i < types.length; i++) {
        let button = document.createElement("button");
        button.setAttribute("class", "btn btn-outline-primary");
        button.setAttribute("id", types[i].type);
        button.setAttribute("style", "margin: 5px;");
        button.setAttribute("data-bs-toggle", "button");
        button.setAttribute("autocomplete", "off");
        button.innerHTML = types[i].type;
        buttonZone.appendChild(button);
    }

}

let form = document.getElementById("trim-form");
document.getElementById("trim-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const file = await getFileFromDB(sessionStorage.getItem("file-name"));
    // console.log(file);
    let json = JSON.parse(file.content);
    
    // Make list of selected types
    let selectedTypes = [];
    let buttons = document.getElementById("trim-type-zone").children;
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].classList.contains("active")) {
            selectedTypes.push(buttons[i].id);
        }
    }
    // console.log(selectedTypes);

    // Trim the events by types
    let trimmedEvents = [];
    json.traces[0].events.forEach(element => {
        // console.log(element.type);
        if (selectedTypes.indexOf(element.type) > -1) {
            trimmedEvents.push(element);
        }
    });

    // console.log(trimmedEvents);

    // Trim the events by time
    if (document.getElementById("include-parameters").checked) {
        let min = document.getElementById("min").value;
        let max = document.getElementById("max").value;
        let trimmedEventsTime = [];
        trimmedEvents.forEach(element => {
            if (element.time >= min && element.time <= max) {
                trimmedEventsTime.push(element);
            }
        });
        trimmedEvents = trimmedEventsTime;
    }

    // console.log(trimmedEvents);

    json.traces[0].events = trimmedEvents;

    let data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
    
    let link = document.createElement("a");
    link.setAttribute("href", data);
    if (sessionStorage.getItem("file-name").includes("-trimmed.qlog")) {
        link.setAttribute("download", sessionStorage.getItem("file-name"));
    } else {
        link.setAttribute("download", sessionStorage.getItem("file-name").slice(0,-5) + "-trimmed.qlog");
    }


    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

});

async function fillOdditiesList () {
    let odditiesList = await checkForOddities();

    let odditiesZone = document.getElementById("oddities-list");
    
    let badge = document.getElementById("oddities-badge");
    badge.innerHTML = odditiesList.length + " oddities";

    if (odditiesList.length > 0) {
        badge.setAttribute("class", "badge bg-danger rounded-pill");
        document.getElementById("oddities-status-icon").setAttribute("class", "fa-solid fa-circle-exclamation");
        document.getElementById("oddities-dropdown-button").setAttribute("class", "nav-link text-danger");
        if (document.getElementById("no-oddities"))
            odditiesZone.removeChild(document.getElementById("no-oddities"));
        odditiesZone.innerHTML = "";
        for (let i = 0; i < odditiesList.length; i++) {
            createOddity(odditiesList[i], odditiesZone);
        }
    }
    else {
        document.getElementById("oddities-status-icon").setAttribute("class", "fa-solid fa-check-circle");
        document.getElementById("oddities-dropdown-button").setAttribute("class", "nav-link text-success");
        if (!document.getElementById("no-oddities")) {
            let noOdd = document.createElement("p");
            noOdd.setAttribute("id", "no-oddities");
            noOdd.innerHTML = "No oddities found";
            odditiesZone.appendChild(noOdd);
        }
        badge.setAttribute("class", "badge bg-success rounded-pill");
    }

}

function createOddity (oddity, odditiesZone) {
    let oddityDoc = document.createElement("li");
    oddityDoc.setAttribute("class", "list-group-item mb-1");
    switch (oddity.type) {
        case "stall":
            oddityDoc.innerHTML = "Stall count of " + oddity.count + " out of " + oddity.totalCount + " events (high ratio!)";
            break;
        case "time":
            oddityDoc.innerHTML = "Silence between " + oddity.start.time + "ms and " + oddity.end.time + "ms";
            break;

        default:
            break;
    }
    odditiesZone.appendChild(oddityDoc);
}

async function checkForOddities () {
    let oddities = [];

    let stallOddity = await checkForStallOddity();
    oddities.push.apply(oddities, stallOddity);

    let timeOddities = await checkForSilence();
    oddities.push.apply(oddities, timeOddities);

    return oddities;
}

async function checkForSilence () {
    let events = await getEventsFromDB(sessionStorage.getItem("file-name"));
    let timeOddities = [];
    for (let i = 0; i < events.length-1; i++) {
        if (events[i+1].time - events[i].time > SILENCE_TIME) {
            timeOddities.push({type: "time", start: events[i], end: events[i+1]});
        }
    }
    return timeOddities;
}

async function checkForStallOddity () {
    console.log(sessionStorage.getItem("file-name"));
    let events = await getEventsFromDB(sessionStorage.getItem("file-name"));
    let stallCount = 0;
    for (let i = 0; i < events.length-1; i++) {
        if (events[i].type == "stall") {
            stallCount++;
        }
    }
    let ratio = stallCount / events.length;
    if (ratio > STALL_RATIO) {
        return [{type: "stall", count: stallCount, totalCount: events.length}];
    }
    else {
        return;
    }
        
}

function adaptLastUsedList (option) {
    let lastUsed = JSON.parse(sessionStorage.getItem("last-used"));
    if (lastUsed == null) {
        lastUsed = [option];
        sessionStorage.setItem("last-used", JSON.stringify(lastUsed));
    } else {
        if (lastUsed.includes(option)) {
        lastUsed.splice(lastUsed.indexOf(option), 1);
        }
        lastUsed.unshift(option);
        sessionStorage.setItem("last-used", JSON.stringify(lastUsed));
    } 
        
    createLastUsedButtons();
}

function createLastUsedButtons () {
    let lastUsed = JSON.parse(sessionStorage.getItem("last-used"));
    if (lastUsed == null) {
        return;
    }
    lastUsed = lastUsed.slice(0, 4);

    d3.select("#last-used-list")
        .selectAll("li")
        .remove();
    d3.select("#last-used-list")
        .selectAll("li")
        .data(lastUsed)
        .enter()
        .append("li")
        .attr("class", "btn btn-outline-secondary btn-sm mb-1 col-3")
        .attr("id", function (d) {return d})
        .attr("title", function (d) {return d.split("-").join(" ")})
        .html(function (d) {
            let splitString = d.split("-");
            for (let i = 0; i < splitString.length; i++) {
                splitString[i] = splitString[i].charAt(0).toUpperCase();
            }
            splitString = splitString.join("-");
            return splitString;
        })
        .on("click", function (d) {
            console.log(this.getAttribute("id"));
            document.getElementById("graph-picker").value = this.getAttribute("id");
            createGraph(this.getAttribute("id"));
        });
}

function adaptFileList (newFile) {
    let fileList = JSON.parse(sessionStorage.getItem("file-list"));
    if (fileList == null) {
        fileList = [newFile];
        sessionStorage.setItem("file-list", JSON.stringify(fileList));
    } else {
        if (fileList.includes(newFile)) {
            fileList.splice(fileList.indexOf(newFile), 1);
        }
        fileList.unshift(newFile);
        sessionStorage.setItem("file-list", JSON.stringify(fileList));
    } 
    createFileListButtons();
}

function createFileListButtons () {
    let fileList = JSON.parse(sessionStorage.getItem("file-list"));
    if (fileList == null) {
        return;
    }
    fileList = fileList.slice(0, 4);
    let index = 0;
    d3.select("#file-list")
        .selectAll("li")
        .remove();
    d3.select("#file-list")
        .selectAll("li")
        .data(fileList)
        .enter()
        .append("li")
        .attr("class", "btn btn-outline-secondary btn-sm mb-1")
        .attr("id", function (d) {return d})
        .attr("title", function (d) {return d.split("-").join(" ")})
        .html(function (d) {
            return ++index;
        })
        .on("click", function (d) {
            handleFilechangerClick(this);
        });
}

async function handleFilechangerClick(context) {
    console.log(context.getAttribute("id"));
    let selectedType = document.getElementById("graph-picker").value;
    sessionStorage.setItem("file-name", context.getAttribute("id"));
    updateName();
    let configuration = await getConfigurationFromDB(sessionStorage.getItem("file-name"));
    console.log(configuration);
    handleConfiguration(configuration);
    fillOdditiesList();
    if (selectedType != "Choose test type ...") {
        createGraph(selectedType);
    }

}


// =================================================================================================
// Drawing functions

async function drawEventLineChart () {
    let parcedEvents = await getEventsFromDB(sessionStorage.getItem("file-name"));

    var data = [];
    for (let i = 0; i < parcedEvents.length; i++) {
        data.push({time: parcedEvents[i].time, index: i});
    }

    if (parcedEvents.length == 0) {
        alert("No events found in qlog file");
        clearGraph();
        return;
    }
    
    margin = {top: 40, right: 0, bottom: 30, left: 75}
    width = document.getElementById("draw-zone").clientWidth - margin.left - margin.right,
    height = document.getElementById("draw-zone").clientHeight - margin.top - margin.bottom;
    
    let row = d3.select("#draw-zone").append("div").classed("row", true);
    
    let svg = window.svg = row
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("id", "svg")
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    let maxTime = data[data.length - 1].time;
    let minTime = data[0].time;
    let maxIndex = data[data.length - 1].index;
    let minIndex = data[0].index;

    let xScale = d3.scaleLinear().domain([minIndex, maxIndex]).range([0, width]),
        yScale = d3.scaleLinear().domain([minTime, maxTime]).range([height, 0]);

    document.getElementById("x-min").value = minIndex;
    document.getElementById("x-max").value = maxIndex;
    document.getElementById("y-min").value = minTime;
    document.getElementById("y-max").value = maxTime;
    
    // Title
    let title = svg.append('text')
        .attr('x', margin.left + width/2)
        .attr('y', -margin.top/2)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica')
        .style('font-size', 20)
        .text("Event timeline");
    
    // X label
    svg.append('text')
        .attr('x', margin.left + width/2)
        .attr('y', height + margin.bottom)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica')
        .style('font-size', 12)
        .text('Index');
    
    // Y label
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 10)
        .attr('x', -margin.top - height/2)
        .style('font-family', 'Helvetica')
        .style('font-size', 12)
        .text("Timestamp (ms)");

    // X axis
    let xAxis = window.svg.append("g")
        .attr("transform", "translate(0, " + height + ")")
        .call(d3.axisBottom(xScale));
    
    // Y axis
    let yAxis = window.svg.append("g")
        .call(d3.axisLeft(yScale));


    var dots = svg.append('g')
    .attr("clip-path", "url(#clip)")

    var line = d3.line()
        .x(function(d) { return xScale(d.index); }) 
        .y(function(d) { return yScale(d.time); }) 
        .curve(d3.curveMonotoneX);

    // Line of personal data
    dots.append("g").append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", "#0000CC")
        .style("stroke-width", "2");

    // dots with personal data
    dots
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("id", "dot" )
        .attr("cx", function (d) { return xScale(d.index); } )
        .attr("cy", function (d) { return yScale(d.time); } )
        .attr("x", function (d) { return d.index; } )
        .attr("y", function (d) { return d.time; } )
        .attr("r", 5)
        .style("opacity", 0.3)
        .style("fill", "#0000CC")

    // Change the tooltip when user hover / leave a cell
    d3.selectAll("#dot")
        .on("mouseover", function () {
            console.log(JSON.stringify(parcedEvents[d3.select(this).attr("x")]));
            console.log(JSON.stringify(parcedEvents[d3.select(this).attr("x")], null, 4));

            tooltip
                .style("opacity", 1)
                .html("Index: " + d3.select(this).attr("x") + "<br>Time: " + d3.select(this).attr("y") + "<br>Event: " + parcedEvents[d3.select(this).attr("x")].type + "<br><br>" + JSON.stringify(parcedEvents[d3.select(this).attr("x")], null, 4))
            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", 2)
                .style("opacity", 1)
                .style("fill", "red")
                .style("z-index", "1000")
        })
        .on("mouseleave", function () {
            // tooltip
            //     .style("opacity", 0)
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.3)
                .style("fill", "#0000CC")
                .style("z-index", "0")
        });

    // Zoom
    let clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);

    let brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("end", updateChart);

    dots
    .append("g")
        .attr("class", "brush")
        .call(brush);

    document.getElementById("y-slider").addEventListener("change", checkY);
    function checkY() {
        changeYSlider();
        if(document.getElementById("y-slider").checked) {
            brush = d3.brush()
                .extent([[0, 0], [width, height]])
                .on("end", updateChart);
            dots.selectAll(".brush").call(brush);
        } else {
            if (!document.getElementById("x-slider").checked) {
                document.getElementById("x-slider").checked = true;
                checkX();
            }
            brush = d3.brushX()
                .extent([[0, 0], [width, height]])
                .on("end", updateChart);
            dots.selectAll(".brush").call(brush);
        }
    }

    document.getElementById("x-slider").addEventListener("change", checkX);
    function checkX() {
        changeXSlider();
        if(document.getElementById("x-slider").checked) {
            brush = d3.brush()
                .extent([[0, 0], [width, height]])
                .on("end", updateChart);
            dots.selectAll(".brush").call(brush);
        } else {
            if (!document.getElementById("y-slider").checked) {
                document.getElementById("y-slider").checked = true;
                checkY();
            }
            brush = d3.brushY()
                .extent([[0, 0], [width, height]])
                .on("end", updateChart);
            dots.selectAll(".brush").call(brush);
        }
    }

    document.getElementById("hover-slider").addEventListener("change", function() {
        if (dots.select(".brush").empty()) {
                console.log("empty")
                dots.append("g")
                    .attr("class", "brush")
                    .call(brush);
        } else {
            console.log("not empty")
            dots.selectAll(".brush").remove();
        }
    });


    let idleTimeout;
    function idled() { idleTimeout = null; }

    function updateChart (e) {
        extent = e.selection;
        // console.log(extent);
        if (!extent) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); 
            xScale.domain([minIndex, maxIndex]),
            yScale.domain([minTime, maxTime]);
        } else {
            if (document.getElementById("y-slider").checked && !document.getElementById("x-slider").checked) {
                yScale.domain([yScale.invert(extent[1]), yScale.invert(extent[0])]);
                performTransition();
                svg.select(".brush").call(brush.move, null);
                return;
            }
            if (document.getElementById("x-slider").checked && !document.getElementById("y-slider").checked) {
                xScale.domain([xScale.invert(extent[0]), xScale.invert(extent[1])]);
                performTransition();
                svg.select(".brush").call(brush.move, null);
                return;
            }
            xScale.domain([ xScale.invert(extent[0][0]), xScale.invert(extent[1][0]) ])
            yScale.domain([ yScale.invert(extent[1][1]), yScale.invert(extent[0][1]) ])
            svg.select(".brush").call(brush.move, null);
        }
        performTransition();
    }

    document.getElementById("reset-zoom-btn").addEventListener("click", function() {
        xScale.domain([minIndex, maxIndex]),
        yScale.domain([minTime, maxTime]);
        performTransition();
    });

    document.getElementById("apply-zoom-btn").addEventListener("click", function() {
        xScale.domain([document.getElementById("x-min").value, document.getElementById("x-max").value]);
        yScale.domain([document.getElementById("y-min").value, document.getElementById("y-max").value]);
        performTransition();
    });

    document.getElementById("x-min").addEventListener("change", changeXYFromInput);
    document.getElementById("x-max").addEventListener("change", changeXYFromInput);
    document.getElementById("y-min").addEventListener("change", changeXYFromInput);
    document.getElementById("y-max").addEventListener("change", changeXYFromInput);
    function changeXYFromInput () {
        xScale.domain([document.getElementById("x-min").value, document.getElementById("x-max").value]);
        yScale.domain([document.getElementById("y-min").value, document.getElementById("y-max").value]);
        performTransition();
    }

    function performTransition() {
        // console.log(xScale.domain(), yScale.domain());
        document.getElementById("x-min").value = Math.round(xScale.domain()[0]);
        document.getElementById("x-max").value = Math.round(xScale.domain()[1]);
        document.getElementById("y-min").value = Math.round(yScale.domain()[0]);
        document.getElementById("y-max").value = Math.round(yScale.domain()[1]);

        xAxis.transition().duration(1000).call(d3.axisBottom(xScale))
        yAxis.transition().duration(1000).call(d3.axisLeft(yScale))
        dots
            .selectAll("circle")
            .transition().duration(1000)
            .attr("cx", function (d) { return xScale(d.index); } )
            .attr("cy", function (d) { return yScale(d.time); } )

        
            
        svg.select(".line")
            .transition().duration(1000)
            .attr("d", line);
    }

    // Tooltip
    let tooltip = d3.select("#draw-zone")
        .append("pre")
        .append("code")
        .style("opacity", 0)
        .attr("id", "tooltip")
        .attr("class", "row")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "20px")
        .style("margin", "20px")
    
}

async function drawPlayheadProgressLineChart () {
    // var fileContent = sessionStorage.getItem("qlog-file");
    // let parcedEvents = [];
    // parcedEvents = parcePlayhead(fileContent);
    let Events = await getEventsFromDB(sessionStorage.getItem("file-name"), "playhead_progress");
    let parcedEvents = parcePlayhead(Events);
    // console.log(parcedEvents);

    if (parcedEvents.length == 0) {
        alert("No events found in qlog file");
        clearGraph();
        return;
    }

    window.svg = d3.select("#draw-zone").append("svg")
        .attr("width", 1000)
        .attr("height", 500),
    margin = 200,
    width = svg.attr("width") - margin,
    height = svg.attr("height") - margin;

    let maxPlaytime = 0;
    parcedEvents.forEach((dataPoint) => {
        // console.log(dataPoint.count);
        if (dataPoint.playhead > maxPlaytime) {
            maxPlaytime = dataPoint.playhead;            
        }});

    let xScale = d3.scaleLinear().domain([parcedEvents[0].time , parcedEvents[parcedEvents.length - 1].time]).range([0, width]),
        yScale = d3.scaleLinear().domain([0, maxPlaytime]).range([height, 0]);
    
    // Title
    window.svg.append('text')
        .attr('x', width/2 + 100)
        .attr('y', 100)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica')
        .style('font-size', 20)
        .text('Playhead Progress');
    
    // X label
    window.svg.append('text')
        .attr('x', width/2 + 100)
        .attr('y', height - 15 + 150)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica')
        .style('font-size', 12)
        .text('Timestamp (ms)');
    
    // Y label
    window.svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', 'translate(45,' + ((height/2) - 50) + ')rotate(-90)')
        .style('font-family', 'Helvetica')
        .style('font-size', 12)
        .text("Playhead progress (ms)");

    // X axis
    window.svg.append("g")
        .attr("transform", "translate(100," + (height + 100) + ")")
        .call(d3.axisBottom(xScale));
    
    // Y axis
    window.svg.append("g")
        .attr("transform", "translate(100,100)")
        .call(d3.axisLeft(yScale));

    // dots
    window.svg.append('g')
        .selectAll('.dot')
        .data(parcedEvents)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', function (d) { return xScale(d.time) + 100; } )
        .attr('cy', function (d) { return yScale(d.playhead) + 100; } )
        .attr('r', 3)
        .style("fill", "#69b3a2")

    // line
    window.svg.append("path")
        .datum(parcedEvents)
        .attr("fill", "none")
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return xScale(d.time) + 100 })
            .y(function(d) { return yScale(d.playhead) + 100 })
        );
}

function drawTypesBarChart (parcedEvents) {
    if (parcedEvents.length == 0) {
        return;
    }

    let maxCount = 0;
    parcedEvents.forEach((dataPoint) => {
        // console.log(dataPoint.count);
        if (dataPoint.count > maxCount) {
            maxCount = dataPoint.count;            
        }
    });

    window.svg = d3.select("#draw-zone").append("div")
        .attr('id', 'drawing-zone-row')
        .attr("class", "row")

    window.svg = d3.select("#drawing-zone-row").append("svg")
        .attr("width", 1000)
        .attr("height", 500)
        .attr("class", "col-12"),

        margin = 200,
        width = svg.attr("width") - margin,
        height = svg.attr("height") - margin;

    let xScale = d3.scaleBand().domain(parcedEvents.map((dataPoint) => dataPoint.type)).rangeRound([0, width]).padding(0.1),
        yScale = d3.scaleLinear().domain([0, maxCount]).range([height, 0]);


    window.svg.append('g')
        .selectAll('.bar')
        .data(parcedEvents)
        .enter()
        .append('rect')
        .classed('bar', true)
        .attr("id", function(d) { return d.type; })
        .attr("transform", "translate(100,100)")
        .attr('fill', function(d) {
            return d.color;
            })
        .attr('width', xScale.bandwidth())
        .attr('height', (d) => height - yScale(d.count))
        .attr('x', (d) => xScale(d.type))
        .attr('y', (d) => yScale(d.count));


    // X axis
    window.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(100," + (height + 100) + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("text-action", "end")
        .attr("dx", "-5em")
        .attr("dy", "-.15em")
        .attr("transform", "rotate(-70)");
    
    // Y axis
    window.svg.append("g")
        .attr("transform", "translate(100,100)")
        .call(d3.axisLeft(yScale));
        
    // Title
    window.svg.append('text')
        .attr('x', width/2 + 100)
        .attr('y', 50)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica')
        .style('font-size', 20)
        .text("Event types");
    
    // X axis label
    window.svg.append('text')
        .attr('x', width + 150)
        .attr('y', height + 100)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica')
        .style('font-size', 15)
        .text('Event type');
    
    // Y axis label
    window.svg.append('text')
        .attr('x', -height/2 - 100)
        .attr('y', 50)
        .attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica')
        .style('font-size', 15)
        .attr('transform', 'rotate(-90)')
        .text('Count');
    
    // bar labels
    window.svg.append('g')
        .selectAll('.bar-label')
        .data(parcedEvents)
        .enter()
        .append('text')
        .classed('bar-label', true)
        .attr("id", function(d) { return d.type; })
        .attr("transform", "translate(100,100)")
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .style('font-family', 'Helvetica')
        .style('font-size', 15)
        .attr('x', (d) => xScale(d.type) + xScale.bandwidth()/2)
        .attr('y', (d) => yScale(d.count) - 5)
        .text((d) => d.count);


    // Three function that change the tooltip when user hover / move / leave a cell
    d3.selectAll(".bar")
        .on("mouseover", function(d) {
            d3.selectAll("#" + d3.select(this).attr("id"))
                .style("stroke", "black")
        })
        .on("mouseleave", function(d) {
            d3.selectAll("#" + d3.select(this).attr("id"))
                .style("stroke", "none")
        });

    d3.selectAll(".bar-label")
        .on("mouseover", function(d) {
            d3.selectAll("#" + d3.select(this).attr("id"))
                .style("stroke", "black")
        })
        .on("mouseleave", function(d) {
            d3.selectAll("#" + d3.select(this).attr("id"))
                .style("stroke", "none")
        });
}

function drawTypesBubbleChart (parcedEvents) {
    if (parcedEvents.length == 0) {
        alert("No events found in qlog file");
        clearGraph();
        return;
    }

    let maxCount = 0;
    parcedEvents.forEach((dataPoint) => {
        if (dataPoint.count > maxCount) {
            maxCount = dataPoint.count;            
        }
    });

    parcedEvents.forEach((dataPoint) => {
        dataPoint.size = 200 * (dataPoint.count/maxCount)
    });

    window.svg = d3.select("#draw-zone").append("div")

    window.svg = d3.select("#drawing-zone-row").append("svg")
        .attr("width", 1000)
        .attr("height", 1000)
        .attr("id", "bubble-chart")

    margin = 200,
    width = svg.attr("width") - margin,
    height = svg.attr("height") - margin;

    
    var simulation = d3.forceSimulation(parcedEvents)
	.force('charge', d3.forceManyBody().strength(200))
	.force('center', d3.forceCenter(width / 2, height / 2))
	.force('collision', d3.forceCollide().radius(function(d) {
		return d.size;
	}))
	.on('tick', ticked);

    function ticked() {
        d3.select('#bubble-chart')
            .selectAll('circle')
            .data(parcedEvents)
            .join('circle')
            .attr('r', function(d) {
                return d.size;
            })
            .attr('cx', function(d) {
                return d.x;
            })
            .attr('cy', function(d) {
                return d.y;
            })
            .attr('fill', function(d) {
                return d.color;
            })
            .attr('id', function(d) {
                return d.type;
            })
            .on("mouseover", function() {
                d3.selectAll("#" + d3.select(this).attr("id"))
                    .style("stroke", "black")
            })
            .on("mouseleave", function() {
                d3.selectAll("#" + d3.select(this).attr("id"))
                    .style("stroke", "none")
            })

        d3.select('#bubble-chart')
            .selectAll('text')
            .data(parcedEvents)
            .join('text')
            .text(function(d) {
                if (d.size > 20)
                return d.type;
            })
            .attr('x', function(d) {
                return d.x;
            })
            .attr('y', function(d) {
                return d.y;
            })
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', 'black')
    }
}

function drawRequestBubbleChart () {
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var Svg = d3.select("#draw-zone")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv", function(data) {

    // Add X axis
    var x = d3.scaleLinear()
        .domain([4, 8])
        .range([ 0, width ]);
    var xAxis = Svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 9])
        .range([ height, 0]);
    var yAxis = Svg.append("g")
        .attr("transform", "translate(0," + 0 + ")")
        .call(d3.axisLeft(y));

    // Svg.append("g")
    //     .call(d3.axisLeft(y));

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = Svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width )
        .attr("height", height )
        .attr("x", 0)
        .attr("y", 0);

    // Color scale: give me a specie name, I return a color
    var color = d3.scaleOrdinal()
        .domain(["setosa", "versicolor", "virginica" ])
        .range([ "#440154ff", "#21908dff", "#fde725ff"])

    // Add brushing
    var brush = d3.brush()                 // Add the brush feature using the d3.brush function
        .extent( [ [0,0], [width,height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function

    // Create the scatter variable: where both the circles and the brush take place
    var scatter = Svg.append('g')
        .attr("clip-path", "url(#clip)")

    // A function that set idleTimeOut to null
    var idleTimeout
    function idled() { idleTimeout = null; }

    // A function that update the chart for given boundaries
    function updateChart(e) {

        let extent = e.selection

        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if(!extent){
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            x.domain([ 4,8])
            y.domain([0, 9])
        }else{
            x.domain([ x.invert(extent[0][0]), x.invert(extent[0][1]) ])
            y.domain([ y.invert(extent[1][1]), y.invert(extent[1][0]) ])
            scatter.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
        }

        // Update axis and circle position
        xAxis.transition().call(d3.axisBottom(x))
        yAxis.transition().call(d3.axisLeft(y))
        scatter
        .selectAll("circle")
        .transition()
        .attr("cx", function (d) { return x(d.Sepal_Length); } )
        .attr("cy", function (d) { return y(d.Petal_Length); } )

        }
    })
}

function drawStallLine (StallEvents) {
    let stallList = [];
    StallEvents.forEach((dataPoint) => {
        let stall = {
            index: stallList.length+1,
            time: dataPoint.time,
            category: dataPoint.category,
            playhead: dataPoint.data.playhead.ms,
        };
        stallList.push(stall);
    });

    window.svg = d3.select('#left-zone')
        .append('svg')
        .classed('position-fixed top-50 end-50', true)
        .attr('width', 500)
        .attr('height', 20)
    

    let margin = 10,
        width = svg.attr("width") - margin * 2;
    
    let minTime = 0,
        maxTime = d3.max(stallList, function(d) { return d.playhead; });
    
    let xScale = d3.scaleLinear().domain([minTime, maxTime]).range([0, width]);
    
    // draw line
    window.svg.append('g')
        .attr('transform', 'translate(' + margin + ',' + margin + ')')
        .append('path')
        .datum(stallList)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('d', d3.line()
            .x(function(d) { return xScale(d.playhead); })
            .y(function(d) { return 0; })
        )

    window.svg.append('g')
        .attr('transform', 'translate(' + margin + ',' + margin + ')')
        .selectAll('dot')
        .data(stallList)
        .enter()
        .append('circle')
        .attr('id', function(d) { return d.index; })
        // .attr('cy', function(d, i) { return xScale(i); })
        .attr('cx', function(d) { return xScale(d.playhead); })
        .attr('r', 5)
        .style('fill', 'red')
        .style('stroke', 'black')
        .style('stroke-width', 1)
        .on("mouseover", function() {
            if (d3.select('[id="' + d3.select(this).attr("id") + "-row" + '"]')
                .style("background-color") != "lightblue") {
                d3.select('[id="' + d3.select(this).attr("id") + "-row" + '"]')
                    .style("background-color", "green");
                d3.select(this)
                    .style("fill", "green");
            }
        })
        .on("mouseleave", function() {
            if (d3.select('[id="' + d3.select(this).attr("id") + "-row" + '"]')
                .style("background-color") != "lightblue") {
                d3.selectAll('[id="' + d3.select(this).attr("id") + "-row" + '"]')
                    .style("background-color", "white")
                d3.select(this)
                    .style("fill", "red");
            }
        })
        .on('click', function() {
            if (d3.select('[id="' + d3.select(this).attr("id") + "-row" + '"]')
                .style("background-color") == "lightblue") {
                d3.selectAll('[id="' + d3.select(this).attr("id") + "-row" + '"]')
                    .style("background-color", "white")
                d3.select(this)
                    .style("fill", "red");
                return;
            } else {
            d3.select('[id="' + d3.select(this).attr("id") + "-row" + '"]')
                .style("background-color", "lightblue");
            d3.select(this)
                .style("fill", "lightblue");
            window.location.href = "#" + d3.select(this).attr("id") +"-row";
            }
        })
    
    
}

function drawStallList (parcedEvents) {    
    let stallList = [];
    parcedEvents.forEach((dataPoint) => {
        let stall = {
            index: stallList.length+1,
            "time (ms)": dataPoint.time,
            category: dataPoint.category,
            "playhead (ms)": dataPoint.data.playhead.ms,
        };
        stallList.push(stall);
    });

    window.svg = d3.select('#draw-zone')
        .append('div')
        .attr('id', 'right-zone')
        .classed('col-6', true)

    d3.select('#right-zone')
        .append('table')
        .style("border-collapse", "collapse")
        .style("border", "2px black solid");
    
    window.svg.append('thead')
        .append('tr')
        .selectAll('th')
        .data(Object.keys(stallList[0]))
        .enter()
        .append('th')
        .style("border", "1px black solid")
        .style("padding", "5px")
        .text(function (column) { return column; });

    window.svg.append('tbody')
        .selectAll('tr')
        .data(stallList)
        .enter()
        .append('tr')
        .attr("id", function (d) { return d.index + "-row"; })
        .on("mouseover", function() {
            if (d3.select('[id="' + d3.select(this).attr("id") + '"]').style("background-color") != "lightblue") {
                d3.select('[id="' + d3.select(this).attr("id").slice(0, -4) + '"]')
                    .style("fill", "green");
                d3.select(this)
                    .style("background-color", "green");
            }
        })
        .on("mouseleave", function() {
            if (d3.select('[id="' + d3.select(this).attr("id") + '"]').style("background-color") != "lightblue") {
                d3.select('[id="' + d3.select(this).attr("id").slice(0, -4) +'"]')
                    .style("fill", "red")
                d3.select(this)
                    .style("background-color", "white");
            }
        })
        .on('click', function() {
            if (d3.select('[id="' + d3.select(this).attr("id") + '"]')
                .style("background-color") == "lightblue") {
                d3.select('[id="' + d3.select(this).attr("id").slice(0, -4) + '"]')
                    .style("fill", "red");
                d3.select(this)
                    .style("background-color", "white");
            } else {
                d3.select('[id="' + d3.select(this).attr("id").slice(0, -4) + '"]')
                    .style("fill", "lightblue");
                d3.select(this)
                    .style("background-color", "lightblue");
            }
        })
        .selectAll('td')
        .data(function (row) {
            return Object.keys(stallList[0]).map(function (column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append('td')
        .style("border", "1px black solid")
        .style("padding", "5px")
        .text(function (d) { return d.value; });


}

function drawStallButtons () {

    window.svg = d3.select('#draw-zone')
        .append('div')
        .attr('id', 'left-zone')
        .classed('col-6', true)

    // create to-top button
    let buttons = window.svg.append('button')
        .classed('btn btn-dark position-fixed bottom-0 end-50 mb-5', true)
        .style('width', 'auto')

        .text("To top")
        .on('click', function() {
            window.location.href = "#top";
        });

}

function drawCanvasLineChart (file) {
    var fileReader = new FileReader();
    fileReader.onload = function() {
        let fileContent = fileReader.result;
        let parcedEvents = [];
        parcedEvents = parceEvents(fileContent);
        // console.log(parcedEvents);

        var data = [];
        for (let i = 0; i < parcedEvents.length; i++) {
            data.push([parcedEvents[i].time,  i]);
        }


        if (parcedEvents.length == 0) {
            alert("No events found in qlog file");
            clearGraph();
            return;
        } else {
            updateName(file.name);
        }

        const Width = 1000;
        const Height = 700;
        const margin = {top: 20, right: 20, bottom: 30, left: 40};
        const width = Width - margin.right - margin.left;
        const height= Height - margin.top - margin.bottom;

        const xScale = d3.scaleLinear().rangeRound([0, width]);
        const yScale = d3.scaleLinear().rangeRound([height, 0]);
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(  yScale);

        const canvas = d3.select("canvas").attr("width", Width).attr("height", Height);
        const context = canvas.node().getContext('2d');
        context.translate(margin.left, margin.top);

        const line = d3.line()
            .x(d => xScale(d[0]))
            .y(d => yScale(d[1]))
            .context(context);

        const xExtent = d3.extent(data, d => d[0]);
        const yExtent = d3.extent(data, d => d[1]);
        xScale.domain(xExtent);
        yScale.domain(yExtent);

        context.clearRect(0, 0, width, height);
        context.beginPath();
        line(data);
        context.lineWidth = 1;
        context.opacity = 0.7;
        context.strokeStyle = "steelblue";
        context.stroke();
        context.closePath();

                
    }
    fileReader.readAsText(file);
}


//==================================================================================================
// Parcing functions

function groupRequests (parcedList) {
    console.log(parcedList);
    let groupedRequests = [];
    for (let i = 0; i < parcedList.length; i++) {
        if (groupedRequests.find(x => x.data.resource_url == parcedList[i].data.resource_url) == undefined) {
            groupedRequests.push({data: parcedList[i].data.resource_url, count: 1});
        }
        else {
            groupedRequests.find(x => x.data == parcedList[i].data).count++;
        }
    };
    return groupedRequests;
}

function parcePlayhead (events) {
    let playhead = [];
    for (let i = 0; i < events.length; i++) {
        playhead.push({playhead: events[i].data.playhead.ms, time: events[i].time});
    }
    // console.log(playhead);
    return playhead;
}

function orderByType (events) {
    const types = [];
    // console.log(events);
    for (let i = 0; i < events.length; i++) {
        if (types.find(x => x.type == events[i].type) == undefined) {
            types.push({type: events[i].type, count: 1, color: "hsl(" + Math.random() * 360 + ",100%,50%)"});
        } else {
            types.find(x => x.type == events[i].type).count++;
        }
    }
    // console.log(types);
    return types;
}

function parceEvents (fileContent, type = null) {
    const json = JSON.parse(fileContent);
    let events = json.traces[0].events;

    let filter1 = document.getElementById("max").value;
    let filter2 = document.getElementById("min").value;

    if (filter1.value != "" || filter2.value != "") {
        if (document.getElementById("slider-1").checked) {
            let filteredEvents = [];
            for (let i = 0; i < events.length; i++) {
                if (events[i].time <= filter1) {
                    filteredEvents.push(events[i]);
                }
            }
            events = filteredEvents;
        }
        if (document.getElementById("slider-2").checked) {
            let filteredEvents = [];
            for (let i = 0; i < events.length; i++) {
                if (events[i].time >= filter2) {
                    filteredEvents.push(events[i]);
                }
            }
            events = filteredEvents;
            console.log(events);
        }
    }

    if (type == null || type == "events") {
        // console.log("No type specified, returning all events");
        return events;
    } else {
        const typedEvents = [];
        for (let i = 0; i < events.length; i++) {
            if (events[i].type == type) {
                console.log("Found event of type " + type);
                typedEvents.push(events[i]);
            }
        }
        // console.log(typedEvents);
        return typedEvents;
    }
}


//==================================================================================================
// IndexedDB functions

function getIndexDB() {
    const indexedDB =
        window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB ||
        window.shimIndexedDB;
        if (indexedDB){
            return indexedDB
        }
        console.error("indexedDB not supported by this browser")
        return null
}

async function getEventsFromDB(filename, type = null) {
    let file = await getFileFromDB(filename);
    // console.log(file);
    let events = parceEvents(file.content, type);
    return events;
}

async function getFileFromDB(filename){
    return new Promise(function(resolve) {
        const db = getIndexDB();
        const request = db.open("TAPE", 1);
        request.onsuccess = (event) => {
            const db = request.result;
            const transaction = db.transaction("qlog-file", "readonly");
            const objectStore = transaction.objectStore("qlog-file");
            const query = objectStore.get(filename);
            query.onsuccess = (event) => {
                resolve(query.result);
            }
        }
    });
}

async function saveQlogToDB(filename, data) {
    return new Promise(function(resolve) {
        const db = getIndexDB();
        const request = db.open("TAPE", 1);
        request.onsuccess = (event) => {
            const db = request.result;
            console.log(db);
            const transaction = db.transaction("qlog-file", "readwrite");
            const objectStore = transaction.objectStore("qlog-file");
            const query = objectStore.put({"file": filename, content: data});
        }
        resolve("done");
    });
}

async function getConfigurationFromDB (filename) {
    let file = await getFileFromDB(filename);
    let configuration = JSON.parse(file.content).Configuration;
    console.log(configuration);
    if (configuration == undefined) {
        return null;
    }
    return configuration;
}