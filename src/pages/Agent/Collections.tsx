import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
  useMediaQuery,
  InputAdornment,
  CircularProgress,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AdminReusableTable, { ColumnDefinition } from '../../utils/AdminReusableTable';
import { useGetAssignedAccounts, useCollectPayment } from '../../queries/Agent';
import TokenService from '../../queries/token/tokenService';
import { AssignedAccount } from '../../types';

const Collections: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 899px)');
  const agentId = TokenService.getMemberId();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const typeFilter = searchParams.get('type');

  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AssignedAccount | null>(null);
  const [amount, setAmount] = useState('');

  const { data, isLoading } = useGetAssignedAccounts(agentId || '', !!agentId);
  const collectPaymentMutation = useCollectPayment(agentId || '');

  const allAccounts = data?.data || [];

  // Filter accounts by type and search query
  const accounts = useMemo(() => {
    let list = allAccounts;
    if (typeFilter) {
      list = list.filter((acc: AssignedAccount) => acc.account_type?.toLowerCase() === typeFilter.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((acc: AssignedAccount) =>
        acc.account_holder?.toLowerCase().includes(q) ||
        acc.account_no?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allAccounts, typeFilter, searchQuery]);

  const handleOpenDialog = (account: AssignedAccount) => {
    setSelectedAccount(account);
    setOpenDialog(true);
    setAmount('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAccount(null);
    setAmount('');
  };

  const handleCollect = async () => {
    if (!selectedAccount || !amount || !selectedAccount.account_id) return;

    try {
      const response = await collectPaymentMutation.mutateAsync({
        accountId: selectedAccount.account_id,
        amount: parseFloat(amount)
      });

      if (response.success) {
        toast.success(`Successfully collected ₹${amount} from ${selectedAccount.account_holder}`);
        handleCloseDialog();
      } else {
        toast.error(response.message || 'Failed to collect payment');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to collect payment');
      console.error('Collection error:', error);
    }
  };

  const columns: ColumnDefinition<AssignedAccount>[] = [
    {
      id: 'date_of_opening',
      label: 'Date Of Opening',
      sortable: true,
      renderCell: (row) => {
        if (!row.date_of_opening) return '-';
        const date = new Date(row.date_of_opening);
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      },
    },
    {
      id: 'account_no',
      label: 'Account No',
      sortable: true,
    },
    {
      id: 'account_holder',
      label: 'Account Holder',
      sortable: true,
    },
    {
      id: 'account_type',
      label: 'Account Type',
      sortable: true,
      renderCell: (row) => (
        <Chip
          label={row.account_type || '-'}
          size="small"
          sx={{
            backgroundColor: '#e0e7ff',
            color: '#4338ca',
            fontWeight: 600,
            borderRadius: 1,
          }}
        />
      ),
    },
    {
      id: 'date_of_maturity',
      label: 'Date Of Maturity',
      sortable: true,
      renderCell: (row) => {
        if (!row.date_of_maturity) return '-';
        const date = new Date(row.date_of_maturity);
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      },
    },
    {
      id: 'balance',
      label: 'Balance',
      align: 'right',
      sortable: true,
      renderCell: (row) => `₹ ${row.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      renderCell: (row) => {
        const status = row.status.toLowerCase();
        return (
          <Chip
            label={row.status}
            size="small"
            sx={{
              backgroundColor:
                status === 'active' ? '#d1fae5' :
                  status === 'pending' ? '#fef3c7' :
                    '#f1f5f9',
              color:
                status === 'active' ? '#065f46' :
                  status === 'pending' ? '#92400e' :
                    '#64748b',
              fontWeight: 500,
              borderRadius: 1,
              textTransform: 'capitalize',
            }}
          />
        );
      },
    },
    {
      id: 'account_id',
      label: 'Action',
      align: 'center',
      renderCell: (row) => (
        <Button
          variant="contained"
          size="small"
          sx={{
            textTransform: 'none',
            background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDialog(row);
          }}
        >
          Collect
        </Button>
      ),
    },
  ];

  return (
    <>
      {isMobile ? (
        /* Mobile Native App View */
        <Box sx={{ px: 2, pt: 1, pb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Mobile Search Bar */}
          <TextField
            size="small"
            fullWidth
            placeholder="Search member or account no..."
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

          {/* Account Type Filter Chips (Horizontal Scrollable) */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              py: 0.5,
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
            }}
          >
            {['All', 'SB', 'RD', 'FD', 'Pigmy', 'MIS'].map((tab) => {
              const isSelected = (!typeFilter && tab === 'All') || (typeFilter?.toLowerCase() === tab.toLowerCase());
              return (
                <Chip
                  key={tab}
                  label={tab}
                  clickable
                  onClick={() => {
                    if (tab === 'All') {
                      setSearchParams({});
                    } else {
                      setSearchParams({ type: tab });
                    }
                  }}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    borderRadius: '12px',
                    px: 0.5,
                    bgcolor: isSelected ? '#16a34a' : 'white',
                    color: isSelected ? 'white' : '#475569',
                    border: '1px solid',
                    borderColor: isSelected ? '#16a34a' : '#e2e8f0',
                    boxShadow: isSelected ? '0 2px 8px rgba(22,163,74,0.25)' : 'none',
                    '&:hover': {
                      bgcolor: isSelected ? '#15803d' : '#f8fafc',
                    },
                  }}
                />
              );
            })}
          </Box>

          {/* Count Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.5 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {typeFilter ? `${typeFilter} Accounts` : 'All Accounts'} ({accounts.length})
            </Typography>
            {typeFilter && (
              <Typography
                onClick={() => setSearchParams({})}
                sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', cursor: 'pointer' }}
              >
                Clear filter
              </Typography>
            )}
          </Box>

          {/* Content / Loading / Empty State */}
          {isLoading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
              <CircularProgress size={36} sx={{ color: '#16a34a', mb: 2 }} />
              <Typography sx={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Loading assigned accounts...</Typography>
            </Box>
          ) : accounts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, px: 2, bgcolor: 'white', borderRadius: '20px', border: '1px dashed #cbd5e1' }}>
              <PersonIcon sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
              <Typography sx={{ fontWeight: 800, color: '#334155', mb: 0.5 }}>No Accounts Found</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                {searchQuery ? `No matches for "${searchQuery}"` : 'No accounts assigned to your agent ID yet.'}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {accounts.map((acc: AssignedAccount) => {
                const status = (acc.status || '').toLowerCase();
                const openDate = acc.date_of_opening
                  ? new Date(acc.date_of_opening).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  : null;
                return (
                  <Card
                    key={acc.account_id || acc.account_no}
                    elevation={0}
                    sx={{
                      borderRadius: '18px',
                      bgcolor: 'white',
                      border: '1px solid #f1f5f9',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      {/* Top Row: Type badge + Status badge */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={acc.account_type || 'Account'}
                            size="small"
                            sx={{
                              bgcolor: '#eff6ff',
                              color: '#2563eb',
                              fontWeight: 800,
                              fontSize: '0.72rem',
                              borderRadius: '8px',
                            }}
                          />
                          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>
                            {acc.account_no}
                          </Typography>
                        </Box>
                        <Chip
                          label={acc.status || 'Active'}
                          size="small"
                          sx={{
                            bgcolor: status === 'active' ? '#ecfdf5' : status === 'pending' ? '#fffbeb' : '#f1f5f9',
                            color: status === 'active' ? '#059669' : status === 'pending' ? '#d97706' : '#64748b',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            borderRadius: '8px',
                            textTransform: 'capitalize',
                          }}
                        />
                      </Box>

                      {/* Holder Name */}
                      <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', mb: 1.25 }}>
                        {acc.account_holder}
                      </Typography>

                      {/* Balance & Date Tile */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-end',
                          p: 1.5,
                          bgcolor: '#f8fafc',
                          borderRadius: '14px',
                          mb: 1.5,
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                            Current Balance
                          </Typography>
                          <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', color: '#0f172a' }}>
                            ₹{Number(acc.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                        </Box>
                        {openDate && (
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>
                              Opened
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                              {openDate}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* 1-Tap Collect Button */}
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleOpenDialog(acc)}
                        sx={{
                          borderRadius: '12px',
                          py: 1.1,
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          textTransform: 'none',
                          background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
                          boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
                          },
                        }}
                      >
                        Collect Payment
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Box>
      ) : (
        /* Desktop Existing View - 100% Preserved */
        <Box sx={{ mt: 10, px: 3, pb: 4 }}>
          {/* Filter Header */}
          {typeFilter && (
            <Box
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667EEA 0%, #818CF8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ color: 'white', fontWeight: 500 }}>
                  Showing accounts for:
                </Typography>
                <Chip
                  label={typeFilter}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#4338ca',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                  }}
                />
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate('/agent/collections')}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                Show All Accounts
              </Button>
            </Box>
          )}

          <AdminReusableTable
            columns={columns}
            data={accounts}
            title={typeFilter ? `${typeFilter} Accounts` : 'List Of Collections'}
            isLoading={isLoading}
            emptyMessage={typeFilter ? `No ${typeFilter} accounts found` : 'No assigned accounts found'}
            onExport={() => {
              console.log('Export accounts');
            }}
          />
        </Box>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Collect Payment
          </Typography>
          <IconButton
            onClick={handleCloseDialog}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {selectedAccount && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Account Details
              </Typography>
              <Box sx={{
                p: 2,
                bgcolor: '#f5f5f5',
                borderRadius: 1,
                mb: 3
              }}>
                <Typography variant="body2">
                  <strong>Account No:</strong> {selectedAccount.account_no}
                </Typography>
                <Typography variant="body2">
                  <strong>Account Holder:</strong> {selectedAccount.account_holder}
                </Typography>
                <Typography variant="body2">
                  <strong>Balance:</strong> ₹ {selectedAccount.balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Box>
          )}

          <TextField
            label="Amount"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter collection amount"
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary', fontWeight: 700 }}>₹</Typography>,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 700,
              }
            }}
          />

          {/* Quick preset amount chips */}
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
            {[100, 500, 1000, 2000, 5000].map((quick) => (
              <Chip
                key={quick}
                label={`+ ₹${quick}`}
                clickable
                size="small"
                onClick={() => {
                  const current = parseFloat(amount) || 0;
                  setAmount((current + quick).toString());
                }}
                sx={{
                  fontWeight: 700,
                  bgcolor: '#f1f5f9',
                  color: '#334155',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#e2e8f0' },
                }}
              />
            ))}
            {amount && (
              <Chip
                label="Clear"
                size="small"
                clickable
                onClick={() => setAmount('')}
                sx={{ fontWeight: 700, bgcolor: '#fee2e2', color: '#dc2626', borderRadius: '8px' }}
              />
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderRadius: 1,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCollect}
            variant="contained"
            disabled={!amount || parseFloat(amount) <= 0 || collectPaymentMutation.isPending}
            sx={{
              textTransform: 'none',
              background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
              },
              borderRadius: 1,
              px: 3
            }}
          >
            {collectPaymentMutation.isPending ? 'Collecting...' : 'Collect'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Collections;
