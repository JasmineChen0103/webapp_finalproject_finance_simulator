import * as React from 'react';
import {
    Avatar,
    Card,
    CardContent,
    Stack,
    Typography,
    Grid,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalculateIcon from "@mui/icons-material/Calculate";
import StarIcon from "@mui/icons-material/Star";
// 引入所有可能用到的 Icon
const IconMap = {
    "AttachMoneyIcon": AttachMoneyIcon,
    "TrendingUpIcon": TrendingUpIcon,
    "ArrowUpwardIcon": ArrowUpwardIcon,
    "ArrowDownwardIcon": ArrowDownwardIcon,
    "CalculateIcon": CalculateIcon,
    "StarIcon": StarIcon,
};


// 調整 StatCard 接收 IconName 作為字串，並從 IconMap 查找
function StatCard({ title, value, iconName, iconBgColor, subText, diff, trend = 'none', sx }) {
    
    // 從字串名稱獲取實際的 Icon Component
    const Icon = IconMap[iconName] || AttachMoneyIcon; // 預設使用 AttachMoneyIcon
    
    let TrendIcon = null;
    let trendColor = 'text.secondary';
    
    if (trend === 'up') {
        TrendIcon = ArrowUpwardIcon;
        trendColor = 'success.main'; // 綠色
    } else if (trend === 'down') {
        TrendIcon = ArrowDownwardIcon;
        trendColor = 'error.main'; // 紅色
    }

    return (
        <Card sx={sx}>
            <CardContent>
                <Stack spacing={3}>
                    {/* 標題, 數值, 圖示 */}
                    <Stack 
                        direction="row" 
                        sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} 
                        spacing={3}
                    >
                        <Stack spacing={1}>
                            {/* 標題 - 使用 overline 樣式 */}
                            <Typography color="text.secondary" variant="overline">
                                {title}
                            </Typography>
                            {/* 數值 - 使用 h4 樣式 */}
                            <Typography variant="h4">{value}</Typography>
                        </Stack>
                        
                        {/* 圖示 Avatar - 模仿模板的尺寸和背景色 */}
                        <Avatar sx={{ 
                            backgroundColor: iconBgColor || 'primary.main', 
                            height: '56px', 
                            width: '56px' 
                        }}>
                            <Icon fontSize="large" /> 
                        </Avatar>
                    </Stack>

                    {/* 趨勢/附註資訊 */}
                    {/* 注意：後端傳來的 diff 可能為 null/undefined，這裡只檢查 trend 是否為 'none' */}
                    {trend !== 'none' ? (
                        // 包含 diff (如 5%) 和附註文字
                        <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                                {/* 如果 diff 是數值，顯示百分比；如果不是，顯示絕對值差異或隱藏 % */}
                                {diff !== undefined && diff !== null && (
                                    <>
                                        <TrendIcon sx={{ color: trendColor }} fontSize="small" />
                                        <Typography color={trendColor} variant="body2">
                                            {/* 根據後端 SimulationService.py 的輸出調整格式化邏輯 */}
                                            {title.includes("報酬率") || title.includes("儲蓄率") ? 
                                                `${(diff * 100).toFixed(1)}%` : `${diff.toFixed(0)}`}
                                        </Typography>
                                    </>
                                )}
                            </Stack>
                            <Typography color="text.secondary" variant="caption">
                                {subText || 'No change data available'}
                            </Typography>
                        </Stack>
                    ) : (
                         // 僅顯示附註文字
                        <Typography color="text.secondary" variant="caption">
                            {subText || 'No change data available'}
                        </Typography>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}

// 根據後端 SimulationService.py 的輸出調整 IconName 的對應邏輯:
const iconMapFromTitle = (title) => {
    switch(title) {
        case "預期期末資產 (P50)":
            return "AttachMoneyIcon";
        case "實際年化報酬率":
            return "TrendingUpIcon";
        case "每月儲蓄率":
            return "CalculateIcon";
        case "95% 最差情境資產 (P05)":
            return "StarIcon";
        default:
            return "AttachMoneyIcon";
    }
}


// 調整 StatCards 接收 data prop
export default function StatCards({ data }) {
    // 預設資料 (如果 data 為空)
    const mockStats = [
        { title: "目前淨資產", value: "---", iconBgColor: "primary.main", subText: "等待數據", diff: undefined, trend: 'none' },
        { title: "預測10年後總資產", value: "---", iconBgColor: "primary.main", subText: "等待數據", diff: undefined, trend: 'none' },
    ];
    
    // 使用從 props 傳入的 data.statCards 或回退到 mockStats
    const statsToRender = data && data.length > 0 ? data : mockStats;

    return (
        <Grid container spacing={3}>
            {statsToRender.map((stat, index) => (
                <Grid item xs={12} sm={6} md={2.4} key={stat.title || index}>
                    <StatCard
                        title={stat.title}
                        value={stat.value}
                        iconName={iconMapFromTitle(stat.title)} // 根據 title 映射 Icon
                        iconBgColor={stat.iconBgColor}
                        subText={stat.subText}
                        diff={stat.diff}
                        trend={stat.trend}
                        sx={{ height: "100%" }} 
                    />
                </Grid>
            ))}
        </Grid>
    );
}