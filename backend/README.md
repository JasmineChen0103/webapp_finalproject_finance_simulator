# 📈 理財模擬系統後端 API 說明

本後端提供主要 API：**`POST /simulate`**，用於執行個人生涯理財的 Monte Carlo 模擬。前端可透過「全局設定 + 多張情境卡」一次比較不同財務情境並視覺化其資產變化。

---

# 🧩 整體架構概述

模擬由兩部分組成：

1. **全局設定（Global Settings）**：使用者當前的收入、支出、投資比例、市場模型等。
2. **情境卡（Scenarios）**：用來描述「如果某些條件改變，未來會怎樣？」可設定長期調整與時間軸事件。

後端將回傳以下資訊：

* 每個情境的資產走勢（median / p05 / p95）
* 期末資產箱型圖（分佈）
* 基礎支出 Pie（baseline）
* Summary（期末資產中位數 / 實際年化報酬率）

---

# 🚀 API：POST `/simulate`

此 API 接收 `SimulationRequest`，包含：

* 全局模擬設定
* 多張情境卡（scenarios）

後端會自動加入一張 **Baseline 情境卡**

---

# 📥 SimulationRequest 結構

```json
{
  "months": 36,
  "income_monthly": 60000,
  "expenses": {
    "food": 10000,
    "rent": 20000,
    "transport": 3000,
    "entertainment": 5000,
    "misc": 2000
  },
  "invest_ratio": 0.2,
  "market_model": { ... },
  "scenarios": [ ... ],
  "paths": 1000,
  "seed": 12345
}
```

## 全局設定欄位

| 欄位               | 說明                                                     |
| ---------------- | ------------------------------------------------------ |
| `months`         | 模擬月數（1–600）                                            |
| `income_monthly` | 每月收入                                                   |
| `expenses`       | 每月固定支出（food / rent / transport / entertainment） |
| `invest_ratio`   | 基礎投資比例（0~1）                                            |
| `market_model`   | 市場模型設定                                                 |

---

# 🧩 情境卡（Scenario）可調整項目

情境卡用來表達「如果做某些改變，未來會怎樣？」可調整三大項目：

---

## 1️⃣ 長期支出調整：`expenses_delta`

用比例調整固定支出，例如：

```json
"expenses_delta": {
  "food": -0.1,
  "rent": 0.05
}
```

* `-0.1` → 減少 10%
* `0.05` → 增加 5%
* 調整後支出會從第 1 個月起全程生效。

---

## 2️⃣ 長期投資比例調整：`invest_ratio_delta`

在基礎投資比例上加減：

```json
"invest_ratio_delta": 0.1
```

例如：

* baseline = 0.2
* delta = 0.1
  → 效果投資比例 = **0.3**（會 clamp 到 0~1）

---

## 3️⃣ 事件列表（`events`）：時間軸上的變化

事件可描述某個月份（或期間）資金流或設定變化，例如：

```json
{
  "month_idx": 5,
  "end_month_idx": 8,
  "type": "expense",
  "label": "日本旅遊",
  "amount": 30000
}
```

### 支援事件類型：

| type                   | 功能                 |
| ---------------------- | ------------------ |
| **expense**            | 一次性或期間額外支出         |
| **income_delta**       | 收入變動（比例或金額，可永久或期間） |
| **invest_ratio_delta** | 投資比例變動（永久或期間）      |
| **market_override**    | 覆寫某月市場報酬率          |

---

# 🔁 Baseline（後端自動加入）

後端會自動加入：

```json
{ "name": "Baseline" }
```

Baseline 使用全局設定：收入、支出、投資比例、市場模型，不含任何事件。

---

# 🔄 模擬流程

對每張情境卡，後端會：

1. 套用長期設定（`expenses_delta` / `invest_ratio_delta`）
2. 解析並展開事件（期間事件會加入恢復反向事件）
3. 逐月執行 Monte Carlo：收入 → 支出 → 投資 → 市場報酬 → 資產更新
4. 輸出：資產走勢、期末箱型圖、年度報酬率、儲蓄率等統計

---

# 📤 Response 格式

```json
{
  "series": [...],
  "final_box": [...],
  "pie_expenses": {...},
  "summaries": [...],
  "used_seed": 12345
}
```

### 回傳內容說明：

* `series`：各情境的資產走勢（median/p05/p95）
* `final_box`：期末資產箱型圖統計
* `pie_expenses`：基礎支出比例（baseline）
* `summaries`：期末中位資產與實際年化報酬率（CAGR）
* `used_seed`：使用的隨機種子