import DataTable from 'react-data-table-component';
import { Card, CardContent, Accordion, AccordionSummary, AccordionDetails, TextField, CircularProgress, Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { DASHBOARD_CUTSOM_STYLE, getUsedPackageColumns, getFormattedDate } from '../../../utils/DataTableColumnsProvider';
import { getUsedandUnusedPackages } from '../../../api/Memeber';
import TokenService from '../../../api/token/tokenService';
import { useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import UserContext from '../../../context/user/userContext';
import useSearch from '../../../hooks/SearchQuery';

const UsedPackage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const memberId = TokenService.getMemberId();
  const { user } = useContext(UserContext);

  const { data: usedPackage, isLoading, error, isError } = getUsedandUnusedPackages({
    memberId: memberId,
    status: 'used'
  });

  useEffect(() => {
    if (isError) {
      const err = error as any;

      toast.error(
        err?.response.data.message || "Failed to fetch package details"
      );
    }
  }, [isError, error]);

  const { searchQuery, setSearchQuery, filteredData } = useSearch(usedPackage);

  return (
    <Card sx={{ margin: { xs: '0.75rem', sm: '2rem' }, mt: { xs: 4, sm: 10 }, borderRadius: '16px' }}>
      <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
        <Accordion defaultExpanded sx={{ boxShadow: 'none' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: '#0a2558',
              color: '#fff',
              borderRadius: '12px',
              '& .MuiSvgIcon-root': { color: '#fff' }
            }}
          >
            List of Used Package ({filteredData?.length || 0})
          </AccordionSummary>
          <AccordionDetails sx={{ p: { xs: 1, sm: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mb: 2 }}>
              <TextField
                placeholder="Search used packages..."
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
                  <Typography>No used packages found</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {filteredData.map((row: any, idx: number) => (
                    <Paper
                      key={row.epin_no || idx}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '14px',
                        border: '1px solid #e2e8f0',
                        bgcolor: '#ffffff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            width: 34,
                            height: 34,
                            borderRadius: '10px',
                            bgcolor: '#f1f5f9',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0a2558' }}>
                              Code: {row.epin_no}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                              Date: {getFormattedDate(row.date)}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.05rem' }}>
                          ₹{Number(row.amount || 0).toLocaleString()}
                        </Typography>
                      </Box>

                      <Box sx={{ pt: 1, borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 0.5, fontSize: '0.78rem', color: '#64748b' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Used For: <strong style={{ color: '#0f172a' }}>{row.used_for || '-'}</strong></span>
                          <span>Used On: <strong>{getFormattedDate(row.used_on)}</strong></span>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                          <span>Purchased By: {user?.Name || row.purchasedby}</span>
                          <Box sx={{ px: 1, py: 0.2, borderRadius: '6px', bgcolor: '#f1f5f9', color: '#475569', fontWeight: 700, fontSize: '0.72rem' }}>
                            USED
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )
            ) : (
              <DataTable
                columns={getUsedPackageColumns(user)}
                data={filteredData}
                pagination
                customStyles={DASHBOARD_CUTSOM_STYLE}
                paginationPerPage={25}
                paginationRowsPerPageOptions={[25, 50, 100]}
                highlightOnHover
              />
            )}
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default UsedPackage;