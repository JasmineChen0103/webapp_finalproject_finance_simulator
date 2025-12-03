from typing import Optional

try:
    from ..models.FinancialSettingReq import FinancialSettingReq
    from ..models.FinancialSettingResp import FinancialSettingResp
    from ..database.FinancialSettingDB import (
        update_financial_setting as db_update_financial_setting,
        get_financial_setting as db_get_financial_setting,
    )
except ImportError:  # Allow running without package context
    from models.FinancialSettingReq import FinancialSettingReq  # type: ignore
    from models.FinancialSettingResp import FinancialSettingResp  # type: ignore
    from database.FinancialSettingDB import ( # type: ignore
        update_financial_setting as db_update_financial_setting,
        get_financial_setting as db_get_financial_setting,
    )


def update_financial_setting(request: FinancialSettingReq) -> bool:
    return db_update_financial_setting(
        user_id=int(request.user_id),
        expenses=[dict(item) for item in request.expenses],
        investments=[dict(item) for item in request.investments],
        monthlyIncome=float(request.monthlyIncome),
        totalAsset=float(request.totalAsset),
    )

def get_financial_setting(user_id: int) -> Optional[FinancialSettingResp]:
    record = db_get_financial_setting(user_id)
    if not record:
        return None
    user_id = record.get("user_id")
    monthlyIncome = record.get("monthlyIncome")
    totalAsset = record.get("totalAsset")
    expenses = record.get("expenses")
    investments = record.get("investments")
    if (
        user_id is None
        or monthlyIncome is None
        or totalAsset is None
        or expenses is None
        or investments is None
    ):
        return None
    
    return FinancialSettingResp(
        user_id=int(user_id),
        monthlyIncome=float(monthlyIncome),
        totalAsset=float(totalAsset),
        expenses=list(expenses),
        investments=list(investments),
    )