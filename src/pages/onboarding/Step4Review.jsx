import { Box, Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Step4Review() {
    const navigate = useNavigate();

    // TODO: 之後從 Step1~3 帶入真正資料
    const basicInfo = { totalAsset: 100000, monthlyIncome: 50000 };
    const expenses = [{ category: "Food", amount: 5000 }];
    const investments = [{ type: "Stocks", amount: 10000 }];

    const handleConfirm = () => {
        // TODO: 呼叫後端 API 完成 onboarding
        console.log("Final Submit:", {
            basicInfo,
            expenses,
            investments,
        });

        navigate("/dashboard");
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

                <Typography variant="h6" mt={2}>Basic Info</Typography>
                <Typography>Total Asset: {basicInfo.totalAsset}</Typography>
                <Typography>Monthly Income: {basicInfo.monthlyIncome}</Typography>

                <Typography variant="h6" mt={2}>Expenses</Typography>
                {expenses.map((e, i) => (
                    <Typography key={i}>{e.category}: {e.amount}</Typography>
                ))}

                <Typography variant="h6" mt={2}>Investments</Typography>
                {investments.map((e, i) => (
                    <Typography key={i}>{e.type}: {e.amount}</Typography>
                ))}

                <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3 }}
                    onClick={handleConfirm}
                >
                    Confirm & Finish
                </Button>
            </Container>
        </Box>
    );
}
