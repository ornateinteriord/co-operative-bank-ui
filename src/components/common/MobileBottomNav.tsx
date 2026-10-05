import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useNavigate, useLocation } from 'react-router-dom';

import { useGetMemberDetails } from '../../api/Memeber';
import TokenService from '../../api/token/tokenService';

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = React.useState('');

  const memberId = TokenService.getMemberId();
  const { data: memberDetails } = useGetMemberDetails(memberId);
  const isROIActive = memberDetails?.upgrade_status === 'Active';

  // Sync state with current path
  React.useEffect(() => {
    if (location.pathname.includes('/user/dashboard')) setValue('/user/dashboard');
    else if (location.pathname.includes('/user/passbook')) setValue('/user/passbook');
    else if (location.pathname.includes('/user/wallet')) setValue('/user/wallet');
    else if (location.pathname.includes('/user/chat')) setValue('/user/chat');
    else if (location.pathname.includes('/user/account/profile')) setValue('/user/account/profile');
  }, [location.pathname]);

  if (location.pathname.includes('/user/chat')) return null;

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderTop: '1px solid #e0e0e0',
          boxShadow: '0 -4px 10px rgba(0,0,0,0.05)'
        }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={(_event, newValue) => {
            setValue(newValue);
            navigate(newValue);
          }}
          sx={{
            height: 70,
            '& .MuiBottomNavigationAction-root': {
              color: '#9e9e9e',
              minWidth: 0,
              padding: '6px 0',
            },
            '& .Mui-selected': {
              color: '#0a2558 !important',
              '& .MuiBottomNavigationAction-label': {
                fontWeight: 800,
                fontSize: '0.75rem',
                mt: 0.5
              },
              // The blue rounded square highlight for the icon
              '& .MuiBottomNavigationAction-iconOnly': {
                paddingTop: '16px',
              },
              '& .indicator': {
                backgroundColor: '#0a2558',
                color: 'white',
                borderRadius: '12px',
                padding: '4px',
                width: '40px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 0.5
              }
            }
          }}
        >
          <BottomNavigationAction
            value="/user/dashboard"
            label="Home"
            icon={<Box className={value === "/user/dashboard" ? "indicator" : ""}>{<HomeIcon />}</Box>}
          />
          <BottomNavigationAction
            value="/user/passbook"
            label="Passbook"
            icon={<Box className={value === "/user/passbook" ? "indicator" : ""}>{<MenuBookIcon />}</Box>}
          />
          {isROIActive && (
            <BottomNavigationAction
              value="/user/wallet"
              label="Wallet"
              icon={<Box className={value === "/user/wallet" ? "indicator" : ""}>{<AccountBalanceWalletIcon />}</Box>}
            />
          )}
          <BottomNavigationAction
            value="/user/chat"
            label="Chat"
            icon={<Box className={value === "/user/chat" ? "indicator" : ""}>{<ChatIcon />}</Box>}
          />
          <BottomNavigationAction
            value="/user/account/profile"
            label="Profile"
            icon={<Box className={value === "/user/account/profile" ? "indicator" : ""}>{<PersonIcon />}</Box>}
          />
        </BottomNavigation>
      </Paper>
      {/* Spacer to prevent content from being hidden behind nav — Skip on Chat page */}
      {!location.pathname.includes('/user/chat') && <Box sx={{ height: 64 }} />}
    </Box>
  );
};

export default MobileBottomNav;
