// hooks/useNewDepositForm.ts
import { useReducer, useCallback } from 'react';
import { NewDepositFormState, FormAction } from '../types/deposit';

const initialState: NewDepositFormState = {
  hasDealReference: false,
  referenceNumber: '',
  fundingAccount: '',
  repaymentAccount: '',
  amount: '',
  startDate: new Date().toISOString().split('T')[0],
  maturityDate: '',
  maturityInstruction: '',
  remarks: '',
  dealData: undefined,
  previewData: undefined,
};

function formReducer(state: NewDepositFormState, action: FormAction): NewDepositFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };
    
    case 'SET_DEAL_DATA':
      return {
        ...state,
        dealData: action.data,
        fundingAccount: action.data.fundingAccount,
        repaymentAccount: action.data.repaymentAccount || '',
        amount: action.data.amount.toString(),
        startDate: action.data.startDate,
        maturityDate: action.data.maturityDate,
      };
    
    case 'SET_PREVIEW_DATA':
      return {
        ...state,
        previewData: action.data,
      };
    
    case 'TOGGLE_DEAL_REFERENCE':
      return {
        ...initialState,
        hasDealReference: action.value,
        startDate: new Date().toISOString().split('T')[0],
      };
    
    case 'RESET_FORM':
      return {
        ...initialState,
        startDate: new Date().toISOString().split('T')[0],
      };
    
    default:
      return state;
  }
}

export const useNewDepositForm = () => {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const setField = useCallback((field: keyof NewDepositFormState, value: any) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  const setDealData = useCallback((data: any) => {
    dispatch({ type: 'SET_DEAL_DATA', data });
  }, []);

  const setPreviewData = useCallback((data: any) => {
    dispatch({ type: 'SET_PREVIEW_DATA', data });
  }, []);

  const toggleDealReference = useCallback((value: boolean) => {
    dispatch({ type: 'TOGGLE_DEAL_REFERENCE', value });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  return {
    state,
    setField,
    setDealData,
    setPreviewData,
    toggleDealReference,
    resetForm,
  };
};
