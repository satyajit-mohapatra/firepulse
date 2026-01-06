import React from 'react';
import { useWizard, WizardStep } from '../../contexts/WizardContext';

const steps = [
    { id: 1, name: 'Financial Inputs', description: 'Core stats & income' },
    { id: 2, name: 'FIRE Projections', description: 'Domestic results' },
];

const WizardProgress: React.FC = () => {
    const { currentStep, goToStep } = useWizard();

    return (
        <div className="w-full py-8">
            <div className="relative flex items-center justify-between">
                {/* Progress Line */}
                <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-gray-200 dark:bg-gray-700" />
                <div
                    className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-blue-600 transition-all duration-500 ease-in-out dark:bg-blue-400"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                />

                {/* Steps */}
                {steps.map((step) => {
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <button
                                onClick={() => isCompleted && goToStep(step.id as WizardStep)}
                                disabled={!isCompleted && !isActive}
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${isActive
                                    ? 'border-blue-600 bg-white text-blue-600 dark:border-blue-400 dark:bg-gray-900 dark:text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                                    : isCompleted
                                        ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400'
                                        : 'border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400'
                                    }`}
                            >
                                {isCompleted ? (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className="text-sm font-bold">{step.id}</span>
                                )}
                            </button>
                            <div className="absolute top-12 flex flex-col items-center text-center">
                                <span className={`text-xs font-semibold whitespace-nowrap ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {step.name}
                                </span>
                                <span className="hidden text-[10px] text-gray-400 dark:text-gray-500 sm:block">
                                    {step.description}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WizardProgress;
