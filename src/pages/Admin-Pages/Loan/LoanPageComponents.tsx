import React from 'react';
import AccountOpeningForm from '../../../components/AccountOpening/AccountOpeningForm';
import AccountViewTable from '../../../components/AccountOpening/AccountViewTable';
import LoanCloseViewTable from '../../../components/AccountOpening/AccountClose/LoanCloseViewTable';

// 1. Personal Loan
export const PersonalLoanOpening: React.FC = () => (
  <AccountOpeningForm defaultAccountType="Personal Loan" title="Personal Loan Account Opening" />
);
export const PersonalLoanViewAll: React.FC = () => (
  <AccountViewTable accountType="Personal Loan" title="Personal Loan Account Details" />
);
export const PersonalLoanClose: React.FC = () => (
  <LoanCloseViewTable accountType="Personal Loan" title="Close Personal Loan Account" />
);

// 2. Mortgage Loan
export const MortgageLoanOpening: React.FC = () => (
  <AccountOpeningForm defaultAccountType="Mortgage Loan" title="Mortgage Loan Account Opening" />
);
export const MortgageLoanViewAll: React.FC = () => (
  <AccountViewTable accountType="Mortgage Loan" title="Mortgage Loan Account Details" />
);
export const MortgageLoanClose: React.FC = () => (
  <LoanCloseViewTable accountType="Mortgage Loan" title="Close Mortgage Loan Account" />
);

// 3. Gold Loan
export const GoldLoanOpening: React.FC = () => (
  <AccountOpeningForm defaultAccountType="Gold Loan" title="Gold Loan Account Opening" />
);
export const GoldLoanViewAll: React.FC = () => (
  <AccountViewTable accountType="Gold Loan" title="Gold Loan Account Details" />
);
export const GoldLoanClose: React.FC = () => (
  <LoanCloseViewTable accountType="Gold Loan" title="Close Gold Loan Account" />
);

// 4. Business Loan
export const BusinessLoanOpening: React.FC = () => (
  <AccountOpeningForm defaultAccountType="Business Loan" title="Business Loan Account Opening" />
);
export const BusinessLoanViewAll: React.FC = () => (
  <AccountViewTable accountType="Business Loan" title="Business Loan Account Details" />
);
export const BusinessLoanClose: React.FC = () => (
  <LoanCloseViewTable accountType="Business Loan" title="Close Business Loan Account" />
);

// 5. Vehicle Loan
export const VehicleLoanOpening: React.FC = () => (
  <AccountOpeningForm defaultAccountType="Vehicle Loan" title="Vehicle Loan Account Opening" />
);
export const VehicleLoanViewAll: React.FC = () => (
  <AccountViewTable accountType="Vehicle Loan" title="Vehicle Loan Account Details" />
);
export const VehicleLoanClose: React.FC = () => (
  <LoanCloseViewTable accountType="Vehicle Loan" title="Close Vehicle Loan Account" />
);

// 6. Education Loan
export const EducationLoanOpening: React.FC = () => (
  <AccountOpeningForm defaultAccountType="Education Loan" title="Education Loan Account Opening" />
);
export const EducationLoanViewAll: React.FC = () => (
  <AccountViewTable accountType="Education Loan" title="Education Loan Account Details" />
);
export const EducationLoanClose: React.FC = () => (
  <LoanCloseViewTable accountType="Education Loan" title="Close Education Loan Account" />
);

// 7. Agriculture Loan
export const AgricultureLoanOpening: React.FC = () => (
  <AccountOpeningForm defaultAccountType="Agriculture Loan" title="Agriculture Loan Account Opening" />
);
export const AgricultureLoanViewAll: React.FC = () => (
  <AccountViewTable accountType="Agriculture Loan" title="Agriculture Loan Account Details" />
);
export const AgricultureLoanClose: React.FC = () => (
  <LoanCloseViewTable accountType="Agriculture Loan" title="Close Agriculture Loan Account" />
);

// 8. Pigmi Loan
export const PigmiLoanOpening: React.FC = () => (
  <AccountOpeningForm defaultAccountType="Pigmi Loan" title="Pigmi Loan Account Opening" />
);
export const PigmiLoanViewAll: React.FC = () => (
  <AccountViewTable accountType="Pigmi Loan" title="Pigmi Loan Account Details" />
);
export const PigmiLoanClose: React.FC = () => (
  <LoanCloseViewTable accountType="Pigmi Loan" title="Close Pigmi Loan Account" />
);

// 9. Pigmi Gold Loan
export const PigmiGoldLoanOpening: React.FC = () => (
  <AccountOpeningForm defaultAccountType="Pigmi Gold Loan" title="Pigmi Gold Loan Account Opening" />
);
export const PigmiGoldLoanViewAll: React.FC = () => (
  <AccountViewTable accountType="Pigmi Gold Loan" title="Pigmi Gold Loan Account Details" />
);
export const PigmiGoldLoanClose: React.FC = () => (
  <LoanCloseViewTable accountType="Pigmi Gold Loan" title="Close Pigmi Gold Loan Account" />
);
