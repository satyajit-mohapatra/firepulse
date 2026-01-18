/**
 * RecommendationModal Component
 * 
 * A beautiful modal that displays personalized FIRE recommendations
 * based on the user's financial data.
 */

import React, { useMemo } from 'react';
import { FinancialData, CurrencyCode } from '../types';
import { calculateFIRERecommendations, FIRERecommendation, RecommendationItem } from '../utils/recommendations';
import { formatCurrencyCompact, getCurrencySymbol } from '../utils/finance';

interface RecommendationModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: FinancialData;
    currency: CurrencyCode;
}

const PriorityBadge: React.FC<{ priority: RecommendationItem['priority'] }> = ({ priority }) => {
    const styles = {
        critical: 'bg-red-100 text-red-700 border-red-200',
        high: 'bg-amber-100 text-amber-700 border-amber-200',
        medium: 'bg-blue-100 text-blue-700 border-blue-200',
        low: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };

    const labels = {
        critical: '🚨 Critical',
        high: '⚠️ High Priority',
        medium: '📌 Medium',
        low: '✅ Low Priority'
    };

    return (
        <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full border ${styles[priority]}`}>
            {labels[priority]}
        </span>
    );
};

const CategoryIcon: React.FC<{ category: RecommendationItem['category'] }> = ({ category }) => {
    const icons = {
        savings: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        income: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        expenses: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        ),
        investments: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
        timeline: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    };

    return icons[category] || icons.savings;
};

const MetricCard: React.FC<{
    label: string;
    value: string;
    subValue?: string;
    icon: React.ReactNode;
    color: string;
}> = ({ label, value, subValue, icon, color }) => (
    <div className={`p-4 rounded-2xl border ${color} transition-all hover:scale-[1.02]`}>
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/60">{icon}</div>
            <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
                <div className="text-lg font-black text-slate-800">{value}</div>
                {subValue && <div className="text-xs text-slate-500">{subValue}</div>}
            </div>
        </div>
    </div>
);

const RecommendationModal: React.FC<RecommendationModalProps> = ({
    isOpen,
    onClose,
    data,
    currency
}) => {
    const recommendations = useMemo(() => calculateFIRERecommendations(data), [data]);
    const currencySymbol = getCurrencySymbol(currency);

    const formatValue = (value: number) => formatCurrencyCompact(value, currency);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-auto py-8 px-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-500 overflow-hidden">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-8 py-6">
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2px, transparent 0)', backgroundSize: '50px 50px' }} />

                    <div className="relative flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                                <span className="text-3xl">💡</span>
                                FIRE Recommendations
                            </h2>
                            <p className="text-white/80 mt-1 text-sm font-medium">
                                Personalized strategies to achieve financial independence
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all hover:scale-110"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    {/* Key Metrics */}
                    <div className="mb-8">
                        <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                            <span className="text-xl">📊</span>
                            Your FIRE Metrics
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <MetricCard
                                label="Years to Retirement"
                                value={`${recommendations.yearsToRetirement} years`}
                                subValue={`Age ${data.currentAge} → ${data.retirementAge}`}
                                icon={
                                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                }
                                color="bg-indigo-50 border-indigo-200"
                            />

                            <MetricCard
                                label="Required Corpus"
                                value={formatValue(recommendations.requiredCorpus)}
                                subValue="At retirement"
                                icon={
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                }
                                color="bg-emerald-50 border-emerald-200"
                            />

                            <MetricCard
                                label="Future Value of Savings"
                                value={formatValue(recommendations.futureValueCurrentSavings)}
                                subValue="Current assets projected"
                                icon={
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                }
                                color="bg-blue-50 border-blue-200"
                            />
                        </div>
                    </div>

                    {/* Gap Analysis */}
                    <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                        <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                            <span className="text-xl">🎯</span>
                            Savings Gap Analysis
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                                    {formatValue(recommendations.gapToFill)}
                                </div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">
                                    Gap to Fill
                                </div>
                            </div>

                            <div className="text-center">
                                <div className={`text-3xl font-black ${recommendations.isOnTrack ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {currencySymbol}{recommendations.monthlyContributionNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">
                                    Monthly Contribution Needed
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="text-3xl font-black text-indigo-600">
                                    {currencySymbol}{recommendations.currentMonthlySavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">
                                    Current Monthly Savings
                                </div>
                            </div>
                        </div>

                        {/* Status Bar */}
                        <div className="mt-6 p-4 rounded-xl border-2 flex items-center justify-between"
                            style={{
                                backgroundColor: recommendations.isOnTrack ? 'rgb(236 253 245)' : 'rgb(254 242 242)',
                                borderColor: recommendations.isOnTrack ? 'rgb(167 243 208)' : 'rgb(254 202 202)'
                            }}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${recommendations.isOnTrack ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                    {recommendations.isOnTrack ? (
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <div className={`font-black text-lg ${recommendations.isOnTrack ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        {recommendations.isOnTrack ? "You're On Track! 🎉" : "Action Needed"}
                                    </div>
                                    <div className={`text-sm ${recommendations.isOnTrack ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {recommendations.isOnTrack
                                            ? `You have a ${currencySymbol}${recommendations.surplusMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month surplus`
                                            : `You need ${currencySymbol}${recommendations.shortfallMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/month more`
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className={`text-2xl font-black ${recommendations.isOnTrack ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {recommendations.currentSavingsRate.toFixed(1)}%
                                </div>
                                <div className="text-xs font-bold text-slate-500 uppercase">Current Rate</div>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations List */}
                    <div>
                        <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                            <span className="text-xl">📋</span>
                            Personalized Recommendations
                            <span className="ml-2 px-2 py-1 text-xs font-bold bg-indigo-100 text-indigo-700 rounded-full">
                                {recommendations.recommendations.length} items
                            </span>
                        </h3>

                        <div className="space-y-4">
                            {recommendations.recommendations.map((rec) => (
                                <div
                                    key={rec.id}
                                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${rec.priority === 'critical' ? 'bg-red-100 text-red-600' :
                                            rec.priority === 'high' ? 'bg-amber-100 text-amber-600' :
                                                rec.priority === 'medium' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-emerald-100 text-emerald-600'
                                            }`}>
                                            <CategoryIcon category={rec.category} />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-bold text-slate-800">{rec.title}</h4>
                                                <PriorityBadge priority={rec.priority} />
                                            </div>

                                            <p className="text-sm text-slate-600 mb-3">{rec.description}</p>

                                            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 mb-3">
                                                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide mb-1">Impact</div>
                                                <div className="text-sm font-medium text-indigo-800">{rec.impact}</div>
                                            </div>

                                            <div className="mt-3">
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Action Steps</div>
                                                <ul className="space-y-1.5">
                                                    {rec.actionSteps.map((step, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                                            <span className="text-indigo-500 mt-0.5">→</span>
                                                            {step}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-slate-50 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                            <span className="font-bold">Note:</span> These recommendations are based on your current financial data and standard FIRE principles.
                        </div>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-indigo-200"
                        >
                            Got It!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendationModal;
