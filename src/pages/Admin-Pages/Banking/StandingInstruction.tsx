import React, { useState } from 'react';
import {
  Box,
  Container,
  Button,
  Typography,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import AdminReusableTable from '../../../utils/AdminReusableTable';
import { toast } from 'react-toastify';
import { useGetStandingInstructions, useDeleteStandingInstruction } from '../../../queries/banking';
import StandingInstructionDialog, { StandingInstructionFormData } from '../../../components/Banking/StandingInstructionDialog';
import ConfirmDialog from '../../../components/Shared/ConfirmDialog';

const initialInstructions: StandingInstructionFormData[] = [
  {
    id: 'SI-001',
    si_id: 'SI-1001',
    processing_date: '2026-08-20',
    time: '11:41:15',
    section_id: '01-BANKING SECTION',
    tran_date: '2026-08-20',
    dr_account: 'SB-100201 - Rajesh Kumar Shetty (SB)',
    cr_account: 'RD-300101 - Monthly RD Scheme A/c',
    user: 'ADMIN_USER',
    amount: 2500,
    frequency: 'Monthly',
    start_date: '2026-01-01',
    end_date: '2027-01-01',
    narration: 'Monthly RD Auto-Debit installment transfer',
    status: 'active',
  },
  {
    id: 'SI-002',
    si_id: 'SI-1002',
    processing_date: '2026-08-20',
    time: '10:15:00',
    section_id: '03-LOAN SECTION',
    tran_date: '2026-08-20',
    dr_account: 'SB-100205 - Anitha Poojary (SB)',
    cr_account: 'LN-500108 - Personal Loan EMI A/c',
    user: 'OFFICER_02',
    amount: 5000,
    frequency: 'Monthly',
    start_date: '2026-02-05',
    end_date: '2028-02-05',
    narration: 'Personal Loan monthly repayment installment',
    status: 'active',
  },
  {
    id: 'SI-003',
    si_id: 'SI-1003',
    processing_date: '2026-08-20',
    time: '09:30:22',
    section_id: '04-DEPOSIT SECTION',
    tran_date: '2026-08-20',
    dr_account: 'CA-200405 - Ganesh Enterprises (CA)',
    cr_account: 'PG-400120 - Pigmy Daily Collection',
    user: 'TELLER_01',
    amount: 500,
    frequency: 'Daily',
    start_date: '2026-03-01',
    narration: 'Daily commercial pigmy sweep transfer',
    status: 'active',
  },
  {
    id: 'SI-004',
    si_id: 'SI-1004',
    processing_date: '2026-08-20',
    time: '14:20:45',
    section_id: '01-BANKING SECTION',
    tran_date: '2026-08-20',
    dr_account: '1001-BRANCH MAIN CASH LEDGER',
    cr_account: '1002-HEAD OFFICE CLEARING A/C',
    user: 'MANAGER_01',
    amount: 50000,
    frequency: 'Quarterly',
    start_date: '2026-01-01',
    narration: 'Quarterly head office treasury transfer',
    status: 'paused',
  },
];

const StandingInstruction: React.FC = () => {
  const [dataList, setDataList] = useState<StandingInstructionFormData[]>(initialInstructions);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInstructionId, setSelectedInstructionId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [instructionToDelete, setInstructionToDelete] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [instructionToView, setInstructionToView] = useState<StandingInstructionFormData | null>(null);

  const { data: siData, isLoading } = useGetStandingInstructions(page, 10, searchQuery);
  const deleteSIMutation = useDeleteStandingInstruction();

  const currentInstructions = (siData?.data && siData.data.length > 0)
    ? siData.data
    : dataList;

  // Search filter
  const filteredData = currentInstructions.filter((item: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.si_id && item.si_id.toLowerCase().includes(q)) ||
      (item.dr_account && item.dr_account.toLowerCase().includes(q)) ||
      (item.cr_account && item.cr_account.toLowerCase().includes(q)) ||
      (item.section_id && item.section_id.toLowerCase().includes(q)) ||
      (item.user && item.user.toLowerCase().includes(q)) ||
      (item.narration && item.narration.toLowerCase().includes(q)) ||
      (item.frequency && item.frequency.toLowerCase().includes(q))
    );
  });

  const totalCount = siData?.pagination?.total || filteredData.length;

  const paginatedData = (siData?.data && siData.data.length > 0)
    ? siData.data.map((item: any, index: number) => ({ ...item, rowNumber: (page - 1) * 10 + index + 1 }))
    : filteredData.slice((page - 1) * 10, page * 10).map((item: any, index: number) => ({
        ...item,
        rowNumber: (page - 1) * 10 + index + 1,
      }));

  const columns = [
    {
      id: 'rowNumber',
      label: 'Sl No',
      minWidth: 70,
      align: 'center' as const,
      renderCell: (row: any) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
          {row.rowNumber || 1}
        </Typography>
      ),
    },
    {
      id: 'si_id',
      label: 'SI No / ID',
      sortable: true,
      minWidth: 120,
      renderCell: (row: StandingInstructionFormData) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e40af' }}>
          {row.si_id}
        </Typography>
      ),
    },
    {
      id: 'datetime',
      label: 'Processing Date & Time',
      sortable: true,
      minWidth: 170,
      renderCell: (row: StandingInstructionFormData) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {new Date(row.processing_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Time: {row.time}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'section_id',
      label: 'Section ID',
      sortable: true,
      minWidth: 150,
      renderCell: (row: StandingInstructionFormData) => (
        <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.85rem' }}>
          {row.section_id}
        </Typography>
      ),
    },
    {
      id: 'dr_account',
      label: 'Dr. A/C (Debit From)',
      minWidth: 190,
      renderCell: (row: StandingInstructionFormData) => (
        <Typography variant="body2" sx={{ color: '#b91c1c', fontWeight: 600, fontSize: '0.85rem' }}>
          {row.dr_account}
        </Typography>
      ),
    },
    {
      id: 'cr_account',
      label: 'Cr. A/C (Credit To)',
      minWidth: 190,
      renderCell: (row: StandingInstructionFormData) => (
        <Typography variant="body2" sx={{ color: '#047857', fontWeight: 600, fontSize: '0.85rem' }}>
          {row.cr_account}
        </Typography>
      ),
    },
    {
      id: 'amount',
      label: 'Amount',
      sortable: true,
      minWidth: 120,
      align: 'right' as const,
      renderCell: (row: StandingInstructionFormData) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#059669' }}>
          ₹{Number(row.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      id: 'frequency',
      label: 'Frequency',
      minWidth: 100,
      align: 'center' as const,
      renderCell: (row: StandingInstructionFormData) => (
        <Chip
          label={row.frequency}
          size="small"
          sx={{
            backgroundColor: '#e0e7ff',
            color: '#3730a3',
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: 'user',
      label: 'User',
      minWidth: 110,
      renderCell: (row: StandingInstructionFormData) => (
        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
          {row.user}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      minWidth: 100,
      align: 'center' as const,
      renderCell: (row: StandingInstructionFormData) => (
        <Chip
          label={row.status}
          size="small"
          sx={{
            backgroundColor:
              row.status === 'active' ? '#d1fae5' :
              row.status === 'paused' ? '#fef3c7' : '#fee2e2',
            color:
              row.status === 'active' ? '#065f46' :
              row.status === 'paused' ? '#92400e' : '#991b1b',
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        />
      ),
    },
    {
      id: 'modify',
      label: 'Modify',
      minWidth: 95,
      align: 'center' as const,
      renderCell: (row: StandingInstructionFormData) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<EditIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleModifyClick(row.si_id);
          }}
          sx={{
            textTransform: 'none',
            backgroundColor: '#fbbf24',
            color: 'white',
            fontSize: '0.75rem',
            px: 1.5,
            '&:hover': {
              backgroundColor: '#f59e0b',
            },
          }}
        >
          Modify
        </Button>
      ),
    },
    {
      id: 'delete',
      label: 'Delete',
      minWidth: 95,
      align: 'center' as const,
      renderCell: (row: StandingInstructionFormData) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(row.si_id);
          }}
          sx={{
            textTransform: 'none',
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: '0.75rem',
            px: 1.5,
            '&:hover': {
              backgroundColor: '#dc2626',
            },
          }}
        >
          Delete
        </Button>
      ),
    },
    {
      id: 'view',
      label: 'Details',
      minWidth: 100,
      align: 'center' as const,
      renderCell: (row: StandingInstructionFormData) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails(row);
          }}
          sx={{
            textTransform: 'none',
            backgroundColor: '#3b82f6',
            color: 'white',
            fontSize: '0.75rem',
            px: 1.5,
            '&:hover': {
              backgroundColor: '#2563eb',
            },
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const handleSearchChange = (query: string) => {
    setSearchInput(query);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
  };

  const handleAddInstruction = () => {
    setSelectedInstructionId(null);
    setDialogOpen(true);
  };

  const handleModifyClick = (siId: string) => {
    setSelectedInstructionId(siId);
    setDialogOpen(true);
  };

  const handleDeleteClick = (siId: string) => {
    setInstructionToDelete(siId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (instructionToDelete) {
      try {
        await deleteSIMutation.mutateAsync(instructionToDelete);
        toast.success('Standing instruction deleted successfully');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to delete standing instruction');
      }
      setDataList((prev) => prev.filter((item) => item.si_id !== instructionToDelete));
      setInstructionToDelete(null);
      setConfirmDialogOpen(false);
    }
  };

  const handleViewDetails = (si: StandingInstructionFormData) => {
    setInstructionToView(si);
    setViewDialogOpen(true);
  };

  const handleSaveInstruction = (savedData: StandingInstructionFormData) => {
    if (selectedInstructionId) {
      setDataList((prev) =>
        prev.map((item) => (item.si_id === selectedInstructionId ? { ...item, ...savedData } : item))
      );
    } else {
      setDataList((prev) => [savedData, ...prev]);
    }
  };

  const handleExport = () => {
    toast.info('Exporting Standing Instructions to Excel...');
  };

  const selectedInstructionData = currentInstructions.find((item: any) => item.si_id === selectedInstructionId) || null;

  const tableActions = (
    <Stack direction="row" spacing={1}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddInstruction}
        sx={{
          textTransform: 'none',
          backgroundColor: '#1e40af',
          px: 2.5,
          py: 0.8,
          borderRadius: '8px',
          fontWeight: 600,
          '&:hover': { backgroundColor: '#1d4ed8' },
        }}
      >
        Add Instruction
      </Button>
    </Stack>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, mt: { xs: 7, sm: 8 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: '#1a237e', mb: 1, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}
        >
          Standing Instructions (SI)
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          AUTOMATE, SCHEDULE AND EXECUTE RECURRING INTER-ACCOUNT TRANSFERS
        </Typography>
      </Box>

      <AdminReusableTable<any>
        columns={columns}
        data={paginatedData}
        title="Standing Instructions Management"
        isLoading={isLoading}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        searchQuery={searchInput}
        paginationPerPage={10}
        actions={tableActions}
        onExport={handleExport}
        emptyMessage="No standing instructions found"
        totalCount={totalCount}
        currentPage={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
      />

      {/* Add / Edit Dialog */}
      <StandingInstructionDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedInstructionId(null);
        }}
        instructionId={selectedInstructionId}
        initialData={selectedInstructionData}
        onSave={handleSaveInstruction}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Standing Instruction"
        message="Are you sure you want to delete this standing instruction? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
      />

      {/* View Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setInstructionToView(null);
        }}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '16px' },
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonthIcon />
            <Typography variant="h6" fontWeight={600}>
              Standing Instruction Details
            </Typography>
          </Box>
          <IconButton onClick={() => setViewDialogOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: '#f8fafc' }}>
          {instructionToView && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: '10px', bgcolor: '#fff' }}>
                <Typography variant="h6" fontWeight={700} color="#1e3a8a">
                  {instructionToView.si_id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Section: <strong>{instructionToView.section_id}</strong> | Operator: <strong>{instructionToView.user}</strong>
                </Typography>
                <Chip
                  label={instructionToView.status}
                  size="small"
                  sx={{
                    mt: 1,
                    backgroundColor:
                      instructionToView.status === 'active' ? '#d1fae5' :
                      instructionToView.status === 'paused' ? '#fef3c7' : '#fee2e2',
                    color:
                      instructionToView.status === 'active' ? '#065f46' :
                      instructionToView.status === 'paused' ? '#92400e' : '#991b1b',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                />
              </Paper>

              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: '10px', bgcolor: '#fff' }}>
                <Typography variant="subtitle2" fontWeight={700} color="#334155" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SyncAltIcon fontSize="small" color="primary" /> Transfer Accounts
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Debit From (Dr. A/C):</Typography>
                    <Typography variant="body2" fontWeight={600} color="#b91c1c">{instructionToView.dr_account}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Credit To (Cr. A/C):</Typography>
                    <Typography variant="body2" fontWeight={600} color="#047857">{instructionToView.cr_account}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: '10px', bgcolor: '#fff' }}>
                <Typography variant="subtitle2" fontWeight={700} color="#334155" sx={{ mb: 1.5 }}>
                  Schedule & Amount
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Amount:</Typography>
                    <Typography variant="body2" fontWeight={700} color="#059669">
                      ₹{Number(instructionToView.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Frequency:</Typography>
                    <Typography variant="body2" fontWeight={600}>{instructionToView.frequency}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Processing Date:</Typography>
                    <Typography variant="body2" fontWeight={600}>{instructionToView.processing_date}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Processing Time:</Typography>
                    <Typography variant="body2" fontWeight={600}>{instructionToView.time}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Tran. Date:</Typography>
                    <Typography variant="body2" fontWeight={600}>{instructionToView.tran_date}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Effective Start Date:</Typography>
                    <Typography variant="body2" fontWeight={600}>{instructionToView.start_date}</Typography>
                  </Grid>
                  {instructionToView.end_date && (
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">End Date:</Typography>
                      <Typography variant="body2" fontWeight={600}>{instructionToView.end_date}</Typography>
                    </Grid>
                  )}
                  {instructionToView.narration && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Narration / Purpose:</Typography>
                      <Typography variant="body2">{instructionToView.narration}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setViewDialogOpen(false)} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StandingInstruction;
