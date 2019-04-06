import uuid
import json
import asyncio
import platform
from aiohttp import web

from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaPlayer

from server.Logger import Logger


class WebRTCServer:

    def __init__(self, port=80, logger=None):
        self.__pcs = set()
        self.__logger = logger
        self.__port = port
        self.__app = web.Application()
        self.__app.on_shutdown.append(lambda x: self.on_shutdown(x))
        self.__app.router.add_post('/offer', self.offer)
        self.__app.router.add_static('/', path=str('./public/'))

    def start(self):
        asyncio.set_event_loop(asyncio.new_event_loop())
        web.run_app(self.__app, access_log=None, port=self.__port)

    async def offer(self, request):
        params = await request.json()
        offer = RTCSessionDescription(
            sdp=params['sdp'],
            type=params['type'])

        pc = RTCPeerConnection()
        pc_id = 'PeerConnection(%s)' % uuid.uuid4()
        self.__pcs.add(pc)
        self.log('%s: created for %s' % (pc_id, request.remote), Logger.LogLevel.DEBUG)

        @pc.on('datachannel')
        def on_datachannel(channel):
            @channel.on('message')
            def on_message(message):
                if isinstance(message, str) and message.startswith('ping'):
                    channel.send('pong' + message[4:])

        @pc.on('iceconnectionstatechange')
        async def on_iceconnectionstatechange():
            self.log('%s: ICE connection state is %s' % (pc_id, pc.iceConnectionState), Logger.LogLevel.DEBUG)
            if pc.iceConnectionState == 'failed':
                await pc.close()
                self.__pcs.discard(pc)

        # open webcam
        options = {'video_size': '640x480'}
        if platform.system() == 'Darwin':
            player = MediaPlayer('default:none', format='avfoundation', options=options)
        else:
            player = MediaPlayer('/dev/video0', format='v4l2', options=options)

        await pc.setRemoteDescription(offer)
        for t in pc.getTransceivers():
            if t.kind == 'video' and player.video:
                pc.addTrack(player.video)

        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        return web.Response(
            content_type='application/json',
            text=json.dumps({
                'sdp': pc.localDescription.sdp,
                'type': pc.localDescription.type
            }))

    async def on_shutdown(self, app):
        # close peer connections
        coros = [pc.close() for pc in self.__pcs]
        await asyncio.gather(*coros)
        self.__pcs.clear()

    def log(self, msg, level):
        if self.__logger is not None:
            self.__logger.log(msg, level)
