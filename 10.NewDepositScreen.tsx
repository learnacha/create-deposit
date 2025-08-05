// screens/NewDepositScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useNewDepositForm } from '../hooks/useNewDepositForm';
import { useFormValidation } from '../hooks/useFormValidation';
import { useAccountsFilter } from '../hooks/useAccountsFilter';
import { useDealReference } from '../hooks/useDealReference';
import {
  useValidateDepositMutation,
  useRateInquiryMutation,
  useCreateDepositMutation,
} from '../api/depositsApi';

import { DealReferenceSection } from '../components/DealReferenceSection';
import { AccountSelectionSection } from '../components/AccountSelectionSection';
import { DepositDetailsSection } from '../components/DepositDetailsSection';
import { RemarksSection } from '../components/RemarksSection';
import { PreviewSection } from '../components/PreviewSection';

import { getAccountCurrency, getAccountBalance } from '../utils/accountUtils';
import { mapAPIErrorsToFields } from '../utils/validation';
import { MaturityInstruction } from '../types/deposit';

interface NewDepositScreenProps {
  customerKey: string; // Passed from navigation or context
}

export const NewDepositScreen: React.FC<NewDepositScreenProps> = ({ 
  customerKey = 'CUSTKEY001' // Default for demo
}) => {
  const navigation = useNavigation();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Form state management
  const { state, setField, setDealData, setPreviewData, toggleDealReference } = useNewDepositForm();
  const { errors, validateAllFields, setAPIErrors, clearAllErrors } = useFormValidation();

  // Deal reference handling
  const { 
    dealId, 
    setDealId, 
    dealError, 
    isValidating 
  } = useDealReference(customerKey);

  // Account filtering
  const dealCurrency = state.dealData?.currency;
  const { 
    accounts: fundingAccounts, 
    getRepaymentAccounts, 
    isLoading: accountsLoading 
  } = useAccountsFilter(dealCurrency);

  // API mutations
  const [validateDeposit, { isLoading: isValidatingDeposit }] = useValidateDepositMutation();
  const [rateInquiry, { isLoading: isLoadingRate }] = useRateInquiryMutation();
  const [createDeposit, { isLoading: isSubmitting }] = useCreateDepositMutation();

  // Get repayment accounts based on funding account selection
  const repaymentAccounts = getRepaymentAccounts(state.fundingAccount);

  // Get currency from selected funding account
  const selectedCurrency = state.dealData?.currency || 
    getAccountCurrency(fundingAccounts, state.fundingAccount) || 'AED';

  // Calculate number of days
  const numberOfDays = state.maturityDate && state.startDate
    ? Math.ceil((new Date(state.maturityDate).getTime() - new Date(state.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Handle deal reference change
  useEffect(() => {
    if (state.hasDealReference) {
      setField('referenceNumber', dealId);
    }
  }, [dealId, state.hasDealReference]);

  // Handle deal reference toggle
  const handleToggleDealReference = (value: boolean) => {
    toggleDealReference(value);
    setDealId('');
    clearAllErrors();
    setIsPreviewMode(false);
  };

  // Handle field changes with validation
  const handleFieldChange = (field: keyof typeof state, value: any) => {
    setField(field, value);
    
    // Clear repayment account if funding account changes
    if (field === 'fundingAccount' && state.repaymentAccount) {
      const newCurrency = getAccountCurrency(fundingAccounts, value);
      const currentRepaymentCurrency = getAccountCurrency(fundingAccounts, state.repaymentAccount);
      
      if (newCurrency !== currentRepaymentCurrency) {
        setField('repaymentAccount', '');
      }
    }
  };

  // Build API payload
  const buildPayload = () => {
    const basePayload = {
      fundingAccount: state.fundingAccount,
      repaymentAccount: state.repaymentAccount,
      currency: selectedCurrency,
      startDate: state.startDate,
      numberOfDays,
      maturityInstruction: state.maturityInstruction as MaturityInstruction,
      remarks: state.remarks || undefined,
    };

    if (state.hasDealReference) {
      return {
        ...basePayload,
        dealReference: state.referenceNumber,
        amount: state.dealData?.amount || 0,
      };
    }

    return {
      ...basePayload,
      amount: parseFloat(state.amount) || 0,
    };
  };

  // Handle preview
  const handlePreview = async () => {
    if (!validateAllFields(state)) {
      Alert.alert('Validation Error', 'Please fix the errors before previewing.');
      return;
    }

    if (dealError) {
      Alert.alert('Error', 'Please fix the deal reference error before previewing.');
      return;
    }

    try {
      const payload = buildPayload();
      
      // Validate with backend
      await validateDeposit(payload).unwrap();
      
      // For non-deal flow, get rate information
      if (!state.hasDealReference) {
        const rateData = await rateInquiry({
          depositAmount: parseFloat(state.amount),
          numberOfDays,
          currency: selectedCurrency,
          startDate: state.startDate,
        }).unwrap();
        
        setPreviewData(rateData);
      }
      
      setIsPreviewMode(true);
      clearAllErrors();
      
    } catch (error: any) {
      const apiErrors = error?.data?.errors || [];
      const mappedErrors = mapAPIErrorsToFields(apiErrors);
      setAPIErrors(mappedErrors);
      
      Alert.alert(
        'Validation Failed', 
        'Please review and fix the highlighted errors.'
      );
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!termsAccepted) {
      Alert.alert('Terms Required', 'Please accept the terms and conditions to proceed.');
      return;
    }

    try {
      const payload = buildPayload();
      const result = await createDeposit(payload).unwrap();
      
      Alert.alert(
        'Success',
        `Deposit request submitted successfully.\nReference: ${result.reference}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      
    } catch (error: any) {
      const apiErrors = error?.data?.errors || [];
      const mappedErrors = mapAPIErrorsToFields(apiErrors);
      setAPIErrors(mappedErrors);
      
      Alert.alert(
        'Submission Failed',
        'There was an error submitting your deposit request. Please review and try again.'
      );
    }
  };

  const isLoading = accountsLoading || isValidating || isValidatingDeposit || isLoadingRate || isSubmitting;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <DealReferenceSection
          hasDealReference={state.hasDealReference}
          referenceNumber={state.referenceNumber}
          onToggleDealReference={handleToggleDealReference}
          onReferenceNumberChange={setDealId}
          referenceError={dealError || errors.referenceNumber}
          isValidating={isValidating}
        />

        <AccountSelectionSection
          fundingAccount={state.fundingAccount}
          repaymentAccount={state.repaymentAccount}
          fundingAccounts={fundingAccounts}
          repaymentAccounts={repaymentAccounts}
          onFundingAccountChange={(value) => handleFieldChange('fundingAccount', value)}
          onRepaymentAccountChange={(value) => handleFieldChange('repaymentAccount', value)}
          fundingAccountError={errors.fundingAccount}
          repaymentAccountError={errors.repaymentAccount}
          loading={accountsLoading}
        />

        <DepositDetailsSection
          showAmountAndDates={!state.hasDealReference}
          amount={state.amount}
          startDate={state.startDate}
          maturityDate={state.maturityDate}
          maturityInstruction={state.maturityInstruction}
          currency={selectedCurrency}
          onAmountChange={(value) => handleFieldChange('amount', value)}
          onStartDateChange={(value) => handleFieldChange('startDate', value)}
          onMaturityDateChange={(value) => handleFieldChange('maturityDate', value)}
          onMaturityInstructionChange={(value) => handleFieldChange('maturityInstruction', value)}
          amountError={errors.amount}
          startDateError={errors.startDate}
          maturityDateError={errors.maturityDate}
          maturityInstructionError={errors.maturityInstruction}
        />

        <RemarksSection
          remarks={state.remarks}
          onRemarksChange={(value) => handleFieldChange('remarks', value)}
          remarksError={errors.remarks}
        />

        {isPreviewMode && (
          <PreviewSection
            previewData={state.previewData}
            dealData={state.dealData}
            amount={state.amount}
            currency={selectedCurrency}
            startDate={state.startDate}
            maturityDate={state.dealData?.maturityDate || state.maturityDate}
            numberOfDays={numberOfDays}
          />
        )}
      </ScrollView>

      <View style={styles.bottomContainer}>
        {isPreviewMode && (
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setTermsAccepted(!termsAccepted)}
          >
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I accept the terms and conditions
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.buttonContainer}>
          {!isPreviewMode ? (
            <TouchableOpacity
              style={[styles.button, styles.previewButton, isLoading && styles.buttonDisabled]}
              onPress={handlePreview}
              disabled={isLoading}
            >
              {isValidatingDeposit || isLoadingRate ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Preview</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setIsPreviewMode(false)}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.submitButton, 
                  (!termsAccepted || isSubmitting) && styles.buttonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!termsAccepted || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  bottomContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
  },
  buttonContainer: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  previewButton: {
    backgroundColor: '#007BFF',
  },
  submitButton: {
    backgroundColor: '#28A745',
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: '#6C757D',
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
  },
});
