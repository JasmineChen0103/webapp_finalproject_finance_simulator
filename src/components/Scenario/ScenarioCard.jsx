import * as React from 'react';
import { Card, CardContent, Typography, Box, Button, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// 輔助函式：計算總金額
const calculateTotal = (arr) => arr.reduce((sum, r) => sum + Number(r.amount || 0), 0);

export default function ScenarioCard({ scenario, selectedId, onSelect, onEdit }) {
    const isSelected = scenario.id === selectedId;

    // 計算顯示所需的值
    const totalExpenseAmount = calculateTotal(scenario.expenses);
    const totalInvestAmount = calculateTotal(scenario.investments);
    const monthlyIncome = Number(scenario.monthlyIncome);
    const remainingIncome = monthlyIncome - totalExpenseAmount;

    return (
        <Card
            variant="outlined"
            onClick={() => onSelect(scenario.id)}
            sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                minWidth: 275,
                height: '100%',
                borderColor: isSelected ? 'primary.main' : 'grey.300',
                boxShadow: isSelected ? 4 : 1,
                position: 'relative',
                '&:hover': {
                    borderColor: 'primary.light',
                    boxShadow: 3,
                },
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div">
                        {scenario.title}
                    </Typography>
                    
                    {isSelected && (
                        <CheckCircleIcon color="primary" sx={{ ml: 1 }} />
                    )}
                </Box>

                <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                    {scenario.description}
                </Typography>

                {/* 顯示 Onboarding 數據摘要 */}
                <Stack spacing={1} sx={{ fontSize: '0.9rem' }}>
                    <Typography variant="body2" fontWeight="bold">
                        淨資產: ${Number(scenario.totalAsset).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                        月收入: ${monthlyIncome.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="error.main">
                        月支出: - ${totalExpenseAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="success.main">
                        月投資: ${totalInvestAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                        剩餘現金: ${remainingIncome.toLocaleString()}
                    </Typography>
                </Stack>


                <Button 
                    startIcon={<EditIcon />} 
                    size="small" 
                    variant="contained" 
                    color="secondary"
                    sx={{ mt: 2 }}
                    // 阻止點擊編輯按鈕時觸發卡片選擇事件
                    onClick={(e) => {
                        e.stopPropagation(); 
                        onEdit(scenario);
                    }}
                >
                    編輯情境設定
                </Button>
            </CardContent>
        </Card>
    );
}