import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    Chip,
    CircularProgress,
    Paper,
    LinearProgress,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import WarningIcon from '@mui/icons-material/Warning';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import RefreshIcon from '@mui/icons-material/Refresh';
import { toast } from 'react-toastify';
import { useGetSchedulerStatus, useRunBankingJob } from '../../../queries/admin';

const BankingOperationsPage: React.FC = () => {
    const { data: statusResponse, isLoading, refetch, isFetching } = useGetSchedulerStatus();
    const runJobMutation = useRunBankingJob();
    const [runningJob, setRunningJob] = useState<string | null>(null);

    const metrics = statusResponse?.data?.metrics;

    const handleRunJob = async (
        jobType: "maturity" | "dormant" | "overdue" | "rd-penalty" | "sb-interest",
        jobName: string
    ) => {
        try {
            setRunningJob(jobType);
            const response = await runJobMutation.mutateAsync(jobType);
            if (response && response.success) {
                toast.success(`${jobName} executed successfully!`);
                refetch();
            } else {
                toast.error(response?.message || `Failed to run ${jobName}`);
            }
        } catch (error: any) {
            toast.error(error?.message || `Error running ${jobName}`);
        } finally {
            setRunningJob(null);
        }
    };

    const jobs = [
        {
            id: 'maturity' as const,
            title: 'Deposit Maturity Processing',
            description: 'Scans all matured FD, RD, and Pigmy deposit accounts (maturity date <= today), calculates Simple Interest, updates net amount, and creates official ledger transaction records.',
            schedule: 'Daily at 00:05 AM',
            icon: <AccountBalanceIcon sx={{ fontSize: 36, color: '#1e3a8a' }} />,
            metricLabel: 'Pending Unprocessed Matured Accounts',
            metricValue: metrics?.pending_matured_accounts ?? 0,
            metricColor: metrics?.pending_matured_accounts > 0 ? 'error' : 'success',
            buttonLabel: 'Process Matured Accounts',
            color: '#1e3a8a',
            bgGradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        },
        {
            id: 'dormant' as const,
            title: 'Dormant Account Detection',
            description: 'Flags active operating accounts (SB & CA) with zero customer-induced transactions in the past 12 months as Dormant. Automatically revives dormant accounts that initiate new transactions.',
            schedule: 'Daily at 00:05 AM',
            icon: <BedtimeIcon sx={{ fontSize: 36, color: '#6366f1' }} />,
            metricLabel: 'Currently Flagged Dormant Accounts',
            metricValue: metrics?.current_dormant_accounts ?? 0,
            extraMetric: `${metrics?.dormant_candidates_unflagged ?? 0} Inactive Candidates`,
            metricColor: 'warning',
            buttonLabel: 'Detect & Flag Dormant Accounts',
            color: '#6366f1',
            bgGradient: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
        },
        {
            id: 'overdue' as const,
            title: 'Overdue Loans & Penal Interest',
            description: 'Identifies loan accounts that have crossed their agreed maturity / term end date with unpaid balance. Automatically marks them as Overdue and accrues daily penal interest (+2% p.a.).',
            schedule: 'Daily at 00:05 AM',
            icon: <WarningIcon sx={{ fontSize: 36, color: '#dc2626' }} />,
            metricLabel: 'Active Overdue Loans',
            metricValue: metrics?.overdue_loans_count ?? 0,
            metricColor: metrics?.overdue_loans_count > 0 ? 'error' : 'success',
            buttonLabel: 'Process Overdue Loans & Accrue Penalty',
            color: '#dc2626',
            bgGradient: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)',
        },
        {
            id: 'rd-penalty' as const,
            title: 'Recurring Deposit (RD) Installment Tracking',
            description: 'Verifies monthly installment credits for all active RD accounts. Accrues standard Nidhi late penalty (₹5 per missed installment) on overdue accounts.',
            schedule: 'Monthly / Daily at 00:05 AM',
            icon: <CalendarMonthIcon sx={{ fontSize: 36, color: '#d97706' }} />,
            metricLabel: 'Total Active RD Accounts',
            metricValue: metrics?.active_rd_accounts ?? 0,
            metricColor: 'info',
            buttonLabel: 'Check RD Installments & Penalties',
            color: '#d97706',
            bgGradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
        },
        {
            id: 'sb-interest' as const,
            title: 'Savings Bank (SB) Quarterly Interest Credit',
            description: 'Calculates and credits standard 3.5% p.a. quarterly savings interest to active SB accounts on the start of each financial quarter (Jan, Apr, Jul, Oct) with automatic ledger entries.',
            schedule: 'Quarterly (Jan 1, Apr 1, Jul 1, Oct 1)',
            icon: <MonetizationOnIcon sx={{ fontSize: 36, color: '#059669' }} />,
            metricLabel: 'Quarterly Cycle Status',
            metricValue: metrics?.sb_quarterly_interest_due_this_month ? 'Due This Month' : 'Next Cycle Scheduled',
            metricColor: metrics?.sb_quarterly_interest_due_this_month ? 'warning' : 'success',
            buttonLabel: 'Run SB Quarterly Interest Credit',
            color: '#059669',
            bgGradient: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
        },
    ];

    return (
        <Box sx={{ p: 4, mt: 8, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            {/* Page Header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                mb: 4,
            }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        Banking Operations & Schedulers
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748b', mt: 0.5 }}>
                        Monitor core banking background jobs, automated interest cycles, and compliance workflows.
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={isFetching ? <CircularProgress size={18} /> : <RefreshIcon />}
                    onClick={() => refetch()}
                    disabled={isFetching}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                    Refresh Status
                </Button>
            </Box>

            {/* Quick Banner */}
            <Paper sx={{
                p: 3,
                mb: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: 'white',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)',
            }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <AccessTimeIcon sx={{ color: '#38bdf8' }} />
                            <Typography variant="subtitle1" fontWeight={700}>
                                Automated Daemon Schedule Active
                            </Typography>
                            <Chip label="RUNNING DAILY" size="small" sx={{ bgcolor: '#0284c7', color: 'white', fontWeight: 600 }} />
                        </Box>
                        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            All jobs run automatically every night at <strong>00:05 AM (IST)</strong> on the server daemon. You can also manually trigger any workflow below to process immediate settlements.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                            SERVER TIME
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#f8fafc' }}>
                            {statusResponse?.data?.server_time ? new Date(statusResponse.data.server_time).toLocaleString('en-IN') : new Date().toLocaleString('en-IN')}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {isLoading && <LinearProgress sx={{ mb: 3, borderRadius: 1 }} />}

            {/* Job Cards */}
            <Grid container spacing={3}>
                {jobs.map((job) => {
                    const isJobRunning = runningJob === job.id;
                    return (
                        <Grid item xs={12} lg={6} key={job.id}>
                            <Card sx={{
                                borderRadius: 3,
                                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                                },
                            }}>
                                <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f1f5f9', display: 'inline-flex' }}>
                                            {job.icon}
                                        </Box>
                                        <Chip
                                            icon={<AccessTimeIcon sx={{ fontSize: '14px !important' }} />}
                                            label={job.schedule}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontWeight: 500 }}
                                        />
                                    </Box>

                                    <Typography variant="h6" fontWeight={700} sx={{ color: '#0f172a', mb: 1 }}>
                                        {job.title}
                                    </Typography>

                                    <Typography variant="body2" sx={{ color: '#64748b', mb: 3, flex: 1, lineHeight: 1.6 }}>
                                        {job.description}
                                    </Typography>

                                    {/* Metrics Pill */}
                                    <Box sx={{
                                        p: 2,
                                        mb: 3,
                                        bgcolor: '#f8fafc',
                                        borderRadius: 2,
                                        border: '1px solid #e2e8f0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}>
                                        <Box>
                                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block' }}>
                                                {job.metricLabel}
                                            </Typography>
                                            {job.extraMetric && (
                                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                                    {job.extraMetric}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Chip
                                            label={job.metricValue}
                                            color={job.metricColor as any}
                                            sx={{ fontWeight: 800, fontSize: '0.9rem', px: 1 }}
                                        />
                                    </Box>

                                    {/* Action Button */}
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={isJobRunning ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
                                        onClick={() => handleRunJob(job.id, job.title)}
                                        disabled={isJobRunning || runJobMutation.isPending}
                                        sx={{
                                            py: 1.2,
                                            background: job.bgGradient,
                                            borderRadius: 2,
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            fontSize: '0.92rem',
                                            boxShadow: 'none',
                                            '&:hover': {
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            },
                                        }}
                                    >
                                        {isJobRunning ? 'Processing Operation...' : job.buttonLabel}
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default BankingOperationsPage;
