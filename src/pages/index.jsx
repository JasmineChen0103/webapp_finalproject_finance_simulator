import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Index() {
    const navigate = useNavigate();

    return (
        // 最外層 Box：整頁高度 100vh，垂直排列「Navbar + 主內容」
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* 上排導覽列 */}
            <AppBar position="static" elevation={0}>
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    {/* 左邊 Logo / App 名稱 */}
                    <Typography variant="h6" component="div">
                        Finance Simulator
                    </Typography>

                    {/* 右邊導覽按鈕區 */}
                    <Box>
                        <Button color="inherit" onClick={() => navigate("/login")}>
                            Login
                        </Button>
                        <Button color="inherit" onClick={() => navigate("/signup")}>
                            Sign Up
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* 主內容區：佔滿剩餘空間，置中排版 */}
            <Box
                sx={{
                    flexGrow: 1,                     // 把剩下的高度全部吃掉
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",        // 垂直置中
                    alignItems: "center",            // 水平置中
                    gap: 2,
                }}
            >
                <Typography variant="h4">Welcome to Finance App</Typography>

                <Button variant="contained" onClick={() => navigate("/login")}>
                    Go to Login
                </Button>
            </Box>
        </Box>
    );
}
