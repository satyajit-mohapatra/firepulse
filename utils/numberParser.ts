/**
 * Parses number inputs with suffixes like K, M, L (Lac), Cr (Crore)
 * Supports both Indian (Lac, Cr) and Western (K, M) number systems
 * 
 * Examples:
 * - "10k" or "10K" → 10000
 * - "1m" or "1M" → 1000000
 * - "5lac" or "5L" → 500000
 * - "5cr" or "5Cr" → 50000000
 * - "1.5m" → 1500000
 * - "2.5lac" → 250000
 */
export const parseNumberWithSuffix = (input: string): number | null => {
    if (!input || typeof input !== 'string') {
        return null;
    }

    // Clean the input: remove commas and trim whitespace
    const cleaned = input.trim().replace(/,/g, '');

    // Match number with optional suffix
    // Supports: 123, 123.45, 123k, 123.45m, 123lac, 123cr, etc.
    const regex = /^(-?\d+\.?\d*)\s*(k|m|l|lac|lakh|cr|crore)?$/i;
    const match = cleaned.match(regex);

    if (!match) {
        // Try parsing as plain number
        const plainNumber = parseFloat(cleaned);
        return isNaN(plainNumber) ? null : plainNumber;
    }

    const [, numberPart, suffix] = match;
    const baseNumber = parseFloat(numberPart);

    if (isNaN(baseNumber)) {
        return null;
    }

    // No suffix - return the number as is
    if (!suffix) {
        return baseNumber;
    }

    // Apply multiplier based on suffix
    const suffixLower = suffix.toLowerCase();

    switch (suffixLower) {
        case 'k':
            return baseNumber * 1000;

        case 'm':
            return baseNumber * 1000000;

        case 'l':
        case 'lac':
        case 'lakh':
            return baseNumber * 100000;

        case 'cr':
        case 'crore':
            return baseNumber * 10000000;

        default:
            return baseNumber;
    }
};

/**
 * Validates if a string can be parsed as a number with suffix
 */
export const isValidNumberInput = (input: string): boolean => {
    return parseNumberWithSuffix(input) !== null;
};

/**
 * Format a number for display based on currency
 * This is used when the input is not focused
 */
export const formatNumberForDisplay = (value: number, currency: string = 'USD'): string => {
    const absVal = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    // Use Indian number system (Cr/L/K) for INR
    if (currency === 'INR') {
        if (absVal >= 10000000) {
            return sign + (absVal / 10000000).toFixed(1).replace(/\.0$/, '') + 'Cr';
        } else if (absVal >= 100000) {
            return sign + (absVal / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
        } else if (absVal >= 1000) {
            return sign + (absVal / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return value.toLocaleString('en-IN');
    }

    // Use Western number system (M/K) for other currencies
    if (absVal >= 1000000) {
        return sign + (absVal / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (absVal >= 1000) {
        return sign + (absVal / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return value.toLocaleString('en-US');
};
