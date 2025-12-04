import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./router/AppRouter";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

import { OnboardingProvider } from "./context/financialSetting";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <OnboardingProvider>
        <AppRouter />
      </OnboardingProvider>
    </BrowserRouter>
  </React.StrictMode>
);
