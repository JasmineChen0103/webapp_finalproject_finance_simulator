## LineChart 元件 - 所需欄位說明

### 必需欄位

#### mockData（數據數組）
```javascript
const mockData = Array.from({ length: 11 }, (_, i) => ({
  year: i,                              // X 軸標籤
  projectedAsset: 1000000 * 1.12 ** i,  // 投影資產值（第一條線）
  currentPlan: 1000000 * 1.08 ** i,     // 目前計畫資產值（第二條線）
}));
```

### chartOptions 配置中的關鍵欄位

| 欄位 | 說明 | 範例 |
|------|------|------|
| `categories` | X 軸標籤 | `['0', '1', '2', ...]` |
| `chartColors` | 線條顏色陣列 | `['#1976d2', '#00b341']` |
| `stroke.width` | 線條寬度 | `3` |
| `stroke.curve` | 曲線類型 | `'smooth'` |
| `yaxis.formatter` | Y 軸值格式化函式 | `(value) => '$' + value` |
| `tooltip.formatter` | 提示框值格式化函式 | `(value) => '$' + value.toLocaleString()` |

### chartSeries 格式

```javascript
const chartSeries = [
  {
    name: "線條名稱 1",
    data: [數值1, 數值2, ...]  // 對應 categories 長度
  },
  {
    name: "線條名稱 2",
    data: [數值1, 數值2, ...]
  }
];
```

### 快速說明

您需要提供：
- ✅ **年份數據**（用於 X 軸）
- ✅ **對應的數值陣列**（每條線的數據點）
- ✅ **線條名稱**（圖例顯示）

---

## PieChart 元件 - 所需欄位說明

### 必需欄位

#### mockExpenseData（數據數組）
```javascript
const mockExpenseData = [
    { 
        category: '住房',           // 類別名稱
        amount: 15000,              // 金額
        color: 'info.main'          // 顏色（MUI 主題色彩）
    },
    { 
        category: '飲食', 
        amount: 8000, 
        color: 'warning.main' 
    },
    // ... 更多項目
];
```

### 欄位定義

| 欄位 | 類型 | 說明 | 範例 |
|------|------|------|------|
| `category` | string | 支出/投資類別名稱 | '住房', '飲食', '交通' |
| `amount` | number | 金額（數值） | 15000 |
| `color` | string | MUI 調色板顏色路徑 | 'info.main', 'success.main', 'error.main' |

### 可用顏色值

```
'primary.main'      // 主色
'secondary.main'    // 次色
'success.main'      // 成功綠色
'warning.main'      // 警告橙色
'error.main'        // 錯誤紅色
'info.main'         // 資訊藍色
```

### 計算過程

1. **計算總金額**
   ```javascript
   const totalAmount = mockExpenseData.reduce((sum, item) => sum + item.amount, 0);
   ```

2. **轉換為百分比**
   ```javascript
   const chartSeries = mockExpenseData.map(item => 
       Math.round((item.amount / totalAmount) * 100)
   );
   ```

3. **提取類別標籤**
   ```javascript
   const labels = mockExpenseData.map(item => item.category);
   ```

### 快速說明

後端需要提供：
- ✅ **類別名稱** (`category`)
- ✅ **金額** (`amount`) - 將自動計算百分比
- ✅ **顏色** (`color`) - 使用 MUI 主題色彩

### 範例數據格式

```javascript
{
  "expenses": [
    { "category": "住房", "amount": 15000, "color": "info.main" },
    { "category": "飲食", "amount": 8000, "color": "warning.main" },
    { "category": "交通", "amount": 3000, "color": "error.main" },
    { "category": "投資", "amount": 12000, "color": "success.main" },
    { "category": "娛樂", "amount": 2000, "color": "secondary.main" }



```}  ]  ]
}
```

---

## StatCard 元件 - 所需欄位說明

### 必需欄位

#### mockStats（數據數組）
```javascript
const mockStats = [
    {
        title: "目前淨資產",              // 卡片標題
        value: "$1,500K",                 // 主要顯示數值
        Icon: AttachMoneyIcon,            // MUI Icon 元件
        iconBgColor: "success.main",      // 圖示背景色
        subText: "自去年以來成長",        // 附註文字
        diff: 5,                          // 差異百分比
        trend: 'up',                      // 趨勢類型
    },
    // ... 更多卡片
];
```

### 欄位定義

| 欄位 | 類型 | 說明 | 範例 |
|------|------|------|------|
| `title` | string | 卡片標題 | '目前淨資產', '每月投資金額' |
| `value` | string | 主要顯示數值 | '$1,500K', '8.5%', '15.5 年' |
| `Icon` | React Component | MUI Icon 元件 | `AttachMoneyIcon`, `TrendingUpIcon` |
| `iconBgColor` | string | 圖示背景色（MUI 調色板） | 'success.main', 'primary.main' |
| `subText` | string | 附註說明文字 | '自去年以來成長', '固定投資' |
| `diff` | number \| undefined | 變化百分比 | 5, -2, undefined |
| `trend` | string | 趨勢類型 | 'up', 'down', 'none' |

### 可用的趨勢類型 (trend)

| 值 | 說明 | 圖示 | 顏色 |
|------|------|------|------|
| `'up'` | 上升趨勢 | ⬆️ ArrowUpwardIcon | 綠色 (success.main) |
| `'down'` | 下降趨勢 | ⬇️ ArrowDownwardIcon | 紅色 (error.main) |
| `'none'` | 無趨勢 | 無 | 灰色 (text.secondary) |

### 可用的圖示背景色 (iconBgColor)

```
'primary.main'      // 主色藍色
'secondary.main'    // 次色紫色
'success.main'      // 成功綠色
'warning.main'      // 警告橙色
'error.main'        // 錯誤紅色
'info.main'         // 資訊淺藍色
```

### 可用的 MUI Icon 元件

```javascript
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalculateIcon from "@mui/icons-material/Calculate";
import StarIcon from "@mui/icons-material/Star";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
// ... 更多 MUI Icons
```

### 顯示邏輯

1. **若 `diff !== undefined` 且 `trend !== 'none'`**
   - 顯示趨勢圖示 + diff% + subText

2. **若 `diff === undefined` 或 `trend === 'none'`**
   - 僅顯示 subText

### 快速說明

後端需要提供：
- ✅ **標題** (`title`)
- ✅ **數值** (`value`) - 已格式化的字串
- ✅ **附註** (`subText`)
- ⚠️ **差異** (`diff`) - 可選，若無則傳 `undefined`
- ⚠️ **趨勢** (`trend`) - 可選，預設 `'none'`

### 範例數據格式

```javascript
{
  "stats": [
    {
      "title": "目前淨資產",
      "value": "$1,500K",
      "iconBgColor": "success.main",
      "subText": "自去年以來成長",
      "diff": 5,
      "trend": "up"
    },
    {
      "title": "每月投資金額",
      "value": "$5,000",
      "iconBgColor": "warning.main",
      "subText": "固定投資",
      "diff": null,
      "trend": "none"
    }
  ]
}
```

### 前端元件位置
```
src/components/Dashboard/StatCards.jsx
```
