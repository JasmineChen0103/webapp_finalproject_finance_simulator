import { createContext, useContext, useState } from "react";

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
    const [data, setData] = useState({
        totalAsset: "",
        monthlyIncome: "",
        expenses: [],
        investments: []
    });

    const update = (newData) => setData(prev => ({ ...prev, ...newData }));

    return (
        <OnboardingContext.Provider value={{ data, update }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    return useContext(OnboardingContext);
}
