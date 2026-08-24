import { forwardRef } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

interface JournalData {
    journal_id: string;
    date: string | Date;
    debit_from: string;
    credit_to?: string;
    description: string;
    mode_of_entry: string;
    amount: number;
    status?: string;
}

interface JournalsTablePrintProps {
    journals: JournalData[];
    dateRange?: string;
}

const JournalsTablePrint = forwardRef<HTMLDivElement, JournalsTablePrintProps>(({ journals, dateRange }, ref) => {
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

    const calculateTotal = () => {
        return journals.reduce((sum, item) => sum + item.amount, 0);
    };

    return (
        <Box
            ref={ref}
            sx={{
                width: '297mm', // A4 landscape width
                minHeight: '210mm',
                padding: '15mm',
                backgroundColor: 'white',
                fontFamily: 'Arial, sans-serif',
                '@media print': {
                    padding: '10mm',
                    margin: 0,
                    '@page': {
                        size: 'A4 landscape',
                    }
                }
            }}
        >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                    CO-OPERATIVE BANK LIMITED
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1, textDecoration: 'underline' }}>
                    JOURNAL VOUCHERS LIST
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" sx={{ color: '#555' }}>
                        {dateRange ? `Period: ${dateRange}` : 'All Records'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555' }}>
                        Generated on: {getCurrentDateTime()}
                    </Typography>
                </Box>
            </Box>

            {/* Table */}
            <Table sx={{ border: '1px solid #000', '& th, & td': { border: '1px solid #000', py: 0.8, px: 1 } }}>
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#f0f0f0' }}>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '11px', width: '50px' }}>Sl No</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '11px', width: '100px' }}>Voucher No</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '11px', width: '90px' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '11px', width: '140px' }}>Debit From</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '11px', width: '140px' }}>Credit To</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '11px' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '11px', width: '90px' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '11px', width: '100px', textAlign: 'right' }}>Amount (₹)</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {journals.map((journal, index) => (
                        <TableRow key={journal.journal_id || index}>
                            <TableCell sx={{ fontSize: '10px' }}>{index + 1}</TableCell>
                            <TableCell sx={{ fontSize: '10px', fontWeight: 600 }}>{journal.journal_id}</TableCell>
                            <TableCell sx={{ fontSize: '10px' }}>{formatDate(journal.date)}</TableCell>
                            <TableCell sx={{ fontSize: '10px' }}>{journal.debit_from}</TableCell>
                            <TableCell sx={{ fontSize: '10px' }}>{journal.credit_to || '-'}</TableCell>
                            <TableCell sx={{ fontSize: '10px' }}>{journal.description || '-'}</TableCell>
                            <TableCell sx={{ fontSize: '10px' }}>{journal.mode_of_entry}</TableCell>
                            <TableCell sx={{ fontSize: '10px', textAlign: 'right', fontWeight: 600 }}>
                                ₹{Number(journal.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                        </TableRow>
                    ))}
                    {/* Total Row */}
                    <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                        <TableCell colSpan={7} sx={{ fontSize: '11px', textAlign: 'right', fontWeight: 'bold' }}>
                            Total Amount:
                        </TableCell>
                        <TableCell sx={{ fontSize: '11px', textAlign: 'right', fontWeight: 'bold' }}>
                            ₹{calculateTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            {/* Footer */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: '#666' }}>
                    Total Records: {journals.length}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                    * This is a computer generated report
                </Typography>
            </Box>
        </Box>
    );
});

JournalsTablePrint.displayName = 'JournalsTablePrint';
export default JournalsTablePrint;
