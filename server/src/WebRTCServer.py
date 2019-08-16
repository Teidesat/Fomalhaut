import uuid
import json
import asyncio
import platform

from aiohttp import web
from aiohttp_index import IndexMiddleware
from threading import Thread

from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaPlayer

from src.Logger import Logger


class WebRTCServer:

    def __init__(self, port=80, ip='localhost', resolution='640x480', logger=None):
        self.on_new_message_listener = None
        self.__pcs = set()
        self.__channels = set()
        self.__logger = logger
        self.__port = port
        self.__ip = ip
        self.__resolution = resolution
        self.__app = web.Application(middlewares=[IndexMiddleware()])
        self.__app.router.add_post('/offer', self.offer)
        self.__app.router.add_static('/', path=str('./public/'))
        self.__loop = None
        self.__site = None

    def start(self):
        async def runner():
            app_runner = web.AppRunner(self.__app)
            await app_runner.setup()
            self.__site = web.TCPSite(app_runner, self.__ip, self.__port)
            await self.__site.start()

        def thread():
            self.__loop = asyncio.new_event_loop()
            asyncio.set_event_loop(self.__loop)
            self.__loop.run_until_complete(runner())
            self.__loop.run_forever()

        thread = Thread(target=thread, daemon=True)
        thread.start()
        self.__log('WebRTC server started', Logger.LogLevel.DEBUG)

    def close(self):
        self.__log('Closing WebRTC server...', Logger.LogLevel.DEBUG)
        if self.__site is not None and self.__loop is not None:
            async def stop():
                future = asyncio.run_coroutine_threadsafe(self.on_shutdown(), self.__loop)
                future.result()
                self.__loop.stop()
                self.__site = None
                self.__loop = None

            loop = asyncio.new_event_loop()
            loop.run_until_complete(stop())

    def send_to_all(self, message):
        async def task():
            for channel in self.__channels:
                if channel.readyState == 'open':
                    channel.send(message)
                    self.__log('Message sent to channel %s: %s' % (channel.id, message), Logger.LogLevel.DEBUG)
        asyncio.run_coroutine_threadsafe(task(), self.__loop)

    async def offer(self, request):
        params = await request.json()
        offer = RTCSessionDescription(
            sdp=params['sdp'],
            type=params['type'])

        pc = RTCPeerConnection()
        pc_id = 'PeerConnection(%s)' % uuid.uuid4()
        self.__pcs.add(pc)
        self.__log('%s: created for %s' % (pc_id, request.remote), Logger.LogLevel.DEBUG)

        @pc.on('datachannel')
        def on_datachannel(channel):
            self.__log('%s: Data channel established (%s)' % (pc_id, channel.id), Logger.LogLevel.DEBUG)
            self.__channels.add(channel)
            @channel.on('message')
            def on_message(message):
                self.__log('Message received from %s: %s' % (pc_id, message), Logger.LogLevel.DEBUG)
                if isinstance(message, str) and self.on_new_message_listener is not None:
                    try:
                        self.on_new_message_listener(json.loads(message))
                    except ValueError:
                        self.__log('Invalid message received from %s: %s' % (pc_id, message), Logger.LogLevel.ERROR)

        @pc.on('iceconnectionstatechange')
        async def on_iceconnectionstatechange():
            self.__log('%s: ICE connection state is %s' % (pc_id, pc.iceConnectionState), Logger.LogLevel.DEBUG)
            if pc.iceConnectionState == 'failed':
                await pc.close()
                self.__log('%s: ICE connection discarded with state %s' % (pc_id, pc.iceConnectionState), Logger.LogLevel.DEBUG)
                self.__pcs.discard(pc)

        # open webcam
        options = {'video_size': self.__resolution}
        player = None
        try:
            if platform.system() == 'Darwin':
                player = MediaPlayer('default:none', format='avfoundation', options=options)
            else:
                player = MediaPlayer('/dev/video0', format='v4l2', options=options)
        except:
            self.__log('No webcam found!', Logger.LogLevel.ERROR)

        await pc.setRemoteDescription(offer)
        for t in pc.getTransceivers():
            if t.kind == 'video' and player is not None and player.video:
                pc.addTrack(player.video)

        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        return web.Response(
            content_type='application/json',
            text=json.dumps({
                'sdp': pc.localDescription.sdp,
                'type': pc.localDescription.type
            }))

    async def on_shutdown(self):
        # close peer connections
        coros = [pc.close() for pc in self.__pcs]
        await asyncio.gather(*coros)
        self.__pcs.clear()
        self.__log('WebRTC server closed', Logger.LogLevel.DEBUG)

    def __log(self, msg, level):
        if self.__logger is not None:
            self.__logger.log(msg, level)
