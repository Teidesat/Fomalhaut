import uuid
import json
import asyncio
import platform
import cv2
import fractions
import time

from aiohttp import web
from aiohttp_index import IndexMiddleware
from threading import Thread

from aiortc.codecs import get_capabilities
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from aiortc.contrib.media import MediaPlayer

from av import VideoFrame
from queue import Queue

from src.utils.Logger import Logger


class WebRTCServer:

    class CameraPreview(VideoStreamTrack):

        kind = 'video'

        def __init__(self, max_size=3):
            super().__init__()
            self.__frame_queue = Queue()
            self.__max_size = max_size
            self.__start = -1

        def add_frame(self, frame):
            if self.__frame_queue.qsize() > self.__max_size:
                self.__frame_queue.get()
            self.__frame_queue.put(frame)

        async def recv(self):
            try:
                super_frame = await super().recv() # TODO
                frame = self.__frame_queue.get()

                if self.__start == -1:
                    self.__start = time.time()

                av_frame = VideoFrame.from_ndarray(frame, format="bgr24")
                av_frame.pts = super_frame.pts#time.time() - self.__start
                av_frame.time_base = super_frame.time_base#fractions.Fraction(1, 1000)
            except Exception as e:
                print(e)
            return av_frame

    def __init__(self, port=80, ip='localhost', resolution='640x480', logger=None):
        self.on_new_message_listener = None
        self.__is_running = False
        self.__camera_preview = WebRTCServer.CameraPreview()
        self.__pcs = set()
        self.__channels = set()
        self.__logger = logger
        self.__port = port
        self.__ip = ip
        self.__resolution = resolution
        self.__app = web.Application(middlewares=[IndexMiddleware()])
        self.__app.router.add_post('/offer', self.offer)
        self.__app.router.add_static('/', path=str('../public/'))
        self.__loop = None
        self.__site = None

    def add_frame_to_queue(self, frame):
        self.__camera_preview.add_frame(frame)

    def is_running(self):
        return self.__is_running

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
            self.__is_running = True
            self.__loop.run_forever()

        thread = Thread(target=thread, daemon=True)
        thread.start()
        self.__log('WebRTC server started %s:%d' % (self.__ip, self.__port), Logger.LogLevel.INFO)

    def close(self):
        self.__log('Closing WebRTC server...', Logger.LogLevel.DEBUG)
        if self.__site is not None and self.__loop is not None:
            async def stop():
                future = asyncio.run_coroutine_threadsafe(self.on_shutdown(), self.__loop)
                future.result()
                self.__loop.stop()
                self.__site = None
                self.__loop = None
                self.__is_running = False

            loop = asyncio.new_event_loop()
            loop.run_until_complete(stop())

    def send_to_all(self, message, request_id=None):
        if not self.__is_running:
            return

        if request_id is not None:
            payload = message
            message = {
                'request_id': request_id,
                'payload': payload
            }
        message = json.dumps(message)

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
                        self.__log('Invalid message received from %s: %s' % (pc_id, message), Logger.LogLevel.WARNING)

        @pc.on('iceconnectionstatechange')
        async def on_iceconnectionstatechange():
            self.__log('%s: ICE connection state is %s' % (pc_id, pc.iceConnectionState), Logger.LogLevel.DEBUG)
            if pc.iceConnectionState == 'failed':
                await pc.close()
                self.__log('%s: ICE connection discarded with state %s' % (pc_id, pc.iceConnectionState), Logger.LogLevel.DEBUG)
                self.__pcs.discard(pc)

        #player = MediaPlayer('src/test_video.mp4', options={'framerate': '30', 'video_size': '1920x1080'})
        await pc.setRemoteDescription(offer)
        for t in pc.getTransceivers():
            #pc.addTrack(player.video)
            pc.addTrack(self.__camera_preview)

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
