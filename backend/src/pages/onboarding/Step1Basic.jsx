import { useState } from "react";
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Step1Basic() {
    const navigate = useNavigate();

    const [totalAsset, setTotalAsset] = useState("");
    const [monthlyIncome, setMonthlyIncome] = useState("");

    const [error, setError] = useState("");

    const handleNext = () => {
        // 基本驗證
        if (!totalAsset || !monthlyIncome) {
            setError("Total asset and monthly income are required.");
            return;
        }

        if (Number(totalAsset) < 0 || Number(monthlyIncome) <= 0) {
            setError("Values must be positive numbers.");
            return;
        }

        setError("");

        // TODO: 呼叫後端 API，送出 Step1 資料
        console.log("Step1 Data:", {
            totalAsset,
            monthlyIncome,
        });

        // 成功後導向 Step2
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
            <Container maxWidth="xs">
                <Typography variant="h5" fontWeight={600} textAlign="center" mb={3}>
                    Step 1 — Basic Financial Settings
                </Typography>

                {error && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    fullWidth
                    label="Total Asset"
                    type="number"
                    margin="normal"
                    value={totalAsset}
                    onChange={(e) => setTotalAsset(e.target.value)}
                />

                <TextField
                    fullWidth
                    label="Monthly Income"
                    type="number"
                    margin="normal"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                />

                <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3 }}
                    onClick={handleNext}
                >
                    Next
                </Button>
            </Container>
        </Box>
    );
}
