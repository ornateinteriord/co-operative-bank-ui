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
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CloseIcon from '@mui/icons-material/Close';
import { useReactToPrint } from 'react-to-print';
import { useGetLoanNOC } from '../../queries/admin';

interface LoanNOCModalProps {
    open: boolean;
    onClose: () => void;
    accountId: string | null;
}

const LoanNOCModal: React.FC<LoanNOCModalProps> = ({
    open,
    onClose,
    accountId,
}) => {
    const certificateRef = useRef<HTMLDivElement>(null);
    const { data: nocResponse, isLoading, isError, error } = useGetLoanNOC(
        accountId || undefined,
        open && !!accountId
    );

    const handlePrint = useReactToPrint({
        contentRef: certificateRef,
    });

    const noc = nocResponse?.data;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
                color: 'white',
                py: 2,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalanceIcon />
                    <Typography variant="h6" fontWeight={700}>
                        Loan Clearance Certificate / NOC
                    </Typography>
                </Box>
                <Button onClick={onClose} sx={{ color: 'white', minWidth: 'auto' }}>
                    <CloseIcon />
                </Button>
            </DialogTitle>

            <DialogContent sx={{ p: 3, bgcolor: '#f8fafc' }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
                        <CircularProgress sx={{ color: '#059669' }} />
                        <Typography variant="body2" color="text.secondary">
                            Verifying loan settlement and generating NOC...
                        </Typography>
                    </Box>
                ) : isError || !noc ? (
                    <Alert severity="error" sx={{ my: 2 }}>
                        {(error as any)?.message || 'Failed to generate NOC. Please ensure the loan is fully repaid with 0 outstanding balance.'}
                    </Alert>
                ) : (
                    <Box ref={certificateRef} sx={{
                        p: 4,
                        bgcolor: '#ffffff',
                        border: '4px double #065f46',
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        color: '#0f172a',
                    }}>
                        {/* Header */}
                        <Box sx={{ textAlign: 'center', pb: 2, borderBottom: '2px solid #065f46' }}>
                            <Typography variant="overline" sx={{ letterSpacing: 2, color: '#64748b', fontWeight: 700 }}>
                                {noc.registration_no}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#065f46', letterSpacing: 1 }}>
                                {noc.bank_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {noc.branch?.branch_name} | {noc.branch?.address}
                            </Typography>
                            <Box sx={{
                                display: 'inline-block',
                                mt: 2,
                                px: 3,
                                py: 0.5,
                                bgcolor: '#ecfdf5',
                                border: '1px solid #6ee7b7',
                                borderRadius: 1,
                            }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#065f46', letterSpacing: 1.5 }}>
                                    {noc.certificate_title}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Certificate Meta */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 2 }}>
                            <Typography variant="body2">
                                <strong>Reference No:</strong> <span style={{ color: '#065f46' }}>{noc.certificate_no}</span>
                            </Typography>
                            <Typography variant="body2">
                                <strong>Date of Issue:</strong> {new Date(noc.issue_date).toLocaleDateString('en-GB')}
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* Borrower & Loan Info */}
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', height: '100%' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#065f46', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <VerifiedUserIcon fontSize="small" color="success" /> Borrower Details
                                    </Typography>
                                    <Typography variant="body2"><strong>Member Name:</strong> {noc.borrower?.name}</Typography>
                                    <Typography variant="body2"><strong>Member ID:</strong> {noc.borrower?.member_id}</Typography>
                                    {noc.borrower?.relative_name && (
                                        <Typography variant="body2"><strong>S/o / D/o / W/o:</strong> {noc.borrower?.relative_name}</Typography>
                                    )}
                                    {noc.borrower?.address && (
                                        <Typography variant="body2"><strong>Address:</strong> {noc.borrower?.address}</Typography>
                                    )}
                                    {noc.borrower?.phone && (
                                        <Typography variant="body2"><strong>Contact:</strong> {noc.borrower?.phone}</Typography>
                                    )}
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', height: '100%' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#065f46', mb: 1 }}>
                                        Loan Settlement Details
                                    </Typography>
                                    <Typography variant="body2"><strong>Loan Account No:</strong> {noc.loan_details?.account_no}</Typography>
                                    <Typography variant="body2"><strong>Facility Type:</strong> {noc.loan_details?.loan_type}</Typography>
                                    <Typography variant="body2"><strong>Sanction Date:</strong> {noc.loan_details?.sanction_date ? new Date(noc.loan_details.sanction_date).toLocaleDateString('en-GB') : '-'}</Typography>
                                    <Typography variant="body2"><strong>Settlement Date:</strong> {new Date(noc.loan_details?.closure_date).toLocaleDateString('en-GB')}</Typography>
                                    <Typography variant="body2"><strong>Outstanding Dues:</strong> ₹0.00</Typography>
                                    <Typography variant="body2" sx={{ color: '#059669', fontWeight: 700 }}>
                                        <strong>Status:</strong> {noc.loan_details?.status}
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Official Certification Declaration */}
                        <Box sx={{
                            mt: 3,
                            p: 3,
                            bgcolor: '#f0fdf4',
                            border: '1px solid #86efac',
                            borderRadius: 2,
                        }}>
                            <Typography variant="body2" sx={{ lineHeight: 1.8, color: '#166534', textAlign: 'justify' }}>
                                <strong>TO WHOMSOEVER IT MAY CONCERN:</strong><br />
                                {noc.declaration}
                            </Typography>
                        </Box>

                        {/* Signatures */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6, pt: 2 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Box sx={{ width: 140, borderBottom: '1px solid #475569', mb: 0.5 }} />
                                <Typography variant="caption">Loan Officer</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Box sx={{ width: 100, height: 40, border: '1px dashed #94a3b8', borderRadius: 1, mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">BANK SEAL</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                                <Box sx={{ width: 140, borderBottom: '1px solid #475569', mb: 0.5 }} />
                                <Typography variant="caption">Branch Manager</Typography>
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
                    disabled={!noc || isLoading}
                    sx={{
                        background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
                    }}
                >
                    Print No Objection Certificate
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LoanNOCModal;
