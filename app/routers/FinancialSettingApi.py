from fastapi import APIRouter, HTTPException, status

try:
    from ..models.FinancialSettingReq import FinancialSettingReq
    from ..models.FinancialSettingResp import FinancialSettingResp
    from ..services.FinancialSettingService import (
        get_financial_setting as get_financial_setting_service,
        update_financial_setting as update_financial_setting_service,
    )
except ImportError:  # Allow running without package context
    from models.FinancialSettingReq import FinancialSettingReq  # type: ignore
    from models.FinancialSettingResp import FinancialSettingResp  # type: ignore
    from services.FinancialSettingService import (  # type: ignore
        get_financial_setting as get_financial_setting_service,
        update_financial_setting as update_financial_setting_service,
    )

router = APIRouter(tags=["financial_setting"], prefix="/financial-setting")

@router.post("/") # create or update financial setting
def post_financial_setting(request: FinancialSettingReq):
    success = update_financial_setting_service(request)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update financial setting.",
        )
    return {"message": "Financial setting updated successfully."}

@router.get("/{user_id}", response_model=FinancialSettingResp)
def get_financial_setting(user_id: int) -> FinancialSettingResp:
    financial_setting = get_financial_setting_service(user_id)
    if financial_setting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Financial setting not found.",
        )
    return financial_setting