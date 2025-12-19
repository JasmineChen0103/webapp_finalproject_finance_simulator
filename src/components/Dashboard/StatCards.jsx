import * as React from 'react';
import {
    Avatar,
    Card,
    CardContent,
    Stack,
    Typography,
    Box,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalculateIcon from "@mui/icons-material/Calculate";

function StatCard({ title, value, Icon, iconBgColor, subText, diff, trend = 'none', sx }) {
    
    let TrendIcon = null;
    let trendColor = 'text.secondary';
    
    if (trend === 'up') {
        TrendIcon = ArrowUpwardIcon;
        trendColor = 'success.main';
    } else if (trend === 'down') {
        TrendIcon = ArrowDownwardIcon;
        trendColor = 'error.main';
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
                    {TrendIcon && diff !== undefined ? (
                        // 包含 diff (如 5%) 和附註文字
                        <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                                <TrendIcon sx={{ color: trendColor }} fontSize="small" />
                                <Typography color={trendColor} variant="body2">
                                    {diff}%
                                </Typography>
                            </Stack>
                            <Typography color="text.secondary" variant="caption">
                                {subText || 'Since last period'}
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

export default function StatCards({ data }) {
    // 如果沒有數據，顯示空狀態
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                <Typography color="text.secondary">等待統計數據中...</Typography>
            </Box>
        );
    }

    // 預定義的圖示對應
    const iconMap = [
        AttachMoneyIcon,
        TrendingUpIcon,
        ArrowUpwardIcon,
        CalculateIcon,
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: '100%' }}>
            {data.map((stat, index) => {
                const IconComponent = iconMap[index] || AttachMoneyIcon;
                return (
                    <Box key={index} sx={{ minWidth: 260, flex: '0 0 auto' }}>
                        <StatCard
                            title={stat.title}
                            value={stat.value}
                            Icon={IconComponent}
                            iconBgColor={stat.iconBgColor}
                            subText={stat.subText}
                            diff={stat.diff}
                            trend={stat.trend || 'none'}
                            sx={{ height: 160 }}
                        />
                    </Box>
                );
            })}
        </Box>
    );
}