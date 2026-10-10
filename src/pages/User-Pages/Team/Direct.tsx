import DataTable from 'react-data-table-component';
import { Card, CardContent, Accordion, AccordionSummary, AccordionDetails, TextField, CircularProgress, Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import { DASHBOARD_CUTSOM_STYLE, getDirectColumns, getFormattedDate } from '../../../utils/DataTableColumnsProvider';
import { useGetSponsers } from '../../../api/Memeber';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import useSearch from '../../../hooks/SearchQuery';

import TokenService from '../../../api/token/tokenService';

const Direct = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const memberId = TokenService.getMemberId();
  const { data: sponsers, isLoading, isError, error } = useGetSponsers(memberId);

  useEffect(() => {
    if (isError) toast.error(error.message);
  }, [isError, error]);

  const { searchQuery, setSearchQuery, filteredData } = useSearch(sponsers?.sponsoredUsers || []);

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
            {!isLoading && `List of Direct (${sponsers?.sponsoredUsers?.length || 0})`}
          </AccordionSummary>
          <AccordionDetails sx={{ p: { xs: 1, sm: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mb: 2 }}>
              <TextField
                placeholder="Search direct referrals..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: { xs: '100%', sm: 280 } }}
              />
            </Box>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={"3.5rem"} sx={{ color: "#0a2558" }} />
              </Box>
            ) : isMobile ? (
              filteredData.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: '#64748b' }}>
                  <Typography>No direct referrals found</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {filteredData.map((row: any, idx: number) => (
                    <Paper
                      key={row.Member_id || idx}
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
                            borderRadius: '50%',
                            bgcolor: '#eff6ff',
                            color: '#1d40af',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <PersonIcon sx={{ fontSize: 20 }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                              {row.Name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#0a2558', fontWeight: 700 }}>
                              ID: {row.Member_id}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ px: 1, py: 0.3, borderRadius: '6px', bgcolor: '#f1f5f9', color: '#475569', fontSize: '0.72rem', fontWeight: 700 }}>
                          #{idx + 1}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #f1f5f9', fontSize: '0.78rem', color: '#64748b' }}>
                        <span>📞 {row.mobileno || '-'}</span>
                        <span>DOJ: <strong>{getFormattedDate(row.Date_of_joining)}</strong></span>
                      </Box>

                      {row.Sponsor_name && (
                        <Box sx={{ mt: 0.8, fontSize: '0.75rem', color: '#475569', bgcolor: '#f8fafc', p: 0.8, borderRadius: '8px' }}>
                          Sponsor: <strong>{row.Sponsor_name}</strong> ({row.Sponsor_code})
                        </Box>
                      )}
                    </Paper>
                  ))}
                </Box>
              )
            ) : (
              <DataTable
                columns={getDirectColumns()}
                data={filteredData}
                pagination
                paginationPerPage={25}
                paginationRowsPerPageOptions={[25, 50, 100]}
                highlightOnHover
                customStyles={DASHBOARD_CUTSOM_STYLE}
              />
            )}
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default Direct;
