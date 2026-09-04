import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Chip,
    InputAdornment,
    Button,
    Stack,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import PrintIcon from '@mui/icons-material/Print';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useReactToPrint } from 'react-to-print';
import { useGetAccounts, useGetAccountGroups, type Account } from '../../../queries/admin';
import TablePDF, { PrintColumn } from '../../Print-components/TablePDF';
import AccountCloseDialog from '../../Banking/AccountCloseDialog';

interface Props {
    accountType: string;
    title: string;
}

const ACCOUNT_THEMES: Record<string, any> = {
    'PERSONAL LOAN': {
        primary: '#1e40af',
        secondary: '#1d4ed8',
        light: '#dbeafe',
        gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        shadow: '0 4px 14px 0 rgba(30, 64, 175, 0.25)',
        chip: { backgroundColor: '#dbeafe', color: '#1e40af' }
    },
    'MORTGAGE LOAN': {
        primary: '#334155',
        secondary: '#475569',
        light: '#e2e8f0',
        gradient: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
        shadow: '0 4px 14px 0 rgba(51, 65, 85, 0.25)',
        chip: { backgroundColor: '#e2e8f0', color: '#334155' }
    },
    'GOLD LOAN': {
        primary: '#b45309',
        secondary: '#d97706',
        light: '#fef3c7',
        gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
        shadow: '0 4px 14px 0 rgba(180, 83, 9, 0.25)',
        chip: { backgroundColor: '#fef3c7', color: '#b45309' }
    },
    'BUSINESS LOAN': {
        primary: '#0f766e',
        secondary: '#0d9488',
        light: '#ccfbf1',
        gradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
        shadow: '0 4px 14px 0 rgba(15, 118, 110, 0.25)',
        chip: { backgroundColor: '#ccfbf1', color: '#0f766e' }
    },
    'VEHICLE LOAN': {
        primary: '#0369a1',
        secondary: '#0284c7',
        light: '#e0f2fe',
        gradient: 'linear-gradient(135deg, #0369a1 0%, #38bdf8 100%)',
        shadow: '0 4px 14px 0 rgba(3, 105, 161, 0.25)',
        chip: { backgroundColor: '#e0f2fe', color: '#0369a1' }
    },
    'EDUCATION LOAN': {
        primary: '#6b21a8',
        secondary: '#7e22ce',
        light: '#f3e8ff',
        gradient: 'linear-gradient(135deg, #6b21a8 0%, #a855f7 100%)',
        shadow: '0 4px 14px 0 rgba(107, 33, 168, 0.25)',
        chip: { backgroundColor: '#f3e8ff', color: '#6b21a8' }
    },
    'AGRICULTURE LOAN': {
        primary: '#15803d',
        secondary: '#16a34a',
        light: '#dcfce7',
        gradient: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
        shadow: '0 4px 14px 0 rgba(21, 128, 61, 0.25)',
        chip: { backgroundColor: '#dcfce7', color: '#15803d' }
    },
    'PIGMI LOAN': {
        primary: '#c2410c',
        secondary: '#ea580c',
        light: '#ffedd5',
        gradient: 'linear-gradient(135deg, #c2410c 0%, #f97316 100%)',
        shadow: '0 4px 14px 0 rgba(194, 65, 12, 0.25)',
        chip: { backgroundColor: '#ffedd5', color: '#c2410c' }
    },
    'PIGMI GOLD LOAN': {
        primary: '#a16207',
        secondary: '#ca8a04',
        light: '#fef9c3',
        gradient: 'linear-gradient(135deg, #a16207 0%, #eab308 100%)',
        shadow: '0 4px 14px 0 rgba(161, 98, 7, 0.25)',
        chip: { backgroundColor: '#fef9c3', color: '#a16207' }
    }
};

const LoanCloseViewTable: React.FC<Props> = ({ accountType, title }) => {
    const theme = ACCOUNT_THEMES[accountType?.toUpperCase()] || ACCOUNT_THEMES['PERSONAL LOAN'];

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [accountGroupId, setAccountGroupId] = useState<string>('');
    const [selectedAccountForClose, setSelectedAccountForClose] = useState<any>(null);
    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const tablePrintRef = useRef<HTMLDivElement>(null);

    // Fetch account groups to map account type name to ID
    const { data: accountGroupsData } = useGetAccountGroups();

    // Map account type to account_group_id
    useEffect(() => {
        if (accountGroupsData?.data) {
            const search = (accountType || '').toUpperCase();
            const matchingGroup = accountGroupsData.data.find((group: any) => {
                const name = (group.account_group_name || '').toUpperCase();
                const id = (group.account_group_id || '').toUpperCase();

                if (name === search || id === search) return true;

                if (search === 'PERSONAL LOAN' || search === 'PERSONAL' || search === 'PL') {
                    return name.includes('PERSONAL') && name.includes('LOAN');
                }
                if (search === 'MORTGAGE LOAN' || search === 'MORTGAGE' || search === 'ML') {
                    return name.includes('MORTGAGE');
                }
                if (search === 'GOLD LOAN' || search === 'GOLD' || search === 'GL') {
                    return name.includes('GOLD') && !name.includes('PIGMI') && !name.includes('PIGMY');
                }
                if (search === 'BUSINESS LOAN' || search === 'BUSINESS' || search === 'BL') {
                    return name.includes('BUSINESS');
                }
                if (search === 'VEHICLE LOAN' || search === 'VEHICLE' || search === 'VL') {
                    return name.includes('VEHICLE');
                }
                if (search === 'EDUCATION LOAN' || search === 'EDUCATION' || search === 'EL') {
                    return name.includes('EDUCATION');
                }
                if (search === 'AGRICULTURE LOAN' || search === 'AGRICULTURE' || search === 'AGRI' || search === 'AL') {
                    return name.includes('AGRICULTURE') || name.includes('AGRI');
                }
                if (search === 'PIGMI LOAN' || search === 'PIGMY LOAN' || search === 'PGL') {
                    return (name.includes('PIGMI') || name.includes('PIGMY')) && name.includes('LOAN') && !name.includes('GOLD');
                }
                if (search === 'PIGMI GOLD LOAN' || search === 'PIGMY GOLD LOAN' || search === 'PGLD') {
                    return (name.includes('PIGMI') || name.includes('PIGMY')) && name.includes('GOLD');
                }

                return name.startsWith(search);
            });

            if (matchingGroup) {
                setAccountGroupId(matchingGroup.account_group_id || matchingGroup._id);
            }
        }
    }, [accountGroupsData, accountType]);

    // Fetch accounts with filters
    const { data: accountsData, isLoading, refetch } = useGetAccounts(
        page + 1,
        rowsPerPage,
        searchQuery || undefined,
        statusFilter === 'all' ? undefined : statusFilter,
        accountGroupId || undefined
    );

    // Fetch all accounts for printing (without pagination)
    const { data: allAccountsData } = useGetAccounts(
        1,
        9999,
        undefined,
        undefined,
        accountGroupId || undefined
    );

    const accounts = accountsData?.data || [];
    const totalAccounts = accountsData?.pagination?.total || 0;

    const printColumns: PrintColumn[] = [
        { id: 'account_no', label: 'Loan Account No', width: '15%' },
        { id: 'member_name', label: 'Member', width: '18%' },
        { id: 'opening_date', label: 'Disbursal Date', width: '12%' },
        { id: 'amount', label: 'Loan Amount', width: '15%', align: 'right' },
        { id: 'interest_rate', label: 'Interest Rate', width: '10%', align: 'center' },
        { id: 'duration', label: 'Duration', width: '10%', align: 'center' },
        { id: 'status', label: 'Status', width: '10%', align: 'center' },
    ];

    const allAccountsForPrint = (allAccountsData?.data || []).map((account: Account) => ({
        id: account._id,
        account_no: account.account_no || '-',
        member_name: account.memberDetails?.name
            ? `${account.memberDetails.name} (${account.member_id})`
            : account.member_id || '-',
        opening_date: account.date_of_opening
            ? new Date(account.date_of_opening).toLocaleDateString('en-GB')
            : '-',
        amount: account.account_amount
            ? `₹${account.account_amount.toLocaleString('en-IN')}`
            : '-',
        interest_rate: account.interest_rate ? `${account.interest_rate}%` : '-',
        duration: account.duration ? `${account.duration} months` : '-',
        status: account.status || 'unknown',
    }));

    const handleTablePrint = useReactToPrint({
        contentRef: tablePrintRef,
    });

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-GB');
    };

    const getStatusColor = (status: string | undefined) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return { backgroundColor: '#dcfce7', color: '#166534' };
            case 'pending':
                return { backgroundColor: '#fef3c7', color: '#92400e' };
            case 'closed':
                return { backgroundColor: '#fee2e2', color: '#dc2626' };
            default:
                return { backgroundColor: '#f1f5f9', color: '#475569' };
        }
    };

    const handleOpenCloseDialog = (account: Account) => {
        const maturityAccountFormat: any = {
            ...account,
            member_name: account.memberDetails?.name || account.member_id,
        };
        setSelectedAccountForClose(maturityAccountFormat);
        setCloseDialogOpen(true);
    };

    return (
        <Box sx={{
            p: { xs: 1.5, sm: 2, md: 3 },
            minHeight: '100vh',
            background: `linear-gradient(180deg, ${theme.light} 0%, #f8fafc 500px, #f8fafc 100%)`,
            transition: 'background 0.3s ease'
        }}>
            {/* Page Header */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1}
                sx={{ mb: 3 }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: theme.primary,
                        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                    }}
                >
                    {title}
                </Typography>
                <Stack direction="row" spacing={1.5}>
                    <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={handleTablePrint}
                        sx={{
                            borderColor: theme.primary,
                            color: theme.primary,
                            fontWeight: 600,
                            borderRadius: '10px',
                            '&:hover': {
                                borderColor: theme.secondary,
                                backgroundColor: `${theme.primary}10`,
                            }
                        }}
                    >
                        Print List
                    </Button>
                </Stack>
            </Stack>

            {/* Filter Section */}
            <Paper sx={{
                p: { xs: 1.5, sm: 2 },
                mb: 3,
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0'
            }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    justifyContent="space-between"
                >
                    <TextField
                        size="small"
                        placeholder="Search by Loan No or Member ID..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(0);
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search sx={{ color: theme.primary }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            minWidth: { xs: '100%', sm: 300 },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                            }
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Status"
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(0);
                            }}
                            sx={{ borderRadius: '10px' }}
                        >
                            <MenuItem value="all">All Status</MenuItem>
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Closed">Closed</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            {/* Accounts Table */}
            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden'
                }}
            >
                <Table>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Loan No</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Member</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Disbursal Date</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#475569' }} align="right">Amount</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#475569' }} align="center">Interest</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#475569' }} align="center">Duration</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#475569' }} align="center">Status</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#475569' }} align="center">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={36} sx={{ color: theme.primary }} />
                                </TableCell>
                            </TableRow>
                        ) : accounts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#64748b' }}>
                                    No loan accounts found
                                </TableCell>
                            </TableRow>
                        ) : (
                            accounts.map((account: Account) => {
                                const isClosed = account.status?.toLowerCase() === 'closed';
                                return (
                                    <TableRow
                                        key={account._id}
                                        hover
                                        sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}
                                    >
                                        <TableCell sx={{ fontWeight: 600, color: theme.primary }}>
                                            {account.account_no || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {account.memberDetails?.name || '-'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                                                ID: {account.member_id || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{formatDate(account.date_of_opening)}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                                            ₹{(account.account_amount || 0).toLocaleString('en-IN')}
                                        </TableCell>
                                        <TableCell align="center">
                                            {account.interest_rate ? `${account.interest_rate}%` : '-'}
                                        </TableCell>
                                        <TableCell align="center">
                                            {account.duration ? `${account.duration} M` : '-'}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={account.status || 'Active'}
                                                size="small"
                                                sx={{
                                                    ...getStatusColor(account.status),
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    borderRadius: '6px'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            {isClosed ? (
                                                <Typography variant="caption" sx={{ color: '#dc2626', fontWeight: 600 }}>
                                                    Closed
                                                </Typography>
                                            ) : (
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="error"
                                                    startIcon={<LockResetIcon />}
                                                    onClick={() => handleOpenCloseDialog(account)}
                                                    sx={{
                                                        textTransform: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Close Loan
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={totalAccounts}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </TableContainer>

            {/* Hidden component for printing */}
            <Box sx={{ display: 'none' }}>
                <TablePDF
                    ref={tablePrintRef}
                    title={title}
                    columns={printColumns}
                    data={allAccountsForPrint}
                />
            </Box>

            {/* Close Account Dialog */}
            {closeDialogOpen && selectedAccountForClose && (
                <AccountCloseDialog
                    open={closeDialogOpen}
                    onClose={() => {
                        setCloseDialogOpen(false);
                        setSelectedAccountForClose(null);
                    }}
                    account={selectedAccountForClose}
                    isMatured={true}
                    onSuccess={() => {
                        refetch();
                    }}
                />
            )}
        </Box>
    );
};

export default LoanCloseViewTable;
