import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useOnboarding } from "../../context/OnboardingContext";

export default function Settings() {
  const onboarding = useOnboarding();
  const { data, update } = onboarding;

  // 只印一次，避免洗 console
  useEffect(() => {
    console.log("[Settings] onboarding =", onboarding);
  }, []);

  /* ================= Basic ================= */
  const [basic, setBasic] = useState({
    totalAsset: data.totalAsset || "",
    monthlyIncome: data.monthlyIncome || "",
  });

  /* ================= Expenses ================= */
  const [expenses, setExpenses] = useState(data.expenses || []);

  /* ================= Investments ================= */
  const [investments, setInvestments] = useState(
    data.investments?.length ? data.investments : [{ type: "", amount: "" }]
  );

  /* ================= Risk (單一) ================= */
  const [riskHigh, setRiskHigh] = useState(data.riskMode === "high");
  const [riskLow, setRiskLow] = useState(data.riskMode === "low");
  const [fixedReturn, setFixedReturn] = useState(data.fixedReturn || "");

  /* ================= Save ================= */
  const handleSave = () => {
    update({
      ...basic,
      expenses,
      investments,
      riskMode: riskHigh ? "high" : riskLow ? "low" : "fixed",
      fixedReturn: riskHigh || riskLow ? null : fixedReturn || null,
    });

    alert("Settings saved");
  };

  /* ================= Render ================= */
  return (
    <Box sx={{ p: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight={700} mb={3}>
          Settings
        </Typography>

        {/* ===== BASIC ===== */}
        <Typography variant="h6">Basic Info</Typography>

        <TextField
          fullWidth
          label="Total Asset"
          sx={{ mt: 2 }}
          value={basic.totalAsset}
          onChange={(e) =>
            setBasic({ ...basic, totalAsset: e.target.value })
          }
        />

        <TextField
          fullWidth
          label="Monthly Income"
          sx={{ mt: 2 }}
          value={basic.monthlyIncome}
          onChange={(e) =>
            setBasic({ ...basic, monthlyIncome: e.target.value })
          }
        />

        <Divider sx={{ my: 4 }} />

        {/* ===== EXPENSES ===== */}
        <Typography variant="h6">Expenses</Typography>

        {expenses.map((e, i) => (
          <Box key={i} sx={{ display: "flex", gap: 2, mt: 2 }}>
            <TextField
              label="Category"
              fullWidth
              value={e.category}
              onChange={(ev) => {
                const rows = [...expenses];
                rows[i].category = ev.target.value;
                setExpenses(rows);
              }}
            />
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={e.amount}
              onChange={(ev) => {
                const rows = [...expenses];
                rows[i].amount = ev.target.value;
                setExpenses(rows);
              }}
            />
            <IconButton onClick={() =>
              setExpenses(expenses.filter((_, idx) => idx !== i))
            }>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <Button
          startIcon={<AddIcon />}
          sx={{ mt: 2 }}
          onClick={() =>
            setExpenses([...expenses, { category: "", amount: "" }])
          }
        >
          Add Expense
        </Button>

        <Divider sx={{ my: 4 }} />

        {/* ===== INVESTMENTS ===== */}
        <Typography variant="h6">Investments</Typography>

        {investments.map((inv, i) => (
          <Box key={i} sx={{ display: "flex", gap: 2, mt: 2 }}>
            <TextField
              select
              label="Type"
              fullWidth
              value={inv.type}
              onChange={(ev) => {
                const rows = [...investments];
                rows[i].type = ev.target.value;
                setInvestments(rows);
              }}
            >
              <MenuItem value="stocks">Stocks</MenuItem>
              <MenuItem value="etf">ETF</MenuItem>
              <MenuItem value="crypto">Crypto</MenuItem>
              <MenuItem value="fund">Fund</MenuItem>
            </TextField>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={inv.amount}
              onChange={(ev) => {
                const rows = [...investments];
                rows[i].amount = ev.target.value;
                setInvestments(rows);
              }}
            />
            <IconButton onClick={() =>
              setInvestments(investments.filter((_, idx) => idx !== i))
            }>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <Button
          startIcon={<AddIcon />}
          sx={{ mt: 2 }}
          onClick={() =>
            setInvestments([...investments, { type: "", amount: "" }])
          }
        >
          Add Investment
        </Button>

        <Divider sx={{ my: 4 }} />

        {/* ===== RISK (單一) ===== */}
        <Typography variant="h6">Risk Preference</Typography>

        <TextField
          label="Fixed Annual Return (%)"
          type="number"
          fullWidth
          sx={{ mt: 2 }}
          value={fixedReturn}
          onChange={(e) => {
            setFixedReturn(e.target.value);
            setRiskHigh(false);
            setRiskLow(false);
          }}
          disabled={riskHigh || riskLow}
        />

        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={riskHigh}
                onChange={() => {
                  setRiskHigh(!riskHigh);
                  setRiskLow(false);
                  setFixedReturn("");
                }}
              />
            }
            label="High Risk (auto)"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={riskLow}
                onChange={() => {
                  setRiskLow(!riskLow);
                  setRiskHigh(false);
                  setFixedReturn("");
                }}
              />
            }
            label="Low Risk (auto)"
          />
        </Box>

        <Button sx={{ mt: 4 }} variant="contained" onClick={handleSave}>
          Save All Settings
        </Button>
      </Container>
    </Box>
  );
}
