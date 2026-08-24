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
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { toast } from 'react-toastify';
import { useGetMemberBasicInfo, useGetMemberAccountsPublic } from '../../queries/transfer';
import TokenService from '../../queries/token/tokenService';
import { useCreateContra, useUpdateContra } from '../../queries/banking';

interface ContraDialogProps {
    open: boolean;
    onClose: () => void;
    contraId?: string | null;
    initialData?: any;
    onSave?: (data: any) => void;
}

const ContraDialog: React.FC<ContraDialogProps> = ({ open, onClose, contraId, initialData, onSave }) => {
    const branch_code = TokenService.getBranchCode() || 'BRN001';
    const entered_by = TokenService.getUserId() || '';

    const [formData, setFormData] = useState({
        contra_date: new Date().toISOString().split('T')[0],
        contra_to: '',
        member_id: '',
        member_name: '',
        selected_account: '',
        contra_details: '',
        amount: '',
        mode_of_contra: 'Cash to Bank',
        branch_code: branch_code,
        entered_by: entered_by,
    });

    const [fetchMemberInfo, setFetchMemberInfo] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Member lookup hooks
    const { data: memberInfo, isLoading: loadingMember } = useGetMemberBasicInfo(
        formData.member_id,
        fetchMemberInfo
    );
    const { data: memberAccounts } = useGetMemberAccountsPublic(
        formData.member_id,
        fetchMemberInfo && !!memberInfo?.success
    );

    useEffect(() => {
        if (contraId && initialData) {
            setFormData({
                contra_date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                contra_to: initialData.contra_to || initialData.received_from || '',
                member_id: initialData.member_id || '',
                member_name: initialData.member_name || '',
                selected_account: initialData.account_no || '',
                contra_details: initialData.description || initialData.contra_details || '',
                amount: initialData.amount ? initialData.amount.toString() : '',
                mode_of_contra: initialData.mode_of_contra || 'Cash to Bank',
                branch_code: initialData.branch_code || branch_code,
                entered_by: initialData.entered_by || entered_by,
            });
            if (initialData.member_id) {
                setFetchMemberInfo(true);
            }
        } else if (!contraId) {
            setFormData({
                contra_date: new Date().toISOString().split('T')[0],
                contra_to: '',
                member_id: '',
                member_name: '',
                selected_account: '',
                contra_details: '',
                amount: '',
                mode_of_contra: 'Cash to Bank',
                branch_code: branch_code,
                entered_by: entered_by,
            });
            setFetchMemberInfo(false);
        }
    }, [contraId, initialData, branch_code, entered_by, open]);

    useEffect(() => {
        if (memberInfo?.success && memberInfo.data) {
            setFormData(prev => ({
                ...prev,
                member_name: memberInfo.data.name || '',
                contra_to: memberInfo.data.name || prev.contra_to,
            }));
        }
    }, [memberInfo]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'member_id') {
            setFetchMemberInfo(false);
            setFormData(prev => ({ ...prev, member_name: '', selected_account: '' }));
        }
    };

    const handleFetchMember = () => {
        if (!formData.member_id.trim()) {
            toast.warning('Please enter a Member ID');
            return;
        }
        setFetchMemberInfo(true);
    };

    const createContraMutation = useCreateContra();
    const updateContraMutation = useUpdateContra();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!formData.contra_date) {
            setFormError('Please select a date');
            return;
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setFormError('Please enter a valid amount');
            return;
        }
        if (!formData.contra_to && !formData.member_id) {
            setFormError('Please enter Contra Details or select a Member');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                id: contraId || `CNT-${Date.now().toString().slice(-6)}`,
                contra_id: initialData?.contra_id || `CNT-${Date.now().toString().slice(-6)}`,
                date: formData.contra_date,
                debit_from: formData.contra_to,
                credit_to: formData.selected_account || 'Bank',
                contra_to: formData.contra_to,
                member_id: formData.member_id || undefined,
                account_no: formData.selected_account || undefined,
                description: formData.contra_details,
                particulars: formData.contra_details,
                amount: parseFloat(formData.amount),
                mode_of_contra: formData.mode_of_contra,
                status: 'active',
                branch_code: formData.branch_code,
                entered_by: formData.entered_by,
            };

            if (contraId) {
                await updateContraMutation.mutateAsync({ contraId: initialData?.contra_id || contraId, data: payload });
                toast.success('Contra entry updated successfully');
            } else {
                await createContraMutation.mutateAsync(payload);
                toast.success('Contra entry created successfully');
            }

            if (onSave) {
                onSave(payload);
            }
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" component="span" fontWeight={600} color="primary">
                    {contraId ? 'Edit Contra Entry' : 'Add New Contra Entry'}
                </Typography>
                <IconButton onClick={onClose} size="small" disabled={submitting}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent dividers sx={{ pt: 2 }}>
                    {formError && (
                        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
                            {formError}
                        </Alert>
                    )}

                    <Grid container spacing={2}>
                        {/* Contra Date */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Contra Date"
                                type="date"
                                fullWidth
                                required
                                value={formData.contra_date}
                                onChange={(e) => handleChange('contra_date', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                size="small"
                            />
                        </Grid>

                        {/* Mode of Contra */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Mode Of Contra"
                                fullWidth
                                required
                                value={formData.mode_of_contra}
                                onChange={(e) => handleChange('mode_of_contra', e.target.value)}
                                size="small"
                            >
                                <MenuItem value="Cash to Bank">Cash to Bank</MenuItem>
                                <MenuItem value="Bank to Cash">Bank to Cash</MenuItem>
                                <MenuItem value="Bank to Bank">Bank to Bank</MenuItem>
                                <MenuItem value="Cash to Cash">Cash to Cash</MenuItem>
                                <MenuItem value="Transfer">Transfer</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Member Search */}
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    label="Member ID (Optional)"
                                    fullWidth
                                    value={formData.member_id}
                                    onChange={(e) => handleChange('member_id', e.target.value)}
                                    placeholder="Enter Member ID"
                                    size="small"
                                    helperText="Type ID and click search icon"
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleFetchMember}
                                    disabled={loadingMember || !formData.member_id.trim()}
                                    sx={{ minWidth: '45px', px: 1, height: '40px' }}
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
                                value={formData.member_name}
                                InputProps={{ readOnly: true }}
                                size="small"
                                placeholder="Auto-populated"
                            />
                        </Grid>

                        {/* Member Accounts Dropdown */}
                        {fetchMemberInfo && memberAccounts?.success && memberAccounts.data && memberAccounts.data.length > 0 && (
                            <Grid item xs={12}>
                                <Paper sx={{ p: 1.5, bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
                                        Member Accounts Available:
                                    </Typography>
                                    <TextField
                                        select
                                        label="Select Account"
                                        fullWidth
                                        value={formData.selected_account}
                                        onChange={(e) => handleChange('selected_account', e.target.value)}
                                        size="small"
                                    >
                                        <MenuItem value="">-- Select an account --</MenuItem>
                                        {memberAccounts.data.map((acc: any) => (
                                            <MenuItem key={acc.account_id || acc._id} value={acc.account_no || acc.account_id}>
                                                {acc.account_type || 'Account'} - {acc.account_no} (Bal: ₹{acc.balance || 0})
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Paper>
                            </Grid>
                        )}

                        {/* Contra Particulars */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Contra Details / Particulars"
                                fullWidth
                                required
                                value={formData.contra_to}
                                onChange={(e) => handleChange('contra_to', e.target.value)}
                                placeholder="E.g., Bank Deposit / Cash Withdrawal"
                                size="small"
                            />
                        </Grid>

                        {/* Amount */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Amount (₹)"
                                type="number"
                                fullWidth
                                required
                                value={formData.amount}
                                onChange={(e) => handleChange('amount', e.target.value)}
                                placeholder="0.00"
                                size="small"
                                inputProps={{ min: "0", step: "0.01" }}
                            />
                        </Grid>

                        {/* Description */}
                        <Grid item xs={12}>
                            <TextField
                                label="Narration / Description"
                                fullWidth
                                multiline
                                rows={2}
                                value={formData.contra_details}
                                onChange={(e) => handleChange('contra_details', e.target.value)}
                                placeholder="Enter transaction narration"
                                size="small"
                            />
                        </Grid>

                        {/* Branch Code */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Branch Code"
                                fullWidth
                                value={formData.branch_code}
                                onChange={(e) => handleChange('branch_code', e.target.value)}
                                size="small"
                            />
                        </Grid>

                        {/* Entered By */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Entered By"
                                fullWidth
                                value={formData.entered_by}
                                onChange={(e) => handleChange('entered_by', e.target.value)}
                                size="small"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={onClose} color="inherit" disabled={submitting}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={submitting}>
                        {submitting ? <CircularProgress size={24} /> : contraId ? 'Update Contra' : 'Save Contra'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ContraDialog;
