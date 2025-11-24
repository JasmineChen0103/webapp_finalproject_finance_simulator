import * as React from 'react';
import {
    Modal, Box, Typography, TextField, Button, Stack,
    Divider, IconButton, Alert, Grid
} from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import MenuItem from "@mui/material/MenuItem";

// Modal 樣式：寬度自適應，並啟用垂直滾動
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', md: 800 },
    maxHeight: '90vh',
    overflowY: 'auto',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 1,
};

const defaultExpense = { category: "", amount: "" };
const defaultInvestment = { type: "", amount: "" };
const INVESTMENT_TYPES = ["stocks", "etf", "crypto", "fund"];

// --- 子元件：支出編輯區 ---
function ExpenseSection({ data, monthlyIncome, onChange, onAdd, onDelete }) {
    const totalExpenses = data.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const isExceedingIncome = totalExpenses > Number(monthlyIncome);

    return (
        <Box>
            <Typography variant="h6" gutterBottom mt={3}>每月支出 (Step 2)</Typography>
            {isExceedingIncome && (
                <Alert severity="warning" sx={{ mb: 1 }}>總支出超過月收入！</Alert>
            )}

            {data.map((row, idx) => (
                <Stack direction="row" spacing={1} key={idx} sx={{ mb: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        label="類別 (Category)"
                        value={row.category}
                        onChange={(e) => onChange(idx, 'expenses', 'category', e.target.value)}
                    />
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="金額 (Amount)"
                        value={row.amount}
                        onChange={(e) => onChange(idx, 'expenses', 'amount', e.target.value)}
                    />
                    <IconButton onClick={() => onDelete(idx, 'expenses')} color="error">
                        <DeleteIcon />
                    </IconButton>
                </Stack>
            ))}
            <Button startIcon={<AddIcon />} onClick={onAdd('expenses')} variant="outlined" size="small" sx={{ mt: 1 }}>
                新增支出
            </Button>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>總支出: {totalExpenses.toLocaleString()}</Typography>
        </Box>
    );
}

// --- 子元件：投資編輯區 ---
function InvestmentSection({ data, onChange, onAdd, onDelete }) {
    const totalInvest = data.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    return (
        <Box>
            <Typography variant="h6" gutterBottom mt={3}>每月投資 (Step 3)</Typography>
            {data.map((row, idx) => (
                <Stack direction="row" spacing={1} key={idx} sx={{ mb: 1 }}>
                    <TextField
                        select
                        size="small"
                        label="投資類型"
                        fullWidth
                        value={row.type}
                        onChange={(e) => onChange(idx, 'investments', 'type', e.target.value)}
                    >
                        {INVESTMENT_TYPES.map(type => (
                            <MenuItem key={type} value={type}>{type.toUpperCase()}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        type="number"
                        size="small"
                        label="金額 (Amount)"
                        fullWidth
                        value={row.amount}
                        onChange={(e) => onChange(idx, 'investments', 'amount', e.target.value)}
                    />
                </Stack>
            ))}
            
            <Typography variant="subtitle1" sx={{ mt: 2 }}>總投資: {totalInvest.toLocaleString()}</Typography>
        </Box>
    );
}


// --- 主要元件：全功能編輯彈窗 ---
export default function ScenarioFullEditModal({ open, onClose, scenario, onSave }) {
    // 初始載入編輯中的情境，並在外部情境變更時同步 (深拷貝以隔離 Modal 內外部狀態)
    const [editedScenario, setEditedScenario] = React.useState(scenario ? JSON.parse(JSON.stringify(scenario)) : null);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        if (scenario) {
            setEditedScenario(JSON.parse(JSON.stringify(scenario)));
            setError("");
        }
    }, [scenario]);

    // 處理基本資訊變更 (Step 1)
    const handleBasicChange = (e) => {
        const { name, value } = e.target;
        setEditedScenario(prev => ({ ...prev, [name]: value }));
    };

    // 處理陣列 (Expenses/Investments) 內部單行變更
    const handleArrayChange = (index, arrayName, key, value) => {
        const newArray = [...editedScenario[arrayName]];
        newArray[index][key] = value;
        setEditedScenario(prev => ({ ...prev, [arrayName]: newArray }));
    };

    // 處理新增一行
    const handleAddRow = (arrayName) => () => {
        const newRow = arrayName === 'expenses' ? { ...defaultExpense } : { ...defaultInvestment };
        setEditedScenario(prev => ({
            ...prev,
            [arrayName]: [...prev[arrayName], newRow]
        }));
    };

    // 處理刪除一行
    const handleDeleteRow = (index, arrayName) => {
        const newArray = editedScenario[arrayName].filter((_, i) => i !== index);
        setEditedScenario(prev => ({ ...prev, [arrayName]: newArray }));
    };

    // 處理儲存並驗證
    const handleSave = () => {
        const totalExpenses = editedScenario.expenses.reduce((sum, r) => sum + Number(r.amount || 0), 0);
        const monthlyIncome = Number(editedScenario.monthlyIncome || 0);

        // 驗證: 支出不能超過收入
        if (totalExpenses > monthlyIncome) {
            setError("儲存失敗：總支出不可超過每月收入！");
            return;
        }

        setError("");
        onSave(editedScenario);
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
                    編輯情境設定：{editedScenario.title}
                </Typography>
                <Typography color="text.secondary" mb={3}>
                    修改資產、收入、支出和投資分配
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Grid container spacing={3}>
                    {/* Basic Info (Step 1) - 左側 */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>基本資訊 (Step 1)</Typography>
                        <TextField
                            fullWidth
                            label="情境名稱"
                            name="title"
                            value={editedScenario.title}
                            onChange={handleBasicChange}
                            margin="normal"
                            size="small"
                        />
                        <TextField
                            fullWidth
                            label="總資產 (Total Asset)"
                            type="number"
                            name="totalAsset"
                            value={editedScenario.totalAsset}
                            onChange={handleBasicChange}
                            margin="normal"
                            size="small"
                        />
                        <TextField
                            fullWidth
                            label="每月收入 (Monthly Income)"
                            type="number"
                            name="monthlyIncome"
                            value={editedScenario.monthlyIncome}
                            onChange={handleBasicChange}
                            margin="normal"
                            size="small"
                        />

                        <Divider sx={{ my: 3 }} />
                        <ExpenseSection
                            data={editedScenario.expenses}
                            monthlyIncome={editedScenario.monthlyIncome}
                            onChange={handleArrayChange}
                            onAdd={handleAddRow}
                            onDelete={handleDeleteRow}
                        />

                    </Grid>
                    {/* Investment Info (Step 3) - 右側 */}
                    <Grid item xs={12} md={6}>
                        <InvestmentSection
                            data={editedScenario.investments}
                            onChange={handleArrayChange}
                            onAdd={handleAddRow}
                            onDelete={handleDeleteRow}
                        />
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