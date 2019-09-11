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

from src.Service import Service
from src.Logger import Logger


class WebRTCServer(Service):

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
        super().__init__(service_name="WebRTCServer", logger=logger)
        self.on_new_message_listener = None
        self.__camera_preview = WebRTCServer.CameraPreview()
        self.__pcs = set() # Peer connections
        self.__channels = set()
        self.__port = port
        self.__ip = ip
        self.__resolution = resolution
        self.__app = web.Application(middlewares=[IndexMiddleware()])
        self.__app.router.add_post('/offer', self.offer)
        self.__app.router.add_static('/', path=str('../public/'))

        self.__runner = None
        self.__loop = None
        self.__site = None

    def add_frame_to_queue(self, frame):
        self.__camera_preview.add_frame(frame)

    def on_start(self):
        self.__loop = asyncio.get_event_loop()
        self.__runner = web.AppRunner(self.__app)
        self.__loop.run_until_complete(self.__runner.setup())
        self.__site = web.TCPSite(self.__runner, self.__ip, self.__port)
        self.__loop.run_until_complete(self.__site.start())

    def service_run(self):
        import threading
        time.sleep(1) # Do nothing while server runs

    def on_stop(self):
        for pc in self.__pcs:
            loop = asyncio.get_event_loop()
            loop.run_until_complete(pc.close())
        self.__pcs.clear()
        self.__loop.run_until_complete(self.__runner.shutdown())
        self.__loop.run_until_complete(self.__runner.cleanup())
        self.__loop.stop()

    def send_to_all(self, message, request_id=None):
        if not self.is_running():
            return

        if request_id is not None:
            payload = message
            message = {
                'request_id': request_id,
                'payload': payload
            }
        message = json.dumps(message)

        for channel in self.__channels:
            if channel.readyState == 'open':
                channel.send(message)
                self.log('Message sent to channel %s: %s' % (channel.id, message), Logger.LogLevel.DEBUG)

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
            self.log('%s: Data channel established (%s)' % (pc_id, channel.id), Logger.LogLevel.DEBUG)
            self.__channels.add(channel)
            @channel.on('message')
            def on_message(message):
                self.log('Message received from %s: %s' % (pc_id, message), Logger.LogLevel.DEBUG)
                if isinstance(message, str) and self.on_new_message_listener is not None:
                    try:
                        self.on_new_message_listener(json.loads(message))
                    except ValueError:
                        self.log('Invalid message received from %s: %s' % (pc_id, message), Logger.LogLevel.WARNING)

        @pc.on('iceconnectionstatechange')
        async def on_iceconnectionstatechange():
            self.log('%s: ICE connection state is %s' % (pc_id, pc.iceConnectionState), Logger.LogLevel.DEBUG)
            if pc.iceConnectionState == 'failed':
                await pc.close()
                self.log('%s: ICE connection discarded with state %s' % (pc_id, pc.iceConnectionState), Logger.LogLevel.DEBUG)
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
