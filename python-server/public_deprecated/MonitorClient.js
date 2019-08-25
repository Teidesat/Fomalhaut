class MonitorClient {
    constructor() {
        this.pc = null;
        this.dc = null;
        this.onVideoReceived = null;
        this.onSensorDataReceived = null;
        this.onSensorsDataReceived = null;
        this.onMessageReceived = null;
    }

    connect() {
        let self = this;

        this.pc = new RTCPeerConnection({
            sdpSemantics: 'unified-plan'
        });

        this.pc.addEventListener('track', function(evt) {
            if (evt.track.kind == 'video' && typeof self.onVideoReceived === 'function') {
                self.onVideoReceived(evt.streams[0]);
            }
        });

        function createDataChannel(pc) {
            self.dc = pc.createDataChannel('datachannel');
            self.dc.onclose = function() {
                console.log('Data channel closed');
            };

            self.dc.onopen = function() {
                console.log('Data channel open');
            };

            self.dc.onmessage = function(evt) {
                let msg = JSON.parse(evt.data);
                if (msg.type === 'sensor_data' && typeof self.onSensorDataReceived === 'function') {
                    self.onSensorDataReceived(msg.sensorData);
                } else if (msg.type === 'sensors_data' && typeof self.onSensorsDataReceived === 'function') {
                    self.onSensorsDataReceived(msg.sensorsData);
                } else if (typeof self.onMessageReceived === 'function') {
                    self.onMessageReceived(msg);
                }
            };
        }

        function negotiate(pc) {
            pc.addTransceiver('video', {direction: 'recvonly'});
            createDataChannel(pc);
            return pc.createOffer().then(function(offer) {
                return pc.setLocalDescription(offer);
            }).then(function() {
                // wait for ICE gathering to complete
                return new Promise(function(resolve) {
                    if (pc.iceGatheringState === 'complete') {
                        resolve();
                    } else {
                        function checkState() {
                            if (pc.iceGatheringState === 'complete') {
                                pc.removeEventListener('icegatheringstatechange', checkState);
                                resolve();
                            }
                        }
                        pc.addEventListener('icegatheringstatechange', checkState);
                    }
                });
            }).then(function() {
                var offer = pc.localDescription;
                return fetch('/offer', {
                    body: JSON.stringify({
                        sdp: offer.sdp,
                        type: offer.type,
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST'
                });
            }).then(function(response) {
                return response.json();
            }).then(function(answer) {
                return pc.setRemoteDescription(answer);
            }).catch(function(e) {
                alert(e);
            });
        }

        negotiate(this.pc);
    }

    disconnect() {
        if (this.pc) {
            let self = this;
            setTimeout(function() {
                self.pc.close();
                self.pc = null;
                self.dc = null;
            }, 500);
        }
    }

    start_monitor() {
        if (this.dc) {
            this.dc.send(JSON.stringify({
                type: 'cmd',
                cmd: 'start'
            }));
        }
    }

    stop_monitor() {
        if (this.dc) {
            this.dc.send(JSON.stringify({
                type: 'cmd',
                cmd: 'stop'
            }));
        }
    }

    request_sensors_data() {
        if (this.dc) {
            this.dc.send(JSON.stringify({
                type: 'cmd',
                cmd: 'request_sensors_data'
            }));
        }
    }
}
