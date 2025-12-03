import * as React from 'react';
import { Card, CardContent, Typography, Box, Button, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// 新的輔助函式：計算調整項的摘要
const getDeltaSummary = (expensesDelta) => {
    if (!expensesDelta || Object.keys(expensesDelta).length === 0) {
        return "固定支出無調整";
    }
    const changes = Object.entries(expensesDelta).map(([key, value]) => {
        const sign = value >= 0 ? '+' : '';
        return `${key}: ${sign}${(value * 100).toFixed(1)}%`;
    });
    return `固定支出調整: ${changes.join(', ')}`;
};

export default function ScenarioCard({ scenario, selectedId, onSelect, onEdit }) {
    const isSelected = scenario.id === selectedId;

    // 提取情境調整數據
    const { 
        name, 
        description, 
        expenses_delta = {}, 
        invest_ratio_delta = 0, 
        events = [] 
    } = scenario;

    const deltaSummary = getDeltaSummary(expenses_delta);
    const investDelta = (invest_ratio_delta * 100).toFixed(1);
    const eventCount = events.length;

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
                        {name}
                    </Typography>
                    
                    {isSelected && (
                        <CheckCircleIcon color="primary" sx={{ ml: 1, position: 'absolute', top: 8, right: 8 }} />
                    )}
                </Box>

                <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                    {description || '無詳細描述。'}
                </Typography>

                {/* 顯示情境調整數據摘要 */}
                <Stack spacing={1} sx={{ fontSize: '0.9rem', mb: 2 }}>
                    <Typography variant="body2">
                        {deltaSummary}
                    </Typography>
                    <Typography variant="body2">
                        長期投資比例調整: {investDelta >= 0 ? '+' : ''}{investDelta}%
                    </Typography>
                    <Typography variant="body2">
                        設定事件數量: {eventCount} 個
                    </Typography>
                </Stack>


                <Button 
                    startIcon={<EditIcon />} 
                    size="small" 
                    variant="contained" 
                    color="secondary"
                    sx={{ mt: 1 }}
                    onClick={(e) => {
                        e.stopPropagation(); 
                        onEdit(scenario);
                    }}
                >
                    編輯情境調整
                </Button>
            </CardContent>
        </Card>
    );
}