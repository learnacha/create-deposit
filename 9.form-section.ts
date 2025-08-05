// components/DealReferenceSection.tsx
import React from 'react';
import { View } from 'react-native';
import { ToggleSwitch } from './ToggleSwitch';
import { CustomInput } from './CustomInput';

interface DealReferenceSectionProps {
  hasDealReference: boolean;
  referenceNumber: string;
  onToggleDealReference: (value: boolean) => void;
  onReferenceNumberChange: (text: string) => void;
  referenceError?: string;
  isValidating?: boolean;
}

export const DealReferenceSection: React.FC<DealReferenceSectionProps> = ({
  hasDealReference,
  referenceNumber,
  onToggleDealReference,
  onReferenceNumberChange,
  referenceError,
  isValidating,
}) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <ToggleSwitch
        label="Do you have a deal reference number?"
        value={hasDealReference}
        onValueChange={onToggleDealReference}
        options={[
          { label: 'Yes', value: true },
          { label: 'No', value: false }
        ]}
      />
      
      {hasDealReference && (
        <CustomInput
          label="Reference Number"
          value={referenceNumber}
          onChangeText={onReferenceNumberChange}
          error={referenceError}
          placeholder="Enter deal reference number"
          maxLength={50}
          loading={isValidating}
          required
      />
      
      {showRolloverDisclaimer && (
        <View style={{ marginTop: 10, padding: 12, backgroundColor: '#FFF3CD', borderRadius: 8 }}>
          <Text style={{ fontSize: 14, color: '#856404' }}>
            By selecting auto-rollover on maturity, your deposit will be renewed at standard deposit rates prevailing on the rollover date.
          </Text>
        </View>
      )}
    </View>
  );
};

// components/RemarksSection.tsx
import React from 'react';
import { View } from 'react-native';
import { CustomInput } from './CustomInput';

interface RemarksSectionProps {
  remarks: string;
  onRemarksChange: (text: string) => void;
  remarksError?: string;
}

export const RemarksSection: React.FC<RemarksSectionProps> = ({
  remarks,
  onRemarksChange,
  remarksError,
}) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <CustomInput
        label="Remarks"
        value={remarks}
        onChangeText={onRemarksChange}
        error={remarksError}
        placeholder="Enter any additional remarks (optional)"
        multiline
        numberOfLines={4}
        maxLength={500}
      />
    </View>
  );
};

// components/PreviewSection.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RateInquiryResponse, DealInquiryResponse } from '../types/deposit';

interface PreviewSectionProps {
  previewData?: RateInquiryResponse;
  dealData?: DealInquiryResponse;
  amount: string;
  currency: string;
  startDate: string;
  maturityDate: string;
  numberOfDays: number;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  previewData,
  dealData,
  amount,
  currency,
  startDate,
  maturityDate,
  numberOfDays,
}) => {
  if (!previewData && !dealData) return null;

  const displayAmount = dealData?.amount || parseFloat(amount);
  const displayRate = dealData?.specialRate || dealData?.standardRate || previewData?.interestRate;
  const displayMaturityAmount = dealData?.maturityAmount || previewData?.maturityAmount;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deposit Preview</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Deposit Amount:</Text>
        <Text style={styles.value}>{currency} {displayAmount?.toLocaleString()}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Interest Rate:</Text>
        <Text style={styles.value}>{displayRate?.toFixed(2)}% p.a.</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Start Date:</Text>
        <Text style={styles.value}>{new Date(startDate).toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Maturity Date:</Text>
        <Text style={styles.value}>{new Date(maturityDate).toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Tenor:</Text>
        <Text style={styles.value}>{numberOfDays} days</Text>
      </View>
      
      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.totalLabel}>Maturity Amount:</Text>
        <Text style={styles.totalValue}>{currency} {displayMaturityAmount?.toLocaleString()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#212529',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#6C757D',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#DEE2E6',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28A745',
  },
});
        />
      )}
    </View>
  );
};

// components/AccountSelectionSection.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { AccountSelection } from './AccountSelection';
import { Account } from '../types/deposit';

interface AccountSelectionSectionProps {
  fundingAccount: string;
  repaymentAccount: string;
  fundingAccounts: Account[];
  repaymentAccounts: Account[];
  onFundingAccountChange: (accountId: string) => void;
  onRepaymentAccountChange: (accountId: string) => void;
  fundingAccountError?: string;
  repaymentAccountError?: string;
  loading?: boolean;
}

export const AccountSelectionSection: React.FC<AccountSelectionSectionProps> = ({
  fundingAccount,
  repaymentAccount,
  fundingAccounts,
  repaymentAccounts,
  onFundingAccountChange,
  onRepaymentAccountChange,
  fundingAccountError,
  repaymentAccountError,
  loading,
}) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <AccountSelection
        label="Deposit Funding Account"
        value={fundingAccount}
        accounts={fundingAccounts}
        onAccountSelect={onFundingAccountChange}
        error={fundingAccountError}
        loading={loading}
        required
      />
      
      <AccountSelection
        label="Deposit Repayment Account"
        value={repaymentAccount}
        accounts={repaymentAccounts}
        onAccountSelect={onRepaymentAccountChange}
        error={repaymentAccountError}
        loading={loading}
        required
        disabled={!fundingAccount}
      />
    </View>
  );
};

// components/DepositDetailsSection.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { CustomInput } from './CustomInput';
import { DatePicker } from './DatePicker';
import { ItemSelection } from './ItemSelection';
import { MaturityInstruction } from '../types/deposit';

interface DepositDetailsSectionProps {
  showAmountAndDates: boolean;
  amount: string;
  startDate: string;
  maturityDate: string;
  maturityInstruction: MaturityInstruction | '';
  currency: string;
  onAmountChange: (text: string) => void;
  onStartDateChange: (date: string) => void;
  onMaturityDateChange: (date: string) => void;
  onMaturityInstructionChange: (instruction: MaturityInstruction) => void;
  amountError?: string;
  startDateError?: string;
  maturityDateError?: string;
  maturityInstructionError?: string;
}

const MATURITY_INSTRUCTIONS = [
  {
    value: 'PRINCIPAL_PLUS_PROFIT_ENCASHMENT' as MaturityInstruction,
    label: 'Credit principal plus interest on maturity'
  },
  {
    value: 'PRINCIPAL_ROLLOVER' as MaturityInstruction,
    label: 'Rollover principal plus interest on maturity'
  },
  {
    value: 'PRINCIPAL' as MaturityInstruction,
    label: 'Rollover principal only and credit interest on maturity'
  }
];

export const DepositDetailsSection: React.FC<DepositDetailsSectionProps> = ({
  showAmountAndDates,
  amount,
  startDate,
  maturityDate,
  maturityInstruction,
  currency,
  onAmountChange,
  onStartDateChange,
  onMaturityDateChange,
  onMaturityInstructionChange,
  amountError,
  startDateError,
  maturityDateError,
  maturityInstructionError,
}) => {
  const showRolloverDisclaimer = maturityInstruction && maturityInstruction !== 'PRINCIPAL_PLUS_PROFIT_ENCASHMENT';

  return (
    <View style={{ marginBottom: 20 }}>
      {showAmountAndDates && (
        <>
          <CustomInput
            label={`Amount (${currency || 'AED'})`}
            value={amount}
            onChangeText={onAmountChange}
            error={amountError}
            placeholder="Enter deposit amount"
            keyboardType="numeric"
            required
          />
          
          <DatePicker
            label="Start Date"
            value={startDate}
            onDateChange={onStartDateChange}
            error={startDateError}
            disabled={true}
            required
          />
          
          <DatePicker
            label="Maturity Date"
            value={maturityDate}
            onDateChange={onMaturityDateChange}
            error={maturityDateError}
            minimumDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
            maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
            required
          />
        </>
      )}
      
      <ItemSelection
        label="Maturity Instruction"
        value={maturityInstruction}
        items={MATURITY_INSTRUCTIONS}
        onItemSelect={onMaturityInstructionChange}
        error={maturityInstructionError}
        placeholder="Select maturity instruction"
        required
