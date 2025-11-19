# app/main.py
# ---------------------------------------
# 把「使用者輸入」變成「模擬呼叫」，再整理結果
# ---------------------------------------
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Dict, List, Literal, Optional

import numpy as np

from .simulation import (
    MarketModelCore,
    EventCore,
    run_paths,
    box_stats,
    expense_pie,
    realized_cagr,
    monthly_saving_rate,
)

app = FastAPI(title="Finance Simulation API")


# ---------- Pydantic models ----------

class Expenses(BaseModel):  # 前端 JSON 長這樣會自動被parse
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


# ---------- Helpers ----------
def expenses_to_dict(exp: Expenses) -> Dict[str, float]:
    return exp.model_dump()

def apply_expenses_delta(
    base_exp: Dict[str, float],
    delta: Optional[Dict[str, float]],
) -> Dict[str, float]:
    if not delta:
        return dict(base_exp)
    out = dict(base_exp)
    for k, v in delta.items():
        if k in out:
            out[k] = max(out[k] * (1.0 + v), 0.0)
    return out

# ---------- API ----------
@app.post("/simulate")
def simulate(req: SimulationRequest):
    """
    單一模擬端點：
    - 會自動把 baseline 加入 scenarios[0]
    - 回傳每個 scenario 的資產走勢 median/p05/p95，
      以及期末箱形圖、支出圓餅圖、summary 卡片。
    """
    base_exp_dict = expenses_to_dict(req.expenses)

    # Baseline情境放在第一個
    all_scenarios: List[Scenario] = [
        Scenario(name="Baseline")
    ] + req.scenarios

    results = []
    final_assets_all = []   # 收集每個情境的期末資產樣本（箱形圖用）

    market_core = MarketModelCore(
        mode=req.market_model.mode,
        profile=req.market_model.profile,
        fixed_annual_return=req.market_model.fixed_annual_return,
        normal_mu=req.market_model.normal_mu,
        normal_sigma=req.market_model.normal_sigma,
        annual_min=req.market_model.annual_min,
        annual_max=req.market_model.annual_max,
    )

    for sc in all_scenarios:
        # 1) 套用支出 / 投資比調整
        exp_dict = apply_expenses_delta(base_exp_dict, sc.expenses_delta) ## 套用支出比例調整後的消費
        inv_ratio = float(
            np.clip( # 確保投資比例永遠在 0～1 之間
                req.invest_ratio + (sc.invest_ratio_delta or 0.0),
                0.0,
                1.0,
            )
        )

        # 2) 轉換 events
        events_core: List[EventCore] = []
        if sc.events:
            for e in sc.events:
                start = e.month_idx
                end = e.end_month_idx if e.end_month_idx is not None else e.month_idx

                if end < start:
                    # 先簡單 skip
                    end = start
                    
                # 期間事件：依事件類型分成三種情況
                # 1) 一次性現金流 / 區間每月都扣 or override：expense & market_override
                if e.type in ("expense", "market_override"):
                    for m in range(start, end + 1):
                        events_core.append(
                            EventCore(
                                month_idx=m,
                                type=e.type,
                                label=e.label,
                                amount=e.amount,
                                delta=e.delta,
                            )
                        )

                # 2) 永久型變動（沒有 end_month_idx）：income_delta / invest_ratio_delta
                elif e.end_month_idx is None:
                    events_core.append(
                        EventCore(
                            month_idx=start,
                            type=e.type,
                            label=e.label,
                            amount=e.amount,
                            delta=e.delta,
                        )
                    )

                # 3) 區間型暫時變動（有 end_month_idx）：income_delta / invest_ratio_delta 期間提升 / 降低，之後恢復
                else:
                    d = e.delta or 0.0

                    # 區間開始：套用原來的 delta
                    events_core.append(
                        EventCore(
                            month_idx=start,
                            type=e.type,
                            label=e.label,
                            amount=e.amount,
                            delta=d,
                        )
                    )

                    # 區間結束的下一個月：套用「反向 delta」恢復原值
                    revert_month = end + 1
                    # 不要超過模擬範圍
                    if revert_month < req.months:
                        if e.type == "income_delta":
                            # 百分比 vs 金額兩種模式
                            if abs(d) < 1.0:
                                # percentage: income *= (1+d) ... then * (1/(1+d)) 回復
                                revert_d = (1.0 / (1.0 + d)) - 1.0
                            else:
                                # additive: income += d ... then += -d 回復
                                revert_d = -d
                        elif e.type == "invest_ratio_delta":
                            # 投資比例是單純加法，反向就是 -d
                            revert_d = -d
                        else:
                            revert_d = 0.0  # 理論上不會進來

                        events_core.append(
                            EventCore(
                                month_idx=revert_month,
                                type=e.type,
                                label=f"{e.label or ''} (revert)".strip(),
                                amount=e.amount,
                                delta=revert_d,
                            )
                        )

        # 3) 跑 Monte Carlo
        asset_paths, med, p05, p95 = run_paths(
            months=req.months,
            income_monthly=req.income_monthly,
            expenses_monthly=exp_dict,
            invest_ratio=inv_ratio,
            market=market_core,
            events=events_core,
            paths=req.paths,
            seed=req.seed,
        )

        # 蒐集期末資產樣本
        final_assets = asset_paths[:, -1]  # 每個 Monte Carlo 路徑在「最後一個月」的資產
        final_assets_all.append((sc.name, final_assets)) # 各情境下的最終資產

        # 組 scenario 結果
        results.append(
            {
                "scenario": sc.name,
                "months": list(range(1, req.months + 1)),
                "median": med.tolist(),
                "p05": p05.tolist(),
                "p95": p95.tolist(),
                "monthly_expense_total": float(sum(exp_dict.values())),
                "monthly_saving_rate": monthly_saving_rate(
                    req.income_monthly, sum(exp_dict.values())
                ),
            }
        )

    # 組期末資產箱形圖（用所有蒙地卡羅路徑的結果畫） / summary
    distributions = []
    summaries = []
    for name, vals in final_assets_all:
        vals_np = np.asarray(vals, dtype=float)
        stats = box_stats(vals_np)
        distributions.append({"scenario": name, **stats})

        # annualized return: 用最早一個月的 median 當起點（粗略即可）
        # baseline 以外情境一樣用同一個起點比較
        first_asset = results[0]["median"][0] if results[0]["median"] else 0.0
        last_med = float(np.median(vals_np))
        cagr = realized_cagr(first_asset, last_med, req.months) # 用 baseline第一個月份的中位數當起始資產、各sc期末中位數當終點，算實際年化報酬率（幾何）
        summaries.append(
            {
                "scenario": name,
                "final_asset_median": float(stats["p50"]),
                "annualized_return_realized": cagr,
            }
        )

    pie = expense_pie(base_exp_dict)

    return {
        "series": results, # 資產走勢折線圖（多條 scenario，含信賴區間）
        "final_box": distributions, # 末月資產風險分佈箱形圖
        "pie_expenses": pie,       # 目前用 baseline 支出結構
        "summaries": summaries,  # 期末資產(各路徑中位數）、實際年化報酬率
        "used_seed": req.seed,  # 想重現同一次模擬用
    }
