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
    """每月支出結構（可先用這幾個欄位，如果之後要開放更多就再加）。"""

    food: float = 0.0
    rent: float = 0.0
    transport: float = 0.0
    entertainment: float = 0.0
    misc: float = 0.0


class MarketModel(BaseModel):
    mode: Literal["fixed", "normal"] = "fixed"
    
    # 風險/標的預設選項
    profile: Literal["custom", "low_risk", "high_risk"] = "custom"

    # 若 profile="custom" 就會直接用下面這些參數
    fixed_annual_return: float = 0.05
    normal_mu: float = 0.06
    normal_sigma: float = 0.15
    annual_min: Optional[float] = None   # 年化報酬隨機區間下限（例如 -0.2）
    annual_max: Optional[float] = None   # 年化報酬隨機區間上限（例如 0.2）


class Event(BaseModel):    ### 期間型事件
    # 開始月
    month_idx: int = Field(..., ge=0) ## 必填，事件發生在模擬的第幾個月
    # 結束月（可選）
    end_month_idx: Optional[int] = Field(None, ge=0)
    type: Literal["expense", "income_delta",  ## 目前先定義了四種事件（一次性支出、收入/投資比例變動、該期間年化報酬率覆蓋default值）
                  "invest_ratio_delta", "market_override"] 
    label: Optional[str] = None ## 不影響運算
    amount: Optional[float] = None ## expense, market_ovveride用
    delta: Optional[float] = None ## income/invest_ratio_delta用  ## 沒填end的話就是永久變動為


class Scenario(BaseModel):
    """
    UI 裡的「情境卡」：
    - expenses_delta: {'food': -0.07} 代表外食 -7%
    - invest_ratio_delta: +0.05 代表投資比例 +5%
    - events: 一次性旅遊支出 / 加薪等
    - market_override: 目前先不細拆，走 baseline 的 market_model 即可
    """
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
    scenarios: List[Scenario] = []         # 額外情境（Baseline 會自動加）
    paths: int = Field(1000, ge=100, le=20000)   # 要跑幾條路徑（Monte Carlo）
    seed: Optional[int] = 12345
