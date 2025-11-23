import os
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv()


def get_db_client() -> Optional[MongoClient]:
    uri = os.getenv("uri")
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=10000)
        client.server_info()
        return client
    except Exception as exc:
        print(f"Error connecting to MongoDB: {exc}")
        return None


def _get_db(client: MongoClient) -> Any:
    return client["Final"]


def maintain_user_id(client: MongoClient) -> Optional[int]:
    collection = _get_db(client)["ID_Counter"]
    if collection.count_documents({}) == 0:
        collection.insert_one({"_id": "user_id", "seq": 1})
    counter = collection.find_one({"_id": "user_id"})
    if counter is None:
        return None
    collection.update_one({"_id": "user_id"}, {"$inc": {"seq": 1}})
    return int(counter["seq"])


def create(email: str, password: str) -> bool:
    client = get_db_client()
    if client is None:
        return False

    try:
        if check_duplicate(email, client):
            return False

        user_id = maintain_user_id(client)
        if user_id is None:
            return False

        collection = _get_db(client)["Users"]
        user_data: Dict[str, Any] = {
            "user_id": user_id,
            "email": email,
            "password": password,
        }
        collection.insert_one(user_data)
        return True
    finally:
        client.close()


def check_duplicate(email: str, client: Optional[MongoClient] = None) -> bool:
    owns_client = False
    if client is None:
        client = get_db_client()
        if client is None:
            return False
        owns_client = True

    try:
        collection = _get_db(client)["Users"]
        user = collection.find_one({"email": email})
        return user is not None
    finally:
        if owns_client:
            client.close()


def login(email: str) -> Optional[Dict[str, Any]]:
    client = get_db_client()
    if client is None:
        return None

    try:
        collection = _get_db(client)["Users"]
        user = collection.find_one({"email": email})
        if user is None:
            return None
        return {
            "user_id": user.get("user_id"),
            "email": user.get("email"),
            "password": user.get("password"),
        }
    finally:
        client.close()