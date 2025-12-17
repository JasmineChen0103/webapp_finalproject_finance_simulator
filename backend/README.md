# Simulation（Monte Carlo 財務模擬）

本模組負責根據使用者的「全局設定（收入/支出/投資比例/市場模型）」與多張「情境卡（Scenario）」進行 **蒙地卡羅模擬**，並輸出可直接給前端畫圖的資料（資產走勢區間帶、支出圓餅、統計卡片）。

* 固定模擬期間：**10 年 = 120 個月**（`SIMULATION_MONTHS = 120`）
* 每個情境跑 `paths` 條路徑（預設 1000）
* 每個月更新：現金、投資組合、事件造成的變動
* 若現金不足：可自動賣出投資補現金（`auto_liquidate=True`）

---

## 檔案與入口

* **Request Model**：`models/SimulationReq.py`

  * `SimulationRequest`, `Scenario`, `Event`, `MarketModel`, `Expenses`
* **Service**：`services/simulation_service.py`

  * 入口函式：`simulate_financial_plan(request: SimulationRequest) -> Dict[str, Any]`

---

## 1) Request 模型：`SimulationRequest`

### `SimulationRequest`

| 欄位               | 型別             | 說明                          |
| ---------------- | -------------- | --------------------------- |
| `initial_assets` | float          | 初始總資產（必填，>=0）               |
| `income_monthly` | float          | 每月收入（>=0）                   |
| `expenses`       | List[Expenses] | 每月支出清單（依類別拆）                |
| `invest_ratio`   | float          | 投資比例 α（0~1），每月可支配金額中投入投資的比例 |
| `market_model`   | MarketModel    | 市場模型設定（固定/常態、風險 profile 等）  |
| `scenarios`      | List[Scenario] | 額外情境卡（Baseline 會自動加）        |
| `paths`          | int            | 蒙地卡羅路徑數（100~20000）          |
| `seed`           | Optional[int]  | 隨機種子（預設 12345）              |

### `Expenses`

* `category`: 支出類別名稱（例如 `food`, `rent`）
* `amount`: 該類別每月支出（>=0）

---

## 2) 市場模型：`MarketModel`

`mode` 決定報酬生成方式：

* `fixed`：固定年化報酬率（每月轉換後固定）
* `normal`：使用常態分佈抽樣（以 log-return 方式生成月報酬）

`profile` 提供快速預設：

* `custom`：使用自訂參數
* `low_risk` / `high_risk`：使用內建的 μ/σ 與上下限區間

> `fixed_annual_return` 支援兩種輸入：
>
> * `0.05` 表示 5%
> * `5` 表示 5%（前端用百分比時會自動 `/100`）

---

## 3) 情境卡：`Scenario`

每張情境卡可做三件事：

1. **支出比例調整** `expenses_delta`

   * 例如：`{"food": -0.07}` 表示外食支出降低 7%
   * 只會作用在「已存在」的支出類別

2. **投資比例調整** `invest_ratio_delta`

   * 例如：`+0.05` 表示投資比例提高 5%
   * 最終會 clamp 到 `[0, 1]`

3. **事件清單** `events`

   * 支援一次性支出、收入變動、投資比例變動、單月報酬覆蓋

系統會自動把 `Baseline` 也當成一個情境（不調整、不加事件），因此前端永遠至少會拿到一個 scenario 的結果。

---

## 4) 區間型事件：`Event`（支援期間）

事件有起始月與（可選）結束月：

* `month_idx`: 事件開始月（從 0 起算）
* `end_month_idx`: 事件結束月（可選）
* `type`：

  * `expense`：支出（扣現金）
  * `income_delta`：收入調整（百分比或加法）
  * `invest_ratio_delta`：投資比例調整（加法）
  * `market_override`：覆蓋該月報酬（輸入視為年化）

### 事件規則摘要

* `expense` / `market_override`：

  * 若有 `end_month_idx` → **區間內每月都會套用一次**

* `income_delta` / `invest_ratio_delta`：

  * 沒有 `end_month_idx` → **永久變動**
  * 有 `end_month_idx` → **暫時變動**，結束月的下一個月會自動加一個「revert 事件」恢復原值

### `income_delta` 的 delta 判斷

* `abs(delta) < 1.0` → 視為百分比（例如 `0.1` = +10%）
* 否則 → 視為金額加法（例如 `5000` = +5000/月）

---

## 5) 核心模擬流程（每條路徑、每個月）

模擬狀態包含：

* `cash`：現金
* `portfolio`：投資組合
* `alpha`：投資比例（可隨事件變動）
* `income`：收入（可隨事件變動）

每個月執行：

1. 計算可支配金額

   * `discretionary = max(income - base_expense, 0)`

2. 按投資比例分配

   * `invest_amount = alpha * discretionary`
   * `save_amount = (1-alpha) * discretionary`

3. 更新投資組合（套用月報酬）

   * `portfolio = (portfolio + invest_amount) * (1 + monthly_return)`

4. 更新現金

   * `cash += save_amount`

5. 套用事件（可能扣現金 / 改收入 / 改投資比例 / 覆蓋當月報酬）

6. 若現金不足，自動賣出投資補現金（`auto_liquidate=True`）

7. 總資產

   * `asset = cash + portfolio`

---

## 6) 回傳格式（給前端）

`simulate_financial_plan()` 回傳：

### `lineChart`

每個情境都會有：

* `median`（P50）
* `confidenceLower`（P05）
* `confidenceUpper`（P95）

```json
{
  "lineChart": {
    "categories": [1, 2, "...", 120],
    "scenarios": [
      {
        "name": "Baseline",
        "median": ["..."],
        "confidenceLower": ["..."],
        "confidenceUpper": ["..."]
      },
      {
        "name": "Scenario A",
        "median": ["..."],
        "confidenceLower": ["..."],
        "confidenceUpper": ["..."]
      }
    ]
  }
}
```

### `pieChart`

以 Baseline 的原始支出為主（顯示「絕對金額」＋固定顏色）：

```json
{
  "pieChart": {
    "expenses": [
      { "category": "food", "amount": 8000, "color": "#FBBF24" },
      { "category": "rent", "amount": 20000, "color": "#F87171" }
    ]
  }
}
```

### `statCards`

目前以 **Baseline** 的結果產生四張卡：

* 預期期末資產（P50）
* 實際年化報酬率（用 P50 與 `initial_assets` 算 CAGR）
* 每月儲蓄率
* 95% 最差情境資產（P05）

```json
{
  "statCards": [
    {
      "title": "預期期末資產 (P50)",
      "value": "$1,234,567",
      "subText": "對比 P75 估計：1,500,000",
      "diff": -265433,
      "trend": "down"
    }
  ]
}
```

---