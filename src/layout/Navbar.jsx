import { AppBar, Toolbar, Button, Box, Typography, IconButton, Menu, MenuItem, Avatar } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleOpenMenu = (e) => {
        setAnchorEl(e.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        // TODO: 清除 token、清除 user 資料
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        console.log("Logged out");

        handleCloseMenu();
        navigate("/");   // ← 登出回首頁
    };

    return (
        <AppBar position="static" elevation={0}>
            <Toolbar sx={{ justifyContent: "space-between" }}>

                {/* 左側 Logo */}
                <Typography
                    variant="h6"
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate("/dashboard")}
                >
                    Finance Simulator
                </Typography>

                {/* 右側導頁按鈕 */}
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Button color="inherit" onClick={() => navigate("/dashboard")}>Dashboard</Button>

                    {/* Avatar 下拉選單 */}
                    <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
                        <Avatar />
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleCloseMenu}
                    >
                        <MenuItem onClick={() => { handleCloseMenu(); navigate("/settings"); }}>Profile / Settings</MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
