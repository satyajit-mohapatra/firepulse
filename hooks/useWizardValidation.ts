import { useState, useEffect, useCallback } from 'react';
import { FinancialData } from '../types';
import { validatePersonalProfile, validateFinancialDetails, ValidationResult } from '../components/wizard/validation/validators';

export const useWizardValidation = (data: FinancialData, step: number) => {
    const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: {} });
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const validate = useCallback(() => {
        let result: ValidationResult = { isValid: true, errors: {} };

        switch (step) {
            case 1:
                result = validatePersonalProfile(data);
                break;
            case 2:
                result = validateFinancialDetails(data);
                break;
            default:
                break;
        }

        setValidation(result);
        return result.isValid;
    }, [data, step]);

    useEffect(() => {
        validate();
    }, [validate]);

    const markTouched = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const getFieldError = (field: string) => {
        if (touched[field] && validation.errors[field]) {
            return validation.errors[field];
        }
        return undefined;
    };

    return {
        isValid: validation.isValid,
        errors: validation.errors,
        markTouched,
        getFieldError,
        validate
    };
};
