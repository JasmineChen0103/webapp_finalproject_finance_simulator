import * as React from 'react';
import { Card, CardHeader, CardContent, Stack, Typography, Box, useTheme } from "@mui/material";
import { Chart } from "../core/Chart"; 

export default function ExpensePieChart({ title = "每月支出分佈", data, sx }) {
    const theme = useTheme();

    // 如果 API 資料還沒回來，使用空陣列預防出錯
    const expenses = data?.expenses || [];
    
    // 計算總金額
    const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

    // 將後端的 hex 顏色與金額轉換為 ApexCharts 需要的格式
    const chartSeries = expenses.map(item => Math.round((item.amount / totalAmount) * 100));
    const labels = expenses.map(item => item.category);
    const chartColors = expenses.map(item => item.color); // 使用後端傳來的顏色

    const chartOptions = {
        chart: { background: 'transparent' },
        colors: chartColors,
        labels: labels,
        legend: { show: false },
        plotOptions: { pie: { donut: { size: '70%' } } },
        theme: { mode: theme.palette.mode },
        tooltip: { y: { formatter: (value) => `${value}%` } },
    };

    return (
        <Card sx={{ ...sx, p: 0, height: "100%" }}>
            <CardHeader title={title} /> 
            <CardContent>
                <Box sx={{ height: 300 }}>
                    {expenses.length > 0 && (
                        <Chart options={chartOptions} series={chartSeries} type="donut" height={300} />
                    )}
                </Box>
                {/* 圖例部分直接映射後端的顏色 */}
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ flexWrap: 'wrap' }}>
                    {expenses.map((item, index) => (
                        <Stack key={item.category} alignItems="center">
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                            <Typography variant="caption">{item.category}</Typography>
                        </Stack>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
}