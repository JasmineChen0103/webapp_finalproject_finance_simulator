from typing import List
from pydantic import BaseModel, Field

class FinancialSettingResp(BaseModel):
    """Financial setting response model."""

    user_id: int
    monthlyIncome: float = Field(..., ge=0)
    monthlyExpense: float = Field(..., ge=0)
    totalAsset: float = Field(..., ge=0)
    expenses: List["ExpenseItem"]
    investments: List["InvestmentItem"]
    riskMode: str
    fixedReturn: float = Field(..., ge=0)
    

class ExpenseItem(BaseModel):
    """Expense item structure."""
    category: str
    amount: float = Field(..., ge=0)

class InvestmentItem(BaseModel):
    """Investment item structure."""
    type: str
    amount: float = Field(..., ge=0)
