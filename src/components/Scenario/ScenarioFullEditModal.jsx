import * as React from 'react';
import {
    Modal, Box, Typography, TextField, Button, Stack, 
    Divider, IconButton, Alert, Grid, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import TimelineIcon from '@mui/icons-material/Timeline';
import PercentIcon from '@mui/icons-material/Percent';


// Modal 樣式：寬度自適應，並啟用垂直滾動
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', md: 900 },
    maxHeight: '90vh',
    overflowY: 'auto',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 1,
};

// 模擬的支出類別（應從基礎設定中獲得，此處為範例）
const EXPENSE_CATEGORIES = ["food", "rent", "transport", "entertainment", "misc"];
// 後端支援的事件類型
const EVENT_TYPES = [
    { value: "expense", label: "一次性/期間支出" },
    { value: "income_delta", label: "收入變動" },
    { value: "invest_ratio_delta", label: "投資比例變動" },
    { value: "market_override", label: "市場報酬覆寫" },
];

const defaultEvent = { month_idx: 1, type: "expense", label: "", amount: 0, delta: 0, end_month_idx: null };

// --- 子元件：長期支出調整 ---
function ExpenseDeltaSection({ data, onChange, onAdd, onDelete }) {
    const deltaKeys = Object.keys(data);
    
    // 處理新增支出類別
    const handleAdd = () => {
        const newKey = `custom_${deltaKeys.length + 1}`;
        // 傳入新的 Key-Value Pair
        onAdd(newKey, 0); 
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom mt={1} sx={{ display: 'flex', alignItems: 'center' }}>
                <PercentIcon sx={{ mr: 1 }} fontSize="small" /> 長期固定支出調整 (Expenses Delta)
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
                * 調整比例 (如 -0.1 = 減少 10%)，從第 1 個月起全程生效。
            </Typography>
            
            <Stack spacing={1}>
                {deltaKeys.map((key, idx) => (
                    <Stack direction="row" spacing={1} key={key} alignItems="center">
                        <TextField
                            select
                            size="small"
                            label="支出類別"
                            value={key}
                            onChange={(e) => onChange('expenses_delta', key, e.target.value, data[key])} // 舊key, 新key, 舊value
                            sx={{ minWidth: 120 }}
                        >
                            {EXPENSE_CATEGORIES.map(cat => (
                                <MenuItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</MenuItem>
                            ))}
                        </TextField>
                        
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="比例 (Delta)"
                            value={data[key]}
                            onChange={(e) => onChange('expenses_delta', key, key, Number(e.target.value))} // 舊key, 舊key, 新value
                            InputProps={{
                                endAdornment: <Typography sx={{ ml: 0.5 }}>%</Typography>
                            }}
                        />
                        <IconButton onClick={() => onDelete('expenses_delta', key)} color="error">
                            <DeleteIcon />
                        </IconButton>
                    </Stack>
                ))}
            </Stack>

            <Button onClick={handleAdd} variant="outlined" size="small" sx={{ mt: 2 }}>
                新增支出調整項目
            </Button>
        </Box>
    );
}

// --- 子元件：事件列表 ---
function EventListSection({ events, onChange, onAdd, onDelete }) {
    return (
        <Box>
            <Typography variant="h6" gutterBottom mt={1} sx={{ display: 'flex', alignItems: 'center' }}>
                <TimelineIcon sx={{ mr: 1 }} fontSize="small" /> 情境事件列表 (Events)
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
                * 設定在特定月份發生的單次性或期間性變動。
            </Typography>

            <Stack spacing={2}>
                {events.map((event, idx) => (
                    <Box key={idx} sx={{ border: '1px solid #eee', p: 2, borderRadius: 1 }}>
                        <Stack direction="row" spacing={1} justifyContent="space-between" mb={1}>
                            <Typography variant="subtitle2">事件 #{idx + 1}</Typography>
                            <IconButton onClick={() => onDelete(idx)} size="small" color="error">
                                <DeleteIcon />
                            </IconButton>
                        </Stack>
                        
                        <Grid container spacing={2}>
                            {/* 第一行：月份與類型 */}
                            <Grid item xs={6} md={3}>
                                <TextField 
                                    fullWidth size="small" type="number" 
                                    label="起始月 (month_idx)" name="month_idx" 
                                    value={event.month_idx} 
                                    onChange={(e) => onChange(idx, e.target.name, Number(e.target.value))}
                                />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <TextField 
                                    fullWidth size="small" type="number" 
                                    label="結束月 (可選)" name="end_month_idx" 
                                    value={event.end_month_idx || ''} 
                                    onChange={(e) => onChange(idx, e.target.name, Number(e.target.value) || null)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>事件類型 (type)</InputLabel>
                                    <Select
                                        fullWidth
                                        label="事件類型 (type)"
                                        name="type"
                                        value={event.type}
                                        onChange={(e) => onChange(idx, e.target.name, e.target.value)}
                                    >
                                        {EVENT_TYPES.map(type => (
                                            <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            {/* 第二行：標籤與數值 */}
                            <Grid item xs={12} md={4}>
                                <TextField 
                                    fullWidth size="small" label="標籤/備註 (label)" name="label" 
                                    value={event.label || ''} 
                                    onChange={(e) => onChange(idx, e.target.name, e.target.value)}
                                />
                            </Grid>

                            {/* 數值輸入區塊 */}
                            <Grid item xs={12} md={8}>
                                {['expense', 'market_override'].includes(event.type) && (
                                    <TextField 
                                        fullWidth size="small" type="number" 
                                        label={`${event.type === 'expense' ? '金額' : '年化報酬'} (amount)`} name="amount" 
                                        value={event.amount || ''} 
                                        onChange={(e) => onChange(idx, e.target.name, Number(e.target.value))}
                                    />
                                )}
                                {['income_delta', 'invest_ratio_delta'].includes(event.type) && (
                                    <TextField 
                                        fullWidth size="small" type="number" 
                                        label={`${event.type === 'income_delta' ? '收入' : '投資比例'} 變動 (delta)`} name="delta" 
                                        value={event.delta || ''} 
                                        onChange={(e) => onChange(idx, e.target.name, Number(e.target.value))}
                                    />
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                ))}
            </Stack>

            {/* 修正：點擊時呼叫傳入的 onAdd 函式，而不是自己定義的 handleAddEvent */}
            <Button startIcon={<AddIcon />} onClick={onAdd} variant="contained" size="small" sx={{ mt: 3 }}>
                新增事件
            </Button>
        </Box>
    );
}


// --- 主要元件：情境全功能編輯彈窗 ---
export default function ScenarioFullEditModal({ open, onClose, scenario, onSave }) {
    
    // 初始情境數據 (使用 name, expenses_delta, invest_ratio_delta, events)
    const [editedScenario, setEditedScenario] = React.useState(scenario ? JSON.parse(JSON.stringify(scenario)) : null);
    const [error, setError] = React.useState("");
    
    const [scenarioName, setScenarioName] = React.useState(scenario?.name || "自訂情境");

    React.useEffect(() => {
        if (scenario) {
            setEditedScenario(JSON.parse(JSON.stringify(scenario)));
            setScenarioName(scenario.name);
            setError("");
        }
    }, [scenario]);

    // 處理基本資訊變更 (名稱/描述)
    const handleBasicChange = (e) => {
        const { name, value } = e.target;
        setEditedScenario(prev => ({ ...prev, [name]: value }));
    };


    // --- 1. 長期支出調整 (expenses_delta) 處理 ---
    const handleExpensesDeltaChange = (arrayName, oldKey, newKey, value) => {
        const newDelta = { ...editedScenario.expenses_delta };

        // 處理 Key 變更 (例如從 custom_1 換到 food)
        if (oldKey !== newKey) {
            newDelta[newKey] = newDelta[oldKey];
            delete newDelta[oldKey];
        } else {
            // 處理 Value 變更
            newDelta[newKey] = value;
        }

        setEditedScenario(prev => ({ ...prev, [arrayName]: newDelta }));
    };
    
    // 處理新增支出調整
    const handleAddExpensesDelta = (key, value) => {
        const newDelta = { ...editedScenario.expenses_delta, [key]: value };
        setEditedScenario(prev => ({ ...prev, expenses_delta: newDelta }));
    };

    // 處理刪除支出調整
    const handleDeleteExpensesDelta = (arrayName, key) => {
        const newDelta = { ...editedScenario.expenses_delta };
        delete newDelta[key];
        setEditedScenario(prev => ({ ...prev, [arrayName]: newDelta }));
    };


    // --- 3. 事件列表 (events) 處理 ---
    const handleEventChange = (index, key, value) => {
        const newEvents = [...editedScenario.events];
        newEvents[index][key] = value;
        setEditedScenario(prev => ({ ...prev, events: newEvents }));
    };
    
    // 修正：確保建立一個新的陣列實例，並將新的事件物件加入
    const handleAddEvent = () => {
        setEditedScenario(prev => ({ 
            ...prev, 
            events: [...(prev.events || []), { ...defaultEvent }] 
        }));
    };
    
    const handleDeleteEvent = (index) => {
        const newEvents = editedScenario.events.filter((_, i) => i !== index);
        setEditedScenario(prev => ({ ...prev, events: newEvents }));
    };


    // 處理儲存
    const handleSave = () => {
        if (!scenarioName.trim()) {
            setError("情境名稱不可為空！");
            return;
        }

        setError("");
        onSave({ 
            ...editedScenario, 
            name: scenarioName.trim(),
            description: editedScenario.description || ""
        });
        onClose();
    };


    if (!editedScenario) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
        >
            <Box sx={style}>
                <Typography variant="h5" component="h2" mb={1}>
                    編輯情境調整：{scenarioName}
                </Typography>
                <Typography color="text.secondary" mb={3}>
                    設定在基礎財務計畫上疊加的長期調整或一次性事件。
                </Typography>
                
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Grid container spacing={4}>
                    {/* 全寬布局：基礎名稱/描述 與 長期調整 與 事件列表 */}
                    <Grid item xs={12}>
                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                label="情境名稱"
                                name="name"
                                value={scenarioName}
                                onChange={(e) => setScenarioName(e.target.value)}
                                size="small"
                                required
                            />
                            <TextField
                                fullWidth
                                label="描述"
                                name="description"
                                value={editedScenario.description || ''}
                                onChange={handleBasicChange}
                                size="small"
                                multiline
                                rows={2}
                            />
                            <Divider sx={{ my: 2 }} />

                            {/* 2. 長期投資比例調整 */}
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                                <PercentIcon sx={{ mr: 1 }} fontSize="small" /> 長期投資比例調整
                            </Typography>
                            <TextField
                                fullWidth
                                type="number"
                                label="投資比例變動 (Invest Ratio Delta)"
                                name="invest_ratio_delta"
                                value={editedScenario.invest_ratio_delta}
                                onChange={handleBasicChange}
                                size="small"
                                InputProps={{
                                    endAdornment: <Typography sx={{ ml: 0.5 }}> (%)</Typography>
                                }}
                                helperText="將疊加到您的基礎投資比例上 (結果會被限制在 0% 到 100%)"
                            />
                            
                            <Divider sx={{ my: 2 }} />

                            {/* 1. 長期支出調整 */}
                            <ExpenseDeltaSection 
                                data={editedScenario.expenses_delta || {}}
                                onChange={handleExpensesDeltaChange}
                                onAdd={handleAddExpensesDelta}
                                onDelete={handleDeleteExpensesDelta}
                            />

                            <Divider sx={{ my: 2 }} />

                            {/* 情境事件列表 - 移至下方 */}
                            <EventListSection 
                                events={editedScenario.events || []}
                                onAdd={handleAddEvent}
                                onChange={handleEventChange}
                                onDelete={handleDeleteEvent}
                            />
                        </Stack>
                    </Grid>
                </Grid>

                {/* Footer and Buttons */}
                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 5 }}>
                    <Button onClick={onClose} color="inherit" variant="outlined">
                        取消
                    </Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        儲存並更新情境
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
}