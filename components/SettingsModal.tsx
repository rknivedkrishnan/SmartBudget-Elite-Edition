
import React from 'react';
import { AppSettings, CurrencyCode, ExpenseCategory } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdate }) => {
  if (!isOpen) return null;

  const currencies: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', label: 'US Dollar', symbol: '$' },
    { code: 'EUR', label: 'Euro', symbol: '€' },
    { code: 'GBP', label: 'British Pound', symbol: '£' },
  ];

  const handleBudgetChange = (category: string, value: string) => {
    const amount = parseFloat(value) || 0;
    onUpdate({
      ...settings,
      categoryBudgets: {
        ...settings.categoryBudgets,
        [category]: amount
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl">
      <div className="glass-card rounded-[2.5rem] shadow-[0_0_100px_rgba(79,70,229,0.15)] w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3">
              <span className="text-indigo-500">⚙️</span> Configuration
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Operational Parameters</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 bg-white/5 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
          <section>
            <label className="block text-[10px] font-black text-slate-500 mb-6 uppercase tracking-[0.4em]">Primary Currency</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {currencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => onUpdate({ ...settings, currency: c.code })}
                  className={`p-4 rounded-2xl border flex flex-col items-center transition-all duration-300 ${settings.currency === c.code
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] ring-4 ring-indigo-500/10'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                >
                  <span className="text-2xl font-bold">{c.symbol}</span>
                  <span className="text-[9px] font-black mt-2 tracking-widest">{c.code}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="block text-[10px] font-black text-slate-500 mb-6 uppercase tracking-[0.4em]">Engine Intelligence</label>
            <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-400 text-sm">✨</div>
                <div>
                  <h4 className="text-white font-bold text-sm">Synthesis Processing Engine</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Local-first analytical synthesis</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter Secure Access Key..."
                  value={settings.geminiApiKey || ''}
                  onChange={(e) => onUpdate({ ...settings, geminiApiKey: e.target.value })}
                  className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/5 text-white text-sm font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-800"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
              </div>
              <p className="text-[9px] text-slate-600 mt-4 leading-relaxed">
                Your access key is stored locally in your browser and is only used to generate periodic financial synthesis reports.
              </p>
            </div>
          </section>

          <section>
            <label className="block text-[10px] font-black text-slate-500 mb-6 uppercase tracking-[0.4em]">Spending Thresholds</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.values(ExpenseCategory).map((cat) => (
                <div key={cat} className="flex flex-col gap-2 bg-white/[0.02] p-4 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat}</span>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-[11px] font-black">
                      {currencies.find(c => c.code === settings.currency)?.symbol}
                    </span>
                    <input
                      type="number"
                      placeholder="Limit"
                      value={settings.categoryBudgets?.[cat] || ''}
                      onChange={(e) => handleBudgetChange(cat, e.target.value)}
                      className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/5 text-white text-sm font-bold rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-800"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-8 bg-white/[0.02] border-t border-white/5">
          <button
            onClick={onClose}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-900/40 active:scale-95"
          >
            Apply Configurations
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
