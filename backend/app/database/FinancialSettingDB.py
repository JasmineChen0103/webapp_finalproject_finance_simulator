import os
from typing import Any, Dict, Optional, List
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
        monthlyIncome: float,
        monthlyExpense: float,
        totalAsset: float,
        expenses: List[Dict[str, Any]],
        investments: List[Dict[str, Any]],
        riskMode: str,
        fixedReturn: float) -> bool:
    
    client = get_db_client()
    if client is None:
        return False
    
    try:
        collection = _get_db(client)["FinancialSettings"]
        financial_data: Dict[str, Any] = {
            "user_id": user_id,
            "monthlyIncome": monthlyIncome,
            "monthlyExpense": monthlyExpense,
            "totalAsset": totalAsset,
            "expenses": expenses,
            "investments": investments,
            "riskMode": riskMode,
            "fixedReturn": fixedReturn,
        }

        existing_record = collection.find_one({"user_id": user_id})
        if existing_record:
            collection.update_one({"user_id": user_id}, {"$set": financial_data})
        else:
            collection.insert_one(financial_data)
        return True
    except Exception as exc:
        print(f"Error updating financial setting: {exc}")
        return False
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
            
        # Ensure all required fields are present
        required_fields = ["user_id", "monthlyIncome", "monthlyExpense", "totalAsset", "expenses", "investments", "riskMode", "fixedReturn"]
        for field in required_fields:
            if field not in setting:
                print(f"Missing required field: {field}")
                return None
        
        return {
            "user_id": setting.get("user_id"),
            "monthlyIncome": setting.get("monthlyIncome"),
            "monthlyExpense": setting.get("monthlyExpense"),
            "totalAsset": setting.get("totalAsset"),
            "expenses": setting.get("expenses", []),
            "investments": setting.get("investments", []),
            "riskMode": setting.get("riskMode"),
            "fixedReturn": setting.get("fixedReturn"),
        }
    except Exception as exc:
        print(f"Error getting financial setting: {exc}")
        return None
    finally:
        client.close()