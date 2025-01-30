import pymongo
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# Connect to MongoDB
client = pymongo.MongoClient(os.getenv("MONGO_URI"))
db = client["VerificationDB"]
keys_collection = db["keys"]

def generate_key():
    """Generate a random 64-character key."""
    import random
    import string
    return ''.join(random.choices(string.ascii_letters + string.digits, k=64))

def store_key():
    """Generate a key and store it in MongoDB with an expiration time of 30 minutes."""
    key = generate_key()
    expiration_time = datetime.utcnow() + timedelta(minutes=30)

    keys_collection.insert_one({"key": key, "expires_at": expiration_time})
    
    return key

def check_key_validity(key):
    """Check if a given key is valid and not expired."""
    key_data = keys_collection.find_one({"key": key})

    if key_data:
        expiration_time = key_data["expires_at"]
        if datetime.utcnow() < expiration_time:
            remaining_time = (expiration_time - datetime.utcnow()).seconds
            return True, remaining_time
    return False, 0
