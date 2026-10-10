import DataTable from 'react-data-table-component';
import { Card, CardContent, Accordion, AccordionSummary, AccordionDetails, TextField, Box, useTheme, useMediaQuery } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DASHBOARD_CUTSOM_STYLE, getLevelBenifitsColumns } from '../../../utils/DataTableColumnsProvider';
import { useGetTransactionDetails } from '../../../api/Memeber';
import TransactionCardsView from '../../../components/common/TransactionCardsView';

const LevelBenifits = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    data: transactionsData,
    isLoading,
    isError,
    error,
  } = useGetTransactionDetails();

  // Ensure transactions is always an array
  const transactions = Array.isArray(transactionsData?.data)
    ? transactionsData.data
    : Array.isArray(transactionsData)
      ? transactionsData
      : [];

  const levelBenefitsData = transactions
    .filter((transaction: any) => {
      if (!transaction || typeof transaction !== 'object') return false;

      const txType = transaction.transaction_type?.toLowerCase() || "";
      const benefitType = transaction.benefit_type?.toLowerCase() || "";

      // Exclude ROI related transactions from this specific page
      if (txType.includes('roi') || benefitType.includes('roi')) return false;

      const matchesLevel =
        benefitType.includes('level') ||
        txType.includes('level') ||
        txType.includes('commission') ||
        txType.includes('payout') ||
        txType.includes('benefit') ||
        (transaction.level !== null && transaction.level !== undefined);

      return matchesLevel;
    })
    .map((transaction: any) => {
      // Helper for ordinal numbers (1st, 2nd, etc.)
      const getOrdinal = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
      };

      const levelStr = transaction.description && transaction.description.toLowerCase().includes('level') 
          ? transaction.description 
          : transaction.level 
            ? `${getOrdinal(transaction.level)} Level Benefit` 
            : 'N/A';

      return {
        id: transaction._id || transaction.transaction_id,
        date: transaction.transaction_date,
        payoutLevel: levelStr,
        memberName: transaction.related_member_name || 'N/A',
        memberId: transaction.related_member_id || 'N/A',
        amount: transaction.ew_credit || '0',
        description: transaction.description,
        transactionType: transaction.transaction_type
      };
    });


  const noDataComponent = (
    <div style={{ padding: '24px' }}>
      No level benefits data available
    </div>
  );

  if (isError) {
    return (
      <Card sx={{ margin: '2rem', mt: 10 }}>
        <CardContent>
          <div style={{ padding: '24px', textAlign: 'center', color: 'red' }}>
            Error loading level benefits data: {error?.message}
          </div>
        </CardContent>
      </Card>
    );
  }

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
            List of Level Benefits ({levelBenefitsData.length})
          </AccordionSummary>
          <AccordionDetails sx={{ p: { xs: 1, sm: 2 } }}>
            {isMobile ? (
              <Box sx={{ pt: 1 }}>
                <TransactionCardsView
                  transactions={levelBenefitsData}
                  isLoading={isLoading}
                  title="Level Benefits"
                  pageSize={15}
                  emptyMessage="No level benefits data available"
                />
              </Box>
            ) : (
              <DataTable
                columns={getLevelBenifitsColumns()}
                data={levelBenefitsData}
                pagination
                customStyles={DASHBOARD_CUTSOM_STYLE}
                paginationPerPage={25}
                paginationRowsPerPageOptions={[25, 50, 100]}
                noDataComponent={noDataComponent}
                highlightOnHover
                progressPending={isLoading}
                subHeader
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

export default LevelBenifits;