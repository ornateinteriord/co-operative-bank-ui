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

const DDCreations: React.FC = () => {
  const [dataList, setDataList] = useState<DDCreationItem[]>(initialData);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = dataList.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.dd_no.toLowerCase().includes(q) ||
      item.purchaser_name.toLowerCase().includes(q) ||
      item.beneficiary_name.toLowerCase().includes(q) ||
      item.payable_at.toLowerCase().includes(q)
    );
  });

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
        <Typography variant="body2">
          {new Date(row.date).toLocaleDateString('en-GB')}
        </Typography>
      ),
    },
    {
      id: 'purchaser_name',
      label: 'Purchaser Name',
      sortable: true,
      minWidth: 170,
    },
    {
      id: 'beneficiary_name',
      label: 'Beneficiary Name (In Favor Of)',
      sortable: true,
      minWidth: 200,
      renderCell: (row: DDCreationItem) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
          {row.beneficiary_name}
        </Typography>
      ),
    },
    {
      id: 'payable_at',
      label: 'Payable At',
      minWidth: 150,
    },
    {
      id: 'amount',
      label: 'DD Amount (₹)',
      sortable: true,
      minWidth: 130,
      align: 'right' as const,
      renderCell: (row: DDCreationItem) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#059669' }}>
          ₹{row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      id: 'commission',
      label: 'Commission (₹)',
      minWidth: 110,
      align: 'right' as const,
      renderCell: (row: DDCreationItem) => (
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          ₹{row.commission.toFixed(2)}
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
            onClick={() => toast.info(`Modify DD ${row.dd_no}`)}
            sx={{ textTransform: 'none', backgroundColor: '#fbbf24', fontSize: '0.75rem', px: 1, '&:hover': { backgroundColor: '#f59e0b' } }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => {
              setDataList((prev) => prev.filter((i) => i.id !== row.id));
              toast.success('DD record deleted');
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
        isLoading={false}
        onSearchChange={setSearchInput}
        onSearch={() => setSearchQuery(searchInput)}
        onClearSearch={() => {
          setSearchInput('');
          setSearchQuery('');
        }}
        searchQuery={searchInput}
        paginationPerPage={10}
        totalCount={filteredData.length}
        currentPage={page - 1}
        onPageChange={(p) => setPage(p + 1)}
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => toast.info('Issue New DD modal')}
            sx={{ textTransform: 'none', backgroundColor: '#1e40af', '&:hover': { backgroundColor: '#1d4ed8' } }}
          >
            Issue New DD
          </Button>
        }
      />
    </Container>
  );
};

export default DDCreations;
