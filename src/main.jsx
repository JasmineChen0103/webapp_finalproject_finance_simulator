import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./router/AppRouter";
import { BrowserRouter } from "react-router-dom";
import { OnboardingProvider } from "./context/OnboardingContext";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <OnboardingProvider>
          <AppRouter />
        </OnboardingProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
