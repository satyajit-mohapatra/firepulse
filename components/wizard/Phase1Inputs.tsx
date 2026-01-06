import React from 'react';
import { FinancialData, CurrencyCode } from '../../types';
import { currencies } from '../../utils/finance';
import SliderInput from '../SliderInput';

interface Phase1InputsProps {
    data: FinancialData;
    updateData: (key: keyof FinancialData, value: any) => void;
    currencySymbol: string;
    longevityTooltip: React.ReactNode;
    currency: CurrencyCode;
    setCurrency: (c: CurrencyCode) => void;
}

const Phase1Inputs: React.FC<Phase1InputsProps> = ({ data, updateData, currencySymbol, longevityTooltip, currency, setCurrency }) => {
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

            {/* CORE STATS */}
            <section className="space-y-4 sm:space-y-6 md:space-y-8 p-4 sm:p-6 md:p-8 rounded-[1rem] sm:rounded-[1.5rem] border border-purple-200/50 bg-gradient-to-br from-purple-50/60 via-pink-50/40 to-purple-50/60 shadow-lg relative z-10">
                <h3 className="text-[9px] sm:text-[10px] md:text-xs font-black text-purple-700 uppercase tracking-[0.4em] sm:tracking-[0.5em] flex items-center gap-2 sm:gap-3">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg shadow-purple-600/40"></span> Core Stats
                </h3>
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
                        label="Liquid Assets"
                        value={data.currentNetWorth}
                        onChange={(v) => updateData('currentNetWorth', v)}
                        min={0}
                        max={100000000}
                        step={10000}
                        prefix={currencySymbol}
                        tooltip="Cash, stocks, bonds, brokerage accounts - fully accessible anytime"
                    />
                    <SliderInput
                        label="Retirement Assets"
                        value={data.retirementAssets}
                        onChange={(v) => updateData('retirementAssets', v)}
                        min={0}
                        max={100000000}
                        step={10000}
                        prefix={currencySymbol}
                        tooltip="401k, IRA, retirement accounts - locked until retirement but higher returns"
                    />
                    <SliderInput
                        label="Real Estate / Non-Liquid"
                        value={data.nonLiquidAssets}
                        onChange={(v) => updateData('nonLiquidAssets', v)}
                        min={0}
                        max={100000000}
                        step={10000}
                        prefix={currencySymbol}
                        tooltip="Real estate, business equity - hard to liquidate, lower but stable returns"
                    />
                </div>
            </section>

            {/* INCOME */}
            <section className="space-y-6 md:space-y-8 p-6 md:p-8 rounded-[1.5rem] border border-emerald-200/50 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-emerald-50/60 shadow-lg relative z-10">
                <h3 className="text-[10px] md:text-xs font-black text-emerald-700 uppercase tracking-[0.5em] flex items-center gap-3">
                    <span className="w-2 h-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full shadow-lg shadow-emerald-600/40"></span> Income
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <SliderInput
                        label="Monthly Income"
                        value={data.monthlyIncome}
                        onChange={(v) => updateData('monthlyIncome', v)}
                        min={0}
                        max={2000000}
                        step={500}
                        prefix={currencySymbol}
                    />
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
                        label="Kids Education"
                        value={data.monthlyKidsEducation}
                        onChange={(v) => updateData('monthlyKidsEducation', v)}
                        min={0}
                        max={100000}
                        step={100}
                        prefix={currencySymbol}
                        tooltip="School fees, tuition, tutoring, education expenses"
                    />
                    <SliderInput
                        label="Monthly Surplus"
                        value={data.monthlySavings}
                        onChange={(v) => updateData('monthlySavings', v)}
                        min={0}
                        max={data.monthlyIncome}
                        step={100}
                        prefix={currencySymbol}
                    />
                </div>
            </section>

            {/* ESTIMATES */}
            <section className="space-y-4 sm:space-y-6 md:space-y-8 p-4 sm:p-6 md:p-8 rounded-[1rem] sm:rounded-[1.5rem] border border-amber-200/50 bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-amber-50/60 shadow-lg relative z-10">
                <h3 className="text-[9px] sm:text-[10px] md:text-xs font-black text-amber-700 uppercase tracking-[0.4em] sm:tracking-[0.5em] flex items-center gap-2 sm:gap-3">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full shadow-lg shadow-amber-600/40"></span> Estimates
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <SliderInput label="Income Growth %" value={data.incomeIncreaseRate} onChange={(v) => updateData('incomeIncreaseRate', v)} min={0} max={25} step={0.5} suffix="%" />
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
