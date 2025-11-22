import { useState } from "react";
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    IconButton,
    Alert,
    MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

export default function Step3Invest() {
    const navigate = useNavigate();

    // 假設來自 Step2 的剩餘可投資金額
    const availableMoney = 30000;

    const [rows, setRows] = useState([{ type: "", amount: "" }]);
    const [error, setError] = useState("");

    const totalInvest = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    const addRow = () => setRows([...rows, { type: "", amount: "" }]);

    const deleteRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

    const updateRow = (i, key, value) => {
        const newRows = [...rows];
        newRows[i][key] = value;
        setRows(newRows);

        const newTotal = newRows.reduce((sum, r) => sum + Number(r.amount || 0), 0);

        if (newTotal > availableMoney) {
            setError("Your investment amount exceeds available balance!");
        } else {
            setError("");
        }
    };

    const handleNext = () => {
        if (totalInvest > availableMoney) {
            setError("Your investment amount exceeds available balance!");
            return;
        }

        setError("");
        console.log("Step3 Investments:", rows);
        navigate("/onboarding/step4");
    };

    const handleBack = () => {
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
                <Typography variant="h5" textAlign="center" mb={3} fontWeight={600}>
                    Step 3 — Investment Settings
                </Typography>

                {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

                {rows.map((row, idx) => {
                    const percent =
                        availableMoney > 0 && Number(row.amount) > 0
                            ? ((Number(row.amount) / availableMoney) * 100).toFixed(1)
                            : "—";

                    return (
                        <Box
                            sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}
                            key={idx}
                        >
                            {/* 投資種類 */}
                            <TextField
                                select
                                label="Investment Type"
                                fullWidth
                                value={row.type}
                                onChange={(e) => updateRow(idx, "type", e.target.value)}
                            >
                                <MenuItem value="stocks">Stocks</MenuItem>
                                <MenuItem value="etf">ETF</MenuItem>
                                <MenuItem value="crypto">Crypto</MenuItem>
                                <MenuItem value="fund">Fund</MenuItem>
                            </TextField>

                            {/* 金額輸入 */}
                            <TextField
                                type="number"
                                label="Amount"
                                fullWidth
                                value={row.amount}
                                onChange={(e) => updateRow(idx, "amount", e.target.value)}
                            />

                            {/* 百分比 (%) 顯示 */}
                            <Typography sx={{ width: 60, textAlign: "center" }}>
                                {percent}%
                            </Typography>

                            {/* 刪除 */}
                            <IconButton color="error" onClick={() => deleteRow(idx)}>
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    );
                })}

                <Button startIcon={<AddIcon />} onClick={addRow} variant="contained">
                    Add Investment
                </Button>

                <Typography variant="h6" sx={{ mt: 2 }}>
                    Total Investment: {totalInvest}
                </Typography>

                {/* Back / Next 按鈕 */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        mt: 4,
                    }}
                >
                    <Button variant="outlined" fullWidth onClick={handleBack}>
                        Back
                    </Button>

                    <Button variant="contained" fullWidth onClick={handleNext}>
                        Next
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}
