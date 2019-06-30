/******************
Variables
*******************/
const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const temperatureSensors = [
    { id: "53245", name: "Core"},
    { id: "62346", name: "Outside"}
];

const voltageSensors = [
    { id: "51745", name: "CPU"}
];

var sensorValues = {};

var sensorGraphId;
var sensorGraphName;

/******************
WebRTC Monitor
*******************/
let thermalMonitorClient = new ThermalMonitorClient();

thermalMonitorClient.onVideoReceived = (stream) => 
{
    document.getElementById('video').srcObject = stream;
}

function addNewSensorValue(sensor)
{    
    document.getElementById(sensor.sensor_id).querySelector(".value strong").innerText = Math.round(sensor.temp * 10) / 10 + " C";
    
    if(sensor.sensor_id in sensorValues)
        sensorValues[sensor.sensor_id].push({ time: sensor.timestamp, value: sensor.temp});
    else
        sensorValues[sensor.sensor_id] = [{ time: sensor.timestamp, value: sensor.temp}];

    if(document.getElementById("graphWrapper").classList.contains("show") == true && sensorGraphId == sensor.sensor_id)
        updateSensorGraph();
}

thermalMonitorClient.onTempReceived = (temp) => 
{    
    addNewSensorValue(temp);
}

thermalMonitorClient.onAllTempsReceived = (temps) => 
{
    temps.forEach(function(temp) {
        addNewSensorValue(temp);
    });
}

thermalMonitorClient.start();

function start_temps() 
{
    thermalMonitorClient.start_temps();
}

function stop_temps() 
{
    thermalMonitorClient.stop_temps();
}

/******************
Web init
*******************/
function createSensors()
{
    temperatureSensors.forEach(function(sensor) {
        var div = document.createElement("div");

        div.setAttribute("id", sensor.id);
        div.classList.add("sensor");
        div.classList.add("temperatureSensors");

        div.innerHTML = "<div class='sensor-data'>" +
                            "<img src='assets/thermometerIcon.png' alt='temperature icon'>" +
                            "<div class='name'><span>" + sensor.name + "</span></div>" +
                            "<div class='temperature value'><strong>0.0 C</strong></div>" +
                        "</div>" +
                        "<div class='graphButton' onclick='graphButtonSelected(this, " + sensor.id + ", \"" + sensor.name + " Temperature\")'>" +
                            "<img src='assets/graphIcon.png' alt='Graph'>" +
                        "</div>";

        document.getElementById("temperatureSensors").appendChild(div);
    });

    voltageSensors.forEach(function(sensor) {
        var div = document.createElement("div");

        div.setAttribute("id", sensor.id);
        div.classList.add("sensor");
        div.classList.add("voltageSensors");

        div.innerHTML = "<div class='sensor-data'>" +
                            "<img src='assets/voltageIcon.png' alt='voltage icon'>" +
                            "<div class='name'><span>" + sensor.name + "</span></div>" +
                            "<div class='voltage value'><strong>0.0 V</strong></div>" +
                        "</div>" +
                        "<div class='graphButton' onclick='graphButtonSelected(this, " + sensor.id + ", \"" + sensor.name + " Voltage\")'>" +
                            "<img src='assets/graphIcon.png' alt='Graph'>" +
                        "</div>";

        document.getElementById("voltageSensors").appendChild(div);
    });
}

createSensors();

/******************
Web features
*******************/
function leftMenuButtonSelected(element, window, title)
{    
    var buttons = document.getElementsByClassName("leftMenuBarButton");
    
    Array.prototype.forEach.call(buttons, function(button) {
        button.classList.remove("selected");
    });

    element.classList.add("selected");

    document.getElementById("tabName").innerText = title.toUpperCase();

    if(window == "app-sensor-window")
        start_temps();
    else
        stop_temps();
    
    var windows = document.getElementsByClassName("window");
    
    Array.prototype.forEach.call(windows, function(window) {
        window.classList.remove("show");
    });
    
    document.getElementById(window).classList.add("show");
}

function addLogMessage(type, msg)
{
    var list = document.getElementById("logs-list");
    var li = document.createElement("li");
    var date = new Date();

    li.innerHTML = "<strong>" + date.getDate() + " " + monthNames[date.getMonth()] + " " + date.getFullYear()
                + ", " + date.toTimeString().substring(0, 15) + ":00"
                + " - " + type + " - </strong><span>" + msg + "</span>";
    
    li.classList.add(type);
    list.appendChild(li);
}

function graphButtonSelected(element, id, name)
{
    var buttons = document.getElementsByClassName("graphButton");
    
    Array.prototype.forEach.call(buttons, function(button) {
        button.classList.remove("selected");
    });

    element.classList.add("selected");

    createSensorGraph(id, name);
    document.getElementById("graphWrapper").classList.add("show");
}

function createSensorGraph(id, name)
{
    sensorGraphId = id;
    sensorGraphName = name;
    
    var canvas = document.getElementById("graphCanvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    ctx.font = "30px Arial";
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    ctx.fillText(name, 500 - (name.length / 2 * 15), 45);
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.lineTo(100, 950);
    ctx.moveTo(100, 950);
    ctx.lineTo(900, 950);   
    ctx.closePath();
    ctx.stroke();

    if(sensorValues[id].length > 0) {
        var timeDiff = sensorValues[id][sensorValues[id].length - 1].time - sensorValues[id][0].time;
        var maxValue = -99999;
        var minValue = 99999;

        sensorValues[id].forEach(function(sensor) {
            if(sensor.value > maxValue)
                maxValue = sensor.value;

            if(sensor.value < minValue)
                minValue = sensor.value;
        });

        ctx.fillStyle = "#000000";
        ctx.fillText("0 s", 100, 985);
        ctx.fillText(Math.round(minValue) + " C", 20, 945);
        ctx.fillText(Math.round(timeDiff / 1000) + " s", 880, 980);
        ctx.fillText(Math.round(maxValue) + " C", 20, 115);

        ctx.moveTo(100, 950);
        ctx.beginPath();
        sensorValues[id].forEach(function(sensor) {
            ctx.fillStyle = "#FF0000";
            var x = 100 + ((800 / timeDiff) * (sensor.time - sensorValues[id][0].time));
            var y = 100 + ((850 / (maxValue - minValue)) * (maxValue - sensor.value));
            ctx.fillRect(x - 5, y - 5, 10, 10);
            ctx.strokeStyle = "#0000FF";
            ctx.lineTo(x , y);
            ctx.stroke();
        });
        ctx.closePath();
    }
}

function updateSensorGraph()
{
    createSensorGraph(sensorGraphId, sensorGraphName);
}

function hideSensorGraph()
{
    var buttons = document.getElementsByClassName("graphButton");
    
    Array.prototype.forEach.call(buttons, function(button) {
        button.classList.remove("selected");
    });

    document.getElementById("graphWrapper").classList.remove("show");

    sensorGraphId = undefined;
    sensorGraphName = undefined;
}