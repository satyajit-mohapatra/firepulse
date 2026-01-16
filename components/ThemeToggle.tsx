import React, { useState, useEffect } from 'react';

interface ThemeToggleProps {
    className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
    const [isDark, setIsDark] = useState(false);

    // Check for saved theme preference or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('firepulse-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            setIsDark(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);

    const toggleTheme = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);

        if (newIsDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('firepulse-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('firepulse-theme', 'light');
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className={`relative group p-2 rounded-xl transition-all duration-300 hover:bg-white/20 ${className}`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <div className="relative w-6 h-6 overflow-hidden">
                {/* Sun Icon */}
                <svg
                    className={`absolute inset-0 w-6 h-6 text-amber-300 transition-all duration-500 ${isDark
                            ? 'opacity-0 rotate-90 scale-50'
                            : 'opacity-100 rotate-0 scale-100'
                        }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>

                {/* Moon Icon */}
                <svg
                    className={`absolute inset-0 w-6 h-6 text-indigo-200 transition-all duration-500 ${isDark
                            ? 'opacity-100 rotate-0 scale-100'
                            : 'opacity-0 -rotate-90 scale-50'
                        }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                </svg>
            </div>

            {/* Hover glow effect */}
            <div
                className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isDark
                        ? 'bg-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                        : 'bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                    }`}
            />
        </button>
    );
};

export default ThemeToggle;
