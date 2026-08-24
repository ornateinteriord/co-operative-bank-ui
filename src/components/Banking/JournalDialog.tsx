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
import { useCreateJournal, useUpdateJournal } from '../../queries/banking';

interface JournalDialogProps {
    open: boolean;
    onClose: () => void;
    journalId?: string | null;
    initialData?: any;
    onSave?: (data: any) => void;
}

const JournalDialog: React.FC<JournalDialogProps> = ({ open, onClose, journalId, initialData, onSave }) => {
    const branch_code = TokenService.getBranchCode() || 'BRN001';
    const entered_by = TokenService.getUserId() || '';

    const [formData, setFormData] = useState({
        journal_date: new Date().toISOString().split('T')[0],
        debit_from: '',
        credit_to: '',
        member_id: '',
        member_name: '',
        selected_account: '',
        journal_details: '',
        amount: '',
        mode_of_entry: 'Journal',
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
        if (journalId && initialData) {
            setFormData({
                journal_date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                debit_from: initialData.debit_from || initialData.debitFrom || initialData.received_from || '',
                credit_to: initialData.credit_to || initialData.creditTo || initialData.paid_to || '',
                member_id: initialData.member_id || '',
                member_name: initialData.member_name || '',
                selected_account: initialData.account_no || '',
                journal_details: initialData.description || initialData.journal_details || '',
                amount: initialData.amount ? initialData.amount.toString() : '',
                mode_of_entry: initialData.mode_of_entry || 'Journal',
                branch_code: initialData.branch_code || branch_code,
                entered_by: initialData.entered_by || entered_by,
            });
            if (initialData.member_id) {
                setFetchMemberInfo(true);
            }
        } else if (!journalId) {
            setFormData({
                journal_date: new Date().toISOString().split('T')[0],
                debit_from: '',
                credit_to: '',
                member_id: '',
                member_name: '',
                selected_account: '',
                journal_details: '',
                amount: '',
                mode_of_entry: 'Journal',
                branch_code: branch_code,
                entered_by: entered_by,
            });
            setFetchMemberInfo(false);
        }
    }, [journalId, initialData, branch_code, entered_by, open]);

    useEffect(() => {
        if (memberInfo?.success && memberInfo.data) {
            setFormData(prev => ({
                ...prev,
                member_name: memberInfo.data.name || '',
                debit_from: prev.debit_from || memberInfo.data.name || '',
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

    const createJournalMutation = useCreateJournal();
    const updateJournalMutation = useUpdateJournal();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!formData.journal_date) {
            setFormError('Please select a date');
            return;
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setFormError('Please enter a valid amount');
            return;
        }
        if (!formData.debit_from && !formData.member_id) {
            setFormError('Please enter Debit From or select a Member');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                id: journalId || `JRN-${Date.now().toString().slice(-6)}`,
                journal_id: initialData?.journal_id || `JRN-${Date.now().toString().slice(-6)}`,
                date: formData.journal_date,
                debit_from: formData.debit_from,
                credit_to: formData.credit_to,
                member_id: formData.member_id || undefined,
                account_no: formData.selected_account || undefined,
                description: formData.journal_details,
                narration: formData.journal_details,
                amount: parseFloat(formData.amount),
                mode_of_entry: formData.mode_of_entry,
                status: 'active',
                branch_code: formData.branch_code,
                entered_by: formData.entered_by,
            };

            if (journalId) {
                await updateJournalMutation.mutateAsync({ journalId: initialData?.journal_id || journalId, data: payload });
                toast.success('Journal entry updated successfully');
            } else {
                await createJournalMutation.mutateAsync(payload);
                toast.success('Journal entry created successfully');
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
                    {journalId ? 'Edit Journal Entry' : 'Add New Journal Entry'}
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
                        {/* Journal Date */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Journal Date"
                                type="date"
                                fullWidth
                                required
                                value={formData.journal_date}
                                onChange={(e) => handleChange('journal_date', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                size="small"
                            />
                        </Grid>

                        {/* Mode of Entry */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Type / Mode Of Entry"
                                fullWidth
                                required
                                value={formData.mode_of_entry}
                                onChange={(e) => handleChange('mode_of_entry', e.target.value)}
                                size="small"
                            >
                                <MenuItem value="Journal">Journal</MenuItem>
                                <MenuItem value="Adjustment">Adjustment</MenuItem>
                                <MenuItem value="Transfer">Transfer</MenuItem>
                                <MenuItem value="Opening Balance">Opening Balance</MenuItem>
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

                        {/* Debit Account / From */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Debit From / Particulars"
                                fullWidth
                                required
                                value={formData.debit_from}
                                onChange={(e) => handleChange('debit_from', e.target.value)}
                                placeholder="E.g., Cash / Expense Account"
                                size="small"
                            />
                        </Grid>

                        {/* Credit Account / To */}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Credit To / Particulars"
                                fullWidth
                                value={formData.credit_to}
                                onChange={(e) => handleChange('credit_to', e.target.value)}
                                placeholder="E.g., Income Account / Bank"
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
                                value={formData.journal_details}
                                onChange={(e) => handleChange('journal_details', e.target.value)}
                                placeholder="Enter journal narration"
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
                        {submitting ? <CircularProgress size={24} /> : journalId ? 'Update Journal' : 'Save Journal'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default JournalDialog;
