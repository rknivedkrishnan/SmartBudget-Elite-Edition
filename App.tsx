
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, BudgetSummary, MonthData, AppSettings } from './types';
import { INITIAL_STORAGE_KEY } from './constants';
import { getCurrentMonth, getMonthName } from './utils';
import TransactionList from './components/TransactionList';
import TransactionModal from './components/TransactionModal';
import SummarySection from './components/SummarySection';
import SettingsModal from './components/SettingsModal';
import ChartSection from './components/ChartSection';
import TrendChart from './components/TrendChart';

const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }
};

const App: React.FC = () => {
  const [activeMonth, setActiveMonth] = useState(getCurrentMonth());
  const [data, setData] = useState<Record<string, MonthData>>({});
  const [settings, setSettings] = useState<AppSettings>({ 
    currency: 'USD', 
    language: 'en-US',
    categoryBudgets: {}
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('income');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showSummary, setShowSummary] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');

  useEffect(() => {
    const savedData = localStorage.getItem(INITIAL_STORAGE_KEY);
    const savedSettings = localStorage.getItem('smart_budget_settings');
    
    if (savedData) {
      try { setData(JSON.parse(savedData)); } catch (e) { console.error(e); }
    }
    if (savedSettings) {
      try { 
        const parsed = JSON.parse(savedSettings);
        setSettings({
          ...parsed,
          categoryBudgets: parsed.categoryBudgets || {}
        });
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(INITIAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('smart_budget_settings', JSON.stringify(settings));
  }, [settings]);

  const currentMonthData = useMemo(() => {
    return data[activeMonth] || { month: activeMonth, transactions: [] };
  }, [data, activeMonth]);

  const allMonthsData = useMemo(() => Object.values(data), [data]);

  const incomeTransactions = useMemo(() => 
    currentMonthData.transactions.filter(t => t.type === 'income'),
    [currentMonthData]
  );

  const expenseTransactions = useMemo(() => 
    currentMonthData.transactions.filter(t => t.type === 'expense'),
    [currentMonthData]
  );

  const summary: BudgetSummary = useMemo(() => {
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
    
    return { totalIncome, totalExpenses, netSavings, savingsRate };
  }, [incomeTransactions, expenseTransactions]);

  const handleAddTransaction = (type: TransactionType) => {
    setModalType(type);
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setModalType(transaction.type);
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: editingTransaction ? editingTransaction.id : generateId(),
    };

    setData(prev => {
      const currentTransactions = prev[activeMonth]?.transactions || [];
      const updatedTransactions = editingTransaction
        ? currentTransactions.map(t => t.id === editingTransaction.id ? newTransaction : t)
        : [...currentTransactions, newTransaction];
        
      return {
        ...prev,
        [activeMonth]: {
          month: activeMonth,
          transactions: updatedTransactions
        }
      };
    });
  };

  const handleDeleteTransaction = (id: string) => {
    setData(prev => {
      const monthObj = prev[activeMonth];
      if (!monthObj) return prev;
      return {
        ...prev,
        [activeMonth]: {
          ...monthObj,
          transactions: monthObj.transactions.filter(t => t.id !== id)
        }
      };
    });
  };

  const handleExport = () => {
    const report = { exportDate: new Date().toISOString(), summary, transactions: currentMonthData.transactions };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Budget_Report_${activeMonth}.json`;
    a.click();
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-600/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/3"></div>
      </div>

      {/* Website Sidebar */}
      <aside className="w-72 bg-slate-900/50 border-r border-white/5 flex flex-col z-20 backdrop-blur-xl shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="font-extrabold text-xl tracking-tighter">SmartBudget<span className="text-indigo-500">.</span></span>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', label: 'Dashboard' },
              { id: 'analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label: 'Insights' },
              { id: 'ledger', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Ledger' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activeNav === item.id 
                    ? 'bg-indigo-600/10 text-indigo-400 font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                </svg>
                <span className="text-sm">{item.label}</span>
                {activeNav === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group mb-4"
          >
            <svg className="w-5 h-5 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            <span className="text-sm">Settings</span>
          </button>
          
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs">JD</div>
              <div>
                <p className="text-xs font-bold text-white">John Doe</p>
                <p className="text-[10px] text-slate-500 font-medium">Enterprise Tier</p>
              </div>
            </div>
            <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">Sign Out</button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden">
        {/* Top bar */}
        <header className="h-20 bg-slate-950/50 border-b border-white/5 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-8">
            <div className="relative group">
              <input 
                type="month" 
                value={activeMonth}
                onChange={(e) => setActiveMonth(e.target.value)}
                className="bg-white/5 border border-white/5 hover:border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all [color-scheme:dark]"
              />
            </div>
            <div className="h-6 w-px bg-white/5"></div>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">System Ready</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-950"></span>
            </button>
            <div className="h-6 w-px bg-white/5"></div>
            <button 
              onClick={handleExport}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
            >
              Generate Report
            </button>
          </div>
        </header>

        {/* Scrollable Dashboard Section */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          {/* Welcome Section */}
          <section>
            <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.4em] mb-2">Workspace Overview</p>
            <h1 className="text-4xl font-black text-white tracking-tighter">{getMonthName(activeMonth)} <span className="text-slate-700">Analytics</span></h1>
          </section>

          {activeNav === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                 <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:bg-white/[0.04] transition-all group">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Total Inflow</p>
                    <p className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors">+{summary.totalIncome.toLocaleString(settings.language, { style: 'currency', currency: settings.currency })}</p>
                 </div>
                 <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:bg-white/[0.04] transition-all group">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Total Outflow</p>
                    <p className="text-3xl font-black text-white group-hover:text-rose-400 transition-colors">-{summary.totalExpenses.toLocaleString(settings.language, { style: 'currency', currency: settings.currency })}</p>
                 </div>
                 <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:bg-white/[0.04] transition-all group lg:col-span-2">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Net Performance</p>
                    <div className="flex items-end justify-between">
                      <p className={`text-4xl font-black ${summary.netSavings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {summary.netSavings.toLocaleString(settings.language, { style: 'currency', currency: settings.currency })}
                      </p>
                      <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${summary.savingsRate >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {summary.savingsRate.toFixed(1)}% Efficiency
                        </span>
                      </div>
                    </div>
                 </div>
              </div>

              {/* Functional Panels */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
                <div className="xl:col-span-6 h-full">
                  <TransactionList 
                    title="Revenue Streams"
                    icon="💵"
                    accentColor="bg-emerald-600"
                    transactions={incomeTransactions}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                    onAddClick={() => handleAddTransaction('income')}
                    currency={settings.currency}
                  />
                </div>
                <div className="xl:col-span-6 h-full">
                  <TransactionList 
                    title="Operational Burdens"
                    icon="💸"
                    accentColor="bg-rose-600"
                    transactions={expenseTransactions}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                    onAddClick={() => handleAddTransaction('expense')}
                    incomeSources={incomeTransactions}
                    currency={settings.currency}
                    categoryBudgets={settings.categoryBudgets}
                  />
                </div>
              </div>

              {/* Analysis Summary */}
              <SummarySection 
                summary={summary} 
                transactions={currentMonthData.transactions}
                onExport={handleExport}
                currency={settings.currency}
              />
            </div>
          )}

          {activeNav === 'analytics' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <ChartSection transactions={currentMonthData.transactions} currency={settings.currency} />
                 <TrendChart history={allMonthsData} currency={settings.currency} />
              </div>
            </div>
          )}

          {activeNav === 'ledger' && (
            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
               <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest">Full Ledger History</h2>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] border-b border-white/5">
                      <tr>
                        <th className="py-4">Date</th>
                        <th className="py-4">Record</th>
                        <th className="py-4">Category</th>
                        <th className="py-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {currentMonthData.transactions.map(t => (
                        <tr key={t.id} className="group hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 text-sm font-medium text-slate-400">{t.date}</td>
                          <td className="py-4 text-sm font-bold text-white">{t.name}</td>
                          <td className="py-4">
                            <span className="text-[10px] font-black px-2 py-0.5 bg-white/5 rounded-lg border border-white/5 uppercase tracking-widest text-slate-500">
                              {t.category}
                            </span>
                          </td>
                          <td className={`py-4 text-right font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString(settings.language, { style: 'currency', currency: settings.currency })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>
      </main>

      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        editingTransaction={editingTransaction}
        onSave={handleSaveTransaction}
        availableIncomeSources={incomeTransactions.map(i => ({ id: i.id, name: i.name }))}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdate={setSettings}
      />
    </div>
  );
};

export default App;
