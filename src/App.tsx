import { Suspense, lazy, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "./App.css";
import "./index.css";
import { CircularProgress, Box, Typography } from "@mui/material";

import Members, {
  ActiveMembers,
  InActiveMembers,
  PendingMembers,
  PermissionsMembers,
} from "./pages/Admin-Pages/Members/Members";
import {
  GeneratePackages,
  PackageHistory,
  PackageRequests,
  UnusedPackages,
  UsedPackages,
} from "./pages/Admin-Pages/Packages/Packages";
import KYCApproval from "./pages/Admin-Pages/KYCApproval/KYCApproval";
import ProtectedRoute from "./routeProtecter/RouteProtecter";
import useAuth from "./hooks/use-auth";
import PublicRoute from "./routeProtecter/PublicRoutes";
import UserProvider from "./context/user/userContextProvider";
import MembersUpdateForm from "./pages/Admin-Pages/UpdateForms";
import ChatNotificationListener from "./components/Chat/ChatNotificationListener";
import MobileBottomNav from "./components/common/MobileBottomNav";






// public pages
// const Home = lazy(() => import("./pages/Home/Home"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const RecoverPassword = lazy(() => import("./pages/Auth/RecoverPassword"))
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"))
const Impersonate = lazy(() => import("./pages/Auth/Impersonate"));
const Navbar = lazy(() => import("./pages/Navbar/Navbar"));
const Sidebar = lazy(() => import("./pages/Sidebar/Sidebar"));
const NotFound = lazy(() => import("./pages/not-found/NotFound"));
const Footer = lazy(() => import("./components/Footer/Footer"));
const About = lazy(() => import("./pages/About/About"));
const Contact = lazy(() => import("./pages/Contact/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms/Terms"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy/RefundPolicy"));

// admin pages
const UpdatePassword = lazy(() => import("./pages/Admin-Pages/admin-panel/UpdatePassword"));
const AdminDashboard = lazy(
  () => import("./pages/Admin-Pages/AdminDashboard/Dashboard")
);
const AdminCashBack = lazy(
  () => import("./pages/Admin-Pages/Incomes/CashBack")
);
const AdminDailyBenifitsPayouts = lazy(
  () => import("./pages/Admin-Pages/Incomes/DailyBenifitsPayouts")
);
const AdminLevelBenifits = lazy(
  () => import("./pages/Admin-Pages/Incomes/LevelBenifits")
);
const AdminROIBenefits = lazy(
  () => import("./pages/Admin-Pages/Incomes/ROIBenifits")
);

const AdminPayout = lazy(() => import("./pages/Admin-Pages/Payout/Payout"));

const AdminTransactions = lazy(
  () => import("./pages/Admin-Pages/Transactions/Transactions")
);
const AdminSMSTransactions = lazy(
  () => import("./pages/Admin-Pages/Transactions/SMS-Transactions")
);
const AdminSupportTickets = lazy(
  () => import("./pages/Admin-Pages/SupportTicket/SupportTickets")
);
const AdminNews = lazy(() => import("./pages/Admin-Pages/News/News"));
const AdminHolidays = lazy(
  () => import("./pages/Admin-Pages/Holidays/Holidays")
);
const WithdrawPending = lazy(() => import("./pages/Admin-Pages/WithdrawPending/WithdrawPending"));
// const Activate = lazy(() => import("./pages/Admin-Pages/Activate/Activate"));
// const ActivatePackage = lazy(() => import("./pages/Admin-Pages/activatePackage/ActivatePackage"));

const AdminAddOnRequests = lazy(() => import("./pages/Admin-Pages/Packages/AdminAddOnRequests"));
const AdminChat = lazy(() => import("./pages/Admin-Pages/AdminChat/AdminChat"));

// Admin_01 Pages
const Admin01Dashboard = lazy(() => import("./pages/Admin-Pages/Admin01Dashboard/Dashboard"));
const Admin01Members = lazy(() => import("./pages/Administration/Members"));
const Admin01Interests = lazy(() => import("./pages/Administration/Interests"));
const Admin01Branches = lazy(() => import("./pages/Administration/Branches"));
const Admin01Shares = lazy(() => import("./pages/Administration/Shares"));

// Agent Pages
const AgentDashboard = lazy(() => import("./pages/Agent/AgentDashboard"));
const AgentProfile = lazy(() => import("./pages/Agent/Profile"));
const AgentCollections = lazy(() => import("./pages/Agent/Collections"));
const AgentAddNew = lazy(() => import("./pages/Agent/AddNew"));
const AgentReport = lazy(() => import("./pages/Agent/Report"));

// Admin Banking
const BankingAgents = lazy(() => import("./pages/Administration/Agents"));
const AdminReceipts = lazy(() => import("./pages/Admin-Pages/Banking/Receipts"));
const AdminPayments = lazy(() => import("./pages/Admin-Pages/Banking/Payments"));
const AdminCashTransaction = lazy(() => import("./pages/Admin-Pages/Banking/CashTransaction"));
const AdminContra = lazy(() => import("./pages/Admin-Pages/Banking/Contra"));
const AdminJournal = lazy(() => import("./pages/Admin-Pages/Banking/JournalEntries"));
const AdminStandingInstruction = lazy(() => import("./pages/Admin-Pages/Banking/StandingInstruction"));
const AdminPayDemand = lazy(() => import("./pages/Admin-Pages/Banking/PayDemand"));
const AdminDDCreations = lazy(() => import("./pages/Admin-Pages/Banking/DDCreations"));
const DepositCalculator = lazy(() => import("./pages/Admin-Pages/Banking/Calculators/DepositCalculator"));
const LoanMasterPage = lazy(() => import("./pages/Admin-Pages/Loan/LoanMasterPage"));
const AgentAssignment = lazy(() => import("./pages/Admin-Pages/AgentAssignment/AgentAssignment"));
const AdminWithdrawalRequests = lazy(() => import("./pages/Admin-Pages/Withdrawal/WithdrawalRequests"));

import {
  PersonalLoanOpening, PersonalLoanViewAll, PersonalLoanClose,
  MortgageLoanOpening, MortgageLoanViewAll, MortgageLoanClose,
  GoldLoanOpening, GoldLoanViewAll, GoldLoanClose,
  BusinessLoanOpening, BusinessLoanViewAll, BusinessLoanClose,
  VehicleLoanOpening, VehicleLoanViewAll, VehicleLoanClose,
  EducationLoanOpening, EducationLoanViewAll, EducationLoanClose,
  AgricultureLoanOpening, AgricultureLoanViewAll, AgricultureLoanClose,
  PigmiLoanOpening, PigmiLoanViewAll, PigmiLoanClose,
  PigmiGoldLoanOpening, PigmiGoldLoanViewAll, PigmiGoldLoanClose,
} from "./pages/Admin-Pages/Loan";

const SBOpening = lazy(() => import("./pages/Admin-Pages/AccountForm/SBOpening"));
const CAOpening = lazy(() => import("./pages/Admin-Pages/AccountForm/CAOpening"));
const SBDetails = lazy(() => import("./pages/Admin-Pages/AccountDetails/SBDetails"));
const CADetails = lazy(() => import("./pages/Admin-Pages/AccountDetails/CADetails"));
const CloseSBTable = lazy(() => import("./pages/Admin-Pages/AccountClose/CloseSBTable"));
const CloseCATable = lazy(() => import("./pages/Admin-Pages/AccountClose/CloseCATable"));
const CloseLoanTable = lazy(() => import("./pages/Admin-Pages/AccountClose/CloseLoanTable"));
const CloseODTable = lazy(() => import("./pages/Admin-Pages/AccountClose/CloseODTable"));

const RDViewAll = lazy(() => import("./pages/Admin-Pages/Banking/RD/RDViewAll"));
const FDViewAll = lazy(() => import("./pages/Admin-Pages/Banking/FD/FDViewAll"));
const PigmyViewAll = lazy(() => import("./pages/Admin-Pages/Banking/PIGMY/PigmyViewAll"));
const MISViewAll = lazy(() => import("./pages/Admin-Pages/Banking/MIS/MISViewAll"));

const RDOpening = lazy(() => import("./pages/Admin-Pages/Banking/RD/RDOpening"));
const FDOpening = lazy(() => import("./pages/Admin-Pages/Banking/FD/FDOpening"));
const PigmyOpening = lazy(() => import("./pages/Admin-Pages/Banking/PIGMY/PigmyOpening"));
const MISOpening = lazy(() => import("./pages/Admin-Pages/Banking/MIS/MISOpening"));

const RDPreMaturity = lazy(() => import("./pages/Admin-Pages/Banking/RD/RDPreMaturity"));
const RDPayMaturity = lazy(() => import("./pages/Admin-Pages/Banking/RD/RDPayMaturity"));
const FDPreMaturity = lazy(() => import("./pages/Admin-Pages/Banking/FD/FDPreMaturity"));
const FDPayMaturity = lazy(() => import("./pages/Admin-Pages/Banking/FD/FDPayMaturity"));
const PigmyPreMaturity = lazy(() => import("./pages/Admin-Pages/Banking/PIGMY/PigmyPreMaturity"));
const PigmyPayMaturity = lazy(() => import("./pages/Admin-Pages/Banking/PIGMY/PigmyPayMaturity"));
const MISPreMaturity = lazy(() => import("./pages/Admin-Pages/Banking/MIS/MISPreMaturity"));
const MISPayMaturity = lazy(() => import("./pages/Admin-Pages/Banking/MIS/MISPayMaturity"));



// User Pages
const UserDashboard = lazy(() => import("./pages/User-Pages/UserDashboard/Dashboard"));
const UserProfile = lazy(() => import("./pages/User-Pages/Profile/Profile"));
const UserKYC = lazy(() => import("./pages/User-Pages/KYC/KYC"));
const UserChangePassword = lazy(() => import("./pages/User-Pages/Change-Password/ChangePassword"));
const UserActivate = lazy(() => import("./pages/User-Pages/Activate/Activate"));
const UserAddOnPackages = lazy(() => import("./pages/User-Pages/Packages/UserAddOnPackages"));
const UserUsedPackage = lazy(() => import("./pages/User-Pages/Packages/UsedPackage"));
const UserUnUsedPackage = lazy(() => import("./pages/User-Pages/Packages/UnUsedPackage"));
const UserTransferPackage = lazy(() => import("./pages/User-Pages/Packages/TransferPackage"));
const UserPackageHistory = lazy(() => import("./pages/User-Pages/Packages/PackageHistory"));
const Tree = lazy(() => import("./pages/User-Pages/Team/Tree"));
const Team = lazy(() => import("./pages/User-Pages/Team/Team"));
const UserNewResgister = lazy(() => import("./pages/User-Pages/Team/NewResgister"));
const UserDirect = lazy(() => import("./pages/User-Pages/Team/Direct"));
const UserLevelBenifits = lazy(() => import("./pages/User-Pages/Earnings/LeveBenifits"));
const UserDailyPayout = lazy(() => import("./pages/User-Pages/Earnings/DailyPayout"));
const UserROIBenefits = lazy(() => import("./pages/User-Pages/Earnings/ROIBenefits"));
const UserTransaction = lazy(() => import("./pages/User-Pages/Transaction/WalletTransaction"));
const UserLoanTransaction = lazy(() => import("./pages/User-Pages/Transaction/LoanTransaction"));
const UserMailBox = lazy(() => import("./pages/User-Pages/MailBox/MailBox"));
const UserWallet = lazy(() => import("./pages/User-Pages/Wallet/Wallet"));
const UserSupportChat = lazy(() => import("./pages/User-Pages/SupportChat/SupportChat"));
const UserChat = lazy(() => import("./pages/User-Pages/Chat/Chat"));
const UserOverdraft = lazy(() => import("./pages/User-Pages/Overdraft/Overdraft"));
const UserAccountOpening = lazy(() => import("./pages/User-Pages/AccountOpening/AccountOpening"));
const UserAgentWallet = lazy(() => import("./pages/User-Pages/Wallet/AgentWallet"));

const LoansMemberPending = lazy(() => import("./pages/Loans/Loanspending/Pending"));
const LoansMemberProcessed = lazy(() => import("./pages/Loans/Loansprocesssed/Processed"));
const LoansRepaymentsList = lazy(() => import("./pages/Loans/Repaymentlist/LoansList"));

export const LoadingComponent = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(255, 255, 255, 0.5)'
    }}>
      <CircularProgress sx={{ color: '#1a237e' }} />
    </Box>
  );
};

export const PageContentLoader = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - 120px)',
      width: '100%',
      gap: 2,
    }}>
      <CircularProgress sx={{ color: '#1a237e' }} size={42} />
      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: '0.5px' }}>
        Loading...
      </Typography>
    </Box>
  );
};

const ShouldHideSidebar = () => {
  const location = useLocation();
  const noSidebarPaths = ["/login", "/register", "/forgot-password", "/"];
  return noSidebarPaths.includes(location.pathname);
};

const ShouldHideNavbar = () => {
  const location = useLocation();
  // Comment out login from nav bar - hide navbar on public/auth pages
  const noNavbarPaths = ["/", "/login", "/register", "/recover-password", "/reset-password", "/forgot-password"];
  return noNavbarPaths.includes(location.pathname);
};

const ShouldShowFooter = () => {
  const location = useLocation();
  const noFooterPaths: string[] = [];
  return !noFooterPaths.includes(location.pathname);
};

const globalQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  const [isOpen, setIsOpen] = useState(() => window.innerWidth > 768);

  return (
    <UserProvider>
      <QueryClientProvider client={globalQueryClient}>
        <ToastContainer
          toastClassName="bg-white shadow-lg rounded-lg p-4"
          className="text-sm text-gray-800"
          style={{ width: 'auto', minWidth: '25rem' }} />
        <Router>
          <Suspense fallback={<LoadingComponent />}>
            <RoutesProvider
              isOpen={isOpen}
              setIsOpen={setIsOpen}
            />
          </Suspense>
        </Router>
      </QueryClientProvider>
    </UserProvider>
  );
}

const RoutesProvider = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}) => {
  const hideSidebar = ShouldHideSidebar();
  const hideNavbar = ShouldHideNavbar();
  const shouldShowFooter = ShouldShowFooter();
  // On public/auth pages, navbar is hidden — content takes full screen with no offset
  const { isLoggedIn, userRole } = useAuth();
  const isAdmin = userRole === "ADMIN";
  const isAgent = userRole === "AGENT";
  const isAdmin01 = userRole === "ADMIN_01";
  const showSidebar = isAdmin || isAgent || isAdmin01;

  return (
    <>
      <Navbar shouldHide={hideNavbar} onToggleSidebar={() => setIsOpen(!isOpen)} />
      <ChatNotificationListener />

      <div
        style={{
          display: "flex",
          maxWidth: "100vw",
          overflowX: "hidden",
          minHeight: "100vh"
        }}
      >
        {!hideSidebar && showSidebar && (
          <Sidebar
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            role={userRole}
          />
        )}

        <div
          className="content-wrapper"
          style={{
            flex: 1,
            marginLeft: !hideSidebar && showSidebar && isOpen ? "250px" : "0",

            transition: "margin-left 0.3s ease-in-out",
            width: "100%",
            overflowX: "hidden",
            // Transparent on public pages so Login/Register bg fills the whole screen
            backgroundColor: (hideNavbar || document.body.className.includes("theme-")) ? "transparent" : "#f4f7f9",
            minHeight: "100vh",
            // No padding offset when navbar is hidden (public pages)
            paddingTop: hideNavbar ? "0" : (!hideSidebar ? (window.innerWidth < 900 ? "56px" : "64px") : "0"),
            paddingBottom: !isAdmin && isLoggedIn ? "10px" : "0"
          }}
        >
          <Suspense fallback={<PageContentLoader />}>
            <Routes>
            <Route path="/impersonate" element={<Impersonate />} />
            {/* public routes */}
            <Route element={<PublicRoute />}>
              <Route index element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/recover-password" element={<RecoverPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>
            {/* policy and info pages - accessible to all */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            {/* admin routes */}

            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin/update-password" element={<UpdatePassword />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />{" "}
              {/* admin member routes */}
              <Route path="/admin/members" element={<Members />} />


              <Route
                path="/admin/members/pending"
                element={<PendingMembers />}
              />
              <Route path="/admin/members/active" element={<ActiveMembers />} />
              <Route
                path="/admin/members/inactive"
                element={<InActiveMembers />}
              />
              <Route
                path="/admin/members/permissions"
                element={<PermissionsMembers />}
              />

              {/* admin addon routes */}
              <Route path="/admin/addon-approvals" element={<AdminAddOnRequests />} />

              {/* admin package routes */}
              <Route
                path="/admin/package/generate"
                element={<GeneratePackages />}
              />
              <Route
                path="/admin/package/requests"
                element={<PackageRequests />}
              />
              <Route path="/admin/package/used" element={<UsedPackages />} />
              <Route
                path="/admin/package/unused"
                element={<UnusedPackages />}
              />
              <Route
                path="/admin/package/history"
                element={<PackageHistory />}
              />
              {/* admin income routes */}
              <Route
                path="/admin/income/cashback"
                element={<AdminCashBack />}
              />
              <Route
                path="/admin/income/level-benefits"
                element={<AdminLevelBenifits />}
              />
              <Route
                path="/admin/income/daily-payouts"
                element={<AdminDailyBenifitsPayouts />}
              />
              <Route
                path="/admin/income/roi-benefits"
                element={<AdminROIBenefits />}
              />

              <Route path="/admin/payout" element={<AdminPayout />} />

              {/* admin transaction routes */}
              <Route
                path="/admin/transactions"
                element={<AdminTransactions />}
              />
              <Route
                path="/admin/transactions/sms"
                element={<AdminSMSTransactions />}
              />
              <Route
                path="/admin/support-tickets"
                element={<AdminSupportTickets />}
              />
              <Route path="/admin/news" element={<AdminNews />} />
              <Route path="/admin/holidays" element={<AdminHolidays />} />
              <Route path="/admin/members/:memberId" element={<MembersUpdateForm />} />
              <Route path="/admin/kyc-approval" element={<KYCApproval />} />
              <Route path="/admin/withdraw-pending" element={<WithdrawPending />} />
              <Route path="/admin/chat" element={<AdminChat />} />

            </Route>

            {/* admin 01 routes */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN_01"]} />}>
              <Route path="/admin_01/dashboard" element={<Admin01Dashboard />} />
              <Route path="/admin_01/members" element={<Admin01Members />} />
              <Route path="/admin_01/shares" element={<Admin01Shares />} />
              <Route path="/admin_01/branches" element={<Admin01Branches />} />
              <Route path="/banking/interestrate" element={<Admin01Interests />} />
              {/* Admin Banking Routes */}
              <Route path="/banking/agents" element={<BankingAgents />} />
              <Route path="/agentassignemt/agent-assignment" element={<AgentAssignment />} />
              <Route path="/admin/withdrawal-requests" element={<AdminWithdrawalRequests />} />
              <Route path="/admin/banking/receipts" element={<AdminReceipts />} />
              <Route path="/admin/banking/payments" element={<AdminPayments />} />
              <Route path="/admin/banking/cash-transaction" element={<AdminCashTransaction />} />
              <Route path="/admin/banking/contra" element={<AdminContra />} />
              <Route path="/admin/banking/cantra" element={<AdminContra />} />
              <Route path="/admin/banking/journal" element={<AdminJournal />} />
              <Route path="/admin/banking/standing-instruction" element={<AdminStandingInstruction />} />
              <Route path="/admin/banking/pay-demand" element={<AdminPayDemand />} />
              
              {/* Accounts */}
              <Route path="/SBaccount/sb-opening" element={<SBOpening />} />
              <Route path="/CAaccount/ca-opening" element={<CAOpening />} />
              <Route path="/SBaccount/search-sb-acc" element={<SBDetails />} />
              <Route path="/CAaccount/search-ca-acc" element={<CADetails />} />
              <Route path="/SBaccount/close-sb" element={<CloseSBTable />} />
              <Route path="/CAaccount/close-ca" element={<CloseCATable />} />
              <Route path="/loan-close" element={<CloseLoanTable />} />
              <Route path="/od-close" element={<CloseODTable />} />
              
              {/* View All */}
              <Route path="/banking/rd-viewall" element={<RDViewAll />} />
              <Route path="/banking/fd-viewall" element={<FDViewAll />} />
              <Route path="/banking/pigmy-viewall" element={<PigmyViewAll />} />
              <Route path="/banking/mis-viewall" element={<MISViewAll />} />
              
              {/* Prematurity & Pay Maturity */}
              <Route path="/banking/rd-prematurity" element={<RDPreMaturity />} />
              <Route path="/banking/rd-pay-maturity" element={<RDPayMaturity />} />
              <Route path="/banking/fd-prematurity" element={<FDPreMaturity />} />
              <Route path="/banking/fd-pay-maturity" element={<FDPayMaturity />} />
              <Route path="/banking/pigmy-prematurity" element={<PigmyPreMaturity />} />
              <Route path="/banking/pigmy-pay-maturity" element={<PigmyPayMaturity />} />
              <Route path="/banking/mis-prematurity" element={<MISPreMaturity />} />
              <Route path="/banking/mis-pay-maturity" element={<MISPayMaturity />} />
              
              {/* account Opening */}
              <Route path="/banking/rd-opening" element={<RDOpening />} />
              <Route path="/banking/fd-opening" element={<FDOpening />} />
              <Route path="/banking/pigmy-opening" element={<PigmyOpening />} />
              <Route path="/banking/mis-opening" element={<MISOpening />} />

              {/* Deposit Calculators */}
              <Route path="/banking/rd-calculator" element={<DepositCalculator type="RD" />} />
              <Route path="/banking/fd-calculator" element={<DepositCalculator type="FD" />} />
              <Route path="/banking/pigmy-calculator" element={<DepositCalculator type="PIGMY" />} />
              <Route path="/banking/mis-calculator" element={<DepositCalculator type="MIS" />} />

              {/* Loan Master Routes */}
              {/* 1. Personal Loan */}
              <Route path="/loan/personal-opening" element={<PersonalLoanOpening />} />
              <Route path="/loan/personal-viewall" element={<PersonalLoanViewAll />} />
              <Route path="/loan/personal-close" element={<PersonalLoanClose />} />

              {/* 2. Mortgage Loan */}
              <Route path="/loan/mortgage-opening" element={<MortgageLoanOpening />} />
              <Route path="/loan/mortgage-viewall" element={<MortgageLoanViewAll />} />
              <Route path="/loan/mortgage-close" element={<MortgageLoanClose />} />

              {/* 3. Gold Loan */}
              <Route path="/loan/gold-opening" element={<GoldLoanOpening />} />
              <Route path="/loan/gold-viewall" element={<GoldLoanViewAll />} />
              <Route path="/loan/gold-close" element={<GoldLoanClose />} />

              {/* 4. Business Loan */}
              <Route path="/loan/business-opening" element={<BusinessLoanOpening />} />
              <Route path="/loan/business-viewall" element={<BusinessLoanViewAll />} />
              <Route path="/loan/business-close" element={<BusinessLoanClose />} />

              {/* 5. Vehicle Loan */}
              <Route path="/loan/vehicle-opening" element={<VehicleLoanOpening />} />
              <Route path="/loan/vehicle-viewall" element={<VehicleLoanViewAll />} />
              <Route path="/loan/vehicle-close" element={<VehicleLoanClose />} />

              {/* 6. Education Loan */}
              <Route path="/loan/education-opening" element={<EducationLoanOpening />} />
              <Route path="/loan/education-viewall" element={<EducationLoanViewAll />} />
              <Route path="/loan/education-close" element={<EducationLoanClose />} />

              {/* 7. Agriculture Loan */}
              <Route path="/loan/agriculture-opening" element={<AgricultureLoanOpening />} />
              <Route path="/loan/agriculture-viewall" element={<AgricultureLoanViewAll />} />
              <Route path="/loan/agriculture-close" element={<AgricultureLoanClose />} />

              {/* 8. Pigmi Loan */}
              <Route path="/loan/pigmi-opening" element={<PigmiLoanOpening />} />
              <Route path="/loan/pigmi-viewall" element={<PigmiLoanViewAll />} />
              <Route path="/loan/pigmi-close" element={<PigmiLoanClose />} />

              {/* 9. Pigmi Gold Loan */}
              <Route path="/loan/pigmi-gold-opening" element={<PigmiGoldLoanOpening />} />
              <Route path="/loan/pigmi-gold-viewall" element={<PigmiGoldLoanViewAll />} />
              <Route path="/loan/pigmi-gold-close" element={<PigmiGoldLoanClose />} />

              {/* Legacy Loan Master Routes */}
              <Route path="/admin/loans/personal" element={<LoanMasterPage loanType="Personal" />} />
              <Route path="/admin/loans/mortgage" element={<LoanMasterPage loanType="Mortgage" />} />
              <Route path="/admin/loans/gold" element={<LoanMasterPage loanType="Gold" />} />
              <Route path="/admin/loans/business" element={<LoanMasterPage loanType="Business" />} />
              <Route path="/admin/loans/vehicle" element={<LoanMasterPage loanType="Vehicle" />} />
              <Route path="/admin/loans/education" element={<LoanMasterPage loanType="Education" />} />
              <Route path="/admin/loans/agriculture" element={<LoanMasterPage loanType="Agriculture" />} />
              <Route path="/admin/loans/pigmi" element={<LoanMasterPage loanType="Pigmi" />} />
              <Route path="/admin/loans/pigmi-gold" element={<LoanMasterPage loanType="Pigmi Gold" />} />

              {/* DD Creations */}
              <Route path="/admin_01/dd-creations" element={<AdminDDCreations />} />

            </Route>

            {/* agent routes */}
            <Route element={<ProtectedRoute allowedRoles={["AGENT"]} />}>
              <Route path="/agent/dashboard" element={<AgentDashboard />} />
              <Route path="/agent/profile" element={<AgentProfile />} />
              <Route path="/agent/collections" element={<AgentCollections />} />
              <Route path="/agent/add-new" element={<AgentAddNew />} />
              <Route path="/agent/report" element={<AgentReport />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["ADMIN", "USER"]} />}>
              <Route path="/admin/member/pending" element={<LoansMemberPending />} />
              <Route path="/admin/member/processed" element={<LoansMemberProcessed />} />
              <Route path="/admin/repayments/list" element={<LoansRepaymentsList />} />
            </Route>

            {/* user routes */}

            <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              {/* user account routes */}
              <Route path="/user/account/profile" element={<UserProfile />} />
              <Route path="/user/account/kyc" element={<UserKYC />} />
              <Route
                path="/user/account/change-password"
                element={<UserChangePassword />}
              />
              <Route path="/user/activate" element={<UserActivate />} />
              {/* package routes */}
              <Route path="/user/addon-packages" element={<UserAddOnPackages />} />
              <Route path="/user/package/used" element={<UserUsedPackage />} />
              <Route
                path="/user/package/unused"
                element={<UserUnUsedPackage />}
              />
              <Route
                path="/user/package/transfer"
                element={<UserTransferPackage />}
              />
              <Route
                path="/user/package/history"
                element={<UserPackageHistory />}
              />
              {/* team routes */}
              <Route path="/user/team/tree" element={<Tree />} />
              <Route path="/user/team" element={<Team />} />
              <Route
                path="/user/team/new-register"
                element={<UserNewResgister />}
              />
              <Route path="/user/team/direct" element={<UserDirect />} />
              {/* earnings routes */}
              <Route
                path="/user/earnings/level-benefits"
                element={<UserLevelBenifits />}
              />
              <Route
                path="/user/earnings/daily-payout"
                element={<UserDailyPayout />}
              />
              <Route
                path="/user/earnings/roi-benefits"
                element={<UserROIBenefits />}
              />
              <Route path="/user/transactions" element={<UserTransaction />} />
              <Route path="/user/loantransactions" element={<UserLoanTransaction />} />
              <Route path="/user/mailbox" element={<UserMailBox />} />
              <Route path="/user/wallet" element={<UserWallet />} />
              <Route path="/user/agent-wallet" element={<UserAgentWallet />} />
              <Route path="/user/support-chat" element={<UserSupportChat />} />
              <Route path="/user/chat" element={<UserChat />} />
              <Route path="/user/overdraft" element={<UserOverdraft />} />
              <Route path="/user/account-opening/:type" element={<UserAccountOpening />} />


            </Route>



            {/* not found route */}
            <Route
              element={<ProtectedRoute allowedRoles={["USER", "ADMIN"]} />}
            >
              <Route element={<ProtectedRoute allowedRoles={["USER", "ADMIN"]} />}>
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>
          </Routes>
          </Suspense>
          {hideSidebar && shouldShowFooter && <Footer />}
        </div>
      </div>
      {!isAdmin && isLoggedIn && <MobileBottomNav />}
    </>
  );
};

export default App;
