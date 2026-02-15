from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("FOODOSCOPE_DB", "foodoscope")

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]

def get_collection(name: str):
    return db[name]
