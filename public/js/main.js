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
let timestamps = [];
let MAX_ARRAY_SIZE = 30;
let VECTOR = 'xyzwt';
let UNCHECKED_ICON = '<i class="material-icons">check_box_outline_blank</i>';
let CHECKED_ICON = '<i class="material-icons">check_box</i>';

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
    if (type === 'temperature')   return 'assets/sensors/temperature.svg';
    if (type === 'humidity')      return 'assets/sensors/humidity.svg';
    if (type === 'altitude')      return 'assets/sensors/altitude.svg';
    if (type === 'gps')           return 'assets/sensors/gps.svg';
    if (type === 'pressure')      return 'assets/sensors/pressure.svg';
    if (type === 'voltage')       return 'assets/sensors/voltage.svg';
    if (type === 'compass')       return 'assets/sensors/compass.svg';
    if (type === 'accelerometer') return 'assets/sensors/accelerometer.svg';
    if (type === 'gyro')          return 'assets/sensors/gyro.svg';
    if (type === 'latitude')      return 'assets/sensors/latitude.svg';
    if (type === 'longitude')     return 'assets/sensors/longitude.svg';

    return 'assets/sensors/generic.svg';
}

function randomRGB(type) {
    keys  = Object.keys(DARKER_COLORS);
    index = Math.floor(Math.random() * keys.length);
    key   = keys[index];
    return hexToRgb(DARKER_COLORS[key]);
}

function newDataSensor(sensor) {
    let ID = sensor.sensor_id + sensor.type;
    let sensorData = sensorsData[ID];
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
        sensorsData[ID] = {
            'values': [],
            'id': sensor.sensor_id,
            'type': sensor.type,
            'unit': sensor.unit,
            'color': randomRGB(),
            'chbox_element': null,
            'chbox_checked': false
        };
        sensorData = sensorsData[ID];

        card   = document.createElement('DIV');
        icon   = document.createElement('DIV');
        name   = document.createElement('DIV');
        values = document.createElement('DIV');
        id     = document.createElement('DIV');
        type   = document.createElement('DIV');
        value  = document.createElement('DIV');
        //time   = document.createElement('DIV');

        card.id = 'sensor-card-' + ID;
        card.classList.add('sensor-card');
        icon.classList.add('sensor-card-icon');
        name.classList.add('sensor-card-name');
        values.classList.add('sensor-card-values');
        id.classList.add('sensor-card-id');
        type.classList.add('sensor-card-type');
        value.classList.add('sensor-card-value');
        //time.classList.add('sensor-card-time');
        icon.innerHTML = '<img src="' + getTypeIcon(sensor.type) + '" />';

        card.appendChild(icon);
        card.appendChild(name);
        card.appendChild(values);
        name.appendChild(type);
        name.appendChild(id);
        //values.appendChild(time);
        values.appendChild(value);

        if (!isNaN(sensor.value)) {
            chbox = document.createElement('DIV');
            chbox.classList.add('sensor-card-checkbox');
            card.appendChild(chbox);
            chbox.innerHTML = Object.keys(sensorsData).length == 1 ? CHECKED_ICON : UNCHECKED_ICON;
            chbox.onclick = () => {
                sensorData['chbox_checked'] = !sensorData['chbox_checked'];
                updateChartData();
            }
            sensorData['chbox_checked'] = Object.keys(sensorsData).length == 1
            sensorData['chbox_element'] = chbox
        }
        sensorsDataList.appendChild(card);
    } else {
        card   = document.getElementById('sensor-card-' + ID);
        // icon =
        name   = getFirstChildByClassName(card, "sensor-card-name");
        values = getFirstChildByClassName(card, "sensor-card-values");
        chbox  = getFirstChildByClassName(card, "sensor-card-checkbox");
        id     = getFirstChildByClassName(name, "sensor-card-id");
        type   = getFirstChildByClassName(name, "sensor-card-type");
        value  = getFirstChildByClassName(values, "sensor-card-value");
        time   = getFirstChildByClassName(values, "sensor-card-time");
    }

    id.innerHTML    = sensor.sensor_id;
    type.innerHTML  = sensor.type;
    value.innerHTML = sensorValueToStr(sensor.value, sensor.unit);
    sensorData['values'].push(sensor.value)
}

function sensorValueToStr(value, unit) {
    if (Array.isArray(value)) return vectorToStr(value, unit, 2);
    if (isNaN(value)) return value + ' ' + unit;
    return value.toFixed(2) + ' ' + unit;
}

function vectorToStr(vector, unit, toFixed=-1) {
    txt = '';
    for (let i = 0; i < vector.length; ++i) {
        n = toFixed >= 0 ? vector[i].toFixed(toFixed) : vector[i];
        s = n < 0 ? '' : '+';
        txt += `<span class='sensor-card-coord'>${VECTOR[i]}:</span> ${s}${n} ${unit}<br>`;
    }
    return txt;
}

function updateChartData(animation=true) {
    let datasets = [];
    for (const [ _, sensor ] of Object.entries(sensorsData)) {
        if (sensor['chbox_element']) {
            sensor['chbox_element'].innerHTML = sensor['chbox_checked'] ? CHECKED_ICON : UNCHECKED_ICON;
        }
        if (sensor['chbox_checked']) {
            let rgb = sensor['color'];
            datasets.push({
                label: `#${sensor.id} (${sensor['unit']})`,
                data: sensor['values'],
                backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.04)`,
                borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
                borderWidth: 1
            });
        }
    }

    sensorsChart.data = {
        labels: timestamps,
        datasets: datasets
    }

    sensorsChart.update(0);
}

function updateSensors() {
    monitorClient.get('sensors_data')
        .then(data => {
            timestamps.push(new Date(data.timestamp).toLocaleTimeString())
            data.sensors.forEach(sensor => {
                // If the sensor measures different features, just add
                // a card for each feature
                if (Array.isArray(sensor.type)) {
                    for (let i = 0; i < sensor.type.length; ++i) {
                        newDataSensor({
                            sensor_id: sensor.sensor_id,
                            timestamp: sensor.timestamp,
                            type:      sensor.type[i],
                            value:     sensor.value[i],
                            unit:      sensor.unit[i],
                        });
                    }
                } else {
                    newDataSensor(sensor);
                }

                if (timestamps.length > MAX_ARRAY_SIZE) {
                    timestamps = timestamps.slice(-MAX_ARRAY_SIZE, timestamps.length);
                    for (const [ sensorId, sensorData ] of Object.entries(sensorsData)) {
                        sensorsData[sensorId]['values'] = sensorData['values'].slice(-MAX_ARRAY_SIZE, sensorData['values'].length);
                    }
                }
                updateChartData();
            });
        })
        .catch(console.log)
}

// -----------------------------------------------------------------------------
let i0 = null;
let i1 = null;

monitorClient.onDCOpen = () => {
    monitorClient.cmd('is_monitor_running')
        .then(result => {
            result = result.toLowerCase() == '"true"'; // String to bool
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
        .then(() => i0 = setInterval(updateSensors, 3000)) // Returns ok
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
