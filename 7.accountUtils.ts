// utils/accountUtils.ts
import { Account } from '../types/deposit';

const ALLOWED_CURRENCIES = ['AED', 'USD', 'SAR', 'EUR'];

export const filterAccountsByRules = (accounts: Account[]): Account[] => {
  return accounts.filter(account => 
    account.status === 'Active' &&
    ALLOWED_CURRENCIES.includes(account.currencyID) &&
    account.productID.includes('CCA') &&
    account.rawProductId !== 'ODAZA' &&
    account.debitFrozen !== '1'
  );
};

export const filterAccountsByCurrency = (accounts: Account[], currency: string): Account[] => {
  return accounts.filter(account => account.currencyID === currency);
};

export const filterAccountsForDeal = (accounts: Account[], dealCurrency: string): Account[] => {
  const filteredAccounts = filterAccountsByRules(accounts);
  return filterAccountsByCurrency(filteredAccounts, dealCurrency);
};

export const sortAccountsByPriority = (accounts: Account[]): Account[] => {
  return [...accounts].sort((a, b) => {
    // Sort by status first (Active first)
    if (a.status !== b.status) {
      return a.status === 'Active' ? -1 : 1;
    }
    
    // Then by account number
    return a.accountId.localeCompare(b.accountId);
  });
};

export const formatAccountDisplay = (account: Account): string => {
  return `${account.name} (${account.accountId}) - ${account.currencyID} ${account.availableBalance.toLocaleString()}`;
};

export const getAccountCurrency = (accounts: Account[], accountId: string): string => {
  const account = accounts.find(acc => acc.accountId === accountId);
  return account?.currencyID || '';
};

export const getAccountBalance = (accounts: Account[], accountId: string): number => {
  const account = accounts.find(acc => acc.accountId === accountId);
  return account?.availableBalance || 0;
};

export const validateAccountSelection = (
  accounts: Account[],
  accountId: string,
  checkDebitFrozen: boolean = true
): string | null => {
  const account = accounts.find(acc => acc.accountId === accountId);
  
  if (!account) {
    return 'Selected account not found';
  }
  
  if (account.status !== 'Active') {
    return 'Selected account is not active';
  }
  
  if (checkDebitFrozen && account.debitFrozen === '1') {
    return 'Selected account is frozen for debits';
  }
  
  return null;
};
