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
import { useGetAgentById } from "../../queries/Agent";

interface NavbarProps {
  shouldHide?: boolean;
  onToggleSidebar?: () => void;
}

const Navbar = ({ shouldHide, onToggleSidebar }: NavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 899px)');
  const { isLoggedIn, userRole } = useAuth();

  const decoded = TokenService.decodeToken() as any;
  const effectiveRole = (userRole || decoded?.role || "").toUpperCase();

  const isAdminRole = effectiveRole === "ADMIN" || effectiveRole === "ADMIN_01";
  const isAgent = effectiveRole === "AGENT";
  const isUser = effectiveRole === "USER";
  const isMemberOrAgent = isUser || isAgent;
  const canToggleSidebar = isAdminRole || isAgent;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const memberId = TokenService.getMemberId();
  const loginId = TokenService.getLoginUserId();

  // Fetch Member Details only if logged-in user is a MEMBER
  const { data: memberDetails } = useGetMemberDetails(isUser ? memberId : null);
  // Fetch Agent Details only if logged-in user is an AGENT
  const { data: agentData } = useGetAgentById(loginId || memberId || "", isAgent);

  // Compute clean display values for Admin, Agent, Member
  let displayName = "";
  let displayRoleLabel = "Member";
  let displayId = "";

  if (isAdminRole) {
    displayRoleLabel = "Admin";
    displayName = decoded?.user_name || decoded?.userId || "admin";
    displayId = decoded?.userId || decoded?.user_name || "admin";
  } else if (isAgent) {
    displayRoleLabel = "Agent";
    displayName = agentData?.data?.name || decoded?.user_name || "Agent";
    displayId = agentData?.data?.agent_id || decoded?.userId || decoded?.memberId || "";
  } else {
    displayRoleLabel = "Member";
    displayName = memberDetails?.Name || decoded?.user_name || "Member";
    displayId = memberDetails?.Member_id || decoded?.memberId || decoded?.userId || "";
  }

  const avatarInitial = (displayName || displayRoleLabel).charAt(0).toUpperCase();

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
              {canToggleSidebar && onToggleSidebar && (
                <IconButton
                  onClick={onToggleSidebar}
                  sx={{
                    color: "white",
                    mr: 0.5,
                    display: { xs: isAdminRole ? 'flex' : 'none', md: 'flex' }
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
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  {avatarInitial}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2, fontSize: '0.85rem' }}>
                    {displayName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.7rem' }}>
                    {displayRoleLabel}{displayId ? ` • ${displayId}` : ''}
                  </Typography>
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
            sx: { minWidth: 200 }
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
              alt={displayName}
              sx={{
                width: 48,
                height: 48,
                mb: 1,
                bgcolor: '#0a2558',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.2rem',
                boxShadow: '0 4px 10px rgba(10,37,88,0.2)'
              }}
            >
              {avatarInitial}
            </Avatar>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0a2558', textAlign: 'center' }}>
              {displayName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, bgcolor: '#f1f5f9', px: 1, py: 0.25, borderRadius: '12px' }}>
              <Typography variant="caption" sx={{ color: '#0a2558', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                {displayRoleLabel}
              </Typography>
              {displayId && (
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                  ({displayId})
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          {/* Profile / Dashboard link depending on role */}
          {isAdminRole ? (
            <MenuItem onClick={() => { handleMenuClose(); navigate(effectiveRole === "ADMIN_01" ? "/admin_01/dashboard" : "/admin/dashboard"); }}>
              <User size={16} style={{ marginRight: "10px", color: "#0a2558" }} />
              Admin Dashboard
            </MenuItem>
          ) : isAgent ? (
            <MenuItem onClick={() => { handleMenuClose(); navigate("/agent/profile"); }}>
              <User size={16} style={{ marginRight: "10px", color: "#0a2558" }} />
              Agent Profile
            </MenuItem>
          ) : (
            <MenuItem onClick={() => { handleMenuClose(); navigate("/user/account/profile"); }}>
              <User size={16} style={{ marginRight: "10px", color: "#0a2558" }} />
              My Profile
            </MenuItem>
          )}

          {/* Role-specific second item */}
          {isUser && (
            <MenuItem onClick={() => { handleMenuClose(); navigate("/user/passbook"); }}>
              <BookOpen size={16} style={{ marginRight: "10px", color: "#0a2558" }} />
              Passbook
            </MenuItem>
          )}

          {isAdminRole && (
            <MenuItem onClick={() => { handleMenuClose(); navigate("/admin_01/passbook"); }}>
              <BookOpen size={16} style={{ marginRight: "10px", color: "#0a2558" }} />
              Passbook Printing
            </MenuItem>
          )}

          {isAgent && (
            <MenuItem onClick={() => { handleMenuClose(); navigate("/agent/dashboard"); }}>
              <BookOpen size={16} style={{ marginRight: "10px", color: "#0a2558" }} />
              Agent Dashboard
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
