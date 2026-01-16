import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FinancialData } from '../types';

export type WizardStep = 1 | 2 | 3;

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

export const WizardProvider: React.FC<{
    children: ReactNode;
    initialStep?: WizardStep;
    onStepChange?: (step: WizardStep) => void;
}> = ({ children, initialStep = 1, onStepChange }) => {
    const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep);
    const [canProgress, setCanProgress] = useState<boolean>(true);

    // Sync internal state if initialStep changes (e.g. from async load)
    useEffect(() => {
        if (initialStep) setCurrentStep(initialStep);
    }, [initialStep]);

    const handleStepChange = (newStep: WizardStep) => {
        setCurrentStep(newStep);
        onStepChange?.(newStep);
    };

    const goToStep = (step: WizardStep) => {
        handleStepChange(step);
    };

    const nextStep = () => {
        if (currentStep < 3) {
            handleStepChange((currentStep + 1) as WizardStep);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            handleStepChange((currentStep - 1) as WizardStep);
        }
    };

    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === 3;

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
