import * as React from 'react';
import {
    Card,
    CardHeader,
    useTheme,
} from "@mui/material";

import { Chart } from "../core/Chart"; 

// 1. 模擬的資產走勢數據 (10 年)
const mockData = Array.from({ length: 11 }, (_, i) => ({
    year: i,
    projectedAsset: Math.floor(1000000 * Math.pow(1.12, i) / 1000) * 1000,
    currentPlan: Math.floor(1000000 * Math.pow(1.08, i) / 1000) * 1000,
}));

// 2. ApexCharts 選項 hook (模仿 minimal-ui-kit/analytics-website-visits.tsx 的 useChart hook 邏輯)
function useAssetChartOptions(theme) {
    // X軸標籤 (年份)
    const categories = mockData.map(d => d.year.toString());
    
    // 定義顏色
    const chartColors = [
        theme.palette.primary.main, // 目標增長線
        theme.palette.success.main, // 目前計畫線
    ];

    return {
        chart: {
            background: 'transparent',
            stacked: false,
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        colors: chartColors,
        dataLabels: { enabled: false },
        fill: { opacity: 1, type: 'solid' },
        grid: {
            borderColor: theme.palette.divider,
            strokeDashArray: 2,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
        },
        legend: { 
            show: true, 
            position: 'top', 
            horizontalAlign: 'right',
            fontSize: '13px',
            labels: {
                colors: theme.palette.text.primary,
            }
        },
        stroke: { curve: 'smooth', width: 3 }, // 折線圖使用 smooth curve
        theme: { mode: theme.palette.mode },
        xaxis: {
            axisBorder: { color: theme.palette.divider, show: true },
            axisTicks: { color: theme.palette.divider, show: true },
            categories: categories,
            labels: { offsetY: 5, style: { colors: theme.palette.text.secondary } },
        },
        yaxis: {
            labels: {
                // 格式化 Y 軸為 $X.X M
                formatter: (value) => (value > 0 ? `$${(value / 1000000).toFixed(1)}M` : `$${value}`),
                offsetX: -10,
                style: { colors: theme.palette.text.secondary },
            },
        },
        tooltip: { 
            y: { 
                formatter: (value) => `$${value.toLocaleString()}`,
            } 
        },
    };
}


// 3. AssetLineChart 主元件
export default function AssetLineChart({ title = "資產走勢預測", subheader = "預測未來10年的資產增長", sx }) {
    const theme = useTheme();
    const chartOptions = useAssetChartOptions(theme);

    // 轉換數據為 ApexCharts 的 series 格式
    const chartSeries = [
        {
            name: "目標增長 (12% CAGR)",
            data: mockData.map(d => d.projectedAsset),
        },
        {
            name: "目前計畫 (8% CAGR)",
            data: mockData.map(d => d.currentPlan),
        },
    ];

    return (
        <Card sx={{ ...sx, p: 0 }}>
            {/* 模仿 analytics-website-visits.tsx 的 CardHeader */}
            <CardHeader 
                title={title} 
                subheader={subheader}
                // 此模板中沒有 action 按鈕，故不加入
            />
            
            {/* 繪製 ApexCharts 的折線圖 */}
            <Chart
                type="line" // 指定為 Line Chart
                series={chartSeries}
                options={chartOptions}
                sx={{
                    pl: 1,
                    py: 2.5,
                    pr: 2.5,
                    height: 364, // 保持與模板一致的高度
                }}
            />
        </Card>
    );
}