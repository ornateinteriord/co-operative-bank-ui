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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PaidIcon from '@mui/icons-material/Paid';
import { toast } from 'react-toastify';
import { useCreatePayDemand, useUpdatePayDemand } from '../../queries/banking';

export interface PayDemandFormData {
  id?: string;
  demand_no?: string;
  tran_type: string;
  sub_type: string;
  date_from: string;
  date_to: string;
  location: string;
  section_id: string;
  user: string;
  show_last_10: boolean;
  status?: 'active' | 'completed' | 'pending';
}

const defaultInitialForm: PayDemandFormData = {
  tran_type: '',
  sub_type: '',
  date_from: new Date().toISOString().split('T')[0],
  date_to: new Date().toISOString().split('T')[0],
  location: '001-HO MAIN BRANCH',
  section_id: '-ALL-',
  user: '',
  show_last_10: false,
  status: 'pending',
};

interface PayDemandDialogProps {
  open: boolean;
  onClose: () => void;
  demandId?: string | null;
  initialData?: PayDemandFormData | null;
  onSave: (data: PayDemandFormData) => void;
}

const PayDemandDialog: React.FC<PayDemandDialogProps> = ({
  open,
  onClose,
  demandId,
  initialData,
  onSave,
}) => {
  const [formData, setFormData] = useState<PayDemandFormData>(defaultInitialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (demandId && initialData) {
      setFormData({
        ...defaultInitialForm,
        ...initialData,
        date_from: initialData.date_from
          ? new Date(initialData.date_from).toISOString().split('T')[0]
          : defaultInitialForm.date_from,
        date_to: initialData.date_to
          ? new Date(initialData.date_to).toISOString().split('T')[0]
          : defaultInitialForm.date_to,
      });
    } else if (!demandId) {
      setFormData({
        ...defaultInitialForm,
        date_from: new Date().toISOString().split('T')[0],
        date_to: new Date().toISOString().split('T')[0],
      });
    }
    setFormError(null);
  }, [demandId, initialData, open]);

  const handleChange = (field: keyof PayDemandFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    if (initialData && demandId) {
      setFormData({ ...defaultInitialForm, ...initialData });
    } else {
      setFormData({
        ...defaultInitialForm,
        date_from: new Date().toISOString().split('T')[0],
        date_to: new Date().toISOString().split('T')[0],
      });
    }
    setFormError(null);
  };

  const createDemandMutation = useCreatePayDemand();
  const updateDemandMutation = useUpdatePayDemand();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    setSubmitting(true);
    try {
      const payload: PayDemandFormData = {
        ...formData,
        id: demandId || `DEM-${Date.now().toString().slice(-6)}`,
        demand_no: formData.demand_no || `DEM-${Date.now().toString().slice(-5)}`,
      };

      if (demandId) {
        await updateDemandMutation.mutateAsync({ demandId: formData.demand_no || demandId, data: payload });
        toast.success('Pay demand updated successfully');
      } else {
        await createDemandMutation.mutateAsync(payload);
        toast.success('Pay demand created successfully');
      }

      onSave(payload);
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save demand');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
          <PaidIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {demandId ? 'Edit Pay Demand' : 'Pay Demand Form'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Transaction type, date range, branch location and parameters
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

          <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
            <Grid container spacing={2.5} alignItems="center">
              {/* Tran.Type */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Tran.Type"
                  fullWidth
                  size="small"
                  value={formData.tran_type}
                  onChange={(e) => handleChange('tran_type', e.target.value)}
                >
                  <MenuItem value="">-- Select Tran.Type --</MenuItem>
                  <MenuItem value="Payment">Payment</MenuItem>
                  <MenuItem value="Receipt">Receipt</MenuItem>
                  <MenuItem value="Transfer">Transfer</MenuItem>
                  <MenuItem value="Demand Draft">Demand Draft</MenuItem>
                  <MenuItem value="Pay Order">Pay Order</MenuItem>
                </TextField>
              </Grid>

              {/* Sub.Type */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Sub.Type"
                  fullWidth
                  size="small"
                  value={formData.sub_type}
                  onChange={(e) => handleChange('sub_type', e.target.value)}
                >
                  <MenuItem value="">-- Select Sub.Type --</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Bank">Bank</MenuItem>
                  <MenuItem value="Clearing">Clearing</MenuItem>
                  <MenuItem value="Transfer">Transfer</MenuItem>
                </TextField>
              </Grid>

              {/* Date From */}
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Date From"
                  type="date"
                  fullWidth
                  size="small"
                  required
                  value={formData.date_from}
                  onChange={(e) => handleChange('date_from', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* To */}
              <Grid item xs={12} sm={3}>
                <TextField
                  label="To"
                  type="date"
                  fullWidth
                  size="small"
                  required
                  value={formData.date_to}
                  onChange={(e) => handleChange('date_to', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Location */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Location"
                  fullWidth
                  size="small"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                >
                  <MenuItem value="001-HO MAIN BRANCH">001-HO MAIN BRANCH</MenuItem>
                  <MenuItem value="002-MANIPAL BRANCH">002-MANIPAL BRANCH</MenuItem>
                  <MenuItem value="003-KUNDAPURA BRANCH">003-KUNDAPURA BRANCH</MenuItem>
                  <MenuItem value="004-KARKALA BRANCH">004-KARKALA BRANCH</MenuItem>
                </TextField>
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
                  <MenuItem value="-ALL-">-ALL-</MenuItem>
                  <MenuItem value="01-BANKING SECTION">01-BANKING SECTION</MenuItem>
                  <MenuItem value="02-CREDIT SECTION">02-CREDIT SECTION</MenuItem>
                  <MenuItem value="03-LOAN SECTION">03-LOAN SECTION</MenuItem>
                  <MenuItem value="04-ADMIN SECTION">04-ADMIN SECTION</MenuItem>
                </TextField>
              </Grid>

              {/* User */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="User"
                  fullWidth
                  size="small"
                  value={formData.user}
                  onChange={(e) => handleChange('user', e.target.value)}
                >
                  <MenuItem value="">-- Select User --</MenuItem>
                  <MenuItem value="ADMIN_USER">ADMIN_USER</MenuItem>
                  <MenuItem value="TELLER_01">TELLER_01</MenuItem>
                  <MenuItem value="OFFICER_02">OFFICER_02</MenuItem>
                  <MenuItem value="MANAGER_01">MANAGER_01</MenuItem>
                </TextField>
              </Grid>

              {/* Show Last 10 Transactions */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.show_last_10}
                      onChange={(e) => handleChange('show_last_10', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#334155' }}>
                      Show Last 10 Transactions
                    </Typography>
                  }
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
            Clear
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
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
              disabled={submitting}
              sx={{
                textTransform: 'none',
                backgroundColor: '#1e40af',
                px: 3,
                '&:hover': { backgroundColor: '#1d4ed8' },
              }}
            >
              {submitting ? 'Processing...' : 'Go'}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PayDemandDialog;
