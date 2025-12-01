import { Box } from "@mui/material";
import Navbar from "./Navbar";

export default function MainLayout({ children }) {
    return (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* 全站共用 Navbar */}
            <Navbar />

            {/* 主內容區 */}
            <Box sx={{ flexGrow: 1, p: 2 }}>
                {children}
            </Box>
        </Box>
    );
}
