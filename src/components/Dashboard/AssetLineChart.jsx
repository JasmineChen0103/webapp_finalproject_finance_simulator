import * as React from 'react';
import { Card, CardHeader, CardContent, Stack, Typography, Box, useTheme, Alert } from "@mui/material";
import { Chart } from "../core/Chart"; 

export default function AssetLineChart({ title = "資產增長趨勢", data, sx }) {
    const theme = useTheme();

    // 檢查數據是否存在
    if (!data || !data.categories || !data.currentPlan) {
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
    const assets = data.currentPlan || [];

    const chartOptions = {
        chart: { background: 'transparent' },
        stroke: { curve: 'smooth' },
        xaxis: { categories: months },
        theme: { mode: theme.palette.mode },
        yaxis: { title: { text: '資產 (元)' } },
    };

    const chartSeries = [
        { name: '總資產', data: assets }
    ];

    return (
        <Card sx={{ ...sx, p: 0, height: "100%" }}>
            <CardHeader title={title} />
            <CardContent>
                <Box sx={{ height: 300 }}>
                    {assets.length > 0 ? (
                        <Chart options={chartOptions} series={chartSeries} type="line" height={300} />
                    ) : (
                        <Alert severity="warning">無可用的資產數據</Alert>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}