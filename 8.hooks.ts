// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// hooks/useAccountsFilter.ts
import { useMemo } from 'react';
import { useGetAccountsQuery } from '../api/depositsApi';
import { Account } from '../types/deposit';
import { 
  filterAccountsByRules, 
  filterAccountsByCurrency, 
  filterAccountsForDeal,
  sortAccountsByPriority 
} from '../utils/accountUtils';

export const useAccountsFilter = (dealCurrency?: string) => {
  const { data: accounts = [], isLoading, error } = useGetAccountsQuery();

  const filteredAccounts = useMemo(() => {
    if (!accounts.length) return [];
    
    const filtered = dealCurrency 
      ? filterAccountsForDeal(accounts, dealCurrency)
      : filterAccountsByRules(accounts);
    
    return sortAccountsByPriority(filtered);
  }, [accounts, dealCurrency]);

  const getRepaymentAccounts = useMemo(() => {
    return (fundingAccountId: string): Account[] => {
      if (!fundingAccountId || !accounts.length) return [];
      
      const fundingAccount = accounts.find(acc => acc.accountId === fundingAccountId);
      if (!fundingAccount) return [];
      
      const sameCurrencyAccounts = filterAccountsByCurrency(filteredAccounts, fundingAccount.currencyID);
      return sortAccountsByPriority(sameCurrencyAccounts);
    };
  }, [filteredAccounts, accounts]);

  return {
    accounts: filteredAccounts,
    getRepaymentAccounts,
    isLoading,
    error,
    rawAccounts: accounts,
  };
};

// hooks/useDealReference.ts
import { useState, useEffect } from 'react';
import { useDealInquiryMutation } from '../api/depositsApi';
import { useDebounce } from './useDebounce';

export const useDealReference = (customerKey: string) => {
  const [dealId, setDealId] = useState('');
  const [dealError, setDealError] = useState<string>('');
  const debouncedDealId = useDebounce(dealId, 500);
  
  const [dealInquiry, { isLoading }] = useDealInquiryMutation();

  const validateDealReference = async (dealId: string) => {
    if (!dealId.trim()) {
      setDealError('');
      return null;
    }

    try {
      const result = await dealInquiry({ dealId, customerKey }).unwrap();
      setDealError('');
      return result;
    } catch (error: any) {
      const errorMessage = error?.data?.errors?.[0]?.message || 'Invalid deal reference';
      setDealError(errorMessage);
      return null;
    }
  };

  useEffect(() => {
    if (debouncedDealId) {
      validateDealReference(debouncedDealId);
    }
  }, [debouncedDealId]);

  return {
    dealId,
    setDealId,
    dealError,
    isValidating: isLoading,
    validateDealReference,
  };
};

// hooks/useFormValidation.ts
import { useState, useCallback } from 'react';
import { FormErrors, NewDepositFormState } from '../types/deposit';
import { validateField, validateForm } from '../utils/validation';

export const useFormValidation = () => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateSingleField = useCallback((
    field: keyof NewDepositFormState,
    value: any,
    formState: NewDepositFormState
  ) => {
    const error = validateField(field, value, formState);
    setErrors(prev => ({
      ...prev,
      [field]: error || undefined,
    }));
    return !error;
  }, []);

  const validateAllFields = useCallback((formState: NewDepositFormState) => {
    const newErrors = validateForm(formState);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setAPIErrors = useCallback((apiErrors: FormErrors) => {
    setErrors(prev => ({ ...prev, ...apiErrors }));
  }, []);

  return {
    errors,
    validateSingleField,
    validateAllFields,
    clearError,
    clearAllErrors,
    setAPIErrors,
  };
};
