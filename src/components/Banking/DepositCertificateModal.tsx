import React, { useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Divider,
    CircularProgress,
    Alert,
    Paper,
    Grid,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import VerifiedIcon from '@mui/icons-material/Verified';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CloseIcon from '@mui/icons-material/Close';
import { useReactToPrint } from 'react-to-print';
import { useGetDepositCertificate } from '../../queries/admin';

interface DepositCertificateModalProps {
    open: boolean;
    onClose: () => void;
    accountId: string | null;
}

const DepositCertificateModal: React.FC<DepositCertificateModalProps> = ({
    open,
    onClose,
    accountId,
}) => {
    const certificateRef = useRef<HTMLDivElement>(null);
    const { data: certResponse, isLoading, isError, error } = useGetDepositCertificate(
        accountId || undefined,
        open && !!accountId
    );

    const handlePrint = useReactToPrint({
        contentRef: certificateRef,
    });

    const cert = certResponse?.data;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                color: 'white',
                py: 2,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalanceIcon />
                    <Typography variant="h6" fontWeight={700}>
                        Official Deposit Certificate
                    </Typography>
                </Box>
                <Button onClick={onClose} sx={{ color: 'white', minWidth: 'auto' }}>
                    <CloseIcon />
                </Button>
            </DialogTitle>

            <DialogContent sx={{ p: 3, bgcolor: '#f8fafc' }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
                        <CircularProgress sx={{ color: '#1e3a8a' }} />
                        <Typography variant="body2" color="text.secondary">
                            Generating official deposit receipt...
                        </Typography>
                    </Box>
                ) : isError || !cert ? (
                    <Alert severity="error" sx={{ my: 2 }}>
                        {(error as any)?.message || 'Failed to generate deposit certificate. Please verify that this is an active FD/RD account.'}
                    </Alert>
                ) : (
                    <Box ref={certificateRef} sx={{
                        p: 4,
                        bgcolor: '#ffffff',
                        border: '4px double #1e3a8a',
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        color: '#0f172a',
                    }}>
                        {/* Header */}
                        <Box sx={{ textAlign: 'center', pb: 2, borderBottom: '2px solid #1e3a8a' }}>
                            <Typography variant="overline" sx={{ letterSpacing: 2, color: '#64748b', fontWeight: 700 }}>
                                {cert.registration_no}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e3a8a', letterSpacing: 1 }}>
                                {cert.bank_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {cert.branch?.branch_name} | {cert.branch?.address}
                            </Typography>
                            <Box sx={{
                                display: 'inline-block',
                                mt: 2,
                                px: 3,
                                py: 0.5,
                                bgcolor: '#eff6ff',
                                border: '1px solid #93c5fd',
                                borderRadius: 1,
                            }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e3a8a', letterSpacing: 1.5 }}>
                                    {cert.certificate_type}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Certificate Meta */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 2 }}>
                            <Typography variant="body2">
                                <strong>Certificate No:</strong> <span style={{ color: '#1e3a8a' }}>{cert.certificate_no}</span>
                            </Typography>
                            <Typography variant="body2">
                                <strong>Date of Issue:</strong> {new Date(cert.issue_date).toLocaleDateString('en-GB')}
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* Depositor & Account Info */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', height: '100%' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <VerifiedIcon fontSize="small" color="primary" /> Depositor Details
                                    </Typography>
                                    <Typography variant="body2"><strong>Member Name:</strong> {cert.depositor?.name}</Typography>
                                    <Typography variant="body2"><strong>Member ID:</strong> {cert.depositor?.member_id}</Typography>
                                    {cert.depositor?.relative_name && (
                                        <Typography variant="body2"><strong>S/o / D/o / W/o:</strong> {cert.depositor?.relative_name}</Typography>
                                    )}
                                    {cert.depositor?.address && (
                                        <Typography variant="body2"><strong>Address:</strong> {cert.depositor?.address}</Typography>
                                    )}
                                    {cert.depositor?.phone && (
                                        <Typography variant="body2"><strong>Contact:</strong> {cert.depositor?.phone}</Typography>
                                    )}
                                    <Typography variant="body2"><strong>Nominee:</strong> {cert.depositor?.nominee_name} ({cert.depositor?.nominee_relation})</Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', height: '100%' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a8a', mb: 1 }}>
                                        Deposit Particulars
                                    </Typography>
                                    <Typography variant="body2"><strong>Account Number:</strong> {cert.account?.account_no}</Typography>
                                    <Typography variant="body2"><strong>Scheme:</strong> {cert.account?.scheme_name}</Typography>
                                    <Typography variant="body2"><strong>Deposit Date:</strong> {new Date(cert.account?.date_of_deposit).toLocaleDateString('en-GB')}</Typography>
                                    <Typography variant="body2"><strong>Maturity Date:</strong> {new Date(cert.account?.date_of_maturity).toLocaleDateString('en-GB')}</Typography>
                                    <Typography variant="body2"><strong>Tenure:</strong> {cert.account?.tenure_months} Months</Typography>
                                    <Typography variant="body2"><strong>Interest Rate:</strong> {cert.account?.interest_rate}% p.a.</Typography>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Amount Box */}
                        <Box sx={{
                            mt: 3,
                            p: 2.5,
                            bgcolor: '#f0fdf4',
                            border: '1px solid #86efac',
                            borderRadius: 2,
                        }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">PRINCIPAL DEPOSIT AMOUNT</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#166534' }}>
                                        ₹{cert.account?.principal_amount?.toLocaleString('en-IN')}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#374151' }}>
                                        {cert.account?.principal_amount_in_words}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">ESTIMATED MATURITY VALUE</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e40af' }}>
                                        ₹{cert.account?.maturity_amount?.toLocaleString('en-IN')}
                                    </Typography>
                                    <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#374151' }}>
                                        {cert.account?.maturity_amount_in_words}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Terms */}
                        <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed #cbd5e1' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                                TERMS & CONDITIONS:
                            </Typography>
                            <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                {cert.terms?.map((term: string, idx: number) => (
                                    <Typography key={idx} component="li" variant="caption" color="text.secondary" sx={{ display: 'list-item' }}>
                                        {term}
                                    </Typography>
                                ))}
                            </Box>
                        </Box>

                        {/* Signatures */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6, pt: 2 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Box sx={{ width: 140, borderBottom: '1px solid #475569', mb: 0.5 }} />
                                <Typography variant="caption">Prepared By</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Box sx={{ width: 100, height: 40, border: '1px dashed #94a3b8', borderRadius: 1, mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">BANK SEAL</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Box sx={{ width: 140, borderBottom: '1px solid #475569', mb: 0.5 }} />
                                <Typography variant="caption">Authorized Signatory / Manager</Typography>
                            </Box>
                        </Box>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: '#ffffff' }}>
                <Button onClick={onClose} variant="outlined" color="inherit">
                    Close
                </Button>
                <Button
                    onClick={handlePrint}
                    variant="contained"
                    startIcon={<PrintIcon />}
                    disabled={!cert || isLoading}
                    sx={{
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    }}
                >
                    Print Official Certificate
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DepositCertificateModal;
