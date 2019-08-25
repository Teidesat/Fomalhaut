class MonitorClient {

    // -------------------------------------------------------------------------
    constructor() {
        this.status = 'disconnected';
        this.pc = null;
        this.dc = null;
        this.onStatusChange        = () => {};
        this.onDCClose             = () => {};
        this.onDCOpen              = () => {};
        this.onVideoReceived       = console.log;
        this.onMessageReceived     = console.log;
    }

    // -------------------------------------------------------------------------
    __setStatus() {
        if (this.pc === null || this.pc === undefined) {
            this.status = 'disconnected';
            console.log(this.status);
        }
        else {
            let gState = this.pc.iceGatheringState;
            let cState = this.pc.iceConnectionState;
            let sState = this.pc.signalingState;

            if (cState === 'connected' && sState === 'stable')
                this.status = 'connected';

            else if (sState === 'stable' || sState === 'closed')
                this.status = 'disconnected';

            else
                this.status = 'connecting';
        }
        this.onStatusChange(this.status);
    }

    // -------------------------------------------------------------------------
    __setStatusError(e) {
        console.error(e);
        this.status = 'disconnected';
        this.onStatusChange(this.status);
    }

    // -------------------------------------------------------------------------
    __checkState() {
        if (this.pc.iceGatheringState === 'complete') {
            this.pc.removeEventListener('icegatheringstatechange', this.checkState);
            resolve();
        }
    }

    // -------------------------------------------------------------------------
    __negotiate(host, port) {
        this.pc.addTransceiver('video', {direction: 'recvonly'});
        this.dc = this.pc.createDataChannel('datachannel');
        this.dc.onclose = this.onDCClose;
        this.dc.onopen = this.onDCOpen;
        this.dc.onmessage = evt => { this.onMessageReceived(JSON.parse(evt.data)); }

        return this.pc.createOffer()
            .then(offer => this.pc.setLocalDescription(offer))
            .then(() => {
                return new Promise(resolve => {
                    if (this.pc.iceGatheringState === 'complete') {
                        resolve();
                    } else {
                        let self = this;
                        function checkState() {
                            if (self.pc.iceGatheringState === 'complete') {
                                self.pc.removeEventListener('icegatheringstatechange', checkState);
                                resolve();
                            }
                        }
                        this.pc.addEventListener('icegatheringstatechange', checkState);
                    }
                });
            })
            .then(() => {
                return fetch(`http://${host}:${port}/offer`, {
                    body: JSON.stringify({
                        sdp: this.pc.localDescription.sdp,
                        type: this.pc.localDescription.type,
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST'
                });
            })
            .then(response => response.json())
            .then(answer => this.pc.setRemoteDescription(answer))
            .catch(e => {
                this.__setStatusError(e);
            });
    }

    // -------------------------------------------------------------------------
    connect(host, port) {
        this.pc = new RTCPeerConnection({
            sdpSemantics: 'unified-plan'
        });
        this.pc.addEventListener('track', evt => {
            if (evt.track.kind === 'video') {
                this.onVideoReceived(evt.streams[0]);
            }
        });
        this.pc.addEventListener('icegatheringstatechange', () => {this.__setStatus()}, false);
        this.pc.addEventListener('iceconnectionstatechange', () => {this.__setStatus()}, false);
        this.pc.addEventListener('signalingstatechange', () => {this.__setStatus()}, false);
        this.__negotiate(host, port);
    }

    // -------------------------------------------------------------------------
    disconnect() {
        if (this.pc) {
            this.pc.close();
            setTimeout(() => {
                this.pc = null;
                this.dc = null;
            }, 300);
        }
    }

    // -------------------------------------------------------------------------
    startMonitor() {
        if (this.dc) {
            this.dc.send(JSON.stringify({
                type: 'cmd',
                cmd: 'start'
            }));
        }
    }

    // -------------------------------------------------------------------------
    stopMonitor() {
        if (this.dc) {
            this.dc.send(JSON.stringify({
                type: 'cmd',
                cmd: 'stop'
            }));
        }
    }

    // -------------------------------------------------------------------------
    requestSensorsData() {
        if (this.dc) {
            this.dc.send(JSON.stringify({
                type: 'cmd',
                cmd: 'request_sensors_data'
            }));
        }
    }
}
