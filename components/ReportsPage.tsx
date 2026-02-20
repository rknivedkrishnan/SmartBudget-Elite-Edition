
import React, { useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { MonthData, CurrencyCode } from '../types';
import { formatCurrency, getMonthName } from '../utils';

interface ReportsPageProps {
    data: Record<string, MonthData>;
    currency: CurrencyCode;
}

const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const ReportsPage: React.FC<ReportsPageProps> = ({ data, currency }) => {
    const chartData = useMemo(() => {
        return Object.entries(data)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, monthData]) => {
                const income = monthData.transactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
                const expense = monthData.transactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);

                return {
                    name: getMonthName(month),
                    income,
                    expense,
                    savings: income - expense
                };
            });
    }, [data]);

    const categoryData = useMemo(() => {
        const categories: Record<string, number> = {};
        Object.values(data).forEach(monthData => {
            monthData.transactions
                .filter(t => t.type === 'expense')
                .forEach(t => {
                    categories[t.category] = (categories[t.category] || 0) + t.amount;
                });
        });
        return Object.entries(categories)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [data]);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <section>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <p className="text-indigo-400 text-sm font-bold tracking-widest uppercase mb-2">Analytics Engine</p>
                        <h1 className="text-4xl font-black text-white tracking-tight">Financial <span className="text-slate-600">Intelligence</span></h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Revenue vs Outflow Chart */}
                    <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-8 flex items-center gap-2">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                            Capital Flow Analysis
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
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
                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                        tickFormatter={(v) => formatCurrency(v, currency).split('.')[0]}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="income" fill="#6366f1" radius={[6, 6, 0, 0]} name="Inflow" />
                                    <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Outflow" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Savings Trend */}
                    <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-8 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            Accumulation Velocity
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
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
                                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="savings"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorSavings)"
                                        name="Net Savings"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Category Distribution */}
                    <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl lg:col-span-2">
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-8">Resource Allocation</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={100}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {categoryData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-4">
                                {categoryData.slice(0, 6).map((entry, index) => (
                                    <div key={entry.name} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="text-xs font-bold text-slate-300">{entry.name}</span>
                                        </div>
                                        <span className="text-xs font-black text-white">{formatCurrency(entry.value, currency)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ReportsPage;
