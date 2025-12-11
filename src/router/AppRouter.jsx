import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Index from "../pages/index";
import Step1Basic from "../pages/onboarding/Step1Basic";
import Step2Expenses from "../pages/onboarding/Step2Expenses";
import Step3Invest from "../pages/onboarding/Step3Invest";
import Step4Review from "../pages/onboarding/Step4Review";
import Dashboard from "../pages/dashboard/Dashboard";
import Settings from "../pages/settings/Settings";
import MainLayout from "../layout/MainLayout";




export default function AppRouter() {
    return (
        <Routes>

            {/* 不需要 Navbar 的頁面 */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/onboarding/step1" element={<Step1Basic />} />
            <Route path="/onboarding/step2" element={<Step2Expenses />} />
            <Route path="/onboarding/step3" element={<Step3Invest />} />
            <Route path="/onboarding/step4" element={<Step4Review />} />

            {/* 需要 Navbar 的頁面（包在 MainLayout 裡） */}
            <Route
                path="/dashboard"
                element={
                    <MainLayout>
                        <Dashboard />
                    </MainLayout>
                }
            />


            <Route
                path="/settings"
                element={
                    <MainLayout>
                        <Settings />
                    </MainLayout>
                }
            />

        </Routes>
    );
}
