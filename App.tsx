
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, BudgetSummary, MonthData, AppSettings } from './types';
import { INITIAL_STORAGE_KEY } from './constants';
import { getCurrentMonth, getMonthName } from './utils';
import TransactionList from './components/TransactionList';
import TransactionModal from './components/TransactionModal';
import SummarySection from './components/SummarySection';
import SettingsModal from './components/SettingsModal';
import LandingPage from './components/LandingPage';
import ReportsPage from './components/ReportsPage';

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
    currency: 'INR',
    language: 'en-US',
    categoryBudgets: {}
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('income');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'reports'>('landing');

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

  const incomeTransactions = useMemo(() =>
    currentMonthData.transactions.filter(t => t.type === 'income'),
    [currentMonthData]
  );

  const expenseTransactions = useMemo(() =>
    currentMonthData.transactions.filter(t => t.type === 'expense'),
    [currentMonthData]
  );

  const availableIncomeSources = useMemo(() => {
    return incomeTransactions.map(i => ({ id: i.id, name: i.name }));
  }, [incomeTransactions]);

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

    setShowSummary(false);
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
    setShowSummary(false);
  };

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setShowSummary(true);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 700);
  };

  const handleExport = () => {
    const report = {
      exportDate: new Date().toISOString(),
      activeMonth,
      currency: settings.currency,
      summary,
      transactions: currentMonthData.transactions
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartBudget_${activeMonth}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Website Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="font-bold text-lg tracking-tight">SmartBudget<span className="text-indigo-500">.</span></span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => setCurrentView('landing')}
                className={`text-sm font-semibold transition-colors ${currentView === 'landing' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`text-sm font-semibold transition-colors ${currentView === 'dashboard' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('reports')}
                className={`text-sm font-semibold transition-colors ${currentView === 'reports' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Reports
              </button>
              <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Support</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-9 flex items-center bg-white/5 border border-white/5 rounded-lg px-3 focus-within:border-indigo-500/50 transition-all">
              <input
                type="month"
                value={activeMonth}
                onChange={(e) => {
                  setActiveMonth(e.target.value);
                  setShowSummary(false);
                }}
                className="bg-transparent text-sm font-bold focus:outline-none [color-scheme:dark]"
              />
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-6 w-full py-10">
        {currentView === 'landing' ? (
          <LandingPage onStart={() => setCurrentView('dashboard')} />
        ) : currentView === 'reports' ? (
          <ReportsPage data={data} currency={settings.currency} />
        ) : (
          <>
            {/* Welcome Hero Section */}
            <section className="mb-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <p className="text-indigo-400 text-sm font-bold tracking-widest uppercase mb-2">Overview Terminal</p>
                  <h1 className="text-4xl font-black text-white tracking-tight">
                    {getMonthName(activeMonth)} <span className="text-slate-600">Performance</span>
                  </h1>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleCalculate}
                    disabled={isCalculating || currentMonthData.transactions.length === 0}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-3"
                  >
                    {isCalculating ? (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : <span className="text-lg">⚡</span>}
                    Generate Analysis
                  </button>
                </div>
              </div>
            </section>

            {/* Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-12">
              <div className="flex flex-col">
                <TransactionList
                  title="Income Sources"
                  icon="💵"
                  accentColor="bg-emerald-600"
                  transactions={incomeTransactions}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                  onAddClick={() => handleAddTransaction('income')}
                  currency={settings.currency}
                />
              </div>

              <div className="flex flex-col">
                <TransactionList
                  title="Operating Expenses"
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

            {/* Result Area */}
            {showSummary && (
              <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                <SummarySection
                  summary={summary}
                  transactions={currentMonthData.transactions}
                  onExport={handleExport}
                  currency={settings.currency}
                  geminiApiKey={settings.geminiApiKey}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-slate-900/50 border-t border-white/5 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="font-bold tracking-tight">SmartBudget.</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              Advanced financial tracking for modern professionals. Secure, fast, and driven by intelligent analytics.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-6">Product</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">API Reference</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-6">Company</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-600 text-xs">© 2024 SmartBudget Financial Systems. All rights reserved.</p>
          <div className="flex gap-6 text-slate-600">
            <svg className="w-5 h-5 cursor-pointer hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
            <svg className="w-5 h-5 cursor-pointer hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
          </div>
        </div>
      </footer>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        editingTransaction={editingTransaction}
        onSave={handleSaveTransaction}
        availableIncomeSources={availableIncomeSources}
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
