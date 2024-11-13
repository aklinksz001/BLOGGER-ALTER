
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection URI (from .env)
MONGO_URI = os.getenv("MONGO_URI")

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["time_based_access"]  # Database name
hashes_collection = db["access_hashes"]  # Collection for storing generated hashes

# Function to save the generated hash and expiry time in the database
def save_hash_to_db(hash_value, expiry_time):
    hash_data = {
        "hash": hash_value,
        "expiry_time": expiry_time
    }
    hashes_collection.insert_one(hash_data)
    print(f"Hash {hash_value} saved to database with expiry time {expiry_time}")

# Function to check if a hash exists and is still valid
def check_hash_validity(hash_value):
    # Fetch the hash from the database
    hash_data = hashes_collection.find_one({"hash": hash_value})
    if hash_data:
        if hash_data["expiry_time"] > int(time.time()):
            return True  # Hash is valid
    return False  # Hash is either invalid or expired
