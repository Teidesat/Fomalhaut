from enum import Enum, auto
from colorama import init as init_colorama
from colorama import Fore, Style


class Logger:

    class LogLevel(Enum):
        DEBUG = auto()
        INFO = auto()
        WARNING = auto()
        ERROR = auto()

    def __init__(self, debug=False):
        self.__debug = debug
        self.on_new_log_listener = None
        init_colorama()

    def log(self, msg, level=LogLevel.INFO):
        if level == Logger.LogLevel.DEBUG:
            if self.__debug:
                print('{:s}[{:^7s}] {:s}{:s}'.format(Fore.CYAN, level.name, msg, Style.RESET_ALL))
        elif level == Logger.LogLevel.INFO:
                print('{:s}[{:^7s}] {:s}{:s}'.format(Fore.GREEN, level.name, msg, Style.RESET_ALL))
        elif level == Logger.LogLevel.ERROR:
            print('{:s}[{:^7s}] {:s}{:s}'.format(Fore.RED, level.name, msg, Style.RESET_ALL))
        else:
            print('{:s}[{:^7s}] {:s}{:s}'.format(Fore.YELLOW, level.name, msg, Style.RESET_ALL))

        if self.on_new_log_listener is not None and level != Logger.LogLevel.DEBUG:
            self.on_new_log_listener({
                'type': 'log',
                'level': level.name,
                'value': msg
            })
