import React, { useState, useMemo } from 'react';
import {
  Box,
  Chip,
  useMediaQuery,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ReceiptLong as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircleOutline as CompletedIcon,
  AccessTime as PendingIcon,
} from '@mui/icons-material';
import AdminReusableTable, { ColumnDefinition } from '../../utils/AdminReusableTable';
import { useGetCollectionTransactions } from '../../queries/Agent';
import TokenService from '../../queries/token/tokenService';

const Report: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 899px)');
  const agentId = TokenService.getMemberId();
  const { data: transactionsData, isLoading: transactionsLoading } = useGetCollectionTransactions(agentId || '', !!agentId);

  const rawCollectionData = transactionsData?.data;
  const transactions: any[] = useMemo(() => {
    if (Array.isArray(rawCollectionData)) return rawCollectionData;
    if (Array.isArray((rawCollectionData as any)?.transactions)) return (rawCollectionData as any).transactions;
    return [];
  }, [rawCollectionData]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Filtered transactions for mobile
  const filteredTransactions = useMemo(() => {
    let list = transactions;
    if (statusFilter !== 'all') {
      list = list.filter((t: any) => t.status?.toLowerCase() === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t: any) =>
        t.Name?.toLowerCase().includes(q) ||
        t.account_number?.toLowerCase().includes(q) ||
        t.transaction_id?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [transactions, searchQuery, statusFilter]);

  // Total collected calculation
  const totalCollected = useMemo(() => {
    if ((rawCollectionData as any)?.summary?.totalCollected !== undefined) {
      return (rawCollectionData as any).summary.totalCollected;
    }
    return transactions.reduce((acc: number, t: any) => acc + (Number(t.credit) || 0), 0);
  }, [rawCollectionData, transactions]);

  // Transaction columns (Desktop)
  const transactionColumns: ColumnDefinition<any>[] = [
    {
      id: 'transaction_date',
      label: 'Date',
      sortable: true,
      renderCell: (row) => {
        const date = new Date(row.transaction_date);
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      },
    },
    {
      id: 'transaction_id',
      label: 'Transaction ID',
      sortable: true,
    },
    {
      id: 'account_number',
      label: 'Account No',
      sortable: true,
    },
    {
      id: 'Name',
      label: 'Account Holder',
      sortable: true,
    },
    {
      id: 'credit',
      label: 'Amount Collected',
      align: 'right',
      sortable: true,
      renderCell: (row) => `₹ ${row.credit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      id: 'balance',
      label: 'Account Balance',
      align: 'right',
      sortable: true,
      renderCell: (row) => `₹ ${row.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      renderCell: (row) => {
        const status = row.status?.toLowerCase();
        return (
          <Chip
            label={row.status}
            size="small"
            sx={{
              backgroundColor:
                status === 'completed' ? '#d1fae5' :
                  status === 'pending' ? '#fef3c7' :
                    '#fee2e2',
              color:
                status === 'completed' ? '#065f46' :
                  status === 'pending' ? '#92400e' :
                    '#991b1b',
              fontWeight: 500,
              borderRadius: 1,
              textTransform: 'capitalize',
            }}
          />
        );
      },
    },
  ];

  if (isMobile) {
    return (
      <Box sx={{ px: 2, pt: 1, pb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Total Collected Summary Tile */}
        <Card
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            color: 'white',
            borderRadius: '20px',
            boxShadow: '0 8px 24px rgba(22, 163, 74, 0.25)',
            p: 0.5,
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box>
                <Typography sx={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Collected
                </Typography>
                <Typography sx={{ fontWeight: 900, fontSize: '1.65rem', mt: 0.25, letterSpacing: '-0.5px' }}>
                  ₹{totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUpIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, pt: 1, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.9 }}>
                {transactions.length} Total Collections Recorded
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Search Input */}
        <TextField
          size="small"
          fullWidth
          placeholder="Search by name, a/c or trans ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <ClearIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            bgcolor: 'white',
            borderRadius: '14px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '14px',
              '& fieldset': { borderColor: '#e2e8f0' },
              '&:hover fieldset': { borderColor: '#cbd5e1' },
              '&.Mui-focused fieldset': { borderColor: '#16a34a' },
            },
          }}
        />

        {/* Filter Chips */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[
            { label: 'All', value: 'all' },
            { label: 'Completed', value: 'completed' },
            { label: 'Pending', value: 'pending' },
          ].map((tab) => {
            const isSelected = statusFilter === tab.value;
            return (
              <Chip
                key={tab.value}
                label={tab.label}
                clickable
                onClick={() => setStatusFilter(tab.value as any)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderRadius: '10px',
                  bgcolor: isSelected ? '#16a34a' : 'white',
                  color: isSelected ? 'white' : '#475569',
                  border: '1px solid',
                  borderColor: isSelected ? '#16a34a' : '#e2e8f0',
                  '&:hover': { bgcolor: isSelected ? '#15803d' : '#f8fafc' },
                }}
              />
            );
          })}
        </Box>

        {/* List of Transaction Cards */}
        {transactionsLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
            <CircularProgress size={36} sx={{ color: '#16a34a', mb: 2 }} />
            <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Loading collection reports...</Typography>
          </Box>
        ) : filteredTransactions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 2, bgcolor: 'white', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
            <ReceiptIcon sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
            <Typography sx={{ fontWeight: 800, color: '#334155', mb: 0.5 }}>No Transactions Found</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
              {searchQuery ? `No transactions match "${searchQuery}"` : 'No collection transactions found for this agent.'}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {filteredTransactions.map((tx: any, idx: number) => {
              const status = (tx.status || '').toLowerCase();
              const txDate = tx.transaction_date
                ? new Date(tx.transaction_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : '-';
              return (
                <Card
                  key={tx._id || tx.transaction_id || idx}
                  elevation={0}
                  sx={{
                    borderRadius: '16px',
                    bgcolor: 'white',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    {/* Top Row: Date & Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                        {txDate} • ID: {tx.transaction_id || '-'}
                      </Typography>
                      <Chip
                        label={tx.status || 'Completed'}
                        size="small"
                        icon={status === 'completed' ? <CompletedIcon sx={{ fontSize: '14px !important' }} /> : <PendingIcon sx={{ fontSize: '14px !important' }} />}
                        sx={{
                          height: 22,
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          borderRadius: '6px',
                          bgcolor: status === 'completed' ? '#ecfdf5' : '#fffbeb',
                          color: status === 'completed' ? '#059669' : '#d97706',
                          '& .MuiChip-icon': {
                            color: status === 'completed' ? '#059669' : '#d97706',
                          },
                        }}
                      />
                    </Box>

                    {/* Middle: Holder Name & Amount */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                          {tx.Name || 'Member'}
                        </Typography>
                        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748b' }}>
                          A/C: {tx.account_number}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#16a34a', textAlign: 'right' }}>
                        + ₹{Number(tx.credit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>

                    {/* Bottom: Resulting Balance */}
                    <Box sx={{ pt: 1, borderTop: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                        A/C Balance:
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                        ₹{Number(tx.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>
    );
  }

  // Desktop Existing View - 100% Preserved
  return (
    <Box sx={{ mt: 10, px: 3, pb: 4 }}>
      <AdminReusableTable
        columns={transactionColumns}
        data={transactions}
        title="Transactions"
        isLoading={transactionsLoading}
        emptyMessage="No transactions found"
        onExport={() => {
          console.log('Export transactions');
        }}
      />
    </Box>
  );
};

export default Report;
