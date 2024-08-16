import os
from dotenv import load_dotenv

if os.path.exists("config.env"):
    load_dotenv("config.env")
else:
    load_dotenv()


class Config(object):
    STREAMLINK = os.environ.get("STREAMLINK", "aklinksz.fun")
    PORT = int(os.environ.get("PORT", 8080))
