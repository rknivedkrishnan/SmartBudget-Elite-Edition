
import React, { useState } from 'react';
import { BudgetSummary, Transaction, CurrencyCode } from '../types';
import { formatCurrency } from '../utils';
import { getBudgetInsights } from '../geminiService';

interface SummarySectionProps {
  summary: BudgetSummary;
  transactions: Transaction[];
  onExport: () => void;
  currency: CurrencyCode;
  geminiApiKey?: string;
  onOpenSettings?: () => void;
}

const SummarySection: React.FC<SummarySectionProps> = ({ summary, transactions, onExport, currency, geminiApiKey, onOpenSettings }) => {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleGetInsights = async () => {
    setIsAiLoading(true);
    setAiInsights(null);
    setAiError(null);
    try {
      const insights = await getBudgetInsights(summary, transactions, geminiApiKey);
      setAiInsights(insights || null);
    } catch (error: any) {
      setAiError(error.message || "Failed to generate insights");
    } finally {
      setIsAiLoading(false);
    }
  };


  const expenseRatio = summary.totalIncome > 0 ? summary.totalExpenses / summary.totalIncome : 0;

  const isWarning = expenseRatio > 0.9 && expenseRatio <= 1.0;
  const isLoss = expenseRatio > 1.0;

  return (
    <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Intelligence Report</h2>
          <p className="text-slate-500 text-xs font-medium mt-1">Aggregated results for the current billing cycle</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGetInsights}
            disabled={isAiLoading || transactions.length === 0}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isAiLoading ? (
              <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : <span>✨</span>}
            Executive Synthesis
          </button>
          <button
            onClick={onExport}
            className="px-5 py-2.5 bg-white/5 text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-all border border-white/5"
          >
            Export.JSON
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl group transition-all hover:bg-white/[0.04]">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Cycle Inflow</p>
            <p className="text-3xl font-black text-emerald-500">{formatCurrency(summary.totalIncome, currency)}</p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl group transition-all hover:bg-white/[0.04]">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Cycle Outflow</p>
            <p className="text-3xl font-black text-rose-500">{formatCurrency(summary.totalExpenses, currency)}</p>
          </div>

          <div className={`
            p-6 rounded-2xl border transition-all duration-500
            ${isLoss
              ? 'bg-rose-500/10 border-rose-500/50 scale-y-90 animate-breath-red'
              : isWarning
                ? 'bg-orange-500/10 border-orange-500/50 scale-y-90 animate-breath'
                : 'bg-indigo-500/5 border-indigo-500/20'
            }
          `}>
            <p className={`font-bold uppercase tracking-widest text-[10px] mb-2 ${isLoss ? 'text-rose-500' : isWarning ? 'text-orange-500' : 'text-indigo-400'
              }`}>
              {isLoss ? 'Liquid Deficit' : isWarning ? 'Margin Alert' : 'Net Surplus'}
            </p>
            <p className={`text-3xl font-black ${isLoss ? 'text-rose-400' : isWarning ? 'text-orange-400' : 'text-indigo-400'
              }`}>
              {formatCurrency(summary.netSavings, currency)}
            </p>
            <div className={`mt-3 inline-block px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${isLoss ? 'bg-rose-500/20 text-rose-500' : isWarning ? 'bg-orange-500/20 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'
              }`}>
              {summary.savingsRate.toFixed(1)}% Ratio
            </div>
          </div>
        </div>

        <div className={`relative p-8 rounded-2xl border overflow-hidden transition-all duration-700 mb-10 ${isLoss
          ? 'bg-rose-950/30 border-rose-500/20'
          : isWarning
            ? 'bg-orange-950/30 border-orange-500/20'
            : 'bg-emerald-950/30 border-emerald-500/20'
          }`}>
          <div className="flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg shrink-0 ${isLoss ? 'bg-rose-600 text-white' : isWarning ? 'bg-orange-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
              {isLoss ? '📉' : isWarning ? '⚠️' : '💎'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                {isLoss ? 'Critical Disruption Detected' : isWarning ? 'Financial Compression Underway' : 'Growth Trajectory Optimal'}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                {isLoss
                  ? `Your expenditures have exceeded total inflows by ${formatCurrency(Math.abs(summary.netSavings), currency)}. This represents a critical liquidity risk. Immediate cost-cutting measures are required to stabilize the cycle.`
                  : isWarning
                    ? `Expenses are currently consuming over 90% of your incoming capital. Your margin of error is extremely thin. Review discretionary spending to reclaim operational freedom.`
                    : `You have successfully retained ${formatCurrency(summary.netSavings, currency)} this cycle. Your savings rate of ${summary.savingsRate.toFixed(1)}% is within professional benchmarks for wealth accumulation.`}
              </p>
            </div>
          </div>
        </div>

        {(aiInsights || aiError) && (
          <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm shadow-indigo-600/20">💎</div>
              <h4 className="font-bold text-white text-sm uppercase tracking-widest">Strategic Synthesis Dashboard</h4>
            </div>

            {aiError ? (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-6 flex flex-col items-center text-center">
                <span className="text-2xl mb-3">⚠️</span>
                <h5 className="text-white font-bold text-sm mb-2">Synthesis Service Offline</h5>
                <p className="text-slate-400 text-xs mb-4 max-w-md leading-relaxed">
                  {aiError === "Missing Gemini API Key"
                    ? "The Strategic Synthesis engine requires a secure access key to provide deep financial insights."
                    : aiError}
                </p>
                {aiError === "Missing Gemini API Key" && onOpenSettings && (
                  <button
                    onClick={onOpenSettings}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                  >
                    Configure Access Key
                  </button>
                )}
              </div>
            ) : aiInsights && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {aiInsights.split('\n').filter(l => l.trim()).map((line, i) => (
                  <div key={i} className="p-5 bg-white/[0.02] rounded-xl border border-white/5">
                    <span className="text-indigo-500 font-black text-xs block mb-2">0{i + 1}</span>
                    <p className="text-slate-400 text-sm leading-relaxed italic">{line.replace(/^-\s*/, '').replace(/^\d+\.\s*/, '')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SummarySection;
