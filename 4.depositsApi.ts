// api/depositsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  Account,
  DealInquiryRequest,
  DealInquiryResponse,
  DepositValidationRequest,
  RateInquiryRequest,
  RateInquiryResponse,
  CreateDepositRequest,
  CreateDepositResponse,
  APIErrorResponse
} from '../types/deposit';

export const depositsApi = createApi({
  reducerPath: 'depositsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/',
    prepareHeaders: (headers, { getState }) => {
      // Add auth headers here
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Account', 'Deposit'],
  endpoints: (builder) => ({
    getAccounts: builder.query<Account[], void>({
      query: () => 'accounts',
      providesTags: ['Account'],
    }),
    
    dealInquiry: builder.mutation<DealInquiryResponse, DealInquiryRequest>({
      query: (body) => ({
        url: 'deposit-requests/deal-inquiry',
        method: 'POST',
        body,
      }),
    }),
    
    validateDeposit: builder.mutation<{}, DepositValidationRequest>({
      query: (body) => ({
        url: 'deposit-requests/validate',
        method: 'POST',
        body,
      }),
    }),
    
    rateInquiry: builder.mutation<RateInquiryResponse, RateInquiryRequest>({
      query: (body) => ({
        url: 'deposit-requests/rate-inquiry',
        method: 'POST',
        body,
      }),
    }),
    
    createDeposit: builder.mutation<CreateDepositResponse, CreateDepositRequest>({
      query: (body) => ({
        url: 'deposit-requests',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Deposit'],
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useDealInquiryMutation,
  useValidateDepositMutation,
  useRateInquiryMutation,
  useCreateDepositMutation,
} = depositsApi;
