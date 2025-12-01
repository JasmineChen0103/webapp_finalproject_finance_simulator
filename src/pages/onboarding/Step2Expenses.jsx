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

    const [rows, setRows] = useState([{ category: "", amount: "" }]);
    const [error, setError] = useState("");

    // 計算總支出
    const totalExpenses = rows.reduce(
        (sum, r) => sum + Number(r.amount || 0),
        0
    );

    // 新增 row
    const addRow = () => {
        setRows([...rows, { category: "", amount: "" }]);
    };

    // 更新 row
    const updateRow = (index, key, value) => {
        const newRows = [...rows];
        newRows[index][key] = value;
        setRows(newRows);

        // 若修改後超出收入 → 警告
        if (key === "amount") {
            const newTotal = newRows.reduce(
                (sum, r) => sum + Number(r.amount || 0),
                0
            );
            if (newTotal > monthlyIncome) {
                setError("Your monthly expenses exceed your monthly income!");
            } else {
                setError("");
            }
        }
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

        console.log("Step2 Expenses:", rows);

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
                            onChange={(e) =>
                                updateRow(idx, "category", e.target.value)
                            }
                        />

                        <TextField
                            fullWidth
                            type="number"
                            label="Amount"
                            value={row.amount}
                            onChange={(e) =>
                                updateRow(idx, "amount", e.target.value)
                            }
                        />

                        <IconButton
                            onClick={() => deleteRow(idx)}
                            color="error"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                ))}

                {/* Add 按鈕 */}
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

                {/* 下方兩顆按鈕：Back / Next */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        mt: 4,
                    }}
                >
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleBack}
                    >
                        Back
                    </Button>

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleNext}
                    >
                        Next
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}
