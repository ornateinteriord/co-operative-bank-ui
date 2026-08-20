import React, { useState } from 'react';
import {
  Box,
  Container,
  Button,
  Typography,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AdminReusableTable from '../../../utils/AdminReusableTable';
import { toast } from 'react-toastify';
import LoanDialog, { LoanFormData, LoanTypeCategory } from '../../../components/Loan/LoanDialog';
import ConfirmDialog from '../../../components/Shared/ConfirmDialog';

interface LoanMasterPageProps {
  loanType: LoanTypeCategory;
}

const initialLoanDataset: Record<LoanTypeCategory, LoanFormData[]> = {
  Personal: [
    {
      id: 'PL-100201',
      account_no: 'PL-100201',
      loan_type: 'Personal',
      application_date: '2026-01-10',
      disbursed_date: '2026-01-15',
      branch_location: '001-HO MAIN BRANCH',
      member_id: 'MBR001',
      member_name: 'Rajesh Kumar Shetty',
      guarantor_name: 'Sunita Shetty',
      guarantor_contact: '9845123456',
      sanctioned_amount: 100000,
      interest_rate: 12.0,
      tenure_months: 24,
      emi_amount: 4707,
      repayment_frequency: 'Monthly',
      processing_fee: 1000,
      outstanding_balance: 75000,
      disbursement_mode: 'Direct SB Credit',
      credit_account_no: 'SB-100201',
      status: 'active',
      purpose_of_loan: 'Home Renovation & Medical',
    },
    {
      id: 'PL-100202',
      account_no: 'PL-100202',
      loan_type: 'Personal',
      application_date: '2026-02-01',
      disbursed_date: '2026-02-05',
      branch_location: '002-MANIPAL BRANCH',
      member_id: 'MBR005',
      member_name: 'Anitha Poojary',
      guarantor_name: 'Praveen Poojary',
      guarantor_contact: '9880123789',
      sanctioned_amount: 50000,
      interest_rate: 12.0,
      tenure_months: 12,
      emi_amount: 4442,
      repayment_frequency: 'Monthly',
      processing_fee: 500,
      outstanding_balance: 35000,
      disbursement_mode: 'Direct SB Credit',
      credit_account_no: 'SB-100205',
      status: 'active',
      purpose_of_loan: 'Higher Education Support',
    },
  ],
  Mortgage: [
    {
      id: 'ML-200401',
      account_no: 'ML-200401',
      loan_type: 'Mortgage',
      application_date: '2025-11-10',
      disbursed_date: '2025-11-15',
      branch_location: '001-HO MAIN BRANCH',
      member_id: 'MBR008',
      member_name: 'Shankar Nayak',
      guarantor_name: 'Girish Nayak',
      guarantor_contact: '9448123111',
      sanctioned_amount: 500000,
      interest_rate: 10.5,
      tenure_months: 60,
      emi_amount: 10747,
      repayment_frequency: 'Monthly',
      processing_fee: 5000,
      outstanding_balance: 420000,
      disbursement_mode: 'Cheque / DD',
      credit_account_no: 'CA-200408',
      status: 'active',
      property_survey_no: 'Sy. No 44/2B, Udupi',
      property_valuation: 1200000,
      property_address: 'Main Town Commercial Plot',
    },
  ],
  Gold: [
    {
      id: 'GL-300101',
      account_no: 'GL-300101',
      loan_type: 'Gold',
      application_date: '2026-02-15',
      disbursed_date: '2026-02-20',
      branch_location: '001-HO MAIN BRANCH',
      member_id: 'MBR015',
      member_name: 'Radha Acharya',
      guarantor_name: 'Ganesh Acharya',
      guarantor_contact: '9880123999',
      sanctioned_amount: 150000,
      interest_rate: 9.0,
      tenure_months: 12,
      emi_amount: 13118,
      repayment_frequency: 'Monthly',
      processing_fee: 750,
      outstanding_balance: 150000,
      disbursement_mode: 'Cash Disbursement',
      credit_account_no: '',
      status: 'active',
      gold_weight: 32.5,
      gold_purity: '22K (91.6%)',
      gold_valuation: 210000,
      gold_packet_no: 'GL-VAULT-042',
    },
  ],
  Business: [
    {
      id: 'BL-400501',
      account_no: 'BL-400501',
      loan_type: 'Business',
      application_date: '2026-02-25',
      disbursed_date: '2026-03-01',
      branch_location: '002-MANIPAL BRANCH',
      member_id: 'MBR020',
      member_name: 'Ganesh Enterprises',
      guarantor_name: 'Suresh Bhat',
      guarantor_contact: '9448123789',
      sanctioned_amount: 300000,
      interest_rate: 13.0,
      tenure_months: 36,
      emi_amount: 10108,
      repayment_frequency: 'Monthly',
      processing_fee: 3000,
      outstanding_balance: 290000,
      disbursement_mode: 'NEFT / RTGS Transfer',
      credit_account_no: 'CA-200405',
      status: 'active',
      business_name: 'Ganesh Hardware & Electricals',
      business_gstin: '29ABCDE1234F1Z5',
      annual_turnover: 2500000,
    },
  ],
  House: [
    {
      id: 'HL-500601',
      account_no: 'HL-500601',
      loan_type: 'House',
      application_date: '2025-08-05',
      disbursed_date: '2025-08-10',
      branch_location: '003-KUNDAPURA BRANCH',
      member_id: 'MBR032',
      member_name: 'Suresh Bhat',
      guarantor_name: 'Vidya Bhat',
      guarantor_contact: '9880123555',
      sanctioned_amount: 1000000,
      interest_rate: 8.5,
      tenure_months: 120,
      emi_amount: 12399,
      repayment_frequency: 'Monthly',
      processing_fee: 10000,
      outstanding_balance: 890000,
      disbursement_mode: 'Direct SB Credit',
      credit_account_no: 'SB-100232',
      status: 'active',
      property_survey_no: 'Sy. No 108/3, Kundapura',
      property_valuation: 2200000,
      property_address: 'House Plot # 14, Shastri Road',
    },
  ],
  Other: [
    {
      id: 'OL-600701',
      account_no: 'OL-600701',
      loan_type: 'Other',
      application_date: '2026-03-10',
      disbursed_date: '2026-03-15',
      branch_location: '004-KARKALA BRANCH',
      member_id: 'MBR045',
      member_name: 'Praveen Devadiga',
      guarantor_name: 'Shekar Devadiga',
      guarantor_contact: '9448123222',
      sanctioned_amount: 50000,
      interest_rate: 11.0,
      tenure_months: 18,
      emi_amount: 3027,
      repayment_frequency: 'Monthly',
      processing_fee: 500,
      outstanding_balance: 50000,
      disbursement_mode: 'Cash Disbursement',
      credit_account_no: '',
      status: 'active',
      purpose_of_loan: 'Agricultural Equipment Purchase',
    },
  ],
};

const LoanMasterPage: React.FC<LoanMasterPageProps> = ({ loanType }) => {
  const [dataList, setDataList] = useState<LoanFormData[]>(initialLoanDataset[loanType] || []);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [loanToDelete, setLoanToDelete] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loanToView, setLoanToView] = useState<LoanFormData | null>(null);

  // Search filter
  const filteredData = dataList.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.account_no.toLowerCase().includes(q) ||
      item.member_id.toLowerCase().includes(q) ||
      item.member_name.toLowerCase().includes(q) ||
      item.branch_location.toLowerCase().includes(q) ||
      (item.guarantor_name && item.guarantor_name.toLowerCase().includes(q))
    );
  });

  const paginatedData = filteredData.slice((page - 1) * 10, page * 10).map((item, index) => ({
    ...item,
    rowNumber: (page - 1) * 10 + index + 1,
  }));

  const columns = [
    {
      id: 'rowNumber',
      label: 'Sl No',
      minWidth: 70,
      align: 'center' as const,
      renderCell: (row: any) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
          {row.rowNumber || 1}
        </Typography>
      ),
    },
    {
      id: 'account_no',
      label: 'Loan A/C No',
      sortable: true,
      minWidth: 130,
      renderCell: (row: LoanFormData) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e40af' }}>
          {row.account_no}
        </Typography>
      ),
    },
    {
      id: 'member_name',
      label: 'Borrower Info',
      sortable: true,
      minWidth: 180,
      renderCell: (row: LoanFormData) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
            {row.member_name}
          </Typography>
          <Typography variant="caption" sx={{ color: '#047857', fontWeight: 600 }}>
            ID: {row.member_id}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'sanctioned_amount',
      label: 'Sanctioned (₹)',
      sortable: true,
      minWidth: 130,
      align: 'right' as const,
      renderCell: (row: LoanFormData) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#059669' }}>
          ₹{Number(row.sanctioned_amount || 0).toLocaleString('en-IN')}
        </Typography>
      ),
    },
    {
      id: 'interest_rate',
      label: 'Rate / Tenure',
      minWidth: 120,
      align: 'center' as const,
      renderCell: (row: LoanFormData) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2563eb' }}>
            {row.interest_rate}% p.a.
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {row.tenure_months} Months
          </Typography>
        </Box>
      ),
    },
    {
      id: 'emi_amount',
      label: 'Monthly EMI',
      sortable: true,
      minWidth: 120,
      align: 'right' as const,
      renderCell: (row: LoanFormData) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
          ₹{Number(row.emi_amount || 0).toLocaleString('en-IN')}
        </Typography>
      ),
    },
    {
      id: 'outstanding_balance',
      label: 'Outstanding (₹)',
      sortable: true,
      minWidth: 130,
      align: 'right' as const,
      renderCell: (row: LoanFormData) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#b91c1c' }}>
          ₹{Number(row.outstanding_balance || 0).toLocaleString('en-IN')}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      minWidth: 110,
      align: 'center' as const,
      renderCell: (row: LoanFormData) => (
        <Chip
          label={row.status}
          size="small"
          sx={{
            backgroundColor:
              row.status === 'active' ? '#d1fae5' :
              row.status === 'pending' ? '#fef3c7' :
              row.status === 'closed' ? '#f1f5f9' : '#fee2e2',
            color:
              row.status === 'active' ? '#065f46' :
              row.status === 'pending' ? '#92400e' :
              row.status === 'closed' ? '#475569' : '#991b1b',
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        />
      ),
    },
    {
      id: 'modify',
      label: 'Modify',
      minWidth: 95,
      align: 'center' as const,
      renderCell: (row: LoanFormData) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<EditIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleModifyClick(row.account_no);
          }}
          sx={{
            textTransform: 'none',
            backgroundColor: '#fbbf24',
            color: 'white',
            fontSize: '0.75rem',
            px: 1.5,
            '&:hover': { backgroundColor: '#f59e0b' },
          }}
        >
          Modify
        </Button>
      ),
    },
    {
      id: 'delete',
      label: 'Delete',
      minWidth: 95,
      align: 'center' as const,
      renderCell: (row: LoanFormData) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(row.account_no);
          }}
          sx={{
            textTransform: 'none',
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: '0.75rem',
            px: 1.5,
            '&:hover': { backgroundColor: '#dc2626' },
          }}
        >
          Delete
        </Button>
      ),
    },
    {
      id: 'view',
      label: 'Details',
      minWidth: 100,
      align: 'center' as const,
      renderCell: (row: LoanFormData) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(row);
          }}
          sx={{
            textTransform: 'none',
            backgroundColor: '#3b82f6',
            color: 'white',
            fontSize: '0.75rem',
            px: 1.5,
            '&:hover': { backgroundColor: '#2563eb' },
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const handleAddLoan = () => {
    setSelectedLoanId(null);
    setDialogOpen(true);
  };

  const handleModifyClick = (accNo: string) => {
    setSelectedLoanId(accNo);
    setDialogOpen(true);
  };

  const handleDeleteClick = (accNo: string) => {
    setLoanToDelete(accNo);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (loanToDelete) {
      setDataList((prev) => prev.filter((item) => item.account_no !== loanToDelete));
      toast.success(`${loanType} loan record deleted successfully`);
      setLoanToDelete(null);
      setConfirmDialogOpen(false);
    }
  };

  const handleViewDetails = (loan: LoanFormData) => {
    setLoanToView(loan);
    setViewDialogOpen(true);
  };

  const handleSaveLoan = (savedData: LoanFormData) => {
    if (selectedLoanId) {
      setDataList((prev) =>
        prev.map((item) => (item.account_no === selectedLoanId ? { ...item, ...savedData } : item))
      );
    } else {
      setDataList((prev) => [savedData, ...prev]);
    }
  };

  const handleExport = () => {
    toast.info(`Exporting ${loanType} Loans to Excel...`);
  };

  const selectedLoanData = dataList.find((item) => item.account_no === selectedLoanId) || null;

  const tableActions = (
    <Stack direction="row" spacing={1}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddLoan}
        sx={{
          textTransform: 'none',
          backgroundColor: '#10b981',
          px: 2.5,
          py: 0.8,
          borderRadius: '8px',
          fontWeight: 600,
          '&:hover': { backgroundColor: '#059669' },
        }}
      >
        New {loanType} Loan
      </Button>
    </Stack>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, mt: { xs: 7, sm: 8 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: '#1a237e', mb: 1, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}
        >
          {loanType} Loan Master
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          MANAGE {loanType.toUpperCase()} LOAN ACCOUNTS, COLLATERALS, DISBURSEMENTS AND REPAYMENTS
        </Typography>
      </Box>

      {/* Reusable Data Table */}
      <AdminReusableTable<any>
        columns={columns}
        data={paginatedData}
        title={`${loanType} Loans Management`}
        isLoading={false}
        onSearchChange={setSearchInput}
        onSearch={() => setSearchQuery(searchInput)}
        onClearSearch={() => {
          setSearchInput('');
          setSearchQuery('');
        }}
        searchQuery={searchInput}
        paginationPerPage={10}
        actions={tableActions}
        onExport={handleExport}
        totalCount={filteredData.length}
        currentPage={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
      />

      {/* Add / Edit Loan Dialog */}
      <LoanDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedLoanId(null);
        }}
        loanType={loanType}
        loanId={selectedLoanId}
        initialData={selectedLoanData}
        onSave={handleSaveLoan}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${loanType} Loan`}
        message="Are you sure you want to delete this loan record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
      />

      {/* View Loan Details Modal */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setLoanToView(null);
        }}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '16px' },
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RequestQuoteIcon />
            <Typography variant="h6" fontWeight={600}>
              {loanType} Loan Details - {loanToView?.account_no}
            </Typography>
          </Box>
          <IconButton onClick={() => setViewDialogOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: '#f8fafc' }}>
          {loanToView && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: '10px', bgcolor: '#fff' }}>
                <Typography variant="h6" fontWeight={700} color="#1e3a8a">
                  {loanToView.member_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Member ID: <strong>{loanToView.member_id}</strong> | Branch: <strong>{loanToView.branch_location}</strong>
                </Typography>
                <Chip
                  label={loanToView.status}
                  size="small"
                  sx={{
                    mt: 1,
                    backgroundColor:
                      loanToView.status === 'active' ? '#d1fae5' :
                      loanToView.status === 'pending' ? '#fef3c7' : '#fee2e2',
                    color:
                      loanToView.status === 'active' ? '#065f46' :
                      loanToView.status === 'pending' ? '#92400e' : '#991b1b',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                />
              </Paper>

              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: '10px', bgcolor: '#fff' }}>
                <Typography variant="subtitle2" fontWeight={700} color="#334155" sx={{ mb: 1.5 }}>
                  Financial & Repayment Summary
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Sanctioned Amount:</Typography>
                    <Typography variant="body1" fontWeight={700} color="#059669">
                      ₹{Number(loanToView.sanctioned_amount).toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Interest Rate:</Typography>
                    <Typography variant="body1" fontWeight={600} color="#2563eb">
                      {loanToView.interest_rate}% p.a.
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Tenure:</Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {loanToView.tenure_months} Months
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Monthly EMI:</Typography>
                    <Typography variant="body1" fontWeight={700} color="#1e3a8a">
                      ₹{Number(loanToView.emi_amount).toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Outstanding Balance:</Typography>
                    <Typography variant="body1" fontWeight={700} color="#b91c1c">
                      ₹{Number(loanToView.outstanding_balance).toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Disbursement Date:</Typography>
                    <Typography variant="body2" fontWeight={600}>{loanToView.disbursed_date}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Disbursement Mode:</Typography>
                    <Typography variant="body2" fontWeight={600}>{loanToView.disbursement_mode}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Guarantor:</Typography>
                    <Typography variant="body2" fontWeight={600}>{loanToView.guarantor_name || '-'}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Specific Collateral Details */}
              {loanToView.loan_type === 'Gold' && (
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: '10px', bgcolor: '#fff' }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#b45309" sx={{ mb: 1.5 }}>
                    Gold Pledged & Valuation
                  </Typography>
                  <Grid container spacing={1.5}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">Net Weight:</Typography>
                      <Typography variant="body2" fontWeight={600}>{loanToView.gold_weight} grams</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">Purity:</Typography>
                      <Typography variant="body2" fontWeight={600}>{loanToView.gold_purity}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">Market Value:</Typography>
                      <Typography variant="body2" fontWeight={700} color="#059669">
                        ₹{Number(loanToView.gold_valuation || 0).toLocaleString('en-IN')}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">Vault Packet:</Typography>
                      <Typography variant="body2" fontWeight={600}>{loanToView.gold_packet_no || '-'}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {(loanToView.loan_type === 'Mortgage' || loanToView.loan_type === 'House') && (
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: '10px', bgcolor: '#fff' }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#1e3a8a" sx={{ mb: 1.5 }}>
                    Mortgage / Property Collateral
                  </Typography>
                  <Grid container spacing={1.5}>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Survey / Deed No:</Typography>
                      <Typography variant="body2" fontWeight={600}>{loanToView.property_survey_no || '-'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Property Valuation:</Typography>
                      <Typography variant="body2" fontWeight={700} color="#059669">
                        ₹{Number(loanToView.property_valuation || 0).toLocaleString('en-IN')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary">Location Address:</Typography>
                      <Typography variant="body2">{loanToView.property_address || '-'}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {loanToView.loan_type === 'Business' && (
                <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: '10px', bgcolor: '#fff' }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#1e3a8a" sx={{ mb: 1.5 }}>
                    Business Entity Details
                  </Typography>
                  <Grid container spacing={1.5}>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Enterprise Name:</Typography>
                      <Typography variant="body2" fontWeight={600}>{loanToView.business_name || '-'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">GSTIN No:</Typography>
                      <Typography variant="body2" fontWeight={600}>{loanToView.business_gstin || '-'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Annual Turnover:</Typography>
                      <Typography variant="body2" fontWeight={700} color="#059669">
                        ₹{Number(loanToView.annual_turnover || 0).toLocaleString('en-IN')}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setViewDialogOpen(false)} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LoanMasterPage;
