let monitorClient = new MonitorClient();

monitorClient.onVideoReceived = (stream) => {
    document.getElementById('video').srcObject = stream;
}

monitorClient.onSensorDataReceived = (sensorData) => {
    document.getElementById('sensors').value += sensorData.timestamp + ',' + sensorData.sensor_id + ',' + sensorData.type + ',' + sensorData.value + '\\\n';
}

monitorClient.onSensorsDataReceived = (sensorsData) => {
    document.getElementById('sensors').value = 'timestamp,sensor_id,type,value\\\n';
    sensorsData.forEach(function(sensorData) {
        document.getElementById('sensors').value += sensorData.timestamp + ',' + sensorData.sensor_id + ',' + sensorData.type + ',' + sensorData.value + '\\\n';
    });
}

monitorClient.onMessageReceived = (message) => {
    if (message.type === 'log') {
        document.getElementById('log').value += message.value + '\\\n';
    }
}

document.getElementById('sensors').value = 'timestamp,sensor_id,type,value\\\n';

function connect() {
    document.getElementById('start').style.display = 'none';
    monitorClient.connect();
    document.getElementById('stop').style.display = 'inline-block';
}

function disconnect() {
    document.getElementById('stop').style.display = 'none';
    monitorClient.disconnect();
    document.getElementById('start').style.display = 'inline-block';
}

function start_monitor() {
    monitorClient.start_monitor();
}

function stop_monitor() {
    monitorClient.stop_monitor();
}

function get_sensors_data() {
    monitorClient.request_sensors_data();
}
