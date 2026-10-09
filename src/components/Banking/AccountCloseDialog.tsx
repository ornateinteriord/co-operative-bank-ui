import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import { MaturityAccount } from '../../types';
import {
    useCreateMaturityPaymentWithCashfree,
    useCloseAccount,
    useUpdateAccount,
    useGetPrematureClosurePreview,
    useProcessPrematureClosure
} from '../../queries/admin';
import { toast } from 'react-toastify';

interface AccountCloseDialogProps {
    open: boolean;
    onClose: () => void;
    account: MaturityAccount | null;
    isMatured: boolean; // true for pay-maturity, false for pre-maturity
    onSuccess: () => void;
}

const AccountCloseDialog: React.FC<AccountCloseDialogProps> = ({
    open,
    onClose,
    account,
    isMatured,
    onSuccess
}) => {
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [paymentReference, setPaymentReference] = useState('');

    const createMaturityPaymentMutation = useCreateMaturityPaymentWithCashfree();
    const closeAccountMutation = useCloseAccount();
    const updateAccountMutation = useUpdateAccount();
    const processPrematureClosureMutation = useProcessPrematureClosure();

    // Fetch premature closure penalty preview from backend when pre-maturity
    const { data: previewResponse, isLoading: isPreviewLoading } = useGetPrematureClosurePreview(
        account?.account_id,
        open && !isMatured
    );

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setPaymentMode('Cash');
            setPaymentReference('');
        }
    }, [open]);

    if (!account) return null;

    const preview = previewResponse?.data;

    // Calculate amounts
    const principalAmount = account.account_amount || 0;
    const interestRate = account.interest_rate || 0;

    let interestAmount = 0;
    let penaltyAmount = 0;
    let totalPayout = principalAmount;
    let revisedRate = interestRate;

    if (isMatured && principalAmount > 0) {
        // Simple interest calculation at full contract rate
        const durationInYears = (account.duration || 12) / 12;
        interestAmount = Math.round((principalAmount * interestRate * durationInYears) / 100 * 100) / 100;
        totalPayout = principalAmount + interestAmount;
    } else if (!isMatured && preview) {
        // Use exact calculated values from bankingRules
        interestAmount = preview.interest_earned || 0;
        penaltyAmount = preview.penalty_amount || 0;
        totalPayout = preview.net_payout || principalAmount;
        revisedRate = preview.revised_interest_rate;
    }

    const hasBalance = principalAmount > 0;

    const handleClose = async () => {
        if (!account.account_id) return;

        try {
            // If balance is 0, just close the account directly without payment
            if (!hasBalance) {
                const response: any = await closeAccountMutation.mutateAsync(account.account_id);
                if (response && response.success) {
                    toast.success('Account closed successfully');
                    onSuccess();
                    onClose();
                } else {
                    toast.error(response?.message || 'Failed to close account');
                }
                return;
            }

            // PREMATURE CLOSURE FLOW (Calls banking rules premature closure endpoint)
            if (!isMatured) {
                const response: any = await processPrematureClosureMutation.mutateAsync({
                    account_id: account.account_id,
                    member_id: account.member_id,
                    payment_method: paymentMode.toLowerCase(),
                    reference_no: paymentReference || undefined,
                });

                if (response && response.success) {
                    toast.success(response.message || `Premature closure completed. Net payout: ₹${totalPayout.toLocaleString('en-IN')}`);
                    onSuccess();
                    onClose();
                } else {
                    toast.error(response?.message || 'Failed to process premature closure');
                }
                return;
            }

            // NORMAL MATURITY PAYMENT FLOW
            if (paymentMode === 'Cash') {
                const response: any = await updateAccountMutation.mutateAsync({
                    accountId: account.account_id,
                    data: {
                        status: 'Closed',
                        date_of_close: new Date().toISOString(),
                        account_amount: 0,
                        payout_amount: totalPayout,
                        interest_paid: interestAmount,
                        payment_mode: 'cash',
                        payment_reference: paymentReference || undefined
                    }
                });

                if (response && response.success) {
                    toast.success(`Account closed successfully. Cash payment of ₹${totalPayout.toLocaleString('en-IN')} processed.`);
                    onSuccess();
                    onClose();
                } else {
                    toast.error(response?.message || 'Failed to close account');
                }
                return;
            }

            // DIGITAL MATURITY PAYMENT
            const paymentMethodMap: Record<string, string> = {
                'Bank Transfer': 'online',
                'UPI': 'online',
                'Cheque': 'cheque'
            };

            const maturityPaymentData = {
                account_id: account.account_id,
                account_no: account.account_no,
                account_type: account.account_type,
                member_id: account.member_id,
                amount: totalPayout,
                payment_method: paymentMethodMap[paymentMode] || 'online',
                description: `Maturity payment for account ${account.account_no}`,
                reference_no: paymentReference || undefined,
            };

            const response: any = await createMaturityPaymentMutation.mutateAsync(maturityPaymentData);
            if (response && response.success) {
                toast.success(response.message || `Maturity payment of ₹${totalPayout.toLocaleString('en-IN')} processed successfully`);
                onSuccess();
                onClose();
            } else {
                toast.error(response?.message || 'Digital payout failed. Please try again or use Cash payment.');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to process account closure');
        }
    };


    const isLoading = createMaturityPaymentMutation.isPending || closeAccountMutation.isPending || updateAccountMutation.isPending;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{
                background: 'linear-gradient(135deg, #667EEA 0%, #818CF8 100%)',
                color: 'white',
                fontWeight: 600
            }}>
                {isMatured ? 'Pay Maturity & Close Account' : 'Pre-Maturity Closure'}
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                {/* Account Details */}
                <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Account Details
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                        <Typography variant="body2"><strong>Account No:</strong> {account.account_no}</Typography>
                        <Typography variant="body2"><strong>Member ID:</strong> {account.member_id}</Typography>
                        <Typography variant="body2"><strong>Member:</strong> {account.memberDetails?.name || '-'}</Typography>
                        <Typography variant="body2"><strong>Status:</strong> {account.status}</Typography>
                    </Box>
                </Box>

                {/* Payment Details */}
                {hasBalance ? (
                    <>
                        <Box sx={{ bgcolor: '#fef3c7', p: 2, borderRadius: 2, mb: 3, border: '1px solid #f59e0b' }}>
                            <Typography variant="subtitle2" color="#92400e" gutterBottom>
                                💰 Payment Required
                            </Typography>

                            <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Principal Amount:</Typography>
                                    <Typography variant="body2" fontWeight={600}>₹{principalAmount.toLocaleString('en-IN')}</Typography>
                                </Box>

                                {isMatured && interestAmount > 0 && (
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Interest Rate:</Typography>
                                            <Typography variant="body2">{interestRate}% p.a.</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Maturity Interest Earned:</Typography>
                                            <Typography variant="body2" color="success.main" fontWeight={600}>
                                                + ₹{interestAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                            </Typography>
                                        </Box>
                                    </>
                                )}

                                {!isMatured && preview && (
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Elapsed Tenure:</Typography>
                                            <Typography variant="body2">
                                                {preview.elapsed_months} / {preview.total_tenure_months || account.duration || 12} months
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2">Contract vs Penal Rate:</Typography>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                                                    {preview.contract_interest_rate}%
                                                </Typography>
                                                <Chip label={`${preview.revised_interest_rate}% p.a.`} size="small" color="warning" />
                                            </Box>
                                        </Box>
                                        {interestAmount > 0 && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">Accrued Interest (Revised):</Typography>
                                                <Typography variant="body2" color="success.main" fontWeight={600}>
                                                    + ₹{interestAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                </Typography>
                                            </Box>
                                        )}
                                        {penaltyAmount > 0 && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2">Early Closure Penalty:</Typography>
                                                <Typography variant="body2" color="error.main" fontWeight={600}>
                                                    - ₹{penaltyAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                </Typography>
                                            </Box>
                                        )}
                                    </>
                                )}

                                <Divider sx={{ my: 1 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body1" fontWeight={700}>
                                        {isMatured ? 'Total Payout:' : 'Net Premature Payout:'}
                                    </Typography>
                                    <Typography variant="body1" fontWeight={700} color="primary">
                                        ₹{totalPayout.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Payment Form */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Payment Mode</InputLabel>
                                <Select
                                    value={paymentMode}
                                    label="Payment Mode"
                                    onChange={(e) => setPaymentMode(e.target.value)}
                                >
                                    <MenuItem value="Cash">Cash</MenuItem>
                                    <MenuItem value="Bank Transfer">Bank Transfer (Digital)</MenuItem>
                                    <MenuItem value="UPI">UPI (Digital)</MenuItem>
                                    <MenuItem value="Cheque">Cheque (Digital)</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                size="small"
                                label="Reference (Optional)"
                                value={paymentReference}
                                onChange={(e) => setPaymentReference(e.target.value)}
                                placeholder="Transaction ID / Cheque No"
                            />
                        </Box>
                    </>
                ) : (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Balance is clear. Ready to close this account.
                    </Alert>
                )}

                {!isMatured && hasBalance && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <strong>Premature Closure Rule:</strong> As per Nidhi banking rules, interest is calculated at a reduced rate of {revisedRate}% p.a. for the elapsed {preview?.elapsed_months || 0} months.
                    </Alert>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                <Button onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleClose}
                    disabled={isLoading}
                    sx={{
                        background: hasBalance
                            ? 'linear-gradient(135deg, #667EEA 0%, #818CF8 100%)'
                            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    }}
                >
                    {isLoading ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : hasBalance ? (
                        `Pay ₹${totalPayout.toLocaleString('en-IN', { maximumFractionDigits: 0 })} & Close`
                    ) : (
                        'Close Account'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AccountCloseDialog;
