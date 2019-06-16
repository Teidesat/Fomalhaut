let thermalMonitorClient = new ThermalMonitorClient();

thermalMonitorClient.onVideoReceived = (stream) => {
    document.getElementById('video').srcObject = stream;
}

thermalMonitorClient.onTempReceived = (temp) => {
    document.getElementById('temps').value += temp.timestamp + ',' + temp.sensor_id + ',' + temp.temp + '\\\n';
}

thermalMonitorClient.onAllTempsReceived = (temps) => {
    document.getElementById('temps').value = 'timestamp,sensor_id,temperature\\\n';
    temps.forEach(function(temp) {
        document.getElementById('temps').value += temp.timestamp + ',' + temp.sensor_id + ',' + temp.temp + '\\\n';
    });
}

document.getElementById('temps').value = 'timestamp,sensor_id,temperature\\\n';

function start() {
    document.getElementById('start').style.display = 'none';
    thermalMonitorClient.start();
    document.getElementById('stop').style.display = 'inline-block';
}

function stop() {
    document.getElementById('stop').style.display = 'none';
    thermalMonitorClient.stop();
    document.getElementById('start').style.display = 'inline-block';
}

function start_temps() {
    thermalMonitorClient.start_temps();
}

function stop_temps() {
    thermalMonitorClient.stop_temps();
}

function get_all_temps() {
    thermalMonitorClient.request_all_temps();
}
