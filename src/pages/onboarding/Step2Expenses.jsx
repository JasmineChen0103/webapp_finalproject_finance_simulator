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

export default function Step2Expenses() {
    const navigate = useNavigate();

    // 假設收入（正式版請從 Step1 帶入）
    const monthlyIncome = 50000;

    const [rows, setRows] = useState([
        { category: "", amount: "" },
    ]);
    const [error, setError] = useState("");

    // 計算總支出
    const totalExpenses = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    // 新增 row
    const addRow = () => {
        setRows([...rows, { category: "", amount: "" }]);
    };

    // 更新 row
    const updateRow = (index, key, value) => {
        const newRows = [...rows];
        newRows[index][key] = value;
        setRows(newRows);
    };

    // 刪除 row
    const deleteRow = (index) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
    };

    const handleNext = () => {
        if (totalExpenses > monthlyIncome) {
            setError("Your monthly expenses exceed your monthly income!");
            return;
        }
        setError("");

        // TODO: 送出資料給後端
        console.log("Step2 Expenses:", rows);

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
                <Typography variant="h5" fontWeight={600} textAlign="center" mb={3}>
                    Step 2 — Monthly Expenses
                </Typography>

                {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

                {rows.map((row, idx) => (
                    <Box key={idx} sx={{ display: "flex", gap: 2, mb: 2 }}>
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
                        <IconButton onClick={() => deleteRow(idx)} color="error">
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

                <Typography variant="h6">Total: {totalExpenses}</Typography>

                <Button fullWidth variant="contained" sx={{ mt: 3 }} onClick={handleNext}>
                    Next
                </Button>
            </Container>
        </Box>
    );
}
