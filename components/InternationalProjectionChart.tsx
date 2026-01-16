// International Projection Chart Component
import React, { useMemo } from 'react';
import {
    ComposedChart,
    Area,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
    ReferenceArea,
} from 'recharts';
import { YearlyProjectionIntl } from '../types/internationalPlanning';
import { COUNTRIES } from '../data/countries';
import { formatIntlCompact } from '../utils/internationalCalculations';

interface Props {
    projections: YearlyProjectionIntl[];
    fiAge: number | null;
    currency: string;
}

const InternationalProjectionChart: React.FC<Props> = ({ projections, fiAge, currency }) => {
    // Prepare chart data
    const chartData = useMemo(() => {
        return projections.map(p => ({
            age: p.age,
            year: p.year,
            country: p.country,
            countryName: COUNTRIES[p.country]?.name || p.country,
            phase: p.phase,
            netWorth: p.totalNetWorthUSD,
            liquidAssets: p.liquidAssetsUSD,
            retirementAssets: p.retirementAssetsUSD,
            realEstate: p.realEstateEquityUSD,
            income: p.grossIncomeUSD,
            expenses: p.livingExpensesUSD + p.healthcareCosts,
            isSolvent: p.isSolvent,
        }));
    }, [projections]);

    // Find phase boundaries for coloring
    const phaseBoundaries = useMemo(() => {
        const boundaries: { start: number; end: number; phase: string; country: string }[] = [];
        let currentPhase = chartData[0]?.phase;
        let currentCountry = chartData[0]?.country;
        let startIdx = 0;

        chartData.forEach((point, idx) => {
            if (point.phase !== currentPhase || point.country !== currentCountry) {
                boundaries.push({
                    start: chartData[startIdx].age,
                    end: chartData[idx - 1].age,
                    phase: currentPhase,
                    country: currentCountry,
                });
                startIdx = idx;
                currentPhase = point.phase;
                currentCountry = point.country;
            }
        });

        // Add last segment
        if (chartData.length > 0) {
            boundaries.push({
                start: chartData[startIdx].age,
                end: chartData[chartData.length - 1].age,
                phase: currentPhase,
                country: currentCountry,
            });
        }

        return boundaries;
    }, [chartData]);

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0].payload;
        const phaseColors = {
            work: '#10b981',
            transition: '#f59e0b',
            retirement: '#8b5cf6',
        };

        return (
            <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl min-w-[200px]">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-black text-lg">Age {label}</span>
                    <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                        style={{ backgroundColor: `${phaseColors[data.phase as keyof typeof phaseColors]}20`, color: phaseColors[data.phase as keyof typeof phaseColors] }}
                    >
                        {data.phase}
                    </span>
                </div>

                <div className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                    <span>📍</span>
                    {data.countryName}
                </div>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Net Worth</span>
                        <span className="font-bold text-white">${formatIntlCompact(data.netWorth, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-emerald-400">💵 Liquid</span>
                        <span className="font-medium text-emerald-300">${formatIntlCompact(data.liquidAssets, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-400">🏦 Retirement</span>
                        <span className="font-medium text-blue-300">${formatIntlCompact(data.retirementAssets, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-amber-400">🏠 Real Estate</span>
                        <span className="font-medium text-amber-300">${formatIntlCompact(data.realEstate, currency)}</span>
                    </div>

                    <div className="border-t border-white/10 pt-2 mt-2">
                        {data.income > 0 && (
                            <div className="flex justify-between">
                                <span className="text-slate-400">Income</span>
                                <span className="text-emerald-400">+${formatIntlCompact(data.income, currency)}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-slate-400">Expenses</span>
                            <span className="text-rose-400">-${formatIntlCompact(data.expenses, currency)}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Get phase color for reference areas
    const getPhaseColor = (phase: string) => {
        switch (phase) {
            case 'work': return 'rgb(16, 185, 129, 0.1)';
            case 'transition': return 'rgb(245, 158, 11, 0.15)';
            case 'retirement': return 'rgb(139, 92, 246, 0.1)';
            default: return 'transparent';
        }
    };

    return (
        <div className="w-full h-[400px] sm:h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
                    {/* Background phase areas */}
                    {phaseBoundaries.map((boundary, idx) => (
                        <ReferenceArea
                            key={idx}
                            x1={boundary.start}
                            x2={boundary.end}
                            fill={getPhaseColor(boundary.phase)}
                            strokeOpacity={0}
                        />
                    ))}

                    <defs>
                        <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="liquidGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="retirementGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />

                    <XAxis
                        dataKey="age"
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={{ stroke: '#e2e8f0' }}
                        label={{ value: 'Age', position: 'bottom', offset: -5, fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                    />

                    <YAxis
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={{ stroke: '#e2e8f0' }}
                        tickFormatter={(value) => `$${formatIntlCompact(value, currency)}`}
                        label={{ value: 'USD', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value) => (
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{value}</span>
                        )}
                    />

                    {/* Stacked areas for asset breakdown */}
                    <Area
                        type="monotone"
                        dataKey="realEstate"
                        stackId="1"
                        stroke="#f59e0b"
                        fill="#fef3c7"
                        strokeWidth={0}
                        name="Real Estate"
                    />
                    <Area
                        type="monotone"
                        dataKey="retirementAssets"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="url(#retirementGradient)"
                        strokeWidth={0}
                        name="Retirement"
                    />
                    <Area
                        type="monotone"
                        dataKey="liquidAssets"
                        stackId="1"
                        stroke="#10b981"
                        fill="url(#liquidGradient)"
                        strokeWidth={0}
                        name="Liquid"
                    />

                    {/* Net worth line */}
                    <Line
                        type="monotone"
                        dataKey="netWorth"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                        name="Net Worth"
                    />

                    {/* FIRE Age marker */}
                    {fiAge && (
                        <ReferenceLine
                            x={fiAge}
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            label={{
                                value: `FIRE @${fiAge}`,
                                position: 'top',
                                fill: '#8b5cf6',
                                fontSize: 12,
                                fontWeight: 700,
                            }}
                        />
                    )}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default InternationalProjectionChart;
