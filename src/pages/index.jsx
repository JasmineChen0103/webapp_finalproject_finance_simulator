import { Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Index() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
                backgroundColor: "#fafafa",
            }}
        >
            <Typography variant="h4" fontWeight={600}>
                Welcome to Finance App
            </Typography>

            <Button variant="contained" onClick={() => navigate("/login")}>
                Go to Login
            </Button>

            {/* 測試 Onboarding */}
            <Button
                variant="outlined"
                onClick={() => navigate("/onboarding/step1")}
            >
                Preview Onboarding
            </Button>
        </Box>
    );
}
