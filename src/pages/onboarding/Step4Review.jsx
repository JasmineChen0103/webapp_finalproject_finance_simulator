import { Box, Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Step4Review() {
    const navigate = useNavigate();

    // TODO: 之後從 Step1~3 帶入真正資料（目前是假資料）
    const basicInfo = { totalAsset: 100000, monthlyIncome: 50000 };
    const expenses = [{ category: "Food", amount: 5000 }];
    const investments = [
        { type: "Stocks", amount: 10000 },
        { type: "ETF", amount: 5000 }
    ];

    // 計算總支出
    const totalExpenses = expenses.reduce(
        (sum, e) => sum + Number(e.amount || 0),
        0
    );

    // 可投資額
    const availableMoney = basicInfo.monthlyIncome - totalExpenses;

    // 計算百分比
    const getPercent = (amount) => {
        if (availableMoney <= 0) return "—";
        return ((amount / availableMoney) * 100).toFixed(1) + "%";
    };

    const handleConfirm = () => {
        // TODO: 呼叫後端 API 完成 onboarding
        console.log("Final Submit:", {
            basicInfo,
            expenses,
            investments,
        });

        navigate("/dashboard");
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
                <Typography variant="h5" textAlign="center" fontWeight={600} mb={2}>
                    Step 4 — Review Your Settings
                </Typography>

                {/* Basic Info */}
                <Typography variant="h6" mt={2}>Basic Info</Typography>
                <Typography>Total Asset: {basicInfo.totalAsset}</Typography>
                <Typography>Monthly Income: {basicInfo.monthlyIncome}</Typography>

                {/* Expenses */}
                <Typography variant="h6" mt={3}>Expenses</Typography>
                {expenses.map((e, i) => (
                    <Typography key={i}>{e.category}: {e.amount}</Typography>
                ))}

                {/* Investments */}
                <Typography variant="h6" mt={3}>Investments</Typography>
                {investments.map((inv, i) => (
                    <Typography key={i}>
                        {inv.type}: {inv.amount} ({getPercent(inv.amount)})
                    </Typography>
                ))}

                {/* Back + Confirm Buttons */}
                <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleBack}
                    >
                        Back
                    </Button>

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleConfirm}
                    >
                        Confirm & Finish
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}
