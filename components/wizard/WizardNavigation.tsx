import React from 'react';
import { useWizard } from '../../contexts/WizardContext';

const WizardNavigation: React.FC = () => {
    const { currentStep, nextStep, prevStep, isFirstStep, isLastStep, canProgress } = useWizard();

    return (
        <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-800">
            <button
                onClick={prevStep}
                disabled={isFirstStep}
                className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${isFirstStep
                    ? 'cursor-not-allowed opacity-0'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
                    }`}
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
            </button>

            {!isLastStep ? (
                <button
                    onClick={nextStep}
                    disabled={!canProgress}
                    className={`flex items-center gap-2 rounded-lg px-8 py-2.5 text-sm font-semibold transition-all ${!canProgress
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95'
                        }`}
                >
                    Continue
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            ) : <div />}
        </div>
    );
};

export default WizardNavigation;
