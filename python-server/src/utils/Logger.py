from colorama import init as init_colorama
from colorama import Fore, Style
from pathlib import Path
from time import gmtime, strftime


class Logger:

    def __init__(self, name, show_date=True, show_name=True, show_level=True, show_debug=False, show_trace=False, file=None):
        self.name = name
        self.show_trace = show_trace
        self.show_debug = show_debug
        self.show_date  = show_date
        self.show_name  = show_name
        self.show_level = show_level
        self.on_new_log_listener = None
        self.__file_path = None
        self.__file = None
        self.set_file(file)

    def __del__(self):
        if self.__file:
            self.__file.close()

    def set_file(self, file):
        if self.__file:
            self.__file.close()
        if file:
            self.__file_path = Path(file)
            if not self.__file_path.exists() or self.__file_path.is_file():
                self.__file = self.__file_path.open('a+')

    def debug(self, msg):
        if self.show_debug:
            self.__log(Fore.CYAN, 'debug', msg)

    def trace(self, msg):
        if self.show_trace:
            self.__log(Fore.CYAN, 'trace', msg)

    def info(self, msg):
        self.__log(Fore.GREEN, 'info', msg)

    def error(self, msg):
        self.__log(Fore.RED, 'error', msg)

    def warn(self, msg):
        self.__log(Fore.YELLOW, 'warn', msg)

    def __log(self, color, level, msg):
        line = ''
        if self.show_date:
            line += strftime('%d-%m-%y %H:%M:%S ', gmtime())
        if self.show_name or self.show_level:
            line += '['
        if self.show_name:
            line += self.name
        if self.show_name and self.show_level:
            line += ':'
        if self.show_level:
            line += '{:5s}'.format(level)
        if self.show_name or self.show_level:
            line += '] '

        line += msg
        print('{:s}{:s}{:s}'.format(color, line, Style.RESET_ALL))

        if self.__file:
            self.__file.write(line + '\n')
            # Maybe file should be checked to not be of size > x. And make a new file if so

        if self.on_new_log_listener and level != 'debug' and level != 'trace':
            self.on_new_log_listener({
                'type': 'log',
                'level': level,
                'value': msg
            })

init_colorama()
default_logger = Logger(name='root')
