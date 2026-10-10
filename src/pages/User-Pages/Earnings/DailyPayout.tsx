import DataTable from 'react-data-table-component';
import { Card, CardContent, Accordion, AccordionSummary, AccordionDetails, TextField, Box, useTheme, useMediaQuery } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DASHBOARD_CUTSOM_STYLE, getDailyPayoutColumns } from '../../../utils/DataTableColumnsProvider';
import TokenService from '../../../api/token/tokenService';
import { useGetDailyPayout } from '../../../api/Memeber';
import TransactionCardsView from '../../../components/common/TransactionCardsView';

const DailyPayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const memberId = TokenService.getMemberId();
  const { data = [] } = useGetDailyPayout(memberId);

  console.log('Daily Payout Data:', data);

  const noDataComponent = <div style={{ padding: '24px' }}>No data available in table</div>;

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
            Daily ROI Details ({data?.length || 0})
          </AccordionSummary>
          <AccordionDetails sx={{ p: { xs: 1, sm: 2 } }}>
            {isMobile ? (
              <Box sx={{ pt: 1 }}>
                <TransactionCardsView
                  transactions={data}
                  title="Daily ROI Details"
                  pageSize={15}
                  emptyMessage="No daily ROI payouts found"
                />
              </Box>
            ) : (
              <DataTable
                columns={getDailyPayoutColumns()}
                data={data}
                pagination
                customStyles={DASHBOARD_CUTSOM_STYLE}
                paginationPerPage={25}
                paginationRowsPerPageOptions={[25, 50, 100]}
                noDataComponent={noDataComponent}
                subHeader
                highlightOnHover
                subHeaderComponent={
                  <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', padding: '0.5rem' }}>
                    <TextField
                      placeholder="Search"
                      variant="outlined"
                      size="small"
                    />
                  </div>
                }
              />
            )}
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default DailyPayout;
