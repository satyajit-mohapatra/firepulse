import { useState, useEffect, useCallback } from 'react';
import { FinancialData, CurrencyCode } from '../types';
import { InternationalScenario } from '../types/internationalPlanning';

export interface PersistedWizardState {
    version: number;
    lastUpdated: number;
    step: number;
    data: FinancialData;
    internationalScenario: InternationalScenario;
    uiMode: 'basic' | 'advanced';
    currency: CurrencyCode;
}

const STORAGE_KEY = 'firepulse_wizard_state_v1';
const CURRENT_VERSION = 1;

export const useWizardPersistence = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from storage
    const loadState = useCallback((): PersistedWizardState | null => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return null;

            const parsed = JSON.parse(stored);

            // Basic version check - in future can add migration logic
            if (parsed.version !== CURRENT_VERSION) {
                console.warn('Storage version mismatch, clearing old data');
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }

            return parsed as PersistedWizardState;
        } catch (error) {
            console.error('Failed to load wizard state', error);
            return null;
        }
    }, []);

    // Save to storage
    const saveState = useCallback((
        step: number,
        data: FinancialData,
        internationalScenario: InternationalScenario,
        uiMode: 'basic' | 'advanced',
        currency: CurrencyCode
    ) => {
        try {
            const stateToSave: PersistedWizardState = {
                version: CURRENT_VERSION,
                lastUpdated: Date.now(),
                step,
                data,
                internationalScenario,
                uiMode,
                currency
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Failed to save wizard state', error);
        }
    }, []);

    const clearState = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear wizard state', error);
        }
    }, []);

    return { loadState, saveState, clearState, isLoaded };
};
