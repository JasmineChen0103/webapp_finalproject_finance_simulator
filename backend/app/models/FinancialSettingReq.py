from typing import List, Optional
from pydantic import BaseModel, Field


class ExpenseItem(BaseModel):
    """Expense item structure."""
    category: str
    amount: float = Field(..., ge=0)


class InvestmentItem(BaseModel):
    """Investment item structure."""
    type: str
    amount: float = Field(..., ge=0)


class FinancialSettingReq(BaseModel):
    """Financial setting request model (NO monthlyExpense)."""

    user_id: int
    monthlyIncome: float = Field(..., ge=0)
    totalAsset: float = Field(..., ge=0)

    expenses: List[ExpenseItem]
    investments: List[InvestmentItem]

    riskMode: str
    fixedReturn: Optional[float] = None
