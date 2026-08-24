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
import BusinessIcon from '@mui/icons-material/Business';
import { toast } from 'react-toastify';

export interface BranchFormData {
  id?: string;
  branch_ledger_acc: string;
  date: string;
  section_id: string;
  branch_id: string;
  branch_id_no: string;
  full_id_no: string;
  branch_cust_id_no: string;
  branch_name: string;
  door_no: string;
  address1: string;
  address2: string;
  address3: string;
  phone_code: string;
  phone_number: string;
  mobile_no: string;
  email: string;
  status: 'active' | 'inactive';
}

const defaultInitialForm: BranchFormData = {
  branch_ledger_acc: '',
  date: new Date().toISOString().split('T')[0],
  section_id: '01-BANKING SECTION',
  branch_id: '',
  branch_id_no: '0',
  full_id_no: '',
  branch_cust_id_no: '',
  branch_name: '',
  door_no: '',
  address1: '',
  address2: '',
  address3: '',
  phone_code: '',
  phone_number: '',
  mobile_no: '',
  email: '',
  status: 'active',
};

interface BranchDialogProps {
  open: boolean;
  onClose: () => void;
  branchId?: string | null;
  initialData?: BranchFormData | null;
  onSave: (data: BranchFormData) => void;
}

const BranchDialog: React.FC<BranchDialogProps> = ({
  open,
  onClose,
  branchId,
  initialData,
  onSave,
}) => {
  const [formData, setFormData] = useState<BranchFormData>(defaultInitialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (branchId && initialData) {
      setFormData({
        ...defaultInitialForm,
        ...initialData,
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : defaultInitialForm.date,
      });
    } else if (!branchId) {
      setFormData({
        ...defaultInitialForm,
        date: new Date().toISOString().split('T')[0],
      });
    }
    setFormError(null);
  }, [branchId, initialData, open]);

  const handleChange = (field: keyof BranchFormData, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto compute full_id_no if branch_id or section_id changes
      if (field === 'branch_id' || field === 'section_id' || field === 'branch_id_no') {
        const secCode = updated.section_id.split('-')[0] || '01';
        const bCode = updated.branch_id || 'BRN';
        const num = updated.branch_id_no || '0';
        updated.full_id_no = `${secCode}-${bCode}-${num}`;
      }
      return updated;
    });
  };

  const handleReset = () => {
    if (initialData && branchId) {
      setFormData({ ...defaultInitialForm, ...initialData });
    } else {
      setFormData({ ...defaultInitialForm, date: new Date().toISOString().split('T')[0] });
    }
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Form Validations
    if (!formData.branch_name.trim()) {
      setFormError('Please enter Branch Name');
      return;
    }
    if (!formData.branch_id.trim()) {
      setFormError('Please enter Branch ID');
      return;
    }
    if (!formData.date) {
      setFormError('Please select a Date');
      return;
    }

    setSubmitting(true);
    try {
      const payload: BranchFormData = {
        ...formData,
        id: branchId || `BRN-${Date.now().toString().slice(-6)}`,
      };

      onSave(payload);
      toast.success(branchId ? 'Branch updated successfully' : 'Branch created successfully');
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save branch');
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
          <BusinessIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {branchId ? 'Edit Branch Master' : 'Add New Branch Master'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Configure branch identifiers, location and contact details
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

          {/* Section 1: Identifier & Accounts Information */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#3b82f6', borderRadius: 1 }} />
              Branch Identifiers & Ledger
            </Typography>
            <Grid container spacing={2}>
              {/* Branch Ledger A/c */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Branch Ledger A/c"
                  fullWidth
                  size="small"
                  value={formData.branch_ledger_acc}
                  onChange={(e) => handleChange('branch_ledger_acc', e.target.value)}
                >
                  <MenuItem value="">-- Select Ledger A/c --</MenuItem>
                  <MenuItem value="1001-BRANCH HEAD OFFICE LEDGER">1001-BRANCH HEAD OFFICE LEDGER</MenuItem>
                  <MenuItem value="1002-INTER-BRANCH CLEARING A/C">1002-INTER-BRANCH CLEARING A/C</MenuItem>
                  <MenuItem value="1003-MAIN VAULT CASH LEDGER">1003-MAIN VAULT CASH LEDGER</MenuItem>
                  <MenuItem value="1004-GENERAL BANKING LEDGER">1004-GENERAL BANKING LEDGER</MenuItem>
                </TextField>
              </Grid>

              {/* Date */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  size="small"
                  required
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Section ID. */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Section ID."
                  fullWidth
                  size="small"
                  value={formData.section_id}
                  onChange={(e) => handleChange('section_id', e.target.value)}
                >
                  <MenuItem value="01-BANKING SECTION">01-BANKING SECTION</MenuItem>
                  <MenuItem value="02-CREDIT & ADVANCES">02-CREDIT & ADVANCES</MenuItem>
                  <MenuItem value="03-TREASURY & FOREX">03-TREASURY & FOREX</MenuItem>
                  <MenuItem value="04-ADMINISTRATION SECTION">04-ADMINISTRATION SECTION</MenuItem>
                </TextField>
              </Grid>

              {/* Branch Id. */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Branch Id."
                  fullWidth
                  size="small"
                  required
                  placeholder="e.g. BRN001 / UDUPI-MAIN"
                  value={formData.branch_id}
                  onChange={(e) => handleChange('branch_id', e.target.value)}
                />
              </Grid>

              {/* Branch ID.No. */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Branch ID.No."
                  fullWidth
                  size="small"
                  placeholder="e.g. 0"
                  value={formData.branch_id_no}
                  onChange={(e) => handleChange('branch_id_no', e.target.value)}
                />
              </Grid>

              {/* Full ID.No. */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Full ID.No."
                  fullWidth
                  size="small"
                  placeholder="e.g. 01-BRN001-0"
                  value={formData.full_id_no}
                  onChange={(e) => handleChange('full_id_no', e.target.value)}
                />
              </Grid>

              {/* Branch Cust.ID.No. */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Branch Cust.ID.No."
                  fullWidth
                  size="small"
                  placeholder="e.g. CUST-001"
                  value={formData.branch_cust_id_no}
                  onChange={(e) => handleChange('branch_cust_id_no', e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Section 2: Branch Name & Address */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#3b82f6', borderRadius: 1 }} />
              Branch Name & Location Address
            </Typography>
            <Grid container spacing={2}>
              {/* Branch Name */}
              <Grid item xs={12}>
                <TextField
                  label="Branch Name"
                  fullWidth
                  size="small"
                  required
                  placeholder="Enter full branch name (e.g. Udupi Main Branch)"
                  value={formData.branch_name}
                  onChange={(e) => handleChange('branch_name', e.target.value)}
                />
              </Grid>

              {/* Door No. */}
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Door No."
                  fullWidth
                  size="small"
                  placeholder="e.g. D.No. 4-12/A"
                  value={formData.door_no}
                  onChange={(e) => handleChange('door_no', e.target.value)}
                />
              </Grid>

              {/* Address1 */}
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Address 1"
                  fullWidth
                  size="small"
                  placeholder="Building / Street name"
                  value={formData.address1}
                  onChange={(e) => handleChange('address1', e.target.value)}
                />
              </Grid>

              {/* Address2 */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Address 2"
                  fullWidth
                  size="small"
                  placeholder="Area / Landmark"
                  value={formData.address2}
                  onChange={(e) => handleChange('address2', e.target.value)}
                />
              </Grid>

              {/* Address3 */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Address 3 (City / Pincode)"
                  fullWidth
                  size="small"
                  placeholder="City, State - PIN"
                  value={formData.address3}
                  onChange={(e) => handleChange('address3', e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Section 3: Contact & Status */}
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 16, bgcolor: '#3b82f6', borderRadius: 1 }} />
              Contact Information & Status
            </Typography>
            <Grid container spacing={2}>
              {/* Phone (Code) & Number */}
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Phone (Code)"
                  fullWidth
                  size="small"
                  placeholder="STD (e.g. 0820)"
                  value={formData.phone_code}
                  onChange={(e) => handleChange('phone_code', e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Phone Number"
                  fullWidth
                  size="small"
                  placeholder="Telephone number"
                  value={formData.phone_number}
                  onChange={(e) => handleChange('phone_number', e.target.value)}
                />
              </Grid>

              {/* Mobile No. */}
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Mobile No."
                  fullWidth
                  size="small"
                  placeholder="10-digit mobile number"
                  value={formData.mobile_no}
                  onChange={(e) => handleChange('mobile_no', e.target.value)}
                />
              </Grid>

              {/* E-mail */}
              <Grid item xs={12} sm={8}>
                <TextField
                  label="E-mail"
                  type="email"
                  fullWidth
                  size="small"
                  placeholder="branch@cooperativebank.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  size="small"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as 'active' | 'inactive')}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
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
              {submitting ? 'Saving...' : branchId ? 'Update Branch' : 'Save Branch'}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BranchDialog;
