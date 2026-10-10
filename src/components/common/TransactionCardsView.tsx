import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export interface TransactionItem {
  _id?: string;
  transaction_id?: string;
  transaction_date?: string;
  createdAt?: string;
  transaction_type?: string;
  description?: string;
  credit?: number;
  ew_credit?: number;
  debit?: number;
  ew_debit?: number;
  balance?: number;
  net_amount?: number;
  previous_balance?: number;
  status?: string;
  [key: string]: any;
}

interface TransactionCardsViewProps {
  transactions: TransactionItem[];
  isLoading?: boolean;
  title?: string;
  pageSize?: number;
  emptyMessage?: string;
}

export const TransactionCardsView: React.FC<TransactionCardsViewProps> = ({
  transactions = [],
  isLoading = false,
  title = "Recent Transactions",
  pageSize = 10,
  emptyMessage = "No transactions found"
}) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter transactions by search query
  const filtered = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter((tx) => {
      const desc = (tx.description || "").toLowerCase();
      const type = (tx.transaction_type || "").toLowerCase();
      const id = (tx.transaction_id || tx._id || "").toString().toLowerCase();
      const status = (tx.status || "").toLowerCase();
      const credit = (tx.credit || tx.ew_credit || "").toString();
      const debit = (tx.debit || tx.ew_debit || "").toString();
      const amt = (tx.amount || "").toString();
      const member = (tx.memberName || tx.memberId || tx.related_member_name || "").toString().toLowerCase();
      return (
        desc.includes(q) ||
        type.includes(q) ||
        id.includes(q) ||
        status.includes(q) ||
        credit.includes(q) ||
        debit.includes(q) ||
        amt.includes(q) ||
        member.includes(q)
      );
    });
  }, [transactions, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Search Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptLongIcon sx={{ color: '#0a2558', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.05rem', sm: '1.2rem' } }}>
            {title}
          </Typography>
          <Chip
            label={`${filtered.length}`}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '0.72rem',
              bgcolor: 'rgba(10, 37, 88, 0.08)',
              color: '#0a2558',
              height: 22,
            }}
          />
        </Box>

        <TextField
          placeholder="Search transactions..."
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch("")} edge="end">
                  <ClearIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            width: { xs: '100%', sm: 260 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              bgcolor: '#ffffff',
              fontSize: '0.85rem',
            },
          }}
        />
      </Box>

      {/* Content */}
      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 1.5 }}>
          <CircularProgress size={36} sx={{ color: '#0a2558' }} />
          <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
            Loading transactions...
          </Typography>
        </Box>
      ) : paginated.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            py: 6,
            px: 3,
            textAlign: 'center',
            borderRadius: '20px',
            bgcolor: '#ffffff',
            border: '1px dashed #cbd5e1',
          }}
        >
          <ReceiptLongIcon sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
          <Typography sx={{ fontWeight: 700, color: '#334155', fontSize: '1rem' }}>
            {emptyMessage}
          </Typography>
          {search && (
            <Button
              size="small"
              onClick={() => setSearch("")}
              sx={{ mt: 1.5, color: '#0a2558', fontWeight: 700, textTransform: 'none' }}
            >
              Clear search filter
            </Button>
          )}
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {paginated.map((tx, idx) => {
            const creditVal = Number(tx.credit || tx.ew_credit || (tx.type === 'debit' ? 0 : tx.amount) || 0);
            const debitVal = Number(tx.debit || tx.ew_debit || (tx.type === 'debit' ? tx.amount : 0) || 0);
            const isCredit = creditVal > 0 || (!debitVal && !creditVal);
            const displayAmount = isCredit ? creditVal : debitVal;
            const balanceVal = Number(tx.balance || tx.net_amount || tx.previous_balance || 0);
            const statusStr = (tx.status || "Completed").toLowerCase();
            const isPending = statusStr === "pending";
            const isFailed = statusStr === "failed" || statusStr === "rejected";

            return (
              <Paper
                key={tx.transaction_id || tx._id || idx}
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 2.2 },
                  borderRadius: '16px',
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                    boxShadow: '0 6px 18px rgba(10, 37, 88, 0.06)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {/* Row 1: Icon + Description + Amount */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: { xs: 40, sm: 44 },
                        height: { xs: 40, sm: 44 },
                        borderRadius: '12px',
                        bgcolor: isCredit ? '#ecfdf5' : '#fef2f2',
                        color: isCredit ? '#059669' : '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: isCredit ? '1px solid #a7f3d0' : '1px solid #fecaca',
                      }}
                    >
                      {isCredit ? (
                        <ArrowDownwardIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
                      ) : (
                        <ArrowUpwardIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
                      )}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: { xs: '0.88rem', sm: '0.95rem' },
                          color: '#0f172a',
                          lineHeight: 1.3,
                          wordBreak: 'break-word',
                        }}
                      >
                        {tx.description || tx.transaction_type || 'Transaction'}
                      </Typography>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mt: 0.5,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Typography sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>
                          {formatDate(tx.transaction_date || tx.createdAt || tx.date)}
                        </Typography>

                        {tx.transaction_id && (
                          <Chip
                            label={tx.transaction_id}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              bgcolor: '#f1f5f9',
                              color: '#475569',
                              borderRadius: '6px',
                            }}
                          />
                        )}

                        {tx.payoutLevel && (
                          <Chip
                            label={tx.payoutLevel}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              bgcolor: '#e0e7ff',
                              color: '#3730a3',
                              borderRadius: '6px',
                            }}
                          />
                        )}

                        {tx.memberName && (
                          <Typography sx={{ color: '#0a2558', fontSize: '0.75rem', fontWeight: 700 }}>
                            {tx.memberName} {tx.memberId ? `(${tx.memberId})` : ''}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Amount on the right */}
                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: { xs: '1rem', sm: '1.15rem' },
                        color: isCredit ? '#059669' : '#dc2626',
                        lineHeight: 1.2,
                        letterSpacing: '-0.3px',
                      }}
                    >
                      {isCredit ? '+' : '-'} ₹{displayAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>

                    {balanceVal > 0 && (
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, mt: 0.3 }}>
                        Bal: ₹{balanceVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Row 2: Status & Type Footer */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pt: 1.2,
                    mt: 1.2,
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                      Type:
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#0a2558', fontWeight: 800 }}>
                      {tx.transaction_type || 'Transfer'}
                    </Typography>
                  </Box>

                  <Chip
                    label={isPending ? 'PENDING' : isFailed ? 'FAILED' : 'SUCCESS'}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      letterSpacing: '0.3px',
                      bgcolor: isPending ? '#fef3c7' : isFailed ? '#fee2e2' : '#ecfdf5',
                      color: isPending ? '#b45309' : isFailed ? '#b91c1c' : '#047857',
                      border: isPending ? '1px solid #fde68a' : isFailed ? '1px solid #fca5a5' : '1px solid #a7f3d0',
                    }}
                  />
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 3,
            px: 1,
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
            Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              startIcon={<ChevronLeftIcon />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.78rem',
                borderColor: '#cbd5e1',
                color: '#0a2558',
                py: 0.4,
                px: 1.2,
              }}
            >
              Prev
            </Button>

            <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#0a2558', px: 1 }}>
              {safePage} / {totalPages}
            </Typography>

            <Button
              size="small"
              variant="outlined"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              endIcon={<ChevronRightIcon />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.78rem',
                borderColor: '#cbd5e1',
                color: '#0a2558',
                py: 0.4,
                px: 1.2,
              }}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TransactionCardsView;
