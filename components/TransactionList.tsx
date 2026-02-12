
import React from 'react';
import { Transaction, CurrencyCode } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  title: string;
  icon: string;
  accentColor: string;
  onAddClick: () => void;
  incomeSources?: Transaction[];
  currency: CurrencyCode;
  categoryBudgets?: Record<string, number>;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  title,
  icon,
  accentColor,
  onAddClick,
  incomeSources = [],
  currency,
  categoryBudgets = {}
}) => {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  const categoryTotals = transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const getSourceName = (id?: string) => {
    if (!id) return 'General';
    const source = incomeSources.find(i => i.id === id);
    return source ? source.name : 'General';
  };

  return (
    <div className="glass-card rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full min-h-[450px]">
      <div className={`p-5 ${accentColor} flex justify-between items-center text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full -mr-12 -mt-12"></div>
        <div className="flex items-center gap-3 relative z-10">
          <span className="text-xl drop-shadow-md">{icon}</span>
          <h2 className="font-extrabold uppercase tracking-[0.15em] text-[11px]">{title}</h2>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-all border border-white/10 active:scale-90 shadow-lg relative z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {transactions.length === 0 ? (
          <div className="text-center py-24 opacity-20 flex flex-col items-center">
            <span className="text-4xl mb-4">🕳️</span>
            <p className="text-[10px] font-black tracking-widest uppercase">No data points recorded</p>
          </div>
        ) : (
          transactions.map(t => {
            const budget = categoryBudgets[t.category];
            const currentTotal = categoryTotals[t.category];
            const isOverBudget = budget > 0 && currentTotal > budget;

            return (
              <div 
                key={t.id} 
                className={`group relative p-4 rounded-2xl border transition-all duration-300 ${
                  isOverBudget 
                  ? 'border-rose-500/40 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]' 
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="font-bold text-slate-100 truncate text-[13px] mb-1 group-hover:text-white transition-colors">
                      {t.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{formatDate(t.date)}</span>
                      <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-md ${
                        isOverBudget ? 'text-rose-400 bg-rose-500/10 animate-pulse' : 'text-slate-400 bg-white/5'
                      }`}>
                        {t.category} {isOverBudget && '!!'}
                      </span>
                      {t.type === 'expense' && (
                        <span className="text-[9px] text-indigo-400 font-bold uppercase">
                          Via: {getSourceName(t.sourceId)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-black text-sm whitespace-nowrap drop-shadow-md ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end mt-4 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(t); }}
                    className="px-3 py-1.5 bg-white/5 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-lg border border-white/5 transition-all text-[9px] font-black uppercase tracking-widest"
                  >
                    Modify
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                    className="px-3 py-1.5 bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white rounded-lg border border-white/5 transition-all text-[9px] font-black uppercase tracking-widest"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-5 bg-white/[0.02] border-t border-white/5">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">Total Aggregate</span>
          <span className={`text-lg font-black ${transactions.length > 0 ? (transactions[0].type === 'income' ? 'text-emerald-400 shadow-emerald-500/20' : 'text-rose-400 shadow-rose-500/20') : 'text-slate-600'}`}>
            {formatCurrency(total, currency)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
