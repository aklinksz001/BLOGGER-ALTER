from pymongo import MongoClient
import datetime
import os

# Load environment variables from .env
from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

# Establish a connection to MongoDB
client = MongoClient(MONGO_URI)
db = client.get_database()  # Default database

# Function to get the MongoDB collection
def get_db_collection(collection_name):
    return db[collection_name]

# Save the new password in the database
def save_new_password(password):
    """Save the new password in the database with a status of 'active'."""
    db_collection = get_db_collection("passwords")
    
    # Delete the previous password if it exists
    db_collection.delete_many({"status": "active"})
    
    # Save the new password with status active and timestamp
    db_collection.insert_one({
        "password": password,
        "status": "active",
        "created_at": datetime.datetime.now()
    })

# Save the generated access link with timestamp
def save_access_link(access_code, timestamp):
    """Save the generated access link and its expiration timestamp."""
    db_collection = get_db_collection("access_links")
    db_collection.insert_one({
        "access_code": access_code,
        "created_at": timestamp,
        "expires_at": timestamp + datetime.timedelta(minutes=5)  # Link expires in 5 minutes
    })

# Delete old passwords after 24 hours or upon admin reset
def delete_old_password():
    """Delete the old password after 24 hours."""
    db_collection = get_db_collection("passwords")
    db_collection.delete_many({"status": "inactive"})

