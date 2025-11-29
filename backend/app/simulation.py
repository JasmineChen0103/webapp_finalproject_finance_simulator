# app/simulation.py
# ---------------------
# 真正做數學 & 隨機模擬
# ---------------------
from dataclasses import dataclass
from typing import Dict, List, Literal, Optional, Tuple
import numpy as np

MarketMode = Literal["fixed", "normal"]

@dataclass
class MarketModelCore:
    mode: MarketMode = "fixed"
    profile: Literal["custom", "low_risk", "high_risk"] = "custom"
    
    fixed_annual_return: float = 0.05           # 固定年化
    normal_mu: float = 0.06                     # 年化期望報酬（幾何）
    normal_sigma: float = 0.15                  # 年化波動
    annual_min: Optional[float] = None          # 年化下限（例如 -0.2）
    annual_max: Optional[float] = None          # 年化上限（例如 +0.2）


@dataclass
class EventCore:
    month_idx: int
    type: Literal["expense", "income_delta",
                  "invest_ratio_delta", "market_override"]
    label: Optional[str] = None
    amount: Optional[float] = None       # expense / market_override 用
    delta: Optional[float] = None        # income_delta / invest_ratio_delta 用


##### 公式 ######
def annual_to_monthly_r(annual: np.ndarray | float) -> np.ndarray:
    """
    年化報酬 → 月化（幾何）：r_m = (1+r_y)^(1/12) - 1
    annual 可以是 scalar 或 array。
    """
    return (1.0 + np.array(annual, dtype=float)) ** (1.0 / 12.0) - 1.0


def gen_monthly_returns(
    market: MarketModelCore,
    months: int,
    paths: int,
    rng: Optional[np.random.Generator] = None,
) -> np.ndarray:
    """
    生成 shape=(paths, months) 的「月報酬矩陣」。
    
    - mode=fixed: 每個月同一個年化報酬
    
    - mode=normal: 以常態分佈生成 log-return，再轉為月報酬
    並可使用 annual_min / annual_max 對應的月報酬做 clip，讓「市場在某個區間內波動」
    """
    rng = rng or np.random.default_rng()

    if market.mode == "fixed":
        r_y = np.full((paths, months), market.fixed_annual_return)
        r_m = annual_to_monthly_r(r_y)
    else:  # "normal" -> 常態分佈
        # 根據 profile 決定年化參數
        if market.profile == "low_risk":
            mu_y = 0.04     # 低風險年化 4%
            sigma_y = 0.10  # 波動較小
            amin, amax = -0.15, 0.20
        elif market.profile == "high_risk":
            mu_y = 0.10     # 高風險年化 10%
            sigma_y = 0.30  # 波動較大
            amin, amax = -0.50, 0.80
        else:
            # custom：用使用者指定的 normal_mu / normal_sigma / annual_min / annual_max
            mu_y = market.normal_mu
            sigma_y = market.normal_sigma
            amin = market.annual_min
            amax = market.annual_max
            
        # 幾何年化 → 月 log-return 參數
        mu_m = np.log1p(mu_y) / 12.0
        sigma_m = sigma_y / np.sqrt(12.0)
        ## 隨機市場月報酬率的生成(先用log return模擬常態分佈再轉換回一般報酬率)
        g = rng.normal(mu_m, sigma_m, size=(paths, months))  # log-return
        r_m = np.expm1(g)
        
        # 若 profile 有給預設 amin/amax，優先用它們；否則回到 market 自己帶的值
        if amin is not None:
            lo = annual_to_monthly_r(amin)
            r_m = np.maximum(r_m, lo)
        if amax is not None:
            hi = annual_to_monthly_r(amax)
            r_m = np.minimum(r_m, hi)

    return r_m


def month_budget_total(expenses: Dict[str, float]) -> float:
    """計算當月支出總額。"""
    return float(sum(expenses.values()))


def expense_pie(expenses: Dict[str, float]) -> Dict[str, float]:
    """輸出圓餅圖比例。"""
    total = month_budget_total(expenses)
    if total <= 0:
        return {k: 0.0 for k in expenses}
    return {k: v / total for k, v in expenses.items()}


def box_stats(values: np.ndarray) -> Dict[str, float]:
    """箱形圖五數摘要：p05, p25, median, p75, p95。"""
    return {
        "p05": float(np.percentile(values, 5)),
        "p25": float(np.percentile(values, 25)),
        "p50": float(np.percentile(values, 50)),
        "p75": float(np.percentile(values, 75)),
        "p95": float(np.percentile(values, 95)),
    }


def realized_cagr(first: float, last: float, months: int) -> float:
    """
    實際年化報酬（幾何）：(last/first)^(12/months) - 1
    first<=0 或 months<=0 時回傳 0。
    """
    if first <= 0 or last <= 0 or months <= 0:
        return 0.0
    return (last / first) ** (12.0 / months) - 1.0


def monthly_saving_rate(income: float, expenses: float) -> float:
    """月儲蓄率 = max(income-expenses, 0) / income。"""
    if income <= 0:
        return 0.0
    return max(income - expenses, 0.0) / income


def run_paths(
    months: int,
    income_monthly: float,
    expenses_monthly: Dict[str, float],
    invest_ratio: float,
    market: MarketModelCore,
    events: List[EventCore],
    paths: int,
    seed: Optional[int] = None,
    auto_liquidate: bool = True,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    核心蒙地卡羅模擬：
    回傳 (asset_paths, med, p05, p95)
    - asset_paths: shape=(paths, months) 的資產走勢，用於後續箱形圖等計算（每條路徑每個月的資產值）
    - med, p05, p95: 供折線 + 區間帶使用
    """
    rng = np.random.default_rng(seed)
    ## 生成月報酬率矩陣（若mode為nomal則月報酬率符合常態分佈）
    r_m = gen_monthly_returns(market, months, paths, rng)

    # 狀態變數
    cash = np.zeros(paths)                     # C_t
    port = np.zeros(paths)                     # P_t
    alpha = np.full(paths, np.clip(invest_ratio, 0.0, 1.0))  # 投資比 α_t
    income = np.full(paths, income_monthly)    # I_t
    base_exp_total = month_budget_total(expenses_monthly)    # 固定月支出

    # 事件依月份分組
    events_by_month: Dict[int, List[EventCore]] = {}
    for e in events:
        events_by_month.setdefault(e.month_idx, []).append(e)

    med = np.zeros(months)
    p05 = np.zeros(months)
    p95 = np.zeros(months)
    asset_paths = np.zeros((paths, months))

    for m in range(months):
        # ---- 1) 可投資金額（收入 - 支出）----
        D = np.maximum(income - base_exp_total, 0.0)  # D_t(月收－月支出)
        invest = alpha * D                               # 投資金額
        save = (1.0 - alpha) * D                      # 留現金

        # ---- 2) 更新投資與現金 ----
        port = (port + invest) * (1.0 + r_m[:, m])       # P_{t+1}
        cash = cash + save                            # C_{t+1} (先不扣一次性支出)

        # ---- 3) 套用事件 ----
        if m in events_by_month:
            for e in events_by_month[m]:
                ## 一次性消費
                if e.type == "expense" and e.amount is not None:
                    cash -= float(e.amount) ## 現金流（儲蓄減少）
                ## 收入比例or金額提升多少
                elif e.type == "income_delta" and e.delta is not None:
                    d = float(e.delta)
                    # |delta|<1 → 視為百分比；否則視為金額
                    if abs(d) < 1.0:
                        income *= (1.0 + d)
                    else:
                        income += d
                ## 投資比例增加多少
                elif e.type == "invest_ratio_delta" and e.delta is not None:
                    alpha = np.clip(alpha + float(e.delta), 0.0, 1.0)
                elif e.type == "market_override" and e.amount is not None:
                    # e.amount 視為「這個月的年化報酬」
                    r_override = annual_to_monthly_r(e.amount)
                    r_m[:, m] = r_override

        # ---- 4) 現金不足時，自動賣出投資補現金（optional） ----
        if auto_liquidate:
            neg = cash < 0.0
            if np.any(neg):
                need = -cash[neg]
                sell = np.minimum(port[neg], need)
                port[neg] -= sell
                cash[neg] += sell

        asset = cash + port  ## 總資產是用現金+投資變現算的
        asset_paths[:, m] = asset
        med[m] = np.median(asset)
        p05[m] = np.percentile(asset, 5)
        p95[m] = np.percentile(asset, 95)

    return asset_paths, med, p05, p95
