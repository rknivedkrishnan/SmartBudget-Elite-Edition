
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
  
  // Status Logic: Healthy (<90%), Warning (90-100%), Loss (>100%)
  const isWarning = expenseRatio > 0.9 && expenseRatio <= 1.0;
  const isLoss = expenseRatio > 1.0;

  return (
    <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
      {/* Visual Status Indicator Strip */}
      <div className={`h-1.5 w-full ${
        isLoss ? 'bg-rose-500' : isWarning ? 'bg-orange-500' : 'bg-emerald-500'
      }`}></div>

      <div className="p-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Intelligence Advisory</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Automated Neural Analysis</p>
          </div>
          <button 
            onClick={handleGetInsights}
            disabled={isAiLoading || transactions.length === 0}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/20"
          >
            {isAiLoading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : <span className="text-lg">✨</span>}
            Synthesize Insights
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          <div className={`p-8 rounded-3xl border transition-all duration-700 flex flex-col items-center text-center ${
            isLoss 
              ? 'bg-rose-500/10 border-rose-500/50 scale-y-95 animate-breath-red shadow-[0_0_40px_rgba(239,68,68,0.2)]'
              : isWarning
                ? 'bg-orange-500/10 border-orange-500/50 scale-y-95 animate-breath shadow-[0_0_40px_rgba(249,115,22,0.2)]' 
                : 'bg-white/[0.02] border-white/5'
          }`}>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${
              isLoss ? 'text-rose-500' : isWarning ? 'text-orange-500' : 'text-slate-500'
            }`}>
              {isLoss ? 'Liquid Deficit' : isWarning ? 'Margin Critical' : 'Net Retention'}
            </p>
            <p className={`text-4xl font-black mb-2 ${
              isLoss ? 'text-rose-400' : isWarning ? 'text-orange-400' : 'text-emerald-500'
            }`}>
              {formatCurrency(summary.netSavings, currency)}
            </p>
            <div className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
              isLoss ? 'bg-rose-500/20 text-rose-500' : isWarning ? 'bg-orange-500/20 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              Efficiency: {summary.savingsRate.toFixed(1)}%
            </div>
          </div>

          <div className="lg:col-span-2 p-8 bg-white/[0.01] border border-white/5 rounded-3xl flex flex-col md:flex-row gap-8 items-center">
             <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-2xl shrink-0 ${
               isLoss ? 'bg-rose-600' : isWarning ? 'bg-orange-600' : 'bg-emerald-600'
             }`}>
               {isLoss ? '📉' : isWarning ? '⚠️' : '💎'}
             </div>
             <div>
               <h4 className="text-xl font-bold text-white mb-2">
                 {isLoss ? 'Immediate Liquidity Intervention' : isWarning ? 'Operational Compression Detected' : 'Optimal Growth Trajectory'}
               </h4>
               <p className="text-slate-400 text-sm leading-relaxed">
                 {isLoss
                   ? `You have exceeded your inflow limits by ${formatCurrency(Math.abs(summary.netSavings), currency)}. This deficit threatens short-term capital stability.`
                   : isWarning
                     ? `Expenses are consuming 90%+ of revenue. Your margin is dangerously low. Overhead reduction is advised to prevent deficit.`
                     : `Retention is optimal. Your current savings rate is within high-performance benchmarks for financial acceleration.`}
               </p>
             </div>
          </div>
        </div>

        {aiInsights && (
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-10 animate-in fade-in zoom-in duration-500 shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xl shadow-indigo-600/20">🤖</div>
              <h4 className="font-black text-white text-sm uppercase tracking-[0.3em]">Neural Advisory Dashboard</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {aiInsights.split('\n').filter(l => l.trim()).map((line, i) => (
                <div key={i} className="p-6 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-colors group">
                  <span className="text-indigo-500 font-black text-xs block mb-3 group-hover:scale-110 transition-transform origin-left">0{i+1}</span>
                  <p className="text-slate-400 text-sm leading-relaxed italic font-medium">{line.replace(/^-\s*/, '').replace(/^\d+\.\s*/, '')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummarySection;
