import time

class FPSMeter:
    def __init__(self, target=0, seconds=1):
        self.start = time.time()
        self.seconds = seconds
        self.frames = 0
        self.average = 0

    def update(self):
        self.frames += 1
        if (time.time() - self.start) > self.seconds:
            self.average = self.frames / (time.time() - self.start)
            self.start = time.time()
            self.frames = 0
        return self.average
