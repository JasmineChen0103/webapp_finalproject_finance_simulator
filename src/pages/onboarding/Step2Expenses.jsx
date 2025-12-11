import { useState } from "react";
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    IconButton,
    Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";


import { useOnboarding } from "../../context/OnboardingContext";

export default function Step2Expenses() {
    const navigate = useNavigate();

    // 🔧【新增】從 Step1 拿 monthlyIncome，並存 Step2 結果
    const { data, update } = useOnboarding();

    const [rows, setRows] = useState(data.expenses?.length ? data.expenses : [{ category: "", amount: "" }]);
    const [error, setError] = useState("");

    // 計算總支出
    const totalExpenses = rows.reduce(
        (sum, r) => sum + Number(r.amount || 0),
        0
    );

    const addRow = () => {
        setRows([...rows, { category: "", amount: "" }]);
    };

    const updateRow = (index, key, value) => {
        const newRows = [...rows];
        newRows[index][key] = value;
        setRows(newRows);

        // 使用 data.monthlyIncome
        const newTotal = newRows.reduce(
            (sum, r) => sum + Number(r.amount || 0),
            0
        );

        if (newTotal > Number(data.monthlyIncome)) {
            setError("Your monthly expenses exceed your monthly income!");
        } else {
            setError("");
        }
    };

    const deleteRow = (index) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
    };

    const handleNext = () => {
        if (totalExpenses > Number(data.monthlyIncome)) {
            setError("Your monthly expenses exceed your monthly income!");
            return;
        }

        update({
            expenses: rows,
            monthlyExpense: totalExpenses
        });

        console.log("Step2 Saved:", rows);

        navigate("/onboarding/step3");
    };

    const handleBack = () => {
        navigate("/onboarding/step1");
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
                <Typography
                    variant="h5"
                    fontWeight={600}
                    textAlign="center"
                    mb={3}
                >
                    Step 2 — Monthly Expenses
                </Typography>

                {error && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* 動態 rows */}
                {rows.map((row, idx) => (
                    <Box
                        key={idx}
                        sx={{ display: "flex", gap: 2, mb: 2 }}
                    >
                        <TextField
                            fullWidth
                            label="Category"
                            value={row.category}
                            onChange={(e) => updateRow(idx, "category", e.target.value)}
                        />

                        <TextField
                            fullWidth
                            type="number"
                            label="Amount"
                            value={row.amount}
                            onChange={(e) => updateRow(idx, "amount", e.target.value)}
                        />

                        <IconButton color="error" onClick={() => deleteRow(idx)}>
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                ))}

                <Button
                    startIcon={<AddIcon />}
                    onClick={addRow}
                    variant="contained"
                    sx={{ mb: 3 }}
                >
                    Add Expense
                </Button>

                <Typography variant="h6">
                    Total: {totalExpenses}
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        mt: 4,
                    }}
                >
                    <Button fullWidth variant="outlined" onClick={handleBack}>
                        Back
                    </Button>

                    <Button fullWidth variant="contained" onClick={handleNext}>
                        Next
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}
