import React from 'react';
import { FinancialData, SpouseData } from '../../types';
import InternationalPlanner from '../InternationalPlanner';

import { InternationalScenario } from '../../types/internationalPlanning';

interface Phase3InternationalProps {
    data: FinancialData;
    currency: string;
    updateSpouseData: (key: keyof SpouseData, value: any) => void;
    scenario: InternationalScenario;
    setScenario: React.Dispatch<React.SetStateAction<InternationalScenario>>;
}

const Phase3International: React.FC<Phase3InternationalProps> = ({ data, currency, updateSpouseData, scenario, setScenario }) => {
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <InternationalPlanner
                data={data}
                currency={currency}
                updateSpouseData={updateSpouseData}
                scenario={scenario}
                setScenario={setScenario}
            />
        </div>
    );
};

export default Phase3International;
