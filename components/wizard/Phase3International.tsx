import React from 'react';
import { FinancialData, SpouseData } from '../../types';
import InternationalPlanner from '../InternationalPlanner';

interface Phase3InternationalProps {
    data: FinancialData;
    currency: string;
    updateSpouseData: (key: keyof SpouseData, value: any) => void;
}

const Phase3International: React.FC<Phase3InternationalProps> = ({ data, currency, updateSpouseData }) => {
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <InternationalPlanner data={data} currency={currency} updateSpouseData={updateSpouseData} />
        </div>
    );
};

export default Phase3International;
