import React from 'react';
import { useWizard, WizardStep } from '../../contexts/WizardContext';

const steps = [
    { id: 1, name: 'Financial Inputs', description: 'Core stats & income' },
    { id: 2, name: 'FIRE Projections', description: 'Your projections' },
];

const WizardProgress: React.FC = () => {
    const { currentStep, goToStep } = useWizard();

    return (
        <div className="w-full py-3 sm:py-6">
            <div className="relative flex items-center justify-between max-w-xs sm:max-w-md mx-auto px-2 sm:px-4">
                {/* Progress Line Background */}
                <div className="absolute left-6 right-6 sm:left-8 sm:right-8 top-4 sm:top-5 h-0.5 sm:h-1 rounded-full bg-slate-200" />

                {/* Progress Line Fill */}
                <div
                    className="absolute left-6 sm:left-8 top-4 sm:top-5 h-0.5 sm:h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                    style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - ${currentStep === 1 ? '0px' : '24px'})` }}
                />

                {/* Steps */}
                {steps.map((step) => {
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <button
                                onClick={() => goToStep(step.id as WizardStep)}
                                className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 transition-all duration-300 font-bold text-xs sm:text-sm ${isActive
                                    ? 'border-indigo-500 bg-white text-indigo-600 shadow-lg shadow-indigo-500/30 scale-110'
                                    : isCompleted
                                        ? 'border-indigo-500 bg-indigo-500 text-white cursor-pointer hover:scale-105'
                                        : 'border-slate-300 bg-white text-slate-400'
                                    }`}
                            >
                                {isCompleted ? (
                                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <span>{step.id}</span>
                                )}
                            </button>
                            <div className="absolute top-10 sm:top-12 flex flex-col items-center text-center w-20 sm:w-24">
                                <span className={`text-[10px] sm:text-xs font-bold whitespace-nowrap ${isActive ? 'text-indigo-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                                    }`}>
                                    {step.name}
                                </span>
                                <span className="hidden sm:block text-[10px] text-slate-400 mt-0.5">
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
