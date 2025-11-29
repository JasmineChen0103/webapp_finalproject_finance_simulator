import { useState } from "react";
import {
    Avatar,
    Button,
    TextField,
    Box,
    Typography,
    Container,
    Link,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useNavigate } from "react-router-dom";

export default function Signup() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");

    const [pwdError, setPwdError] = useState(""); // 用來顯示錯誤訊息

    const handleSignup = (e) => {
        e.preventDefault();

        // 檢查兩次密碼是否一致
        if (password !== confirmPwd) {
            setPwdError("Passwords do not match.");
            return;
        }

        setPwdError(""); // 清除錯誤
        console.log("Signup:", email, password);

        // TODO: 呼叫後端 API

        navigate("/login");
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
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                        <PersonAddIcon />
                    </Avatar>

                    <Typography component="h1" variant="h5">
                        Sign Up
                    </Typography>

                    <Box component="form" onSubmit={handleSignup} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            margin="normal"
                            required
                            label="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <TextField
                            fullWidth
                            margin="normal"
                            required
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <TextField
                            fullWidth
                            margin="normal"
                            required
                            label="Confirm Password"
                            type="password"
                            value={confirmPwd}
                            error={pwdError !== ""}       // 錯誤時變紅
                            helperText={pwdError}         // 錯誤訊息
                            onChange={(e) => setConfirmPwd(e.target.value)}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Create Account
                        </Button>

                        <Link href="/login" variant="body2">
                            Already have an account? Log In
                        </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
