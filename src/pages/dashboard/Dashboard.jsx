import { Box, Typography, Grid } from "@mui/material";
import StatCards from "../../components/Dashboard/StatCards";
import AssetLineChart from "../../components/Dashboard/AssetLineChart";
import ExpensePieChart from "../../components/Dashboard/ExpensePieChart";


export default function Dashboard() {
    return (
        <Box sx={{ py: 3 }}>

            {/* 1. 上方 Cards: 移除所有 px 樣式。 */}
            <Box sx={{ mb: 3 }}>
                <StatCards />
            </Box>

            {/* 2. 圖表區域 (折線圖 + 圓餅圖)*/}
            <Grid
                container
                spacing={1}
                sx={{ width: "100%", minWidth: 0 }}
            >

                {/* 折線圖 */}
                <Grid
                    item
                    sx={{
                        width: {
                            xs: "100%",      // 小螢幕佔滿
                            md: "66%",    // 平板以上佔 2/3
                            lg: "66%"
                        }
                    }}
                >
                    <AssetLineChart sx={{height: '100%'}}/>
                </Grid>

                {/* 圓餅圖 */}
                <Grid item sx={{
                        width: {
                            xs: "100%",      // 小螢幕佔滿
                            md: "33.3%",    // 平板以上佔 1/3
                            lg: "33.3%"
                        }
                    }}
                >
                    <ExpensePieChart sx={{height: '100%'}}/>
                </Grid>

            </Grid>

        </Box>
    );
}