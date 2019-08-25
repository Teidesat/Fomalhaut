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
    maximizeBtn.classList.add("hidden")
    restoreBtn.classList.remove("hidden")
});

restoreBtn.addEventListener("click", ev => {
    browserWin.restore();
    maximizeBtn.classList.remove("hidden")
    restoreBtn.classList.add("hidden")
});

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

function startMonitor() {
    monitorClient.startMonitor();
}

function stopMonitor() {
    monitorClient.stopMonitor();
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

// Main ------------------------------------------------------------------------
function main() {
    connectMonitor();
    setupLeftBarAnimations();
}

main();
