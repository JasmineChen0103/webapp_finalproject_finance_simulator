import { createContext, useContext, useState } from "react";

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
    const [data, setData] = useState({
        // Step1
        totalAsset: "",
        monthlyIncome: "",

        // Step2
        expenses: [],

        // Step3
        investments: [],
        fixedReturn: "",
        riskMode: "",
    });

    return (
        <OnboardingContext.Provider value={{ data, setData }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    return useContext(OnboardingContext);
}
