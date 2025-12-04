import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Divider,
  TextField,
  IconButton,
  FormControlLabel,
  Checkbox,
  Alert
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

// API
import {
  getFinancialSetting,
  saveFinancialSetting
} from "../../api/financialSetting";

export default function Settings() {
  /** -------------------------
   * Local state
   -------------------------- */
  const [basicInfo, setBasicInfo] = useState({
    totalAsset: 0,
    monthlyIncome: 0
  });

  const [expenses, setExpenses] = useState([]);
  const [investments, setInvestments] = useState([]);

  const [returnSetting, setReturnSetting] = useState({
    fixed: "",
    riskHigh: false,
    riskLow: false
  });

  // draft states
  const [editBasic, setEditBasic] = useState(false);
  const [editExpenses, setEditExpenses] = useState(false);
  const [editInvestments, setEditInvestments] = useState(false);

  const [draftBasic, setDraftBasic] = useState(basicInfo);
  const [draftExpenses, setDraftExpenses] = useState(expenses);
  const [draftInvestments, setDraftInvestments] = useState(investments);
  const [draftRisk, setDraftRisk] = useState(returnSetting);

  // errors / success
  const [expenseError, setExpenseError] = useState("");
  const [investError, setInvestError] = useState("");
  const [riskError, setRiskError] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /** -------------------------
   * Load user id
   -------------------------- */
  const storedUser = localStorage.getItem("user");
  const userId = storedUser ? JSON.parse(storedUser).user_id : null;

  /** -------------------------
   * GET financial setting from backend
   -------------------------- */
  useEffect(() => {
    async function load() {
      try {
        if (!userId) {
          setError("User not logged in");
          return;
        }

        const data = await getFinancialSetting(userId);

        // set states
        setBasicInfo({
          totalAsset: data.totalAsset,
          monthlyIncome: data.monthlyIncome
        });

        setExpenses(data.expenses || []);
        setInvestments(data.investments || []);

        setReturnSetting({
          fixed: data.fixedReturn || "",
          riskHigh: data.riskMode === "high",
          riskLow: data.riskMode === "low"
        });

        // update drafts
        setDraftBasic({
          totalAsset: data.totalAsset,
          monthlyIncome: data.monthlyIncome
        });

        setDraftExpenses(data.expenses || []);
        setDraftInvestments(data.investments || []);

        setDraftRisk({
          fixed: data.fixedReturn || "",
          riskHigh: data.riskMode === "high",
          riskLow: data.riskMode === "low"
        });

      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, [userId]);

  /** -------------------------
   * Calculation
   -------------------------- */
  const totalExpenses = draftExpenses.reduce(
    (sum, r) => sum + Number(r.amount || 0),
    0
  );

  const availableForInvest =
    Number(draftBasic.monthlyIncome || 0) - Number(totalExpenses || 0);

  const totalInvestments = draftInvestments.reduce(
    (sum, r) => sum + Number(r.amount || 0),
    0
  );

  /** -------------------------
   * Risk toggle handlers
   -------------------------- */
  const handleFixedChange = (v) => {
    setDraftRisk({
      fixed: v,
      riskHigh: false,
      riskLow: false
    });
  };

  const toggleHigh = () => {
    setDraftRisk({
      fixed: "",
      riskHigh: !draftRisk.riskHigh,
      riskLow: false
    });
  };

  const toggleLow = () => {
    setDraftRisk({
      fixed: "",
      riskHigh: false,
      riskLow: !draftRisk.riskLow
    });
  };

  /** -------------------------
   * POST updated setting → backend
   -------------------------- */
  async function handleSaveAll() {
    try {
      setSuccess("");
      setError("");

      const payload = {
        user_id: userId,
        totalAsset: Number(basicInfo.totalAsset),
        monthlyIncome: Number(basicInfo.monthlyIncome),
        monthlyExpense: totalExpenses, // 會一起更新
        expenses,
        investments,
        riskMode: returnSetting.riskHigh
          ? "high"
          : returnSetting.riskLow
          ? "low"
          : "fixed",
        fixedReturn: returnSetting.fixed || null
      };

      console.log("📤 Sending payload:", payload);

      const res = await saveFinancialSetting(payload);
      setSuccess("Settings updated successfully!");
    } catch (err) {
      setError(err.message || "Update failed");
    }
  }

  /** -------------------------
   * UI
   -------------------------- */
  return (
    <Box sx={{ p: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight={700} mb={3}>
          Settings
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* ---------------- BASIC INFO ---------------- */}
        <Typography variant="h6">Basic Info</Typography>

        {!editBasic ? (
          <>
            <Typography>Total Asset: {basicInfo.totalAsset}</Typography>
            <Typography>Monthly Income: {basicInfo.monthlyIncome}</Typography>

            <Button
              variant="outlined"
              sx={{ mt: 1 }}
              onClick={() => {
                setDraftBasic(basicInfo);
                setEditBasic(true);
              }}
            >
              Edit
            </Button>
          </>
        ) : (
          <>
            <TextField
              fullWidth
              label="Total Asset"
              sx={{ mt: 1 }}
              value={draftBasic.totalAsset}
              onChange={(e) =>
                setDraftBasic({
                  ...draftBasic,
                  totalAsset: Number(e.target.value)
                })
              }
            />

            <TextField
              fullWidth
              label="Monthly Income"
              sx={{ mt: 2 }}
              value={draftBasic.monthlyIncome}
              onChange={(e) =>
                setDraftBasic({
                  ...draftBasic,
                  monthlyIncome: Number(e.target.value)
                })
              }
            />

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  setBasicInfo(draftBasic);
                  setEditBasic(false);
                }}
              >
                Save
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => setEditBasic(false)}
              >
                Cancel
              </Button>
            </Box>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        {/* ---------------- EXPENSES ---------------- */}
        <Typography variant="h6">Expenses</Typography>

        {!editExpenses ? (
          <>
            {expenses.map((e, i) => (
              <Typography key={i}>
                {e.category}: {e.amount}
              </Typography>
            ))}

            <Button
              variant="outlined"
              sx={{ mt: 1 }}
              onClick={() => {
                setDraftExpenses(expenses);
                setEditExpenses(true);
                setExpenseError("");
              }}
            >
              Edit
            </Button>
          </>
        ) : (
          <>
            {draftExpenses.map((e, i) => (
              <Box key={i} sx={{ display: "flex", gap: 2, mt: 1 }}>
                <TextField
                  fullWidth
                  label="Category"
                  value={e.category}
                  onChange={(ev) => {
                    const rows = [...draftExpenses];
                    rows[i].category = ev.target.value;
                    setDraftExpenses(rows);
                  }}
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Amount"
                  value={e.amount}
                  onChange={(ev) => {
                    const rows = [...draftExpenses];
                    rows[i].amount = Number(ev.target.value);
                    setDraftExpenses(rows);

                    const newTotal = rows.reduce(
                      (s, r) => s + Number(r.amount || 0),
                      0
                    );

                    if (newTotal > draftBasic.monthlyIncome) {
                      setExpenseError(
                        "Total expenses exceed monthly income!"
                      );
                    } else {
                      setExpenseError("");
                    }
                  }}
                />

                <IconButton
                  onClick={() =>
                    setDraftExpenses(
                      draftExpenses.filter((_, idx) => idx !== i)
                    )
                  }
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            {expenseError && (
              <Typography color="error" sx={{ mt: 1 }}>
                {expenseError}
              </Typography>
            )}

            <Button
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
              onClick={() =>
                setDraftExpenses([
                  ...draftExpenses,
                  { category: "", amount: "" }
                ])
              }
            >
              Add Expense
            </Button>

            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                fullWidth
                disabled={Boolean(expenseError)}
                onClick={() => {
                  setExpenses(draftExpenses);
                  setEditExpenses(false);
                }}
              >
                Save
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => setEditExpenses(false)}
              >
                Cancel
              </Button>
            </Box>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        {/* ---------------- INVESTMENTS ---------------- */}
        <Typography variant="h6">Investments</Typography>

        {!editInvestments ? (
          <>
            {investments.map((inv, i) => (
              <Typography key={i}>
                {inv.type}: {inv.amount}
              </Typography>
            ))}

            <Typography sx={{ mt: 2 }}>
              Return Setting:
              {returnSetting.fixed
                ? ` Fixed ${returnSetting.fixed}%`
                : returnSetting.riskHigh
                ? " High Risk"
                : returnSetting.riskLow
                ? " Low Risk"
                : " —"}
            </Typography>

            <Button
              variant="outlined"
              sx={{ mt: 1 }}
              onClick={() => {
                setDraftInvestments(investments);
                setDraftRisk(returnSetting);
                setEditInvestments(true);
                setInvestError("");
                setRiskError("");
              }}
            >
              Edit
            </Button>
          </>
        ) : (
          <>
            {draftInvestments.map((inv, i) => (
              <Box key={i} sx={{ display: "flex", gap: 2, mt: 1 }}>
                <TextField
                  fullWidth
                  label="Type"
                  value={inv.type}
                  onChange={(ev) => {
                    const rows = [...draftInvestments];
                    rows[i].type = ev.target.value;
                    setDraftInvestments(rows);
                  }}
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Amount"
                  value={inv.amount}
                  onChange={(ev) => {
                    const rows = [...draftInvestments];
                    rows[i].amount = Number(ev.target.value);
                    setDraftInvestments(rows);

                    const totalInvest = rows.reduce(
                      (s, r) => s + Number(r.amount || 0),
                      0
                    );

                    if (totalInvest > availableForInvest) {
                      setInvestError(
                        "Total investments exceed available balance!"
                      );
                    } else {
                      setInvestError("");
                    }
                  }}
                />

                <IconButton
                  onClick={() =>
                    setDraftInvestments(
                      draftInvestments.filter((_, idx) => idx !== i)
                    )
                  }
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            {investError && (
              <Typography color="error" sx={{ mt: 1 }}>
                {investError}
              </Typography>
            )}

            <Button
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
              onClick={() =>
                setDraftInvestments([
                  ...draftInvestments,
                  { type: "", amount: "" }
                ])
              }
            >
              Add Investment
            </Button>

            {/* ---------------- Risk Setting ---------------- */}
            <Typography variant="h6" sx={{ mt: 3 }}>
              Risk / Return Setting
            </Typography>

            <TextField
              label="Fixed Annual Return (%)"
              type="number"
              fullWidth
              sx={{ mt: 2 }}
              value={draftRisk.fixed}
              disabled={draftRisk.riskHigh || draftRisk.riskLow}
              onChange={(e) => handleFixedChange(e.target.value)}
              placeholder="e.g., 5"
            />

            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={draftRisk.riskHigh}
                    onChange={toggleHigh}
                  />
                }
                label="High Risk (random)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={draftRisk.riskLow}
                    onChange={toggleLow}
                  />
                }
                label="Low Risk (random)"
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                fullWidth
                disabled={Boolean(investError)}
                onClick={() => {
                  setInvestments(draftInvestments);
                  setReturnSetting(draftRisk);
                  setEditInvestments(false);
                }}
              >
                Save
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => setEditInvestments(false)}
              >
                Cancel
              </Button>
            </Box>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        {/* ---------------- SAVE ALL ---------------- */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleSaveAll}
        >
          Save All Settings
        </Button>
      </Container>
    </Box>
  );
}
