name: react-charts
description: Recharts patterns for data visualization. Use when creating charts, visualizing financial projections, or displaying data graphs.
---

**Library:** Recharts 3.6.0

## Chart Components

Reference: `components/ProjectionChart.tsx`, `components/InternationalProjectionChart.tsx`

## Line Chart Pattern

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ProjectionChart: React.FC<{
    data: YearProjection[];
    currencySymbol: string;
}> = ({ data, currencySymbol }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `${currencySymbol}${value}`} />
                <Tooltip formatter={(value: number) => [formatCurrencyCompact(value), '']} />
                <Legend />
                <Line type="monotone" dataKey="netWorth" stroke="#8884d8" name="Net Worth" />
                <Line type="monotone" dataKey="fiNumber" stroke="#82ca9d" name="FI Number" />
            </LineChart>
        </ResponsiveContainer>
    );
};
```

## Common Recharts Components

```tsx
<ResponsiveContainer width="100%" height={400}>
    <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />  // Grid lines
        <XAxis dataKey="year" />                 // X-axis
        <YAxis tickFormatter={formatter} />      // Y-axis with formatting
        <Tooltip formatter={formatter} />        // Hover tooltip
        <Legend />                               // Legend
        <Line
            type="monotone"                      // Line smoothing
            dataKey="netWorth"                    // Data field
            stroke="#4F46E5"                      // Line color
            strokeWidth={2}
            name="Net Worth"
            dot={false}                           // Hide dots
        />
    </LineChart>
</ResponsiveContainer>
```

## Data Preparation

```tsx
// Transform calculation results for Recharts
const chartData = results.projections.map(p => ({
    year: p.year,
    age: p.age,
    netWorth: p.netWorth,
    fiNumber: p.fiNumber,
    expenses: p.totalOutflow,
}));
```

## Styling Charts

- Use `stroke` prop for line colors
- Use `strokeWidth` for line thickness
- Use `dot={false}` to remove data points
- Use `tickFormatter` on axes for formatted values
- Use `formatter` on Tooltip for formatted values
