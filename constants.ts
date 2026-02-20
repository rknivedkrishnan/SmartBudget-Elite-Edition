
import { IncomeCategory, ExpenseCategory } from './types';

export const INCOME_CATEGORIES = Object.values(IncomeCategory);
export const EXPENSE_CATEGORIES = Object.values(ExpenseCategory);

export const CATEGORY_COLORS: Record<string, string> = {
  [ExpenseCategory.Housing]: '#3b82f6', // blue
  [ExpenseCategory.Utilities]: '#06b6d4', // cyan
  [ExpenseCategory.Food]: '#10b981', // emerald
  [ExpenseCategory.Transportation]: '#f59e0b', // amber
  [ExpenseCategory.Entertainment]: '#8b5cf6', // violet
  [ExpenseCategory.Healthcare]: '#ef4444', // red
  [ExpenseCategory.Shopping]: '#ec4899', // pink
  [ExpenseCategory.Subscriptions]: '#6366f1', // indigo
  [ExpenseCategory.Other]: '#94a3b8', // slate
};

export const INITIAL_STORAGE_KEY = 'smart_budget_data';
