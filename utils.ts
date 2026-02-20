
import { CurrencyCode } from './types';

export const formatCurrency = (amount: number, currency: CurrencyCode = 'USD'): string => {
  const locales: Record<CurrencyCode, string> = {
    'USD': 'en-US',
    'INR': 'en-IN',
    'EUR': 'de-DE',
    'GBP': 'en-GB'
  };

  return new Intl.NumberFormat(locales[currency] || 'en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getCurrentMonth = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const getMonthName = (monthStr: string): string => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};
