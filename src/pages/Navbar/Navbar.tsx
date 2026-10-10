import {
  ChevronDown,
  LogOutIcon,
  Menu as MenuIcon,
  Settings,
  User,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import "./navbar.scss";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { IconButton } from "@mui/material";
import useAuth from "../../hooks/use-auth";
import TokenService from "../../api/token/tokenService";
import { useState } from "react";
import { useGetMemberDetails } from "../../api/Memeber";

interface NavbarProps {
  shouldHide?: boolean;
  onToggleSidebar?: () => void;
}

const Navbar = ({ shouldHide, onToggleSidebar }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 899px)');
  const { isLoggedIn, userRole } = useAuth();
  const isAgent = userRole === "AGENT";
  const isUser = userRole === "USER";
  const isMemberOrAgent = isUser || isAgent;
  const isAdmin = userRole === "ADMIN" || userRole === "ADMIN_01" || userRole === "AGENT";
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const userId = TokenService.getMemberId();
  const { data: memberDetails } = useGetMemberDetails(userId);

  if (shouldHide) return null;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    navigate("/");
    TokenService.removeToken();
    window.dispatchEvent(new Event("storage"));
    setAnchorEl(null);
  };

  const isRootDashboard =
    location.pathname === "/user/dashboard" ||
    location.pathname === "/agent/dashboard" ||
    location.pathname === "/";

  const getMobileTitle = (path: string) => {
    if (path.includes('/passbook')) return 'Passbook';
    if (path.includes('/wallet')) return isAgent ? 'Agent Wallet' : 'Wallet';
    if (path.includes('/collections')) return 'Collections';
    if (path.includes('/add-new')) return 'Open Account';
    if (path.includes('/report')) return 'Reports';
    if (path.includes('/account/profile') || path.includes('/agent/profile')) return 'Profile';
    if (path.includes('/account/kyc')) return 'KYC Documents';
    if (path.includes('/account/change-password')) return 'Change Password';
    if (path.includes('/loans')) return 'Loans';
    if (path.includes('/team')) return 'Team';
    if (path.includes('/transactions')) return 'Transactions';
    if (path.includes('/addon-packages')) return 'Deposit Bonds';
    if (path.includes('/earnings')) return 'Benefits';
    if (path.includes('/overdraft')) return 'Overdraft';
    if (path.includes('/account-opening')) return 'Open Account';
    if (path.includes('/chat')) return 'Support';
    return 'Bank';
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          borderRadius: '0 !important',
          borderTopLeftRadius: '0 !important',
          borderTopRightRadius: '0 !important',
          borderBottomLeftRadius: '0 !important',
          borderBottomRightRadius: '0 !important',
          background: "#0a2558",
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{
          height: { xs: 56, md: 64 },
          px: { xs: 1.5, sm: 2, md: 3 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Left section */}
          {isMobile && isMemberOrAgent ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isRootDashboard ? (
                <>
                  <IconButton
                    onClick={() => {
                      if (window.history.length > 1) {
                        navigate(-1);
                      } else {
                        navigate(isAgent ? "/agent/dashboard" : "/user/dashboard");
                      }
                    }}
                    sx={{
                      color: "white",
                      p: 0.75,
                    }}
                  >
                    <ArrowLeft size={20} />
                  </IconButton>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: 'white',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '220px'
                    }}
                  >
                    {getMobileTitle(location.pathname)}
                  </Typography>
                </>
              ) : (
                <Box
                  onClick={() => navigate(isAgent ? "/agent/dashboard" : "/user/dashboard")}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                >
                  <AccountBalanceIcon sx={{ color: 'white', fontSize: 22 }} />
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      color: 'white',
                    }}
                  >
                    Udupi Co-operative Bank
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isAdmin && onToggleSidebar && (
                <IconButton
                  onClick={onToggleSidebar}
                  sx={{
                    color: "white",
                    mr: 0.5,
                    display: { xs: (userRole === "ADMIN" || userRole === "ADMIN_01") ? 'flex' : 'none', md: 'flex' }
                  }}
                >
                  <MenuIcon size={22} />
                </IconButton>
              )}

              {/* Simple Bank Title */}
              <Box
                onClick={() => navigate("/")}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer' }}
              >
                <AccountBalanceIcon sx={{ color: 'white', fontSize: 26 }} />
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                    color: '#ffffff',
                    letterSpacing: '0.3px',
                  }}
                >
                  Udupi Co-operative Bank
                </Typography>
              </Box>
            </Box>
          )}

          {/* Right section: Profile Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isLoggedIn && (
              <Box
                onClick={handleMenuOpen}
                sx={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1,
                  py: 0.5,
                  borderRadius: '8px',
                  transition: 'background 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: '#ffffff',
                    color: '#0a2558',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                  }}
                >
                  {memberDetails?.Name?.charAt(0).toUpperCase() || (userRole === "AGENT" ? 'A' : userRole === "ADMIN" ? 'A' : 'U')}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2, fontSize: '0.85rem' }}>
                    {memberDetails?.Name || (userRole === "AGENT" ? "Agent" : userRole === "ADMIN" ? "Admin" : "Member")}
                  </Typography>
                  {memberDetails?.Member_id && (
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>
                      ID: {memberDetails.Member_id}
                    </Typography>
                  )}
                </Box>
                <ChevronDown size={16} color="white" style={{ opacity: 0.8 }} />
              </Box>
            )}
          </Box>
        </Toolbar>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            className: Boolean(anchorEl) ? "custom-menu open" : "custom-menu",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 2,
              px: 2,
            }}
          >
            <Avatar
              alt="User"
              sx={{
                width: 48,
                height: 48,
                mb: 1,
                bgcolor: '#0a2558',
                color: '#ffffff',
                fontWeight: 700,
              }}
            >
              {memberDetails?.Name
                ? memberDetails.Name.charAt(0).toUpperCase()
                : (userRole === "AGENT" ? 'A' : userRole === "ADMIN" ? 'A' : 'U')}
            </Avatar>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0a2558' }}>
              {memberDetails?.Name || (userRole === "AGENT" ? "Agent" : userRole === "ADMIN" ? "Admin" : "Member")}
            </Typography>
            {memberDetails?.Member_id && (
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                ID: {memberDetails.Member_id}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <MenuItem onClick={() => { handleMenuClose(); if (userRole === "AGENT") { navigate("/agent/profile"); } else if (userRole === "ADMIN" || userRole === "ADMIN_01") { navigate("/admin/dashboard"); } else { navigate("/user/account/profile"); } }}>
            <User size={16} style={{ marginRight: "10px", color: "#0a2558" }} />
            My Profile
          </MenuItem>

          {userRole === "USER" && (
            <MenuItem onClick={() => { handleMenuClose(); navigate("/user/passbook"); }}>
              <BookOpen size={16} style={{ marginRight: "10px", color: "#0a2558" }} />
              Passbook
            </MenuItem>
          )}

          {(userRole === "ADMIN" || userRole === "ADMIN_01") && (
            <MenuItem onClick={() => { handleMenuClose(); navigate("/admin_01/passbook"); }}>
              <BookOpen size={16} style={{ marginRight: "10px", color: "#0a2558" }} />
              Passbook Printing
            </MenuItem>
          )}

          <MenuItem
            onClick={() => {
              navigate("/admin/update-password");
              setAnchorEl(null);
            }}
          >
            <Settings size={16} style={{ marginRight: "10px", color: "#0a2558" }} />
            Change Password
          </MenuItem>

          <Divider sx={{ my: 0.5 }} />

          <MenuItem onClick={handleLogout} sx={{ color: "#dc2626", fontWeight: 600 }}>
            <LogOutIcon
              size={16}
              style={{ marginRight: "10px", color: "#dc2626" }}
            />
            Logout
          </MenuItem>
        </Menu>
      </AppBar>
    </>
  );
};

export default Navbar;
