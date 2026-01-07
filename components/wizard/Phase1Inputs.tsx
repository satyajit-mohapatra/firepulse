import React, { useState } from 'react';
import { FinancialData, CurrencyCode, SpouseData } from '../../types';
import { currencies } from '../../utils/finance';
import SliderInput from '../SliderInput';

interface Phase1InputsProps {
    data: FinancialData;
    updateData: (key: keyof FinancialData, value: any) => void;
    updateSpouseData: (key: keyof SpouseData, value: any) => void;
    currencySymbol: string;
    longevityTooltip: React.ReactNode;
    currency: CurrencyCode;
    setCurrency: (c: CurrencyCode) => void;
}

const BulkExpensesEditor: React.FC<{
    expenses: any[];
    onChange: (expenses: any[]) => void;
    currencySymbol: string;
    label: string;
    icon: string;
    color: string;
}> = ({ expenses, onChange, currencySymbol, label, icon, color }) => {
    const addExpense = () => {
        onChange([...expenses, { id: crypto.randomUUID(), name: 'New Expense', amount: 10000, age: 50, category: 'General' }]);
    };

    const removeExpense = (id: string) => {
        onChange(expenses.filter(e => e.id !== id));
    };

    const updateExpense = (id: string, key: string, value: any) => {
        onChange(expenses.map(e => e.id === id ? { ...e, [key]: value } : e));
    };

    const COLORS = {
        emerald: 'from-emerald-600 to-teal-600 border-emerald-200/50 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-emerald-50/60 text-emerald-700',
        amber: 'from-amber-600 to-orange-600 border-amber-200/50 bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-amber-50/60 text-amber-700',
        rose: 'from-rose-600 to-pink-600 border-rose-200/50 bg-gradient-to-br from-rose-50/60 via-pink-50/40 to-rose-50/60 text-rose-700',
        indigo: 'from-indigo-600 to-blue-600 border-indigo-200/50 bg-gradient-to-br from-indigo-50/60 via-blue-50/40 to-indigo-50/60 text-indigo-700'
    };

    const colorClasses = COLORS[color as keyof typeof COLORS] || COLORS.indigo;

    return (
        <section className={`space-y-6 p-6 md:p-8 rounded-[1.5rem] border shadow-lg relative z-10 ${colorClasses.split(' ').slice(2).join(' ')}`}>
            <div className="flex items-center justify-between">
                <h3 className={`text-[10px] md:text-xs font-black uppercase tracking-[0.5em] flex items-center gap-3 ${colorClasses.split(' ').pop()}`}>
                    <span className={`w-2 h-2 rounded-full shadow-lg ${colorClasses.split(' ').slice(0, 2).join(' ')}`}></span>
                    {icon} {label}
                </h3>
                <button
                    onClick={addExpense}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                >
                    <span>➕ Add</span>
                </button>
            </div>

            <div className="space-y-3">
                {expenses.length === 0 ? (
                    <p className="text-sm text-slate-400 italic text-center py-4 bg-white/50 rounded-xl border border-dashed border-slate-200">
                        No {label.toLowerCase()} added yet.
                    </p>
                ) : (
                    expenses.map((expense) => (
                        <div key={expense.id} className="grid grid-cols-12 gap-3 items-end bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                            <div className="col-span-12 sm:col-span-5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Description</label>
                                <input
                                    type="text"
                                    value={expense.name}
                                    onChange={(e) => updateExpense(expense.id, 'name', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>
                            <div className="col-span-4 sm:col-span-3">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Amount ({currencySymbol})</label>
                                <input
                                    type="number"
                                    value={expense.amount}
                                    onChange={(e) => updateExpense(expense.id, 'amount', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>
                            <div className="col-span-4 sm:col-span-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">At Age</label>
                                <input
                                    type="number"
                                    value={expense.age}
                                    onChange={(e) => updateExpense(expense.id, 'age', parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>
                            <div className="col-span-4 sm:col-span-2 flex justify-end">
                                <button
                                    onClick={() => removeExpense(expense.id)}
                                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
};

const Phase1Inputs: React.FC<Phase1InputsProps> = ({
    data,
    updateData,
    updateSpouseData,
    currencySymbol,
    longevityTooltip,
    currency,
    setCurrency
}) => {
    const [showSpouseSection, setShowSpouseSection] = useState(data.spouse.enabled);

    const handleSpouseToggle = (enabled: boolean) => {
        setShowSpouseSection(enabled);
        updateSpouseData('enabled', enabled);
    };

    // Calculate total family income
    const totalFamilyIncome = data.monthlyIncome + (data.spouse.enabled ? data.spouse.monthlyIncome : 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-end">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                        className="relative w-full px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none cursor-pointer pr-10"
                    >
                        {currencies.map(c => (
                            <option key={c.code} value={c.code}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* PRIMARY PERSON STATS */}
            <section className="space-y-4 sm:space-y-6 md:space-y-8 p-4 sm:p-6 md:p-8 rounded-[1rem] sm:rounded-[1.5rem] border border-purple-200/50 bg-gradient-to-br from-purple-50/60 via-pink-50/40 to-purple-50/60 shadow-lg relative z-10">
                <div className="flex items-center justify-between">
                    <h3 className="text-[9px] sm:text-[10px] md:text-xs font-black text-purple-700 uppercase tracking-[0.4em] sm:tracking-[0.5em] flex items-center gap-2 sm:gap-3">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg shadow-purple-600/40"></span>
                        👤 You
                    </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <SliderInput
                        label="Age Now"
                        value={data.currentAge}
                        onChange={(v) => updateData('currentAge', v)}
                        min={18}
                        max={data.retirementAge - 1}
                    />
                    <SliderInput
                        label="Retire Age"
                        value={data.retirementAge}
                        onChange={(v) => updateData('retirementAge', v)}
                        min={data.currentAge + 1}
                        max={data.liveUntilAge - 1}
                    />
                    <SliderInput
                        label="Live Until Age"
                        value={data.liveUntilAge}
                        onChange={(v) => updateData('liveUntilAge', v)}
                        min={data.retirementAge + 1}
                        max={110}
                        tooltip={longevityTooltip}
                    />
                    <SliderInput
                        label="Monthly Income"
                        value={data.monthlyIncome}
                        onChange={(v) => updateData('monthlyIncome', v)}
                        min={0}
                        max={2000000}
                        step={500}
                        prefix={currencySymbol}
                        tooltip="Your monthly salary/income (before spouse income)"
                    />
                </div>
            </section>

            {/* SPOUSE TOGGLE & SECTION */}
            <section className="space-y-4 sm:space-y-6 md:space-y-8 p-4 sm:p-6 md:p-8 rounded-[1rem] sm:rounded-[1.5rem] border border-rose-200/50 bg-gradient-to-br from-rose-50/60 via-pink-50/40 to-rose-50/60 shadow-lg relative z-10">
                <div className="flex items-center justify-between">
                    <h3 className="text-[9px] sm:text-[10px] md:text-xs font-black text-rose-700 uppercase tracking-[0.4em] sm:tracking-[0.5em] flex items-center gap-2 sm:gap-3">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-rose-600 to-pink-600 rounded-full shadow-lg shadow-rose-600/40"></span>
                        💑 Spouse / Partner
                    </h3>
                    <button
                        onClick={() => handleSpouseToggle(!showSpouseSection)}
                        className={`relative w-14 h-7 rounded-full transition-all duration-300 ${showSpouseSection
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg shadow-rose-500/30'
                            : 'bg-slate-300'
                            }`}
                    >
                        <span
                            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${showSpouseSection ? 'translate-x-7' : 'translate-x-0'
                                }`}
                        />
                    </button>
                </div>

                {showSpouseSection && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                        <SliderInput
                            label="Spouse Age"
                            value={data.spouse.currentAge}
                            onChange={(v) => updateSpouseData('currentAge', v)}
                            min={18}
                            max={data.spouse.retirementAge - 1}
                        />
                        <SliderInput
                            label="Spouse Retire Age"
                            value={data.spouse.retirementAge}
                            onChange={(v) => updateSpouseData('retirementAge', v)}
                            min={data.spouse.currentAge + 1}
                            max={data.spouse.liveUntilAge - 1}
                        />
                        <SliderInput
                            label="Spouse Live Until"
                            value={data.spouse.liveUntilAge}
                            onChange={(v) => updateSpouseData('liveUntilAge', v)}
                            min={data.spouse.retirementAge + 1}
                            max={110}
                            tooltip="Planning horizon for your spouse. FIRE calculations will consider the longer of both."
                        />
                        <SliderInput
                            label="Spouse Monthly Income"
                            value={data.spouse.monthlyIncome}
                            onChange={(v) => updateSpouseData('monthlyIncome', v)}
                            min={0}
                            max={2000000}
                            step={500}
                            prefix={currencySymbol}
                            tooltip="Spouse's monthly salary/income. Adds to family income."
                        />
                        <SliderInput
                            label="Spouse Income Growth %"
                            value={data.spouse.incomeIncreaseRate}
                            onChange={(v) => updateSpouseData('incomeIncreaseRate', v)}
                            min={0}
                            max={25}
                            step={0.5}
                            suffix="%"
                            tooltip="Expected annual increase in spouse's income"
                        />
                    </div>
                )}

                {!showSpouseSection && (
                    <p className="text-sm text-slate-500 italic">
                        Enable to add your spouse/partner's financial profile for joint planning
                    </p>
                )}
            </section>

            {/* FAMILY ASSETS (SHARED) */}
            <section className="space-y-4 sm:space-y-6 md:space-y-8 p-4 sm:p-6 md:p-8 rounded-[1rem] sm:rounded-[1.5rem] border border-indigo-200/50 bg-gradient-to-br from-indigo-50/60 via-blue-50/40 to-indigo-50/60 shadow-lg relative z-10">
                <h3 className="text-[9px] sm:text-[10px] md:text-xs font-black text-indigo-700 uppercase tracking-[0.4em] sm:tracking-[0.5em] flex items-center gap-2 sm:gap-3">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full shadow-lg shadow-indigo-600/40"></span>
                    🏠 Family Assets
                </h3>
                <p className="text-xs text-slate-500 -mt-2">
                    Combined assets of your household
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <SliderInput
                        label="Liquid Assets"
                        value={data.currentNetWorth}
                        onChange={(v) => updateData('currentNetWorth', v)}
                        min={0}
                        max={100000000}
                        step={10000}
                        prefix={currencySymbol}
                        tooltip="Family cash, stocks, bonds, brokerage accounts - fully accessible anytime"
                    />
                    <SliderInput
                        label="Retirement Assets"
                        value={data.retirementAssets}
                        onChange={(v) => updateData('retirementAssets', v)}
                        min={0}
                        max={100000000}
                        step={10000}
                        prefix={currencySymbol}
                        tooltip="Combined 401k, IRA, retirement accounts - locked until retirement but higher returns"
                    />
                    <SliderInput
                        label="Real Estate / Non-Liquid"
                        value={data.nonLiquidAssets}
                        onChange={(v) => updateData('nonLiquidAssets', v)}
                        min={0}
                        max={100000000}
                        step={10000}
                        prefix={currencySymbol}
                        tooltip="Family real estate, business equity - hard to liquidate, lower but stable returns"
                    />
                </div>
            </section>

            {/* FAMILY EXPENSES */}
            <section className="space-y-6 md:space-y-8 p-6 md:p-8 rounded-[1.5rem] border border-emerald-200/50 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-emerald-50/60 shadow-lg relative z-10">
                <h3 className="text-[10px] md:text-xs font-black text-emerald-700 uppercase tracking-[0.5em] flex items-center gap-3">
                    <span className="w-2 h-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full shadow-lg shadow-emerald-600/40"></span>
                    💰 Family Cash Flow
                </h3>
                {data.spouse.enabled && (
                    <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-100/50 px-3 py-2 rounded-lg border border-emerald-200/50">
                        <span className="font-semibold">Combined Family Income:</span>
                        <span className="font-black">{currencySymbol}{totalFamilyIncome.toLocaleString()}/mo</span>
                    </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <SliderInput
                        label="Monthly Living"
                        value={data.monthlyExpenses}
                        onChange={(v) => updateData('monthlyExpenses', v)}
                        min={500}
                        max={500000}
                        step={500}
                        prefix={currencySymbol}
                    />
                    <SliderInput
                        label="Monthly Medical"
                        value={data.monthlyMedical}
                        onChange={(v) => updateData('monthlyMedical', v)}
                        min={0}
                        max={50000}
                        step={100}
                        prefix={currencySymbol}
                        tooltip="Health insurance, doctor visits, prescriptions"
                    />
                    <SliderInput
                        label="Kids Monthly Edu"
                        value={data.monthlyKidsEducation}
                        onChange={(v) => updateData('monthlyKidsEducation', v)}
                        min={0}
                        max={100000}
                        step={100}
                        prefix={currencySymbol}
                        tooltip="Monthly school fees, tuition, and basic education costs"
                    />
                    <SliderInput
                        label="Monthly Surplus"
                        value={data.monthlySavings}
                        onChange={(v) => updateData('monthlySavings', v)}
                        min={0}
                        max={totalFamilyIncome}
                        step={100}
                        prefix={currencySymbol}
                        tooltip={`Total family income minus expenses = savings available for investments`}
                    />
                </div>
            </section>

            {/* BULK & EDUCATION EXPENSES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BulkExpensesEditor
                    label="Bulk Expenses"
                    icon="🛒"
                    color="indigo"
                    expenses={data.bulkExpenses || []}
                    onChange={(v) => updateData('bulkExpenses', v)}
                    currencySymbol={currencySymbol}
                />
                <BulkExpensesEditor
                    label="Education Goals"
                    icon="🎓"
                    color="rose"
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

            {/* ESTIMATES */}
            <section className="space-y-4 sm:space-y-6 md:space-y-8 p-4 sm:p-6 md:p-8 rounded-[1rem] sm:rounded-[1.5rem] border border-amber-200/50 bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-amber-50/60 shadow-lg relative z-10">
                <h3 className="text-[9px] sm:text-[10px] md:text-xs font-black text-amber-700 uppercase tracking-[0.4em] sm:tracking-[0.5em] flex items-center gap-2 sm:gap-3">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full shadow-lg shadow-amber-600/40"></span> 📊 Estimates
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <SliderInput label="Your Income Growth %" value={data.incomeIncreaseRate} onChange={(v) => updateData('incomeIncreaseRate', v)} min={0} max={25} step={0.5} suffix="%" />
                    <SliderInput label="Global Inflation" value={data.inflationRate} onChange={(v) => updateData('inflationRate', v)} min={0} max={15} step={0.1} suffix="%" />
                    <SliderInput label="Medical Inflation" value={data.medicalInflation} onChange={(v) => updateData('medicalInflation', v)} min={0} max={20} step={0.1} suffix="%" />
                    <SliderInput label="Retirement Expense %" value={data.retirementExpenseMultiplier} onChange={(v) => updateData('retirementExpenseMultiplier', v)} min={50} max={120} step={1} suffix="%" tooltip="Retirement spending as % of current expenses (adjusted for inflation)" />
                    <div className="col-span-1 sm:col-span-2">
                        <SliderInput label="Post-Retire Tax" value={data.retirementTaxRate} onChange={(v) => updateData('retirementTaxRate', v)} min={0} max={50} step={1} suffix="%" />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Phase1Inputs;
