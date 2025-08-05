// types/deposit.ts

export interface Account {
  accountId: string;
  name: string;
  availableBalance: number;
  currencyID: string;
  status: string;
  productID: string;
  creditFrozen: string;
  debitFrozen: string;
  rawProductId?: string;
}

export interface DealInquiryRequest {
  dealId: string;
  customerKey: string;
}

export interface DealInquiryResponse {
  amount: number;
  currency: string;
  fundingAccount: string;
  repaymentAccount?: string;
  startDate: string;
  maturityDate: string;
  numberOfDays: number;
  standardRate?: number;
  specialRate?: number;
  maturityAmount: number;
}

export interface DepositValidationRequest {
  dealReference?: string;
  fundingAccount: string;
  repaymentAccount: string;
  amount: number;
  startDate: string;
  numberOfDays: number;
  maturityInstruction: string;
  remarks?: string;
  currency: string;
}

export interface RateInquiryRequest {
  depositAmount: number;
  numberOfDays: number;
  currency: string;
  startDate: string;
}

export interface RateInquiryResponse {
  interestRate: number;
  maturityAmount: number;
  maturityDate: string;
}

export interface CreateDepositRequest extends DepositValidationRequest {}

export interface CreateDepositResponse {
  reference: string;
  status: string;
}

export interface APIError {
  field: string;
  message: string;
}

export interface APIErrorResponse {
  errors: APIError[];
}

export type MaturityInstruction = 
  | 'PRINCIPAL_PLUS_PROFIT_ENCASHMENT'
  | 'PRINCIPAL_ROLLOVER' 
  | 'PRINCIPAL';

export interface NewDepositFormState {
  hasDealReference: boolean;
  referenceNumber: string;
  fundingAccount: string;
  repaymentAccount: string;
  amount: string;
  startDate: string;
  maturityDate: string;
  maturityInstruction: MaturityInstruction | '';
  remarks: string;
  dealData?: DealInquiryResponse;
  previewData?: RateInquiryResponse;
}

export interface FormErrors {
  [key: string]: string;
}

export type FormAction = 
  | { type: 'SET_FIELD'; field: keyof NewDepositFormState; value: any }
  | { type: 'SET_DEAL_DATA'; data: DealInquiryResponse }
  | { type: 'SET_PREVIEW_DATA'; data: RateInquiryResponse }
  | { type: 'RESET_FORM' }
  | { type: 'TOGGLE_DEAL_REFERENCE'; value: boolean };

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any, formState: NewDepositFormState) => string | null;
}
