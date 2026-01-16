import React, { useState, useEffect } from 'react';
import { FinancialData, CurrencyCode, SpouseData } from '../../types';
import { InternationalScenario } from '../../types/internationalPlanning';
import { currencies, getCurrencySymbol } from '../../utils/finance';
import ModernSliderInput from '../ModernSliderInput';
import InternationalPlanner from '../InternationalPlanner';
import { useWizardValidation } from '../../hooks/useWizardValidation';
import { useWizard } from '../../contexts/WizardContext';

interface FinancialDetailsProps {
    data: FinancialData;
    updateData: (key: keyof FinancialData, value: any) => void;
    updateSpouseData: (key: keyof SpouseData, value: any) => void;
    currencySymbol: string;
    currency: CurrencyCode;
    setCurrency: (c: CurrencyCode) => void;
    uiMode: 'basic' | 'advanced';
    setUiMode: (mode: 'basic' | 'advanced') => void;
    internationalScenario: InternationalScenario;
    setInternationalScenario: React.Dispatch<React.SetStateAction<InternationalScenario>>;
}

// Simple Expenses Editor Component
const ExpensesEditor: React.FC<{
    expenses: any[];
    onChange: (expenses: any[]) => void;
    currencySymbol: string;
    label: string;
    icon: string;
}> = ({ expenses, onChange, currencySymbol, label, icon }) => {
    const addExpense = () => {
        onChange([...expenses, { id: crypto.randomUUID(), name: 'New Expense', amount: 10000, age: 50, category: 'General' }]);
    };

    const removeExpense = (id: string) => {
        onChange(expenses.filter(e => e.id !== id));
    };

    const updateExpense = (id: string, key: string, value: any) => {
        onChange(expenses.map(e => e.id === id ? { ...e, [key]: value } : e));
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-base">{icon}</span>
                    <h4 className="text-sm font-semibold text-slate-700">{label}</h4>
                </div>
                <button
                    onClick={addExpense}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                >
                    + Add
                </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
                {expenses.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">No {label.toLowerCase()} added yet</p>
                ) : (
                    expenses.map((expense) => (
                        <div key={expense.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                            <input
                                type="text"
                                value={expense.name}
                                onChange={(e) => updateExpense(expense.id, 'name', e.target.value)}
                                className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-sm outline-none focus:border-indigo-400"
                                placeholder="Description"
                            />
                            <input
                                type="number"
                                value={expense.amount}
                                onChange={(e) => updateExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                                onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); }}
                                className="w-24 px-2 py-1 bg-white border border-slate-200 rounded text-sm outline-none focus:border-indigo-400"
                                placeholder={currencySymbol}
                            />
                            <input
                                type="number"
                                value={expense.age}
                                onChange={(e) => updateExpense(expense.id, 'age', parseInt(e.target.value) || 0)}
                                onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault(); }}
                                className="w-16 px-2 py-1 bg-white border border-slate-200 rounded text-sm outline-none focus:border-indigo-400"
                                placeholder="Age"
                            />
                            <button
                                onClick={() => removeExpense(expense.id)}
                                className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const FinancialDetails: React.FC<FinancialDetailsProps> = ({
    data,
    updateData,
    updateSpouseData,
    currencySymbol,
    currency,
    setCurrency,
    uiMode,
    setUiMode,
    internationalScenario,
    setInternationalScenario,
}) => {
    const { currentStep, setCanProgress } = useWizard();
    const { getFieldError, isValid } = useWizardValidation(data, currentStep);

    useEffect(() => {
        setCanProgress(isValid);
    }, [isValid, setCanProgress]);

    // Calculate total family income
    const totalFamilyIncome = data.monthlyIncome + (data.spouse.enabled ? data.spouse.monthlyIncome : 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
            {/* Header with Mode Toggle */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                    <h2 className="text-xl font-bold text-slate-800">Financial Details</h2>
                    <p className="text-slate-500 text-sm">
                        {uiMode === 'basic' ? 'Quick setup with key numbers' : 'Advanced international planning'}
                    </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex items-center bg-slate-100 p-1 rounded-full">
                    <button
                        onClick={() => setUiMode('basic')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${uiMode === 'basic'
                                ? 'bg-white text-indigo-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <span>🚀</span>
                        <span>Basic</span>
                    </button>
                    <button
                        onClick={() => setUiMode('advanced')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${uiMode === 'advanced'
                                ? 'bg-white text-purple-700 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <span>🌍</span>
                        <span>Advanced</span>
                    </button>
                </div>
            </div>

            {/* Currency Selector */}
            <div className="flex justify-end">
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <span>💱</span>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                        className="bg-transparent text-sm font-medium outline-none cursor-pointer"
                    >
                        {currencies.map(c => (
                            <option key={c.code} value={c.code}>
                                {getCurrencySymbol(c.code)} {c.code}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Basic Mode Content */}
            {uiMode === 'basic' && (
                <div className="space-y-5">
                    {/* Income Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <span className="text-lg">💼</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800">Income</h3>
                                {data.spouse.enabled && (
                                    <p className="text-xs text-emerald-600">
                                        Combined: {currencySymbol}{totalFamilyIncome.toLocaleString()}/mo
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ModernSliderInput
                                label="Monthly Income"
                                value={data.monthlyIncome}
                                onChange={(v) => updateData('monthlyIncome', v)}
                                min={0}
                                max={2000000}
                                step={500}
                                prefix={currencySymbol}
                                tooltip="Your monthly salary/income"
                                currency={currency}
                                icon="💵"
                                error={getFieldError('monthlyIncome')}
                            />
                            <ModernSliderInput
                                label="Annual Growth"
                                value={data.incomeIncreaseRate}
                                onChange={(v) => updateData('incomeIncreaseRate', v)}
                                min={0}
                                max={25}
                                step={0.5}
                                suffix="%"
                                tooltip="Expected annual salary increase"
                                icon="📈"
                            />
                            {data.spouse.enabled && (
                                <>
                                    <ModernSliderInput
                                        label="Spouse Income"
                                        value={data.spouse.monthlyIncome}
                                        onChange={(v) => updateSpouseData('monthlyIncome', v)}
                                        min={0}
                                        max={2000000}
                                        step={500}
                                        prefix={currencySymbol}
                                        tooltip="Spouse's monthly income"
                                        currency={currency}
                                        icon="💵"
                                        error={getFieldError('spouse.monthlyIncome')}
                                    />
                                    <ModernSliderInput
                                        label="Spouse Growth"
                                        value={data.spouse.incomeIncreaseRate}
                                        onChange={(v) => updateSpouseData('incomeIncreaseRate', v)}
                                        min={0}
                                        max={25}
                                        step={0.5}
                                        suffix="%"
                                        tooltip="Spouse's annual increase"
                                        icon="📈"
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Assets Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                <span className="text-lg">🏠</span>
                            </div>
                            <h3 className="font-bold text-slate-800">Assets</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <ModernSliderInput
                                label="Liquid Assets"
                                value={data.currentNetWorth}
                                onChange={(v) => updateData('currentNetWorth', v)}
                                min={0}
                                max={100000000}
                                step={10000}
                                prefix={currencySymbol}
                                tooltip="Cash, stocks, bonds"
                                currency={currency}
                                icon="💰"
                            />
                            <ModernSliderInput
                                label="Retirement Accounts"
                                value={data.retirementAssets}
                                onChange={(v) => updateData('retirementAssets', v)}
                                min={0}
                                max={100000000}
                                step={10000}
                                prefix={currencySymbol}
                                tooltip="401k, IRA, pension"
                                currency={currency}
                                icon="🏦"
                            />
                            <ModernSliderInput
                                label="Real Estate"
                                value={data.nonLiquidAssets}
                                onChange={(v) => updateData('nonLiquidAssets', v)}
                                min={0}
                                max={100000000}
                                step={10000}
                                prefix={currencySymbol}
                                tooltip="Property, business equity"
                                currency={currency}
                                icon="🏢"
                            />
                        </div>
                    </div>

                    {/* Expenses Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                <span className="text-lg">💳</span>
                            </div>
                            <h3 className="font-bold text-slate-800">Monthly Expenses</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ModernSliderInput
                                label="Living Expenses"
                                value={data.monthlyExpenses}
                                onChange={(v) => updateData('monthlyExpenses', v)}
                                min={500}
                                max={500000}
                                step={500}
                                prefix={currencySymbol}
                                tooltip="Rent, food, utilities"
                                currency={currency}
                                icon="🏠"
                                error={getFieldError('monthlyExpenses')}
                            />
                            <ModernSliderInput
                                label="Healthcare"
                                value={data.monthlyMedical}
                                onChange={(v) => updateData('monthlyMedical', v)}
                                min={0}
                                max={50000}
                                step={100}
                                prefix={currencySymbol}
                                tooltip="Insurance, medications"
                                currency={currency}
                                icon="🏥"
                            />
                            <ModernSliderInput
                                label="Education"
                                value={data.monthlyKidsEducation}
                                onChange={(v) => updateData('monthlyKidsEducation', v)}
                                min={0}
                                max={100000}
                                step={100}
                                prefix={currencySymbol}
                                tooltip="School fees, tuition"
                                currency={currency}
                                icon="📚"
                            />
                            <ModernSliderInput
                                label="Monthly Savings"
                                value={data.monthlySavings}
                                onChange={(v) => updateData('monthlySavings', v)}
                                min={0}
                                max={totalFamilyIncome}
                                step={100}
                                prefix={currencySymbol}
                                tooltip="What you save each month"
                                currency={currency}
                                icon="💎"
                            />
                        </div>
                    </div>

                    {/* Future Expenses */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ExpensesEditor
                            label="One-Time Expenses"
                            icon="🛒"
                            expenses={data.bulkExpenses || []}
                            onChange={(v) => updateData('bulkExpenses', v)}
                            currencySymbol={currencySymbol}
                        />
                        <ExpensesEditor
                            label="Education Goals"
                            icon="🎓"
                            expenses={data.goals.filter(g => g.category === 'Education').map(g => ({ ...g, amount: g.targetAmount, age: g.targetAge }))}
                            onChange={(v) => {
                                const otherGoals = data.goals.filter(g => g.category !== 'Education');
                                const newEduGoals = v.map(e => ({
                                    id: e.id,
                                    name: e.name,
                                    targetAmount: e.amount,
                                    targetAge: e.age,
                                    category: 'Education'
                                }));
                                updateData('goals', [...otherGoals, ...newEduGoals]);
                            }}
                            currencySymbol={currencySymbol}
                        />
                    </div>

                    {/* Assumptions Card */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                <span className="text-lg">📊</span>
                            </div>
                            <h3 className="font-bold text-slate-800">Assumptions</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <ModernSliderInput
                                label="Inflation"
                                value={data.inflationRate}
                                onChange={(v) => updateData('inflationRate', v)}
                                min={0}
                                max={15}
                                step={0.1}
                                suffix="%"
                                tooltip="Expected annual inflation"
                                icon="📈"
                            />
                            <ModernSliderInput
                                label="Medical Inflation"
                                value={data.medicalInflation}
                                onChange={(v) => updateData('medicalInflation', v)}
                                min={0}
                                max={20}
                                step={0.1}
                                suffix="%"
                                tooltip="Healthcare cost increases"
                                icon="🏥"
                            />
                            <ModernSliderInput
                                label="Retirement Spending"
                                value={data.retirementExpenseMultiplier}
                                onChange={(v) => updateData('retirementExpenseMultiplier', v)}
                                min={50}
                                max={120}
                                step={1}
                                suffix="%"
                                tooltip="% of current expenses in retirement"
                                icon="🎯"
                            />
                            <ModernSliderInput
                                label="Retirement Tax"
                                value={data.retirementTaxRate}
                                onChange={(v) => updateData('retirementTaxRate', v)}
                                min={0}
                                max={50}
                                step={1}
                                suffix="%"
                                tooltip="Tax rate after retirement"
                                icon="🏛️"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Advanced Mode Content - International Planner */}
            {uiMode === 'advanced' && (
                <InternationalPlanner
                    data={data}
                    currency={currency}
                    updateSpouseData={updateSpouseData}
                    scenario={internationalScenario}
                    setScenario={setInternationalScenario}
                />
            )}
        </div>
    );
};

export default FinancialDetails;
