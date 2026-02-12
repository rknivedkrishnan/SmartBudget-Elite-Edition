
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction, CurrencyCode } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { formatCurrency } from '../utils';

interface ChartSectionProps {
  transactions: Transaction[];
  currency: CurrencyCode;
}

const ChartSection: React.FC<ChartSectionProps> = ({ transactions, currency }) => {
  const expenses = transactions.filter(t => t.type === 'expense');
  
  const categoryData = expenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  if (expenses.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-10 text-center h-full flex flex-col justify-center border-dashed border-white/5">
        <div className="text-5xl mb-6 opacity-10">📊</div>
        <h3 className="text-slate-500 font-black uppercase tracking-widest text-[10px]">No telemetry detected</h3>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-6 h-full flex flex-col shadow-2xl">
      <h3 className="text-[10px] font-black text-slate-500 mb-6 flex items-center gap-2 uppercase tracking-[0.3em]">
        <span>📊</span> Flow Distribution
      </h3>
      <div className="flex-1 min-h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={10}
              dataKey="value"
              stroke="none"
            >
              {categoryData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={CATEGORY_COLORS[entry.name] || '#475569'} 
                  className="hover:opacity-80 transition-opacity outline-none"
                  style={{ filter: `drop-shadow(0 0 5px ${CATEGORY_COLORS[entry.name]}44)` }}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => formatCurrency(value, currency)}
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderRadius: '16px', 
                border: '1px solid #ffffff10',
                color: '#f8fafc',
                fontSize: '11px',
                fontWeight: 'bold',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)' 
              }}
              itemStyle={{ color: '#f8fafc' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 space-y-4">
        {categoryData.sort((a,b) => b.value - a.value).slice(0, 3).map((item) => (
          <div key={item.name} className="flex flex-col group">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.name}</span>
              <span className="text-[10px] font-black text-slate-200">{formatCurrency(item.value, currency)}</span>
            </div>
            <div className="w-full bg-white/[0.03] rounded-full h-1.5 overflow-hidden border border-white/5">
              <div 
                className="h-full rounded-full transition-all duration-1000" 
                style={{ 
                  width: `${(item.value / categoryData.reduce((s, c) => s + c.value, 0)) * 100}%`,
                  backgroundColor: CATEGORY_COLORS[item.name] || '#475569',
                  boxShadow: `0 0 10px ${CATEGORY_COLORS[item.name]}55`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartSection;
