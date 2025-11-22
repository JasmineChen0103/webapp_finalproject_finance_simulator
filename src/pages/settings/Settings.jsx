import { useState } from "react";
import {
    Box,
    Container,
    Typography,
    Button,
    Divider,
    TextField,
    IconButton
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Settings() {
    /** -------------------------
     *  假資料（正式版從後端拿）
     -------------------------- */
    const [basicInfo, setBasicInfo] = useState({
        totalAsset: 100000,
        monthlyIncome: 50000
    });

    const [expenses, setExpenses] = useState([
        { category: "Food", amount: 5000 },
        { category: "Transport", amount: 2000 }
    ]);

    const [investments, setInvestments] = useState([
        { type: "Stocks", amount: 10000 },
        { type: "ETF", amount: 5000 }
    ]);

    /** -------------------------
     *  Editing flags
     -------------------------- */
    const [editBasic, setEditBasic] = useState(false);
    const [editExpenses, setEditExpenses] = useState(false);
    const [editInvestments, setEditInvestments] = useState(false);

    /** -------------------------
     *  Draft states（編輯中用）
     -------------------------- */
    const [draftBasic, setDraftBasic] = useState(basicInfo);
    const [draftExpenses, setDraftExpenses] = useState(expenses);
    const [draftInvestments, setDraftInvestments] = useState(investments);

    /** -------------------------
     *  Error states
     -------------------------- */
    const [expenseError, setExpenseError] = useState("");
    const [investError, setInvestError] = useState("");

    /** -------------------------
     *  計算邏輯
     -------------------------- */
    const totalExpenses = draftExpenses.reduce(
        (sum, r) => sum + Number(r.amount || 0),
        0
    );

    const availableForInvest =
        draftBasic.monthlyIncome - totalExpenses;

    const totalInvestments = draftInvestments.reduce(
        (sum, r) => sum + Number(r.amount || 0),
        0
    );

    return (
        <Box sx={{ p: 4 }}>
            <Container maxWidth="md">

                <Typography variant="h4" fontWeight={700} mb={3}>
                    Settings
                </Typography>

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
                            <Box sx={{ display: "flex", gap: 2, mt: 1 }} key={i}>
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
                                            setExpenseError("Total expenses exceed monthly income!");
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
                                {inv.type}: {inv.amount} (
                                {(
                                    (inv.amount /
                                        (basicInfo.monthlyIncome -
                                            expenses.reduce((s, r) => s + r.amount, 0))) *
                                    100
                                ).toFixed(1)}%)
                            </Typography>
                        ))}

                        <Button
                            variant="outlined"
                            sx={{ mt: 1 }}
                            onClick={() => {
                                setDraftInvestments(investments);
                                setEditInvestments(true);
                                setInvestError("");
                            }}
                        >
                            Edit
                        </Button>
                    </>
                ) : (
                    <>
                        {draftInvestments.map((inv, i) => (
                            <Box sx={{ display: "flex", gap: 2, mt: 1 }} key={i}>
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

                                        const available =
                                            draftBasic.monthlyIncome -
                                            draftExpenses.reduce(
                                                (s, r) => s + Number(r.amount || 0),
                                                0
                                            );

                                        if (totalInvest > available) {
                                            setInvestError(
                                                "Total investments exceed your disposable income!"
                                            );
                                        } else {
                                            setInvestError("");
                                        }
                                    }}
                                />

                                {/* 顯示百分比 (%) */}
                                <Typography sx={{ minWidth: "60px", mt: 1 }}>
                                    {availableForInvest > 0
                                        ? `${((inv.amount / availableForInvest) * 100).toFixed(1)}%`
                                        : "—"}
                                </Typography>

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

                        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                            <Button
                                variant="contained"
                                fullWidth
                                disabled={Boolean(investError)}
                                onClick={() => {
                                    setInvestments(draftInvestments);
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

            </Container>
        </Box>
    );
}
