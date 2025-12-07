from dataclasses import dataclass
from typing import Any, Dict, List, Literal, Optional, Tuple

import numpy as np

try:
    # 假設這是從 SimulationReq 載入的原始模型定義
    from ..models.SimulationReq import Event, Expenses, Scenario, SimulationRequest
except ImportError:  # Allow running without package context
    from models.SimulationReq import Event, Expenses, Scenario, SimulationRequest  # type: ignore


__all__ = ["simulate_financial_plan"]

# --- 常數定義 ---
SIMULATION_MONTHS = 120  # 固定模擬10年（120個月）

# --- 新增的顏色配置與輔助函數 ---

# 為支出類別提供固定的顏色調色板 (Tailwind 顏色模擬)
COLOR_PALETTE = [
    "#34D399", # Emerald-400 (綠色 - 收入/儲蓄)
    "#FBBF24", # Amber-400 (黃色 - 必需支出)
    "#F87171", # Red-400 (紅色 - 波動或風險)
    "#60A5FA", # Blue-400 (藍色 - 投資)
    "#A78BFA", # Violet-400 (紫色 - 娛樂)
    "#E879F9", # Pink-400 (粉色 - 其他)
]

# 趨勢判斷輔助函數
def _determine_trend(diff: float) -> Literal["up", "down", "flat"]:
    if diff > 0.05:
        return "up"
    elif diff < -0.05:
        return "down"
    else:
        return "flat"

# --- 核心數據模型與邏輯 ---

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


def expenses_to_dict(expenses: Expenses) -> Dict[str, float]:
    return expenses.model_dump()


def apply_expenses_delta(
    base_expenses: Dict[str, float], delta: Optional[Dict[str, float]]
) -> Dict[str, float]:
    if not delta:
        return dict(base_expenses)
    updated = dict(base_expenses)
    for key, value in delta.items():
        if key in updated:
            updated[key] = max(updated[key] * (1.0 + value), 0.0)
    return updated


def annual_to_monthly_r(annual: np.ndarray | float) -> np.ndarray:
    return (1.0 + np.array(annual, dtype=float)) ** (1.0 / 12.0) - 1.0


def gen_monthly_returns(
    market: MarketModelCore,
    months: int,
    paths: int,
    rng: Optional[np.random.Generator] = None,
) -> np.ndarray:
    rng = rng or np.random.default_rng()

    if market.mode == "fixed":
        annual_r = np.full((paths, months), market.fixed_annual_return)
        return annual_to_monthly_r(annual_r)

    if market.profile == "low_risk":
        mu_y = 0.04
        sigma_y = 0.10
        amin, amax = -0.15, 0.20
    elif market.profile == "high_risk":
        mu_y = 0.10
        sigma_y = 0.30
        amin, amax = -0.50, 0.80
    else:
        mu_y = market.normal_mu
        sigma_y = market.normal_sigma
        amin = market.annual_min
        amax = market.annual_max

    mu_m = np.log1p(mu_y) / 12.0
    sigma_m = sigma_y / np.sqrt(12.0)
    log_returns = rng.normal(mu_m, sigma_m, size=(paths, months))
    monthly_returns = np.expm1(log_returns)

    if amin is not None:
        monthly_returns = np.maximum(monthly_returns, annual_to_monthly_r(amin))
    if amax is not None:
        monthly_returns = np.minimum(monthly_returns, annual_to_monthly_r(amax))

    return monthly_returns


def month_budget_total(expenses: Dict[str, float]) -> float:
    return float(sum(expenses.values()))


def expense_pie(expenses: Dict[str, float]) -> Dict[str, float]:
    total = month_budget_total(expenses)
    if total <= 0:
        return {key: 0.0 for key in expenses}
    return {key: value / total for key, value in expenses.items()}


def box_stats(values: np.ndarray) -> Dict[str, float]:
    return {
        "p05": float(np.percentile(values, 5)),
        "p25": float(np.percentile(values, 25)),
        "p50": float(np.percentile(values, 50)),
        "p75": float(np.percentile(values, 75)),
        "p95": float(np.percentile(values, 95)),
    }


def realized_cagr(first: float, last: float, months: int) -> float:
    if first <= 0 or last <= 0 or months <= 0:
        return 0.0
    # 確保不會發生負數或零的次方運算
    if first <= 0 or last <= 0:
         return 0.0
    return (last / first) ** (12.0 / months) - 1.0


def monthly_saving_rate(income: float, expenses: float) -> float:
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
    monthly_returns = gen_monthly_returns(market, months, paths, rng)

    # 狀態變數
    cash = np.zeros(paths)                      # C_t
    portfolio = np.zeros(paths)                 # P_t
    alpha = np.full(paths, np.clip(invest_ratio, 0.0, 1.0)) # 投資比 α_t
    income = np.full(paths, income_monthly)     # I_t
    base_expense = month_budget_total(expenses_monthly)     # 固定月支出
    
    # 事件依月份分組
    events_by_month: Dict[int, List[EventCore]] = {}
    for event in events:
        events_by_month.setdefault(event.month_idx, []).append(event)

    med = np.zeros(months)
    p05 = np.zeros(months)
    p95 = np.zeros(months)
    asset_paths = np.zeros((paths, months))

    for idx in range(months):
        # ---- 1) 可投資金額（收入 - 支出）----
        discretionary = np.maximum(income - base_expense, 0.0) # D_t(月收－月支出)
        invest_amount = alpha * discretionary                   # 投資金額
        save_amount = (1.0 - alpha) * discretionary            # 留現金

        # ---- 2) 更新投資與現金 ----
        portfolio = (portfolio + invest_amount) * (1.0 + monthly_returns[:, idx]) # P_{t+1}
        cash = cash + save_amount                                                 # C_{t+1} (先不扣一次性支出)

        # ---- 3) 套用事件 ----
        if idx in events_by_month:
            for event in events_by_month[idx]:
                ## 一次性消費
                if event.type == "expense" and event.amount is not None:
                    cash -= float(event.amount) ## 現金流（儲蓄減少）
                ## 收入比例or金額提升多少
                elif event.type == "income_delta" and event.delta is not None:
                    delta = float(event.delta)
                    # |delta|<1 → 視為百分比；否則視為金額
                    if abs(delta) < 1.0:
                        income *= (1.0 + delta)
                    else:
                        income += delta
                ## 投資比例增加多少
                elif event.type == "invest_ratio_delta" and event.delta is not None:
                    alpha = np.clip(alpha + float(event.delta), 0.0, 1.0)
                elif event.type == "market_override" and event.amount is not None:
                    # e.amount 視為「這個月的年化報酬」
                    monthly_returns[:, idx] = annual_to_monthly_r(event.amount)

        # ---- 4) 現金不足時，自動賣出投資補現金（optional） ----
        if auto_liquidate:
            negative = cash < 0.0
            if np.any(negative):
                required = -cash[negative]
                to_sell = np.minimum(portfolio[negative], required)
                portfolio[negative] -= to_sell
                cash[negative] += to_sell

        asset = cash + portfolio ## 總資產是用現金+投資變現算的
        asset_paths[:, idx] = asset
        med[idx] = np.median(asset)
        p05[idx] = np.percentile(asset, 5)
        p95[idx] = np.percentile(asset, 95)

    return asset_paths, med, p05, p95


def _build_events(events: Optional[List[Event]], months: int) -> List[EventCore]:
    core_events: List[EventCore] = []
    if not events:
        # 先簡單 skip
        return core_events

    for event in events:
        start = event.month_idx
        end = event.end_month_idx if event.end_month_idx is not None else start
        if end < start:
            end = start

        # 期間事件：依事件類型分成三種情況
        # 1) 一次性現金流 / 區間每月都扣 or override：expense & market_override
        if event.type in ("expense", "market_override"):
            for month in range(start, end + 1):
                core_events.append(
                    EventCore(
                        month_idx=month,
                        type=event.type,
                        label=event.label,
                        amount=event.amount,
                        delta=event.delta,
                    )
                )
        # 2) 永久型變動（沒有 end_month_idx）：income_delta / invest_ratio_delta
        elif event.end_month_idx is None:
            core_events.append(
                EventCore(
                    month_idx=start,
                    type=event.type,
                    label=event.label,
                    amount=event.amount,
                    delta=event.delta,
                )
            )
        # 3) 區間型暫時變動（有 end_month_idx）：income_delta / invest_ratio_delta 期間提升 / 降低，之後恢復
        else:
            delta = event.delta or 0.0
            # 區間開始：套用原來的 delta
            core_events.append(
                EventCore(
                    month_idx=start,
                    type=event.type,
                    label=event.label,
                    amount=event.amount,
                    delta=delta,
                )
            )
            # 區間結束的下一個月：套用「反向 delta」恢復原值
            revert_month = end + 1
            # 不要超過模擬範圍
            if revert_month < months:
                if event.type == "income_delta":
                    # 百分比 vs 金額兩種模式
                    if abs(delta) < 1.0:
                        # percentage: income *= (1+d) ... then * (1/(1+d)) 回復
                        revert_delta = (1.0 / (1.0 + delta)) - 1.0
                    else:
                        # additive: income += d ... then += -d 回復
                        revert_delta = -delta
                elif event.type == "invest_ratio_delta":
                    # 投資比例是單純加法，反向就是 -d
                    revert_delta = -delta
                else:
                    revert_delta = 0.0 # 理論上不會進來

                core_events.append(
                    EventCore(
                        month_idx=revert_month,
                        type=event.type,
                        label=f"{event.label or ''} (revert)".strip(),
                        amount=event.amount,
                        delta=revert_delta,
                    )
                )

    return core_events


def simulate_financial_plan(request: SimulationRequest) -> Dict[str, Any]:
    """
    執行財務規劃模擬，固定為10年（120個月）
    """
    # 使用固定的模擬期間
    months = SIMULATION_MONTHS
    
    # 1. 執行核心模擬
    base_expenses = expenses_to_dict(request.expenses)
    scenarios: List[Scenario] = [Scenario(name="Baseline")] + request.scenarios

    market_core = MarketModelCore(
        mode=request.market_model.mode,
        profile=request.market_model.profile,
        fixed_annual_return=request.market_model.fixed_annual_return,
        normal_mu=request.market_model.normal_mu,
        normal_sigma=request.market_model.normal_sigma,
        annual_min=request.market_model.annual_min,
        annual_max=request.market_model.annual_max,
    )

    results: List[Dict[str, Any]] = []
    final_assets_all: List[Tuple[str, np.ndarray]] = [] # 收集每個情境的期末資產樣本

    for scenario in scenarios:
        # 套用支出 / 投資比調整
        expenses_adjusted = apply_expenses_delta(base_expenses, scenario.expenses_delta)
        invest_ratio = float(
            np.clip(
                request.invest_ratio + (scenario.invest_ratio_delta or 0.0),
                0.0,
                1.0,
            )
        )

        # 轉換 events
        events_core = _build_events(scenario.events, months)

        # 跑 Monte Carlo
        asset_paths, median, p05, p95 = run_paths(
            months=months,
            income_monthly=request.income_monthly,
            expenses_monthly=expenses_adjusted,
            invest_ratio=invest_ratio,
            market=market_core,
            events=events_core,
            paths=request.paths,
            seed=request.seed,
        )

        # 蒐集期末資產樣本
        final_assets = asset_paths[:, -1]
        final_assets_all.append((scenario.name, final_assets))

        results.append(
            {
                "scenario": scenario.name,
                "months": list(range(1, months + 1)),
                "median": median.tolist(),
                "p05": p05.tolist(),
                "p95": p95.tolist(),
                "monthly_expense_total": float(sum(expenses_adjusted.values())),
                "monthly_saving_rate": monthly_saving_rate(
                    request.income_monthly, sum(expenses_adjusted.values())
                ),
                # 為了 StatCards 收集 Baseline P05/P75
                "final_p05": float(np.percentile(final_assets, 5)),
                "final_p75": float(np.percentile(final_assets, 75)),
            }
        )

    # 組期末資產箱形圖 / summary
    summaries: List[Dict[str, Any]] = []
    first_asset = results[0]["median"][0] if results[0]["median"] else 0.0 # 初始資產

    for name, values in final_assets_all:
        values_np = np.asarray(values, dtype=float)
        stats = box_stats(values_np)
        last_med = float(np.median(values_np))
        cagr = realized_cagr(first_asset, last_med, months)
        summaries.append(
            {
                "scenario": name,
                "final_asset_median": float(stats["p50"]),
                "annualized_return_realized": cagr,
            }
        )
        
    # 2. 轉換為前端所需格式

    # 2.1. 轉換 lineChart 數據（每個情境都有完整的 P05/P50/P95）
    categories = results[0]["months"] if results else []
    
    # 構建 scenarios 列表，每個情境包含 median, p05, p95
    scenarios_data = []
    for result in results:
        scenarios_data.append({
            "name": result["scenario"],
            "median": result["median"],
            "confidenceUpper": result["p95"],
            "confidenceLower": result["p05"],
        })

    line_chart_data = {
        "categories": categories,
        "scenarios": scenarios_data,
    }

    # 2.2. 轉換 pieChart 數據
    pie_expenses_list = []
    for i, (category, amount) in enumerate(base_expenses.items()):
        pie_expenses_list.append({
            "category": category,
            "amount": round(amount, 2), # 使用絕對月支出金額
            "color": COLOR_PALETTE[i % len(COLOR_PALETTE)] # 循環使用顏色
        })
        
    pie_chart_data = {"expenses": pie_expenses_list}
    
    # 2.3. 轉換 statCards 數據 (以 Baseline 情境為主)
    stat_cards = []
    
    if summaries:
        baseline_summary = summaries[0]
        baseline_result = results[0]
        
        final_asset_median = baseline_summary["final_asset_median"]
        annualized_return = baseline_summary["annualized_return_realized"]
        monthly_saving_rate_val = baseline_result["monthly_saving_rate"]
        worst_case_asset = baseline_result["final_p05"]
        final_p75 = baseline_result["final_p75"]
        
        # Stat Card 1: 期末資產中位數 (P50)
        # diff: 比較 P50 與 P75 的距離 (作為資產增值的參考)
        diff_p50_p75 = final_asset_median - final_p75
        stat_cards.append({
            "title": "預期期末資產 (P50)",
            "value": f"${final_asset_median:,.0f}",
            "iconBgColor": COLOR_PALETTE[3], # 藍色
            "subText": f"對比 P75 估計：{final_p75:,.0f}",
            "diff": round(diff_p50_p75, 0),
            "trend": _determine_trend(diff_p50_p75 / final_asset_median if final_asset_median else 0)
        })

        # Stat Card 2: 實際年化報酬率 (CAGR)
        # diff: 與固定年化報酬率的差異
        diff_cagr_fixed = annualized_return - market_core.fixed_annual_return
        stat_cards.append({
            "title": "實際年化報酬率",
            "value": f"{annualized_return * 100:.2f}%",
            "iconBgColor": COLOR_PALETTE[0], # 綠色
            "subText": f"基準年化報酬率：{market_core.fixed_annual_return * 100:.2f}%",
            "diff": round(diff_cagr_fixed, 4),
            "trend": _determine_trend(diff_cagr_fixed)
        })

        # Stat Card 3: 每月儲蓄率
        # diff: 儲蓄率的絕對值
        stat_cards.append({
            "title": "每月儲蓄率",
            "value": f"{monthly_saving_rate_val * 100:.1f}%",
            "iconBgColor": COLOR_PALETTE[2], # 黃色 (中性)
            "subText": f"每月可支配收入：${request.income_monthly - sum(base_expenses.values()):,.0f}",
            "diff": round(monthly_saving_rate_val, 4),
            "trend": "up" # 儲蓄率通常是越高越好
        })
        
        # Stat Card 4: 95% 最差情境資產 (P05)
        # diff: P05 與 P50 的差異 (風險指標)
        diff_p05_p50 = worst_case_asset - final_asset_median
        stat_cards.append({
            "title": "95% 最差情境資產 (P05)",
            "value": f"${worst_case_asset:,.0f}",
            "iconBgColor": COLOR_PALETTE[2], # 紅色 (風險)
            "subText": f"與中位數差異：${diff_p05_p50:,.0f}",
            "diff": round(diff_p05_p50, 0),
            "trend": _determine_trend(diff_p05_p50 / final_asset_median if final_asset_median else 0)
        })

    # 3. 組裝最終輸出
    return {
        "lineChart": line_chart_data,
        "pieChart": pie_chart_data,
        "statCards": stat_cards,
    }