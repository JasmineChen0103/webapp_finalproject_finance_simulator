import { useState } from "react";
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    IconButton,
    Alert,
    MenuItem,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

import { useOnboarding } from "../../context/financialSetting";

export default function Step3Invest() {
    const navigate = useNavigate();

    // 🔧【新增】從 Context 拿全資料 + 更新函式
    const { data, setData } = useOnboarding();

    // 🔧【新增】可投資金額 = Step1 Income - Step2 Expense
    const availableMoney =
        Number(data.monthlyIncome || 0) - Number(data.monthlyExpense || 0);

    // 動態投資項目
    const [rows, setRows] = useState([{ type: "", amount: "" }]);
    const [error, setError] = useState("");

    // 風險設定
    const [fixedReturn, setFixedReturn] = useState("");
    const [riskHigh, setRiskHigh] = useState(false);
    const [riskLow, setRiskLow] = useState(false);

    const totalInvest = rows.reduce(
        (sum, r) => sum + Number(r.amount || 0),
        0
    );

    const addRow = () => setRows([...rows, { type: "", amount: "" }]);

    const deleteRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

    const updateRow = (i, key, value) => {
        const newRows = [...rows];
        newRows[i][key] = value;
        setRows(newRows);

        const newTotal = newRows.reduce(
            (sum, r) => sum + Number(r.amount || 0),
            0
        );

        // 🔧【修改】使用 context 的 availableMoney
        if (newTotal > availableMoney) {
            setError("Your investment amount exceeds available balance!");
        } else {
            setError("");
        }
    };

    // 風險互斥邏輯
    const handleFixedChange = (value) => {
        setFixedReturn(value);
        if (value !== "") {
            setRiskHigh(false);
            setRiskLow(false);
        }
    };

    const toggleHighRisk = () => {
        const newValue = !riskHigh;
        setRiskHigh(newValue);
        if (newValue) {
            setRiskLow(false);
            setFixedReturn("");
        }
    };

    const toggleLowRisk = () => {
        const newValue = !riskLow;
        setRiskLow(newValue);
        if (newValue) {
            setRiskHigh(false);
            setFixedReturn("");
        }
    };

    const handleNext = () => {
        if (totalInvest > availableMoney) {
            setError("Your investment amount exceeds available balance!");
            return;
        }

        if (!fixedReturn && !riskHigh && !riskLow) {
            setError("Please select a risk level or enter a fixed return rate!");
            return;
        }

        setError("");

        // 🔧【新增】將 Step3 的資料暫存到 Context
        setData((prev) => ({
            ...prev,
            investments: rows,
            totalInvestment: totalInvest,
            riskMode: riskHigh
                ? "high"
                : riskLow
                ? "low"
                : "fixed",
            fixedReturn: fixedReturn || null,
        }));

        console.log("Step3 Saved to Context:", {
            investments: rows,
            totalInvestment: totalInvest,
            riskMode: riskHigh ? "high" : riskLow ? "low" : "fixed",
            fixedReturn,
        });

        navigate("/onboarding/step4");
    };

    const handleBack = () => {
        navigate("/onboarding/step2");
    };

    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#fafafa",
            }}
        >
            <Container maxWidth="sm">
                <Typography
                    variant="h5"
                    textAlign="center"
                    mb={3}
                    fontWeight={600}
                >
                    Step 3 — Investment Settings
                </Typography>

                {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

                {/* ----------------- 投資列表 ----------------- */}
                {rows.map((row, idx) => {
                    const percent =
                        availableMoney > 0 && Number(row.amount) > 0
                            ? ((Number(row.amount) / availableMoney) * 100).toFixed(1)
                            : "—";

                    return (
                        <Box
                            sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}
                            key={idx}
                        >
                            <TextField
                                select
                                label="Investment Type"
                                fullWidth
                                value={row.type}
                                onChange={(e) => updateRow(idx, "type", e.target.value)}
                            >
                                <MenuItem value="stocks">Stocks</MenuItem>
                                <MenuItem value="etf">ETF</MenuItem>
                                <MenuItem value="crypto">Crypto</MenuItem>
                                <MenuItem value="fund">Fund</MenuItem>
                            </TextField>

                            <TextField
                                type="number"
                                label="Amount"
                                fullWidth
                                value={row.amount}
                                onChange={(e) => updateRow(idx, "amount", e.target.value)}
                            />

                            <Typography sx={{ width: 60, textAlign: "center" }}>
                                {percent}%
                            </Typography>

                            <IconButton color="error" onClick={() => deleteRow(idx)}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    );
                })}

                <Button startIcon={<AddIcon />} onClick={addRow} variant="contained">
                    Add Investment
                </Button>

                <Typography variant="h6" sx={{ mt: 2 }}>
                    Total Investment: {totalInvest}
                </Typography>

                {/* ----------------- 風險模式設定 ----------------- */}
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" fontWeight={600}>
                        Risk / Return Setting
                    </Typography>

                    <TextField
                        label="Fixed Annual Return (%)"
                        type="number"
                        fullWidth
                        sx={{ mt: 2 }}
                        value={fixedReturn}
                        onChange={(e) => handleFixedChange(e.target.value)}
                        disabled={riskHigh || riskLow}
                        placeholder="e.g., 5"
                    />

                    <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                        <FormControlLabel
                            control={
                                <Checkbox checked={riskHigh} onChange={toggleHighRisk} />
                            }
                            label="High Risk (random)"
                        />

                        <FormControlLabel
                            control={
                                <Checkbox checked={riskLow} onChange={toggleLowRisk} />
                            }
                            label="Low Risk (random)"
                        />
                    </Box>
                </Box>

                {/* Back / Next */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        mt: 4,
                    }}
                >
                    <Button variant="outlined" fullWidth onClick={handleBack}>
                        Back
                    </Button>

                    <Button variant="contained" fullWidth onClick={handleNext}>
                        Next
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}
