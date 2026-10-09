import DashboardCards from './DashboardCards';
import InterestCard from './interest-card';
import { useGetDashboardCounts, useGetRecentData } from '../../../queries/admin';
import { Box } from '@mui/material';

const AdminDashboard = () => {
  const { data: dashboardData } = useGetDashboardCounts();
  const { data: recentData } = useGetRecentData();

  // Fallback to empty objects if data is missing or error occurs
  const displayCounts = (dashboardData?.success && dashboardData?.data) ? dashboardData.data : {
    totalMembers: 0,
    totalAccounts: 0,
    totalAgents: 0,
    closingBalance: 0,
    totalDebit: 0,
    totalCredit: 0,
    accountsByType: []
  };

  const displayRecentData = (recentData?.success && recentData?.data) ? recentData.data : {
    recentMembers: [],
    recentAccounts: []
  };

  return (
    <Box
      sx={{
        backgroundColor: '#f1f5f9',
        minHeight: '100%',
        py: { xs: 2, md: 3 },
      }}
    >
      <InterestCard />

      <DashboardCards 
        counts={displayCounts as any} 
        recentData={displayRecentData as any} 
      />
    </Box>
  );
};

export default AdminDashboard;
