import time
from threading import Thread
from src.utils.Logger import default_logger as logger
from abc import ABC, abstractmethod


class ServiceLoop(Thread):

    def __init__(self, target, on_error=None, delay=0.5):
        super().__init__()
        self.__terminate = False
        self.__target = target
        self.__delay = delay
        self.on_error = on_error

    def stop(self):
        self.__terminate = True

    def run(self):
        try:
            time.sleep(self.__delay)
            while not self.__terminate:
                self.__target()
        except Exception as err:
            if self.on_error:
                self.on_error(err)


class BaseService(ABC):

    def __init__(self, delay=0.5, service_name=None):
        self.service_name = service_name or 'Unnamed'
        self.__delay = delay
        self.__service_loop = None

    def is_running(self):
        if self.__service_loop:
            return self.__service_loop.is_alive()
        return False

    def start(self):
        if self.__service_loop:
            logger.info('%s service is already running' % self.service_name)
        else:
            self.__service_loop = ServiceLoop(self.service_run, self.on_error)
            self.__service_loop.start()
            self.on_start()
            logger.info('%s service started' % self.service_name)

    def stop(self):
        if not self.__service_loop:
            logger.info('%s service is already stopped' % self.service_name)
        else:
            self.__service_loop.stop()
            self.__service_loop.join()
            self.on_stop()
            self.__service_loop = None
            logger.info('%s service stopped' % self.service_name)

    @abstractmethod
    def service_run(self):
        pass

    def on_start(self):
        pass

    def on_stop(self):
        pass

    def on_error(self, err):
        logger.error('%s service stopped unexpectedly, %s' % (self.service_name, str(err)))
