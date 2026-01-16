import React, { useState } from 'react';

interface FAQItemProps {
    question: string;
    answer: React.ReactNode;
    category: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, category }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`group border-b border-slate-200/60 last:border-0 transition-all duration-300 ${isOpen ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-5 px-6 flex items-center justify-between text-left focus:outline-none"
            >
                <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500/70">{category}</span>
                    <h3 className={`text-sm md:text-base font-bold transition-colors duration-300 ${isOpen ? 'text-indigo-700' : 'text-slate-800'}`}>
                        {question}
                    </h3>
                </div>
                <div className={`ml-4 flex-none w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-indigo-600 border-indigo-600 rotate-180 shadow-lg shadow-indigo-200' : 'bg-white'}`}>
                    <svg
                        className={`w-4 h-4 transition-colors duration-300 ${isOpen ? 'text-white' : 'text-slate-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="px-6 pb-6 text-sm md:text-base text-slate-600 leading-relaxed font-medium space-y-3">
                    {answer}
                </div>
            </div>
        </div>
    );
};

const FAQ: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'all' | 'basics' | 'math' | 'india' | 'strategy'>('all');

    const faqData: FAQItemProps[] = [
        {
            category: 'Basics',
            question: "What exactly is the FIRE movement?",
            answer: (
                <>
                    <p>FIRE stands for <strong>Financial Independence, Retire Early</strong>. It's a lifestyle and financial strategy focused on aggressively saving and investing a large portion of your income (often 50-75%) to build a portfolio large enough to sustain your living expenses indefinitely.</p>
                    <p>The goal isn't necessarily to stop working forever, but to reach a point where <strong>work is optional</strong>.</p>
                </>
            )
        },
        {
            category: 'Basics',
            question: "What are the different 'flavors' of FIRE?",
            answer: (
                <div className="space-y-4">
                    <div>
                        <strong className="text-indigo-600">LeanFIRE:</strong> Retiring on a minimalistic budget (e.g., spending $20k-$40k/year). Focuses on extreme frugality.
                    </div>
                    <div>
                        <strong className="text-indigo-600">FatFIRE:</strong> Retiring with a heavy-duty portfolio to enjoy a luxurious or high-middle-class lifestyle without compromise.
                    </div>
                    <div>
                        <strong className="text-indigo-600">BaristaFIRE:</strong> Reaching partial independence where you work a low-stress, part-time job (like at a coffee shop) for supplemental income or health insurance.
                    </div>
                    <div>
                        <strong className="text-indigo-600">CoastFIRE:</strong> Saving early and aggressively so that your portfolio will grow to your FIRE number by retirement age without any further contributions.
                    </div>
                </div>
            )
        },
        {
            category: 'Math',
            question: "What is the '25x Rule' or the 'FIRE Number'?",
            answer: (
                <>
                    <p>Your <strong>FIRE Number</strong> is the total corpus you need to be financially independent. The simplest way to calculate it is to multiply your <strong>estimated annual expenses by 25</strong>.</p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
                        <p className="font-mono text-center text-indigo-700 font-bold">Annual Expenses × 25 = FIRE Number</p>
                    </div>
                    <p className="mt-2">Example: If you spend $60,000 a year, you need $1.5 million. This assumes a 4% withdrawal rate.</p>
                </>
            )
        },
        {
            category: 'Math',
            question: "Is the 4% Withdrawal Rule safe for a 50-year retirement?",
            answer: (
                <>
                    <p>The <strong>4% Rule (Trinity Study)</strong> was based on a 30-year retirement. If you retire in your 30s or 40s and plan to live until 90+, many experts recommend a more conservative <strong>3% to 3.5% withdrawal rate</strong>.</p>
                    <p>This provides a wider safety margin against <strong>Sequence of Returns Risk</strong> (the risk of a market crash early in your retirement).</p>
                </>
            )
        },
        {
            category: 'Strategy',
            question: "How do I choose between Equity and Debt for my FIRE portfolio?",
            answer: (
                <>
                    <p>While working (Accumulation Phase), you typically want a higher <strong>Equity</strong> allocation (70-90%) for growth. As you approach FIRE, you shift some towards <strong>Debt/Fixed Income</strong> to reduce volatility.</p>
                    <p>A common strategy is the <strong>Asset Allocation Glidepath</strong>: having a 'Bond Tent' (extra cash/bonds) during the first 5 years of retirement to avoid selling stocks during a downturn.</p>
                </>
            )
        },
        {
            category: 'India',
            question: "How does periodic inflation in India affect my FIRE target?",
            answer: (
                <>
                    <p>Inflation in India is typically higher (5-7%) than in developed markets (2-3%). This means your FIRE number needs to be adjusted more aggressively.</p>
                    <p>Instead of 25x, many Indian FIRE practitioners aim for <strong>30x or 33x</strong> to account for higher lifestyle inflation and the volatility of the Rupee.</p>
                </>
            )
        },
        {
            category: 'India',
            question: "What is RNOR status and why is it important for NRIs?",
            answer: (
                <>
                    <p><strong>Resident but Not Ordinarily Resident (RNOR)</strong> is a tax status for returning NRIs. For up to 3 years after returning to India, your <strong>global income</strong> (e.g., US dividends, rental income abroad) remains <strong>non-taxable in India</strong>.</p>
                    <p>This is a critical window to 'reset' your capital gains and reorganize your global assets before becoming a full Resident for tax purposes.</p>
                </>
            )
        },
        {
            category: 'India',
            question: "Should I include my primary residence in my FIRE number?",
            answer: (
                <p>Generally, <strong>NO</strong>. Your FIRE number should consist of <strong>investable assets</strong> (stocks, bonds, cash, rental real estate) that generate income or capital gains. Since your primary home doesn't pay your bills (unless you downsize), it shouldn't be counted toward the corpus that covers your expenses.</p>
            )
        },
        {
            category: 'Math',
            question: "What is Sequence of Returns Risk (SORR)?",
            answer: (
                <p>SORR is the risk that the market performs poorly in the <strong>first few years</strong> of your retirement. Because you are withdrawing money while the market is down, your portfolio may never recover. This is the #1 killer of FIRE plans. Mitigation strategies include having a 2-year cash bucket or using a variable withdrawal strategy.</p>
            )
        },
        {
            category: 'Strategy',
            question: "How do I handle healthcare costs during early retirement?",
            answer: (
                <>
                    <p>Healthcare is often the largest 'unknown' in FIRE. In the US, you must budget for private insurance until Medicare at 65. In India, a comprehensive <strong>Super Top-up Health Insurance</strong> plan and a dedicated <strong>Medical Emergency Corpus</strong> (outside your FIRE number) are essential.</p>
                    <p>FirePulse includes a specific medical inflation toggle because healthcare costs often rise at 2x the rate of general inflation.</p>
                </>
            )
        }
    ];

    const filteredFaqs = activeTab === 'all'
        ? faqData
        : faqData.filter(item => item.category.toLowerCase() === activeTab);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl h-full max-h-[85vh] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/20">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight italic uppercase italic">
                            The <span className="text-indigo-600">FIRE</span> Encyclopedia
                        </h2>
                        <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Everything you need to know about Financial Independence</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-slate-200/50 flex items-center justify-center transition-colors group"
                    >
                        <svg className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 md:px-8 py-4 gap-2 border-b border-slate-100 overflow-x-auto no-scrollbar bg-white">
                    {['all', 'basics', 'math', 'strategy', 'india'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-tighter transition-all whitespace-nowrap ${activeTab === tab
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                                    : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                    <div className="divide-y divide-slate-100">
                        {filteredFaqs.map((faq, index) => (
                            <FAQItem
                                key={index}
                                category={faq.category}
                                question={faq.question}
                                answer={faq.answer}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest text-center sm:text-left">
                        Source: FirePulse Knowledge Base • Updated Jan 2026
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all hover:scale-105 shadow-lg"
                        >
                            Got it, thanks!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQ;
