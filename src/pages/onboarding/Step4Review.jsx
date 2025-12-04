import { Box, Container, Typography, Button, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { useOnboarding } from "../../context/financialSetting";

// 🔧【新增】後端 API
import { saveFinancialSetting } from "../../api/financialSetting";

export default function Step4Review() {
    const navigate = useNavigate();
    const { data } = useOnboarding();   // 🔧 取得 Step1~3 所有資料
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const {
        totalAsset,
        monthlyIncome,
        monthlyExpense,
        expenses,
        investments,
        riskMode,
        fixedReturn
    } = data;

    const handleConfirm = async () => {
        setError("");
        setSuccess("");

        try {
const payload = {
    user_id: 1,
    totalAsset: Number(totalAsset),
    monthlyIncome: Number(monthlyIncome),
    monthlyExpense: Number(monthlyExpense),
    riskMode: riskMode,
    fixedReturn: fixedReturn ? Number(fixedReturn) : null,
    expenses: expenses || [],
    investments: investments || [],
};


            console.log("📤 Final Submit Payload:", payload);

            const res = await saveFinancialSetting(payload);

            setSuccess(res.message);

            // 1 秒後導向 Dashboard
            setTimeout(() => navigate("/dashboard"), 800);

        } catch (err) {
            setError(err.message || "Submit failed");
        }
    };

    const handleBack = () => {
        navigate("/onboarding/step3");
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
                <Typography variant="h5" textAlign="center" mb={2} fontWeight={600}>
                    Step 4 — Review Your Settings
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                {/* Basic Info */}
                <Typography variant="h6" mt={2}>Basic Info</Typography>
                <Typography>Total Asset: {totalAsset}</Typography>
                <Typography>Monthly Income: {monthlyIncome}</Typography>

                {/* Expenses */}
                <Typography variant="h6" mt={3}>Expenses</Typography>
                {expenses?.map((e, i) => (
                    <Typography key={i}>{e.category}: {e.amount}</Typography>
                ))}
                <Typography>Total Monthly Expense: {monthlyExpense}</Typography>

                {/* Investments */}
                <Typography variant="h6" mt={3}>Investments</Typography>
                {investments?.map((inv, i) => (
                    <Typography key={i}>
                        {inv.type}: {inv.amount}
                    </Typography>
                ))}

                <Typography mt={2}>Risk Mode: {riskMode}</Typography>
                {riskMode === "fixed" && (
                    <Typography>Fixed Return: {fixedReturn}%</Typography>
                )}

                {/* Back + Confirm Buttons */}
                <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                    <Button variant="outlined" fullWidth onClick={handleBack}>
                        Back
                    </Button>

                    <Button variant="contained" fullWidth onClick={handleConfirm}>
                        Confirm & Finish
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}
