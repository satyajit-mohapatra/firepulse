import React from 'react';
import { useWizard } from '../../contexts/WizardContext';
import { useWizardPersistence } from '../../hooks/useWizardPersistence';
import { useEffect } from 'react';
import StepperProgress from './StepperProgress';
import WizardNavigation from './WizardNavigation';
import PersonalProfile from './PersonalProfile';
import FinancialDetails from './FinancialDetails';
import Phase2Results from './Phase2Results';
import { FinancialData, CalculationResults, CurrencyCode, SpouseData } from '../../types';
import { InternationalScenario, ScenarioResults } from '../../types/internationalPlanning';

interface WizardContainerProps {
    data: FinancialData;
    results: CalculationResults;
    currency: CurrencyCode;
    currencySymbol: string;
    updateData: (key: keyof FinancialData, value: any) => void;
    updateSpouseData: (key: keyof SpouseData, value: any) => void;
    currentAllocation: any;
    savingsRate: number;
    longevityTooltip: React.ReactNode;
    setCurrency: (currency: CurrencyCode) => void;
    uiMode: 'basic' | 'advanced';
    setUiMode: (mode: 'basic' | 'advanced') => void;
    internationalScenario: InternationalScenario;
    setInternationalScenario: React.Dispatch<React.SetStateAction<InternationalScenario>>;
    internationalResults: ScenarioResults;
}

const WizardContainer: React.FC<WizardContainerProps> = ({
    data,
    results,
    currency,
    currencySymbol,
    updateData,
    updateSpouseData,
    currentAllocation,
    savingsRate,
    longevityTooltip,
    setCurrency,
    uiMode,
    setUiMode,
    internationalScenario,
    setInternationalScenario,
    internationalResults,
}) => {
    const { currentStep } = useWizard();
    const { saveState } = useWizardPersistence();

    // Auto-save state changes (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            saveState(
                currentStep,
                data,
                internationalScenario,
                uiMode,
                currency
            );
        }, 1000);

        return () => clearTimeout(timer);
    }, [currentStep, data, internationalScenario, uiMode, currency, saveState]);

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                // Step 1: Personal Profile (Basic Info)
                return (
                    <PersonalProfile
                        data={data}
                        updateData={updateData}
                        updateSpouseData={updateSpouseData}
                        longevityTooltip={longevityTooltip}
                    />
                );
            case 2:
                // Step 2: Financial Details (Basic vs Advanced toggle)
                return (
                    <FinancialDetails
                        data={data}
                        updateData={updateData}
                        updateSpouseData={updateSpouseData}
                        currencySymbol={currencySymbol}
                        currency={currency}
                        setCurrency={setCurrency}
                        uiMode={uiMode}
                        setUiMode={setUiMode}
                        internationalScenario={internationalScenario}
                        setInternationalScenario={setInternationalScenario}
                    />
                );
            case 3:
                // Step 3: Results & Analysis
                return (
                    <Phase2Results
                        data={data}
                        results={results}
                        currency={currency}
                        currencySymbol={currencySymbol}
                        updateData={updateData}
                        currentAllocation={currentAllocation}
                        savingsRate={savingsRate}
                        uiMode={uiMode}
                        internationalScenario={internationalScenario}
                        internationalResults={internationalResults}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex-1 flex flex-col">
            {/* Premium Stepper Progress */}
            <StepperProgress />

            {/* Step Content */}
            <div className="flex-1 py-2 sm:py-4">
                {renderStep()}
            </div>

            {/* Navigation */}
            <WizardNavigation />
        </div>
    );
};

export default WizardContainer;
