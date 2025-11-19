import * as React from 'react';
import { Card, CardHeader, CardContent, Stack, Typography, Box, useTheme } from "@mui/material";

// 假設您已在 src/components/core/Chart.jsx 中定義了這個元件
import { Chart } from "../core/Chart"; 

// 1. 模擬每月支出和投資數據
const mockExpenseData = [
    { category: '住房', amount: 15000, color: 'info.main' },
    { category: '飲食', amount: 8000, color: 'warning.main' },
    { category: '交通', amount: 3000, color: 'error.main' },
    { category: '投資', amount: 12000, color: 'success.main' },
    { category: '娛樂', amount: 2000, color: 'secondary.main' },
];

// 總金額，用於計算百分比
const totalAmount = mockExpenseData.reduce((sum, item) => sum + item.amount, 0);

// 提取 ApexCharts 需要的 series 和 labels
const chartSeries = mockExpenseData.map(item => Math.round((item.amount / totalAmount) * 100)); // 轉換成百分比
const labels = mockExpenseData.map(item => item.category);

// 2. ApexCharts 選項 hook (模仿 traffic.tsx 的 useChartOptions)
function useExpenseChartOptions(theme) {
    const chartColors = mockExpenseData.map(item => theme.palette[item.color.split('.')[0]].main);

    return {
        chart: { background: 'transparent' },
        colors: chartColors,
        dataLabels: { enabled: false },
        labels: labels,
        legend: { show: false }, // 圖例放在底部文字區
        plotOptions: { pie: { expandOnClick: false, donut: { size: '70%' } } },
        states: { active: { filter: { type: 'none' } }, hover: { filter: { type: 'none' } } },
        stroke: { width: 0 },
        theme: { mode: theme.palette.mode },
        tooltip: { 
            fillSeriesColor: false,
            y: {
                formatter: (value) => `${value}%`, // 顯示百分比
            }
        },
    };
}

// 3. ExpensePieChart 主元件
export default function ExpensePieChart({ title = "每月支出與投資分佈", sx }) {
    const theme = useTheme();
    const chartOptions = useExpenseChartOptions(theme);

    return (
        <Card sx={{ ...sx, p: 0, height: "100%" }}>
            <CardHeader title={title} /> 
            
            <CardContent>
                <Stack spacing={2}>
                    <Box sx={{ height: 300, minHeight: 300 }}>
                        <Chart 
                            height={300} 
                            options={chartOptions} 
                            series={chartSeries} 
                            type="donut" // 圓環圖
                        />
                    </Box>

                    {/* 底部圖例和百分比 (模仿 traffic.tsx 的底部 Stack) */}
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                        {mockExpenseData.map((item, index) => {
                            const percentage = chartSeries[index];
                            
                            return (
                                <Stack key={item.category} spacing={1} sx={{ alignItems: 'center' }}>
                                    {/* 顏色標記 */}
                                    <Box
                                        sx={{ 
                                            width: 12, 
                                            height: 12, 
                                            borderRadius: '50%',
                                            bgcolor: theme.palette[item.color.split('.')[0]].main, 
                                        }}
                                    />
                                    {/* 類別名稱 */}
                                    <Typography variant="h6">{item.category}</Typography>
                                    {/* 百分比 */}
                                    <Typography color="text.secondary" variant="subtitle2">
                                        {percentage}%
                                    </Typography>
                                </Stack>
                            );
                        })}
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}