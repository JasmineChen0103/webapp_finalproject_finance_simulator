from typing import Dict, List
from pydantic import BaseModel, Field

class FinancialSettingReq(BaseModel):
    """Financial setting request model."""

    user_id: int
    monthlyIncome: float = Field(..., ge=0)
    totalAsset: float = Field(..., ge=0)
    expenses: List[Dict[str, float]]
    investments: List[Dict[str, float]]
