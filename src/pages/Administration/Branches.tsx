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
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AdminReusableTable from '../../utils/AdminReusableTable';
import { toast } from 'react-toastify';
import BranchDialog, { BranchFormData } from '../../components/Administration/BranchDialog';
import ConfirmDialog from '../../components/Shared/ConfirmDialog';

const initialBranches: BranchFormData[] = [
  {
    id: 'BRN-001',
    branch_ledger_acc: '1001-BRANCH HEAD OFFICE LEDGER',
    date: '2026-08-20',
    section_id: '01-BANKING SECTION',
    branch_id: 'BRN001',
    branch_id_no: '01',
    full_id_no: '01-BRN001-01',
    branch_cust_id_no: 'CUST-BRN-001',
    branch_name: 'Udupi Main Branch',
    door_no: 'D.No. 4-12/A',
    address1: 'Main Temple Road',
    address2: 'Near Car Street',
    address3: 'Udupi - 576101',
    phone_code: '0820',
    phone_number: '2521234',
    mobile_no: '9876543210',
    email: 'udupi.main@cooperativebank.com',
    status: 'active',
  },
  {
    id: 'BRN-002',
    branch_ledger_acc: '1002-INTER-BRANCH CLEARING A/C',
    date: '2026-08-20',
    section_id: '01-BANKING SECTION',
    branch_id: 'BRN002',
    branch_id_no: '02',
    full_id_no: '01-BRN002-02',
    branch_cust_id_no: 'CUST-BRN-002',
    branch_name: 'Manipal Branch',
    door_no: 'Shop # 15/B',
    address1: 'Tiger Circle Road',
    address2: 'Commercial Complex',
    address3: 'Manipal - 576104',
    phone_code: '0820',
    phone_number: '2575678',
    mobile_no: '9845123456',
    email: 'manipal@cooperativebank.com',
    status: 'active',
  },
  {
    id: 'BRN-003',
    branch_ledger_acc: '1004-GENERAL BANKING LEDGER',
    date: '2026-08-20',
    section_id: '02-CREDIT & ADVANCES',
    branch_id: 'BRN003',
    branch_id_no: '03',
    full_id_no: '02-BRN003-03',
    branch_cust_id_no: 'CUST-BRN-003',
    branch_name: 'Kundapura Branch',
    door_no: 'D.No. 8-44',
    address1: 'Shastri Circle',
    address2: 'NH-66 Junction',
    address3: 'Kundapura - 576201',
    phone_code: '08254',
    phone_number: '230112',
    mobile_no: '9448123789',
    email: 'kundapura@cooperativebank.com',
    status: 'active',
  },
  {
    id: 'BRN-004',
    branch_ledger_acc: '1003-MAIN VAULT CASH LEDGER',
    date: '2026-08-20',
    section_id: '01-BANKING SECTION',
    branch_id: 'BRN004',
    branch_id_no: '04',
    full_id_no: '01-BRN004-04',
    branch_cust_id_no: 'CUST-BRN-004',
    branch_name: 'Karkala Branch',
    door_no: 'D.No. 2-10',
    address1: 'Market Road',
    address2: 'Anekere Junction',
    address3: 'Karkala - 574104',
    phone_code: '08258',
    phone_number: '221456',
    mobile_no: '9880123999',
    email: 'karkala@cooperativebank.com',
    status: 'active',
  },
];

const Branches: React.FC = () => {
  const [dataList, setDataList] = useState<BranchFormData[]>(initialBranches);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [branchToView, setBranchToView] = useState<BranchFormData | null>(null);

  // Search filter
  const filteredData = dataList.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.branch_id.toLowerCase().includes(q) ||
      item.branch_name.toLowerCase().includes(q) ||
      item.section_id.toLowerCase().includes(q) ||
      item.branch_ledger_acc.toLowerCase().includes(q) ||
      item.address3.toLowerCase().includes(q) ||
      item.mobile_no.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q)
    );
  });

  const paginatedData = filteredData.slice((page - 1) * 10, page * 10).map((item, index) => ({
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
      id: 'branch_id',
      label: 'Branch ID',
      sortable: true,
      minWidth: 110,
      renderCell: (row: BranchFormData) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e40af' }}>
          {row.branch_id}
        </Typography>
      ),
    },
    {
      id: 'branch_name',
      label: 'Branch Name',
      sortable: true,
      minWidth: 180,
      renderCell: (row: BranchFormData) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
            {row.branch_name}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {row.full_id_no || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'section_id',
      label: 'Section ID',
      sortable: true,
      minWidth: 160,
      renderCell: (row: BranchFormData) => (
        <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.85rem' }}>
          {row.section_id}
        </Typography>
      ),
    },
    {
      id: 'branch_ledger_acc',
      label: 'Ledger A/c',
      minWidth: 180,
      renderCell: (row: BranchFormData) => (
        <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem' }}>
          {row.branch_ledger_acc || '-'}
        </Typography>
      ),
    },
    {
      id: 'contact',
      label: 'Contact',
      minWidth: 170,
      renderCell: (row: BranchFormData) => (
        <Box>
          {row.mobile_no && (
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#0f172a', fontSize: '0.85rem' }}>
              Mob: {row.mobile_no}
            </Typography>
          )}
          {row.phone_number && (
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
              Tel: ({row.phone_code}) {row.phone_number}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'location',
      label: 'Location / City',
      minWidth: 160,
      renderCell: (row: BranchFormData) => (
        <Typography variant="body2" sx={{ color: '#334155' }}>
          {row.address3 || row.address1 || '-'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      minWidth: 100,
      align: 'center' as const,
      renderCell: (row: BranchFormData) => (
        <Chip
          label={row.status}
          size="small"
          sx={{
            backgroundColor: row.status === 'active' ? '#d1fae5' : '#f1f5f9',
            color: row.status === 'active' ? '#065f46' : '#64748b',
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
      renderCell: (row: BranchFormData) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<EditIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleModifyClick(row.branch_id);
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
      renderCell: (row: BranchFormData) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(row.branch_id);
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
      renderCell: (row: BranchFormData) => (
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

  const handleAddBranch = () => {
    setSelectedBranchId(null);
    setDialogOpen(true);
  };

  const handleModifyClick = (branchId: string) => {
    setSelectedBranchId(branchId);
    setDialogOpen(true);
  };

  const handleDeleteClick = (branchId: string) => {
    setBranchToDelete(branchId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (branchToDelete) {
      setDataList((prev) => prev.filter((item) => item.branch_id !== branchToDelete));
      toast.success('Branch deleted successfully');
      setBranchToDelete(null);
      setConfirmDialogOpen(false);
    }
  };

  const handleViewDetails = (branch: BranchFormData) => {
    setBranchToView(branch);
    setViewDialogOpen(true);
  };

  const handleSaveBranch = (savedData: BranchFormData) => {
    if (selectedBranchId) {
      setDataList((prev) =>
        prev.map((item) => (item.branch_id === selectedBranchId ? { ...item, ...savedData } : item))
      );
    } else {
      setDataList((prev) => [savedData, ...prev]);
    }
  };

  const handleExport = () => {
    toast.info('Exporting Branch data to Excel...');
  };

  const selectedBranchData = dataList.find((item) => item.branch_id === selectedBranchId) || null;

  const tableActions = (
    <Stack direction="row" spacing={1}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddBranch}
        sx={{
          textTransform: 'none',
          backgroundColor: '#10b981',
          px: 2.5,
          py: 0.8,
          borderRadius: '8px',
          fontWeight: 600,
          '&:hover': { backgroundColor: '#059669' },
        }}
      >
        Add Branch
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
          Branch Master
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          MANAGE, CONFIGURE AND MAINTAIN BANK BRANCHES
        </Typography>
      </Box>

      <AdminReusableTable<any>
        columns={columns}
        data={paginatedData}
        title="Branch Management"
        isLoading={false}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        searchQuery={searchInput}
        paginationPerPage={10}
        actions={tableActions}
        onExport={handleExport}
        emptyMessage="No branches found"
        totalCount={filteredData.length}
        currentPage={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
      />

      {/* Add / Edit Branch Dialog */}
      <BranchDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedBranchId(null);
        }}
        branchId={selectedBranchId}
        initialData={selectedBranchData}
        onSave={handleSaveBranch}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Branch"
        message="Are you sure you want to delete this branch? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
      />

      {/* View Branch Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setBranchToView(null);
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
            <BusinessIcon />
            <Typography variant="h6" fontWeight={600}>
              Branch Details
            </Typography>
          </Box>
          <IconButton onClick={() => setViewDialogOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: '#f8fafc' }}>
          {branchToView && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: '10px', bgcolor: '#fff' }}>
                <Typography variant="h6" fontWeight={700} color="#1e3a8a">
                  {branchToView.branch_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: <strong>{branchToView.branch_id}</strong> | Full ID: <strong>{branchToView.full_id_no || '-'}</strong>
                </Typography>
                <Chip
                  label={branchToView.status}
                  size="small"
                  sx={{
                    mt: 1,
                    backgroundColor: branchToView.status === 'active' ? '#d1fae5' : '#f1f5f9',
                    color: branchToView.status === 'active' ? '#065f46' : '#64748b',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                />
              </Paper>

              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: '10px', bgcolor: '#fff' }}>
                <Typography variant="subtitle2" fontWeight={700} color="#334155" sx={{ mb: 1.5 }}>
                  Section & Ledger Info
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Section ID:</Typography>
                    <Typography variant="body2" fontWeight={600}>{branchToView.section_id}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Branch Cust. ID:</Typography>
                    <Typography variant="body2" fontWeight={600}>{branchToView.branch_cust_id_no || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Branch Ledger A/c:</Typography>
                    <Typography variant="body2" fontWeight={600}>{branchToView.branch_ledger_acc || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Date Configured:</Typography>
                    <Typography variant="body2" fontWeight={600}>{branchToView.date}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: '10px', bgcolor: '#fff' }}>
                <Typography variant="subtitle2" fontWeight={700} color="#334155" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon fontSize="small" color="primary" /> Address
                </Typography>
                <Typography variant="body2">{branchToView.door_no ? `${branchToView.door_no}, ` : ''}{branchToView.address1}</Typography>
                {branchToView.address2 && <Typography variant="body2">{branchToView.address2}</Typography>}
                {branchToView.address3 && <Typography variant="body2" fontWeight={600}>{branchToView.address3}</Typography>}
              </Paper>

              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: '10px', bgcolor: '#fff' }}>
                <Typography variant="subtitle2" fontWeight={700} color="#334155" sx={{ mb: 1.5 }}>
                  Contact Information
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Telephone / Mobile:</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {branchToView.phone_number ? `(${branchToView.phone_code}) ${branchToView.phone_number}` : '-'}
                        {branchToView.mobile_no ? ` / ${branchToView.mobile_no}` : ''}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Email:</Typography>
                      <Typography variant="body2" fontWeight={600}>{branchToView.email || '-'}</Typography>
                    </Box>
                  </Grid>
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

export default Branches;
