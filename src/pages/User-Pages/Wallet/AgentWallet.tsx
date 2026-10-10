import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Typography,
  Grid,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataTable from "react-data-table-component";
import { useMediaQuery } from "@mui/material";
import {
  DASHBOARD_CUTSOM_STYLE,
  getWalletColumns,
} from "../../../utils/DataTableColumnsProvider";
import TokenService from "../../../api/token/tokenService";
import { useGetAgentWalletOverview, useAgentWalletWithdraw } from "../../../api/Memeber";
import { toast } from "react-toastify";
import TransactionCardsView from "../../../components/common/TransactionCardsView";

const AgentWallet = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [amount, setAmount] = useState("");
  const [netAmount, setNetAmount] = useState(0);
  const [optimisticBalance, setOptimisticBalance] = useState<number | null>(null);

  const memberId = TokenService.getMemberId();

  const {
    data: walletData,
    isLoading,
    refetch,
  } = useGetAgentWalletOverview(memberId);

  const withdrawMutation = useAgentWalletWithdraw(memberId);

  useEffect(() => {
    if (walletData?.balance) {
      const balance = parseFloat(walletData.balance);
      setOptimisticBalance(balance);
    }
  }, [walletData?.balance]);

  const handleAmountChange = (e: any) => {
    const value = e.target.value;
    // Allow only numeric input
    if (value !== "" && !/^\d*$/.test(value)) return;

    setAmount(value);

    if (value && value !== "0") {
      const withdrawalAmount = parseFloat(value);
      // Agent Withdrawal has 0% deduction
      setNetAmount(withdrawalAmount);
    } else {
      setNetAmount(0);
    }
  };

  const handleWithdraw = () => {
    if (!amount || amount === "0") {
      return;
    }

    if (!memberId) {
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    const currentBalance = optimisticBalance !== null ? optimisticBalance : parseFloat(walletData?.balance || 0);

    if (withdrawalAmount > currentBalance) {
      toast.error('Insufficient commission balance');
      return;
    }

    if (withdrawalAmount < 100) {
      toast.error('Minimum withdrawal amount is ₹100');
      return;
    }

    const newBalance = currentBalance - withdrawalAmount;
    setOptimisticBalance(newBalance);

    withdrawMutation.mutate(
      { memberId: memberId, amount: amount },
      {
        onSuccess: () => {
          setAmount("");
          setNetAmount(0);
          refetch();
        },
        onError: () => {
          // Revert optimistic update on error
          setOptimisticBalance(parseFloat(walletData?.balance || 0));
        }
      }
    );
  };

  const displayBalance = Math.max(0, optimisticBalance !== null ? optimisticBalance : parseFloat(walletData?.balance || 0));

  if (isLoading) {
    return (
      <Card
        sx={{
          margin: isMobile ? "1rem" : "2rem",
          mt: 2,
          textAlign: "center",
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress sx={{ color: "#f57f17" }} />
      </Card>
    );
  }

  return (
    <Card
      sx={{
        margin: isMobile ? "0.5rem" : "1rem",
        backgroundColor: "#fff",
        mt: 2,
      }}
    >
      <CardContent sx={{ padding: isMobile ? "12px" : "24px" }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#f57f17" }}>
          Agent Commission Wallet
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 3,
                backgroundColor: "#fff8e1",
                borderRadius: 2,
                textAlign: "center",
                border: `2px solid #f57f17`,
                position: "relative",
              }}
            >
              {withdrawMutation.isPending && (
                <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                  <CircularProgress size={20} sx={{ color: "#f57f17" }} />
                </Box>
              )}
              <Typography variant="subtitle1" color="textSecondary">
                Commission Balance
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  color: "#f57f17",
                  mt: 1,
                  fontWeight: "bold"
                }}
              >
                ₹{displayBalance.toFixed(2)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 3,
                backgroundColor: "#f5f5f5",
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="subtitle1" color="textSecondary">
                Total Earnings
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#388e3c", mt: 1, fontWeight: "bold" }}
              >
                {walletData?.totalIncome ? `₹${walletData?.totalIncome}` : "₹0.00"}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 3,
                backgroundColor: "#f5f5f5",
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="subtitle1" color="textSecondary">
                Total Withdrawn
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#d32f2f", mt: 1, fontWeight: "bold" }}
              >
                {walletData?.totalWithdrawal ? `₹${walletData?.totalWithdrawal}` : "₹0.00"}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Withdrawal Section */}
        <Accordion
          defaultExpanded
          sx={{
            mt: 4,
            boxShadow: "none",
            border: "1px solid #eee",
            borderRadius: "8px !important",
            overflow: "hidden"
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: "#f57f17",
              color: "#fff",
              "& .MuiSvgIcon-root": { color: "#fff" },
              minHeight: "56px",
            }}
          >
            Commission Withdrawal Request (0% Deduction)
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            <form
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <TextField
                label="Available Balance"
                value={`₹${displayBalance.toFixed(2)}`}
                fullWidth
                InputProps={{ readOnly: true }}
                variant="outlined"
              />

              <TextField
                label="Withdrawal Amount"
                type="text"
                value={amount}
                onChange={handleAmountChange}
                fullWidth
                placeholder="Enter amount (Min ₹100)"
                disabled={withdrawMutation.isPending}
                error={parseFloat(amount) > displayBalance}
                helperText={parseFloat(amount) > displayBalance ? "Insufficient Balance" : ""}
              />

              <TextField
                label="Net Amount to Receive"
                value={`₹${netAmount.toFixed(2)}`}
                fullWidth
                InputProps={{ readOnly: true }}
                sx={{
                   "& .MuiOutlinedInput-root": {
                    backgroundColor: "#f1f8e9"
                   }
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "stretch" : "center",
                  gap: 2,
                  mt: 1
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Withdrawal Policy:</strong>
                  </Typography>
                  <Typography variant="body2">• 0% TDS / Deduction for Agent Commission</Typography>
                  <Typography variant="body2">• Minimum withdrawal: ₹100</Typography>
                  <Typography variant="body2">• Request will be processed within 24-48 hours</Typography>
                </Box>

                <Button
                  variant="contained"
                  onClick={handleWithdraw}
                  disabled={
                    withdrawMutation.isPending ||
                    !amount ||
                    amount === "0" ||
                    parseFloat(amount) > displayBalance
                  }
                  sx={{
                    backgroundColor: "#f57f17",
                    minWidth: "150px",
                    height: "48px",
                    fontWeight: "bold",
                    "&:hover": {
                      backgroundColor: "#ef6c00"
                    },
                    "&:disabled": { backgroundColor: "#cccccc" },
                  }}
                >
                  {withdrawMutation.isPending ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    "Withdraw Commission"
                  )}
                </Button>
              </Box>
            </form>
          </AccordionDetails>
        </Accordion>

        {/* Transaction History */}
        <Accordion
          defaultExpanded
          sx={{
            mt: 4,
            boxShadow: "none",
            border: "1px solid #eee",
            borderRadius: "8px !important",
            overflow: "hidden"
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: "#455a64",
              color: "#fff",
              "& .MuiSvgIcon-root": { color: "#fff" },
              minHeight: "56px",
            }}
          >
            Commission History
          </AccordionSummary>
          <AccordionDetails sx={{ p: isMobile ? 1 : 0 }}>
            {walletData?.transactions && walletData.transactions.length > 0 ? (
              isMobile ? (
                <TransactionCardsView
                  transactions={walletData.transactions}
                  title="Commission History"
                  pageSize={10}
                  emptyMessage="No commission records found"
                />
              ) : (
                <DataTable
                  columns={getWalletColumns()}
                  data={walletData.transactions}
                  pagination
                  customStyles={DASHBOARD_CUTSOM_STYLE}
                  paginationPerPage={10}
                  highlightOnHover
                  responsive
                />
              )
            ) : (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Typography variant="h6" color="textSecondary">
                  No commission records found
                </Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default AgentWallet;
