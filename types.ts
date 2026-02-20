
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  name: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
  sourceId?: string; // Links expense to an income transaction's ID
}

export interface MonthData {
  month: string; // YYYY-MM
  transactions: Transaction[];
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
}

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface AppSettings {
  currency: CurrencyCode;
  language: string;
  categoryBudgets: Record<string, number>; // Category -> Limit amount
  geminiApiKey?: string;
}

export enum IncomeCategory {
  Salary = 'Salary',
  Freelance = 'Freelance',
  SideHustle = 'Side Hustle',
  Investments = 'Investments',
  Other = 'Other'
}

export enum ExpenseCategory {
  Housing = 'Housing',
  Utilities = 'Utilities',
  Food = 'Food & Groceries',
  Transportation = 'Transportation',
  Entertainment = 'Entertainment',
  Healthcare = 'Healthcare',
  Shopping = 'Shopping',
  Subscriptions = 'Subscriptions',
  Other = 'Other'
}
