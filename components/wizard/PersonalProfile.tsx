import React, { useState, useEffect, useMemo } from 'react';
import { FinancialData, SpouseData } from '../../types';
import { useWizardValidation } from '../../hooks/useWizardValidation';
import { useWizard } from '../../contexts/WizardContext';
import ModernSliderInput from '../ModernSliderInput';
import { estimateFIREAge } from '../../utils/finance';

interface PersonalProfileProps {
    data: FinancialData;
    updateData: (key: keyof FinancialData, value: any) => void;
    updateSpouseData: (key: keyof SpouseData, value: any) => void;
    longevityTooltip: React.ReactNode;
}

const PersonalProfile: React.FC<PersonalProfileProps> = ({
    data,
    updateData,
    updateSpouseData,
    longevityTooltip,
}) => {
    const [showSpouse, setShowSpouse] = useState(data.spouse.enabled);

    const { currentStep, setCanProgress } = useWizard();
    const { getFieldError, isValid } = useWizardValidation(data, currentStep);

    useEffect(() => {
        setCanProgress(isValid);
    }, [isValid, setCanProgress]);

    const handleSpouseToggle = (enabled: boolean) => {
        setShowSpouse(enabled);
        updateSpouseData('enabled', enabled);
    };

    // Calculate estimated FIRE age
    const fireEstimate = useMemo(() => {
        return estimateFIREAge({
            currentAge: data.currentAge,
            currentNetWorth: data.currentNetWorth,
            retirementAssets: data.retirementAssets,
            nonLiquidAssets: data.nonLiquidAssets,
            monthlyExpenses: data.monthlyExpenses,
            monthlyMedical: data.monthlyMedical,
            monthlyKidsEducation: data.monthlyKidsEducation,
            monthlySavings: data.monthlySavings,
            monthlyIncome: data.monthlyIncome,
            annualBonus: data.annualBonus,
            retirementExpenseMultiplier: data.retirementExpenseMultiplier,
            withdrawalRate: data.withdrawalRate,
            liquidAssetReturn: data.liquidAssetReturn,
            incomeIncreaseRate: data.incomeIncreaseRate,
            inflationRate: data.inflationRate,
            liveUntilAge: data.liveUntilAge,
            spouse: data.spouse.enabled ? {
                enabled: true,
                monthlyIncome: data.spouse.monthlyIncome,
                annualBonus: data.spouse.annualBonus,
            } : undefined,
        });
    }, [data]);

    // Determine relationship between FIRE Age and Retirement Age
    const getFIREStatus = () => {
        if (!fireEstimate.fiAge) {
            return {
                status: 'not-achievable',
                message: "FIRE may not be achievable with current settings",
                color: 'text-slate-500',
                bgColor: 'bg-slate-50',
                borderColor: 'border-slate-200'
            };
        }

        const diff = data.retirementAge - fireEstimate.fiAge;
        if (diff > 5) {
            return {
                status: 'early',
                message: `You could FIRE ${diff} years before your planned retirement!`,
                color: 'text-emerald-600',
                bgColor: 'bg-emerald-50',
                borderColor: 'border-emerald-200'
            };
        } else if (diff > 0) {
            return {
                status: 'on-track',
                message: `You're on track - FIRE ${diff} year${diff > 1 ? 's' : ''} before retirement`,
                color: 'text-indigo-600',
                bgColor: 'bg-indigo-50',
                borderColor: 'border-indigo-200'
            };
        } else if (diff === 0) {
            return {
                status: 'exact',
                message: "FIRE age matches your retirement age perfectly!",
                color: 'text-violet-600',
                bgColor: 'bg-violet-50',
                borderColor: 'border-violet-200'
            };
        } else {
            return {
                status: 'late',
                message: `FIRE ${Math.abs(diff)} years after planned retirement - consider adjusting`,
                color: 'text-amber-600',
                bgColor: 'bg-amber-50',
                borderColor: 'border-amber-200'
            };
        }
    };

    const fireStatus = getFIREStatus();

    return (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Personal Profile</h2>
                <p className="text-slate-500 text-sm">Tell us about yourself to create your FIRE roadmap</p>
            </div>

            {/* Your Profile Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <span className="text-xl">👤</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Your Details</h3>
                        <p className="text-xs text-slate-500">Primary account holder</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <ModernSliderInput
                        label="Current Age"
                        value={data.currentAge}
                        onChange={(v) => updateData('currentAge', v)}
                        min={18}
                        max={data.retirementAge - 1}
                        tooltip="Your current age today"
                        icon="🎂"
                        error={getFieldError('currentAge')}
                    />
                    <ModernSliderInput
                        label="Retirement Age"
                        value={data.retirementAge}
                        onChange={(v) => updateData('retirementAge', v)}
                        min={data.currentAge + 1}
                        max={data.liveUntilAge - 1}
                        tooltip="When you PLAN to stop working (target retirement)"
                        icon="🏖️"
                        error={getFieldError('retirementAge')}
                    />
                    <ModernSliderInput
                        label="Plan Until Age"
                        value={data.liveUntilAge}
                        onChange={(v) => updateData('liveUntilAge', v)}
                        min={data.retirementAge + 1}
                        max={110}
                        tooltip={longevityTooltip}
                        icon="🎯"
                        error={getFieldError('liveUntilAge')}
                    />
                </div>

                {/* Summary Row with FIRE Age Comparison */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-4">
                        <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-2xl font-bold text-indigo-600">{data.retirementAge - data.currentAge}</p>
                            <p className="text-xs text-slate-500">Years to Retire</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-2xl font-bold text-emerald-600">{data.liveUntilAge - data.retirementAge}</p>
                            <p className="text-xs text-slate-500">Retirement Years</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-2xl font-bold text-amber-600">{data.liveUntilAge - data.currentAge}</p>
                            <p className="text-xs text-slate-500">Total Horizon</p>
                        </div>
                        {/* FIRE Age Estimate */}
                        <div className={`rounded-xl p-3 ${fireEstimate.fiAge ? 'bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200' : 'bg-slate-50'}`}>
                            <p className={`text-2xl font-bold ${fireEstimate.fiAge ? 'text-purple-600' : 'text-slate-400'}`}>
                                {fireEstimate.fiAge || '—'}
                            </p>
                            <p className="text-xs text-slate-500">Est. FIRE Age 🔥</p>
                        </div>
                    </div>

                    {/* FIRE vs Retirement Age Info Card */}
                    <div className={`rounded-xl p-4 ${fireStatus.bgColor} border ${fireStatus.borderColor}`}>
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">
                                {fireStatus.status === 'early' && '🚀'}
                                {fireStatus.status === 'on-track' && '✨'}
                                {fireStatus.status === 'exact' && '🎯'}
                                {fireStatus.status === 'late' && '⚠️'}
                                {fireStatus.status === 'not-achievable' && '📊'}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-slate-500 uppercase">FIRE Age</span>
                                        <span className={`font-bold ${fireStatus.color}`}>
                                            {fireEstimate.fiAge || '?'}
                                        </span>
                                    </div>
                                    <span className="text-slate-300">vs</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-slate-500 uppercase">Retirement</span>
                                        <span className="font-bold text-slate-700">{data.retirementAge}</span>
                                    </div>
                                </div>
                                <p className={`text-sm font-medium ${fireStatus.color}`}>
                                    {fireStatus.message}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    <strong>FIRE Age</strong> = When you <em>could</em> stop working ·
                                    <strong> Retirement Age</strong> = When you <em>plan</em> to stop
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spouse/Partner Card */}
            <div className={`bg-white rounded-2xl p-6 border transition-all duration-300 ${showSpouse ? 'border-pink-200 shadow-sm' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${showSpouse ? 'bg-pink-100' : 'bg-slate-100'}`}>
                            <span className="text-xl">💑</span>
                        </div>
                        <div>
                            <h3 className={`font-bold transition-colors ${showSpouse ? 'text-pink-700' : 'text-slate-600'}`}>
                                Spouse / Partner
                            </h3>
                            <p className="text-xs text-slate-500">
                                {showSpouse ? 'Planning together' : 'Optional: Add for joint planning'}
                            </p>
                        </div>
                    </div>

                    {/* Simple Toggle */}
                    <button
                        onClick={() => handleSpouseToggle(!showSpouse)}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${showSpouse ? 'bg-pink-500' : 'bg-slate-300'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${showSpouse ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                {/* Spouse Fields */}
                {showSpouse && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <ModernSliderInput
                            label="Spouse Age"
                            value={data.spouse.currentAge}
                            onChange={(v) => updateSpouseData('currentAge', v)}
                            min={18}
                            max={data.spouse.retirementAge - 1}
                            tooltip="Your spouse's current age"
                            icon="🎂"
                            error={getFieldError('spouse.currentAge')}
                        />
                        <ModernSliderInput
                            label="Spouse Retirement"
                            value={data.spouse.retirementAge}
                            onChange={(v) => updateSpouseData('retirementAge', v)}
                            min={data.spouse.currentAge + 1}
                            max={data.spouse.liveUntilAge - 1}
                            tooltip="When your spouse plans to retire"
                            icon="🏖️"
                            error={getFieldError('spouse.retirementAge')}
                        />
                        <ModernSliderInput
                            label="Plan Until Age"
                            value={data.spouse.liveUntilAge}
                            onChange={(v) => updateSpouseData('liveUntilAge', v)}
                            min={data.spouse.retirementAge + 1}
                            max={110}
                            tooltip="Planning horizon for your spouse"
                            icon="🎯"
                            error={getFieldError('spouse.liveUntilAge')}
                        />
                    </div>
                )}

                {!showSpouse && (
                    <p className="text-sm text-slate-400 italic">
                        Toggle to add your spouse for joint financial planning
                    </p>
                )}
            </div>
        </div>
    );
};

export default PersonalProfile;

