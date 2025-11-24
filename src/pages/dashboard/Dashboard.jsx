import { Box, Typography, Grid } from "@mui/material";
import StatCards from "../../components/Dashboard/StatCards";
import AssetLineChart from "../../components/Dashboard/AssetLineChart";
import ExpensePieChart from "../../components/Dashboard/ExpensePieChart";
import ScenarioCard from "../../components/Scenario/ScenarioCard"; // 新增這行
import ScenarioFullEditModal from "../../components/Scenario/ScenarioFullEditModal"; // 確認有引入
import React from "react";

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
    return (
        <Box sx={{ py: 3 }}>

            {/* 1. 上方 Cards */}
            <Box sx={{ mb: 3 }}>
                <StatCards />
            </Box>

            {/* 2. 折線圖區塊 */}
            <Box sx={{ display: 'flex', width: '100%', mb: 2, gap: 1, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <AssetLineChart sx={{ height: '100%' }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <AssetLineChart scenario={selectedScenario} sx={{ height: '100%' }} />
                </Box>
            </Box>

            {/* 3. 圓餅圖 + ScenarioCard 並排 */}
            <Box sx={{ display: 'flex', width: '100%', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                <Box sx={{ width: { xs: '100%', md: '33.3%' }, minWidth: 0 }}>
                    <ExpensePieChart sx={{ height: '100%' }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'stretch', gap: 2 }}>
                    {/* 多個 ScenarioCard */}
                    {scenarios.map(scenario => (
                        <ScenarioCard
                            key={scenario.id}
                            scenario={scenario}
                            selectedId={selectedScenario.id}
                            onSelect={handleSelect}
                            onEdit={handleEdit}
                        />
                    ))}
                </Box>
            </Box>
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