try {
    const remote = require('electron').remote;

// Electron -------------------------------------------------------------------
    let closeBtn    = document.getElementById("close-btn")
    let minimizeBtn = document.getElementById("minimize-btn")
    let maximizeBtn = document.getElementById("maximize-btn")
    let restoreBtn  = document.getElementById("restore-btn")
    let browserWin  = remote.getCurrentWindow();

    closeBtn.addEventListener("click", ev => {
        browserWin.close();
    });

    minimizeBtn.addEventListener("click", ev => {
        browserWin.minimize();
    });

    maximizeBtn.addEventListener("click", ev => {
        browserWin.maximize();
        maximizeBtn.classList.add("hidden");
        restoreBtn.classList.remove("hidden");
    });

    restoreBtn.addEventListener("click", ev => {
        browserWin.restore();
        maximizeBtn.classList.remove("hidden");
        restoreBtn.classList.add("hidden");
    });
} catch (e) {
    console.log(e);
}

// Connect / Disconnect --------------------------------------------------------
let hostInput = document.getElementById('server-host');
let portInput = document.getElementById('server-port');
let cameraPreview = document.getElementById('camera-preview');
let monitorClient = new MonitorClient();

monitorClient.onVideoReceived = stream => {
    cameraPreview.srcObject = stream;
}

monitorClient.onMessageReceived = console.log;

function connectMonitor() {
    if (monitorClient.status === 'disconnected') {
        let host = hostInput.value || hostInput.getAttribute("placeholder");
        let port = portInput.value || portInput.getAttribute("placeholder");
        monitorClient.connect(host, port);
    }
}

function disconnectMonitor() {
    if (monitorClient.status === 'connected') {
        monitorClient.disconnect();
    }
}

function getSensorsDataMonitor() {
    monitorClient.requestSensorsData();
}

// Animations/Sections ---------------------------------------------------------
let iconInfo    = document.getElementById('info-icon');
let iconCamera  = document.getElementById('camera-icon');
let iconSensors = document.getElementById('sensors-icon');
let iconLogs    = document.getElementById('logs-icon');
let sectionInfo    = document.getElementById('info-section');
let sectionCamera  = document.getElementById('camera-section');
let sectionSensors = document.getElementById('sensors-section');
let sectionLogs    = document.getElementById('logs-section');
let activeSection = sectionCamera;
let activeIcon = iconCamera;

function setupLeftBarAnimations() {
    icons = [iconInfo, iconCamera, iconSensors, iconLogs];
    sections = [sectionInfo, sectionCamera, sectionSensors, sectionLogs];

    for (let i = 0; i < icons.length; ++i) {
        let icon = icons[i];
        let section = sections[i];

        icon.addEventListener("click", ev => {
            if (activeSection === section) {
                return
            }

            activeSection.classList.add('hidden');
            section.classList.remove('hidden');
            icon.classList.remove('icon-disabled');
            activeIcon.classList.add('icon-disabled');
            activeIcon = icon;
            activeSection = section;
        });
    }
}

// Animations/Server -----------------------------------------------------------
let statusIndicator  = document.getElementById('server-status-indicator');
let statusName       = document.getElementById('server-status-name');
let connectButton    = document.getElementById('server-connect-btn');
let disconnectButton = document.getElementById('server-disconnect-btn');

function setButtonState(button, enabled) {
    if (enabled) {
        button.classList.add('clickable', 'circle-icon-hover');
        button.classList.remove('circle-icon-disabled');
    } else {
        button.classList.add('circle-icon-disabled');
        button.classList.remove('clickable', 'circle-icon-hover');
    }
}

monitorClient.onStatusChange = status => {
    statusIndicator.classList.remove('status-connected', 'status-disconnected', 'status-connecting');
    switch (status) {
        case 'connected':    statusIndicator.classList.add('status-connected');     break;
        case 'disconnected': statusIndicator.classList.add('status-disconnected');  break;
        case 'connecting':   statusIndicator.classList.add('status-connecting');    break;
        default: break;
    }
    statusName.innerHTML = status;

    if (status === 'connected') {
        setButtonState(connectButton, false);
        setButtonState(disconnectButton, true);
    } else if (status === 'disconnected') {
        setButtonState(connectButton, true);
        setButtonState(disconnectButton, false);
    } else {
        setButtonState(connectButton, false);
        setButtonState(disconnectButton, false);
    }
}

// Logs ------------------------------------------------------------------------
function addLog(value) {
    console.log(value);
}

// Sensors ---------------------------------------------------------------------
let sensorsDataList = document.getElementById('sensors-data-list');
let sensorsData = {};
let MAX_ARRAY_SIZE = 30;
let UNCHECKED_ICON = '<i class="material-icons">radio_button_unchecked</i>';
let CHECKED_ICON = '<i class="material-icons">radio_button_checked</i>';

let activeSensorId = null;
let sensorsCtx = document.getElementById('sensors-chart').getContext('2d');
let sensorsChart = new Chart(sensorsCtx, {
    type: 'line',
    data: {
        labels: [],
		datasets: []
	},
    options: {
        maintainAspectRatio: false
    }
});

function getFirstChildByClassName(element, className) {
    for (let i = 0; i < element.childNodes.length; ++i) {
        if (element.childNodes[i].className === className) {
          return element.childNodes[i];
        }
    }
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

function getTypeIcon(type) {
    if (type === 'temperature') return 'assets/sensors/temperature.svg';
    if (type === 'humidity')    return 'assets/sensors/humidity.svg';
    if (type === 'altitude')    return 'assets/sensors/altitude.svg';
    if (type === 'gps')         return 'assets/sensors/gps.svg';
    if (type === 'pressure')    return 'assets/sensors/pressure.svg';
    if (type === 'voltage')     return 'assets/sensors/voltage.svg';

    return 'assets/sensors/generic.svg';
}

function pickColor(type, opacity=1) {
    if (type === 'temperature') return 'rgba(245,  66,  66,' + opacity + ')';
    if (type === 'humidity')    return 'rgba( 66, 197, 245,' + opacity + ')';
    if (type === 'altitude')    return 'rgba( 66, 245,  81,' + opacity + ')';
    if (type === 'gps')         return 'rgba(144,  66, 245,' + opacity + ')';
    if (type === 'pressure')    return 'rgba( 66, 108, 245,' + opacity + ')';
    if (type === 'voltage')     return 'rgba(108, 245,  66,' + opacity + ')';

    return 'rgba(50, 50, 50,' + opacity + ')';
}

function getUnits(type) {
    if (type === 'temperature') return 'ºC';
    if (type === 'humidity')    return '%';
    if (type === 'voltage')     return 'V';

    return '';
}

function newDataSensor(sensor) {
    let sensorData = sensorsData[sensor.sensor_id];
    let card   = null;
    let icon   = null;
    let name   = null;
    let values = null;
    let chbox  = null;
    let id     = null;
    let type   = null;
    let value  = null;
    let time   = null;

    if (!sensorData) {
        sensorsData[sensor.sensor_id] = {
            'x': [], 'y': [],
            'type': sensor.type
        };
        sensorData = sensorsData[sensor.sensor_id];

        card   = document.createElement('DIV');
        icon   = document.createElement('DIV');
        name   = document.createElement('DIV');
        values = document.createElement('DIV');
        chbox  = document.createElement('DIV');
        id     = document.createElement('DIV');
        type   = document.createElement('DIV');
        value  = document.createElement('DIV');
        time   = document.createElement('DIV');

        card.id = 'sensor-card-' + sensor.sensor_id;
        card.classList.add('sensor-card');
        icon.classList.add('sensor-card-icon');
        name.classList.add('sensor-card-name');
        values.classList.add('sensor-card-values');
        chbox.classList.add('sensor-card-checkbox');
        id.classList.add('sensor-card-id');
        type.classList.add('sensor-card-type');
        value.classList.add('sensor-card-value');
        time.classList.add('sensor-card-time');
        icon.innerHTML = '<img src="' + getTypeIcon(sensor.type) + '" />';
        chbox.innerHTML = UNCHECKED_ICON;
        chbox.onclick = () => setChartData(sensor.sensor_id);

        card.appendChild(icon);
        card.appendChild(name);
        card.appendChild(values);
        card.appendChild(chbox);
        name.appendChild(type);
        name.appendChild(id);
        values.appendChild(value);
        values.appendChild(time);
        sensorsDataList.appendChild(card);
    } else {
        card   = document.getElementById('sensor-card-' + sensor.sensor_id);
        // icon =
        name   = getFirstChildByClassName(card, "sensor-card-name");
        values = getFirstChildByClassName(card, "sensor-card-values");
        chbox  = getFirstChildByClassName(card, "sensor-card-checkbox");
        id     = getFirstChildByClassName(name, "sensor-card-id");
        type   = getFirstChildByClassName(name, "sensor-card-type");
        value  = getFirstChildByClassName(values, "sensor-card-value");
        time   = getFirstChildByClassName(values, "sensor-card-time");
    }

    sensorValue = parseFloat(sensor.value)
    sensorTimestamp = new Date(parseInt(sensor.timestamp)).toLocaleTimeString()

    id.innerHTML    = sensor.sensor_id;
    type.innerHTML  = sensor.type;
    value.innerHTML = sensorValue.toFixed(2) + ' ' + getUnits(sensor.type);
    time.innerHTML  = sensorTimestamp;

    sensorData['y'].push(sensorValue)
    sensorData['x'].push(sensorTimestamp)
    if (sensorData['y'].length > MAX_ARRAY_SIZE) {
        sensorData['y'] = sensorData['y'].slice(-MAX_ARRAY_SIZE, sensorData['y'].length);
        sensorData['x'] = sensorData['x'].slice(-MAX_ARRAY_SIZE, sensorData['x'].length);
    }

    if (Object.keys(sensorsData).length == 1) {
        chbox.innerHTML = CHECKED_ICON;
        setChartData(sensor.sensor_id);
    } else if (sensor.sensor_id === activeSensorId) {
        setChartData(sensor.sensor_id, false);
    }
}

function setChartData(sensorId, animation=true) {
    if (activeSensorId) {
        card = document.getElementById('sensor-card-' + activeSensorId);
        chbox = getFirstChildByClassName(card, "sensor-card-checkbox");
        chbox.innerHTML = UNCHECKED_ICON;
    }
    activeSensorId = sensorId;
    card = document.getElementById('sensor-card-' + activeSensorId);
    chbox = getFirstChildByClassName(card, "sensor-card-checkbox");
    chbox.innerHTML = CHECKED_ICON;

    let sensorData = sensorsData[sensorId];
    sensorsChart.data = {
        labels: sensorData['x'],
        datasets: [{
            label: capitalize(sensorData['type']) + ' (' + getUnits(sensorData['type']) + ')',
            data: sensorData['y'],
            backgroundColor: pickColor(sensorData['type'], 0.2),
            borderColor: pickColor(sensorData['type'], 1),
            borderWidth: 1
        }]
    }
    if (animation) {
        sensorsChart.update();
    } else {
        sensorsChart.update(0);
    }
}

function updateSensors() {
    monitorClient.get('sensors_data')
        .then(data => data.forEach(newDataSensor))
        .catch(console.log)
}

// -----------------------------------------------------------------------------
let i0 = null;
let i1 = null;

monitorClient.onDCOpen = () => {
    monitorClient.cmd('is_monitor_running')
        .then(result => {
            result = result.toLowerCase() == '"true"'; // To bool
            if (result) {
                i0 = setInterval(updateSensors, 1500);
            }
        })
        .catch(console.log)
    //i1 = setInterval(updateVideoStats, 1500);
};

monitorClient.onDCClose = () => {
    clearInterval(i0);
    clearInterval(i1);
}

function startMonitor() {
    monitorClient.cmd('start_monitor')
        .then(() => i0 = setInterval(updateSensors, 1500)) // Returns ok
        .catch(console.error)
}

function stopMonitor() {
    monitorClient.cmd('stop_monitor')
        .then(() => clearInterval(i0)) // Returns ok
        .catch(console.error)
}

// Main ------------------------------------------------------------------------
function main() {
    connectMonitor();
    setupLeftBarAnimations();
}

main();
