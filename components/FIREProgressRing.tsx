import React, { useEffect, useState } from 'react';
import { formatCurrencyCompact } from '../utils/finance';
import { CurrencyCode } from '../types';

interface FIREProgressRingProps {
    currentNetWorth: number;
    fiNumber: number;
    fiAge: number | null;
    currentAge: number;
    currency: CurrencyCode;
    size?: 'sm' | 'md' | 'lg';
    showDetails?: boolean;
}

const sizeConfig = {
    sm: { width: 120, strokeWidth: 8, fontSize: 'text-lg' },
    md: { width: 180, strokeWidth: 12, fontSize: 'text-2xl' },
    lg: { width: 240, strokeWidth: 16, fontSize: 'text-4xl' },
};

const FIREProgressRing: React.FC<FIREProgressRingProps> = ({
    currentNetWorth,
    fiNumber,
    fiAge,
    currentAge,
    currency,
    size = 'md',
    showDetails = true,
}) => {
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const config = sizeConfig[size];

    // Calculate progress (0-100)
    const progress = Math.min(100, Math.max(0, (currentNetWorth / fiNumber) * 100));

    // Circle calculations
    const radius = (config.width - config.strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

    // Animate on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedProgress(progress);
        }, 100);
        return () => clearTimeout(timer);
    }, [progress]);

    // Status color and message
    const getStatusInfo = () => {
        if (progress >= 100) {
            return {
                color: 'text-emerald-500',
                bgGradient: 'from-emerald-500 to-teal-500',
                message: 'FI Achieved! 🎉',
                ringColor: '#10b981'
            };
        } else if (progress >= 75) {
            return {
                color: 'text-violet-500',
                bgGradient: 'from-violet-500 to-purple-500',
                message: 'Almost There',
                ringColor: '#8b5cf6'
            };
        } else if (progress >= 50) {
            return {
                color: 'text-indigo-500',
                bgGradient: 'from-indigo-500 to-blue-500',
                message: 'Halfway',
                ringColor: '#6366f1'
            };
        } else if (progress >= 25) {
            return {
                color: 'text-amber-500',
                bgGradient: 'from-amber-500 to-orange-500',
                message: 'Building',
                ringColor: '#f59e0b'
            };
        }
        return {
            color: 'text-slate-500',
            bgGradient: 'from-slate-400 to-slate-500',
            message: 'Starting',
            ringColor: '#64748b'
        };
    };

    const status = getStatusInfo();
    const yearsToFI = fiAge ? fiAge - currentAge : null;

    return (
        <div className="flex flex-col items-center">
            {/* Progress Ring */}
            <div className="relative" style={{ width: config.width, height: config.width }}>
                {/* Gradient Definition */}
                <svg width="0" height="0">
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="50%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                        <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#14b8a6" />
                        </linearGradient>
                    </defs>
                </svg>

                <svg
                    width={config.width}
                    height={config.width}
                    className="transform -rotate-90"
                >
                    {/* Background circle */}
                    <circle
                        cx={config.width / 2}
                        cy={config.width / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={config.strokeWidth}
                        fill="none"
                        className="text-slate-100"
                    />

                    {/* Progress circle */}
                    <circle
                        cx={config.width / 2}
                        cy={config.width / 2}
                        r={radius}
                        stroke={progress >= 100 ? "url(#successGradient)" : "url(#progressGradient)"}
                        strokeWidth={config.strokeWidth}
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000 ease-out"
                        style={{
                            filter: 'drop-shadow(0 4px 12px rgba(99, 102, 241, 0.3))'
                        }}
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`${config.fontSize} font-black tracking-tighter ${status.color}`}>
                        {Math.round(animatedProgress)}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        to FIRE
                    </span>
                </div>

                {/* Animated glow effect when complete */}
                {progress >= 100 && (
                    <div
                        className="absolute inset-0 rounded-full animate-pulse"
                        style={{
                            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)'
                        }}
                    />
                )}
            </div>

            {/* Details Section */}
            {showDetails && (
                <div className="mt-6 w-full max-w-xs space-y-4">
                    {/* Status Badge */}
                    <div className="text-center">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r ${status.bgGradient} shadow-lg`}>
                            {status.message}
                        </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Current Net Worth */}
                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Current
                            </p>
                            <p className="text-base font-black text-slate-800">
                                {formatCurrencyCompact(currentNetWorth, currency)}
                            </p>
                        </div>

                        {/* FI Target */}
                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                FI Target
                            </p>
                            <p className="text-base font-black text-indigo-600">
                                {formatCurrencyCompact(fiNumber, currency)}
                            </p>
                        </div>

                        {/* Remaining */}
                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Remaining
                            </p>
                            <p className={`text-base font-black ${fiNumber - currentNetWorth > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {fiNumber - currentNetWorth > 0
                                    ? formatCurrencyCompact(fiNumber - currentNetWorth, currency)
                                    : 'Done!'
                                }
                            </p>
                        </div>

                        {/* Years to FI */}
                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Years to FI
                            </p>
                            <p className="text-base font-black text-purple-600">
                                {yearsToFI !== null && yearsToFI > 0
                                    ? `${yearsToFI}y`
                                    : yearsToFI === 0
                                        ? 'Now!'
                                        : '—'
                                }
                            </p>
                        </div>
                    </div>

                    {/* FI Age indicator */}
                    {fiAge && (
                        <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 rounded-xl p-4 text-center border border-indigo-200/50">
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">
                                Financial Independence Age
                            </p>
                            <p className="text-3xl font-black text-indigo-600 italic">
                                {fiAge}
                            </p>
                            <p className="text-xs font-medium text-slate-500 mt-1">
                                Year {new Date().getFullYear() + (fiAge - currentAge)}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FIREProgressRing;
