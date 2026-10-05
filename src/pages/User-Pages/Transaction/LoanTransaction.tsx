import DataTable from "react-data-table-component";
import {
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  CircularProgress,
  Box,
  Typography,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import {
  DASHBOARD_CUTSOM_STYLE,
  getTransactionColumns,
} from "../../../utils/DataTableColumnsProvider";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useGetTransactionDetails } from "../../../api/Memeber";

const LoanTransaction = () => {
  const navigate = useNavigate();
  const {
    data: transactionsResponse,
    isLoading,
    isError,
    error,
  } = useGetTransactionDetails();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<any[]>([]);

  useEffect(() => {
    if (isError) {
      const err = error as any;
      toast.error(
        err?.response?.data?.message || "Failed to fetch Loan transactions"
      );
    }
  }, [isError, error]);

  // Safely extract and filter transactions
  useEffect(() => {
    // Extract transactions from the response object
    const transactions = transactionsResponse?.data || [];

    console.log("Loan Transactions Response:", transactionsResponse);
    console.log("Extracted transactions:", transactions);
    console.log("Is array?", Array.isArray(transactions));

    if (Array.isArray(transactions)) {
      // Filter only loan-related transactions EXCEPT "Approved" status
      const loanTransactions = transactions.filter((tx: any) => {
        const transactionType = tx.transaction_type?.toLowerCase() || '';
        const description = tx.description?.toLowerCase() || '';
        const benefitType = tx.benefit_type?.toLowerCase() || '';
        const status = tx.status?.toLowerCase() || '';

        // Check if it's a loan transaction but NOT "Approved" status
        const isLoanTransaction = (
          transactionType.includes('loan') ||
          description.includes('loan') ||
          transactionType.includes('repayment') ||
          description.includes('repayment') ||
          benefitType.includes('loan')
        );

        // Exclude transactions with "Approved" status
        const isNotApproved = status !== 'approved';

        return isLoanTransaction && isNotApproved;
      });

      console.log("Loan transactions found (excluding Approved):", loanTransactions.length);

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchedData = loanTransactions.filter((tx: any) =>
          Object.values(tx).some(value =>
            value?.toString().toLowerCase().includes(query)
          )
        );
        setFilteredData(searchedData);
      } else {
        setFilteredData(loanTransactions);
      }
    } else {
      setFilteredData([]);
    }
  }, [transactionsResponse, searchQuery]);

  const noDataComponent = (
    <Box sx={{ padding: "24px", textAlign: "center" }}>
      <Typography variant="h6" color="textSecondary">
        No loan transactions available
      </Typography>
    </Box>
  );

  if (isLoading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 4 }, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={"3.5rem"} sx={{ color: "#0a2558" }} />
      </Box>
    );
  }

  return (
    <Box sx={{
      px: { xs: 1.5, sm: 3, md: 4 },
      py: { xs: 2, md: 3 },
      pb: { xs: 12, md: 6 },
      maxWidth: '1600px',
      margin: '0 auto',
    }}>
      {/* Top Header Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 2, md: 3 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/user/loans')}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            color: '#0a2558',
            borderRadius: '12px',
            bgcolor: 'white',
            px: { xs: 1.5, sm: 2 },
            py: 0.8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            '&:hover': { bgcolor: '#f8fafc' },
          }}
        >
          Back to My Loans
        </Button>
      </Box>

      <Card sx={{
        borderRadius: { xs: '16px', md: '20px' },
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          <Accordion defaultExpanded sx={{ boxShadow: 'none' }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: "#0a2558",
                color: "#fff",
                borderRadius: '12px',
                "& .MuiSvgIcon-root": { color: "#fff" },
                fontWeight: 700,
              }}
            >
              Loan Transactions ({filteredData.length})
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 0.5, sm: 1.5 }, py: 2 }}>
              <DataTable
                columns={getTransactionColumns()}
                data={filteredData}
                pagination
                customStyles={DASHBOARD_CUTSOM_STYLE}
                paginationPerPage={25}
                paginationRowsPerPageOptions={[25, 50, 100]}
                highlightOnHover
                responsive
                progressPending={false}
                noDataComponent={noDataComponent}
                subHeader
                subHeaderComponent={
                  <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', sm: 'center' },
                    width: '100%',
                    gap: 1.5,
                    p: 1,
                  }}>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.78rem', sm: '0.875rem' } }}>
                      Showing {filteredData.length} loan transactions (excluding Approved status)
                    </Typography>
                    <TextField
                      placeholder="Search loan transactions..."
                      variant="outlined"
                      size="small"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      sx={{
                        width: { xs: '100%', sm: 260 },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                          fontSize: '0.85rem',
                        },
                      }}
                    />
                  </Box>
                }
              />
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoanTransaction;