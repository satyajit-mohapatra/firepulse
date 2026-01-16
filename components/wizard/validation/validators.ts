import { FinancialData } from '../../../types';

export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

export const validatePersonalProfile = (data: FinancialData): ValidationResult => {
    const errors: Record<string, string> = {};

    // Primary person age validations
    if (data.currentAge < 18) {
        errors.currentAge = "You must be at least 18 years old.";
    }
    if (data.currentAge > 100) {
        errors.currentAge = "Age cannot exceed 100.";
    }

    if (data.retirementAge <= data.currentAge) {
        errors.retirementAge = "Retirement age must be greater than current age.";
    }
    if (data.retirementAge > 100) {
        errors.retirementAge = "Retirement age cannot exceed 100.";
    }

    if (data.liveUntilAge <= data.retirementAge) {
        errors.liveUntilAge = "Life expectancy must be greater than retirement age.";
    }
    if (data.liveUntilAge > 120) {
        errors.liveUntilAge = "Life expectancy cannot exceed 120.";
    }

    // Spouse validations - comprehensive cross-validation
    if (data.spouse.enabled) {
        if (data.spouse.currentAge < 18) {
            errors['spouse.currentAge'] = "Spouse must be at least 18 years old.";
        }
        if (data.spouse.currentAge > 100) {
            errors['spouse.currentAge'] = "Spouse age cannot exceed 100.";
        }
        if (data.spouse.retirementAge <= data.spouse.currentAge) {
            errors['spouse.retirementAge'] = "Spouse retirement age must be greater than current age.";
        }
        if (data.spouse.retirementAge > 100) {
            errors['spouse.retirementAge'] = "Spouse retirement age cannot exceed 100.";
        }
        if (data.spouse.liveUntilAge <= data.spouse.retirementAge) {
            errors['spouse.liveUntilAge'] = "Spouse life expectancy must be greater than retirement age.";
        }
        if (data.spouse.liveUntilAge > 120) {
            errors['spouse.liveUntilAge'] = "Spouse life expectancy cannot exceed 120.";
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validateFinancialDetails = (data: FinancialData): ValidationResult => {
    const errors: Record<string, string> = {};

    // Financial validations
    if (data.monthlyIncome < 0) {
        errors.monthlyIncome = "Income cannot be negative.";
    }
    if (data.monthlyExpenses < 0) {
        errors.monthlyExpenses = "Expenses cannot be negative.";
    }

    // Spouse Income
    if (data.spouse.enabled) {
        if (data.spouse.monthlyIncome < 0) {
            errors['spouse.monthlyIncome'] = "Income cannot be negative.";
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};
