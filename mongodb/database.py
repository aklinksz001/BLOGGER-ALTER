import os
import time
import pymongo
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

client = pymongo.MongoClient(MONGO_URI)
db = client['access_links']
collection = db['hashes']

def save_hash_to_db(hash_value, expiry_time, secret_key):
    collection.insert_one({
        "hash": hash_value,
        "expiry_time": expiry_time,
        "secret_key": secret_key
    })

def verify_hash(hash_value):
    record = collection.find_one({"hash": hash_value})
    if record and int(time.time()) < record["expiry_time"]:
        return True
    return False
