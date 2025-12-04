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
import { useOnboarding } from "../../context/financialSetting";


export default function Step1Basic() {
  const navigate = useNavigate();
  const { data, setData } = useOnboarding();

  // 本地驗證用，不會直接送 API
  const [error, setError] = useState("");

  const handleNext = () => {
    // 基本驗證
    if (!data.totalAsset || !data.monthlyIncome) {
      setError("Total asset and monthly income are required.");
      return;
    }

    if (Number(data.totalAsset) < 0 || Number(data.monthlyIncome) <= 0) {
      setError("Values must be positive numbers.");
      return;
    }

    setError("");

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
          value={data.totalAsset}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              totalAsset: e.target.value,
            }))
          }
        />

        <TextField
          fullWidth
          label="Monthly Income"
          type="number"
          margin="normal"
          value={data.monthlyIncome}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              monthlyIncome: e.target.value,
            }))
          }
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
