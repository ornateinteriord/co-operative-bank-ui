import React, { useState, useRef } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import { useReactToPrint } from 'react-to-print';
import AdminReusableTable from '../../../utils/AdminReusableTable';
import { toast } from 'react-toastify';
import ContraDialog from '../../../components/Banking/ContraDialog';
import ConfirmDialog from '../../../components/Shared/ConfirmDialog';
import ContraPrint from '../../../components/Print-components/Contra/contra';
import ContrasTablePrint from '../../../components/Print-components/Contra/contras';

interface Contra {
  id: string;
  contra_id: string;
  date: string;
  contra_to: string;
  description: string;
  mode_of_contra: string;
  amount: number;
  status: 'active' | 'inactive';
  rowNumber?: number;
  member_id?: string;
  account_no?: string;
}

const initialSampleData: Contra[] = [
  {
    id: '1',
    contra_id: 'CNT-000101',
    date: '2026-03-20',
    contra_to: 'Cash to Main Vault',
    description: 'Daily cash transfer to vault',
    mode_of_contra: 'Cash to Bank',
    amount: 50000,
    status: 'active',
    rowNumber: 1,
    member_id: 'MBR001',
    account_no: 'SB-100201',
  },
  {
    id: '2',
    contra_id: 'CNT-000102',
    date: '2026-03-21',
    contra_to: 'Branch Reserve Account',
    description: 'Inter-branch liquidity balancing',
    mode_of_contra: 'Bank to Bank',
    amount: 100000,
    status: 'active',
    rowNumber: 2,
    member_id: 'MBR005',
    account_no: 'CA-200405',
  },
  {
    id: '3',
    contra_id: 'CNT-000103',
    date: '2026-03-22',
    contra_to: 'Teller Counter 1',
    description: 'Opening cash replenishment',
    mode_of_contra: 'Bank to Cash',
    amount: 25000,
    status: 'active',
    rowNumber: 3,
    member_id: 'MBR012',
    account_no: 'SB-100812',
  },
];

const Contra: React.FC = () => {
  const [dataList, setDataList] = useState<Contra[]>(initialSampleData);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedContraId, setSelectedContraId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [contraToDelete, setContraToDelete] = useState<string | null>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [contraToPrint, setContraToPrint] = useState<Contra | null>(null);
  const [tablePrintDialogOpen, setTablePrintDialogOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const tablePrintRef = useRef<HTMLDivElement>(null);

  // Filtered data based on search query
  const filteredData = dataList.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.contra_id.toLowerCase().includes(q) ||
      item.contra_to.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.member_id && item.member_id.toLowerCase().includes(q)) ||
      (item.account_no && item.account_no.toLowerCase().includes(q)) ||
      item.mode_of_contra.toLowerCase().includes(q)
    );
  });

  const contras: Contra[] = filteredData.slice((page - 1) * 10, page * 10).map((item, index) => ({
    ...item,
    rowNumber: (page - 1) * 10 + index + 1,
  }));

  const columns = [
    {
      id: 'excel',
      label: 'Sl No',
      minWidth: 80,
      align: 'center' as const,
      renderCell: (row: Contra) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
          {row.rowNumber || 1}
        </Typography>
      ),
    },
    {
      id: 'contra_id',
      label: 'Voucher No',
      sortable: true,
      minWidth: 120,
      renderCell: (row: Contra) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#6366f1' }}>
          {row.contra_id}
        </Typography>
      ),
    },
    {
      id: 'date',
      label: 'Date',
      sortable: true,
      minWidth: 130,
      renderCell: (row: Contra) => (
        <Typography variant="body2">
          {new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </Typography>
      ),
    },
    {
      id: 'contra_to',
      label: 'Particulars',
      sortable: true,
      minWidth: 160,
    },
    {
      id: 'member_id',
      label: 'Member ID',
      minWidth: 120,
      renderCell: (row: Contra) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#475569' }}>
          {row.member_id || '-'}
        </Typography>
      ),
    },
    {
      id: 'account_no',
      label: 'Account No',
      minWidth: 130,
      renderCell: (row: Contra) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#475569' }}>
          {row.account_no || '-'}
        </Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 180,
    },
    {
      id: 'mode_of_contra',
      label: 'Mode Of Contra',
      minWidth: 150,
      renderCell: (row: Contra) => (
        <Chip
          label={row.mode_of_contra}
          size="small"
          sx={{
            backgroundColor:
              row.mode_of_contra.includes('Cash') ? '#dbeafe' : '#fef3c7',
            color:
              row.mode_of_contra.includes('Cash') ? '#1e40af' : '#92400e',
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: 'amount',
      label: 'Amount',
      sortable: true,
      minWidth: 120,
      align: 'right' as const,
      renderCell: (row: Contra) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#059669' }}>
          ₹{row.amount.toFixed(2)}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      minWidth: 100,
      align: 'center' as const,
      renderCell: (row: Contra) => (
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
      minWidth: 100,
      align: 'center' as const,
      renderCell: (row: Contra) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<EditIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleModifyClick(row.contra_id);
          }}
          sx={{
            textTransform: 'none',
            backgroundColor: '#fbbf24',
            color: 'white',
            fontSize: '0.75rem',
            px: 2,
            '&:hover': {
              backgroundColor: '#f59e0b',
            }
          }}
        >
          Modify
        </Button>
      ),
    },
    {
      id: 'delete',
      label: 'Delete',
      minWidth: 100,
      align: 'center' as const,
      renderCell: (row: Contra) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(row.contra_id);
          }}
          sx={{
            textTransform: 'none',
            backgroundColor: '#ef4444',
            color: 'white',
            fontSize: '0.75rem',
            px: 2,
            '&:hover': {
              backgroundColor: '#dc2626',
            }
          }}
        >
          Delete
        </Button>
      ),
    },
    {
      id: 'display',
      label: 'Display',
      minWidth: 140,
      align: 'center' as const,
      renderCell: (row: Contra) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<PrintIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handlePrintPreview(row);
          }}
          sx={{
            textTransform: 'none',
            backgroundColor: '#3b82f6',
            color: 'white',
            fontSize: '0.75rem',
            px: 2,
            '&:hover': {
              backgroundColor: '#2563eb',
            }
          }}
        >
          Print Preview
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

  const handleModifyClick = (contraId: string) => {
    setSelectedContraId(contraId);
    setDialogOpen(true);
  };

  const handleAddContra = () => {
    setSelectedContraId(null);
    setDialogOpen(true);
  };

  const handleDeleteClick = (contraId: string) => {
    setContraToDelete(contraId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (contraToDelete) {
      setDataList(prev => prev.filter(item => item.contra_id !== contraToDelete));
      toast.success('Contra voucher deleted successfully');
      setContraToDelete(null);
      setConfirmDialogOpen(false);
    }
  };

  const handlePrintPreview = (contra: Contra) => {
    setContraToPrint(contra);
    setPrintDialogOpen(true);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const handleTablePrint = useReactToPrint({
    contentRef: tablePrintRef,
  });

  const handleSaveContra = (savedData: any) => {
    if (selectedContraId) {
      setDataList(prev => prev.map(item => item.contra_id === selectedContraId ? { ...item, ...savedData } : item));
    } else {
      setDataList(prev => [savedData, ...prev]);
    }
  };

  const handleExport = () => {
    toast.info('Exporting Contra entries to Excel...');
  };

  const selectedContraData = dataList.find(item => item.contra_id === selectedContraId);

  const tableActions = (
    <Stack direction="row" spacing={1}>
      <Button
        variant="contained"
        startIcon={<PrintIcon />}
        onClick={() => setTablePrintDialogOpen(true)}
        sx={{
          textTransform: 'none',
          backgroundColor: '#6366f1',
          '&:hover': { backgroundColor: '#4f46e5' }
        }}
      >
        Print
      </Button>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddContra}
        sx={{
          textTransform: 'none',
          backgroundColor: '#10b981',
          '&:hover': { backgroundColor: '#059669' }
        }}
      >
        Add Contra
      </Button>
    </Stack>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, mt: { xs: 7, sm: 8 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 1, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
          List of Contra Vouchers
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          CREATE, VIEW AND PRINT CONTRA VOUCHERS
        </Typography>
      </Box>

      <AdminReusableTable<Contra>
        columns={columns}
        data={contras}
        title="Contra Management"
        isLoading={false}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        searchQuery={searchInput}
        paginationPerPage={10}
        actions={tableActions}
        onExport={handleExport}
        emptyMessage="No contra vouchers found"
        totalCount={filteredData.length}
        currentPage={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
      />

      <ContraDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedContraId(null);
        }}
        contraId={selectedContraId}
        initialData={selectedContraData}
        onSave={handleSaveContra}
      />

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Contra Voucher"
        message="Are you sure you want to delete this contra entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
      />

      {/* Print Preview Dialog */}
      <Dialog
        open={printDialogOpen}
        onClose={() => {
          setPrintDialogOpen(false);
          setContraToPrint(null);
        }}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '16px' }
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Contra Print Preview
          </Typography>
          <IconButton
            onClick={() => {
              setPrintDialogOpen(false);
              setContraToPrint(null);
            }}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: '#f8fafc' }}>
          {contraToPrint && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <ContraPrint
                ref={printRef}
                contraData={{
                  contra_id: contraToPrint.contra_id,
                  contra_date: contraToPrint.date,
                  contra_to: contraToPrint.contra_to,
                  contra_details: contraToPrint.description,
                  mode_of_contra: contraToPrint.mode_of_contra,
                  amount: contraToPrint.amount,
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
          <Button
            onClick={() => {
              setPrintDialogOpen(false);
              setContraToPrint(null);
            }}
            color="inherit"
          >
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => handlePrint()}
            sx={{
              backgroundColor: '#6366f1',
              '&:hover': { backgroundColor: '#4f46e5' }
            }}
          >
            Print Voucher
          </Button>
        </DialogActions>
      </Dialog>

      {/* Table Print Dialog */}
      <Dialog
        open={tablePrintDialogOpen}
        onClose={() => setTablePrintDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '16px' }
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Contra Vouchers List - Print Preview
          </Typography>
          <IconButton
            onClick={() => setTablePrintDialogOpen(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: '#f8fafc' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <ContrasTablePrint
              ref={tablePrintRef}
              contras={filteredData}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setTablePrintDialogOpen(false)} color="inherit">
            Close
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => handleTablePrint()}
            sx={{
              backgroundColor: '#6366f1',
              '&:hover': { backgroundColor: '#4f46e5' }
            }}
          >
            Print List
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Contra;
