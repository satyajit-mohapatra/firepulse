import React from 'react';
import { useWizard } from '../../contexts/WizardContext';
import WizardProgress from './WizardProgress';
import WizardNavigation from './WizardNavigation';
import Phase1Inputs from './Phase1Inputs';
import Phase2Results from './Phase2Results';
import { FinancialData, CalculationResults, CurrencyCode, SpouseData } from '../../types';

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
}) => {
    const { currentStep } = useWizard();

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Phase1Inputs
                        data={data}
                        updateData={updateData}
                        updateSpouseData={updateSpouseData}
                        currencySymbol={currencySymbol}
                        longevityTooltip={longevityTooltip}
                        currency={currency}
                        setCurrency={setCurrency}
                    />
                );
            case 2:
                return (
                    <Phase2Results
                        data={data}
                        results={results}
                        currency={currency}
                        currencySymbol={currencySymbol}
                        updateData={updateData}
                        currentAllocation={currentAllocation}
                        savingsRate={savingsRate}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex-1 flex flex-col">
            <WizardProgress />
            <div className="flex-1 py-6">
                {renderStep()}
            </div>
            <WizardNavigation />
        </div>
    );
};

export default WizardContainer;
