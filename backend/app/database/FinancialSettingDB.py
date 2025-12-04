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


# ===========================
#   UPDATE (NO monthlyExpense)
#   monthlyExpense 由後端自己算
# ===========================
def update_financial_setting(
    user_id: int,
    monthlyIncome: float,
    totalAsset: float,
    expenses: List[Dict[str, Any]],
    investments: List[Dict[str, Any]],
    riskMode: str,
    fixedReturn: float
) -> bool:

    client = get_db_client()
    if client is None:
        return False

    try:
        collection = _get_db(client)["FinancialSettings"]

        # 後端自動加總 monthlyExpense
        monthlyExpense = sum(float(e.get("amount", 0)) for e in expenses)

        financial_data: Dict[str, Any] = {
            "user_id": user_id,
            "monthlyIncome": monthlyIncome,
            "monthlyExpense": monthlyExpense,  # 👍 自動計算
            "totalAsset": totalAsset,
            "expenses": expenses,
            "investments": investments,
            "riskMode": riskMode,
            "fixedReturn": fixedReturn,
        }

        existing = collection.find_one({"user_id": user_id})

        if existing:
            collection.update_one({"user_id": user_id}, {"$set": financial_data})
        else:
            collection.insert_one(financial_data)

        return True

    except Exception as exc:
        print(f"Error updating financial setting: {exc}")
        return False

    finally:
        client.close()


# ===========================
#   GET financial setting
# ===========================
def get_financial_setting(user_id: int) -> Optional[Dict[str, Any]]:

    client = get_db_client()
    if client is None:
        return None

    try:
        collection = _get_db(client)["FinancialSettings"]
        setting = collection.find_one({"user_id": user_id})

        if setting is None:
            return None

        # 直接回傳資料庫的欄位
        return {
            "user_id": setting.get("user_id"),
            "monthlyIncome": setting.get("monthlyIncome"),
            "monthlyExpense": setting.get("monthlyExpense"),  # 有自動計算
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
