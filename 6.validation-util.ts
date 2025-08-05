// utils/validation.ts
import { NewDepositFormState, ValidationRules, FormErrors, APIError } from '../types/deposit';

export const validationRules: Record<keyof NewDepositFormState, ValidationRules> = {
  hasDealReference: {},
  referenceNumber: {
    required: true,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9]+$/,
  },
  fundingAccount: {
    required: true,
  },
  repaymentAccount: {
    required: true,
  },
  amount: {
    required: true,
    min: 1,
    custom: (value, formState) => {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        return 'Amount must be greater than 0';
      }
      return null;
    },
  },
  startDate: {
    required: true,
  },
  maturityDate: {
    required: true,
    custom: (value, formState) => {
      if (!value || !formState.startDate) return null;
      
      const start = new Date(formState.startDate);
      const maturity = new Date(value);
      const today = new Date();
      const diffDays = Math.ceil((maturity.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (maturity <= start) {
        return 'Maturity date must be after start date';
      }
      
      if (diffDays < 7) {
        return 'Maturity date must be at least 7 days from today';
      }
      
      if (diffDays > 365) {
        return 'Maturity date cannot exceed 365 days';
      }
      
      return null;
    },
  },
  maturityInstruction: {
    required: true,
  },
  remarks: {
    maxLength: 500,
  },
  dealData: {},
  previewData: {},
};

export const validateField = (
  field: keyof NewDepositFormState,
  value: any,
  formState: NewDepositFormState
): string | null => {
  const rules = validationRules[field];
  
  if (rules.required && (!value || value === '')) {
    return `${field} is required`;
  }
  
  if (value && rules.minLength && value.length < rules.minLength) {
    return `${field} must be at least ${rules.minLength} characters`;
  }
  
  if (value && rules.maxLength && value.length > rules.maxLength) {
    return `${field} must be no more than ${rules.maxLength} characters`;
  }
  
  if (value && rules.pattern && !rules.pattern.test(value)) {
    return `${field} format is invalid`;
  }
  
  if (value && rules.min && parseFloat(value) < rules.min) {
    return `${field} must be at least ${rules.min}`;
  }
  
  if (value && rules.max && parseFloat(value) > rules.max) {
    return `${field} must be no more than ${rules.max}`;
  }
  
  if (rules.custom) {
    return rules.custom(value, formState);
  }
  
  return null;
};

export const validateForm = (formState: NewDepositFormState): FormErrors => {
  const errors: FormErrors = {};
  
  const fieldsToValidate: (keyof NewDepositFormState)[] = formState.hasDealReference
    ? ['referenceNumber', 'fundingAccount', 'repaymentAccount', 'maturityInstruction']
    : ['fundingAccount', 'repaymentAccount', 'amount', 'startDate', 'maturityDate', 'maturityInstruction'];
  
  // Always validate remarks if present
  if (formState.remarks) {
    fieldsToValidate.push('remarks');
  }
  
  fieldsToValidate.forEach(field => {
    const error = validateField(field, formState[field], formState);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};

export const mapAPIErrorsToFields = (apiErrors: APIError[]): FormErrors => {
  const errors: FormErrors = {};
  
  apiErrors.forEach(error => {
    const friendlyMessage = getFriendlyErrorMessage(error.message);
    errors[error.field] = friendlyMessage;
  });
  
  return errors;
};

const getFriendlyErrorMessage = (apiMessage: string): string => {
  const errorMap: Record<string, string> = {
    'deposit.amount.exceeds-balance': 'Amount exceeds available balance',
    'deposit.maturityDate.exceeds-max-tenor': 'Maturity date exceeds maximum allowed period',
    'Pattern': 'Invalid format or special characters not allowed',
    'Invalid deal reference': 'Deal reference number is invalid or expired',
    'deposit.duplicate-request': 'A similar deposit request already exists',
  };
  
  return errorMap[apiMessage] || 'An error occurred. Please check your input.';
};
