import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SaveIcon from '@mui/icons-material/Save';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { toast } from 'react-toastify';
import { useGetMemberBasicInfo } from '../../queries/transfer';

export type LoanTypeCategory = 'Personal' | 'Mortgage' | 'Gold' | 'Business' | 'House' | 'Other';

export interface LoanFormData {
  id?: string;
  account_no: string;
  loan_type: LoanTypeCategory;
  application_date: string;
  disbursed_date: string;
  branch_location: string;
  member_id: string;
  member_name: string;
  guarantor_name: string;
  guarantor_contact: string;
  sanctioned_amount: number;
  interest_rate: number;
  tenure_months: number;
  emi_amount: number;
  repayment_frequency: 'Monthly' | 'Quarterly' | 'Yearly';
  processing_fee: number;
  outstanding_balance: number;
  disbursement_mode: string;
  credit_account_no: string;
  status: 'active' | 'closed' | 'pending' | 'overdue';
  remarks?: string;

  // Specific Collateral fields
  gold_weight?: number;
  gold_purity?: string;
  gold_valuation?: number;
  gold_packet_no?: string;
  property_survey_no?: string;
  property_valuation?: number;
  property_address?: string;
  business_name?: string;
  business_gstin?: string;
  annual_turnover?: number;
  purpose_of_loan?: string;
}

const defaultInitialForm: LoanFormData = {
  account_no: '',
  loan_type: 'Personal',
  application_date: new Date().toISOString().split('T')[0],
  disbursed_date: new Date().toISOString().split('T')[0],
  branch_location: '001-HO MAIN BRANCH',
  member_id: '',
  member_name: '',
  guarantor_name: '',
  guarantor_contact: '',
  sanctioned_amount: 100000,
  interest_rate: 11.5,
  tenure_months: 24,
  emi_amount: 4684,
  repayment_frequency: 'Monthly',
  processing_fee: 1000,
  outstanding_balance: 100000,
  disbursement_mode: 'Direct SB Credit',
  credit_account_no: '',
  status: 'active',
  remarks: '',
  gold_weight: 25,
  gold_purity: '22K (91.6%)',
  gold_valuation: 150000,
  gold_packet_no: '',
  property_survey_no: '',
  property_valuation: 500000,
  property_address: '',
  business_name: '',
  business_gstin: '',
  annual_turnover: 1500000,
  purpose_of_loan: '',
};

interface LoanDialogProps {
  open: boolean;
  onClose: () => void;
  loanType: LoanTypeCategory;
  loanId?: string | null;
  initialData?: LoanFormData | null;
  onSave: (data: LoanFormData) => void;
}

// Helper to calculate standard Reducing Balance EMI
const calculateMonthlyEMI = (principal: number, annualRate: number, tenureMonths: number): number => {
  if (!principal || !annualRate || !tenureMonths) return 0;
  const monthlyRate = annualRate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
};

const LoanDialog: React.FC<LoanDialogProps> = ({
  open,
  onClose,
  loanType,
  loanId,
  initialData,
  onSave,
}) => {
  const [formData, setFormData] = useState<LoanFormData>({
    ...defaultInitialForm,
    loan_type: loanType,
  });
  const [fetchMemberInfo, setFetchMemberInfo] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: memberInfo, isLoading: loadingMember } = useGetMemberBasicInfo(
    formData.member_id,
    fetchMemberInfo
  );

  useEffect(() => {
    if (loanId && initialData) {
      setFormData({
        ...defaultInitialForm,
        ...initialData,
        loan_type: loanType,
        application_date: initialData.application_date
          ? new Date(initialData.application_date).toISOString().split('T')[0]
          : defaultInitialForm.application_date,
        disbursed_date: initialData.disbursed_date
          ? new Date(initialData.disbursed_date).toISOString().split('T')[0]
          : defaultInitialForm.disbursed_date,
      });
      if (initialData.member_id) setFetchMemberInfo(true);
    } else if (!loanId) {
      const prefix =
        loanType === 'Gold' ? 'GL' :
        loanType === 'Personal' ? 'PL' :
        loanType === 'Mortgage' ? 'ML' :
        loanType === 'Business' ? 'BL' :
        loanType === 'House' ? 'HL' : 'OL';
      const autoAccNo = `${prefix}-${Date.now().toString().slice(-6)}`;
      const defaultRate =
        loanType === 'Gold' ? 9.0 :
        loanType === 'House' ? 8.5 :
        loanType === 'Mortgage' ? 10.5 :
        loanType === 'Business' ? 13.0 : 12.0;

      const emi = calculateMonthlyEMI(100000, defaultRate, 24);
      setFormData({
        ...defaultInitialForm,
        account_no: autoAccNo,
        loan_type: loanType,
        interest_rate: defaultRate,
        emi_amount: emi,
        application_date: new Date().toISOString().split('T')[0],
        disbursed_date: new Date().toISOString().split('T')[0],
      });
      setFetchMemberInfo(false);
    }
    setFormError(null);
  }, [loanId, initialData, open, loanType]);

  useEffect(() => {
    if (memberInfo?.success && memberInfo.data) {
      setFormData((prev) => ({
        ...prev,
        member_name: memberInfo.data.name || prev.member_name,
      }));
    }
  }, [memberInfo]);

  const handleChange = (field: keyof LoanFormData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'sanctioned_amount' || field === 'interest_rate' || field === 'tenure_months') {
        const p = field === 'sanctioned_amount' ? Number(value) : Number(prev.sanctioned_amount);
        const r = field === 'interest_rate' ? Number(value) : Number(prev.interest_rate);
        const t = field === 'tenure_months' ? Number(value) : Number(prev.tenure_months);
        updated.emi_amount = calculateMonthlyEMI(p, r, t);
        if (!loanId) {
          updated.outstanding_balance = p;
        }
      }
      if (field === 'member_id') {
        setFetchMemberInfo(false);
      }
      return updated;
    });
  };

  const handleFetchMember = () => {
    if (!formData.member_id.trim()) {
      toast.warning('Please enter a Member ID');
      return;
    }
    setFetchMemberInfo(true);
  };

  const handleReset = () => {
    if (initialData && loanId) {
      setFormData({ ...defaultInitialForm, ...initialData });
    } else {
      const prefix = loanType.slice(0, 2).toUpperCase();
      setFormData({
        ...defaultInitialForm,
        account_no: `${prefix}-${Date.now().toString().slice(-6)}`,
        loan_type: loanType,
      });
    }
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.member_name.trim()) {
      setFormError('Please enter Borrower / Member Name');
      return;
    }
    if (formData.sanctioned_amount <= 0) {
      setFormError('Sanctioned Amount must be greater than 0');
      return;
    }
    if (formData.interest_rate <= 0) {
      setFormError('Interest Rate must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      const payload: LoanFormData = {
        ...formData,
        id: loanId || formData.account_no,
        sanctioned_amount: Number(formData.sanctioned_amount),
        interest_rate: Number(formData.interest_rate),
        tenure_months: Number(formData.tenure_months),
        emi_amount: Number(formData.emi_amount),
      };

      onSave(payload);
      toast.success(loanId ? `${loanType} Loan updated successfully` : `${loanType} Loan created successfully`);
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save loan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <RequestQuoteIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {loanId ? `Edit ${loanType} Loan` : `New ${loanType} Loan Account`}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Configure loan terms, disbursement, collateral and EMI parameters
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }} disabled={submitting}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3, bgcolor: '#f8fafc' }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          {/* Section 1: Basic & Borrower Details */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#3b82f6', borderRadius: 1 }} />
              Account & Borrower Information
            </Typography>
            <Grid container spacing={2}>
              {/* Account No */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Loan Account No"
                  fullWidth
                  size="small"
                  required
                  value={formData.account_no}
                  onChange={(e) => handleChange('account_no', e.target.value)}
                />
              </Grid>

              {/* Branch Location */}
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Branch Location"
                  fullWidth
                  size="small"
                  value={formData.branch_location}
                  onChange={(e) => handleChange('branch_location', e.target.value)}
                >
                  <MenuItem value="001-HO MAIN BRANCH">001-HO MAIN BRANCH</MenuItem>
                  <MenuItem value="002-MANIPAL BRANCH">002-MANIPAL BRANCH</MenuItem>
                  <MenuItem value="003-KUNDAPURA BRANCH">003-KUNDAPURA BRANCH</MenuItem>
                  <MenuItem value="004-KARKALA BRANCH">004-KARKALA BRANCH</MenuItem>
                </TextField>
              </Grid>

              {/* Application Date */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Application Date"
                  type="date"
                  fullWidth
                  size="small"
                  required
                  value={formData.application_date}
                  onChange={(e) => handleChange('application_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Member ID with search */}
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="Member ID"
                    fullWidth
                    size="small"
                    required
                    placeholder="e.g. MBR001"
                    value={formData.member_id}
                    onChange={(e) => handleChange('member_id', e.target.value)}
                  />
                  <Button
                    variant="contained"
                    onClick={handleFetchMember}
                    disabled={loadingMember || !formData.member_id.trim()}
                    sx={{ minWidth: '40px', px: 1, backgroundColor: '#1e40af', '&:hover': { backgroundColor: '#1d4ed8' } }}
                  >
                    {loadingMember ? <CircularProgress size={18} color="inherit" /> : <PersonSearchIcon />}
                  </Button>
                </Box>
              </Grid>

              {/* Member / Borrower Name */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Borrower Name"
                  fullWidth
                  size="small"
                  required
                  value={formData.member_name}
                  onChange={(e) => handleChange('member_name', e.target.value)}
                />
              </Grid>

              {/* Guarantor Name */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Guarantor Name"
                  fullWidth
                  size="small"
                  placeholder="Primary guarantor"
                  value={formData.guarantor_name}
                  onChange={(e) => handleChange('guarantor_name', e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Section 2: Loan Financials & Repayment Parameters */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#3b82f6', borderRadius: 1 }} />
              Sanction & EMI Repayment Terms
            </Typography>
            <Grid container spacing={2}>
              {/* Sanctioned Amount */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Sanctioned Amount (₹)"
                  type="number"
                  fullWidth
                  size="small"
                  required
                  inputProps={{ min: 1000 }}
                  value={formData.sanctioned_amount}
                  onChange={(e) => handleChange('sanctioned_amount', e.target.value)}
                />
              </Grid>

              {/* Interest Rate */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Interest Rate (% p.a.)"
                  type="number"
                  fullWidth
                  size="small"
                  required
                  inputProps={{ min: 0.1, step: 0.1 }}
                  value={formData.interest_rate}
                  onChange={(e) => handleChange('interest_rate', e.target.value)}
                />
              </Grid>

              {/* Tenure */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Tenure (Months)"
                  type="number"
                  fullWidth
                  size="small"
                  required
                  inputProps={{ min: 1 }}
                  value={formData.tenure_months}
                  onChange={(e) => handleChange('tenure_months', e.target.value)}
                />
              </Grid>

              {/* Auto EMI */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Monthly EMI (₹)"
                  fullWidth
                  size="small"
                  InputProps={{ readOnly: true }}
                  value={`₹${formData.emi_amount.toLocaleString('en-IN')}`}
                  sx={{ input: { fontWeight: 700, color: '#059669' } }}
                />
              </Grid>

              {/* Repayment Frequency */}
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Repayment Frequency"
                  fullWidth
                  size="small"
                  value={formData.repayment_frequency}
                  onChange={(e) => handleChange('repayment_frequency', e.target.value as any)}
                >
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Quarterly">Quarterly</MenuItem>
                  <MenuItem value="Yearly">Yearly</MenuItem>
                </TextField>
              </Grid>

              {/* Processing Fee */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Processing Fee (₹)"
                  type="number"
                  fullWidth
                  size="small"
                  value={formData.processing_fee}
                  onChange={(e) => handleChange('processing_fee', e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Section 3: Collateral / Loan Specific Details */}
          {loanType === 'Gold' && (
            <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#b45309', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#f59e0b', borderRadius: 1 }} />
                Gold Collateral & Appraised Valuation
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Net Gold Weight (grams)"
                    type="number"
                    fullWidth
                    size="small"
                    required
                    inputProps={{ min: 0.1, step: 0.1 }}
                    value={formData.gold_weight}
                    onChange={(e) => handleChange('gold_weight', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    select
                    label="Purity / Karat"
                    fullWidth
                    size="small"
                    value={formData.gold_purity}
                    onChange={(e) => handleChange('gold_purity', e.target.value)}
                  >
                    <MenuItem value="22K (91.6%)">22K (91.6%)</MenuItem>
                    <MenuItem value="24K (99.9%)">24K (99.9%)</MenuItem>
                    <MenuItem value="18K (75.0%)">18K (75.0%)</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Market Valuation (₹)"
                    type="number"
                    fullWidth
                    size="small"
                    value={formData.gold_valuation}
                    onChange={(e) => handleChange('gold_valuation', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Vault Packet No"
                    fullWidth
                    size="small"
                    placeholder="e.g. PKT-091"
                    value={formData.gold_packet_no}
                    onChange={(e) => handleChange('gold_packet_no', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}

          {(loanType === 'Mortgage' || loanType === 'House') && (
            <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#3b82f6', borderRadius: 1 }} />
                Property & Mortgage Collateral
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Survey / Deed No."
                    fullWidth
                    size="small"
                    placeholder="e.g. Sy.No 124/3A"
                    value={formData.property_survey_no}
                    onChange={(e) => handleChange('property_survey_no', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Appraised Property Valuation (₹)"
                    type="number"
                    fullWidth
                    size="small"
                    value={formData.property_valuation}
                    onChange={(e) => handleChange('property_valuation', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Property Address"
                    fullWidth
                    size="small"
                    placeholder="Location / Landmark"
                    value={formData.property_address}
                    onChange={(e) => handleChange('property_address', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}

          {loanType === 'Business' && (
            <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#3b82f6', borderRadius: 1 }} />
                Business Enterprise Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Enterprise / Business Name"
                    fullWidth
                    size="small"
                    value={formData.business_name}
                    onChange={(e) => handleChange('business_name', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="GSTIN / Registration No"
                    fullWidth
                    size="small"
                    value={formData.business_gstin}
                    onChange={(e) => handleChange('business_gstin', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Annual Turnover (₹)"
                    type="number"
                    fullWidth
                    size="small"
                    value={formData.annual_turnover}
                    onChange={(e) => handleChange('annual_turnover', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Section 4: Disbursement & Status */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#3b82f6', borderRadius: 1 }} />
              Disbursement & Account Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Disbursement Mode"
                  fullWidth
                  size="small"
                  value={formData.disbursement_mode}
                  onChange={(e) => handleChange('disbursement_mode', e.target.value)}
                >
                  <MenuItem value="Direct SB Credit">Direct SB Credit</MenuItem>
                  <MenuItem value="Cash Disbursement">Cash Disbursement</MenuItem>
                  <MenuItem value="Cheque / DD">Cheque / DD</MenuItem>
                  <MenuItem value="NEFT / RTGS Transfer">NEFT / RTGS Transfer</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Disbursement Date"
                  type="date"
                  fullWidth
                  size="small"
                  required
                  value={formData.disbursed_date}
                  onChange={(e) => handleChange('disbursed_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Account Status"
                  fullWidth
                  size="small"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as any)}
                >
                  <MenuItem value="active">Active (Disbursed)</MenuItem>
                  <MenuItem value="pending">Pending Approval</MenuItem>
                  <MenuItem value="closed">Closed / Settled</MenuItem>
                  <MenuItem value="overdue">Overdue / NPA</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Remarks / Approval Notes"
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  placeholder="Sanction committee remarks or collateral inspection notes"
                  value={formData.remarks || ''}
                  onChange={(e) => handleChange('remarks', e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
          <Button
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
            color="inherit"
            disabled={submitting}
            sx={{ textTransform: 'none', color: '#64748b' }}
          >
            Reset
          </Button>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              startIcon={<ExitToAppIcon />}
              onClick={onClose}
              color="inherit"
              disabled={submitting}
              sx={{ textTransform: 'none' }}
            >
              Exit
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              disabled={submitting}
              sx={{
                textTransform: 'none',
                backgroundColor: '#1e40af',
                px: 3,
                '&:hover': { backgroundColor: '#1d4ed8' },
              }}
            >
              {submitting ? 'Saving...' : loanId ? 'Update Loan' : 'Sanction & Save Loan'}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LoanDialog;
