import React from 'react';
import { useWizard, WizardStep } from '../../contexts/WizardContext';

interface Step {
    id: number;
    name: string;
    shortName: string;
    icon: string;
}

const steps: Step[] = [
    { id: 1, name: 'Profile', shortName: 'Profile', icon: '👤' },
    { id: 2, name: 'Finances', shortName: 'Finances', icon: '💰' },
    { id: 3, name: 'Results', shortName: 'Results', icon: '📊' },
];

const StepperProgress: React.FC = () => {
    const { currentStep, goToStep } = useWizard();

    return (
        <div className="w-full py-4 sm:py-6">
            {/* Unified Stepper - Works for both mobile and desktop */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 px-4 max-w-lg mx-auto">
                {steps.map((step, index) => {
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;
                    const isClickable = step.id <= currentStep + 1;

                    return (
                        <React.Fragment key={step.id}>
                            <button
                                onClick={() => isClickable && goToStep(step.id as WizardStep)}
                                disabled={!isClickable}
                                className={`
                                    flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300
                                    ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-300/40'
                                        : isCompleted
                                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                            : 'bg-slate-100 text-slate-400'
                                    }
                                    ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}
                                `}
                            >
                                {isCompleted ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span className="text-sm">{step.icon}</span>
                                )}
                                <span className="text-xs sm:text-sm font-semibold">{step.name}</span>
                            </button>

                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className={`hidden sm:block w-8 h-0.5 rounded-full transition-colors duration-300 ${currentStep > step.id ? 'bg-emerald-400' : 'bg-slate-200'
                                    }`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default StepperProgress;
