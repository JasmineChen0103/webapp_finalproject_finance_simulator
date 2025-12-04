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
    from database.FinancialSettingDB import (  # type: ignore
        update_financial_setting as db_update_financial_setting,
        get_financial_setting as db_get_financial_setting,
    )


def update_financial_setting(request: FinancialSettingReq) -> bool:
    return db_update_financial_setting(
        user_id=int(request.user_id),
        monthlyIncome=float(request.monthlyIncome),
        totalAsset=float(request.totalAsset),
        expenses=[dict(item) for item in request.expenses],
        investments=[dict(item) for item in request.investments],
        riskMode=str(request.riskMode),
        fixedReturn=float(request.fixedReturn) if request.fixedReturn is not None else None,
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
    riskMode = record.get("riskMode")
    fixedReturn = record.get("fixedReturn")

    # 任一欄位缺失 → 回傳 None
    if (
        user_id is None
        or monthlyIncome is None
        or totalAsset is None
        or expenses is None
        or investments is None
        or riskMode is None
        or fixedReturn is None
    ):
        return None

    return FinancialSettingResp(
        user_id=int(user_id),
        monthlyIncome=float(monthlyIncome),
        totalAsset=float(totalAsset),
        expenses=list(expenses),
        investments=list(investments),
        riskMode=str(riskMode),
        fixedReturn=float(fixedReturn) if fixedReturn is not None else None,
    )
