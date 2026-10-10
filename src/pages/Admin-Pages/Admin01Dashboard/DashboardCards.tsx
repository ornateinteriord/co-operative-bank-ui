import { Box, Grid, Dialog, DialogTitle, DialogContent, IconButton, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from './DashboardCard';
import DescriptionIcon from '@mui/icons-material/Description';
import StorageIcon from '@mui/icons-material/Storage';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CloseIcon from '@mui/icons-material/Close';
import DashboardTable from './DashboardTable';
import TimelineComponent from '../../../utils/TimeLineComponent';
import { DashboardCounts, RecentData, AccountByType } from '../../../types';
import type { Member, Account } from '../../../types';

interface DashboardCardsProps {
  counts: DashboardCounts;
  recentData: RecentData;
}

const DashboardCards = ({ counts, recentData }: DashboardCardsProps) => {
  const navigate = useNavigate();
  const [accountTypesDialogOpen, setAccountTypesDialogOpen] = useState(false);

  // Format recent members data for table
  const membersData = (recentData?.recentMembers || []).map((member: Member) => {
    const dateRaw = member?.date_of_joining || member?.Date_of_joining || member?.createdAt;
    const parsedDate = dateRaw ? new Date(dateRaw) : null;
    return {
      name: member?.name || member?.Name || 'N/A',
      memberNum: member?.member_id || member?.Member_id || 'N/A',
      dateOfJoining: (parsedDate && !isNaN(parsedDate.getTime()))
        ? parsedDate.toLocaleDateString('en-GB')
        : 'N/A',
      emailId: member?.emailid || member?.email || '-',
      mobileNo: (member?.contactno || member?.mobileno || 'N/A').toString().trim(),
      status: member?.status || 'active',
    };
  });

  // Format recent accounts data for timeline
  const accountsTimelineData = (recentData?.recentAccounts || []).map((account: Account) => ({
    title: 'Account',
    highlight: account?.account_no || account?.account_id || 'N/A',
    date: account?.date_of_opening
      ? `Created On ${new Date(account.date_of_opening).toLocaleDateString('en-GB')}`
      : 'N/A',
  }));

  // Table columns configuration
  const membersColumns = [
    {
      name: 'Name',
      selector: (row: any) => row.name,
      sortable: true,
      minWidth: '120px',
      grow: 1,
      style: {
        fontWeight: '600',
        color: '#1e293b',
      },
    },
    {
      name: 'Member ID',
      selector: (row: any) => row.memberNum,
      sortable: true,
      minWidth: '110px',
      grow: 1,
      style: {
        color: '#0a2558',
        fontWeight: '600',
      },
    },
    {
      name: 'Date Of Joining',
      selector: (row: any) => row.dateOfJoining,
      sortable: true,
      minWidth: '135px',
      grow: 1,
    },
    {
      name: 'Email ID',
      selector: (row: any) => row.emailId,
      sortable: true,
      minWidth: '160px',
      grow: 1.5,
    },
    {
      name: 'Mobile No',
      selector: (row: any) => row.mobileNo,
      sortable: true,
      minWidth: '120px',
      grow: 1,
    },
    {
      name: 'Status',
      selector: (row: any) => row.status,
      sortable: true,
      minWidth: '95px',
      grow: 0.8,
      cell: (row: any) => (
        <Box
          sx={{
            px: 1.5,
            py: 0.4,
            borderRadius: '6px',
            backgroundColor: row.status?.toLowerCase() === 'active' ? '#ecfdf5' : '#fef2f2',
            color: row.status?.toLowerCase() === 'active' ? '#059669' : '#dc2626',
            fontWeight: 600,
            fontSize: '0.75rem',
            textAlign: 'center',
          }}
        >
          {row.status?.toUpperCase() || 'ACTIVE'}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
      {/* 4 Simple Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            icon={<SupervisorAccountIcon />}
            title="Total Members"
            status="Active"
            description={`${counts.totalMembers} Members`}
            sx={{
              background: '#0a2558',
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            icon={<DescriptionIcon />}
            title="Total Accounts"
            status="Active"
            description={`${counts.totalAccounts} Accounts`}
            showActionButton={true}
            actionButtonLabel="Breakdown"
            onActionClick={() => setAccountTypesDialogOpen(true)}
            sx={{
              background: '#0a2558',
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            icon={<SupervisorAccountIcon />}
            title="Total Agents"
            status="Active"
            description={`${counts.totalAgents} Agents`}
            sx={{
              background: '#0a2558',
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            icon={<CurrencyRupeeIcon />}
            title="Cash Balance"
            status="Active"
            description={`₹ ${Number(counts.closingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            sx={{
              background: '#0a2558',
            }}
          />
        </Grid>
      </Grid>

      {/* Second Row: Members Table & Accounts Timeline */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <DashboardCard
            icon={<StorageIcon />}
            title="Members"
            status="Recent members"
            showActionButton={true}
            actionButtonLabel="View All"
            onActionClick={() => navigate('/admin_01/members')}
            showFooterContent={true}
            footerContent={
              <Box
                sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  mt: 1,
                  overflowX: 'auto',
                  border: '1px solid #e2e8f0',
                }}
              >
                <DashboardTable
                  data={membersData}
                  columns={membersColumns}
                  customStyles={{
                    headRow: {
                      style: {
                        backgroundColor: '#0a2558',
                        minHeight: '46px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      },
                    },
                    headCells: {
                      style: {
                        backgroundColor: '#0a2558',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '700',
                        letterSpacing: '0.02em',
                        paddingLeft: '12px',
                        paddingRight: '12px',
                      },
                    },
                    cells: {
                      style: {
                        paddingLeft: '12px',
                        paddingRight: '12px',
                        fontSize: '13px',
                        color: '#1e293b',
                      },
                    },
                    rows: {
                      style: {
                        minHeight: '46px',
                        '&:hover': {
                          backgroundColor: '#f8fafc',
                        },
                      },
                    },
                    pagination: {
                      style: {
                        minHeight: '44px',
                        borderTop: '1px solid #e2e8f0',
                        color: '#64748b',
                      },
                    },
                  }}
                  sx={{
                    '& .rdt_TableHead': {
                      backgroundColor: '#0a2558',
                    },
                    '& .rdt_TableHeadRow': {
                      backgroundColor: '#0a2558',
                      minHeight: '46px',
                    },
                    '& .rdt_TableCol': {
                      backgroundColor: '#0a2558 !important',
                      color: '#ffffff !important',
                      fontWeight: '700 !important',
                      fontSize: '0.85rem !important',
                      letterSpacing: '0.02em',
                      '&:hover': {
                        color: '#ffffff !important',
                      },
                      '& svg': {
                        fill: '#ffffff !important',
                      },
                    },
                    '& .rdt_TableCol_Sortable': {
                      color: '#ffffff !important',
                      '&:hover': {
                        color: '#ffffff !important',
                      },
                      '& span': {
                        color: '#ffffff !important',
                      },
                      '& svg': {
                        fill: '#ffffff !important',
                      },
                      '& > div:first-of-type': {
                        overflow: 'visible',
                        whiteSpace: 'nowrap',
                      },
                    },
                    '& .rdt_TableRow': {
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                      },
                    },
                  }}
                />
              </Box>
            }
            sx={{
              background: '#0a2558',
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <DashboardCard
            icon={<DescriptionIcon />}
            title="Accounts"
            status="Recent accounts"
            showFooterContent={true}
            footerContent={
              <Box
                sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  mt: 1,
                  p: 2.5,
                  border: '1px solid #e2e8f0',
                }}
              >
                <TimelineComponent
                  data={accountsTimelineData}
                  sx={{
                    '& .timeline-item': {
                      borderLeft: '3px solid #0a2558',
                      paddingLeft: '16px',
                    }
                  }}
                />
              </Box>
            }
            sx={{
              background: '#0a2558',
            }}
          />
        </Grid>
      </Grid>

      {/* Account Types Breakdown Dialog */}
      <Dialog
        open={accountTypesDialogOpen}
        onClose={() => setAccountTypesDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: '#0a2558',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Account Types Breakdown
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Account counts by scheme
            </Typography>
          </Box>
          <IconButton
            onClick={() => setAccountTypesDialogOpen(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, bgcolor: '#f8fafc' }}>
          <Grid container spacing={2}>
            {(counts?.accountsByType || []).map((accountType: AccountByType, index: number) => (
              <Grid item xs={12} sm={6} md={4} key={accountType.account_type || index}>
                <Box
                  sx={{
                    background: '#ffffff',
                    borderRadius: '10px',
                    p: 2.5,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Typography sx={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    {accountType.account_group_name || accountType.account_type || 'Account'}
                  </Typography>
                  <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#0a2558', mt: 0.5 }}>
                    {accountType.count}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontWeight: 600, color: '#334155' }}>
              Total Accounts
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '1.5rem', color: '#0a2558' }}>
              {counts.totalAccounts}
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DashboardCards;