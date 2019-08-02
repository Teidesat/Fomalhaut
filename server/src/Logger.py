from enum import Enum, auto
from colorama import init as init_colorama
from colorama import Fore, Style


class Logger:

    class LogLevel(Enum):
        DEBUG = auto()
        INFO = auto()
        ERROR = auto()

    def __init__(self, debug=False):
        self.__debug = debug
        init_colorama()

    def log(self, msg, level=LogLevel.INFO):
        if level == Logger.LogLevel.DEBUG:
            if self.__debug:
                print('%s[%s] %s%s' % (Fore.BLUE, level.name, msg, Style.RESET_ALL))
        else:
            if level == Logger.LogLevel.INFO:
                print('%s[%s] %s%s' % (Fore.GREEN, level.name, msg, Style.RESET_ALL))
            else:
                print('%s[%s] %s%s' % (Fore.RED, level.name, msg, Style.RESET_ALL))
