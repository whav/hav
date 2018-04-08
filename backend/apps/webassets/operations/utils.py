import os

def create_directories(target):
    dirs = os.path.split(target)[0]
    return os.makedirs(dirs, exist_ok=True)
