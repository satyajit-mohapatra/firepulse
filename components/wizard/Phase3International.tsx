import React from 'react';
import { FinancialData } from '../../types';
import InternationalPlanner from '../InternationalPlanner';

interface Phase3InternationalProps {
    data: FinancialData;
    currency: string;
}

const Phase3International: React.FC<Phase3InternationalProps> = ({ data, currency }) => {
    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <InternationalPlanner data={data} currency={currency} />
        </div>
    );
};

export default Phase3International;
