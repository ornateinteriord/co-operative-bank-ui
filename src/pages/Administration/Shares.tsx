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
import PieChartIcon from '@mui/icons-material/PieChart';
import PersonIcon from '@mui/icons-material/Person';
import AdminReusableTable from '../../utils/AdminReusableTable';
import { toast } from 'react-toastify';
import ShareDialog, { ShareFormData } from '../../components/Administration/ShareDialog';
import ConfirmDialog from '../../components/Shared/ConfirmDialog';

const initialShares: ShareFormData[] = [
  {
    id: 'SH-001',
    share_id: 'SH-1001',
    certificate_no: 'SH-CERT-10452',
    folio_no: 'FOL-0089',
    allotment_date: '2026-01-15',
    member_id: 'MBR001',
    member_name: 'Rajesh Kumar Shetty',
    share_type: 'Class A - Regular Member',
    number_of_shares: 50,
    face_value: 100,
    total_amount: 5000,
    mode_of_payment: 'Cash',
    dividend_rate: 9.0,
    nominee_name: 'Sunita Shetty',
    nominee_relation: 'Spouse',
    branch_code: 'BRN001',
    status: 'active',
    remarks: 'Founding class share allotment',
  },
  {
    id: 'SH-002',
    share_id: 'SH-1002',
    certificate_no: 'SH-CERT-10453',
    folio_no: 'FOL-0090',
    allotment_date: '2026-02-10',
    member_id: 'MBR005',
    member_name: 'Anitha Poojary',
    share_type: 'Class A - Regular Member',
    number_of_shares: 25,
    face_value: 100,
    total_amount: 2500,
    mode_of_payment: 'SB Account Debit',
    dividend_rate: 9.0,
    nominee_name: 'Praveen Poojary',
    nominee_relation: 'Son',
    branch_code: 'BRN001',
    status: 'active',
    remarks: 'Regular member share',
  },
  {
    id: 'SH-003',
    share_id: 'SH-1003',
    certificate_no: 'SH-CERT-10454',
    folio_no: 'FOL-0091',
    allotment_date: '2026-03-01',
    member_id: 'MBR012',
    member_name: 'Suresh Bhat',
    share_type: 'Class B - Associate Member',
    number_of_shares: 100,
    face_value: 100,
    total_amount: 10000,
    mode_of_payment: 'Bank Transfer',
    dividend_rate: 8.5,
    nominee_name: 'Vidya Bhat',
    nominee_relation: 'Daughter',
    branch_code: 'BRN002',
    status: 'active',
    remarks: 'Associate corporate membership share',
  },
  {
    id: 'SH-004',
    share_id: 'SH-1004',
    certificate_no: 'SH-CERT-10455',
    folio_no: 'FOL-0092',
    allotment_date: '2026-03-12',
    member_id: 'MBR020',
    member_name: 'Ganesh Acharya',
    share_type: 'Class C - Nominal Member',
    number_of_shares: 10,
    face_value: 100,
    total_amount: 1000,
    mode_of_payment: 'Cash',
    dividend_rate: 7.5,
    nominee_name: 'Sumana Acharya',
    nominee_relation: 'Spouse',
    branch_code: 'BRN003',
    status: 'active',
    remarks: 'Nominal share for gold loan eligibility',
  },
];

const Shares: React.FC = () => {
  const [dataList, setDataList] = useState<ShareFormData[]>(initialShares);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedShareId, setSelectedShareId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [shareToDelete, setShareToDelete] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [shareToView, setShareToView] = useState<ShareFormData | null>(null);

  // Search filter
  const filteredData = dataList.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.certificate_no.toLowerCase().includes(q) ||
      item.folio_no.toLowerCase().includes(q) ||
      item.member_id.toLowerCase().includes(q) ||
      item.member_name.toLowerCase().includes(q) ||
      item.share_type.toLowerCase().includes(q) ||
      item.branch_code.toLowerCase().includes(q)
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
      id: 'certificate_no',
      label: 'Certificate No',
      sortable: true,
      minWidth: 140,
      renderCell: (row: ShareFormData) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#047857' }}>
            {row.certificate_no}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Folio: {row.folio_no}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'member_name',
      label: 'Member Info',
      sortable: true,
      minWidth: 180,
      renderCell: (row: ShareFormData) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
            {row.member_name}
          </Typography>
          <Typography variant="caption" sx={{ color: '#047857', fontWeight: 600 }}>
            ID: {row.member_id}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'share_type',
      label: 'Share Class',
      sortable: true,
      minWidth: 170,
      renderCell: (row: ShareFormData) => (
        <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.85rem' }}>
          {row.share_type}
        </Typography>
      ),
    },
    {
      id: 'number_of_shares',
      label: 'No. of Shares',
      sortable: true,
      minWidth: 110,
      align: 'center' as const,
      renderCell: (row: ShareFormData) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
          {row.number_of_shares}
        </Typography>
      ),
    },
    {
      id: 'face_value',
      label: 'Face Value',
      minWidth: 100,
      align: 'right' as const,
      renderCell: (row: ShareFormData) => (
        <Typography variant="body2" sx={{ color: '#475569' }}>
          ₹{row.face_value}
        </Typography>
      ),
    },
    {
      id: 'total_amount',
      label: 'Total Capital',
      sortable: true,
      minWidth: 130,
      align: 'right' as const,
      renderCell: (row: ShareFormData) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#047857' }}>
          ₹{Number(row.total_amount || 0).toLocaleString('en-IN')}
        </Typography>
      ),
    },
    {
      id: 'dividend_rate',
      label: 'Dividend',
      minWidth: 95,
      align: 'center' as const,
      renderCell: (row: ShareFormData) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0284c7' }}>
          {row.dividend_rate}%
        </Typography>
      ),
    },
    {
      id: 'allotment_date',
      label: 'Allotment Date',
      sortable: true,
      minWidth: 120,
      renderCell: (row: ShareFormData) => (
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          {new Date(row.allotment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      minWidth: 100,
      align: 'center' as const,
      renderCell: (row: ShareFormData) => (
        <Chip
          label={row.status}
          size="small"
          sx={{
            backgroundColor:
              row.status === 'active' ? '#d1fae5' :
              row.status === 'transferred' ? '#fef3c7' : '#fee2e2',
            color:
              row.status === 'active' ? '#065f46' :
              row.status === 'transferred' ? '#92400e' : '#991b1b',
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
      renderCell: (row: ShareFormData) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<EditIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleModifyClick(row.certificate_no);
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
      renderCell: (row: ShareFormData) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(row.certificate_no);
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
      renderCell: (row: ShareFormData) => (
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
            backgroundColor: '#047857',
            color: 'white',
            fontSize: '0.75rem',
            px: 1.5,
            '&:hover': {
              backgroundColor: '#065f46',
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

  const handleAddShare = () => {
    setSelectedShareId(null);
    setDialogOpen(true);
  };

  const handleModifyClick = (certNo: string) => {
    setSelectedShareId(certNo);
    setDialogOpen(true);
  };

  const handleDeleteClick = (certNo: string) => {
    setShareToDelete(certNo);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (shareToDelete) {
      setDataList((prev) => prev.filter((item) => item.certificate_no !== shareToDelete));
      toast.success('Share allotment record deleted successfully');
      setShareToDelete(null);
      setConfirmDialogOpen(false);
    }
  };

  const handleViewDetails = (share: ShareFormData) => {
    setShareToView(share);
    setViewDialogOpen(true);
  };

  const handleSaveShare = (savedData: ShareFormData) => {
    if (selectedShareId) {
      setDataList((prev) =>
        prev.map((item) => (item.certificate_no === selectedShareId ? { ...item, ...savedData } : item))
      );
    } else {
      setDataList((prev) => [savedData, ...prev]);
    }
  };

  const handleExport = () => {
    toast.info('Exporting Share Capital records to Excel...');
  };

  const selectedShareData = dataList.find((item) => item.certificate_no === selectedShareId) || null;

  const tableActions = (
    <Stack direction="row" spacing={1}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddShare}
        sx={{
          textTransform: 'none',
          backgroundColor: '#047857',
          px: 2.5,
          py: 0.8,
          borderRadius: '8px',
          fontWeight: 600,
          '&:hover': { backgroundColor: '#065f46' },
        }}
      >
        New Share Allotment
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
          Share Capital Master
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          MANAGE MEMBER SHARE ALLOTMENTS, CERTIFICATES AND DIVIDENDS
        </Typography>
      </Box>

      <AdminReusableTable<any>
        columns={columns}
        data={paginatedData}
        title="Share Capital Management"
        isLoading={false}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        searchQuery={searchInput}
        paginationPerPage={10}
        actions={tableActions}
        onExport={handleExport}
        emptyMessage="No share allotments found"
        totalCount={filteredData.length}
        currentPage={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
      />

      {/* Add / Edit Share Dialog */}
      <ShareDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedShareId(null);
        }}
        shareId={selectedShareId}
        initialData={selectedShareData}
        onSave={handleSaveShare}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Share Allotment"
        message="Are you sure you want to delete this share certificate record? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
      />

      {/* View Share Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setShareToView(null);
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
            background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PieChartIcon />
            <Typography variant="h6" fontWeight={600}>
              Share Certificate Details
            </Typography>
          </Box>
          <IconButton onClick={() => setViewDialogOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: '#f8fafc' }}>
          {shareToView && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: '10px', bgcolor: '#fff' }}>
                <Typography variant="h6" fontWeight={700} color="#047857">
                  {shareToView.certificate_no}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Folio: <strong>{shareToView.folio_no}</strong> | Share ID: <strong>{shareToView.share_id}</strong>
                </Typography>
                <Chip
                  label={shareToView.status}
                  size="small"
                  sx={{
                    mt: 1,
                    backgroundColor:
                      shareToView.status === 'active' ? '#d1fae5' :
                      shareToView.status === 'transferred' ? '#fef3c7' : '#fee2e2',
                    color:
                      shareToView.status === 'active' ? '#065f46' :
                      shareToView.status === 'transferred' ? '#92400e' : '#991b1b',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                />
              </Paper>

              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: '10px', bgcolor: '#fff' }}>
                <Typography variant="subtitle2" fontWeight={700} color="#334155" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" color="primary" /> Member Information
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Member ID:</Typography>
                    <Typography variant="body2" fontWeight={600}>{shareToView.member_id}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Member Name:</Typography>
                    <Typography variant="body2" fontWeight={600}>{shareToView.member_name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Nominee Name:</Typography>
                    <Typography variant="body2" fontWeight={600}>{shareToView.nominee_name || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Nominee Relation:</Typography>
                    <Typography variant="body2" fontWeight={600}>{shareToView.nominee_relation || '-'}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: '10px', bgcolor: '#fff' }}>
                <Typography variant="subtitle2" fontWeight={700} color="#334155" sx={{ mb: 1.5 }}>
                  Financial & Allotment Details
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Share Classification:</Typography>
                    <Typography variant="body2" fontWeight={600}>{shareToView.share_type}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">No. of Shares:</Typography>
                    <Typography variant="body2" fontWeight={600}>{shareToView.number_of_shares} Shares</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Face Value:</Typography>
                    <Typography variant="body2" fontWeight={600}>₹{shareToView.face_value} / Share</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Total Share Capital:</Typography>
                    <Typography variant="body2" fontWeight={700} color="#047857">₹{Number(shareToView.total_amount).toLocaleString('en-IN')}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Dividend Rate:</Typography>
                    <Typography variant="body2" fontWeight={600} color="#0284c7">{shareToView.dividend_rate}%</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Payment Mode:</Typography>
                    <Typography variant="body2" fontWeight={600}>{shareToView.mode_of_payment}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Allotment Date:</Typography>
                    <Typography variant="body2" fontWeight={600}>{shareToView.allotment_date}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Branch Code:</Typography>
                    <Typography variant="body2" fontWeight={600}>{shareToView.branch_code}</Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setViewDialogOpen(false)} variant="contained" sx={{ backgroundColor: '#047857', '&:hover': { backgroundColor: '#065f46' } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Shares;
