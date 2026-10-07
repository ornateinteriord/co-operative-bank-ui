import { Card, CardContent, Typography, Avatar, Button, Grid, Box, CircularProgress, Chip, Container, Stack, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useMediaQuery } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SavingsIcon from '@mui/icons-material/Savings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CollectionsIcon from '@mui/icons-material/Collections';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TokenService from '../../queries/token/tokenService';
import { useGetAssignedAccounts, useGetCollectionTransactions, useGetAgentById, useGetAgentCommissionTransactions, useGetIntroducerAccounts } from '../../queries/Agent';
import AgentWalletCard from '../../components/Dashboard/AgentWalletCard';
import { IntroducerAccount } from '../../types';

// Icon mapping for account types
const getAccountIcon = (accountType: string) => {
  const iconMap: { [key: string]: JSX.Element } = {
    'SB': <SavingsIcon sx={{ fontSize: 40 }} />,
    'CA': <AccountBalanceIcon sx={{ fontSize: 40 }} />,
    'RD': <TrendingUpIcon sx={{ fontSize: 40 }} />,
    'FD': <MonetizationOnIcon sx={{ fontSize: 40 }} />,
    'PIGMY': <AccountBalanceWalletIcon sx={{ fontSize: 40 }} />,
    'MIS': <SavingsIcon sx={{ fontSize: 40 }} />,
  };
  return iconMap[accountType] || <AccountBalanceIcon sx={{ fontSize: 40 }} />;
};

// Gradient colors for different cards
const getCardGradient = (index: number) => {
  const gradients = [
    'linear-gradient(135deg, #667EEA 0%, #818CF8 100%)',
    'linear-gradient(135deg, #5B21B6 0%, #667EEA 100%)',
    'linear-gradient(135deg, #4C1D95 0%, #5B21B6 100%)',
    'linear-gradient(135deg, #3730A3 0%, #4C1D95 100%)',
    'linear-gradient(135deg, #312E81 0%, #3730A3 100%)',
    'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
  ];
  return gradients[index % gradients.length];
};

// Status chip styling
const getStatusChipStyle = (status: string) => {
  const s = status?.toLowerCase();
  if (s === 'active') return { bg: 'rgba(16,185,129,0.1)', color: '#059669' };
  if (s === 'pending') return { bg: 'rgba(245,158,11,0.1)', color: '#d97706' };
  if (s === 'closed' || s === 'inactive') return { bg: 'rgba(239,68,68,0.1)', color: '#dc2626' };
  return { bg: 'rgba(100,116,139,0.1)', color: '#475569' };
};

// Reusable Introducer Table component
const IntroducerTable = ({ rows, isLoading, emptyMessage }: {
  rows: IntroducerAccount[];
  isLoading: boolean;
  emptyMessage: string;
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress sx={{ color: '#1a237e' }} />
      </Box>
    );
  }
  if (!rows.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <AccountBalanceIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
        <Typography variant="body2" sx={{ color: '#64748b' }}>{emptyMessage}</Typography>
      </Box>
    );
  }
  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
            {['Account No', 'Type', 'Member', 'Amount (₹)', 'Date Opened', 'Status'].map(h => (
              <TableCell key={h} sx={{ fontWeight: 700, color: '#334155', fontSize: '0.78rem', py: 1.5, whiteSpace: 'nowrap' }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => {
            const chipStyle = getStatusChipStyle(row.status);
            return (
              <TableRow
                key={row.account_id || idx}
                sx={{
                  '&:hover': { background: '#f8fafc' },
                  '&:last-child td': { border: 0 }
                }}
              >
                <TableCell sx={{ fontWeight: 600, color: '#1a237e', fontSize: '0.8rem', py: 1.2 }}>{row.account_no || '-'}</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', color: '#475569', py: 1.2 }}>{row.account_type_name || row.account_type}</TableCell>
                <TableCell sx={{ py: 1.2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', background: 'linear-gradient(135deg,#1a237e,#3949ab)', fontWeight: 700 }}>
                      {row.member_name?.[0] || 'M'}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#1f2937', lineHeight: 1.2 }}>{row.member_name}</Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1 }}>{row.member_id}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a', py: 1.2 }}>
                  {row.account_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell sx={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap', py: 1.2 }}>
                  {row.date_of_opening ? new Date(row.date_of_opening).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                </TableCell>
                <TableCell sx={{ py: 1.2 }}>
                  <Chip
                    label={row.status}
                    size="small"
                    sx={{ backgroundColor: chipStyle.bg, color: chipStyle.color, fontWeight: 600, fontSize: '0.72rem', textTransform: 'capitalize', borderRadius: '6px' }}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const AgentDashboard = () => {
  const navigate = useNavigate();
  const agentId = TokenService.getMemberId() || '';

  const { data: agentData, isLoading: agentLoading } = useGetAgentById(agentId);
  const { data: accountsData, isLoading: accountsLoading } = useGetAssignedAccounts(agentId);
  const { data: transactionsData, isLoading: transactionsLoading } = useGetCollectionTransactions(agentId);
  const { data: commissionData, isLoading: commissionLoading } = useGetAgentCommissionTransactions(agentId);
  const { data: introducerData, isLoading: introducerLoading } = useGetIntroducerAccounts(agentId);

  const isLoading = agentLoading || accountsLoading || transactionsLoading;

  // Get commission balance from commission transactions summary
  const totalBalance = commissionData?.data?.summary?.availableBalance || 0;

  // Get collection balance from transactions data (handles both array and { transactions: [], summary: {} } formats)
  const rawCollectionData = transactionsData?.data;
  const collectionTransactions: any[] = Array.isArray(rawCollectionData)
    ? rawCollectionData
    : Array.isArray((rawCollectionData as any)?.transactions)
      ? (rawCollectionData as any).transactions
      : [];

  const totalCollected = (rawCollectionData as any)?.summary?.totalCollected ?? (
    collectionTransactions.reduce((sum: number, tx: any) => sum + (Number(tx.credit) || 0), 0)
  );
  const totalPaid = (rawCollectionData as any)?.summary?.totalPaid ?? (
    collectionTransactions.reduce((sum: number, tx: any) => sum + (Number(tx.debit) || 0), 0)
  );
  const netCollectedAmount = (rawCollectionData as any)?.summary?.netCollectedAmount ?? (totalCollected - totalPaid);

  // Introducer data
  const introducerAccounts: IntroducerAccount[] = (introducerData as any)?.accounts || [];
  const introducerLoans: IntroducerAccount[] = (introducerData as any)?.loans || [];

  // Group accounts by type
  const accountsByType = accountsData?.data?.reduce((acc: any, account: any) => {
    const type = account.account_type || 'Other';
    if (!acc[type]) {
      acc[type] = { count: 0, accounts: [] };
    }
    acc[type].count++;
    acc[type].accounts.push(account);
    return acc;
  }, {}) || {};

  const isMobile = useMediaQuery('(max-width: 899px)');

  // ─── NATIVE MOBILE APP VIEW FOR AGENT ───
  if (isMobile) {
    return (
      <Box sx={{ px: 2, pt: 1.5, pb: 10, background: '#f8fafc', minHeight: '100vh' }}>
        {/* Mobile Header Card */}
        <Box sx={{
          background: 'linear-gradient(135deg, #0a2558 0%, #1e3a8a 100%)',
          borderRadius: '24px',
          p: 2.5,
          color: 'white',
          boxShadow: '0 12px 35px rgba(10, 37, 88, 0.25)',
          mb: 2.5,
        }}>
          {/* Row 1: Avatar + Name + Agent ID */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Avatar
              sx={{
                width: 52,
                height: 52,
                bgcolor: 'rgba(255,255,255,0.15)',
                color: '#FFC000',
                border: '2px solid rgba(255,255,255,0.3)',
                fontWeight: 900,
                fontSize: '1.25rem'
              }}
            >
              {agentData?.data?.name?.[0] || 'A'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '1.15rem', lineHeight: 1.2, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {agentData?.data?.name || 'Agent'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.3 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>
                  ID: {agentId}
                </Typography>
                <Chip
                  label="Field Agent"
                  size="small"
                  sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: 'rgba(16,185,129,0.25)', color: '#6ee7b7', border: '1px solid rgba(255,255,255,0.15)' }}
                />
              </Box>
            </Box>
          </Box>

          {/* Row 2: 2 Balance Cards (Collection Balance + Commission Wallet) */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {/* Collection Balance */}
            <Box
              onClick={() => navigate('/agent/collections')}
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                p: 1.5,
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer',
                '&:active': { transform: 'scale(0.97)' },
                transition: 'transform 0.2s',
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: '0.68rem', display: 'block' }}>
                Collection Balance
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#34d399', mt: 0.3 }}>
                ₹{netCollectedAmount.toFixed(0)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.62rem', fontWeight: 600 }}>
                {accountsData?.data?.length || 0} Accounts Assigned
              </Typography>
            </Box>

            {/* Wallet Balance */}
            <Box
              onClick={() => navigate('/agent/wallet')}
              sx={{
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                p: 1.5,
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer',
                '&:active': { transform: 'scale(0.97)' },
                transition: 'transform 0.2s',
              }}
            >
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: '0.68rem', display: 'block' }}>
                Commission Wallet
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#fcd34d', mt: 0.3 }}>
                ₹{Number(totalBalance || 0).toFixed(0)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.62rem', fontWeight: 700 }}>
                View Wallet &gt;
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Quick Actions Shortcuts (App-style grid) */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0a2558', mb: 1.5, letterSpacing: '0.5px' }}>
            QUICK ACTIONS
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
            {[
              { label: 'Collect', icon: <ReceiptLongIcon />, color: '#10b981', path: '/agent/collections' },
              { label: 'New A/C', icon: <AddCircleIcon />, color: '#3b82f6', path: '/agent/add-new' },
              { label: 'Reports', icon: <AssessmentIcon />, color: '#f59e0b', path: '/agent/report' },
              { label: 'Wallet', icon: <AccountBalanceWalletIcon />, color: '#8b5cf6', path: '/agent/wallet' },
            ].map((action, i) => (
              <Box
                key={i}
                onClick={() => navigate(action.path)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.8,
                  cursor: 'pointer',
                  '&:active': { transform: 'scale(0.93)' },
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '18px',
                    bgcolor: 'white',
                    color: action.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 6px 16px ${action.color}20`,
                    border: '1px solid #f1f5f9',
                  }}
                >
                  {action.icon}
                </Paper>
                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.72rem', color: '#1e293b' }}>
                  {action.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Assigned Accounts Mobile Cards */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0a2558', letterSpacing: '0.5px' }}>
              ASSIGNED ACCOUNTS
            </Typography>
            <Typography
              onClick={() => navigate('/agent/collections')}
              variant="caption"
              sx={{ fontWeight: 800, color: '#3b82f6', cursor: 'pointer' }}
            >
              See All &gt;
            </Typography>
          </Box>

          {Object.keys(accountsByType).length === 0 ? (
            <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', bgcolor: 'white', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
              <AccountBalanceIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>
                No Accounts Assigned
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Contact branch manager to assign member accounts.
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {Object.entries(accountsByType).map(([type, data]: [string, any], index: number) => (
                <Paper
                  key={type}
                  onClick={() => navigate(`/agent/collections?type=${type}`)}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '18px',
                    bgcolor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                    border: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    '&:active': { transform: 'scale(0.98)' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: getCardGradient(index),
                        color: 'white',
                      }}
                    >
                      {getAccountIcon(type)}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0f172a' }}>
                        {type} Accounts
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        View accounts
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={`${data.count} A/C`}
                    size="small"
                    sx={{ fontWeight: 800, bgcolor: '#f1f5f9', color: '#0a2558', borderRadius: '10px' }}
                  />
                </Paper>
              ))}
            </Box>
          )}
        </Box>

        {/* Recent Collections Feed */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0a2558', letterSpacing: '0.5px' }}>
              RECENT COLLECTIONS
            </Typography>
            <Typography
              onClick={() => navigate('/agent/report')}
              variant="caption"
              sx={{ fontWeight: 800, color: '#3b82f6', cursor: 'pointer' }}
            >
              All Reports &gt;
            </Typography>
          </Box>

          {collectionTransactions.length === 0 ? (
            <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', bgcolor: 'white', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
              <ReceiptLongIcon sx={{ fontSize: 36, color: '#94a3b8', mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>
                No Collections Yet
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {collectionTransactions.slice(0, 5).map((tx: any, idx: number) => (
                <Paper
                  key={idx}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: '16px',
                    bgcolor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    border: '1px solid #f8fafc',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Avatar sx={{ width: 38, height: 38, bgcolor: '#e0f2fe', color: '#0284c7', fontSize: '0.85rem', fontWeight: 900 }}>
                      {tx.Name?.[0] || 'M'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                        {tx.Name || 'Member'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                        {tx.account_number || tx.account_id}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 900, color: '#10b981' }}>
                      + ₹{Number(tx.credit || 0).toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>
                      {new Date(tx.transaction_date).toLocaleDateString('en-GB')}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  // ─── EXISTING DESKTOP VIEW (PRESERVED 100%) ───
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, mt: { xs: 2, sm: 3, md: 4 }, pb: 6 }}>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0a2558', mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.875rem' } }}>
          Agent Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.95rem' }}>
          Welcome back, <strong style={{ color: '#1a237e' }}>{agentData?.data?.name || 'Agent'}</strong> ({agentId})
        </Typography>
      </Box>

      {/* Wallet and Collection Balance Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Agent Wallet Card - Clickable to navigate to wallet page */}
        <Grid item xs={12} md={6}>
          <Box
            onClick={() => navigate('/agent/wallet')}
            sx={{ height: '100%', cursor: 'pointer' }}
          >
            <AgentWalletCard
              balance={totalBalance}
              isLoading={commissionLoading}
            />
          </Box>
        </Grid>

        {/* Collection Balance Card */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
              minHeight: '200px',
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ zIndex: 1, textAlign: 'center', width: '100%', py: 4 }}>
              <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 1 }}>
                Collection Balance
              </Typography>
              {transactionsLoading ? (
                <CircularProgress size={40} sx={{ color: 'white', my: 2 }} />
              ) : (
                <>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                    ₹{netCollectedAmount.toFixed(2)}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>Collected</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>₹{totalCollected.toFixed(2)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>Paid</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>₹{totalPaid.toFixed(2)}</Typography>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assigned Accounts Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
          Assigned Accounts
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#1a237e' }} />
          </Box>
        ) : Object.keys(accountsByType).length === 0 ? (
          <Card sx={{
            borderRadius: '16px',
            p: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
            border: '2px dashed #cbd5e1',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          }}>
            <AccountBalanceIcon sx={{ fontSize: 56, color: '#94a3b8', mb: 1.5 }} />
            <Typography variant="h6" sx={{ color: '#334155', fontWeight: 700 }}>
              No Accounts Assigned
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              You don't have any accounts assigned yet. Contact your branch manager to assign member accounts.
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {Object.entries(accountsByType).map(([type, data]: [string, any], index: number) => (
              <Grid item xs={12} sm={6} md={4} key={type}>
                <Card
                  onClick={() => navigate(`/agent/collections?type=${type}`)}
                  sx={{
                    borderRadius: '16px',
                    background: getCardGradient(index),
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 8px 30px rgba(102, 126, 234, 0.4)',
                    }
                  }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        {getAccountIcon(type)}
                      </Box>
                      <Box sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        px: 2,
                        py: 0.5,
                        backdropFilter: 'blur(10px)',
                      }}>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                          {data.count} {data.count === 1 ? 'Account' : 'Accounts'}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {type}
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', opacity: 0.9 }}>
                      View accounts
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* ─── Introducer Sections ─── */}
      {/* Introduced Accounts */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'linear-gradient(135deg,#1a237e,#3949ab)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <AccountBalanceIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                Introduced Accounts
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Accounts where you are the introducer
              </Typography>
            </Box>
          </Box>
          {introducerAccounts.length > 0 && (
            <Chip
              label={`${introducerAccounts.length} Account${introducerAccounts.length !== 1 ? 's' : ''}`}
              size="small"
              sx={{ background: 'rgba(26,35,126,0.08)', color: '#1a237e', fontWeight: 700 }}
            />
          )}
        </Box>
        <Card sx={{ borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', background: 'white' }}>
          <CardContent sx={{ p: 2.5 }}>
            <IntroducerTable
              rows={introducerAccounts}
              isLoading={introducerLoading}
              emptyMessage="No accounts introduced yet. When admin creates accounts with your agent ID as introducer, they will appear here."
            />
          </CardContent>
        </Card>
      </Box>

      {/* Introduced Loans */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'linear-gradient(135deg,#dc2626,#ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <CreditCardIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                Introduced Loans
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Loans where you are the introducer
              </Typography>
            </Box>
          </Box>
          {introducerLoans.length > 0 && (
            <Chip
              label={`${introducerLoans.length} Loan${introducerLoans.length !== 1 ? 's' : ''}`}
              size="small"
              sx={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', fontWeight: 700 }}
            />
          )}
        </Box>
        <Card sx={{ borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', background: 'white' }}>
          <CardContent sx={{ p: 2.5 }}>
            <IntroducerTable
              rows={introducerLoans}
              isLoading={introducerLoading}
              emptyMessage="No loans introduced yet. When admin creates loans with your agent ID as introducer, they will appear here."
            />
          </CardContent>
        </Card>
      </Box>

      {/* Lower Row: Recent Collections & Summary */}
      <Grid container spacing={3}>
        {/* Recent Collections */}
        <Grid item xs={12} lg={8}>
          <Card sx={{
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            background: 'white',
            height: '100%',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Recent Collections
                </Typography>
                {collectionTransactions.length > 0 && (
                  <Button
                    size="small"
                    onClick={() => navigate('/agent/collections')}
                    sx={{ textTransform: 'none', color: '#1a237e', fontWeight: 600 }}
                  >
                    View All
                  </Button>
                )}
              </Box>

              {transactionsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: '#1a237e' }} />
                </Box>
              ) : !collectionTransactions.length ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CollectionsIcon sx={{ fontSize: 56, color: '#cbd5e1', mb: 1.5 }} />
                  <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 600 }}>
                    No recent collections
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    Transactions will appear here once collections are made.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {collectionTransactions.slice(0, 5).map((tx: any) => (
                    <Box
                      key={tx.transaction_id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#f8fafc',
                        p: 2,
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: '#f1f5f9',
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{
                          width: 44,
                          height: 44,
                          background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                          fontWeight: 700
                        }}>
                          {tx.Name?.[0] || 'A'}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: '#1f2937' }}>
                            {tx.Name || 'Unknown'}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {tx.account_number} • {new Date(tx.transaction_date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={tx.status || 'Completed'}
                          size="small"
                          sx={{
                            backgroundColor: tx.status === 'Failed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: tx.status === 'Failed' ? '#ef4444' : '#059669',
                            fontWeight: 600,
                          }}
                        />
                        <Typography sx={{
                          fontWeight: 700,
                          color: '#1a237e',
                          minWidth: '80px',
                          textAlign: 'right',
                        }}>
                          ₹{tx.credit?.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions & Summary */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Agent Summary Card */}
            <Card sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(26, 35, 126, 0.2)',
              background: 'linear-gradient(135deg, #1a237e 0%, #312e81 100%)',
              color: 'white',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mb: 2.5 }}>
                  Agent Summary
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                      Agent ID
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {agentData?.data?.agent_id || agentId || '-'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                      Branch Code
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {agentData?.data?.branch_id || 'BRN001'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                      Designation
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {agentData?.data?.designation || 'Agent'}
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                      Total Collections
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {collectionTransactions.length || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                      Introduced Accounts
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {introducerAccounts.length || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                      Introduced Loans
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {introducerLoans.length || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card sx={{
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
              background: 'white',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/agent/collections')}
                    sx={{
                      background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
                      borderRadius: '12px',
                      py: 1.25,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      boxShadow: '0 4px 12px rgba(26, 35, 126, 0.25)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #283593 0%, #1a237e 100%)',
                      }
                    }}
                    startIcon={<MonetizationOnIcon />}
                  >
                    Collect Payment
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/agent/add-new')}
                    sx={{
                      borderRadius: '12px',
                      py: 1.25,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      borderColor: '#1a237e',
                      color: '#1a237e',
                      '&:hover': {
                        borderColor: '#283593',
                        background: 'rgba(26, 35, 126, 0.04)',
                      }
                    }}
                    startIcon={<AssignmentIcon />}
                  >
                    Open New Account
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/agent/profile')}
                    sx={{
                      borderRadius: '12px',
                      py: 1.25,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      borderColor: '#64748b',
                      color: '#475569',
                      '&:hover': {
                        borderColor: '#334155',
                        background: 'rgba(100, 116, 139, 0.04)',
                      }
                    }}
                    startIcon={<EventIcon />}
                  >
                    View Profile
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

export default AgentDashboard;