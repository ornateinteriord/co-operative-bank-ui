import {
  ChevronDown,
  Lock,
  LogOutIcon,
  Menu as MenuIcon,
  Settings,
  User,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
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
  Chip,
  useMediaQuery,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { IconButton } from "@mui/material";
import useAuth from "../../hooks/use-auth";
import TokenService from "../../api/token/tokenService";
import { deepOrange } from "@mui/material/colors";
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

  // Always call hooks before any early return (Rules of Hooks)
  const userId = TokenService.getMemberId();
  const { data: memberDetails } = useGetMemberDetails(userId);

  // If we should hide the navbar (on public/auth pages), return null
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
    if (path.includes('/passbook')) return 'My Passbook';
    if (path.includes('/wallet')) return isAgent ? 'Agent Wallet' : 'My Wallet';
    if (path.includes('/collections')) return 'Daily Collections';
    if (path.includes('/add-new')) return 'Account Opening';
    if (path.includes('/report')) return 'Collection Reports';
    if (path.includes('/account/profile') || path.includes('/agent/profile')) return 'Profile';
    if (path.includes('/account/kyc')) return 'KYC Documents';
    if (path.includes('/account/change-password')) return 'Change Password';
    if (path.includes('/loans')) return 'Loans & Advances';
    if (path.includes('/team')) return 'My Team Network';
    if (path.includes('/transactions')) return 'Transactions';
    if (path.includes('/addon-packages')) return 'Deposit Bonds';
    if (path.includes('/earnings')) return 'ROI & Benefits';
    if (path.includes('/overdraft')) return 'Overdraft';
    if (path.includes('/account-opening')) return 'Open Account';
    if (path.includes('/chat')) return 'Live Support';
    return 'BMS';
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: "#081b42", // Darkened version of #0D2B68
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
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
          {/* Left section: Native mobile header vs desktop header */}
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
                      bgcolor: "rgba(255,255,255,0.12)",
                      borderRadius: "12px",
                      "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                    }}
                  >
                    <ArrowLeft size={18} />
                  </IconButton>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      color: 'white',
                      letterSpacing: '0.2px',
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
                <>
                  <Typography
                    variant="h5"
                    onClick={() => navigate(isAgent ? "/agent/dashboard" : "/user/dashboard")}
                    sx={{
                      fontWeight: 950,
                      fontSize: '1.4rem',
                      cursor: "pointer",
                      letterSpacing: '1.5px',
                      color: 'white',
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    BMS
                  </Typography>
                </>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isAdmin && onToggleSidebar && (
                <IconButton
                  onClick={onToggleSidebar}
                  sx={{
                    color: "white",
                    mr: 1,
                    display: { xs: (userRole === "ADMIN" || userRole === "ADMIN_01") ? 'flex' : 'none', md: 'flex' }
                  }}
                >
                  <MenuIcon size={24} />
                </IconButton>
              )}
              <Typography
                variant="h4"
                onClick={() => navigate("/")}
                sx={{
                  fontWeight: 950,
                  fontSize: { xs: '1.4rem', md: '1.85rem' },
                  cursor: "pointer",
                  letterSpacing: '1.5px',
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                BMS
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            {isLoggedIn && (
              <Box
                onClick={handleMenuOpen}
                sx={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  padding: '4px 8px',
                  borderRadius: '12px',
                  transition: 'background 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 32, md: 38 },
                    height: { xs: 32, md: 38 },
                    bgcolor: '#FFC000',
                    color: '#0a2558',
                    fontWeight: 900,
                    fontSize: { xs: '0.85rem', md: '1rem' },
                    border: '2px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  {memberDetails?.Name?.charAt(0).toUpperCase() || (userRole === "AGENT" ? 'A' : userRole === "ADMIN" ? 'A' : 'U')}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 800, lineHeight: 1.1 }}>
                    {memberDetails?.Name || (userRole === "AGENT" ? "Agent" : userRole === "ADMIN" ? "Admin" : "Member")}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.65rem' }}>
                    {memberDetails?.Member_id || ""}
                  </Typography>
                </Box>
                <ChevronDown size={18} color="white" style={{ opacity: 0.8 }} />
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "10px 0",
            }}
          >
            <Avatar
              alt="User"
              sx={{
                width: 64,
                height: 64,
                marginBottom: "8px",
                background: deepOrange[500],
                border: '2px solid #0a2558'
              }}
            >
              {memberDetails?.Name
                ? memberDetails.Name.charAt(0).toUpperCase()
                : (userRole === "AGENT" ? 'A' : userRole === "ADMIN" ? 'A' : 'U')}
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#0a2558' }}>
              {memberDetails?.Name || (userRole === "AGENT" ? "Agent" : userRole === "ADMIN" ? "Admin" : "Member")}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
              ID: {memberDetails?.Member_id || ""}
            </Typography>
          </div>

          <Divider />

          <MenuItem onClick={() => { handleMenuClose(); if (userRole === "AGENT") { navigate("/agent/profile"); } else if (userRole === "ADMIN" || userRole === "ADMIN_01") { navigate("/admin/dashboard"); } else { navigate("/user/account/profile"); } }}>
            <User size={18} style={{ marginRight: "8px" }} />
            My Profile
          </MenuItem>

          {userRole === "USER" && (
            <MenuItem onClick={() => { handleMenuClose(); navigate("/user/passbook"); }}>
              <BookOpen size={18} style={{ marginRight: "8px", color: "#0a2558" }} />
              My Passbook
            </MenuItem>
          )}

          {(userRole === "ADMIN" || userRole === "ADMIN_01") && (
            <MenuItem onClick={() => { handleMenuClose(); navigate("/admin_01/passbook"); }}>
              <BookOpen size={18} style={{ marginRight: "8px", color: "#0a2558" }} />
              Passbook Printing
            </MenuItem>
          )}

          <MenuItem
            onClick={() => {
              navigate("/admin/update-password");
              setAnchorEl(null);
            }}
          >
            <Settings size={18} style={{ marginRight: "8px" }} />
            Account Settings
          </MenuItem>

          <Divider />

          <div className="admin-panel-menuitems">
            <MenuItem onClick={handleMenuClose} sx={{ display: "flex" }}>
              <Lock size={17} style={{ marginRight: "4px", color: "#007bff" }} />
              Lock
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ display: "flex" }}>
              <LogOutIcon
                size={18}
                style={{ marginRight: "4px", color: "red" }}
              />
              Logout
            </MenuItem>
          </div>
        </Menu>
      </AppBar >
    </>
  );
};

export default Navbar;
