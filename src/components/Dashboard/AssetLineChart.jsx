import * as React from 'react';
import { Card, CardHeader, CardContent, Stack, Typography, Box, useTheme, Alert } from "@mui/material";
import { Chart } from "../core/Chart"; 

export default function AssetLineChart({ title = "資產增長趨勢", data, sx }) {
    const theme = useTheme();

    // 檢查數據是否存在
    if (!data || !data.categories || !data.scenarios || data.scenarios.length === 0) {
        return (
            <Card sx={{ ...sx, p: 0, height: "100%" }}>
                <CardHeader title={title} />
                <CardContent>
                    <Alert severity="info">等待模擬數據中...</Alert>
                </CardContent>
            </Card>
        );
    }

    // 提取後端返回的數據
    const months = data.categories || [];
    const median = data.scenarios[0].median || [];
    const confidenceUpper = data.scenarios[0].confidenceUpper || [];
    const confidenceLower = data.scenarios[0].confidenceLower || [];

    const chartOptions = {
        chart: { background: 'transparent' },
        stroke: { 
            curve: 'smooth',
            width: [3, 1, 1]  // 中位數線較粗，信賴區間線較細
        },
        xaxis: { 
            categories: months,
            title: { text: '月份' }
        },
        theme: { mode: theme.palette.mode },
        yaxis: { title: { text: '資產 (元)' } },
        fill: {
            type: 'solid',
            opacity: [1, 0.1, 0.1]  // 中位數不透明，信賴區間半透明
        },
        colors: ['#2E93fA', '#66DA26', '#E91E63'],  // 藍、綠、粉
        legend: {
            position: 'top',
            horizontalAlign: 'right'
        }
    };

    const chartSeries = [
        { name: '中位數 (P50)', data: median, type: 'line' },
        { name: '信賴上界 (P95)', data: confidenceUpper, type: 'line' },
        { name: '信賴下界 (P05)', data: confidenceLower, type: 'line' }
    ];

    return (
        <Card sx={{ ...sx, p: 0, height: "100%" }}>
            <CardHeader title={title} />
            <CardContent>
                <Box sx={{ height: 300 }}>
                    {median.length > 0 ? (
                        <Chart options={chartOptions} series={chartSeries} type="line" height={300} />
                    ) : (
                        <Alert severity="warning">無可用的資產數據</Alert>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}