import { forwardRef } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { toWords } from 'number-to-words';

interface ContraPrintProps {
    contraData: {
        contra_id: string;
        contra_date: string | Date;
        contra_to: string;
        contra_details: string;
        mode_of_contra: string;
        amount: number;
        branch_code?: string;
        entered_by?: string;
    };
    currentPage?: number;
    totalPages?: number;
}

const ContraPrint = forwardRef<HTMLDivElement, ContraPrintProps>(({ contraData, currentPage = 1, totalPages = 1 }, ref) => {
    const formatDate = (date: string | Date) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getCurrentDateTime = () => {
        const now = new Date();
        return now.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const convertAmountToWords = (amount: number): string => {
        try {
            const words = toWords(amount);
            return words.charAt(0).toUpperCase() + words.slice(1) + ' Only';
        } catch {
            return 'Amount conversion error';
        }
    };

    return (
        <Box
            ref={ref}
            sx={{
                position: 'relative',
                width: '210mm',
                minHeight: '297mm',
                padding: '20mm',
                backgroundColor: 'white',
                fontFamily: 'Arial, sans-serif',
                color: '#000',
                boxSizing: 'border-box',
                '@media print': {
                    padding: '15mm',
                    margin: 0,
                    boxShadow: 'none',
                    '@page': {
                        size: 'A4 portrait',
                        margin: 0
                    }
                }
            }}
        >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
                    CO-OPERATIVE BANK LIMITED
                </Typography>
                <Typography variant="body2" sx={{ color: '#555', mt: 0.5 }}>
                    Branch: {contraData.branch_code || 'Main Branch'} | Date & Time: {getCurrentDateTime()}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1, textDecoration: 'underline' }}>
                    CONTRA VOUCHER
                </Typography>
            </Box>

            <Divider sx={{ mb: 3, borderColor: '#000' }} />

            {/* Voucher Details */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1">
                    <strong>Voucher No:</strong> {contraData.contra_id}
                </Typography>
                <Typography variant="body1">
                    <strong>Date:</strong> {formatDate(contraData.contra_date)}
                </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                    <strong>Particulars / Details:</strong> {contraData.contra_to || 'N/A'}
                </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                    <strong>Narration:</strong> {contraData.contra_details || '-'}
                </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                    <strong>Mode:</strong> {contraData.mode_of_contra || 'Cash to Bank'}
                </Typography>
            </Box>

            <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                    Amount: ₹{Number(contraData.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 0.5, color: '#475569' }}>
                    Amount in words: {convertAmountToWords(Number(contraData.amount || 0))}
                </Typography>
            </Box>

            {/* Signatures */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 8, pt: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Divider sx={{ width: '150px', mb: 1, borderColor: '#000' }} />
                    <Typography variant="body2">Entered By</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Divider sx={{ width: '150px', mb: 1, borderColor: '#000' }} />
                    <Typography variant="body2">Verified By</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Divider sx={{ width: '150px', mb: 1, borderColor: '#000' }} />
                    <Typography variant="body2">Manager / Authorised Signatory</Typography>
                </Box>
            </Box>

            <Box sx={{ position: 'absolute', bottom: '15mm', left: '20mm', right: '20mm', textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                    Page {currentPage} of {totalPages} - Computer Generated Voucher
                </Typography>
            </Box>
        </Box>
    );
});

ContraPrint.displayName = 'ContraPrint';
export default ContraPrint;
