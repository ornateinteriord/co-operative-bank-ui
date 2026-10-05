import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Chip,
  Button,
  Avatar,
  Alert,
  Snackbar,
  Typography,
  Stack,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import { useReactToPrint } from 'react-to-print';
import AdminReusableTable from '../../utils/AdminReusableTable';
import AgentModifyDialog from '../../utils/AgentModifyDialog';
import TablePDF, { PrintColumn } from '../../components/Print-components/TablePDF';
import {
  useGetAgents,
  useCreateAgent,
  useUpdateAgent,
  Agent as AgentType
} from '../../queries/admin/index';
import { exportToExcel } from '../../utils/excelExport';


interface Agent {
  id: string;
  date: string;
  name: string;
  email: string;
  mobile: string;
  status: 'Active' | 'Inactive' | 'Blocked';
  designation: string;
  action: string;
  agent_id: string;
  gender: string;
  dob: string;
  address: string;
  pan_no: string;
  aadharcard_no: string;
  introducer: string;
  branch_id: string;
  role?: string;
  password?: string;
}

const Agents: React.FC = () => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const tablePrintRef = useRef<HTMLDivElement>(null);

  // React Query Hooks
  const { data: agentsData, isLoading } = useGetAgents(page, rowsPerPage, searchQuery);
  // Fetch all agents for printing (without pagination)
  const { data: allAgentsData } = useGetAgents(1, 9999, '');
  const createAgentMutation = useCreateAgent();
  const updateAgentMutation = useUpdateAgent();

  // Print columns configuration
  const printColumns: PrintColumn[] = [
    { id: 'agent_id', label: 'Agent ID', width: '10%' },
    { id: 'displayName', label: 'Name', width: '15%' },
    { id: 'email', label: 'Email', width: '15%' },
    { id: 'mobile', label: 'Mobile', width: '12%' },
    { id: 'designation', label: 'Designation', width: '10%' },
    { id: 'gender', label: 'Gender', width: '8%', align: 'center' },
    { id: 'dob', label: 'DOB', width: '10%' },
    { id: 'pan_no', label: 'PAN No', width: '10%' },
    { id: 'status', label: 'Status', width: '10%', align: 'center' },
  ];


  // Transform API data to table format
  const agents: Agent[] = agentsData?.data?.map((agent: AgentType) => ({
    id: agent._id || '',
    agent_id: agent.agent_id,
    date: agent.date_of_joining
      ? new Date(agent.date_of_joining).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
      : '-',
    name: `${agent.name || '-'} (${agent.agent_id})`,
    email: agent.emailid || '-',
    mobile: agent.mobile || '-',
    status: (agent.status === 'active' ? 'Active' : 'Inactive') as 'Active' | 'Inactive' | 'Blocked',
    designation: agent.designation || '-',
    action: '',
    gender: agent.gender || '-',
    dob: agent.dob
      ? new Date(agent.dob).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
      : '-',
    address: agent.address || '-',
    pan_no: agent.pan_no || '-',
    aadharcard_no: agent.aadharcard_no || '-',
    introducer: agent.introducer || '-',
    branch_id: agent.branch_id || '-'
  })) || [];

  const columns = [
    {
      id: 'date',
      label: 'Date',
      sortable: true,
      minWidth: 120,
    },
    {
      id: 'name',
      label: 'Agent',
      sortable: true,
      minWidth: 200,
      renderCell: (row: Agent) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: getAvatarColor(row.name),
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {getInitials(row.name.split(' (')[0])}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
              {row.name.split(' (')[0]}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              {row.name.match(/\((.*?)\)/)?.[1] || ''}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      sortable: true,
      minWidth: 200,
      renderCell: (row: Agent) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <EmailIcon sx={{ color: '#64748b', fontSize: 16 }} />
          <Typography variant="body2" sx={{ color: '#475569' }}>
            {row.email}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'mobile',
      label: 'Mobile',
      minWidth: 150,
      renderCell: (row: Agent) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <PhoneIcon sx={{ color: '#64748b', fontSize: 16 }} />
          <Typography variant="body2" sx={{ color: '#475569' }}>
            {row.mobile}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'designation',
      label: 'Designation',
      sortable: true,
      minWidth: 120,
      align: 'center' as const,
      renderCell: (row: Agent) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.designation}
        </Typography>
      ),
    },
    {
      id: 'gender',
      label: 'Gender',
      sortable: true,
      minWidth: 100,
      align: 'center' as const,
      renderCell: (row: Agent) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.gender}
        </Typography>
      ),
    },
    {
      id: 'dob',
      label: 'Date of Birth',
      sortable: true,
      minWidth: 120,
      align: 'center' as const,
      renderCell: (row: Agent) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.dob}
        </Typography>
      ),
    },
    {
      id: 'address',
      label: 'Address',
      minWidth: 200,
      renderCell: (row: Agent) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.address}
        </Typography>
      ),
    },
    {
      id: 'pan_no',
      label: 'PAN No',
      minWidth: 120,
      align: 'center' as const,
      renderCell: (row: Agent) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.pan_no}
        </Typography>
      ),
    },
    {
      id: 'aadharcard_no',
      label: 'Aadhar No',
      minWidth: 130,
      align: 'center' as const,
      renderCell: (row: Agent) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.aadharcard_no}
        </Typography>
      ),
    },
    {
      id: 'introducer',
      label: 'Introducer ID',
      minWidth: 130,
      align: 'center' as const,
      renderCell: (row: Agent) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.introducer}
        </Typography>
      ),
    },
    {
      id: 'branch_id',
      label: 'Branch ID',
      minWidth: 120,
      align: 'center' as const,
      renderCell: (row: Agent) => (
        <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.9rem', fontWeight: 500 }}>
          {row.branch_id}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      minWidth: 100,
      align: 'center' as const,
      renderCell: (row: Agent) => (
        <Chip
          label={row.status}
          size="small"
          sx={{
            backgroundColor:
              row.status === 'Active' ? '#d1fae5' :
                row.status === 'Inactive' ? '#f1f5f9' : '#fee2e2',
            color:
              row.status === 'Active' ? '#065f46' :
                row.status === 'Inactive' ? '#64748b' : '#991b1b',
            fontWeight: 600,
            borderRadius: 1,
          }}
        />
      ),
    },
    {
      id: 'modify',
      label: 'Modify',
      minWidth: 100,
      align: 'center' as const,
      renderCell: (row: Agent) => (
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleModifyClick(row.agent_id);
          }}
          sx={{
            textTransform: 'none',
            borderRadius: 1,
            borderColor: '#cbd5e1',
            color: '#475569',
            fontSize: '0.75rem',
            px: 2,
            '&:hover': {
              borderColor: '#94a3b8',
              backgroundColor: '#f8fafc',
            }
          }}
        >
          Modify
        </Button>
      ),
    },
    {
      id: 'action',
      label: 'Action',
      minWidth: 120,
      align: 'center' as const,
      renderCell: (row: Agent) => (
        <Button
          variant="outlined"
          size="small"
          startIcon={<BlockIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleActionClick(row);
          }}
          sx={{
            textTransform: 'none',
            borderRadius: 1,
            borderColor: row.status === 'Active' ? '#ef4444' : '#10b981',
            color: row.status === 'Active' ? '#ef4444' : '#10b981',
            fontSize: '0.75rem',
            px: 2,
            '&:hover': {
              backgroundColor: row.status === 'Active' ? '#fef2f2' : '#d1fae5',
            }
          }}
        >
          {row.status === 'Active' ? 'Inactive' : 'Active'}
        </Button>
      ),
    },
  ];

  const getAvatarColor = (name: string) => {
    const colors = ['#1a237e', '#283593', '#311b92', '#4a148c', '#006064'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

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

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page when changing rows per page
  };

  const handleModifyClick = (agentId: string) => {
    setSelectedAgentId(agentId);
    setModifyDialogOpen(true);
  };

  const handleAddAgent = () => {
    setSelectedAgentId(null); // null = create mode
    setModifyDialogOpen(true);
  };

  const handleActionClick = (agent: Agent) => {
    const newStatus = agent.status === 'Active' ? 'Inactive' : 'Active';

    // Call update API to change status
    updateAgentMutation.mutate(
      {
        agentId: agent.agent_id,
        data: { status: newStatus.toLowerCase() }
      },
      {
        onSuccess: () => {
          setSnackbar({
            open: true,
            message: `${agent.name.split(' (')[0]} has been ${newStatus.toLowerCase()}`,
            severity: 'info'
          });
        },
        onError: (error: any) => {
          setSnackbar({
            open: true,
            message: error?.message || 'Failed to update agent status',
            severity: 'error'
          });
        }
      }
    );
  };

  // Transform all agents data for printing/export
  const allAgentsForExport = (allAgentsData?.data || []).map((agent: AgentType) => ({
    id: agent._id || '',
    agent_id: agent.agent_id,
    displayName: agent.name || '-',
    email: agent.emailid || '-',
    mobile: agent.mobile || '-',
    designation: agent.designation || '-',
    gender: agent.gender || '-',
    dob: agent.dob
      ? new Date(agent.dob).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
      : '-',
    pan_no: agent.pan_no || '-',
    aadharcard_no: agent.aadharcard_no || '-',
    status: agent.status === 'active' ? 'Active' : 'Inactive',
  }));

  const handleTablePrint = useReactToPrint({
    contentRef: tablePrintRef,
  });

  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  const handlePrintClick = () => {
    handleExportMenuClose();
    setPrintDialogOpen(true);
  };

  const handleExcelExport = () => {
    handleExportMenuClose();
    setIsExporting(true);

    // Use setTimeout to allow the UI to show the loader before the heavy synchronous export task runs
    setTimeout(() => {
      const dataToExport = (allAgentsData?.data || []).map((agent: AgentType) => ({
        date: agent.date_of_joining ? new Date(agent.date_of_joining).toLocaleDateString('en-GB') : '-',
        agent_id: agent.agent_id,
        displayName: `${agent.name} (${agent.agent_id})`,
        email: agent.emailid || '-',
        mobile: agent.mobile || '-',
        designation: agent.designation || '-',
        gender: agent.gender || '-',
        dob: agent.dob ? new Date(agent.dob).toLocaleDateString('en-GB') : '-',
        address: agent.address || '-',
        pan_no: agent.pan_no || '-',
        aadharcard_no: agent.aadharcard_no || '-',
        introducer: agent.introducer || '-',
        branch_id: agent.branch_id || '-',
        status: agent.status ? (agent.status.charAt(0).toUpperCase() + agent.status.slice(1)) : '-'
      }));

      exportToExcel({
        fileName: `Agents_List_${new Date().toISOString().split('T')[0]}`,
        title: 'Manipal Society - Agents List',
        columns: [
          { header: 'Date', key: 'date', width: 15 },
          { header: 'Agent ID', key: 'agent_id', width: 15 },
          { header: 'Name', key: 'displayName', width: 25 },
          { header: 'Email', key: 'email', width: 25 },
          { header: 'Mobile', key: 'mobile', width: 15 },
          { header: 'Designation', key: 'designation', width: 15 },
          { header: 'Gender', key: 'gender', width: 10 },
          { header: 'DOB', key: 'dob', width: 15 },
          { header: 'Address', key: 'address', width: 30 },
          { header: 'PAN No', key: 'pan_no', width: 15 },
          { header: 'Aadhar No', key: 'aadharcard_no', width: 15 },
          { header: 'Introducer', key: 'introducer', width: 15 },
          { header: 'Branch ID', key: 'branch_id', width: 15 },
          { header: 'Status', key: 'status', width: 12 }
        ],
        data: dataToExport,
        statusField: 'status'
      });

      setIsExporting(false);
      setSnackbar({
        open: true,
        message: 'Agents data exported to Excel successfully',
        severity: 'success'
      });
    }, 100);
  };

  const handleModifySave = (data: any, isEdit?: boolean) => {
    if (isEdit && selectedAgentId) {
      // Update existing agent
      updateAgentMutation.mutate(
        {
          agentId: selectedAgentId,
          data: data
        },
        {
          onSuccess: () => {
            setSnackbar({
              open: true,
              message: 'Agent updated successfully',
              severity: 'success'
            });
            setModifyDialogOpen(false);
          },
          onError: (error: any) => {
            setSnackbar({
              open: true,
              message: error?.response?.data?.message || error?.message || 'Failed to update agent',
              severity: 'error'
            });
          }
        }
      );
    } else {
      // Create new agent
      createAgentMutation.mutate(data, {
        onSuccess: (res: any) => {
          const newAgentId = res?.data?.agent_id;
          setSnackbar({
            open: true,
            message: newAgentId
              ? `Agent created successfully! Agent ID: ${newAgentId}`
              : 'Agent created successfully',
            severity: 'success'
          });
          setModifyDialogOpen(false);
        },
        onError: (error: any) => {
          setSnackbar({
            open: true,
            message: error?.response?.data?.message || error?.message || 'Failed to create agent',
            severity: 'error'
          });
        }
      });
    }
  };

  const tableActions = (
    <Stack direction="row" spacing={1}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddAgent}
        sx={{
          textTransform: 'none',
          borderRadius: 1,
          backgroundColor: '#1a237e',
          '&:hover': { backgroundColor: '#283593' }
        }}
      >
        Add Agent
      </Button>
      <Button
        variant="outlined"
        startIcon={<FileDownloadIcon />}
        onClick={handleExportMenuOpen}
        sx={{
          textTransform: 'none',
          borderRadius: 1,
          borderColor: '#cbd5e1',
          color: '#475569',
        }}
      >
        Export
      </Button>
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handlePrintClick}>
          <PrintIcon sx={{ mr: 1, fontSize: 20 }} />
          Print
        </MenuItem>
        <MenuItem onClick={handleExcelExport}>
          <FileDownloadIcon sx={{ mr: 1, fontSize: 20 }} />
          Excel
        </MenuItem>
      </Menu>
    </Stack>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Page Header */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 1, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
          List of Agent
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Manage and monitor all registered agents in the system
        </Typography>
      </Box>

      {/* Main Table */}
      <AdminReusableTable<Agent>
        columns={columns}
        data={agents}
        title="Agent Management"
        isLoading={isLoading}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch}
        searchQuery={searchInput}
        paginationPerPage={rowsPerPage}
        actions={tableActions}
        emptyMessage="No agents found"
        totalCount={agentsData?.pagination?.total}
        currentPage={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {/* Modify Dialog */}
      <AgentModifyDialog
        open={modifyDialogOpen}
        onClose={() => {
          setModifyDialogOpen(false);
          setSelectedAgentId(null);
        }}
        onSave={handleModifySave}
        agentId={selectedAgentId}
        isLoading={createAgentMutation.isPending || updateAgentMutation.isPending}
      />

      {/* Export Loader */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isExporting}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress color="inherit" />
          <Typography variant="h6">Exporting to Excel...</Typography>
        </Stack>
      </Backdrop>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: 1,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Print Preview Dialog */}
      <Dialog
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Agents Print Preview
          </Typography>
          <IconButton
            onClick={() => setPrintDialogOpen(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, backgroundColor: '#f3f4f6' }}>
          <Box sx={{ maxHeight: '70vh', overflow: 'auto', p: 2 }}>
            <TablePDF
              ref={tablePrintRef}
              title="Agent Register"
              columns={printColumns}
              data={allAgentsForExport}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={() => setPrintDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
            }}
          >
            Close
          </Button>
          <Button
            onClick={handleTablePrint}
            variant="contained"
            startIcon={<PrintIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Agents;