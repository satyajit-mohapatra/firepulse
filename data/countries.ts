// Comprehensive Country Database for International Financial Planning
import { Country, CountryDatabase } from '../types/internationalPlanning';

export const COUNTRIES: CountryDatabase = {
    US: {
        code: 'US',
        name: 'United States',
        currency: 'USD',
        currencySymbol: '$',
        taxBrackets: [
            { minIncome: 0, maxIncome: 11600, rate: 10 },
            { minIncome: 11600, maxIncome: 47150, rate: 12 },
            { minIncome: 47150, maxIncome: 100525, rate: 22 },
            { minIncome: 100525, maxIncome: 191950, rate: 24 },
            { minIncome: 191950, maxIncome: 243725, rate: 32 },
            { minIncome: 243725, maxIncome: 609350, rate: 35 },
            { minIncome: 609350, maxIncome: null, rate: 37 },
        ],
        capitalGainsTax: 20,
        socialSecurityRate: 7.65,
        retirementAccountTypes: ['401k', 'ira', 'roth-ira'],
        averageInflation: 3.0,
        costOfLivingIndex: 100,
        visaOptions: [
            {
                name: 'H-1B Work Visa',
                type: 'work',
                annualCost: 5000,
                processingTime: '6-12 months',
                pathToResidency: true,
                requirements: ['Bachelor\'s degree', 'Employer sponsorship', 'Specialty occupation'],
            },
            {
                name: 'EB-5 Investor Visa',
                type: 'investment',
                minInvestment: 1050000,
                annualCost: 0,
                processingTime: '24-36 months',
                pathToResidency: true,
                requirements: ['Investment in US business', 'Job creation for US workers'],
            },
        ],
        exchangeRateToUSD: 1.0,
        hasUSATaxTreaty: true,
        pensionWithdrawalAge: 59.5,
        healthcareCostIndex: 100,
    },

    IN: {
        code: 'IN',
        name: 'India',
        currency: 'INR',
        currencySymbol: '₹',
        taxBrackets: [
            { minIncome: 0, maxIncome: 300000, rate: 0 },
            { minIncome: 300000, maxIncome: 700000, rate: 5 },
            { minIncome: 700000, maxIncome: 1000000, rate: 10 },
            { minIncome: 1000000, maxIncome: 1200000, rate: 15 },
            { minIncome: 1200000, maxIncome: 1500000, rate: 20 },
            { minIncome: 1500000, maxIncome: null, rate: 30 },
        ],
        capitalGainsTax: 12.5, // LTCG rate
        socialSecurityRate: 12, // EPF contribution
        retirementAccountTypes: ['nps', 'ppf', 'epf'],
        averageInflation: 6.0,
        costOfLivingIndex: 25,
        visaOptions: [
            {
                name: 'OCI (Overseas Citizen of India)',
                type: 'family',
                annualCost: 0,
                processingTime: '2-4 months',
                pathToResidency: true,
                requirements: ['Indian origin or married to Indian citizen'],
            },
            {
                name: 'PIO Card',
                type: 'family',
                annualCost: 0,
                processingTime: '1-2 months',
                pathToResidency: false,
                requirements: ['Person of Indian Origin'],
            },
        ],
        exchangeRateToUSD: 0.012, // 1 INR = 0.012 USD (approx 83 INR per USD)
        hasUSATaxTreaty: true,
        pensionWithdrawalAge: 60,
        healthcareCostIndex: 15,
    },

    UK: {
        code: 'UK',
        name: 'United Kingdom',
        currency: 'GBP',
        currencySymbol: '£',
        taxBrackets: [
            { minIncome: 0, maxIncome: 12570, rate: 0 },
            { minIncome: 12570, maxIncome: 50270, rate: 20 },
            { minIncome: 50270, maxIncome: 125140, rate: 40 },
            { minIncome: 125140, maxIncome: null, rate: 45 },
        ],
        capitalGainsTax: 20,
        socialSecurityRate: 12, // NI contributions
        retirementAccountTypes: ['isa', 'pension'],
        averageInflation: 2.5,
        costOfLivingIndex: 90,
        visaOptions: [
            {
                name: 'Skilled Worker Visa',
                type: 'work',
                annualCost: 2500,
                processingTime: '3-8 weeks',
                pathToResidency: true,
                requirements: ['Job offer from UK employer', 'Minimum salary threshold', 'English proficiency'],
            },
            {
                name: 'Innovator Founder Visa',
                type: 'investment',
                minInvestment: 50000,
                annualCost: 1500,
                processingTime: '3-8 weeks',
                pathToResidency: true,
                requirements: ['Innovative business idea', 'Endorsement from approved body'],
            },
        ],
        exchangeRateToUSD: 1.27,
        hasUSATaxTreaty: true,
        pensionWithdrawalAge: 55,
        healthcareCostIndex: 50, // NHS provides free basic care
    },

    CA: {
        code: 'CA',
        name: 'Canada',
        currency: 'CAD',
        currencySymbol: 'C$',
        taxBrackets: [
            { minIncome: 0, maxIncome: 55867, rate: 15 },
            { minIncome: 55867, maxIncome: 111733, rate: 20.5 },
            { minIncome: 111733, maxIncome: 173205, rate: 26 },
            { minIncome: 173205, maxIncome: 246752, rate: 29 },
            { minIncome: 246752, maxIncome: null, rate: 33 },
        ],
        capitalGainsTax: 26.76, // 50% inclusion at marginal rate
        socialSecurityRate: 5.95, // CPP
        retirementAccountTypes: ['rrsp', 'tfsa'],
        averageInflation: 2.5,
        costOfLivingIndex: 85,
        visaOptions: [
            {
                name: 'Express Entry',
                type: 'work',
                annualCost: 1500,
                processingTime: '6 months',
                pathToResidency: true,
                requirements: ['Skills assessment', 'Language proficiency', 'Work experience'],
            },
            {
                name: 'Start-up Visa',
                type: 'investment',
                minInvestment: 200000,
                annualCost: 2000,
                processingTime: '12-16 months',
                pathToResidency: true,
                requirements: ['Qualifying business', 'Commitment from designated organization'],
            },
        ],
        exchangeRateToUSD: 0.74,
        hasUSATaxTreaty: true,
        pensionWithdrawalAge: 55,
        healthcareCostIndex: 30, // Public healthcare
    },

    AU: {
        code: 'AU',
        name: 'Australia',
        currency: 'AUD',
        currencySymbol: 'A$',
        taxBrackets: [
            { minIncome: 0, maxIncome: 18200, rate: 0 },
            { minIncome: 18200, maxIncome: 45000, rate: 19 },
            { minIncome: 45000, maxIncome: 120000, rate: 32.5 },
            { minIncome: 120000, maxIncome: 180000, rate: 37 },
            { minIncome: 180000, maxIncome: null, rate: 45 },
        ],
        capitalGainsTax: 23.5, // 50% CGT discount for assets held > 1 year
        socialSecurityRate: 11.5, // Superannuation
        retirementAccountTypes: ['super'],
        averageInflation: 3.0,
        costOfLivingIndex: 95,
        visaOptions: [
            {
                name: 'Skilled Independent Visa (189)',
                type: 'work',
                annualCost: 0,
                processingTime: '8-12 months',
                pathToResidency: true,
                requirements: ['Skills assessment', 'Points test', 'Age under 45'],
            },
            {
                name: 'Business Innovation Visa',
                type: 'investment',
                minInvestment: 1500000,
                annualCost: 0,
                processingTime: '18-24 months',
                pathToResidency: true,
                requirements: ['Business ownership experience', 'Net assets', 'Business turnover'],
            },
        ],
        exchangeRateToUSD: 0.65,
        hasUSATaxTreaty: true,
        pensionWithdrawalAge: 60,
        healthcareCostIndex: 40, // Medicare
    },

    DE: {
        code: 'DE',
        name: 'Germany',
        currency: 'EUR',
        currencySymbol: '€',
        taxBrackets: [
            { minIncome: 0, maxIncome: 11604, rate: 0 },
            { minIncome: 11604, maxIncome: 17005, rate: 14 },
            { minIncome: 17005, maxIncome: 66760, rate: 24 },
            { minIncome: 66760, maxIncome: 277825, rate: 42 },
            { minIncome: 277825, maxIncome: null, rate: 45 },
        ],
        capitalGainsTax: 26.38, // Abgeltungsteuer
        socialSecurityRate: 20.4, // Employee portion
        retirementAccountTypes: ['pension', 'riester'],
        averageInflation: 2.0,
        costOfLivingIndex: 75,
        visaOptions: [
            {
                name: 'EU Blue Card',
                type: 'work',
                annualCost: 200,
                processingTime: '1-3 months',
                pathToResidency: true,
                requirements: ['University degree', 'Job offer with minimum salary', 'Health insurance'],
            },
        ],
        exchangeRateToUSD: 1.08,
        hasUSATaxTreaty: true,
        pensionWithdrawalAge: 67,
        healthcareCostIndex: 35, // Public healthcare
    },

    SG: {
        code: 'SG',
        name: 'Singapore',
        currency: 'SGD',
        currencySymbol: 'S$',
        taxBrackets: [
            { minIncome: 0, maxIncome: 20000, rate: 0 },
            { minIncome: 20000, maxIncome: 30000, rate: 2 },
            { minIncome: 30000, maxIncome: 40000, rate: 3.5 },
            { minIncome: 40000, maxIncome: 80000, rate: 7 },
            { minIncome: 80000, maxIncome: 120000, rate: 11.5 },
            { minIncome: 120000, maxIncome: 160000, rate: 15 },
            { minIncome: 160000, maxIncome: 200000, rate: 18 },
            { minIncome: 200000, maxIncome: 240000, rate: 19 },
            { minIncome: 240000, maxIncome: 280000, rate: 19.5 },
            { minIncome: 280000, maxIncome: 320000, rate: 20 },
            { minIncome: 320000, maxIncome: 500000, rate: 22 },
            { minIncome: 500000, maxIncome: 1000000, rate: 23 },
            { minIncome: 1000000, maxIncome: null, rate: 24 },
        ],
        capitalGainsTax: 0, // No capital gains tax
        socialSecurityRate: 20, // CPF
        retirementAccountTypes: ['cpf'],
        averageInflation: 2.5,
        costOfLivingIndex: 115,
        visaOptions: [
            {
                name: 'Employment Pass',
                type: 'work',
                annualCost: 1000,
                processingTime: '3-8 weeks',
                pathToResidency: true,
                requirements: ['Job offer', 'Minimum salary S$5000', 'Qualifications'],
            },
            {
                name: 'Global Investor Programme',
                type: 'investment',
                minInvestment: 10000000, // SGD
                annualCost: 0,
                processingTime: '6-8 months',
                pathToResidency: true,
                requirements: ['Business track record', 'Substantial investment'],
            },
        ],
        exchangeRateToUSD: 0.74,
        hasUSATaxTreaty: true,
        pensionWithdrawalAge: 55,
        healthcareCostIndex: 80,
    },

    AE: {
        code: 'AE',
        name: 'United Arab Emirates',
        currency: 'AED',
        currencySymbol: 'د.إ',
        taxBrackets: [
            { minIncome: 0, maxIncome: null, rate: 0 }, // No income tax
        ],
        capitalGainsTax: 0,
        socialSecurityRate: 0, // For expats
        retirementAccountTypes: [],
        averageInflation: 2.5,
        costOfLivingIndex: 80,
        visaOptions: [
            {
                name: 'Employment Visa',
                type: 'work',
                annualCost: 2000,
                processingTime: '2-4 weeks',
                pathToResidency: false,
                requirements: ['Employer sponsorship', 'Medical fitness'],
            },
            {
                name: 'Golden Visa',
                type: 'investment',
                minInvestment: 2000000, // AED
                annualCost: 0,
                processingTime: '3-6 months',
                pathToResidency: true,
                requirements: ['Investment in property or business', 'Or exceptional talent'],
            },
        ],
        exchangeRateToUSD: 0.27,
        hasUSATaxTreaty: false,
        pensionWithdrawalAge: 50,
        healthcareCostIndex: 60,
    },

    PT: {
        code: 'PT',
        name: 'Portugal',
        currency: 'EUR',
        currencySymbol: '€',
        taxBrackets: [
            { minIncome: 0, maxIncome: 7703, rate: 13.25 },
            { minIncome: 7703, maxIncome: 11623, rate: 18 },
            { minIncome: 11623, maxIncome: 16472, rate: 23 },
            { minIncome: 16472, maxIncome: 21321, rate: 26 },
            { minIncome: 21321, maxIncome: 27146, rate: 32.75 },
            { minIncome: 27146, maxIncome: 39791, rate: 37 },
            { minIncome: 39791, maxIncome: 51997, rate: 43.5 },
            { minIncome: 51997, maxIncome: 81199, rate: 45 },
            { minIncome: 81199, maxIncome: null, rate: 48 },
        ],
        capitalGainsTax: 28,
        socialSecurityRate: 11,
        retirementAccountTypes: ['pension'],
        averageInflation: 2.5,
        costOfLivingIndex: 55,
        visaOptions: [
            {
                name: 'D7 Passive Income Visa',
                type: 'retirement',
                annualCost: 500,
                processingTime: '2-4 months',
                pathToResidency: true,
                requirements: ['Minimum passive income', 'Health insurance', 'Accommodation'],
            },
            {
                name: 'Golden Visa',
                type: 'investment',
                minInvestment: 500000,
                annualCost: 0,
                processingTime: '6-8 months',
                pathToResidency: true,
                requirements: ['Real estate or fund investment', 'Clean criminal record'],
            },
        ],
        exchangeRateToUSD: 1.08,
        hasUSATaxTreaty: true,
        pensionWithdrawalAge: 66,
        healthcareCostIndex: 30,
    },

    MX: {
        code: 'MX',
        name: 'Mexico',
        currency: 'MXN',
        currencySymbol: '$',
        taxBrackets: [
            { minIncome: 0, maxIncome: 8952, rate: 1.92 },
            { minIncome: 8952, maxIncome: 75984, rate: 6.4 },
            { minIncome: 75984, maxIncome: 133536, rate: 10.88 },
            { minIncome: 133536, maxIncome: 155229, rate: 16 },
            { minIncome: 155229, maxIncome: 185852, rate: 17.92 },
            { minIncome: 185852, maxIncome: 374837, rate: 21.36 },
            { minIncome: 374837, maxIncome: 590795, rate: 23.52 },
            { minIncome: 590795, maxIncome: 1127926, rate: 30 },
            { minIncome: 1127926, maxIncome: 1503902, rate: 32 },
            { minIncome: 1503902, maxIncome: 4511707, rate: 34 },
            { minIncome: 4511707, maxIncome: null, rate: 35 },
        ],
        capitalGainsTax: 10,
        socialSecurityRate: 6.5,
        retirementAccountTypes: ['afore'],
        averageInflation: 4.5,
        costOfLivingIndex: 35,
        visaOptions: [
            {
                name: 'Temporary Resident Visa',
                type: 'retirement',
                annualCost: 300,
                processingTime: '1-2 months',
                pathToResidency: true,
                requirements: ['Proof of income or savings', 'No criminal record'],
            },
            {
                name: 'Permanent Resident Visa',
                type: 'retirement',
                annualCost: 0,
                processingTime: '2-4 months',
                pathToResidency: true,
                requirements: ['Higher income/savings threshold', 'Family ties or 4 years temporary'],
            },
        ],
        exchangeRateToUSD: 0.058,
        hasUSATaxTreaty: true,
        pensionWithdrawalAge: 65,
        healthcareCostIndex: 20,
    },

    TH: {
        code: 'TH',
        name: 'Thailand',
        currency: 'THB',
        currencySymbol: '฿',
        taxBrackets: [
            { minIncome: 0, maxIncome: 150000, rate: 0 },
            { minIncome: 150000, maxIncome: 300000, rate: 5 },
            { minIncome: 300000, maxIncome: 500000, rate: 10 },
            { minIncome: 500000, maxIncome: 750000, rate: 15 },
            { minIncome: 750000, maxIncome: 1000000, rate: 20 },
            { minIncome: 1000000, maxIncome: 2000000, rate: 25 },
            { minIncome: 2000000, maxIncome: 5000000, rate: 30 },
            { minIncome: 5000000, maxIncome: null, rate: 35 },
        ],
        capitalGainsTax: 0, // For most cases
        socialSecurityRate: 5,
        retirementAccountTypes: ['ssf', 'rmf'],
        averageInflation: 2.0,
        costOfLivingIndex: 30,
        visaOptions: [
            {
                name: 'Thailand Elite Visa',
                type: 'retirement',
                annualCost: 0, // One-time fee
                minInvestment: 30000, // USD for 5 years
                processingTime: '2-4 weeks',
                pathToResidency: false,
                requirements: ['Payment of membership fee', 'Background check'],
            },
            {
                name: 'Long-Term Resident Visa',
                type: 'retirement',
                annualCost: 10000,
                processingTime: '3-6 months',
                pathToResidency: true,
                requirements: ['Wealthy pensioner or professional', 'Minimum income/assets'],
            },
        ],
        exchangeRateToUSD: 0.028,
        hasUSATaxTreaty: true,
        pensionWithdrawalAge: 55,
        healthcareCostIndex: 15,
    },

    JP: {
        code: 'JP',
        name: 'Japan',
        currency: 'JPY',
        currencySymbol: '¥',
        taxBrackets: [
            { minIncome: 0, maxIncome: 1950000, rate: 5 },
            { minIncome: 1950000, maxIncome: 3300000, rate: 10 },
            { minIncome: 3300000, maxIncome: 6950000, rate: 20 },
            { minIncome: 6950000, maxIncome: 9000000, rate: 23 },
            { minIncome: 9000000, maxIncome: 18000000, rate: 33 },
            { minIncome: 18000000, maxIncome: 40000000, rate: 40 },
            { minIncome: 40000000, maxIncome: null, rate: 45 },
        ],
        capitalGainsTax: 20.315,
        socialSecurityRate: 14.5,
        retirementAccountTypes: ['ideco', 'nisa'],
        averageInflation: 1.5,
        costOfLivingIndex: 85,
        visaOptions: [
            {
                name: 'Highly Skilled Professional Visa',
                type: 'work',
                annualCost: 500,
                processingTime: '1-3 months',
                pathToResidency: true,
                requirements: ['Points-based system', 'Minimum 70 points'],
            },
            {
                name: 'Designated Activities Visa',
                type: 'retirement',
                annualCost: 300,
                processingTime: '2-3 months',
                pathToResidency: false,
                requirements: ['Retirement age', 'Sufficient funds', 'Business or cultural activities'],
            },
        ],
        exchangeRateToUSD: 0.0067,
        hasUSATaxTreaty: true,
        pensionWithdrawalAge: 60,
        healthcareCostIndex: 40,
    },
};

// Helper functions
export const getCountry = (code: string): Country | undefined => COUNTRIES[code];

export const getCountryList = (): Country[] => Object.values(COUNTRIES);

export const getCountryOptions = (): { value: string; label: string; flag: string }[] => {
    const flags: Record<string, string> = {
        US: '🇺🇸', IN: '🇮🇳', UK: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺',
        DE: '🇩🇪', SG: '🇸🇬', AE: '🇦🇪', PT: '🇵🇹', MX: '🇲🇽',
        TH: '🇹🇭', JP: '🇯🇵',
    };

    return Object.values(COUNTRIES).map(c => ({
        value: c.code,
        label: c.name,
        flag: flags[c.code] || '🌍',
    }));
};

export const convertCurrency = (
    amount: number,
    fromCurrency: string,
    toCurrency: string
): number => {
    const fromCountry = Object.values(COUNTRIES).find(c => c.currency === fromCurrency);
    const toCountry = Object.values(COUNTRIES).find(c => c.currency === toCurrency);

    if (!fromCountry || !toCountry) return amount;

    // Convert to USD first, then to target currency
    const amountInUSD = amount * fromCountry.exchangeRateToUSD;
    return amountInUSD / toCountry.exchangeRateToUSD;
};

export const getCostOfLivingMultiplier = (fromCountry: string, toCountry: string): number => {
    const from = COUNTRIES[fromCountry];
    const to = COUNTRIES[toCountry];

    if (!from || !to) return 1;

    return to.costOfLivingIndex / from.costOfLivingIndex;
};

export const calculateTax = (income: number, countryCode: string): number => {
    const country = COUNTRIES[countryCode];
    if (!country) return 0;

    let tax = 0;
    let remainingIncome = income;

    for (const bracket of country.taxBrackets) {
        if (remainingIncome <= 0) break;

        const taxableInBracket = bracket.maxIncome
            ? Math.min(remainingIncome, bracket.maxIncome - bracket.minIncome)
            : remainingIncome;

        tax += taxableInBracket * (bracket.rate / 100);
        remainingIncome -= taxableInBracket;
    }

    return tax;
};

export const getEffectiveTaxRate = (income: number, countryCode: string): number => {
    const tax = calculateTax(income, countryCode);
    return income > 0 ? (tax / income) * 100 : 0;
};
