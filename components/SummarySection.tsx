
import React, { useState } from 'react';
import { BudgetSummary, Transaction, CurrencyCode } from '../types';
import { formatCurrency } from '../utils';
import { getBudgetInsights } from '../geminiService';

interface SummarySectionProps {
  summary: BudgetSummary;
  transactions: Transaction[];
  onExport: () => void;
  currency: CurrencyCode;
}

const SummarySection: React.FC<SummarySectionProps> = ({ summary, transactions, onExport, currency }) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);

  const handleGetInsights = async () => {
    setIsAiLoading(true);
    setAiInsights(null);
    try {
      const insights = await getBudgetInsights(summary, transactions);
      setAiInsights(insights || null);
    } finally {
      setIsAiLoading(false);
    }
  };

  const isPositive = summary.netSavings >= 0;
  const expenseRatio = summary.totalIncome > 0 ? summary.totalExpenses / summary.totalIncome : 0;
  
  // States: Healthy (<90%), Warning (90-100%), Loss (>100%)
  const isWarning = expenseRatio > 0.9 && expenseRatio <= 1.0;
  const isLoss = expenseRatio > 1.0;

  return (
    <div className="glass-card rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Analysis Terminal</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Real-time data aggregation</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <button 
            onClick={handleGetInsights}
            disabled={isAiLoading || transactions.length === 0}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(79,70,229,0.3)]"
          >
            {isAiLoading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span className="text-base">✨</span>
            )}
            AI Synthesizer
          </button>
          <button 
            onClick={onExport}
            className="flex-1 md:flex-none px-8 py-4 bg-white/5 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
          >
            Export.JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-emerald-500/5 p-8 rounded-[2rem] border border-emerald-500/10 text-center shadow-inner group transition-transform hover:scale-[1.02]">
          <p className="text-emerald-500 font-black mb-3 uppercase tracking-[0.3em] text-[10px]">Total Inflow</p>
          <p className="text-4xl font-black text-emerald-400 group-hover:scale-105 transition-transform duration-500">{formatCurrency(summary.totalIncome, currency)}</p>
          <div className="w-12 h-1 bg-emerald-500/20 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="bg-rose-500/5 p-8 rounded-[2rem] border border-rose-500/10 text-center shadow-inner group transition-transform hover:scale-[1.02]">
          <p className="text-rose-500 font-black mb-3 uppercase tracking-[0.3em] text-[10px]">Total Outflow</p>
          <p className="text-4xl font-black text-rose-400 group-hover:scale-105 transition-transform duration-500">{formatCurrency(summary.totalExpenses, currency)}</p>
          <div className="w-12 h-1 bg-rose-500/20 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className={`
          p-8 rounded-[2rem] border text-center shadow-inner group transition-all duration-500
          ${isLoss 
            ? 'bg-rose-500/10 border-rose-500/50 scale-y-90 animate-breath-red shadow-[0_0_40px_rgba(239,68,68,0.2)]'
            : isWarning
              ? 'bg-orange-500/10 border-orange-500/50 scale-y-90 animate-breath shadow-[0_0_40px_rgba(249,115,22,0.2)]' 
              : isPositive 
                ? 'bg-indigo-500/5 border-indigo-500/20' 
                : 'bg-rose-500/5 border-rose-500/20'
          }
        `}>
          <p className={`font-black mb-3 uppercase tracking-[0.3em] text-[10px] ${
            isLoss ? 'text-rose-500' : isWarning ? 'text-orange-500' : isPositive ? 'text-indigo-400' : 'text-rose-400'
          }`}>
            {isLoss ? 'Liquid Deficit' : isWarning ? 'Critical Margin' : isPositive ? 'Net Surplus' : 'Liquid Deficit'}
          </p>
          <p className={`text-4xl font-black group-hover:scale-105 transition-transform duration-500 ${
            isLoss ? 'text-rose-400' : isWarning ? 'text-orange-400' : isPositive ? 'text-indigo-400' : 'text-rose-400'
          }`}>
            {formatCurrency(summary.netSavings, currency)}
          </p>
          <div className="flex justify-center items-center gap-2 mt-4">
            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${
              isLoss ? 'bg-rose-500/20 text-rose-500' : isWarning ? 'bg-orange-500/20 text-orange-500' : isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
               {summary.savingsRate.toFixed(1)}% Efficiency
            </span>
          </div>
        </div>
      </div>

      <div className={`relative overflow-hidden p-12 rounded-[2.5rem] text-center mb-12 transform transition-all duration-700 shadow-2xl ${
        isLoss
        ? 'bg-gradient-to-br from-rose-600 to-rose-900 shadow-rose-900/40'
        : isWarning
          ? 'bg-gradient-to-br from-orange-600 to-amber-700 shadow-orange-900/40'
          : isPositive 
            ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-emerald-900/40' 
            : 'bg-gradient-to-br from-rose-600 to-rose-800 shadow-rose-900/40'
      }`}>
        <div className="absolute top-0 right-0 p-8 opacity-10 scale-[3] rotate-12">
           {isLoss ? '📉' : isWarning ? '⚠️' : isPositive ? '💎' : '📉'}
        </div>
        <div className="relative z-10">
          <h3 className="text-4xl font-black mb-4 uppercase tracking-tighter">
            {isLoss ? 'Critical Deficit' : isWarning ? 'Operational Compression' : isPositive ? 'Optimal Trajectory' : 'Critical Imbalance'}
          </h3>
          <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            {isLoss
              ? `Operational deficit detected. Your current burns exceed inflows by ${formatCurrency(summary.netSavings, currency)}. Immediate optimization recommended.`
              : isWarning
                ? `Expenses are currently consuming over 90% of your income. Your financial structure is under heavy compression. Immediate overhead reduction advised.`
                : isPositive 
                  ? `Strategic retention successful. You have accumulated ${formatCurrency(summary.netSavings, currency)} of net capital this cycle.`
                  : `Operational deficit detected. Your current burns exceed inflows by ${formatCurrency(summary.netSavings, currency)}. Immediate optimization recommended.`}
          </p>
        </div>
      </div>

      {aiInsights && (
        <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-10 animate-in fade-in slide-in-from-bottom-6 duration-700 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(79,70,229,0.4)]">🤖</div>
            <div>
              <h4 className="font-black text-white uppercase tracking-[0.3em] text-[11px]">Neural Advisories</h4>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Synthesized by Gemini Intelligence</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aiInsights.split('\n').filter(l => l.trim()).map((line, i) => (
              <div key={i} className="flex flex-col gap-4 p-6 bg-white/[0.03] rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all">
                <span className="text-indigo-500 font-black text-xl">0{i+1}</span>
                <p className="text-slate-300 text-sm leading-relaxed font-medium italic">{line.replace(/^-\s*/, '').replace(/^\d+\.\s*/, '')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummarySection;
