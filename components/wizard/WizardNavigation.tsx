import React from 'react';
import { useWizard } from '../../contexts/WizardContext';

const stepLabels = ['Profile', 'Finances', 'Results'];

const WizardNavigation: React.FC = () => {
    const { currentStep, nextStep, prevStep, isFirstStep, isLastStep, canProgress } = useWizard();

    return (
        <nav aria-label="Wizard Navigation" className="mt-6 sm:mt-8 flex items-center justify-between border-t pt-4 sm:pt-6" style={{ borderColor: 'var(--fp-border-light)' }}>
            {/* Back Button */}
            <button
                onClick={prevStep}
                disabled={isFirstStep}
                aria-label={`Go back to ${stepLabels[currentStep - 2] || 'Previous Step'}`}
                className={`group flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${isFirstStep
                    ? 'opacity-0 pointer-events-none'
                    : 'bg-white/80 backdrop-blur-sm text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-white hover:shadow-lg hover:scale-105 active:scale-95'
                    }`}
            >
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                </div>
                <span className="hidden sm:inline">Back to {stepLabels[currentStep - 2] || 'Previous'}</span>
                <span className="sm:hidden">Back</span>
            </button>

            {/* Step Indicator Pills */}
            <div className="flex items-center gap-2 sm:gap-3">
                {[1, 2, 3].map((step) => (
                    <div
                        key={step}
                        role="progressbar"
                        aria-valuenow={currentStep}
                        aria-valuemin={1}
                        aria-valuemax={3}
                        aria-label={`Step ${step} of 3: ${stepLabels[step - 1]}`}
                        className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${step === currentStep
                            ? 'w-6 sm:w-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                            : step < currentStep
                                ? 'w-2 sm:w-3 bg-emerald-400'
                                : 'w-2 sm:w-3 bg-slate-200'
                            }`}
                    />
                ))}
            </div>

            {/* Next/Continue Button */}
            {!isLastStep ? (
                <button
                    onClick={nextStep}
                    disabled={!canProgress}
                    aria-label={`Continue to ${stepLabels[currentStep] || 'Next Step'}`}
                    className={`group flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl px-4 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${!canProgress
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95'
                        }`}
                >
                    <span className="hidden sm:inline">Continue to {stepLabels[currentStep] || 'Next'}</span>
                    <span className="sm:hidden">Next</span>
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors ${!canProgress ? 'bg-slate-200' : 'bg-white/20 group-hover:bg-white/30'
                        }`}>
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </button>
            ) : (
                <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Complete</span>
                </div>
            )}
        </nav>
    );
};

export default WizardNavigation;
