import { forwardRef } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

interface ContraData {
    contra_id: string;
    date: string | Date;
    contra_to: string;
    description: string;
    mode_of_contra: string;
    amount: number;
    status?: string;
}

interface ContrasTablePrintProps {
    contras: ContraData[];
    dateRange?: string;
}

const ContrasTablePrint = forwardRef<HTMLDivElement, ContrasTablePrintProps>(({ contras, dateRange }, ref) => {
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
        return contras.reduce((sum, item) => sum + item.amount, 0);
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
                    CONTRA VOUCHERS LIST
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
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '11px', width: '150px' }}>Particulars</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '11px' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '11px', width: '110px' }}>Mode</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '11px', width: '100px', textAlign: 'right' }}>Amount (₹)</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {contras.map((contra, index) => (
                        <TableRow key={contra.contra_id || index}>
                            <TableCell sx={{ fontSize: '10px' }}>{index + 1}</TableCell>
                            <TableCell sx={{ fontSize: '10px', fontWeight: 600 }}>{contra.contra_id}</TableCell>
                            <TableCell sx={{ fontSize: '10px' }}>{formatDate(contra.date)}</TableCell>
                            <TableCell sx={{ fontSize: '10px' }}>{contra.contra_to}</TableCell>
                            <TableCell sx={{ fontSize: '10px' }}>{contra.description || '-'}</TableCell>
                            <TableCell sx={{ fontSize: '10px' }}>{contra.mode_of_contra}</TableCell>
                            <TableCell sx={{ fontSize: '10px', textAlign: 'right', fontWeight: 600 }}>
                                ₹{Number(contra.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                        </TableRow>
                    ))}
                    {/* Total Row */}
                    <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                        <TableCell colSpan={6} sx={{ fontSize: '11px', textAlign: 'right', fontWeight: 'bold' }}>
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
                    Total Records: {contras.length}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                    * This is a computer generated report
                </Typography>
            </Box>
        </Box>
    );
});

ContrasTablePrint.displayName = 'ContrasTablePrint';
export default ContrasTablePrint;
