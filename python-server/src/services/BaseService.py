import time
from threading import Thread
from src.utils.Logger import Logger
from abc import ABC, abstractmethod


class ServiceLoop(Thread):

    def __init__(self, target, delay=0.5):
        super().__init__()
        self.__terminate = False
        self.__target = target
        self.__delay = delay

    def stop(self):
        self.__terminate = True

    def run(self):
        time.sleep(self.__delay)
        while not self.__terminate:
            self.__target()


class BaseService(ABC):

    def __init__(self, delay=0.5, service_name=None, logger=None):
        self.service_name = service_name or 'Unnamed'
        self.__logger = logger
        self.__delay = delay
        self.__service_loop = None

    def is_running(self):
        if self.__service_loop:
            return self.__service_loop.is_alive()
        return False

    def start(self):
        if self.__service_loop:
            self.log('%s service is already running' % self.service_name, Logger.LogLevel.INFO)
        else:
            self.__service_loop = ServiceLoop(self.service_run)
            self.__service_loop.start()
            self.on_start()
            self.log('%s service started' % self.service_name, Logger.LogLevel.INFO)

    def stop(self):
        if not self.__service_loop:
            self.log('%s service is already stopped' % self.service_name, Logger.LogLevel.INFO)
        else:
            self.__service_loop.stop()
            self.__service_loop.join()
            self.on_stop()
            self.__service_loop = None
            self.log('%s service stopped' % self.service_name, Logger.LogLevel.INFO)

    def log(self, msg, level):
        if self.__logger is not None:
            self.__logger.log(msg, level)

    @abstractmethod
    def service_run(self):
        pass

    def on_start(self):
        pass

    def on_stop(self):
        pass
