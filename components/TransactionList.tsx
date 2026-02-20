
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
    <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden flex flex-col h-full shadow-lg">
      <div className="p-6 flex justify-between items-center border-b border-white/5 bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentColor} text-white shadow-lg`}>
            {icon}
          </div>
          <h2 className="font-bold text-white text-sm uppercase tracking-wider">{title}</h2>
        </div>
        <button 
          onClick={onAddClick}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-all border border-white/5 text-xs font-bold"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Add Record
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[500px] min-h-[400px]">
        {transactions.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <p className="text-[10px] font-bold tracking-widest uppercase">No ledger entries detected</p>
          </div>
        ) : (
          transactions.map(t => {
            const budget = categoryBudgets[t.category];
            const currentTotal = categoryTotals[t.category];
            const isOverBudget = budget > 0 && currentTotal > budget;

            return (
              <div 
                key={t.id} 
                className={`group p-4 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                  isOverBudget 
                  ? 'border-rose-500/20 bg-rose-500/5' 
                  : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-sm text-slate-100 truncate group-hover:text-white transition-colors">
                      {t.name}
                    </h3>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                      isOverBudget ? 'text-rose-400 bg-rose-500/10' : 'text-slate-500 bg-white/5'
                    }`}>
                      {t.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-slate-600 font-bold uppercase">{formatDate(t.date)}</span>
                    {t.type === 'expense' && (
                      <span className="text-[10px] text-indigo-500/80 font-bold uppercase truncate max-w-[120px]">
                        Ref: {getSourceName(t.sourceId)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <span className={`font-black text-sm tabular-nums ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                  </span>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => onEdit(t)}
                      className="p-1.5 text-slate-500 hover:text-indigo-400 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-6 bg-white/[0.01] border-t border-white/5">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Aggregate Total</span>
          <span className={`text-xl font-black tabular-nums ${total > 0 ? (transactions[0]?.type === 'income' ? 'text-emerald-500' : 'text-rose-500') : 'text-slate-600'}`}>
            {formatCurrency(total, currency)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
