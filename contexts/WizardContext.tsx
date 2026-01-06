import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FinancialData } from '../types';

export type WizardStep = 1 | 2;

interface WizardContextType {
    currentStep: WizardStep;
    goToStep: (step: WizardStep) => void;
    nextStep: () => void;
    prevStep: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    canProgress: boolean;
    setCanProgress: (can: boolean) => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const WizardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentStep, setCurrentStep] = useState<WizardStep>(1);
    const [canProgress, setCanProgress] = useState<boolean>(true);

    const goToStep = (step: WizardStep) => {
        setCurrentStep(step);
    };

    const nextStep = () => {
        if (currentStep < 2) {
            setCurrentStep((prev) => (prev + 1) as WizardStep);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as WizardStep);
        }
    };

    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === 2;

    return (
        <WizardContext.Provider
            value={{
                currentStep,
                goToStep,
                nextStep,
                prevStep,
                isFirstStep,
                isLastStep,
                canProgress,
                setCanProgress,
            }}
        >
            {children}
        </WizardContext.Provider>
    );
};

export const useWizard = () => {
    const context = useContext(WizardContext);
    if (context === undefined) {
        throw new Error('useWizard must be used within a WizardProvider');
    }
    return context;
};
