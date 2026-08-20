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
import PieChartIcon from '@mui/icons-material/PieChart';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { toast } from 'react-toastify';
import { useGetMemberBasicInfo } from '../../queries/transfer';
import TokenService from '../../queries/token/tokenService';

export interface ShareFormData {
  id?: string;
  share_id: string;
  certificate_no: string;
  folio_no: string;
  allotment_date: string;
  member_id: string;
  member_name: string;
  share_type: string;
  number_of_shares: number;
  face_value: number;
  total_amount: number;
  mode_of_payment: string;
  dividend_rate: number;
  nominee_name: string;
  nominee_relation: string;
  branch_code: string;
  status: 'active' | 'transferred' | 'surrendered';
  remarks?: string;
}

const defaultInitialForm: ShareFormData = {
  share_id: '',
  certificate_no: '',
  folio_no: '',
  allotment_date: new Date().toISOString().split('T')[0],
  member_id: '',
  member_name: '',
  share_type: 'Class A - Regular Member',
  number_of_shares: 10,
  face_value: 100,
  total_amount: 1000,
  mode_of_payment: 'Cash',
  dividend_rate: 8.5,
  nominee_name: '',
  nominee_relation: 'Spouse',
  branch_code: 'BRN001',
  status: 'active',
  remarks: '',
};

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  shareId?: string | null;
  initialData?: ShareFormData | null;
  onSave: (data: ShareFormData) => void;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  open,
  onClose,
  shareId,
  initialData,
  onSave,
}) => {
  const branch_code = TokenService.getBranchCode() || 'BRN001';

  const [formData, setFormData] = useState<ShareFormData>({
    ...defaultInitialForm,
    branch_code: branch_code,
  });
  const [fetchMemberInfo, setFetchMemberInfo] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Member lookup hook
  const { data: memberInfo, isLoading: loadingMember } = useGetMemberBasicInfo(
    formData.member_id,
    fetchMemberInfo
  );

  useEffect(() => {
    if (shareId && initialData) {
      setFormData({
        ...defaultInitialForm,
        ...initialData,
        allotment_date: initialData.allotment_date
          ? new Date(initialData.allotment_date).toISOString().split('T')[0]
          : defaultInitialForm.allotment_date,
      });
      if (initialData.member_id) {
        setFetchMemberInfo(true);
      }
    } else if (!shareId) {
      const autoCert = `SH-CERT-${Date.now().toString().slice(-5)}`;
      const autoFolio = `FOL-${Date.now().toString().slice(-4)}`;
      const autoShareId = `SH-${Date.now().toString().slice(-4)}`;
      setFormData({
        ...defaultInitialForm,
        share_id: autoShareId,
        certificate_no: autoCert,
        folio_no: autoFolio,
        allotment_date: new Date().toISOString().split('T')[0],
        branch_code: branch_code,
      });
      setFetchMemberInfo(false);
    }
    setFormError(null);
  }, [shareId, initialData, open, branch_code]);

  // Populate member name on fetch
  useEffect(() => {
    if (memberInfo?.success && memberInfo.data) {
      setFormData((prev) => ({
        ...prev,
        member_name: memberInfo.data.name || prev.member_name,
      }));
    }
  }, [memberInfo]);

  const handleChange = (field: keyof ShareFormData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto calculate total amount
      if (field === 'number_of_shares' || field === 'face_value') {
        const qty = field === 'number_of_shares' ? Number(value) : Number(prev.number_of_shares);
        const val = field === 'face_value' ? Number(value) : Number(prev.face_value);
        updated.total_amount = qty * val;
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
    if (initialData && shareId) {
      setFormData({ ...defaultInitialForm, ...initialData });
    } else {
      setFormData({
        ...defaultInitialForm,
        share_id: `SH-${Date.now().toString().slice(-4)}`,
        certificate_no: `SH-CERT-${Date.now().toString().slice(-5)}`,
        folio_no: `FOL-${Date.now().toString().slice(-4)}`,
        allotment_date: new Date().toISOString().split('T')[0],
      });
    }
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.member_id.trim()) {
      setFormError('Please provide Member ID');
      return;
    }
    if (!formData.member_name.trim()) {
      setFormError('Please provide Member Name');
      return;
    }
    if (formData.number_of_shares <= 0) {
      setFormError('Number of shares must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      const payload: ShareFormData = {
        ...formData,
        id: shareId || `SH-${Date.now().toString().slice(-6)}`,
        total_amount: Number(formData.number_of_shares) * Number(formData.face_value),
      };

      onSave(payload);
      toast.success(shareId ? 'Share record updated successfully' : 'Share record created successfully');
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save share');
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
          background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PieChartIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {shareId ? 'Edit Member Share Allotment' : 'New Share Allotment'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Manage member share capital, certificates, and dividend parameters
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

          {/* Section 1: Member & Certificate Details */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#047857', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#10b981', borderRadius: 1 }} />
              Member & Certificate Information
            </Typography>
            <Grid container spacing={2}>
              {/* Member Search */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="Member ID"
                    fullWidth
                    required
                    size="small"
                    value={formData.member_id}
                    onChange={(e) => handleChange('member_id', e.target.value)}
                    placeholder="e.g. MBR001"
                    helperText="Type ID and click search"
                  />
                  <Button
                    variant="contained"
                    onClick={handleFetchMember}
                    disabled={loadingMember || !formData.member_id.trim()}
                    sx={{ minWidth: '45px', px: 1, height: '40px', backgroundColor: '#047857', '&:hover': { backgroundColor: '#065f46' } }}
                  >
                    {loadingMember ? <CircularProgress size={20} color="inherit" /> : <PersonSearchIcon />}
                  </Button>
                </Box>
              </Grid>

              {/* Member Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Member Name"
                  fullWidth
                  required
                  size="small"
                  value={formData.member_name}
                  onChange={(e) => handleChange('member_name', e.target.value)}
                  placeholder="Member full name"
                />
              </Grid>

              {/* Certificate No */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Certificate No"
                  fullWidth
                  size="small"
                  required
                  value={formData.certificate_no}
                  onChange={(e) => handleChange('certificate_no', e.target.value)}
                />
              </Grid>

              {/* Folio No */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Folio No"
                  fullWidth
                  size="small"
                  required
                  value={formData.folio_no}
                  onChange={(e) => handleChange('folio_no', e.target.value)}
                />
              </Grid>

              {/* Allotment Date */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Allotment Date"
                  type="date"
                  fullWidth
                  size="small"
                  required
                  value={formData.allotment_date}
                  onChange={(e) => handleChange('allotment_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Section 2: Share Class & Financials */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#047857', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#10b981', borderRadius: 1 }} />
              Share Classification & Capital Value
            </Typography>
            <Grid container spacing={2}>
              {/* Share Type */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Share Classification"
                  fullWidth
                  size="small"
                  value={formData.share_type}
                  onChange={(e) => handleChange('share_type', e.target.value)}
                >
                  <MenuItem value="Class A - Regular Member">Class A - Regular Member</MenuItem>
                  <MenuItem value="Class B - Associate Member">Class B - Associate Member</MenuItem>
                  <MenuItem value="Class C - Nominal Member">Class C - Nominal Member</MenuItem>
                  <MenuItem value="Class D - Institutional Member">Class D - Institutional Member</MenuItem>
                </TextField>
              </Grid>

              {/* Payment Mode */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Mode of Payment"
                  fullWidth
                  size="small"
                  value={formData.mode_of_payment}
                  onChange={(e) => handleChange('mode_of_payment', e.target.value)}
                >
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Cheque">Cheque</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="SB Account Debit">SB Account Debit</MenuItem>
                </TextField>
              </Grid>

              {/* Number of Shares */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="No. of Shares"
                  type="number"
                  fullWidth
                  size="small"
                  required
                  inputProps={{ min: 1 }}
                  value={formData.number_of_shares}
                  onChange={(e) => handleChange('number_of_shares', e.target.value)}
                />
              </Grid>

              {/* Face Value */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Face Value per Share (₹)"
                  type="number"
                  fullWidth
                  size="small"
                  required
                  inputProps={{ min: 1 }}
                  value={formData.face_value}
                  onChange={(e) => handleChange('face_value', e.target.value)}
                />
              </Grid>

              {/* Total Share Capital */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Total Share Capital (₹)"
                  fullWidth
                  size="small"
                  InputProps={{ readOnly: true }}
                  value={`₹${(Number(formData.number_of_shares) * Number(formData.face_value)).toLocaleString('en-IN')}`}
                  sx={{ input: { fontWeight: 700, color: '#047857' } }}
                />
              </Grid>

              {/* Dividend Rate */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Dividend Eligibility Rate (%)"
                  type="number"
                  fullWidth
                  size="small"
                  inputProps={{ min: 0, step: 0.1 }}
                  value={formData.dividend_rate}
                  onChange={(e) => handleChange('dividend_rate', e.target.value)}
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Certificate Status"
                  fullWidth
                  size="small"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as 'active' | 'transferred' | 'surrendered')}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="transferred">Transferred</MenuItem>
                  <MenuItem value="surrendered">Surrendered</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {/* Section 3: Nominee & Branch */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#047857', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#10b981', borderRadius: 1 }} />
              Nomination & Additional Details
            </Typography>
            <Grid container spacing={2}>
              {/* Nominee Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nominee Name"
                  fullWidth
                  size="small"
                  placeholder="Enter nominee name"
                  value={formData.nominee_name}
                  onChange={(e) => handleChange('nominee_name', e.target.value)}
                />
              </Grid>

              {/* Nominee Relation */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nominee Relationship"
                  fullWidth
                  size="small"
                  placeholder="e.g. Spouse / Son / Daughter / Father"
                  value={formData.nominee_relation}
                  onChange={(e) => handleChange('nominee_relation', e.target.value)}
                />
              </Grid>

              {/* Branch Code */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Allotment Branch Code"
                  fullWidth
                  size="small"
                  value={formData.branch_code}
                  onChange={(e) => handleChange('branch_code', e.target.value)}
                />
              </Grid>

              {/* Remarks */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Remarks"
                  fullWidth
                  size="small"
                  placeholder="Additional notes"
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
                backgroundColor: '#047857',
                px: 3,
                '&:hover': { backgroundColor: '#065f46' },
              }}
            >
              {submitting ? 'Saving...' : shareId ? 'Update Share' : 'Save Share'}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ShareDialog;
