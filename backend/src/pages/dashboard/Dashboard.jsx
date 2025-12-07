import { useState, useEffect } from "react";
import { Box, Typography, Grid } from "@mui/material";
import StatCards from "../../components/Dashboard/StatCards";
import AssetLineChart from "../../components/Dashboard/AssetLineChart";
import ExpensePieChart from "../../components/Dashboard/ExpensePieChart";
import { getFinancialSetting } from "../../api/financialSetting";

export default function Dashboard() {
    const [simData, setSimData] = useState(null);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                // 1. 從 localStorage 拿到登入者的 user_id
                const user = JSON.parse(localStorage.getItem("user"));
                if (!user?.user_id) return;

                // 2. 呼叫後端 FinancialSettingApi 取得使用者真實參數
                const settings = await getFinancialSetting(user.user_id);

                // 3. 將 settings 數據帶入模擬 API
                const response = await fetch("http://localhost:8000/simulate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        months: 36,
                        income_monthly: settings.monthlyIncome,
                        expenses: settings.expenses.reduce((acc, curr) => {
                            acc[curr.category] = curr.amount;
                            return acc;
                        }, {}),
                        invest_ratio: 0.2,
                        market_model: { mode: "fixed", fixed_annual_return: settings.fixedReturn },
                        scenarios: []
                    })
                });
                
                const result = await response.json();
                console.log("模擬結果:", result);  // 檢查數據結構
                setSimData(result);
            } catch (err) {
                console.error("Dashboard 載入失敗:", err);
            }
        };

        loadDashboard();
    }, []);

    return (
        <Box sx={{ py: 3 }}>
            <Box sx={{ mb: 3 }}>
                <StatCards />
            </Box>

            <Grid
                container
                spacing={1}
                sx={{ width: "100%", minWidth: 0 }}
            >
                <Grid
                    item
                    sx={{
                        width: {
                            xs: "100%",
                            md: "66%",
                            lg: "66%"
                        }
                    }}
                >
                    <AssetLineChart data={simData?.lineChart} sx={{ height: '100%' }} />
                </Grid>

                <Grid item sx={{
                    width: {
                        xs: "100%",
                        md: "33.3%",
                        lg: "33.3%"
                    }
                }}
                >
                    <ExpensePieChart data={simData?.pieChart} sx={{ height: '100%' }} />
                </Grid>
            </Grid>
        </Box>
    );
}