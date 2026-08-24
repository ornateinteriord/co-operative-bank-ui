import React, { useState } from 'react';
import {
  Box,
  Container,
  Button,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminReusableTable from '../../../utils/AdminReusableTable';
import { toast } from 'react-toastify';
import { useGetPayDemands, useDeletePayDemand } from '../../../queries/banking';
import PayDemandDialog, { PayDemandFormData } from '../../../components/Banking/PayDemandDialog';
import ConfirmDialog from '../../../components/Shared/ConfirmDialog';

const initialData: PayDemandFormData[] = [
  {
    id: '1',
    demand_no: 'DEM-00101',
    tran_type: 'Payment',
    sub_type: 'Cash',
    date_from: '2026-08-20',
    date_to: '2026-08-20',
    location: '001-HO MAIN BRANCH',
    section_id: '01-BANKING SECTION',
    user: 'OFFICER_02',
    show_last_10: false,
    status: 'pending',
  },
  {
    id: '2',
    demand_no: 'DEM-00102',
    tran_type: 'Receipt',
    sub_type: 'Bank',
    date_from: '2026-08-20',
    date_to: '2026-08-20',
    location: '001-HO MAIN BRANCH',
    section_id: '01-BANKING SECTION',
    user: 'TELLER_01',
    show_last_10: true,
    status: 'completed',
  },
  {
    id: '3',
    demand_no: 'DEM-00103',
    tran_type: 'Transfer',
    sub_type: 'Clearing',
    date_from: '2026-08-19',
    date_to: '2026-08-20',
    location: '002-MANIPAL BRANCH',
    section_id: '02-CREDIT SECTION',
    user: 'ADMIN_USER',
    show_last_10: false,
    status: 'active',
  },
  {
    id: '4',
    demand_no: 'DEM-00104',
    tran_type: 'Demand Draft',
    sub_type: 'Cash',
    date_from: '2026-08-18',
    date_to: '2026-08-20',
    location: '003-KUNDAPURA BRANCH',
    section_id: '01-BANKING SECTION',
    user: 'MANAGER_01',
    show_last_10: false,
    status: 'pending',
  },
];

const PayDemand: React.FC = () => {
  const [dataList, setDataList] = useState<PayDemandFormData[]>(initialData);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDemandId, setSelectedDemandId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [demandToDelete, setDemandToDelete] = useState<string | null>(null);

  const { data: payDemandsData, isLoading } = useGetPayDemands(page, 10, searchQuery);
  const deleteDemandMutation = useDeletePayDemand();

  const currentDemands = (payDemandsData?.data && payDemandsData.data.length > 0)
    ? payDemandsData.data.map((d: any) => ({
        id: d._id || d.demand_no,
        demand_no: d.demand_no || d._id,
        tran_type: d.tran_type || 'Payment',
        sub_type: d.sub_type || 'Cash',
        date_from: d.date_from ? new Date(d.date_from).toISOString().split('T')[0] : '',
        date_to: d.date_to ? new Date(d.date_to).toISOString().split('T')[0] : '',
        location: d.location || '-',
        section_id: d.section_id || '-',
        user: d.user || '-',
        show_last_10: d.show_last_10 || false,
        status: d.status || 'pending',
      }))
    : dataList;

  // Filtered dataset based on search
  const filteredData = currentDemands.filter((item: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.demand_no && item.demand_no.toLowerCase().includes(q)) ||
      (item.tran_type && item.tran_type.toLowerCase().includes(q)) ||
      (item.sub_type && item.sub_type.toLowerCase().includes(q)) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      (item.section_id && item.section_id.toLowerCase().includes(q)) ||
      (item.user && item.user.toLowerCase().includes(q))
    );
  });

  const totalCount = payDemandsData?.pagination?.total || filteredData.length;

  const paginatedData = (payDemandsData?.data && payDemandsData.data.length > 0)
    ? currentDemands.map((item: any, index: number) => ({ ...item, rowNumber: (page - 1) * 10 + index + 1 }))
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
      id: 'tran_type',
      label: 'Tran.Type',
      sortable: true,
      minWidth: 130,
      renderCell: (row: PayDemandFormData) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e40af' }}>
          {row.tran_type || '-'}
        </Typography>
      ),
    },
    {
      id: 'sub_type',
      label: 'Sub.Type',
      sortable: true,
      minWidth: 120,
      renderCell: (row: PayDemandFormData) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#0f172a' }}>
          {row.sub_type || '-'}
        </Typography>
      ),
    },
    {
      id: 'date_range',
      label: 'Date Range (From - To)',
      sortable: true,
      minWidth: 190,
      renderCell: (row: PayDemandFormData) => (
        <Typography variant="body2" sx={{ color: '#334155' }}>
          {row.date_from} to {row.date_to}
        </Typography>
      ),
    },
    {
      id: 'location',
      label: 'Location',
      sortable: true,
      minWidth: 180,
      renderCell: (row: PayDemandFormData) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 500 }}>
          {row.location}
        </Typography>
      ),
    },
    {
      id: 'section_id',
      label: 'Section ID.',
      sortable: true,
      minWidth: 160,
      renderCell: (row: PayDemandFormData) => (
        <Typography variant="body2" sx={{ color: '#475569' }}>
          {row.section_id}
        </Typography>
      ),
    },
    {
      id: 'user',
      label: 'User',
      minWidth: 120,
      renderCell: (row: PayDemandFormData) => (
        <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
          {row.user || '-'}
        </Typography>
      ),
    },
    {
      id: 'show_last_10',
      label: 'Last 10 Tx',
      minWidth: 110,
      align: 'center' as const,
      renderCell: (row: PayDemandFormData) => (
        <Chip
          label={row.show_last_10 ? 'Yes' : 'No'}
          size="small"
          sx={{
            backgroundColor: row.show_last_10 ? '#dbeafe' : '#f1f5f9',
            color: row.show_last_10 ? '#1e40af' : '#64748b',
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: 'modify',
      label: 'Modify',
      minWidth: 95,
      align: 'center' as const,
      renderCell: (row: PayDemandFormData) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<EditIcon />}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedDemandId(row.id || '');
            setDialogOpen(true);
          }}
          sx={{
            textTransform: 'none',
            backgroundColor: '#fbbf24',
            color: 'white',
            fontSize: '0.75rem',
            px: 1.5,
            '&:hover': { backgroundColor: '#f59e0b' },
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
      renderCell: (row: PayDemandFormData) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={(e) => {
            e.stopPropagation();
            setDemandToDelete(row.id || '');
            setConfirmDialogOpen(true);
          }}
          sx={{
            textTransform: 'none',
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: '0.75rem',
            px: 1.5,
            '&:hover': { backgroundColor: '#dc2626' },
          }}
        >
          Delete
        </Button>
      ),
    },
  ];

  const handleAddDemand = () => {
    setSelectedDemandId(null);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (demandToDelete) {
      try {
        await deleteDemandMutation.mutateAsync(demandToDelete);
        toast.success('Pay demand record deleted successfully');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to delete pay demand');
      }
      setDataList((prev) => prev.filter((item) => item.id !== demandToDelete && item.demand_no !== demandToDelete));
      setDemandToDelete(null);
      setConfirmDialogOpen(false);
    }
  };

  const handleSaveDemand = (savedData: PayDemandFormData) => {
    if (selectedDemandId) {
      setDataList((prev) =>
        prev.map((item) => (item.id === selectedDemandId ? { ...item, ...savedData } : item))
      );
    } else {
      setDataList((prev) => [savedData, ...prev]);
    }
  };

  const handleExport = () => {
    toast.info('Exporting Pay Demand records to Excel...');
  };

  const selectedDemandData = currentDemands.find((item: any) => item.id === selectedDemandId || item.demand_no === selectedDemandId) || null;

  const tableActions = (
    <Stack direction="row" spacing={1}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddDemand}
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
        Add Pay Demand
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
          Pay Demand
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          SEARCH, PROCESS AND MANAGE PAYMENT DEMAND TRANSACTIONS
        </Typography>
      </Box>

      {/* Reusable Data Table */}
      <AdminReusableTable<any>
        columns={columns}
        data={paginatedData}
        title="Pay Demand Register"
        isLoading={isLoading}
        onSearchChange={setSearchInput}
        onSearch={() => setSearchQuery(searchInput)}
        onClearSearch={() => {
          setSearchInput('');
          setSearchQuery('');
        }}
        searchQuery={searchInput}
        paginationPerPage={10}
        actions={tableActions}
        onExport={handleExport}
        totalCount={totalCount}
        currentPage={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
      />

      {/* Pay Demand Dialog Modal with only the fields from image */}
      <PayDemandDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedDemandId(null);
        }}
        demandId={selectedDemandId}
        initialData={selectedDemandData}
        onSave={handleSaveDemand}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Pay Demand"
        message="Are you sure you want to delete this pay demand notice? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
      />
    </Container>
  );
};

export default PayDemand;
