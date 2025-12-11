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
import { useOnboarding } from "../../context/OnboardingContext";


export default function Step1Basic() {
  const navigate = useNavigate();
  const { data, update } = useOnboarding();

  // local form states
  const [asset, setAsset] = useState(data.totalAsset || "");
  const [income, setIncome] = useState(data.monthlyIncome || "");

  // 本地驗證用，不會直接送 API
  const [error, setError] = useState("");

  const handleNext = () => {
    // 基本驗證
    if (!asset || !income) {
      setError("Total asset and monthly income are required.");
      return;
    }

    if (Number(asset) < 0 || Number(income) <= 0) {
      setError("Values must be positive numbers.");
      return;
    }

    // 更新 context
    update({
      totalAsset: asset,
      monthlyIncome: income,
    });

    // Step1 的資料已經存到 context → 不用 call API
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
          Step 1 — Basic Financial Info
        </Typography>

        {error && <Alert severity="warning">{error}</Alert>}

        <TextField
          fullWidth
          label="Total Asset"
          type="number"
          margin="normal"
          value={asset}
          onChange={(e) => setAsset(e.target.value)}
        />

        <TextField
          fullWidth
          label="Monthly Income"
          type="number"
          margin="normal"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
        />

        <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={handleNext}>
          Next
        </Button>
      </Container>
    </Box>
  );
}