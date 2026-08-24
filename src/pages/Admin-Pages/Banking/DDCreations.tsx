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
  TextField,
  Grid,
  MenuItem,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AdminReusableTable from '../../../utils/AdminReusableTable';
import { toast } from 'react-toastify';
import { useGetDDCreations, useCreateDDCreation, useUpdateDDCreation, useDeleteDDCreation } from '../../../queries/banking';
import ConfirmDialog from '../../../components/Shared/ConfirmDialog';

interface DDCreationItem {
  id: string;
  dd_no: string;
  date: string;
  purchaser_name: string;
  beneficiary_name: string;
  payable_at: string;
  amount: number;
  commission: number;
  total_amount: number;
  status: 'issued' | 'cleared' | 'cancelled';
}

const initialData: DDCreationItem[] = [
  {
    id: '1',
    dd_no: 'DD-504901',
    date: '2026-08-20',
    purchaser_name: 'Rajesh Kumar Shetty',
    beneficiary_name: 'Mangalore University',
    payable_at: 'Mangalore Branch',
    amount: 25000,
    commission: 100,
    total_amount: 25100,
    status: 'issued',
  },
  {
    id: '2',
    dd_no: 'DD-504902',
    date: '2026-08-19',
    purchaser_name: 'Anitha Poojary',
    beneficiary_name: 'Manipal Academy of Higher Education',
    payable_at: 'Manipal Branch',
    amount: 50000,
    commission: 150,
    total_amount: 50150,
    status: 'cleared',
  },
];

const defaultForm: {
  dd_no: string;
  date: string;
  purchaser_name: string;
  beneficiary_name: string;
  payable_at: string;
  amount: string;
  commission: string;
  status: 'issued' | 'cleared' | 'cancelled';
} = {
  dd_no: '',
  date: new Date().toISOString().split('T')[0],
  purchaser_name: '',
  beneficiary_name: '',
  payable_at: 'Mangalore Branch',
  amount: '',
  commission: '50',
  status: 'issued',
};

const DDCreations: React.FC = () => {
  const [dataList, setDataList] = useState<DDCreationItem[]>(initialData);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDD, setSelectedDD] = useState<DDCreationItem | null>(null);
  const [formData, setFormData] = useState(defaultForm);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [ddToDelete, setDDToDelete] = useState<string | null>(null);

  // Queries & Mutations
  const { data: ddData, isLoading } = useGetDDCreations(page, 10, searchQuery);
  const createDDMutation = useCreateDDCreation();
  const updateDDMutation = useUpdateDDCreation();
  const deleteDDMutation = useDeleteDDCreation();

  const currentDDs = (ddData?.data && ddData.data.length > 0)
    ? ddData.data.map((d: any) => ({
        id: d._id || d.dd_no,
        dd_no: d.dd_no || d.dd_number,
        date: d.date ? new Date(d.date).toISOString().split('T')[0] : '',
        purchaser_name: d.purchaser_name || '-',
        beneficiary_name: d.beneficiary_name || '-',
        payable_at: d.payable_at || '-',
        amount: d.amount || 0,
        commission: d.commission || 0,
        total_amount: d.total_amount || (Number(d.amount || 0) + Number(d.commission || 0)),
        status: d.status || 'issued',
      }))
    : dataList;

  const filteredData = currentDDs.filter((item: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.dd_no && item.dd_no.toLowerCase().includes(q)) ||
      (item.purchaser_name && item.purchaser_name.toLowerCase().includes(q)) ||
      (item.beneficiary_name && item.beneficiary_name.toLowerCase().includes(q)) ||
      (item.payable_at && item.payable_at.toLowerCase().includes(q))
    );
  });

  const totalCount = ddData?.pagination?.total || filteredData.length;

  const handleOpenDialog = (dd?: DDCreationItem) => {
    if (dd) {
      setSelectedDD(dd);
      setFormData({
        dd_no: dd.dd_no,
        date: dd.date,
        purchaser_name: dd.purchaser_name,
        beneficiary_name: dd.beneficiary_name,
        payable_at: dd.payable_at,
        amount: String(dd.amount),
        commission: String(dd.commission),
        status: dd.status,
      });
    } else {
      setSelectedDD(null);
      setFormData({
        ...defaultForm,
        dd_no: `DD-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
      });
    }
    setDialogOpen(true);
  };

  const handleSaveDD = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.purchaser_name.trim()) {
      toast.warning('Please enter Purchaser Name');
      return;
    }
    if (!formData.beneficiary_name.trim()) {
      toast.warning('Please enter Beneficiary Name');
      return;
    }
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) {
      toast.warning('Please enter a valid Amount');
      return;
    }
    const comm = parseFloat(formData.commission) || 0;

    const payload = {
      dd_no: formData.dd_no,
      date: formData.date,
      purchaser_name: formData.purchaser_name,
      beneficiary_name: formData.beneficiary_name,
      payable_at: formData.payable_at,
      amount: amt,
      commission: comm,
      total_amount: amt + comm,
      status: formData.status,
    };

    try {
      if (selectedDD) {
        await updateDDMutation.mutateAsync({ ddId: selectedDD.dd_no, data: payload });
        toast.success('DD updated successfully');
      } else {
        await createDDMutation.mutateAsync(payload);
        toast.success('DD issued successfully');
      }
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save DD');
    }
  };

  const handleConfirmDelete = async () => {
    if (ddToDelete) {
      try {
        await deleteDDMutation.mutateAsync(ddToDelete);
        toast.success('DD record deleted');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to delete DD');
      }
      setDataList((prev) => prev.filter((i) => i.dd_no !== ddToDelete && i.id !== ddToDelete));
      setDDToDelete(null);
      setConfirmDialogOpen(false);
    }
  };

  const columns = [
    {
      id: 'slNo',
      label: 'Sl No',
      minWidth: 70,
      align: 'center' as const,
      renderCell: (_row: any, index?: number) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
          {(page - 1) * 10 + (index || 0) + 1}
        </Typography>
      ),
    },
    {
      id: 'dd_no',
      label: 'DD Number',
      sortable: true,
      minWidth: 130,
      renderCell: (row: DDCreationItem) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e40af' }}>
          {row.dd_no}
        </Typography>
      ),
    },
    {
      id: 'date',
      label: 'Issue Date',
      sortable: true,
      minWidth: 120,
      renderCell: (row: DDCreationItem) => (
        <Typography variant="body2" sx={{ color: '#475569' }}>
          {row.date}
        </Typography>
      ),
    },
    {
      id: 'purchaser_name',
      label: 'Purchaser Name',
      sortable: true,
      minWidth: 180,
      renderCell: (row: DDCreationItem) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
          {row.purchaser_name}
        </Typography>
      ),
    },
    {
      id: 'beneficiary_name',
      label: 'Beneficiary Name',
      sortable: true,
      minWidth: 200,
      renderCell: (row: DDCreationItem) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#047857' }}>
          {row.beneficiary_name}
        </Typography>
      ),
    },
    {
      id: 'payable_at',
      label: 'Payable At',
      sortable: true,
      minWidth: 150,
      renderCell: (row: DDCreationItem) => (
        <Typography variant="body2" sx={{ color: '#475569' }}>
          {row.payable_at}
        </Typography>
      ),
    },
    {
      id: 'amount',
      label: 'DD Amount',
      sortable: true,
      minWidth: 130,
      align: 'right' as const,
      renderCell: (row: DDCreationItem) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
          ₹{Number(row.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      id: 'commission',
      label: 'Commission',
      sortable: true,
      minWidth: 110,
      align: 'right' as const,
      renderCell: (row: DDCreationItem) => (
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          ₹{Number(row.commission).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      id: 'total_amount',
      label: 'Total Amount',
      sortable: true,
      minWidth: 140,
      align: 'right' as const,
      renderCell: (row: DDCreationItem) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#16a34a' }}>
          ₹{Number(row.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      minWidth: 100,
      align: 'center' as const,
      renderCell: (row: DDCreationItem) => (
        <Chip
          label={row.status}
          size="small"
          sx={{
            backgroundColor:
              row.status === 'cleared' ? '#d1fae5' :
              row.status === 'issued' ? '#dbeafe' : '#fee2e2',
            color:
              row.status === 'cleared' ? '#065f46' :
              row.status === 'issued' ? '#1e40af' : '#991b1b',
            fontWeight: 600,
            textTransform: 'capitalize',
          }}
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 150,
      align: 'center' as const,
      renderCell: (row: DDCreationItem) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button
            variant="contained"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => handleOpenDialog(row)}
            sx={{ textTransform: 'none', backgroundColor: '#fbbf24', fontSize: '0.75rem', px: 1, '&:hover': { backgroundColor: '#f59e0b' } }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => {
              setDDToDelete(row.dd_no || row.id);
              setConfirmDialogOpen(true);
            }}
            sx={{ textTransform: 'none', backgroundColor: '#ef4444', fontSize: '0.75rem', px: 1, '&:hover': { backgroundColor: '#dc2626' } }}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, mt: { xs: 7, sm: 8 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 1, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
          Demand Draft (DD) Creations
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          ISSUE, PRINT AND MANAGE DEMAND DRAFTS
        </Typography>
      </Box>

      <AdminReusableTable<any>
        columns={columns}
        data={filteredData.slice((page - 1) * 10, page * 10)}
        title="DD Issue Register"
        isLoading={isLoading}
        onSearchChange={setSearchInput}
        onSearch={() => setSearchQuery(searchInput)}
        onClearSearch={() => {
          setSearchInput('');
          setSearchQuery('');
        }}
        searchQuery={searchInput}
        paginationPerPage={10}
        totalCount={totalCount}
        currentPage={page - 1}
        onPageChange={(p) => setPage(p + 1)}
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ textTransform: 'none', backgroundColor: '#1e40af', '&:hover': { backgroundColor: '#1d4ed8' } }}
          >
            Issue New DD
          </Button>
        }
      />

      {/* DD Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700} color="primary">
            {selectedDD ? 'Edit Demand Draft' : 'Issue Demand Draft'}
          </Typography>
          <IconButton onClick={() => setDialogOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSaveDD}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="DD Number"
                  value={formData.dd_no}
                  onChange={(e) => setFormData({ ...formData, dd_no: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Issue Date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Purchaser Name"
                  value={formData.purchaser_name}
                  onChange={(e) => setFormData({ ...formData, purchaser_name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Beneficiary Name"
                  value={formData.beneficiary_name}
                  onChange={(e) => setFormData({ ...formData, beneficiary_name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Payable At Branch"
                  value={formData.payable_at}
                  onChange={(e) => setFormData({ ...formData, payable_at: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Amount (₹)"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Commission (₹)"
                  value={formData.commission}
                  onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <MenuItem value="issued">Issued</MenuItem>
                  <MenuItem value="cleared">Cleared</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ backgroundColor: '#1e40af', '&:hover': { backgroundColor: '#1d4ed8' } }}>
              {selectedDD ? 'Update DD' : 'Issue DD'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Demand Draft"
        message="Are you sure you want to delete this Demand Draft record?"
        confirmText="Delete"
      />
    </Container>
  );
};

export default DDCreations;
