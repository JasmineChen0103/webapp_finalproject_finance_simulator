import * as React from 'react';
import { Card, CardHeader, useTheme, Box } from "@mui/material";
import { Chart } from "../core/Chart"; 

export default function AssetLineChart({ title = "資產走勢預測", subheader = "根據模擬結果預估資產增長", data, sx }) {
    const theme = useTheme();

    // 從傳入的 data 中解構後端產生的欄位
    const { 
        categories = [], 
        currentPlan = [], 
        projectedAsset = [] 
    } = data || {};

    // 定義圖表系列數據
    const chartSeries = [
        {
            name: "預期目標走勢",
            data: projectedAsset, // 來自後端的 projectedAsset
        },
        {
            name: "目前計畫走勢",
            data: currentPlan, // 來自後端的 currentPlan
        },
    ];

    // 配置圖表選項
    const chartOptions = {
        chart: {
            background: 'transparent',
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        colors: [theme.palette.primary.main, theme.palette.success.main],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        xaxis: {
            categories: categories, // 使用後端生成的月份列表
            labels: { style: { colors: theme.palette.text.secondary } },
        },
        yaxis: {
            labels: {
                formatter: (value) => `$${(value / 1000).toFixed(0)}K`,
                style: { colors: theme.palette.text.secondary },
            },
        },
        tooltip: { 
            y: { formatter: (value) => `$${value.toLocaleString()}` } 
        },
        legend: { position: 'top', horizontalAlign: 'right' }
    };

    return (
        <Card sx={{ ...sx, p: 0 }}>
            <CardHeader title={title} subheader={subheader} />
            <Box sx={{ p: 2, height: 364 }}>
                {categories.length > 0 ? (
                    <Chart type="line" series={chartSeries} options={chartOptions} height="100%" />
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        數據載入中...
                    </Box>
                )}
            </Box>
        </Card>
    );
}