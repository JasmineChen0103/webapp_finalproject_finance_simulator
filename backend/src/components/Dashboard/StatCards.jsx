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

function StatCard({ title, value, Icon, iconBgColor, subText, diff, trend = 'none', sx }) {
    
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
                    {diff !== undefined && trend !== 'none' ? (
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

export default function StatCards() {
    const mockStats = [
        {
            title: "目前淨資產",
            value: "$1,500K",
            Icon: AttachMoneyIcon,
            iconBgColor: "success.main", // 綠色
            subText: "自去年以來成長",
            diff: 5,
            trend: 'up',
        },
        {
            title: "預測10年後總資產",
            value: "$3,200K",
            Icon: TrendingUpIcon,
            iconBgColor: "primary.main", // 主題藍色
            subText: "年化增長率 12%",
            diff: 2, // 假設較預期目標低 2%
            trend: 'down',
        },
        {
            title: "每月投資金額",
            value: "$5,000",
            Icon: ArrowUpwardIcon,
            iconBgColor: "warning.main", // 橘色
            subText: "固定投資",
            diff: undefined, // 不顯示趨勢
            trend: 'none',
        },
        {
            title: "IRR (內部報酬率)",
            value: "8.5%",
            Icon: CalculateIcon,
            iconBgColor: "info.main", // 淺藍色
            subText: "預期年化報酬率",
            diff: undefined,
            trend: 'none',
        },
        {
            title: "達標所需年數",
            value: "15.5 年",
            Icon: StarIcon,
            iconBgColor: "secondary.main", // 紫色
            subText: "目標 $10M",
            diff: 0.5, // 假設比上個月預測值縮短 0.5 年
            trend: 'down', // 這裡 trend='down' 表示年數減少，實際可能是正面趨勢，您可根據專案需求調整此處邏輯。
        },
    ];

    return (
        <Grid container spacing={3}>
            {mockStats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={2.4} key={index}>
                    <StatCard
                        title={stat.title}
                        value={stat.value}
                        Icon={stat.Icon}
                        iconBgColor={stat.iconBgColor}
                        subText={stat.subText}
                        diff={stat.diff}
                        trend={stat.trend}
                        // 讓卡片的高度一致
                        sx={{ height: "100%" }} 
                    />
                </Grid>
            ))}
        </Grid>
    );
}