import * as React from 'react';
import { Card, CardHeader, CardContent, Box, useTheme, Alert, CircularProgress } from "@mui/material";
import { Chart } from "../core/Chart"; 

export default function AssetLineChart({ title = "資產增長趨勢", data, sx, isLoading }) {
    const theme = useTheme();

    // 讀取狀態
    if (isLoading) {
        return (
            <Card sx={{ ...sx, p: 0, height: "100%" }}>
                <CardHeader title={title} />
                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <CircularProgress />
                </CardContent>
            </Card>
        );
    }

    // 檢查資料有效性
    if (!data || !data.categories || !data.scenarios || data.scenarios.length === 0) {
        return (
            <Card sx={{ ...sx, p: 0, height: "100%" }}>
                <CardHeader title={title} />
                <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="center" height={300}>
                        <Alert severity="info">等待數據中...</Alert>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    // 重點：因為 Dashboard 已經篩選過，這裡我們總是取陣列的第一筆
    const targetScenario = data.scenarios[0];
    
    // 防呆
    if (!targetScenario) return null;

    const months = data.categories || [];
    const median = targetScenario.median || [];
    const confidenceUpper = targetScenario.confidenceUpper || [];
    const confidenceLower = targetScenario.confidenceLower || [];

    const chartOptions = {
        chart: { background: 'transparent', toolbar: { show: false } },
        stroke: { 
            curve: 'smooth',
            width: [3, 1, 1] 
        },
        xaxis: { 
            categories: months,
            title: { text: '月份' },
            tickAmount: 12
        },
        theme: { mode: theme.palette.mode },
        yaxis: { 
            title: { text: '資產 (元)' },
            labels: {
                formatter: (value) => {
                    if (value >= 100000000) return (value / 100000000).toFixed(1) + "億";
                    if (value >= 10000) return (value / 10000).toFixed(0) + "萬";
                    return value;
                }
            }
        },
        fill: {
            type: 'solid',
            opacity: [1, 0.2, 0.2] 
        },
        colors: ['#2E93fA', '#66DA26', '#E91E63'], 
        legend: {
            position: 'top',
            horizontalAlign: 'right'
        },
        tooltip: {
            shared: true,
            intersect: false,
            y: {
                formatter: function (y) {
                    if(typeof y !== "undefined") return y.toFixed(0) + " 元";
                    return y;
                }
            }
        }
    };

    const chartSeries = [
        { name: '中位數 (P50)', data: median, type: 'line' },
        { name: '信賴上界 (P95)', data: confidenceUpper, type: 'line' },
        { name: '信賴下界 (P05)', data: confidenceLower, type: 'line' }
    ];

    return (
        <Card sx={{ ...sx, p: 0, height: "100%" , width: "550px"}}>
            {/* 這裡顯示情境名稱做為副標題，確認我們看的是對的圖 */}
            <CardHeader title={title} subheader={targetScenario.name} /> 
            <CardContent>
                <Box sx={{ height: 300 }}>
                    <Chart options={chartOptions} series={chartSeries} type="line" height={300} />
                </Box>
            </CardContent>
        </Card>
    );
}