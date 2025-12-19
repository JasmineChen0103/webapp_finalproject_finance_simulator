import React, { useState, useEffect } from "react";
import { Box, Grid } from "@mui/material";
import StatCards from "../../components/Dashboard/StatCards";
import AssetLineChart from "../../components/Dashboard/AssetLineChart";
import ExpensePieChart from "../../components/Dashboard/ExpensePieChart";
import { getFinancialSetting } from "../../api/financialSetting";
import ScenarioCard from "../../components/Scenario/ScenarioCard";
import ScenarioFullEditModal from "../../components/Scenario/ScenarioFullEditModal";

// 初始情境資料
const INITIAL_SCENARIOS = [
    {
        id: 1,
        name: "預設情境",
        description: "基於目前設定的預測",
        expenses_delta: {},
        invest_ratio_delta: 0,
        events: []
    },
    {
        id: 2,
        name: "買車計畫",
        description: "模擬額外支出(買車)",
        expenses_delta: {},
        invest_ratio_delta: 0,
        events: []
    }
];

export default function Dashboard() {
    // --- State 定義 ---
    const [scenarios, setScenarios] = useState(INITIAL_SCENARIOS);
    const [selectedScenario, setSelectedScenario] = useState(INITIAL_SCENARIOS[0]);
    
    // 儲存 API 回傳的完整資料
    const [simData, setSimData] = useState(null);
    // 已移除 baseSettings，改為每次都重抓
    // Loading 狀態
    const [loading, setLoading] = useState(false);

    // Modal 控制
    const [editOpen, setEditOpen] = useState(false);
    const [editScenario, setEditScenario] = useState(null);

    // --- 核心函式：執行模擬 (API Call) ---
    // 關鍵修正：這裡接收 currentScenarios 作為參數，確保拿到最新的
    const runSimulation = async (settings, currentScenarios) => {
        if (!settings) return;
        setLoading(true);

        try {
            const expensesArray = settings.expenses.map(exp => ({
                category: exp.category,
                amount: exp.amount
            }));

            // 整理傳給後端的格式 (只取需要的欄位)
            const apiScenarios = currentScenarios.map(s => ({
                name: s.name,
                description: s.description,
                expenses_delta: s.expenses_delta,
                invest_ratio_delta: s.invest_ratio_delta,
                events: s.events
            }));
            const response = await fetch("http://localhost:8000/simulate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    initial_assets: settings.totalAsset || 0,
                    income_monthly: settings.monthlyIncome,
                    expenses: expensesArray,
                    invest_ratio: settings.investRatio || 0.2,
                    market_model: {
                        mode: settings.fixedReturn && settings.fixedReturn > 0 ? "fixed" : "normal",
                        profile: settings.riskMode === "high" ? "high_risk" : settings.riskMode === "low" ? "low_risk" : "custom",
                        fixed_annual_return: settings.fixedReturn || 0.05
                    },
                    scenarios: apiScenarios, // 這裡用傳入的參數，而不是 State
                    paths: 1000,
                    seed: 12345
                })
            });

            if (!response.ok) throw new Error(`模擬失敗: ${response.status}`);

            const result = await response.json();
            setSimData(result);
        } catch (err) {
            console.error("模擬執行失敗:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- 初始化 ---
    useEffect(() => {
        const initDashboard = async () => {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user?.user_id) return;

            const settings = await getFinancialSetting(user.user_id);
            console.log('[User Setting]', settings);
            // 每次都直接用最新 settings 執行模擬
            await runSimulation(settings, scenarios);
        };
        initDashboard();
    }, []);

    // --- 事件處理 ---

    const handleEdit = (scenario) => {
        setEditScenario(scenario);
        setEditOpen(true);
    };

    const handleSelect = (id) => {
        const found = scenarios.find(s => s.id === id);
        if (found) setSelectedScenario(found);
    };

    // --- 關鍵修正：儲存並立即更新 ---
    const handleSaveScenario = async (updatedScenario) => {
        // 1. 產生新的情境陣列
        const newScenarios = scenarios.map(s => 
            s.id === updatedScenario.id ? updatedScenario : s
        );

        // 2. 更新 React 畫面狀態 (為了卡片顯示)
        setScenarios(newScenarios);

        // 3. 如果編輯的是當前選中的，也更新 selected
        if (selectedScenario.id === updatedScenario.id) {
            setSelectedScenario(updatedScenario);
        }

        setEditOpen(false);

        // 4. 重新抓最新設定再執行模擬
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.user_id) {
            const settings = await getFinancialSetting(user.user_id);
            await runSimulation(settings, newScenarios);
        }
    };

    // --- 資料篩選邏輯 ---
    const chartSource = simData?.lineChart;
    
    // 檢查有沒有拿到線圖資料
    const hasData = chartSource && chartSource.scenarios && chartSource.scenarios.length > 0;

    // 左圖：永遠是 Baseline (Index 0)
    // 我們保留 categories (月份)，但把 scenarios 陣列過濾到只剩一筆
    const leftChartData = hasData ? {
        ...chartSource,
        scenarios: [chartSource.scenarios[0]] 
    } : null;

    // 右圖：根據 selectedScenario.name 找對應的資料
    const rightChartData = hasData ? {
        ...chartSource,
        scenarios: [
            // 嘗試用名字配對 (例如 "買車計畫")，如果找不到就顯示 Baseline (index 0)
            chartSource.scenarios.find(s => s.name === selectedScenario.name) || chartSource.scenarios[0]
        ]
    } : null;

    return (
        <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
            {/* 中心化容器，限制最大寬度使版面置中且不會拉太寬 */}
            <Box sx={{ width: '100%', maxWidth: 1200 }}>
                {/* 第一排：StatCards */}
                <Grid container spacing={2} sx={{ width: "100%", mb: 2 }} justifyContent="center">
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <StatCards data={simData?.statCards} />
                        </Box>
                    </Grid>
                </Grid>

                {/* 第二排：左右線圖 */}
                <Grid container spacing={2} sx={{ width: "100%", mb: 2 }} justifyContent="center" alignItems="stretch">
                    {/* 左邊：基本設定 (Baseline) */}
                    <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <AssetLineChart 
                            title="基本設定預測 (Baseline)" 
                            data={leftChartData} 
                            isLoading={loading}
                            sx={{ width: '100%', height: '100%' }} 
                        />
                    </Grid>

                    {/* 右邊：情境模擬 (Selected Scenario) */}
                    <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <AssetLineChart 
                            title={`情境模擬: ${selectedScenario?.name}`} 
                            data={rightChartData} 
                            isLoading={loading}
                            sx={{ width: '100%', height: '100%' }} 
                        />
                    </Grid>
                </Grid>

                {/* 第三排：圓餅圖 + 情境卡 */}
                {/* 第三排：圓餅圖 + 情境卡 */}
                <Grid container spacing={2} sx={{ width: "100%" }} justifyContent="center" alignItems="flex-start">
                    <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <ExpensePieChart data={simData?.pieChart} sx={{ width: '100%', height: '100%' }} />
                    </Grid>

                    <Grid item xs={12} md={8} sx={{ height: 450 }}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 2,
                            height: '100%',
                            overflowX: 'auto',
                            alignItems: 'stretch',
                            py: 1
                        }}>
                            {scenarios.map(scenario => (
                                <Box key={scenario.id} sx={{ minWidth: 300, display: 'flex', justifyContent: 'center', alignItems: 'stretch', height: '100%' }}>
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

                {/* 編輯 Modal */}
                <ScenarioFullEditModal
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                    scenario={editScenario}
                    onSave={handleSaveScenario}
                />
            </Box>
        </Box>
    );
}