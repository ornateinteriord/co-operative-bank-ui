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
import { useGetJournals, useDeleteJournal } from '../../../queries/banking';
import JournalDialog from '../../../components/Banking/JournalDialog';
import ConfirmDialog from '../../../components/Shared/ConfirmDialog';
import JournalPrint from '../../../components/Print-components/Journal/journal';
import JournalsTablePrint from '../../../components/Print-components/Journal/journals';

interface Journal {
  id: string;
  journal_id: string;
  date: string;
  debit_from: string;
  credit_to?: string;
  description: string;
  mode_of_entry: string;
  amount: number;
  status: 'active' | 'inactive';
  rowNumber?: number;
  member_id?: string;
  account_no?: string;
}

const initialSampleData: Journal[] = [
  {
    id: '1',
    journal_id: 'JRN-000201',
    date: '2026-03-20',
    debit_from: 'Interest Expense Account',
    credit_to: 'Member SB Account (Interest Credit)',
    description: 'Monthly SB interest accrual',
    mode_of_entry: 'Adjustment',
    amount: 15400,
    status: 'active',
    rowNumber: 1,
    member_id: 'MBR001',
    account_no: 'SB-100201',
  },
  {
    id: '2',
    journal_id: 'JRN-000202',
    date: '2026-03-21',
    debit_from: 'Loan Processing Fee',
    credit_to: 'Service Fee Income Account',
    description: 'Processing charge adjustment',
    mode_of_entry: 'Journal',
    amount: 2500,
    status: 'active',
    rowNumber: 2,
    member_id: 'MBR008',
    account_no: 'LN-500108',
  },
  {
    id: '3',
    journal_id: 'JRN-000203',
    date: '2026-03-22',
    debit_from: 'Staff Salary Payable',
    credit_to: 'Bank Current Account',
    description: 'Branch staff payroll entry',
    mode_of_entry: 'Transfer',
    amount: 85000,
    status: 'active',
    rowNumber: 3,
    member_id: 'MBR015',
    account_no: 'CA-200915',
  },
];

const JournalEntries: React.FC = () => {
  const [dataList, setDataList] = useState<Journal[]>(initialSampleData);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedJournalId, setSelectedJournalId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState<string | null>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [journalToPrint, setJournalToPrint] = useState<Journal | null>(null);
  const [tablePrintDialogOpen, setTablePrintDialogOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const tablePrintRef = useRef<HTMLDivElement>(null);

  const { data: journalsData, isLoading } = useGetJournals(page, 10, searchQuery);
  const deleteJournalMutation = useDeleteJournal();

  const currentJournals = (journalsData?.data && journalsData.data.length > 0)
    ? journalsData.data.map((j: any) => ({
        id: j._id || j.journal_id,
        journal_id: j.journal_id || j.journal_no,
        date: j.date ? new Date(j.date).toISOString().split('T')[0] : '',
        debit_from: j.debit_from || '-',
        credit_to: j.credit_to || '-',
        description: j.description || j.narration || '-',
        mode_of_entry: j.mode_of_entry || 'Transfer',
        amount: j.amount || 0,
        status: j.status || 'active',
        member_id: j.member_id,
        account_no: j.account_no,
      }))
    : dataList;

  // Filtered data based on search query
  const filteredData = currentJournals.filter((item: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.journal_id && item.journal_id.toLowerCase().includes(q)) ||
      (item.debit_from && item.debit_from.toLowerCase().includes(q)) ||
      (item.credit_to && item.credit_to.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.member_id && item.member_id.toLowerCase().includes(q)) ||
      (item.account_no && item.account_no.toLowerCase().includes(q)) ||
      (item.mode_of_entry && item.mode_of_entry.toLowerCase().includes(q))
    );
  });

  const totalCount = journalsData?.pagination?.total || filteredData.length;

  const journals: Journal[] = (journalsData?.data && journalsData.data.length > 0)
    ? currentJournals.map((item: any, index: number) => ({ ...item, rowNumber: (page - 1) * 10 + index + 1 }))
    : filteredData.slice((page - 1) * 10, page * 10).map((item: any, index: number) => ({
        ...item,
        rowNumber: (page - 1) * 10 + index + 1,
      }));

  const columns = [
    {
      id: 'excel',
      label: 'Sl No',
      minWidth: 80,
      align: 'center' as const,
      renderCell: (row: Journal) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>
          {row.rowNumber || 1}
        </Typography>
      ),
    },
    {
      id: 'journal_id',
      label: 'Voucher No',
      sortable: true,
      minWidth: 120,
      renderCell: (row: Journal) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#6366f1' }}>
          {row.journal_id}
        </Typography>
      ),
    },
    {
      id: 'date',
      label: 'Date',
      sortable: true,
      minWidth: 130,
      renderCell: (row: Journal) => (
        <Typography variant="body2">
          {new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </Typography>
      ),
    },
    {
      id: 'debit_from',
      label: 'Debit From',
      sortable: true,
      minWidth: 160,
    },
    {
      id: 'credit_to',
      label: 'Credit To',
      sortable: true,
      minWidth: 160,
      renderCell: (row: Journal) => (
        <Typography variant="body2">
          {row.credit_to || '-'}
        </Typography>
      ),
    },
    {
      id: 'member_id',
      label: 'Member ID',
      minWidth: 120,
      renderCell: (row: Journal) => (
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#475569' }}>
          {row.member_id || '-'}
        </Typography>
      ),
    },
    {
      id: 'account_no',
      label: 'Account No',
      minWidth: 130,
      renderCell: (row: Journal) => (
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
      id: 'mode_of_entry',
      label: 'Type',
      minWidth: 130,
      renderCell: (row: Journal) => (
        <Chip
          label={row.mode_of_entry}
          size="small"
          sx={{
            backgroundColor:
              row.mode_of_entry === 'Journal' ? '#dbeafe' :
              row.mode_of_entry === 'Adjustment' ? '#fef3c7' : '#d1fae5',
            color:
              row.mode_of_entry === 'Journal' ? '#1e40af' :
              row.mode_of_entry === 'Adjustment' ? '#92400e' : '#065f46',
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
      renderCell: (row: Journal) => (
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
      renderCell: (row: Journal) => (
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
      renderCell: (row: Journal) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<EditIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleModifyClick(row.journal_id);
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
      renderCell: (row: Journal) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(row.journal_id);
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
      renderCell: (row: Journal) => (
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

  const handleModifyClick = (journalId: string) => {
    setSelectedJournalId(journalId);
    setDialogOpen(true);
  };

  const handleAddJournal = () => {
    setSelectedJournalId(null);
    setDialogOpen(true);
  };

  const handleDeleteClick = (journalId: string) => {
    setJournalToDelete(journalId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (journalToDelete) {
      try {
        await deleteJournalMutation.mutateAsync(journalToDelete);
        toast.success('Journal entry deleted successfully');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to delete journal entry');
      }
      setDataList(prev => prev.filter(item => item.journal_id !== journalToDelete));
      setJournalToDelete(null);
      setConfirmDialogOpen(false);
    }
  };

  const handlePrintPreview = (journal: Journal) => {
    setJournalToPrint(journal);
    setPrintDialogOpen(true);
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const handleTablePrint = useReactToPrint({
    contentRef: tablePrintRef,
  });

  const handleSaveJournal = (savedData: any) => {
    if (selectedJournalId) {
      setDataList(prev => prev.map(item => item.journal_id === selectedJournalId ? { ...item, ...savedData } : item));
    } else {
      setDataList(prev => [savedData, ...prev]);
    }
  };

  const handleExport = () => {
    toast.info('Exporting Journal entries to Excel...');
  };

  const selectedJournalData = currentJournals.find((item: any) => item.journal_id === selectedJournalId);

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
        onClick={handleAddJournal}
        sx={{
          textTransform: 'none',
          backgroundColor: '#10b981',
          '&:hover': { backgroundColor: '#059669' }
        }}
      >
        Add Journal
      </Button>
    </Stack>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, mt: { xs: 7, sm: 8 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 1, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
          List of Journal Entries
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          CREATE, VIEW AND PRINT JOURNAL ENTRIES
        </Typography>
      </Box>

      <AdminReusableTable<Journal>
        columns={columns}
        data={journals}
        title="Journal Management"
        isLoading={isLoading}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        searchQuery={searchInput}
        paginationPerPage={10}
        actions={tableActions}
        onExport={handleExport}
        emptyMessage="No journal entries found"
        totalCount={totalCount}
        currentPage={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
      />

      <JournalDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedJournalId(null);
        }}
        journalId={selectedJournalId}
        initialData={selectedJournalData}
        onSave={handleSaveJournal}
      />

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Journal Entry"
        message="Are you sure you want to delete this journal entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
      />

      {/* Print Preview Dialog */}
      <Dialog
        open={printDialogOpen}
        onClose={() => {
          setPrintDialogOpen(false);
          setJournalToPrint(null);
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
            Journal Print Preview
          </Typography>
          <IconButton
            onClick={() => {
              setPrintDialogOpen(false);
              setJournalToPrint(null);
            }}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, bgcolor: '#f8fafc' }}>
          {journalToPrint && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <JournalPrint
                ref={printRef}
                journalData={{
                  journal_id: journalToPrint.journal_id,
                  journal_date: journalToPrint.date,
                  debit_from: journalToPrint.debit_from,
                  credit_to: journalToPrint.credit_to,
                  journal_details: journalToPrint.description,
                  mode_of_entry: journalToPrint.mode_of_entry,
                  amount: journalToPrint.amount,
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0' }}>
          <Button
            onClick={() => {
              setPrintDialogOpen(false);
              setJournalToPrint(null);
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
            Journal Vouchers List - Print Preview
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
            <JournalsTablePrint
              ref={tablePrintRef}
              journals={filteredData}
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

export default JournalEntries;