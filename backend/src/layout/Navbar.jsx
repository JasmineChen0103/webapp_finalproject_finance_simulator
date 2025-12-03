import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();

    return (
        <AppBar position="static" elevation={0}>
            <Toolbar sx={{ justifyContent: "space-between" }}>

                {/* 左邊 Logo */}
                <Typography
                    variant="h6"
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate("/")}
                >
                    Finance Simulator
                </Typography>

                {/* 右邊的導航按鈕 */}
                <Box sx={{ display: "flex", gap: 2 }}>
                    {/* 主要功能 */}
                    <Button color="inherit" onClick={() => navigate("/dashboard")}>
                        Dashboard
                    </Button>
                    <Button color="inherit" onClick={() => navigate("/scenario")}>
                        Scenario
                    </Button>
                    <Button color="inherit" onClick={() => navigate("/settings")}>
                        Settings
                    </Button>

                    {/* 登入 / 註冊 */}
                    <Button color="inherit" onClick={() => navigate("/login")}>
                        Login
                    </Button>
                    <Button color="inherit" onClick={() => navigate("/signup")}>
                        Sign Up
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
