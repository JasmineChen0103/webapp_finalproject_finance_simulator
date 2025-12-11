import React from "react";
import { useState, useEffect } from "react";
import { Box, Typography, Grid } from "@mui/material";
import StatCards from "../../components/Dashboard/StatCards";
import AssetLineChart from "../../components/Dashboard/AssetLineChart";
import ExpensePieChart from "../../components/Dashboard/ExpensePieChart";
import { getFinancialSetting } from "../../api/financialSetting";
import ScenarioCard from "../../components/Scenario/ScenarioCard"; // 新增這行
import ScenarioFullEditModal from "../../components/Scenario/ScenarioFullEditModal"; // 確認有引入
const scenarios = [
    {
        id: 1,
        title: "預設情境",
        description: "這是範例描述",
        totalAsset: 10000,
        monthlyIncome: 50000,
        expenses: [{ amount: 20000 }],
        investments: [{ amount: 5000 }]
    },
    {
        id: 2,
        title: "進階情境",
        description: "另一個範例",
        totalAsset: 20000,
        monthlyIncome: 60000,
        expenses: [{ amount: 25000 }],
        investments: [{ amount: 10000 }]
    }
];
export default function Dashboard() {
    const [simData, setSimData] = useState(null);
 const [editOpen, setEditOpen] = React.useState(false);
    const [editScenario, setEditScenario] = React.useState(null);
    // 預設選第一個
    const [selectedScenario, setSelectedScenario] = React.useState(scenarios[0]);
    const dummyScenario = scenarios[0];
    // 編輯按鈕點擊時
    const handleEdit = (scenario) => {
        setEditScenario(scenario);
        setEditOpen(true);
    };
    // 選取 Scenario
    const handleSelect = (id) => {
        const found = scenarios.find(s => s.id === id);
        if (found) setSelectedScenario(found);
    };
    // 儲存 Scenario
    const handleSaveScenario = (updatedScenario) => {
        // TODO: 這裡要更新你的 scenario 狀態或發送 API
        // 目前只會關閉 modal
        setEditOpen(false);
    };
    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                if (!user?.user_id) return;

                const settings = await getFinancialSetting(user.user_id);

                // 將 expenses 轉換為後端期望的格式：[{category: "...", amount: ...}]
                const expensesArray = settings.expenses.map(exp => ({
                    category: exp.category,
                    amount: exp.amount
                }));

                const response = await fetch("http://localhost:8000/simulate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        initial_assets: settings.totalAsset || 0,  // 初始總資產（必填）
                        income_monthly: settings.monthlyIncome,
                        expenses: expensesArray,  // 使用陣列格式
                        invest_ratio: settings.investRatio || 0.2,
                        market_model: {
                            mode: "fixed",
                            profile: "custom",
                            fixed_annual_return: settings.fixedReturn || 0.05
                        },
                        scenarios: [],
                        paths: 1000,
                        seed: 12345
                    })
                });

                if (!response.ok) {
                    throw new Error(`模擬失敗: ${response.status}`);
                }

                const result = await response.json();
                setSimData(result);
            } catch (err) {
                console.error("Dashboard 載入失敗:", err);
            }
        };

        loadDashboard();
    }, []);

    return (
        <Box sx={{ py: 3 }}>
            {/* 第一排：StatCards 滿版 */}
            <Grid container spacing={2} sx={{ width: "100%", mb: 2 }}>
                {/* 注意：size 必須寫在標籤括號內，不能單獨放在大括號裡 */}
                <Grid size={{ xs: 12 }}>
                    <StatCards data={simData?.statCards} />
                </Grid>
            </Grid>

            {/* 第二排：AssetLineChart */}
            <Grid container spacing={2} sx={{ width: "100%", mb: 2 }}>
                {/* 修正點：確保是 size={{ ... }} 而不是直接傳物件 */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <AssetLineChart data={simData?.lineChart} sx={{ height: '100%' }} />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <AssetLineChart data={simData?.lineChart} sx={{ height: '100%' }} />
                </Grid>
            </Grid>

            {/* 第三排：圓餅圖 + 情境卡並排 */}
            <Grid container spacing={2} sx={{ width: "100%", minWidth: 0 }}>
                {/* 左側：圓餅圖 */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <ExpensePieChart data={simData?.pieChart} sx={{ height: '100%' }} />
                </Grid>

                {/* 右側：情境卡列表 */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ display: 'flex', gap: 2, height: '100%', flexWrap: 'wrap' }}>
                        {scenarios.map(scenario => (
                            <Box key={scenario.id} sx={{ flex: '1 1 300px', minWidth: 0 }}>
                                <ScenarioCard
                                    scenario={scenario}
                                    selectedId={selectedScenario.id}
                                    onSelect={handleSelect}
                                    onEdit={handleEdit}
                                />
                            </Box>
                        ))}
                    </Box>
                </Grid>
            </Grid>

            {/* 編輯情境 Modal */}
            <ScenarioFullEditModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                scenario={editScenario}
                onSave={handleSaveScenario}
            />
        </Box>
    );
}