import { Card, CardContent, Grid, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import '../../Dashboard/dashboard.scss';
import DashboardTable from '../../Dashboard/DashboardTable';
import DashboardCard from '../../../components/common/DashboardCard';
import { getAdminDashboardTableColumns } from '../../../utils/DataTableColumnsProvider';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PaymentsIcon from '@mui/icons-material/Payments';
import { useGetAllMembersDetails, useGetROISummary } from '../../../api/Admin';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: members = [], isLoading: membersLoading, error: membersError } = useGetAllMembersDetails();
  const { data: roiSummary, isLoading: roiLoading } = useGetROISummary();

  const isLoading = membersLoading || roiLoading;
  const error = membersError;

  // Sort members by most recent registration date
  const sortedMembers = [...members].sort((a, b) => {
    return new Date(b.createdAt || b.Date_of_joining).getTime() -
      new Date(a.createdAt || a.Date_of_joining).getTime();
  });

  const totalMembers = members.length;
  const activeMembers = members.filter((member: any) =>
    member.status?.toLowerCase() === 'active'
  ).length;

  const pendingMembers = members.filter((member: any) =>
    member.status?.toLowerCase() === 'pending'
  ).length;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px' }}>
        <Typography sx={{ color: '#0a2558', fontWeight: 600 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px' }}>
        <Typography color="error">
          Error loading dashboard: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100%', p: { xs: 2, md: 3 } }}>
      {/* Simple Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0a2558' }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Overview of bank members and operations
        </Typography>
      </Box>

      {/* KPI Cards Row */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            amount={totalMembers}
            title="Total Members"
            subTitle={`${totalMembers} members`}
            IconComponent={PeopleIcon}
            onClick={() => navigate('/admin/members')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            amount={activeMembers}
            title="Active Members"
            subTitle={`${activeMembers} active`}
            IconComponent={HowToRegIcon}
            onClick={() => navigate('/admin/members/active')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            amount={pendingMembers}
            title="Pending Members"
            subTitle={`${pendingMembers} pending`}
            IconComponent={PersonAddIcon}
            onClick={() => navigate('/admin/members/pending')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            amount={`₹ ${(roiSummary?.totalROIDistributed || 0).toLocaleString('en-IN')}`}
            title="Total ROI Distributed"
            subTitle={`Today: ₹ ${(roiSummary?.todaysTotal || 0).toLocaleString('en-IN')}`}
            IconComponent={PaymentsIcon}
            onClick={() => navigate('/admin/income/daily-payouts')}
          />
        </Grid>
      </Grid>

      {/* Member Statistics Table */}
      <Box sx={{ mt: 3.5 }}>
        <Card
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0a2558', mb: 2 }}>
              Members ({sortedMembers.length})
            </Typography>
            <DashboardTable
              data={sortedMembers}
              columns={getAdminDashboardTableColumns()}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AdminDashboard;