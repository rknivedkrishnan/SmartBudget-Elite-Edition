
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  editingTransaction?: Transaction | null;
  type: TransactionType;
  availableIncomeSources: { id: string, name: string }[];
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  type,
  availableIncomeSources
}) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    notes: '',
    sourceId: ''
  });

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        name: editingTransaction.name,
        amount: editingTransaction.amount.toString(),
        date: editingTransaction.date,
        category: editingTransaction.category,
        notes: editingTransaction.notes || '',
        sourceId: editingTransaction.sourceId || ''
      });
    } else {
      setFormData({
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: categories[0],
        notes: '',
        sourceId: ''
      });
    }
  }, [editingTransaction, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type,
      name: formData.name,
      amount: parseFloat(formData.amount),
      date: formData.date,
      category: formData.category,
      notes: formData.notes,
      sourceId: type === 'expense' ? formData.sourceId : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-800">
        <div className={`p-6 ${type === 'income' ? 'bg-emerald-600' : 'bg-rose-600'} text-white`}>
          <h2 className="text-xl font-bold">
            {editingTransaction ? 'Edit' : 'Add'} {type === 'income' ? 'Income' : 'Expense'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder={type === 'income' ? "e.g. Salary" : "e.g. Rent"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Amount ($)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
            <select
              required
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {type === 'expense' && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Funded By (Source)</label>
              <select
                value={formData.sourceId}
                onChange={e => setFormData({ ...formData, sourceId: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">General Savings</option>
                {availableIncomeSources.map(source => (
                  <option key={source.id} value={source.id}>{source.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${
                type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {editingTransaction ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
