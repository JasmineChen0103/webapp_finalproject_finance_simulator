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

import { useOnboarding } from "../../context/OnboardingContext";

export default function Step3Invest() {
    const navigate = useNavigate();

    // 取得 context
    const { data, update } = useOnboarding();

    // 可投資金額 = Income - Expense
    const availableMoney =
        Number(data.monthlyIncome || 0) - Number(data.monthlyExpense || 0);

    // 動態投資項目
    const [rows, setRows] = useState(
        data.investments?.length ? data.investments : [{ type: "", amount: "" }]
    );
    const [error, setError] = useState("");

    // 風險設定
    const [fixedReturn, setFixedReturn] = useState(data.fixedReturn || "");
    const [riskHigh, setRiskHigh] = useState(data.riskMode === "high");
    const [riskLow, setRiskLow] = useState(data.riskMode === "low");

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

        // 更新到 Context
        update({
            investments: rows,
            totalInvestment: totalInvest,
            riskMode: riskHigh ? "high" : riskLow ? "low" : "fixed",
            fixedReturn: fixedReturn || null,
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
                <Typography variant="h5" textAlign="center" fontWeight={600} mb={3}>
                    Step 3 — Investment Settings
                </Typography>

                {error && <Alert severity="warning">{error}</Alert>}

                {/* 投資項目列表 */}
                {rows.map((row, idx) => {
                    const percent =
                        availableMoney > 0 && Number(row.amount) > 0
                            ? ((Number(row.amount) / availableMoney) * 100).toFixed(1)
                            : "—";

                    return (
                        <Box
                            key={idx}
                            sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}
                        >
                            <TextField
                                select
                                fullWidth
                                label="Investment Type"
                                value={row.type}
                                onChange={(e) => updateRow(idx, "type", e.target.value)}
                            >
                                <MenuItem value="stocks">Stocks</MenuItem>
                                <MenuItem value="etf">ETF</MenuItem>
                                <MenuItem value="crypto">Crypto</MenuItem>
                                <MenuItem value="fund">Fund</MenuItem>
                            </TextField>

                            <TextField
                                fullWidth
                                type="number"
                                label="Amount"
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

                <Button startIcon={<AddIcon />} variant="contained" onClick={addRow}>
                    Add Investment
                </Button>

                <Typography variant="h6" sx={{ mt: 2 }}>
                    Total Investment: {totalInvest}
                </Typography>

                {/* 風險模式設定 */}
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
                    />

                    <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                        <FormControlLabel
                            control={<Checkbox checked={riskHigh} onChange={toggleHighRisk} />}
                            label="High Risk (Random)"
                        />
                        <FormControlLabel
                            control={<Checkbox checked={riskLow} onChange={toggleLowRisk} />}
                            label="Low Risk (Random)"
                        />
                    </Box>
                </Box>

                {/* Back / Next */}
                <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
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