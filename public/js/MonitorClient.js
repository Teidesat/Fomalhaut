class MonitorClient {
    /*
    get video_stats
    get sensors_data
    cmd start_monitor
    cmd stop_monitor
    */

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

        this.MAX_ID = 99999999;
        this.request_id = 0;
        this.request_queue = [];
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
    __parseSdp(sdp) {
        let sdpLines = sdp.split('\r\n');
        let newSdpLines = []
        let h264 = null;

        for (let i = 0; i < sdpLines.length; ++i) {
            let m = sdpLines[i].match(/a=rtpmap:(\d+)\s(.*?)\//);
            if (m !== null && m[2] == 'H264') {
                h264 = m[1];
                break;
            }
        }

        if (h264 == null) {
            return sdp;
        }

        for (let i = 0; i < sdpLines.length; ++i) {
            let m1 = sdpLines[i].match(/m=video\s\d+\s.*?\s/);
            let m2 = sdpLines[i].match(/a=(.*?):(\d+)/);
            if (m1 !== null) {
                sdpLines[i] = m1[0] + h264;
            }
            if (m2 === null) {
                newSdpLines.push(sdpLines[i]);
            } else if (m2[1] != "fmtp" &&  m2[1] != "rtpmap" && m2[1] != "rtcp-fb") {
                newSdpLines.push(sdpLines[i]);
            } else if (m2[2] == h264) {
                newSdpLines.push(sdpLines[i]);
            }
        }

        return newSdpLines.join('\r\n');
    }

    // -------------------------------------------------------------------------
    __negotiate(host, port) {
        this.pc.addTransceiver('video', {direction: 'recvonly'});
        this.dc = this.pc.createDataChannel('datachannel');
        this.dc.onclose = () => this.onDCClose();
        this.dc.onopen = () => this.onDCOpen();
        this.dc.onmessage = evt => { this.__onMessageReceived(JSON.parse(evt.data)); }

        return this.pc.createOffer()
            .then(offer => {
                offer.sdp = this.__parseSdp(offer.sdp);
                this.pc.setLocalDescription(offer);
            })
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
    cmd(cmd) {
        return this.request({
            type: 'cmd',
            cmd: cmd
        }, true)
    }

    // -------------------------------------------------------------------------
    get(data) {
        return this.request({
            type: 'get',
            data: data
        }, true)
    }

    // -------------------------------------------------------------------------
    __is_empty(o) {
        return Object.entries(o).length === 0 && o.constructor === Object
    }

    // -------------------------------------------------------------------------
    request(object, expect_response) {
        if (++this.request_id > this.MAX_ID) {
            this.request_id = 0;
        }
        object.request_id = this.request_id;

        return new Promise((resolve, reject) => {
            if (!this.dc) {
                reject(Error('Can\'t retrieve video stats, data channel is closed'))
            }
            else {
                if (expect_response) {
                    this.request_queue.push({
                        'request_id': object.request_id,
                        'callback': payload => this.__is_empty(payload) ? reject('Payload was empty for ' + object.request_id) : resolve(payload)
                    });
                } else {
                    resolve()
                }
                this.dc.send(JSON.stringify(object));
            }
        });
    }

    // -------------------------------------------------------------------------
    __onMessageReceived(msg) {
        // Default message
        if (msg.request_id == null) {
            this.onMessageReceived(msg);
            return;
        }
        // Mensaje is a response
        for (var i = this.request_queue.length - 1; i >= 0; i--) {
            if (this.request_queue[i].request_id === msg.request_id) {
                this.request_queue[i].callback(msg.payload);
                this.request_queue.splice(i, 1);
                return;
            }
        }
        // Mensaje is a response but id is not found
        Error('Message received as a response with id ' + msg.request_id + ' but id was not found: ' + JSON.stringify(msg))
    }
}
