import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Drawer,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ChatIcon from '@mui/icons-material/Chat';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GridViewIcon from '@mui/icons-material/GridView';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import GroupsIcon from '@mui/icons-material/Groups';
import LockIcon from '@mui/icons-material/Lock';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SpeedIcon from '@mui/icons-material/Speed';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import HubIcon from '@mui/icons-material/Hub';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';

import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/use-auth';
import TokenService from '../../api/token/tokenService';
import { useGetMemberDetails } from '../../api/Memeber';

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, userRole } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isAgent = userRole === 'AGENT';
  const isUser = userRole === 'USER';

  const memberId = TokenService.getMemberId();
  const { data: memberDetails } = useGetMemberDetails(memberId);

  // Close sheet on route change
  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (sheetOpen) {
      const origHtmlOverflow = document.documentElement.style.overflow;
      const origBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = origHtmlOverflow;
        document.body.style.overflow = origBodyOverflow;
      };
    }
  }, [sheetOpen]);

  // If not logged in, or not user/agent, or on chat page, hide bottom nav
  if (!isLoggedIn || (!isUser && !isAgent)) return null;
  if (location.pathname.includes('/user/chat')) return null;

  const handleLogout = () => {
    TokenService.removeToken();
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  // Determine current active tab
  const getActiveTab = () => {
    const path = location.pathname;
    if (isAgent) {
      if (path === '/agent/dashboard') return 'home';
      if (path === '/agent/collections') return 'collections';
      if (path === '/agent/add-new') return 'add-new';
      if (path === '/agent/report') return 'reports';
      return 'menu';
    } else {
      if (path === '/user/dashboard') return 'home';
      if (path === '/user/passbook') return 'passbook';
      if (path === '/user/wallet') return 'wallet';
      if (path === '/user/chat') return 'chat';
      return 'services';
    }
  };

  const activeTab = getActiveTab();

  interface BottomTabItem {
    id: string;
    label: string;
    icon: React.ReactElement;
    path?: string;
    action?: () => void;
    isSpecial?: boolean;
  }

  // Agent Bottom Tabs
  const agentTabs: BottomTabItem[] = [
    { id: 'home', label: 'Home', icon: <HomeIcon />, path: '/agent/dashboard' },
    { id: 'collections', label: 'Collections', icon: <ReceiptLongIcon />, path: '/agent/collections' },
    { id: 'add-new', label: 'New A/C', icon: <AddCircleIcon sx={{ fontSize: 32 }} />, path: '/agent/add-new', isSpecial: true },
    { id: 'reports', label: 'Reports', icon: <AssessmentIcon />, path: '/agent/report' },
    { id: 'menu', label: 'Menu', icon: <GridViewIcon />, action: () => setSheetOpen(true) },
  ];

  // User Bottom Tabs
  const userTabs: BottomTabItem[] = [
    { id: 'home', label: 'Home', icon: <HomeIcon />, path: '/user/dashboard' },
    { id: 'passbook', label: 'Passbook', icon: <MenuBookIcon />, path: '/user/passbook' },
    { id: 'wallet', label: 'Wallet', icon: <AccountBalanceWalletIcon />, path: '/user/wallet' },
    { id: 'chat', label: 'Support', icon: <ChatIcon />, path: '/user/chat' },
    { id: 'services', label: 'Services', icon: <GridViewIcon />, action: () => setSheetOpen(true) },
  ];

  const currentTabs = isAgent ? agentTabs : userTabs;

  return (
    <>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 -4px 25px rgba(10, 37, 88, 0.08)',
            px: 1,
            py: 0.5,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              height: 64,
            }}
          >
            {currentTabs.map((tab) => {
              const isActive = activeTab === tab.id;

              if (tab.isSpecial) {
                return (
                  <Box
                    key={tab.id}
                    onClick={() => {
                      if (tab.action) tab.action();
                      else if (tab.path) navigate(tab.path);
                    }}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      top: -12,
                      px: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: '26px',
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 6px 18px rgba(59, 130, 246, 0.45)',
                        border: '3px solid white',
                        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        '&:active': { transform: 'scale(0.92)' },
                      }}
                    >
                      {tab.icon}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        color: '#1e3a8a',
                        mt: 0.3,
                      }}
                    >
                      {tab.label}
                    </Typography>
                  </Box>
                );
              }

              return (
                <Box
                  key={tab.id}
                  onClick={() => {
                    if (tab.action) tab.action();
                    else if (tab.path) navigate(tab.path);
                  }}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    py: 0.5,
                    transition: 'all 0.2s',
                    '&:active': { transform: 'scale(0.92)' },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 2,
                      py: 0.4,
                      borderRadius: '16px',
                      bgcolor: isActive ? 'rgba(10, 37, 88, 0.1)' : 'transparent',
                      color: isActive ? '#0a2558' : '#64748b',
                      transition: 'all 0.25s',
                    }}
                  >
                    {React.cloneElement(tab.icon as React.ReactElement, {
                      sx: {
                        fontSize: 22,
                        color: isActive ? '#0a2558' : '#64748b',
                        transform: isActive ? 'scale(1.08)' : 'scale(1)',
                        transition: 'transform 0.2s',
                      },
                    })}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: isActive ? 900 : 700,
                      fontSize: '0.68rem',
                      color: isActive ? '#0a2558' : '#64748b',
                      mt: 0.2,
                      letterSpacing: '-0.2px',
                    }}
                  >
                    {tab.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Paper>
      </Box>

      {/* ── NATIVE MOBILE APP SERVICES BOTTOM SHEET ── */}
      <Drawer
        anchor="bottom"
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            maxHeight: '85vh',
            bgcolor: '#ffffff',
            boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden !important',
            '&::-webkit-scrollbar': { display: 'none !important', width: '0 !important' },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          },
        }}
      >
        <Box
          sx={{
            pb: 5,
            pt: 1.5,
            px: 2.5,
            overflowY: 'auto',
            maxHeight: '85vh',
            '&::-webkit-scrollbar': { display: 'none !important', width: '0 !important' },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {/* iOS / Android Pull Indicator */}
          <Box
            sx={{
              width: 42,
              height: 4.5,
              bgcolor: '#cbd5e1',
              borderRadius: 3,
              mx: 'auto',
              mb: 2,
            }}
          />

          {/* Header Banner */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: '#0a2558',
                  color: '#FFC000',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  boxShadow: '0 4px 12px rgba(10, 37, 88, 0.2)',
                }}
              >
                {memberDetails?.Name?.[0] || (isAgent ? 'A' : 'U')}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0a2558', lineHeight: 1.2 }}>
                  {memberDetails?.Name || (isAgent ? 'Authorized Agent' : 'Valued Member')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.3 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800 }}>
                    ID: {memberDetails?.Member_id || memberId || ''}
                  </Typography>
                  <Chip
                    label={isAgent ? 'Agent' : 'Member'}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      bgcolor: isAgent ? '#e0e7ff' : '#ecfdf5',
                      color: isAgent ? '#3730a3' : '#065f46',
                    }}
                  />
                </Box>
              </Box>
            </Box>
            <IconButton onClick={() => setSheetOpen(false)} sx={{ color: '#64748b', bgcolor: '#f1f5f9' }}>
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          {/* Categorized Options for USER (Member) */}
          {isUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Group 1: Banking & Passbook */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Banking & Passbook
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mt: 1.2 }}>
                  {[
                    { label: 'My Passbook', icon: <MenuBookIcon />, color: '#0a2558', path: '/user/passbook' },
                    { label: 'SB Account', icon: <AccountBalanceIcon />, color: '#3b82f6', path: '/user/account-opening/sb' },
                    { label: 'RD Account', icon: <NoteAddIcon />, color: '#10b981', path: '/user/account-opening/rd' },
                    { label: 'FD Bond', icon: <NoteAddIcon />, color: '#f59e0b', path: '/user/addon-packages?view=fd' },
                    { label: 'Overdraft', icon: <SpeedIcon />, color: '#6366f1', path: '/user/overdraft' },
                    { label: 'Wallet', icon: <AccountBalanceWalletIcon />, color: '#059669', path: '/user/wallet' },
                    { label: 'Transactions', icon: <ReceiptLongIcon />, color: '#2563eb', path: '/user/transactions' },
                    { label: 'Customer Care', icon: <ChatIcon />, color: '#0284c7', path: '/user/chat' },
                  ].map((item, i) => (
                    <Box
                      key={i}
                      onClick={() => navigate(item.path)}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.8,
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: '16px',
                        '&:active': { bgcolor: '#f1f5f9', transform: 'scale(0.95)' },
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: `${item.color}15`,
                          color: item.color,
                        }}
                      >
                        {React.cloneElement(item.icon, { sx: { fontSize: 24 } })}
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.68rem', textAlign: 'center', color: '#1e293b', lineHeight: 1.2 }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Group 2: Loans & Advances */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Loans & Advances
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mt: 1.2 }}>
                  {[
                    { label: 'My Loans', icon: <RequestQuoteIcon />, color: '#1e40af', path: '/user/loans' },
                    { label: 'Gold Loan', icon: <MonetizationOnIcon />, color: '#d97706', path: '/user/loans?type=Gold' },
                    { label: 'Pigmi Loan', icon: <MonetizationOnIcon />, color: '#ea580c', path: '/user/loans?type=Pigmi' },
                    { label: 'Loan History', icon: <ReceiptLongIcon />, color: '#3b82f6', path: '/user/loantransactions' },
                  ].map((item, i) => (
                    <Box
                      key={i}
                      onClick={() => navigate(item.path)}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.8,
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: '16px',
                        '&:active': { bgcolor: '#f1f5f9', transform: 'scale(0.95)' },
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: `${item.color}15`,
                          color: item.color,
                        }}
                      >
                        {React.cloneElement(item.icon, { sx: { fontSize: 24 } })}
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.68rem', textAlign: 'center', color: '#1e293b', lineHeight: 1.2 }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Group 3: Network & Community */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Network & Team
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mt: 1.2 }}>
                  {[
                    { label: 'My Team', icon: <GroupsIcon />, color: '#3b82f6', path: '/user/team' },
                    { label: 'Directs', icon: <PersonAddAltIcon />, color: '#6366f1', path: '/user/team/direct' },
                    { label: 'Tree View', icon: <HubIcon />, color: '#ef4444', path: '/user/team/tree' },
                    { label: 'New Register', icon: <PersonAddAltIcon />, color: '#10b981', path: '/user/team/new-register' },
                  ].map((item, i) => (
                    <Box
                      key={i}
                      onClick={() => navigate(item.path)}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.8,
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: '16px',
                        '&:active': { bgcolor: '#f1f5f9', transform: 'scale(0.95)' },
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: `${item.color}15`,
                          color: item.color,
                        }}
                      >
                        {React.cloneElement(item.icon, { sx: { fontSize: 24 } })}
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.68rem', textAlign: 'center', color: '#1e293b', lineHeight: 1.2 }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Group 4: Account & Security */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Account & Settings
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mt: 1.2 }}>
                  {[
                    { label: 'My Profile', icon: <PersonIcon />, color: '#0a2558', path: '/user/account/profile' },
                    { label: 'KYC Status', icon: <VerifiedUserIcon />, color: '#10b981', path: '/user/account/kyc' },
                    { label: 'Password', icon: <LockIcon />, color: '#f59e0b', path: '/user/account/change-password' },
                  ].map((item, i) => (
                    <Box
                      key={i}
                      onClick={() => navigate(item.path)}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.8,
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: '16px',
                        '&:active': { bgcolor: '#f1f5f9', transform: 'scale(0.95)' },
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: `${item.color}15`,
                          color: item.color,
                        }}
                      >
                        {React.cloneElement(item.icon, { sx: { fontSize: 24 } })}
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.68rem', textAlign: 'center', color: '#1e293b', lineHeight: 1.2 }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {/* Categorized Options for AGENT */}
          {isAgent && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Field Operations */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 900, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  Agent Operations
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mt: 1.2 }}>
                  {[
                    { label: 'Dashboard', icon: <HomeIcon />, color: '#0a2558', path: '/agent/dashboard' },
                    { label: 'Collections', icon: <ReceiptLongIcon />, color: '#10b981', path: '/agent/collections' },
                    { label: 'Open A/C', icon: <AddCircleIcon />, color: '#3b82f6', path: '/agent/add-new' },
                    { label: 'Reports', icon: <AssessmentIcon />, color: '#f59e0b', path: '/agent/report' },
                    { label: 'My Wallet', icon: <AccountBalanceWalletIcon />, color: '#8b5cf6', path: '/agent/wallet' },
                    { label: 'My Profile', icon: <PersonIcon />, color: '#6366f1', path: '/agent/profile' },
                  ].map((item, i) => (
                    <Box
                      key={i}
                      onClick={() => navigate(item.path)}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.8,
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: '16px',
                        '&:active': { bgcolor: '#f1f5f9', transform: 'scale(0.95)' },
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: `${item.color}15`,
                          color: item.color,
                        }}
                      >
                        {React.cloneElement(item.icon, { sx: { fontSize: 24 } })}
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.68rem', textAlign: 'center', color: '#1e293b', lineHeight: 1.2 }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Logout Button */}
          <Box
            onClick={handleLogout}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              py: 1.5,
              borderRadius: '16px',
              bgcolor: '#fee2e2',
              color: '#dc2626',
              cursor: 'pointer',
              fontWeight: 900,
              fontSize: '0.9rem',
              '&:active': { bgcolor: '#fecaca', transform: 'scale(0.98)' },
              transition: 'all 0.2s',
            }}
          >
            <LogoutIcon sx={{ fontSize: 20 }} />
            <span>Log Out</span>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default MobileBottomNav;
