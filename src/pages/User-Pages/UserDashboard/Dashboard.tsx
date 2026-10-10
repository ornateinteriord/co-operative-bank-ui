// components/UserDashboard.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Button,
  Stack,
  Avatar,
  Chip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import HubIcon from '@mui/icons-material/Hub';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SavingsIcon from '@mui/icons-material/Savings';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StoreIcon from '@mui/icons-material/Store';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import BuildIcon from '@mui/icons-material/Build';
import TvIcon from '@mui/icons-material/Tv';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import SpeedIcon from '@mui/icons-material/Speed';
import LockIcon from '@mui/icons-material/Lock';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useGetMyLoans } from '../../../queries/Member';

import TokenService from '../../../api/token/tokenService';
import {
  useVerifyPayment,
  useGetTransactionDetails,
  useGetWalletOverview,
  useGetMemberDetails,
  useGetDailyPayout
} from '../../../api/Memeber';
import { toast } from 'react-toastify';
import React from 'react';

const UserDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const showQuickAccess = searchParams.get('view') === 'od';

  const setShowQuickAccess = (show: boolean) => {
    if (show) {
      setSearchParams({ view: 'od' });
    } else {
      setSearchParams({});
    }
  };

  const memberId = TokenService.getMemberId();
  const { data: walletOverview } = useGetWalletOverview(memberId);
  const { data: memberDetails, refetch: refetchMemberDetails, isLoading: isMemberLoading } = useGetMemberDetails(memberId);
  const { mutate: verifyPayment, isPending: isVerifyingPayment } = useVerifyPayment();
  const { refetch: refetchTransactions } = useGetTransactionDetails("all");
  useGetDailyPayout(memberId);
  const { data: myLoansData } = useGetMyLoans();
  const loansSummary = myLoansData?.data?.summary;
  const activeLoansCount = loansSummary?.activeLoansCount || 0;
  const totalOutstandingLoan = loansSummary?.totalOutstandingBalance || 0;
  const monthlyEmi = loansSummary?.totalMonthlyEmi || 0;

  const totalPrincipal = Number(walletOverview?.totalPackages || 0);
  const totalRoiPaidValue = Number(walletOverview?.roiBenefits || 0);
  const roiLevelBenefits = Number(walletOverview?.roiLevelBenefits || 0);

  // Wallet starts at Total Principal and decreases as ROI is paid.
  const displayWallet = Math.max(0, totalPrincipal - totalRoiPaidValue);

  // Once ROI exceeds Total Principal, the Deposit itself starts to "decrease" visually.
  const extraROI = Math.max(0, totalRoiPaidValue - totalPrincipal);
  const displayDeposit = Math.max(0, totalPrincipal - extraROI);

  const isUserActive = memberDetails?.status === 'active';
  const isPackageActive = memberDetails?.upgrade_status === 'Active';

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    const orderStatus = searchParams.get('order_status');

    if (orderId && orderStatus && !paymentProcessed) {
      setPaymentProcessed(true);
      
      let normalizedStatus = (orderStatus || '').toUpperCase();
      // Handle case where Cashfree didn't replace the placeholder
      if (normalizedStatus === '{ORDER_STATUS}') {
        normalizedStatus = 'PENDING';
      }
      console.log("💳 Dashboard Payment Redirect Status:", normalizedStatus);

      if (['PAID', 'SUCCESS', 'PENDING', 'ACTIVE'].includes(normalizedStatus)) {
        toast.info("Verifying payment status...");
        verifyPayment(orderId, {
          onSuccess: (data: any) => {
            const status = data?.payment_status || data?.status;
            if (status === 'PAID' || status === 'SUCCESS' || status === 'Completed') {
              toast.success("Payment successful!");
              refetchTransactions();
              refetchMemberDetails();
            } else {
              toast.info(`Payment status: ${status}`);
            }
            setSearchParams({});
          },
          onError: (error: any) => {
            console.error("❌ Verification error:", error);
            toast.error("Payment verification failed.");
            setSearchParams({});
          }
        });
      } else if (normalizedStatus === 'CANCELLED') {
        toast.warning("Payment was cancelled.");
        setSearchParams({});
      } else {
        toast.error(`Payment ${orderStatus}. Please try again.`);
        setSearchParams({});
      }
    }
  }, [searchParams, paymentProcessed, verifyPayment, setSearchParams, refetchTransactions, refetchMemberDetails]);

  const handleCopyReferralLink = () => {
    if (!memberDetails?.Member_id) return;
    const referralLink = `${window.location.origin}/register?ref=${memberDetails.Member_id}`;
    navigator.clipboard.writeText(referralLink)
      .then(() => toast.success('Referral link copied!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const servicesGrid = [
    { label: "SB Account", icon: <AccountBalanceWalletIcon />, color: "#3b82f6", type: "sb" },
    { label: "Passbook", icon: <MenuBookIcon />, color: "#0a2558", route: "/user/passbook" },
    { label: "RD Account", icon: <AutorenewIcon />, color: "#10b981", type: "rd" },
    { label: "FD Account", icon: <NoteAddIcon />, color: "#f59e0b", type: "fd" },
    { label: "CA Account", icon: <AccountBalanceIcon />, color: "#6366f1", type: "ca" },
    { label: "Pigmy Account", icon: <SavingsIcon />, color: "#10b981", type: "pigmy" },
    { label: "BMS CREDIT", icon: <CreditCardIcon />, color: "#6366f1" },
    { label: "GOLD LOAN", icon: <MonetizationOnIcon />, color: "#10b981" },
    { label: "Group LOAN", icon: <GroupsIcon />, color: "#3b82f6" },
    { label: "RD LOAN", icon: <CurrencyRupeeIcon />, color: "#ef4444" },
    { label: "OD LOAN", icon: <CurrencyRupeeIcon />, color: "#6366f1" },
    { label: "BMS PROTECT", icon: <HealthAndSafetyIcon />, color: "#10b981" },
    { label: "E Shopy Product", icon: <ShoppingCartIcon />, color: "#f59e0b" },
    { label: "Hurb Product", icon: <StoreIcon />, color: "#3b82f6" },
    { label: "TV", icon: <TvIcon />, color: "#ef4444" },
    { label: "Shopping", icon: <ShoppingCartIcon />, color: "#3b82f6" },
    { label: "Gold Saving", icon: <SavingsIcon />, color: "#f59e0b" },
    { label: "Pigmy Saving", icon: <SavingsIcon />, color: "#10b981" },
    { label: "Pigmy Loan", icon: <CurrencyRupeeIcon />, color: "#ef4444" },
    { label: "HOPETAXI", icon: <LocalTaxiIcon />, color: "#f59e0b" },
    { label: "SERVICE", icon: <BuildIcon />, color: "#3b82f6" },
  ];

  const quickAccessGroups = [
    {
      title: "ACCOUNT",
      items: [
        { label: "Passbook", icon: <MenuBookIcon />, route: "/user/passbook", color: "#0a2558" },
        { label: "Profile", icon: <AccountCircleIcon />, route: "/user/account/profile", color: "#3b82f6" },
        { label: "KYC", icon: <VerifiedUserIcon />, route: "/user/account/kyc", color: "#10b981" },
        { label: "Password", icon: <LockIcon />, route: "/user/account/change-password", color: "#f59e0b" },
        ...(isPackageActive ? [{ label: "Add Deposit", icon: <InventoryIcon />, route: "/user/addon-packages?view=addon", color: "#3b82f6" }] : []),
      ]
    },
    {
      title: "BMS BENEFITS",
      items: [
        { label: "ROI Benefits", icon: <ShowChartIcon />, route: "/user/earnings/roi-benefits", color: "#10b981" },
        { label: "Daily ROI", icon: <TrendingUpIcon />, route: "/user/earnings/daily-payout", color: "#ef4444" },
        { label: "Level Benefits", icon: <AccountTreeIcon />, route: "/user/earnings/level-benefits", color: "#3b82f6" },
        { label: "Transactions", icon: <ReceiptLongIcon />, route: "/user/transactions", color: "#3b82f6" },
      ]
    },
    {
      title: "TEAM & TOOLS",
      items: [
        { label: "Team", icon: <GroupsIcon />, route: "/user/team", color: "#3b82f6" },
        { label: "Directs", icon: <PersonAddAltIcon />, route: "/user/team/direct", color: "#6366f1" },
        { label: "Tree View", icon: <HubIcon />, route: "/user/team/tree", color: "#ef4444" },
        { label: "New Regi.", icon: <PersonAddAltIcon />, route: "/user/team/new-register", color: "#10b981" },
      ]
    },
    {
      title: "LOANS & ADVANCES",
      items: [
        { label: "Loans", icon: <RequestQuoteIcon />, route: "/user/loans", color: "#1e40af" },
        { label: "Gold Loan", icon: <MonetizationOnIcon />, route: "/user/loans?type=Gold", color: "#d97706" },
        { label: "Pigmi Loan", icon: <CurrencyRupeeIcon />, route: "/user/loans?type=Pigmi", color: "#ea580c" },
        { label: "Loan History", icon: <ReceiptLongIcon />, route: "/user/loantransactions", color: "#3b82f6" },
      ]
    }
  ];

  const Header = () => (
    <Box sx={{
      mb: 2.5,
      mt: { xs: 1.5, md: 3 },
      background: 'linear-gradient(135deg, #0a2558 0%, #1e3a8a 100%)',
      p: { xs: 2, sm: 2.5, md: 3.5 },
      borderRadius: { xs: '22px', md: '28px' },
      color: 'white',
      boxShadow: '0 15px 45px rgba(10, 37, 88, 0.25)',
      overflow: 'hidden',
    }}>
      {/* Row 1: Avatar + (Name/ID/Wallet Column) */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 }, mb: 2.5 }}>
        <Avatar
          sx={{
            width: { xs: 58, md: 80 },
            height: { xs: 58, md: 80 },
            bgcolor: 'rgba(255,255,255,0.15)',
            border: '3px solid rgba(255,255,255,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            flexShrink: 0,
            mt: 0.5
          }}
          src={memberDetails?.profile_image || ""}
        >
          {!memberDetails?.profile_image && (memberDetails?.Name?.[0] || <AccountCircleIcon sx={{ fontSize: { xs: 30, md: 36 } }} />)}
        </Avatar>

        {/* Name + ID + Wallet Info Column */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.5px',
              lineHeight: 1.2,
              mb: 0.5,
              fontSize: { xs: '1.15rem', md: '1.5rem' },
              color: '#ffffff !important',
            }}
          >
            {memberDetails?.Name || (isMemberLoading ? '...' : '')}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.25 }}>
            <VerifiedUserIcon sx={{ fontSize: 14, color: '#10b981' }} />
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.5px', color: 'rgba(255, 255, 255, 0.9) !important' }}>
              ID: {memberDetails?.Member_id || memberId || ''}
            </Typography>
          </Box>

          {/* Wallet Badge — Now below Name & ID — Hidden if not Active package or Inactive ROI */}
          {isPackageActive && isUserActive && (
            <Box
              onClick={() => navigate('/user/wallet')}
              sx={{
                display: 'inline-flex',
                width: 'fit-content',
                alignItems: 'center',
                gap: 0.6,
                bgcolor: 'rgba(255,255,255,0.15)',
                px: 1.5,
                py: 0.5,
                borderRadius: '10px',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)', transform: 'translateY(-1px)' },
              }}
            >
              <AccountBalanceWalletIcon sx={{ fontSize: 16, color: '#FFC000' }} />
              <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', whiteSpace: 'nowrap', color: '#ffffff !important' }}>
                ₹{Number(walletOverview?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Row 2: Responsive Action Buttons Grid — Never overflows */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: (isUserActive && isPackageActive) ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
          sm: (isUserActive && isPackageActive) ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)'
        },
        gap: { xs: 1.25, sm: 1.5 },
      }}>
        {/* MY PASSBOOK — Direct navigation button for all users */}
        <Button
          variant="contained"
          onClick={() => navigate('/user/passbook')}
          startIcon={<MenuBookIcon sx={{ fontSize: { xs: '1.05rem !important', sm: '1.15rem !important' }, color: '#0a2558' }} />}
          sx={{
            gridColumn: {
              xs: (isUserActive && isPackageActive) ? 'span 2' : 'span 1',
              sm: 'auto'
            },
            borderRadius: '14px',
            textTransform: 'none',
            fontWeight: 900,
            background: '#ffffff !important',
            backgroundColor: '#ffffff !important',
            backgroundImage: 'none !important',
            color: '#0a2558 !important',
            fontSize: { xs: '12.5px', sm: '13px' },
            whiteSpace: 'nowrap',
            py: { xs: 1.15, sm: 1.2 },
            px: { xs: 1.5, sm: 2 },
            minWidth: 0,
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            '&:hover': {
              background: '#f1f5f9 !important',
              backgroundColor: '#f1f5f9 !important',
              backgroundImage: 'none !important',
            },
          }}
        >
          Passbook
        </Button>

        {/* FD BOND — Visible if user is active */}
        {isUserActive && (
          <Button
            variant="contained"
            onClick={() => navigate('/user/addon-packages?view=fd')}
            startIcon={<NoteAddIcon sx={{ fontSize: { xs: '1rem !important', sm: '1.1rem !important' }, color: '#0a2558' }} />}
            sx={{
              borderRadius: '14px',
              textTransform: 'none',
              fontWeight: 900,
              background: '#ffffff !important',
              backgroundColor: '#ffffff !important',
              backgroundImage: 'none !important',
              color: '#0a2558 !important',
              fontSize: { xs: '12.5px', sm: '13px' },
              whiteSpace: 'nowrap',
              py: { xs: 1.15, sm: 1.2 },
              px: { xs: 1.5, sm: 2 },
              minWidth: 0,
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              '&:hover': {
                background: '#f1f5f9 !important',
                backgroundColor: '#f1f5f9 !important',
                backgroundImage: 'none !important',
              },
            }}
          >
            FD Bond
          </Button>
        )}

        {/* OVER DRAFT — Toggle for upgraded users, Redirect for others — Hidden if ROI Inactive */}
        {isUserActive && isPackageActive && (
          <Button
            variant="contained"
            onClick={() => {
              if (isPackageActive) {
                setShowQuickAccess(!showQuickAccess);
              } else {
                navigate('/user/overdraft');
              }
            }}
            startIcon={(isPackageActive && showQuickAccess) ? <ArrowBackIcon sx={{ fontSize: { xs: '1.1rem !important', sm: '1.2rem !important' } }} /> : <SpeedIcon sx={{ fontSize: { xs: '1.1rem !important', sm: '1.2rem !important' } }} />}
            sx={{
              borderRadius: '14px',
              textTransform: 'none',
              fontWeight: 900,
              background: '#2563eb !important',
              backgroundColor: '#2563eb !important',
              backgroundImage: 'none !important',
              color: '#ffffff !important',
              fontSize: { xs: '12.5px', sm: '13px' },
              whiteSpace: 'nowrap',
              py: { xs: 1.15, sm: 1.2 },
              px: { xs: 1.5, sm: 2 },
              minWidth: 0,
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              '&:hover': {
                background: '#1d4ed8 !important',
                backgroundColor: '#1d4ed8 !important',
                backgroundImage: 'none !important',
              }
            }}
          >
            {(isPackageActive && showQuickAccess) ? 'Back' : 'Overdraft'}
          </Button>
        )}

      </Box>
    </Box>
  );

  const handleAccountClick = (item: any) => {
    if (item.route) {
      navigate(item.route);
      return;
    }
    if (item.label === 'My Passbook' || item.label === 'Passbook') {
      navigate('/user/passbook');
      return;
    }
    if (['SB Account', 'RD Account', 'FD Account', 'CA Account', 'Pigmy Account'].includes(item.label)) {
      navigate(`/user/account-opening/${item.type}`);
    } else if (item.label === 'GOLD LOAN') {
      navigate('/user/loans?type=Gold');
    } else if (item.label === 'Pigmy Loan') {
      navigate('/user/loans?type=Pigmi');
    } else if (item.label === 'OD LOAN' || item.label === 'BMS CREDIT') {
      navigate('/user/loans?type=Overdraft');
    } else if (item.label === 'RD LOAN') {
      navigate('/user/loans?type=Personal');
    } else if (item.label === 'Group LOAN') {
      navigate('/user/loans?type=Business');
    }
  };

  return (
    <Box sx={{
      pb: { xs: 10, md: 6 },
      background: '#f4f7f9',
      minHeight: '100vh',
      px: { xs: 2, sm: 3, md: 5, lg: 10, xl: 16 },
      pt: { xs: 1.5, md: 4 }, // Reduced top gap for mobile, more balanced for desktop
      maxWidth: '1800px',
      margin: '0 auto'
    }}>
      {isVerifyingPayment && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white' }}>Verifying payment...</Typography>
        </Box>
      )}

      <Header />

      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: { xs: 4, md: 5 },
        alignItems: 'flex-start'
      }}>
        {/* Left Column (Main/Services) */}
        <Box sx={{
          flex: 1,
          width: '100%',
          display: { xs: showQuickAccess ? 'none' : 'block', md: 'block' }
        }}>
          {/* CB Banner - Desktop only (mobile version is inside the header) */}
          <Box
            onClick={() => navigate('/user/chat')}
            sx={{
              display: { xs: 'none', md: 'block' },
              width: '100%',
              height: '160px',
              mb: 4,
              borderRadius: '28px',
              overflow: 'hidden',
              boxShadow: '0 15px 35px rgba(23, 16, 16, 0.12)',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 20px 45px rgba(0,0,0,0.18)' },

            }}
          >
            <img src="/cb.png" alt="BMS Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>

          {/* Active Loans Banner Widget (if user has active loans) */}
          {activeLoansCount > 0 && (
            <Paper
              elevation={0}
              sx={{
                mb: 4,
                p: { xs: 2, sm: 2.5, md: 3 },
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #0a2558 0%, #1e40af 100%)',
                color: 'white',
                boxShadow: '0 10px 30px rgba(10, 37, 88, 0.15)',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: { xs: 44, sm: 52 },
                    height: { xs: 44, sm: 52 },
                    borderRadius: '16px',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFC000',
                    flexShrink: 0,
                  }}
                >
                  <RequestQuoteIcon sx={{ fontSize: { xs: 24, sm: 30 } }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, fontSize: { xs: '0.95rem', sm: '1rem' }, color: '#ffffff !important' }}>
                      Active Loans
                    </Typography>
                    <Chip
                      label={`${activeLoansCount} Active`}
                      size="small"
                      sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 800, fontSize: '0.65rem' }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9) !important', fontWeight: 600, display: 'block', fontSize: { xs: '0.72rem', sm: '0.78rem' } }}>
                    Balance: ₹{totalOutstandingLoan.toLocaleString('en-IN')} | Monthly EMI: ₹{monthlyEmi.toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                onClick={() => navigate('/user/loans')}
                sx={{
                  background: '#ffffff !important',
                  backgroundColor: '#ffffff !important',
                  backgroundImage: 'none !important',
                  color: '#0a2558 !important',
                  fontWeight: 900,
                  borderRadius: '12px',
                  textTransform: 'none',
                  px: 2.5,
                  py: 1,
                  width: { xs: '100%', sm: 'auto' },
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  '&:hover': {
                    background: '#f8fafc !important',
                    backgroundColor: '#f8fafc !important',
                    backgroundImage: 'none !important',
                  },
                }}
              >
                View Loans
              </Button>
            </Paper>
          )}

          {/* Quick Services Grid */}
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5, mb: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#0a2558', letterSpacing: '0.5px', fontSize: { xs: '1.15rem', sm: '1.25rem' } }}>
                QUICK SERVICES
              </Typography>
              <Box
                onClick={() => navigate('/user/chat')}
                sx={{
                  cursor: 'pointer',
                  width: { xs: 58, sm: 72 },
                  height: { xs: 38, sm: 46 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  bgcolor: 'white',
                  border: '1.5px solid rgba(10,37,88,0.1)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
                  transition: 'all 0.25s',
                  '&:hover': { transform: 'scale(1.08)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
                  '&:active': { transform: 'scale(0.95)' }
                }}
              >
                <img src="/cb.png" alt="BMS Chat" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
              </Box>
            </Box>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(4, 1fr)', lg: 'repeat(4, 1fr)', xl: 'repeat(6, 1fr)' },
              gap: { xs: 2, md: 4 }
            }}>
              {servicesGrid.map((item, i) => (
                <Box 
                  key={i} 
                  onClick={() => handleAccountClick(item)}
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
                >
                  <Paper elevation={0} sx={{
                    width: { xs: 54, md: 74 },
                    height: { xs: 54, md: 74 },
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'white',
                    color: item.color,
                    boxShadow: `0 6px 20px ${item.color}15`,
                    '&:hover': { transform: 'translateY(-5px) scale(1.05)', boxShadow: `0 10px 30px ${item.color}25` },
                    transition: 'all 0.3s'
                  }}>
                    {React.cloneElement(item.icon as React.ReactElement, { sx: { fontSize: { xs: 24, md: 32 } } })}
                  </Paper>
                  <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.68rem', textAlign: 'center', color: '#334155', lineHeight: 1.2 }}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Team Performance - In Left Column on Desktop */}
          <Box sx={{ mt: 6, display: { xs: 'none', md: 'block' } }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0a2558', mb: 3 }}>TEAM PERFORMANCE</Typography>
            <Paper elevation={0} sx={{ p: 4, borderRadius: '28px', bgcolor: 'white', border: '1px solid #f1f5f9', boxShadow: '0 15px 35px rgba(0,0,0,0.02)' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Team</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#0a2558', mt: 1 }}>{memberDetails?.total_team || 0}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', borderLeft: '1px solid #f1f5f9' }}>
                  <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Directs</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: '#0a2558', mt: 1 }}>{memberDetails?.direct_referrals?.length || 0}</Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
        {/* Right Column / Mobile Conditional View */}
        <Box sx={{
          width: { xs: '100%', md: '380px', lg: '440px' },
          display: { xs: showQuickAccess ? 'flex' : 'none', md: (isUserActive && isPackageActive) ? 'flex' : 'none' },
          flexDirection: 'column',
          gap: 4,
          position: { md: 'sticky' },
          top: { md: '80px' }
        }}>
          {/* Mobile Only: Quick Access Header */}
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#0a2558', mb: 1, display: { xs: 'block', md: 'none' } }}>
            OVER DRAFT
          </Typography>

          <Box sx={{ flex: 1 }}>
            {quickAccessGroups.map((group, idx) => (
              <Box key={idx} sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0a2558', mb: 2, letterSpacing: '1px' }}>
                  {group.title}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
                  {group.items.map((item, i) => (
                    <Box key={i} onClick={() => navigate(item.route)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
                      <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        bgcolor: 'white',
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 6px 15px rgba(0,0,0,0.04)',
                        border: '1px solid #f1f5f9',
                        '&:hover': { transform: 'scale(1.1)', bgcolor: '#f8fafc' },
                        transition: '0.2s'
                      }}>
                        {item.icon}
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', textAlign: 'center', color: '#475569' }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}

            {/* Team Performance - Mobile Only inside Quick Access */}
            <Box sx={{ mt: 2, display: { xs: 'block', md: 'none' } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0a2558', mb: 2 }}>TEAM PERFORMANCE</Typography>
              <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', bgcolor: 'white', border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>Total Team</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0a2558' }}>{memberDetails?.total_team || 0}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>Directs</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0a2558' }}>{memberDetails?.direct_referrals?.length || 0}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>

          <Box sx={{ width: { xs: '100%', xl: '420px' }, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Paper elevation={0} sx={{
              p: 4,
              borderRadius: '28px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              color: 'white',
              boxShadow: '0 20px 40px rgba(59, 130, 246, 0.25)'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 3 }}>Referral link</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<ShareIcon />}
                  fullWidth
                  sx={{
                    bgcolor: 'white',
                    color: '#1e3a8a',
                    borderRadius: '16px',
                    textTransform: 'none',
                    fontWeight: 900,
                    py: 1.5
                  }}
                >
                  Share Now
                </Button>
                <IconButton
                  onClick={handleCopyReferralLink}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: '16px',
                    width: 56,
                    height: 56
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Box>
            </Paper>

            {/* Wallet Section - Matched to 3rd Drawing */}
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0a2558', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', mb: -2, mt: { xs: 2, md: 3 } }}>
              Deposit-BOND
            </Typography>

            <Paper elevation={0} sx={{ p: 4, borderRadius: '32px', bgcolor: 'white', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', mt: 1 }}>
              <Stack spacing={4}>
                {/* 1st Section: Deposits */}
                <Box sx={{ p: 3, borderRadius: '24px', bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ fontWeight: 800, color: '#475569' }}>MY Deposit</Typography>
                    <Typography sx={{ fontWeight: 900, color: '#0f172a' }}>₹{displayDeposit.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 800, color: '#475569' }}>Total Withdrawal</Typography>
                    <Typography sx={{ fontWeight: 900, color: '#ef4444' }}>₹{Number(walletOverview?.totalWithdrawal || 0).toLocaleString('en-IN')}</Typography>
                  </Box>
                </Box>

                {/* 2nd Section: Wallet Summary breakdown */}
                <Box sx={{ p: 3, borderRadius: '24px', bgcolor: '#f1f5f9', position: 'relative' }}>
                  <Typography variant="caption" sx={{ position: 'absolute', top: -10, left: 20, bgcolor: 'white', px: 1.5, py: 0.2, borderRadius: '10px', border: '1px solid #e2e8f0', fontWeight: 900, color: '#0a2558', fontSize: '0.65rem' }}>
                    WALLET SUMMARY
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#475569' }}>Daily ROI</Typography>
                      <Typography sx={{ fontWeight: 900, color: '#d97706' }}>₹{totalRoiPaidValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#64748b' }}>BMS ROI Benefits</Typography>
                      <Typography sx={{ fontWeight: 900, color: '#10b981' }}>₹{roiLevelBenefits.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#64748b' }}>BMS Level Benefits</Typography>
                      <Typography sx={{ fontWeight: 900, color: '#10b981' }}>₹{Number(walletOverview?.levelBenefits || 0).toLocaleString('en-IN')}</Typography>
                    </Box>
                    {isUserActive && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#64748b' }}>BMS - Wallet</Typography>
                        <Typography sx={{ fontWeight: 900, color: '#3b82f6' }}>₹{displayWallet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>

                {/* 3rd Section: Big Balance — Hidden if Inactive ROI or User */}
                {isUserActive && isPackageActive && (
                  <Box sx={{ textAlign: 'center', pt: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#64748b', letterSpacing: '1px', mb: 1 }}>
                      WALLET BALANCE
                    </Typography>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, p: 2, px: 4, bgcolor: '#0a2558', borderRadius: '20px', color: 'white' }}>
                      <CurrencyRupeeIcon sx={{ fontSize: 28 }} />
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>
                        {Number(walletOverview?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserDashboard;
