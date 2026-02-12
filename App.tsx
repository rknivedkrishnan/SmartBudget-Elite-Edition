
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, BudgetSummary, MonthData, AppSettings } from './types';
import { INITIAL_STORAGE_KEY } from './constants';
import { getCurrentMonth, getMonthName } from './utils';
import TransactionList from './components/TransactionList';
import TransactionModal from './components/TransactionModal';
import SummarySection from './components/SummarySection';
import SettingsModal from './components/SettingsModal';

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
    <div className="min-h-screen relative overflow-x-hidden pb-20">
      {/* Glow Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full animate-blob pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] rounded-full animate-blob pointer-events-none z-0" style={{ animationDelay: '-5s' }}></div>
      <div className="fixed top-[40%] left-[30%] w-[30%] h-[30%] bg-purple-600/5 blur-[120px] rounded-full animate-blob pointer-events-none z-0" style={{ animationDelay: '-10s' }}></div>

      <header className="bg-slate-950/60 border-b border-white/5 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-xl shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              💰
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tighter leading-tight">
                SmartBudget
              </h1>
              <span className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em]">Elite Edition</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center bg-white/5 hover:bg-white/10 rounded-full px-4 py-2 border border-white/5 transition-all shadow-inner group">
              <input 
                type="month" 
                value={activeMonth}
                onChange={(e) => {
                  setActiveMonth(e.target.value);
                  setShowSummary(false);
                }}
                className="bg-transparent text-slate-100 font-bold focus:outline-none [color-scheme:dark] text-sm cursor-pointer"
              />
            </div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-all text-slate-400 hover:text-white active:scale-95"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        <div className="mb-16 flex flex-col items-center text-center">
          <h2 className="text-6xl font-black text-white mb-3 tracking-tighter drop-shadow-lg">
            {getMonthName(activeMonth)}
          </h2>
          <div className="flex items-center gap-4 text-slate-500 font-black uppercase text-[10px] tracking-[0.4em]">
            <span className="w-10 h-[1px] bg-white/10"></span>
            Financial Command Center
            <span className="w-10 h-[1px] bg-white/10"></span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="h-full">
            <TransactionList 
              title="Cash Inflow"
              icon="💵"
              accentColor="bg-emerald-500"
              transactions={incomeTransactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onAddClick={() => handleAddTransaction('income')}
              currency={settings.currency}
            />
          </div>

          <div className="h-full">
            <TransactionList 
              title="Cash Outflow"
              icon="💸"
              accentColor="bg-rose-500"
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

        <div className="flex justify-center mb-24 mt-12">
          <button
            onClick={handleCalculate}
            disabled={isCalculating || currentMonthData.transactions.length === 0}
            className={`
              relative overflow-hidden group px-16 py-7 rounded-3xl font-black text-lg 
              transition-all duration-500 transform hover:scale-[1.03] active:scale-[0.98]
              shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed
              ${showSummary 
                ? 'bg-white text-slate-900 shadow-[0_0_40px_rgba(255,255,255,0.1)]' 
                : 'bg-indigo-600 text-white shadow-[0_0_40px_rgba(79,70,229,0.25)] hover:shadow-[0_0_60px_rgba(79,70,229,0.4)]'
              }
            `}
          >
            <div className="flex items-center gap-4 relative z-10">
              {isCalculating ? (
                 <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
              ) : (
                <span className="text-2xl">{showSummary ? '⚡' : '🔮'}</span>
              )}
              {showSummary ? 'REFRESH INSIGHTS' : 'REVEAL REPORT'}
            </div>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </button>
        </div>

        {showSummary && (
          <div className="animate-in fade-in zoom-in slide-in-from-bottom-12 duration-1000">
             <SummarySection 
              summary={summary} 
              transactions={currentMonthData.transactions}
              onExport={handleExport}
              currency={settings.currency}
            />
          </div>
        )}
      </main>

      <footer className="mt-20 py-16 border-t border-white/5 text-center">
        <div className="max-w-6xl mx-auto px-4 opacity-30">
          <p className="font-black tracking-[0.5em] uppercase text-[9px]">Advanced Financial Synthesis • v2.5.0</p>
          <p className="text-[8px] mt-2 font-bold tracking-[0.2em] uppercase">Built for high performance assets</p>
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
