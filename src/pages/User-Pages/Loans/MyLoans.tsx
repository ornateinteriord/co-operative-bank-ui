import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  LinearProgress,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PercentIcon from '@mui/icons-material/Percent';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BusinessIcon from '@mui/icons-material/Business';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SchoolIcon from '@mui/icons-material/School';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import SavingsIcon from '@mui/icons-material/Savings';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useGetMyLoans, useGetMyAccounts, MemberLoanItem } from '../../../queries/Member';

// Category theme mapping
interface CategoryTheme {
  primary: string;
  secondary: string;
  gradient: string;
  light: string;
  icon: React.ReactElement;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  Personal: {
    primary: '#1e40af',
    secondary: '#3b82f6',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    light: '#dbeafe',
    icon: <RequestQuoteIcon />,
  },
  Gold: {
    primary: '#b45309',
    secondary: '#f59e0b',
    gradient: 'linear-gradient(135deg, #78350f 0%, #d97706 100%)',
    light: '#fef3c7',
    icon: <MonetizationOnIcon />,
  },
  Mortgage: {
    primary: '#334155',
    secondary: '#64748b',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
    light: '#f1f5f9',
    icon: <BusinessIcon />,
  },
  Business: {
    primary: '#0f766e',
    secondary: '#14b8a6',
    gradient: 'linear-gradient(135deg, #134e4a 0%, #0d9488 100%)',
    light: '#ccfbf1',
    icon: <BusinessIcon />,
  },
  Vehicle: {
    primary: '#0369a1',
    secondary: '#38bdf8',
    gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 100%)',
    light: '#e0f2fe',
    icon: <DirectionsCarIcon />,
  },
  Education: {
    primary: '#6b21a8',
    secondary: '#a855f7',
    gradient: 'linear-gradient(135deg, #581c87 0%, #7e22ce 100%)',
    light: '#f3e8ff',
    icon: <SchoolIcon />,
  },
  Agriculture: {
    primary: '#15803d',
    secondary: '#22c55e',
    gradient: 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)',
    light: '#dcfce7',
    icon: <AgricultureIcon />,
  },
  Pigmi: {
    primary: '#c2410c',
    secondary: '#f97316',
    gradient: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)',
    light: '#ffedd5',
    icon: <SavingsIcon />,
  },
  'Pigmi Gold': {
    primary: '#a16207',
    secondary: '#eab308',
    gradient: 'linear-gradient(135deg, #713f12 0%, #ca8a04 100%)',
    light: '#fef9c3',
    icon: <MonetizationOnIcon />,
  },
  Overdraft: {
    primary: '#4338ca',
    secondary: '#6366f1',
    gradient: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)',
    light: '#e0e7ff',
    icon: <CreditCardIcon />,
  },
};

const CATEGORIES = [
  'All',
  'Personal',
  'Gold',
  'Mortgage',
  'Business',
  'Vehicle',
  'Education',
  'Agriculture',
  'Pigmi',
  'Overdraft',
];

const MyLoans: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  const themeMui = useTheme();
  const isMobile = useMediaQuery(themeMui.breakpoints.down('sm'));

  // Fetch dedicated loans query
  const {
    data: responseData,
    isLoading: isLoansLoading,
    refetch: refetchLoans,
  } = useGetMyLoans();

  // Also fetch generic accounts as an instant fallback
  const { data: accountsData, isLoading: isAccountsLoading } = useGetMyAccounts();

  // Merge and prioritize dedicated loans endpoint, falling back to accounts_tbl
  const loans: MemberLoanItem[] = useMemo(() => {
    if (responseData?.data?.loans && responseData.data.loans.length > 0) {
      return responseData.data.loans;
    }

    // Fallback extraction from accounts_tbl
    const fallbackLoans: MemberLoanItem[] = [];
    const accountTypes = accountsData?.data?.accountTypes || [];

    accountTypes.forEach((typeGrp: any) => {
      const grpName = typeGrp.account_group_name || '';
      const upperGrp = grpName.toUpperCase();
      const isLoanGrp =
        upperGrp.includes('LOAN') ||
        upperGrp.includes('OVERDRAFT') ||
        upperGrp.includes('OD') ||
        /^(PL|ML|GL|BL|VL|EL|AL|PGL|PGLD|LN)/i.test(typeGrp.account_type || '');

      (typeGrp.accounts || []).forEach((acc: any) => {
        const accNo = (acc.account_no || '').toUpperCase();
        const accId = (acc.account_id || '').toUpperCase();
        const isLoanAcc =
          isLoanGrp ||
          accId.startsWith('LOAN') ||
          /^(PL|ML|GL|BL|VL|EL|AL|PGL|PGLD|OD|LN)/i.test(accNo);

        if (isLoanAcc) {
          const principal = Number(acc.account_amount || 0);
          const rate = Number(acc.interest_rate || 12);
          const tenure = Number(acc.duration || 12);
          let emi = 0;
          if (principal > 0 && tenure > 0) {
            const monthlyRate = rate / 100 / 12;
            if (monthlyRate > 0) {
              emi = Math.round(
                (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
                  (Math.pow(1 + monthlyRate, tenure) - 1)
              );
            } else {
              emi = Math.round(principal / tenure);
            }
          }

          let category = 'Personal';
          if (upperGrp.includes('GOLD') && !upperGrp.includes('PIGM')) category = 'Gold';
          else if (upperGrp.includes('MORTGAGE')) category = 'Mortgage';
          else if (upperGrp.includes('BUSINESS')) category = 'Business';
          else if (upperGrp.includes('VEHICLE')) category = 'Vehicle';
          else if (upperGrp.includes('EDUCATION')) category = 'Education';
          else if (upperGrp.includes('AGRICULTURE') || upperGrp.includes('AGRI')) category = 'Agriculture';
          else if (upperGrp.includes('PIGMI GOLD') || upperGrp.includes('PIGMY GOLD')) category = 'Pigmi Gold';
          else if (upperGrp.includes('PIGMI') || upperGrp.includes('PIGMY')) category = 'Pigmi';
          else if (upperGrp.includes('OVERDRAFT') || upperGrp.includes('OD')) category = 'Overdraft';
          else if (upperGrp.includes('PERSONAL')) category = 'Personal';
          else category = grpName || 'Personal';

          fallbackLoans.push({
            id: acc.account_id || acc.account_no,
            account_id: acc.account_id,
            account_no: acc.account_no,
            account_type: acc.account_type,
            loan_type: grpName || 'Loan Account',
            category: category,
            sanctioned_amount: principal,
            outstanding_balance: principal,
            total_repaid: 0,
            interest_rate: rate,
            tenure_months: tenure,
            emi_amount: emi,
            repayment_frequency: 'Monthly',
            date_of_opening: acc.date_of_opening || new Date().toISOString(),
            date_of_maturity: acc.date_of_maturity || '',
            status: acc.status || 'active',
            branch_id: acc.branch_id || '001-HO MAIN BRANCH',
            account_operation: acc.account_operation || 'Single',
            introducer: acc.introducer || '',
            assigned_to: acc.assigned_to || '',
            joint_member: acc.joint_member || '',
            recent_transactions: [],
          });
        }
      });
    });

    return fallbackLoans;
  }, [responseData, accountsData]);

  // Summary KPIs
  const summary = useMemo(() => {
    if (responseData?.data?.summary) {
      return responseData.data.summary;
    }
    return {
      totalSanctionedAmount: loans.reduce((s, l) => s + (l.sanctioned_amount || 0), 0),
      totalOutstandingBalance: loans.reduce((s, l) => s + (l.outstanding_balance || 0), 0),
      totalMonthlyEmi: loans
        .filter((l) => (l.status || '').toLowerCase() === 'active')
        .reduce((s, l) => s + (l.emi_amount || 0), 0),
      activeLoansCount: loans.filter((l) => (l.status || '').toLowerCase() === 'active').length,
      totalLoansCount: loans.length,
    };
  }, [responseData, loans]);

  const isLoading = isLoansLoading && isAccountsLoading && loans.length === 0;

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [selectedLoan, setSelectedLoan] = useState<MemberLoanItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Sync category tab with query param if present
  useEffect(() => {
    if (typeParam) {
      const matched = CATEGORIES.find(
        (c) =>
          c.toLowerCase() === typeParam.toLowerCase() ||
          typeParam.toLowerCase().includes(c.toLowerCase())
      );
      if (matched) {
        setSelectedCategory(matched);
      }
    }
  }, [typeParam]);

  // Filtered loans
  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      // Category filter
      if (selectedCategory !== 'All') {
        const cat = (loan.category || '').toLowerCase();
        const sel = selectedCategory.toLowerCase();
        if (!cat.includes(sel) && !(sel === 'pigmi' && cat.includes('pigmy'))) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all') {
        if ((loan.status || '').toLowerCase() !== statusFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNo = loan.account_no?.toLowerCase().includes(q);
        const matchesId = loan.account_id?.toLowerCase().includes(q);
        const matchesType = loan.loan_type?.toLowerCase().includes(q);
        if (!matchesNo && !matchesId && !matchesType) return false;
      }

      return true;
    });
  }, [loans, selectedCategory, statusFilter, searchQuery]);

  const handleOpenDetails = (loan: MemberLoanItem) => {
    setSelectedLoan(loan);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedLoan(null);
  };

  return (
    <Box
      sx={{
        pb: { xs: 12, md: 8 },
        background: '#f4f7f9',
        minHeight: '100vh',
        px: { xs: 1.5, sm: 2.5, md: 5, lg: 8 },
        pt: { xs: 1.5, md: 3 },
        maxWidth: '1600px',
        margin: '0 auto',
      }}
    >
      {/* Top Header Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: { xs: 2, md: 3 },
          gap: 1,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/user/dashboard')}
          size={isMobile ? 'small' : 'medium'}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            color: '#0a2558',
            borderRadius: '12px',
            bgcolor: 'white',
            px: { xs: 1.5, sm: 2 },
            py: 0.8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            '&:hover': { bgcolor: '#f8fafc' },
            whiteSpace: 'nowrap',
          }}
        >
          {isMobile ? 'Dashboard' : 'Back to Dashboard'}
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => refetchLoans()}
            title="Refresh Loans"
            sx={{ bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          >
            <RefreshIcon fontSize="small" sx={{ color: '#0a2558' }} />
          </IconButton>
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              fontWeight: 700,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Co-operative Banking Loans Portal
          </Typography>
        </Box>
      </Box>

      {/* Main Hero / Summary KPIs Banner */}
      <Box
        sx={{
          mb: { xs: 2.5, md: 4 },
          background: 'linear-gradient(135deg, #0a2558 0%, #1e3a8a 100%)',
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: '20px', md: '28px' },
          color: 'white',
          boxShadow: '0 15px 45px rgba(10, 37, 88, 0.22)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              width: { xs: 42, sm: 52 },
              height: { xs: 42, sm: 52 },
              borderRadius: { xs: '12px', sm: '16px' },
              bgcolor: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFC000',
              backdropFilter: 'blur(10px)',
              flexShrink: 0,
            }}
          >
            <RequestQuoteIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                letterSpacing: '-0.5px',
                fontSize: { xs: '1.2rem', sm: '1.45rem', md: '1.75rem' },
                lineHeight: 1.15,
              }}
            >
              My Loans & Advances
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.85,
                fontWeight: 500,
                fontSize: { xs: '0.72rem', sm: '0.85rem' },
                mt: 0.3,
              }}
            >
              Approved bank loans, outstanding balances & EMI schedules
            </Typography>
          </Box>
        </Box>

        {/* 4 Summary Cards (2x2 on Mobile, 4 in a row on Desktop) */}
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          <Grid item xs={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2.2 },
                borderRadius: '16px',
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.8,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  fontSize: { xs: '0.62rem', sm: '0.72rem' },
                  display: 'block',
                }}
              >
                Total Borrowed
              </Typography>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 900,
                  mt: 0.3,
                  color: '#fff',
                  fontSize: { xs: '0.92rem', sm: '1.25rem', md: '1.5rem' },
                }}
              >
                ₹{Number(summary.totalSanctionedAmount || 0).toLocaleString('en-IN')}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2.2 },
                borderRadius: '16px',
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.8,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  fontSize: { xs: '0.62rem', sm: '0.72rem' },
                  display: 'block',
                }}
              >
                Outstanding Balance
              </Typography>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 900,
                  mt: 0.3,
                  color: '#fca5a5',
                  fontSize: { xs: '0.92rem', sm: '1.25rem', md: '1.5rem' },
                }}
              >
                ₹{Number(summary.totalOutstandingBalance || 0).toLocaleString('en-IN')}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2.2 },
                borderRadius: '16px',
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.8,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  fontSize: { xs: '0.62rem', sm: '0.72rem' },
                  display: 'block',
                }}
              >
                Active Loans
              </Typography>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 900,
                  mt: 0.3,
                  color: '#86efac',
                  fontSize: { xs: '0.92rem', sm: '1.25rem', md: '1.5rem' },
                }}
              >
                {summary.activeLoansCount || 0} Accounts
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2.2 },
                borderRadius: '16px',
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.8,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  fontSize: { xs: '0.62rem', sm: '0.72rem' },
                  display: 'block',
                }}
              >
                Monthly EMI
              </Typography>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 900,
                  mt: 0.3,
                  color: '#fef08a',
                  fontSize: { xs: '0.92rem', sm: '1.25rem', md: '1.5rem' },
                }}
              >
                ₹{Number(summary.totalMonthlyEmi || 0).toLocaleString('en-IN')}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Category Tabs & Controls */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: { xs: 2.5, md: 4 },
          borderRadius: { xs: '16px', md: '20px' },
          bgcolor: 'white',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={selectedCategory}
            onChange={(_e, val) => setSelectedCategory(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 40,
              '& .MuiTabs-scrollButtons': {
                display: { xs: 'none', sm: 'inline-flex' },
              },
              '& .MuiTabs-scroller': {
                overflowX: 'auto !important',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 800,
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                color: '#64748b',
                minHeight: 40,
                py: 0.5,
                px: { xs: 1.5, sm: 2 },
                '&.Mui-selected': { color: '#0a2558' },
              },
              '& .MuiTabs-indicator': { backgroundColor: '#0a2558', height: 3, borderRadius: '3px' },
            }}
          >
            {CATEGORIES.map((cat) => (
              <Tab key={cat} label={cat} value={cat} />
            ))}
          </Tabs>
        </Box>

        {/* Search & Filter Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          <TextField
            size="small"
            placeholder="Search Account No, Loan ID or Type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: 1,
              width: '100%',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: '#f8fafc',
                fontSize: '0.88rem',
              },
            }}
          />

          <Box
            sx={{
              display: 'flex',
              gap: 1,
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'space-between', sm: 'flex-end' },
            }}
          >
            <Button
              variant={statusFilter === 'all' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setStatusFilter('all')}
              sx={{
                flex: { xs: 1, sm: 'none' },
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '0.8rem',
                bgcolor: statusFilter === 'all' ? '#0a2558' : 'transparent',
              }}
            >
              All ({loans.length})
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setStatusFilter('active')}
              sx={{
                flex: { xs: 1, sm: 'none' },
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '0.8rem',
                bgcolor: statusFilter === 'active' ? '#10b981' : 'transparent',
                borderColor: '#10b981',
                color: statusFilter === 'active' ? 'white' : '#10b981',
                '&:hover': { bgcolor: '#059669', color: 'white' },
              }}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 'closed' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setStatusFilter('closed')}
              sx={{
                flex: { xs: 1, sm: 'none' },
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '0.8rem',
                bgcolor: statusFilter === 'closed' ? '#64748b' : 'transparent',
                borderColor: '#64748b',
                color: statusFilter === 'closed' ? 'white' : '#64748b',
              }}
            >
              Closed
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Loading state indicator */}
      {isLoading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
          <CircularProgress sx={{ color: '#0a2558' }} size={40} />
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 700 }}>
            Loading your loans...
          </Typography>
        </Box>
      )}

      {/* Empty State */}
      {!isLoading && filteredLoans.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3.5, sm: 6 },
            textAlign: 'center',
            borderRadius: { xs: '18px', md: '24px' },
            bgcolor: 'white',
            border: '1.5px dashed #cbd5e1',
          }}
        >
          <Box
            sx={{
              width: { xs: 58, sm: 72 },
              height: { xs: 58, sm: 72 },
              borderRadius: '20px',
              bgcolor: '#f1f5f9',
              color: '#0a2558',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 2,
            }}
          >
            <AccountBalanceIcon sx={{ fontSize: { xs: 28, sm: 36 } }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: '#0a2558',
              mb: 1,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
            }}
          >
            No {selectedCategory === 'All' ? '' : selectedCategory} Loans Found
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              maxWidth: '480px',
              mx: 'auto',
              mb: 3,
              fontSize: { xs: '0.8rem', sm: '0.88rem' },
            }}
          >
            You currently have no active {selectedCategory === 'All' ? '' : selectedCategory} loans in your account.
            When our bank administrator sanctions a loan for you, it will appear here immediately with complete EMI details.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/user/support-chat')}
            sx={{
              bgcolor: '#0a2558',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 800,
              px: 3,
              py: 1,
            }}
          >
            Contact Loan Desk
          </Button>
        </Paper>
      )}

      {/* Loan Cards Grid */}
      {!isLoading && filteredLoans.length > 0 && (
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {filteredLoans.map((loan) => {
            const theme = CATEGORY_THEMES[loan.category] || CATEGORY_THEMES.Personal;
            const isClosed = (loan.status || '').toLowerCase() === 'closed';
            const repaidPercent =
              loan.sanctioned_amount > 0
                ? Math.min(100, Math.round((loan.total_repaid / loan.sanctioned_amount) * 100))
                : 0;

            return (
              <Grid item xs={12} sm={6} lg={4} key={loan.account_no || loan.id}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: { xs: '18px', md: '24px' },
                    bgcolor: 'white',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    '&:hover': {
                      transform: { md: 'translateY(-4px)' },
                      boxShadow: '0 16px 40px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  {/* Card Header with Category Gradient Strip */}
                  <Box
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      background: theme.gradient,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: { xs: 38, sm: 44 },
                          height: { xs: 38, sm: 44 },
                          borderRadius: '12px',
                          bgcolor: 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          flexShrink: 0,
                        }}
                      >
                        {React.cloneElement(theme.icon, { sx: { fontSize: { xs: 20, sm: 24 } } })}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          noWrap
                          sx={{
                            fontWeight: 900,
                            lineHeight: 1.2,
                            fontSize: { xs: '0.95rem', sm: '1.05rem' },
                          }}
                        >
                          {loan.loan_type}
                        </Typography>
                        <Typography
                          variant="caption"
                          noWrap
                          sx={{ opacity: 0.9, fontWeight: 700, display: 'block', fontSize: '0.7rem' }}
                        >
                          ACC: {loan.account_no}
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      label={(loan.status || 'ACTIVE').toUpperCase()}
                      size="small"
                      sx={{
                        fontWeight: 900,
                        fontSize: '0.68rem',
                        bgcolor: isClosed ? 'rgba(255,255,255,0.2)' : '#10b981',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        flexShrink: 0,
                        ml: 1,
                      }}
                    />
                  </Box>

                  {/* Card Body */}
                  <Box sx={{ p: { xs: 2, sm: 2.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Key Figures: Sanctioned vs Outstanding */}
                    <Box
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        mb: 2,
                        borderRadius: '14px',
                        bgcolor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#64748b',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            fontSize: '0.65rem',
                            display: 'block',
                          }}
                        >
                          Sanctioned Amount
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 900,
                            color: '#0a2558',
                            fontSize: { xs: '1.05rem', sm: '1.2rem' },
                          }}
                        >
                          ₹{Number(loan.sanctioned_amount || 0).toLocaleString('en-IN')}
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: 'right' }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#64748b',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            fontSize: '0.65rem',
                            display: 'block',
                          }}
                        >
                          Balance Due
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 900,
                            color: isClosed ? '#10b981' : '#dc2626',
                            fontSize: { xs: '1.05rem', sm: '1.2rem' },
                          }}
                        >
                          ₹{Number(loan.outstanding_balance || 0).toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.7rem' }}>
                          Repayment Status
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#0a2558', fontWeight: 800, fontSize: '0.7rem' }}>
                          {repaidPercent}% Repaid
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={repaidPercent}
                        sx={{
                          height: 7,
                          borderRadius: 4,
                          bgcolor: '#e2e8f0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: isClosed ? '#10b981' : theme.primary,
                          },
                        }}
                      />
                    </Box>

                    {/* 2x2 Grid of details: EMI, Interest, Tenure, Disbursed */}
                    <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MonetizationOnIcon sx={{ fontSize: 17, color: '#f59e0b', flexShrink: 0 }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', fontSize: '0.68rem' }}>
                              Monthly EMI
                            </Typography>
                            <Typography variant="body2" noWrap sx={{ fontWeight: 900, color: '#0f172a', fontSize: '0.85rem' }}>
                              ₹{Number(loan.emi_amount || 0).toLocaleString('en-IN')}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PercentIcon sx={{ fontSize: 17, color: '#3b82f6', flexShrink: 0 }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', fontSize: '0.68rem' }}>
                              Interest Rate
                            </Typography>
                            <Typography variant="body2" noWrap sx={{ fontWeight: 900, color: '#0f172a', fontSize: '0.85rem' }}>
                              {loan.interest_rate}% p.a.
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 17, color: '#10b981', flexShrink: 0 }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', fontSize: '0.68rem' }}>
                              Tenure
                            </Typography>
                            <Typography variant="body2" noWrap sx={{ fontWeight: 900, color: '#0f172a', fontSize: '0.85rem' }}>
                              {loan.tenure_months} Months
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarMonthIcon sx={{ fontSize: 17, color: '#8b5cf6', flexShrink: 0 }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', fontSize: '0.68rem' }}>
                              Disbursed Date
                            </Typography>
                            <Typography variant="body2" noWrap sx={{ fontWeight: 900, color: '#0f172a', fontSize: '0.85rem' }}>
                              {loan.date_of_opening ? new Date(loan.date_of_opening).toLocaleDateString('en-GB') : '-'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 'auto' }}>
                      <Divider sx={{ mb: 1.5 }} />

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<VisibilityIcon sx={{ fontSize: 18 }} />}
                          onClick={() => handleOpenDetails(loan)}
                          sx={{
                            borderRadius: '12px',
                            bgcolor: '#0a2558',
                            textTransform: 'none',
                            fontWeight: 800,
                            fontSize: { xs: '0.8rem', sm: '0.88rem' },
                            py: 1,
                            '&:hover': { bgcolor: '#1e3a8a' },
                          }}
                        >
                          View Details
                        </Button>

                        <Button
                          variant="outlined"
                          onClick={() => navigate('/user/loantransactions')}
                          sx={{
                            borderRadius: '12px',
                            borderColor: '#cbd5e1',
                            color: '#475569',
                            textTransform: 'none',
                            fontWeight: 800,
                            fontSize: { xs: '0.8rem', sm: '0.88rem' },
                            py: 1,
                            px: { xs: 1.5, sm: 2 },
                            whiteSpace: 'nowrap',
                            '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' },
                          }}
                        >
                          Statement
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Complete Loan Details Dialog (Responsive: Fullscreen on mobile) */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        fullScreen={isMobile}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: '24px' },
            p: { xs: 1, sm: 1.5 },
          },
        }}
      >
        {selectedLoan && (
          <>
            <DialogTitle
              sx={{
                pb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '12px',
                    bgcolor: '#0a2558',
                    color: '#FFC000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <RequestQuoteIcon />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    noWrap
                    sx={{
                      fontWeight: 900,
                      color: '#0a2558',
                      lineHeight: 1.15,
                      fontSize: { xs: '1rem', sm: '1.2rem' },
                    }}
                  >
                    {selectedLoan.loan_type} Details
                  </Typography>
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}
                  >
                    ACC: {selectedLoan.account_no} | Ref: {selectedLoan.account_id}
                  </Typography>
                </Box>
              </Box>

              <IconButton onClick={handleCloseDetails} edge="end">
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ py: { xs: 2, sm: 3 } }}>
              {/* Top Highlights Grid (2x2 on mobile, 4 columns on desktop) */}
              <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 2.5 }}>
                <Grid item xs={6} sm={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 1.2, sm: 2 },
                      borderRadius: '14px',
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.62rem', display: 'block' }}
                    >
                      SANCTIONED AMOUNT
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 900,
                        color: '#0a2558',
                        mt: 0.3,
                        fontSize: { xs: '0.95rem', sm: '1.15rem' },
                      }}
                    >
                      ₹{Number(selectedLoan.sanctioned_amount).toLocaleString('en-IN')}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 1.2, sm: 2 },
                      borderRadius: '14px',
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.62rem', display: 'block' }}
                    >
                      BALANCE DUE
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 900,
                        color: '#dc2626',
                        mt: 0.3,
                        fontSize: { xs: '0.95rem', sm: '1.15rem' },
                      }}
                    >
                      ₹{Number(selectedLoan.outstanding_balance).toLocaleString('en-IN')}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 1.2, sm: 2 },
                      borderRadius: '14px',
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.62rem', display: 'block' }}
                    >
                      MONTHLY EMI
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 900,
                        color: '#d97706',
                        mt: 0.3,
                        fontSize: { xs: '0.95rem', sm: '1.15rem' },
                      }}
                    >
                      ₹{Number(selectedLoan.emi_amount).toLocaleString('en-IN')}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 1.2, sm: 2 },
                      borderRadius: '14px',
                      bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.62rem', display: 'block' }}
                    >
                      STATUS
                    </Typography>
                    <Box sx={{ mt: 0.3 }}>
                      <Chip
                        label={(selectedLoan.status || 'active').toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: selectedLoan.status === 'active' ? '#10b981' : '#64748b',
                          color: 'white',
                          fontWeight: 900,
                          fontSize: '0.65rem',
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Complete Specifications Grid */}
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 900, color: '#0a2558', mb: 1.5, letterSpacing: '0.4px' }}
              >
                LOAN TERMS & SPECIFICATIONS
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.5, sm: 2.5 },
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  bgcolor: 'white',
                  mb: 3,
                }}
              >
                <Grid container spacing={{ xs: 1, sm: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 0.8,
                        borderBottom: '1px dashed #e2e8f0',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
                        Interest Rate:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                        {selectedLoan.interest_rate}% per annum
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 0.8,
                        borderBottom: '1px dashed #e2e8f0',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
                        Tenure / Duration:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                        {selectedLoan.tenure_months} Months
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 0.8,
                        borderBottom: '1px dashed #e2e8f0',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
                        Disbursed Date:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                        {selectedLoan.date_of_opening
                          ? new Date(selectedLoan.date_of_opening).toLocaleDateString('en-GB')
                          : '-'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 0.8,
                        borderBottom: '1px dashed #e2e8f0',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
                        Maturity Date:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                        {selectedLoan.date_of_maturity
                          ? new Date(selectedLoan.date_of_maturity).toLocaleDateString('en-GB')
                          : '-'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 0.8,
                        borderBottom: '1px dashed #e2e8f0',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
                        Repayment Mode:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                        {selectedLoan.repayment_frequency || 'Monthly'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 0.8,
                        borderBottom: '1px dashed #e2e8f0',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
                        Branch Location:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                        {selectedLoan.branch_id || '001-HO MAIN BRANCH'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        py: 0.8,
                        borderBottom: '1px dashed #e2e8f0',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
                        Account Operation:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                        {selectedLoan.account_operation || 'Single'}
                      </Typography>
                    </Box>
                  </Grid>

                  {selectedLoan.joint_member && (
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          py: 0.8,
                          borderBottom: '1px dashed #e2e8f0',
                        }}
                      >
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
                          Joint Member:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                          {selectedLoan.joint_member}
                        </Typography>
                      </Box>
                    </Grid>
                  )}

                  {selectedLoan.introducer && (
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          py: 0.8,
                          borderBottom: '1px dashed #e2e8f0',
                        }}
                      >
                        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>
                          Introducer Code:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>
                          {selectedLoan.introducer}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>

              {/* Recent Repayments / Passbook Table */}
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 900, color: '#0a2558', mb: 1.5, letterSpacing: '0.4px' }}
              >
                RECENT REPAYMENT TRANSACTIONS
              </Typography>

              {selectedLoan.recent_transactions && selectedLoan.recent_transactions.length > 0 ? (
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    maxWidth: '100%',
                    overflowX: 'auto',
                  }}
                >
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>Tx ID</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>Description</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedLoan.recent_transactions.map((tx: any, i: number) => (
                        <TableRow key={tx.transaction_id || i}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                            {tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString('en-GB') : '-'}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#0a2558', fontSize: '0.78rem' }}>
                            {tx.transaction_id || '-'}
                          </TableCell>
                          <TableCell sx={{ color: '#64748b', fontSize: '0.78rem' }}>
                            {tx.description || 'EMI Payment'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: '#10b981', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                            ₹{Number(tx.credit || tx.amount || 0).toLocaleString('en-IN')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '14px',
                    bgcolor: '#f8fafc',
                    textAlign: 'center',
                    border: '1px dashed #cbd5e1',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                    No repayment transactions recorded yet for this loan account.
                  </Typography>
                </Paper>
              )}
            </DialogContent>

            <DialogActions
              sx={{
                p: { xs: 1.5, sm: 2 },
                flexDirection: { xs: 'column-reverse', sm: 'row' },
                gap: 1,
              }}
            >
              <Button
                variant="outlined"
                fullWidth={isMobile}
                onClick={handleCloseDetails}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 800,
                  px: 3,
                  py: 1,
                }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                fullWidth={isMobile}
                onClick={() => {
                  handleCloseDetails();
                  navigate('/user/loantransactions');
                }}
                sx={{
                  borderRadius: '12px',
                  bgcolor: '#0a2558',
                  textTransform: 'none',
                  fontWeight: 800,
                  px: 3,
                  py: 1,
                  '&:hover': { bgcolor: '#1e3a8a' },
                }}
              >
                Full Loan Statement
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MyLoans;
