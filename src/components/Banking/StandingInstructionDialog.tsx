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
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TokenService from '../../queries/token/tokenService';
import { toast } from 'react-toastify';

export interface StandingInstructionFormData {
  id?: string;
  si_id: string;
  processing_date: string;
  time: string;
  section_id: string;
  tran_date: string;
  dr_account: string;
  cr_account: string;
  user: string;
  amount: number;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
  start_date: string;
  end_date?: string;
  narration: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
}

const getCurrentTime = () => {
  const now = new Date();
  return now.toTimeString().split(' ')[0]; // HH:MM:SS
};

const defaultInitialForm: StandingInstructionFormData = {
  si_id: '',
  processing_date: new Date().toISOString().split('T')[0],
  time: getCurrentTime(),
  section_id: '01-BANKING SECTION',
  tran_date: new Date().toISOString().split('T')[0],
  dr_account: '',
  cr_account: '',
  user: '',
  amount: 1000,
  frequency: 'Monthly',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  narration: '',
  status: 'active',
};

interface StandingInstructionDialogProps {
  open: boolean;
  onClose: () => void;
  instructionId?: string | null;
  initialData?: StandingInstructionFormData | null;
  onSave: (data: StandingInstructionFormData) => void;
}

const StandingInstructionDialog: React.FC<StandingInstructionDialogProps> = ({
  open,
  onClose,
  instructionId,
  initialData,
  onSave,
}) => {
  const currentUserId = TokenService.getUserId() || 'ADMIN_USER';

  const [formData, setFormData] = useState<StandingInstructionFormData>({
    ...defaultInitialForm,
    user: currentUserId,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (instructionId && initialData) {
      setFormData({
        ...defaultInitialForm,
        ...initialData,
        processing_date: initialData.processing_date
          ? new Date(initialData.processing_date).toISOString().split('T')[0]
          : defaultInitialForm.processing_date,
        tran_date: initialData.tran_date
          ? new Date(initialData.tran_date).toISOString().split('T')[0]
          : defaultInitialForm.tran_date,
        start_date: initialData.start_date
          ? new Date(initialData.start_date).toISOString().split('T')[0]
          : defaultInitialForm.start_date,
      });
    } else if (!instructionId) {
      const autoId = `SI-${Date.now().toString().slice(-5)}`;
      setFormData({
        ...defaultInitialForm,
        si_id: autoId,
        processing_date: new Date().toISOString().split('T')[0],
        time: getCurrentTime(),
        tran_date: new Date().toISOString().split('T')[0],
        start_date: new Date().toISOString().split('T')[0],
        user: currentUserId,
      });
    }
    setFormError(null);
  }, [instructionId, initialData, open, currentUserId]);

  const handleChange = (field: keyof StandingInstructionFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    if (initialData && instructionId) {
      setFormData({ ...defaultInitialForm, ...initialData });
    } else {
      setFormData({
        ...defaultInitialForm,
        si_id: `SI-${Date.now().toString().slice(-5)}`,
        processing_date: new Date().toISOString().split('T')[0],
        time: getCurrentTime(),
        tran_date: new Date().toISOString().split('T')[0],
        start_date: new Date().toISOString().split('T')[0],
        user: currentUserId,
      });
    }
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.dr_account.trim()) {
      setFormError('Please select or specify Debit Account (Dr. A/C)');
      return;
    }
    if (!formData.cr_account.trim()) {
      setFormError('Please select or specify Credit Account (Cr. A/C)');
      return;
    }
    if (formData.dr_account.trim() === formData.cr_account.trim()) {
      setFormError('Debit Account and Credit Account cannot be identical');
      return;
    }
    if (formData.amount <= 0) {
      setFormError('Transfer Amount must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      const payload: StandingInstructionFormData = {
        ...formData,
        id: instructionId || `SI-${Date.now().toString().slice(-6)}`,
        amount: Number(formData.amount),
      };

      onSave(payload);
      toast.success(instructionId ? 'Standing instruction updated successfully' : 'Standing instruction created successfully');
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save standing instruction');
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
          <CalendarMonthIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {instructionId ? 'Edit Standing Instruction' : 'New Standing Instruction (SI)'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Configure scheduled auto-debit and transfer instructions between accounts
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

          {/* Section 1: Processing, Date & Section Information (from image) */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#3b82f6', borderRadius: 1 }} />
              Processing & Date Parameters
            </Typography>
            <Grid container spacing={2}>
              {/* Processing Date */}
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Processing Date"
                  type="date"
                  fullWidth
                  size="small"
                  required
                  value={formData.processing_date}
                  onChange={(e) => handleChange('processing_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Time */}
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Time"
                  fullWidth
                  size="small"
                  required
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  placeholder="HH:MM:SS"
                />
              </Grid>

              {/* Section ID. */}
              <Grid item xs={12} sm={3}>
                <TextField
                  select
                  label="Section ID."
                  fullWidth
                  size="small"
                  value={formData.section_id}
                  onChange={(e) => handleChange('section_id', e.target.value)}
                >
                  <MenuItem value="01-BANKING SECTION">01-BANKING SECTION</MenuItem>
                  <MenuItem value="02-CREDIT SECTION">02-CREDIT SECTION</MenuItem>
                  <MenuItem value="03-LOAN SECTION">03-LOAN SECTION</MenuItem>
                  <MenuItem value="04-DEPOSIT SECTION">04-DEPOSIT SECTION</MenuItem>
                  <MenuItem value="05-ADMIN SECTION">05-ADMIN SECTION</MenuItem>
                </TextField>
              </Grid>

              {/* Tran. Date */}
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Tran. Date"
                  type="date"
                  fullWidth
                  size="small"
                  required
                  value={formData.tran_date}
                  onChange={(e) => handleChange('tran_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Section 2: Accounts & User Parameters (from image) */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#3b82f6', borderRadius: 1 }} />
              Debit & Credit Accounts (Dr. A/C & Cr. A/C)
            </Typography>
            <Grid container spacing={2}>
              {/* Dr. A/C. */}
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Dr. A/C. (Debit From)"
                  fullWidth
                  size="small"
                  required
                  value={formData.dr_account}
                  onChange={(e) => handleChange('dr_account', e.target.value)}
                >
                  <MenuItem value="">-- Select Debit Account --</MenuItem>
                  <MenuItem value="SB-100201 - Rajesh Kumar Shetty (SB)">SB-100201 - Rajesh Kumar (SB)</MenuItem>
                  <MenuItem value="SB-100205 - Anitha Poojary (SB)">SB-100205 - Anitha Poojary (SB)</MenuItem>
                  <MenuItem value="CA-200405 - Ganesh Enterprises (CA)">CA-200405 - Ganesh Ent. (CA)</MenuItem>
                  <MenuItem value="1001-BRANCH MAIN CASH LEDGER">1001-BRANCH MAIN CASH LEDGER</MenuItem>
                  <MenuItem value="1002-HEAD OFFICE CLEARING A/C">1002-HEAD OFFICE CLEARING A/C</MenuItem>
                </TextField>
              </Grid>

              {/* Cr. A/C. */}
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Cr. A/C. (Credit To)"
                  fullWidth
                  size="small"
                  required
                  value={formData.cr_account}
                  onChange={(e) => handleChange('cr_account', e.target.value)}
                >
                  <MenuItem value="">-- Select Credit Account --</MenuItem>
                  <MenuItem value="RD-300101 - Monthly RD Scheme A/c">RD-300101 - Monthly RD Scheme A/c</MenuItem>
                  <MenuItem value="LN-500108 - Personal Loan EMI A/c">LN-500108 - Personal Loan EMI A/c</MenuItem>
                  <MenuItem value="PG-400120 - Pigmy Daily Collection">PG-400120 - Pigmy Daily Collection</MenuItem>
                  <MenuItem value="FD-200301 - Reinvestment Deposit">FD-200301 - Reinvestment Deposit</MenuItem>
                  <MenuItem value="CA-200915 - Society Maintenance A/c">CA-200915 - Society Maint A/c</MenuItem>
                </TextField>
              </Grid>

              {/* User */}
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="User / Operator"
                  fullWidth
                  size="small"
                  value={formData.user}
                  onChange={(e) => handleChange('user', e.target.value)}
                >
                  <MenuItem value="ADMIN_USER">ADMIN_USER (System Admin)</MenuItem>
                  <MenuItem value="TELLER_01">TELLER_01 (Cash Desk)</MenuItem>
                  <MenuItem value="OFFICER_02">OFFICER_02 (Loan Dept)</MenuItem>
                  <MenuItem value="MANAGER_01">MANAGER_01 (Branch Manager)</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {/* Section 3: Amount, Frequency & Schedule */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#3b82f6', borderRadius: 1 }} />
              Amount, Schedule & Execution Frequency
            </Typography>
            <Grid container spacing={2}>
              {/* Amount */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Transfer Amount (₹)"
                  type="number"
                  fullWidth
                  size="small"
                  required
                  inputProps={{ min: "1", step: "0.01" }}
                  value={formData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                />
              </Grid>

              {/* Frequency */}
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Execution Frequency"
                  fullWidth
                  size="small"
                  value={formData.frequency}
                  onChange={(e) => handleChange('frequency', e.target.value)}
                >
                  <MenuItem value="Daily">Daily</MenuItem>
                  <MenuItem value="Weekly">Weekly</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Quarterly">Quarterly</MenuItem>
                  <MenuItem value="Yearly">Yearly</MenuItem>
                </TextField>
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Instruction Status"
                  fullWidth
                  size="small"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as any)}
                >
                  <MenuItem value="active">Active (Scheduled)</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>

              {/* Start Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Effective Start Date"
                  type="date"
                  fullWidth
                  size="small"
                  required
                  value={formData.start_date}
                  onChange={(e) => handleChange('start_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* End Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End Date (Optional)"
                  type="date"
                  fullWidth
                  size="small"
                  value={formData.end_date || ''}
                  onChange={(e) => handleChange('end_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText="Leave blank for ongoing recurring instruction"
                />
              </Grid>

              {/* Narration */}
              <Grid item xs={12}>
                <TextField
                  label="Purpose / Narration"
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  placeholder="e.g. Monthly RD Auto-Debit transfer from SB account"
                  value={formData.narration}
                  onChange={(e) => handleChange('narration', e.target.value)}
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
              {submitting ? 'Saving...' : instructionId ? 'Update Instruction' : 'Save Instruction'}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default StandingInstructionDialog;
