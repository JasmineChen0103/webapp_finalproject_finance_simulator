from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field


__all__ = [
    "Expenses",
    "MarketModel",
    "Event",
    "Scenario",
    "SimulationRequest",
]


class Expenses(BaseModel):
    """Monthly expense breakdown."""

    food: float = 0.0
    rent: float = 0.0
    transport: float = 0.0
    entertainment: float = 0.0
    misc: float = 0.0


class MarketModel(BaseModel):
    mode: Literal["fixed", "normal"] = "fixed"
    profile: Literal["custom", "low_risk", "high_risk"] = "custom"
    fixed_annual_return: float = 0.05
    normal_mu: float = 0.06
    normal_sigma: float = 0.15
    annual_min: Optional[float] = None
    annual_max: Optional[float] = None


class Event(BaseModel):
    month_idx: int = Field(..., ge=0)
    end_month_idx: Optional[int] = Field(None, ge=0)
    type: Literal[
        "expense",
        "income_delta",
        "invest_ratio_delta",
        "market_override",
    ]
    label: Optional[str] = None
    amount: Optional[float] = None
    delta: Optional[float] = None


class Scenario(BaseModel):
    name: str = "Baseline"
    expenses_delta: Optional[Dict[str, float]] = None
    invest_ratio_delta: Optional[float] = None
    events: Optional[List[Event]] = None


class SimulationRequest(BaseModel):
    months: int = Field(36, ge=1, le=600)
    income_monthly: float = Field(..., ge=0)
    expenses: Expenses
    invest_ratio: float = Field(0.2, ge=0, le=1)
    market_model: MarketModel
    scenarios: List[Scenario] = []
    paths: int = Field(1000, ge=100, le=20000)
    seed: Optional[int] = 12345
