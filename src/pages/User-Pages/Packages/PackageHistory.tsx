import { Card, CardContent, Accordion, AccordionSummary, AccordionDetails, TextField, Box, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DataTable from 'react-data-table-component';
import { useMediaQuery } from '@mui/material';
import { DASHBOARD_CUTSOM_STYLE, getUserPackageHistoryColumns } from '../../../utils/DataTableColumnsProvider';
import { useGetPackagehistory } from '../../../api/Memeber';
import { CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import useSearch from '../../../hooks/SearchQuery';

const PackageHistory = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const { data: historyData, isLoading, isError, error } = useGetPackagehistory();
  const { filteredData, searchQuery, setSearchQuery } = useSearch(historyData);

  useEffect(() => {
    const err = error as any;
    if (isError) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    }
  }, [isError, error]);

  return (
    <Card sx={{
      margin: isMobile ? '1rem' : '2rem',
      backgroundColor: '#fff',
      mt: 10
    }}>
      <CardContent sx={{ padding: isMobile ? '12px' : '24px' }}>
        <Accordion
          defaultExpanded
          sx={{
            boxShadow: 'none',
            '&.MuiAccordion-root': {
              backgroundColor: '#fff'
            }
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: '#0a2558',
              color: '#fff',
              '& .MuiSvgIcon-root': { color: '#fff' },
              minHeight: isMobile ? '48px' : '64px',
            }}
          >
            Package History
          </AccordionSummary>
          <AccordionDetails sx={{ p: isMobile ? 1 : 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mb: 2 }}>
              <TextField
                placeholder="Search package history..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: { xs: '100%', sm: 280 } }}
              />
            </Box>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : isMobile ? (
              filteredData.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: '#64748b' }}>
                  No package history found
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {filteredData.map((row: any, idx: number) => (
                    <Box
                      key={row._id || idx}
                      sx={{
                        p: 2,
                        borderRadius: '14px',
                        border: '1px solid #e2e8f0',
                        bgcolor: '#ffffff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0a2558' }}>
                          {row.package || 'Package'}
                        </Typography>
                        <Box sx={{ px: 1.2, py: 0.3, borderRadius: '6px', bgcolor: '#eff6ff', color: '#1e40af', fontWeight: 800, fontSize: '0.78rem' }}>
                          Qty: {row.quantity || 1}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                        <span>Transferred To: <strong style={{ color: '#0f172a' }}>{row.transfered_to || '-'}</strong></span>
                        <span>{row.date ? new Date(row.date).toLocaleDateString('en-GB') : '-'}</span>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )
            ) : (
              <DataTable
                columns={getUserPackageHistoryColumns()}
                data={filteredData}
                pagination
                customStyles={DASHBOARD_CUTSOM_STYLE}
                paginationPerPage={25}
                paginationRowsPerPageOptions={[25, 50, 100]}
                highlightOnHover
                noDataComponent={<div>No data found</div>}
                responsive
              />
            )}
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default PackageHistory;
