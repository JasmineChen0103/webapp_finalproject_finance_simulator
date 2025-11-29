import os
from typing import Any, Dict, Optional, List
from pydantic import Field

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

def update_financial_setting(user_id: int,
        expenses: List[Dict[str, float]],
        investments: List[Dict[str, float]],
        monthlyIncome: float = Field(..., ge=0),
        totalAsset: float = Field(..., ge=0)) -> bool:
    client = get_db_client()
    if client is None:
        return False
    try:
        collection = _get_db(client)["FinancialSettings"]
        financial_data: Dict[str, Any] = {
            "user_id": user_id,
            "monthlyIncome": monthlyIncome,
            "totalAsset": totalAsset,
            "expenses": expenses,
            "investments": investments,
        }

        existing_record = collection.find_one({"user_id": user_id})
        if existing_record:
            collection.update_one({"user_id": user_id}, {"$set": financial_data})
        else:
            collection.insert_one(financial_data)
        return True
    finally:
        client.close()

def get_financial_setting(user_id: int) -> Optional[Dict[str, Any]]:
    client = get_db_client()
    if client is None:
        return None

    try:
        collection = _get_db(client)["FinancialSettings"]
        setting = collection.find_one({"user_id": user_id})
        if setting is None:
            return None
        return {
            "user_id": setting.get("user_id"),
            "monthlyIncome": setting.get("monthlyIncome"),
            "totalAsset": setting.get("totalAsset"),
            "expenses": setting.get("expenses"),
            "investments": setting.get("investments"),
        }
    finally:
        client.close()