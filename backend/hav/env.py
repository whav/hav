import os

from dotenv import load_dotenv, find_dotenv

DOTENV = find_dotenv()

def load_env():
    if os.path.isfile(DOTENV):
        load_dotenv(DOTENV)
    return

