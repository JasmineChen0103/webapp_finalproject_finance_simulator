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
    };

    const handleNext = () => {
        if (totalInvest > availableMoney) {
            setError("Your investment amount exceeds available balance!");
            return;
        }

        setError("");

        // TODO: 送出資料
        console.log("Step3 Investments:", rows);

        navigate("/onboarding/step4");
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

                {rows.map((row, idx) => (
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }} key={idx}>
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

                        <TextField
                            type="number"
                            label="Amount"
                            fullWidth
                            value={row.amount}
                            onChange={(e) => updateRow(idx, "amount", e.target.value)}
                        />

                        <IconButton color="error" onClick={() => deleteRow(idx)}>
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                ))}

                <Button startIcon={<AddIcon />} onClick={addRow} variant="contained">
                    Add Investment
                </Button>

                <Typography variant="h6" sx={{ mt: 2 }}>
                    Total Investment: {totalInvest}
                </Typography>

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
