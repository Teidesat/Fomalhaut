from pathlib import Path


class CSVWriter:

    def __init__(self, file, delimiter=','):
        self.delimiter = delimiter
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

    def write_row(self, columns):
        if self.__file:
            self.__file.write(self.delimiter.join(str(c) for c in columns) + '\n')
