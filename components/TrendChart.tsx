
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { MonthData, CurrencyCode } from '../types';
import { formatCurrency } from '../utils';

interface TrendChartProps {
  history: MonthData[];
  currency: CurrencyCode;
}

const TrendChart: React.FC<TrendChartProps> = ({ history, currency }) => {
  const data = history.map(h => {
    const income = h.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = h.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const [year, month] = h.month.split('-');
    const label = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', { month: 'short' });
    
    return {
      name: label,
      income,
      expenses,
      net: income - expenses
    };
  }).reverse();

  return (
    <div className="glass-card rounded-3xl p-6 shadow-2xl">
      <h3 className="text-[10px] font-black text-slate-500 mb-6 uppercase tracking-[0.3em] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
        6-Month Performance
      </h3>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 9 }}
              tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
            />
            <Tooltip 
              cursor={{ fill: '#ffffff05' }}
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                border: '1px solid #ffffff10', 
                borderRadius: '12px',
                fontSize: '11px',
                backdropFilter: 'blur(10px)'
              }}
              formatter={(value: number) => formatCurrency(value, currency)}
            />
            <Legend 
              iconType="circle" 
              wrapperStyle={{ paddingTop: '20px', fontSize: '9px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em' }} 
            />
            <Bar dataKey="income" name="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} fillOpacity={0.8} />
            <Bar dataKey="expenses" name="Outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={16} fillOpacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
