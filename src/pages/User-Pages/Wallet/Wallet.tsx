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
  Stack,
  Paper,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DataTable from "react-data-table-component";
import { useMediaQuery } from "@mui/material";
import {
  DASHBOARD_CUTSOM_STYLE,
  getWalletColumns,
} from "../../../utils/DataTableColumnsProvider";
import TokenService from "../../../api/token/tokenService";
import { useGetWalletOverview, useWalletWithdraw } from "../../../api/Memeber";
import { toast } from "react-toastify";

const Wallet = () => {
  const isMobile = useMediaQuery("(max-width:899px)");
  const [amount, setAmount] = useState("");
  const [tds, setTds] = useState(0); const [netAmount, setNetAmount] = useState(0);
  const [optimisticBalance, setOptimisticBalance] = useState<number | null>(null);
  const [isWithdrawalAllowed, setIsWithdrawalAllowed] = useState<boolean>(true);
  // const [ setLoanStatusMessage] = useState<string>("");

  const memberId = TokenService.getMemberId();

  const {
    data: walletData,
    isLoading,
    refetch,
  } = useGetWalletOverview(memberId);

  const withdrawMutation = useWalletWithdraw(memberId);

  useEffect(() => {
    if (walletData?.data?.balance) {
      const balance = parseFloat(walletData.data.balance);
      setOptimisticBalance(balance);
    }

    // Check withdrawal allowance from API response
    if (walletData?.loanStatus) {
      setIsWithdrawalAllowed(walletData.loanStatus.isWithdrawalAllowed);
      // setLoanStatusMessage(walletData.loanStatus.message || "");
    }
  }, [walletData?.data?.balance, walletData?.loanStatus]);

  const handleAmountChange = (e: any) => {
    const value = e.target.value;
    // Allow only numeric input
    if (value !== "" && !/^\d*$/.test(value)) return;

    setAmount(value);

    if (value && value !== "0") {
      const withdrawalAmount = parseFloat(value);
      const tdsAmount = withdrawalAmount * 0.05; // 5% TDS
      const calculatedNetAmount = withdrawalAmount - tdsAmount;

      setTds(tdsAmount);
      setNetAmount(calculatedNetAmount);
    } else {
      setTds(0);
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
          setTds(0);
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
          mt: 1, // Further reduced top margin
          textAlign: "center",
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress sx={{ color: "#0a2558" }} />
      </Card>
    );
  }

  return (
    <Card
      sx={{
        margin: isMobile ? "0.5rem" : "1rem",
        backgroundColor: "#fff",
        mt: 1, // Further reduced top margin
      }}
    >
      <CardContent sx={{ padding: isMobile ? "12px" : "24px" }}>
        <Accordion
          defaultExpanded
          sx={{
            boxShadow: "none",
            "&.MuiAccordion-root": {
              backgroundColor: "#fff",
            },
          }}
        >
          <AccordionDetails>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 3,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    textAlign: "center",
                    border: `2px solid ${isWithdrawalAllowed ? "#0a2558" : "#ff9800"}`,
                    position: "relative",
                    opacity: isWithdrawalAllowed ? 1 : 0.7,
                  }}
                >
                  {withdrawMutation.isPending && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                      }}
                    >
                      <CircularProgress size={20} sx={{ color: "#0a2558" }} />
                    </Box>
                  )}
                  <Typography variant="subtitle1" color="textSecondary">
                    Available Balance
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: isWithdrawalAllowed ? "#0a2558" : "#ff9800",
                      mt: 1,
                      fontWeight: "bold"
                    }}
                  >
                    ₹{displayBalance.toFixed(2)}
                  </Typography>
                  {!isWithdrawalAllowed && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#ff9800",
                        mt: 1,
                        display: "block",
                        fontWeight: "bold"
                      }}
                    >
                      Withdrawal Disabled
                    </Typography>
                  )}
                  {withdrawMutation.isPending && (
                    <Typography
                      variant="caption"
                      sx={{ color: "#0a2558", mt: 1, display: "block" }}
                    >
                      Updating...
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 3,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 2,
                    textAlign: "center",
                    opacity: isWithdrawalAllowed ? 1 : 0.7,
                  }}
                >
                  <Typography variant="subtitle1" color="textSecondary">
                    Total Income
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ color: "#0a2558", mt: 1, fontWeight: "bold" }}
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
                    opacity: isWithdrawalAllowed ? 1 : 0.7,
                  }}
                >
                  <Typography variant="subtitle1" color="textSecondary">
                    Total Withdrawal
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ color: "#0a2558", mt: 1, fontWeight: "bold" }}
                  >
                    {walletData?.totalWithdrawal ? `₹${walletData?.totalWithdrawal}` : "₹0.00"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Withdrawal Section */}
        <Accordion
          defaultExpanded
          sx={{
            mt: isMobile ? 2 : 4,
            boxShadow: "none",
            "&.MuiAccordion-root": {
              backgroundColor: "#fff",
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800",
              color: "#fff",
              "& .MuiSvgIcon-root": { color: "#fff" },
              minHeight: isMobile ? "48px" : "64px",
            }}
          >
            Withdrawal Request {!isWithdrawalAllowed && "(Temporarily Disabled)"}
          </AccordionSummary>
          <AccordionDetails>
            <form
              style={{
                marginTop: 2,
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <TextField
                label="Available Balance"
                value={`₹${displayBalance.toFixed(2)}`}
                fullWidth
                size="medium"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                    "&.Mui-focused fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                  },
                }}
              />

              <TextField
                label="Withdrawal Amount"
                type="text"
                value={amount}
                onChange={handleAmountChange}
                fullWidth
                size="medium"
                placeholder="Enter amount (Min ₹100)"
                disabled={withdrawMutation.isPending || !isWithdrawalAllowed}
                error={parseFloat(amount) > displayBalance}
                helperText={parseFloat(amount) > displayBalance ? "Insufficient Balance" : ""}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                    "&.Mui-focused fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                  },
                }}
              />

              {/* 
              <TextField
                label="Admin Charges (15%)"
                value={`₹${adminCharges.toFixed(2)}`}
                fullWidth
                size="medium"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                    "&.Mui-focused fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                  },
                }}
              />
              */}

              <TextField
                label="TDS (5%)"
                value={`₹${tds.toFixed(2)}`}
                fullWidth
                size="medium"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                    "&.Mui-focused fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                  },
                }}
              />

              <TextField
                label="Net Amount Received"
                value={`₹${netAmount.toFixed(2)}`}
                fullWidth
                size="medium"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                    "&.Mui-focused fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                  },
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "stretch" : "center",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Terms & Conditions:</strong>
                  </Typography>
                  <Box sx={{ display: "flex", gap: 4, flexDirection: isMobile ? "column" : "row" }}>
                    <Box>
                      <Typography variant="body2">• 5% TDS applied</Typography>
                      <Typography variant="body2">• Minimum withdrawal: ₹100</Typography>
                      <Typography variant="body2">• One withdrawal per day allowed</Typography>
                    </Box>
                  </Box>
                  {!isWithdrawalAllowed && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#ff9800",
                        fontWeight: "bold",
                        mt: 1
                      }}
                    >
                      • Withdrawal disabled due to unpaid loan from last Saturday
                    </Typography>
                  )}
                </Box>

                <Button
                  variant="contained"
                  onClick={handleWithdraw}
                  disabled={
                    withdrawMutation.isPending ||
                    !amount ||
                    amount === "0" ||
                    parseFloat(amount) > displayBalance ||
                    !isWithdrawalAllowed
                  }
                  sx={{
                    backgroundColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800",
                    minWidth: "120px",
                    "&:hover": {
                      backgroundColor: isWithdrawalAllowed ? "#581c87" : "#f57c00"
                    },
                    "&:disabled": { backgroundColor: "#cccccc" },
                  }}
                >
                  {withdrawMutation.isPending ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    isWithdrawalAllowed ? "Withdraw" : "Disabled"
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
            mt: isMobile ? 2 : 4,
            boxShadow: "none",
            "&.MuiAccordion-root": {
              backgroundColor: "#fff",
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              backgroundColor: "#0a2558",
              color: "#fff",
              "& .MuiSvgIcon-root": { color: "#fff" },
              minHeight: isMobile ? "48px" : "64px",
            }}
          >
            Transaction History
          </AccordionSummary>
          <AccordionDetails>
            {walletData?.transactions && walletData.transactions.length > 0 ? (
              isMobile ? (
                /* Mobile Native Transaction Cards */
                <Stack spacing={1.5}>
                  {walletData.transactions.map((tx: any, idx: number) => {
                    const isDebit = parseFloat(tx.ew_debit) > 0;
                    const amountText = isDebit
                      ? `-₹${parseFloat(tx.ew_debit).toFixed(2)}`
                      : `+₹${parseFloat(tx.ew_credit).toFixed(2)}`;
                    const txDate = tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString() : '-';
                    const statusStr = (tx.status || 'Completed').toLowerCase();

                    return (
                      <Paper
                        key={tx.transaction_id || idx}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: '16px',
                          bgcolor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                            {txDate} • ID: {tx.transaction_id}
                          </Typography>
                          <Chip
                            label={tx.status ? (tx.status.charAt(0).toUpperCase() + tx.status.slice(1)) : 'Completed'}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              bgcolor: statusStr === 'completed' || statusStr === 'success' ? '#dcfce7' : '#fef9c3',
                              color: statusStr === 'completed' || statusStr === 'success' ? '#166534' : '#854d0e',
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#1e293b' }}>
                              {tx.transaction_type || 'Wallet Transfer'}
                            </Typography>
                          </Box>
                          <Typography
                            sx={{
                              fontWeight: 900,
                              fontSize: '1.15rem',
                              color: isDebit ? '#dc2626' : '#16a34a',
                            }}
                          >
                            {amountText}
                          </Typography>
                        </Box>
                      </Paper>
                    );
                  })}
                </Stack>
              ) : (
                /* Desktop Table */
                <DataTable
                  columns={getWalletColumns()}
                  data={walletData?.transactions}
                  pagination
                  customStyles={DASHBOARD_CUTSOM_STYLE}
                  paginationPerPage={25}
                  paginationRowsPerPageOptions={[25, 50, 100]}
                  highlightOnHover
                  responsive
                />
              )
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="textSecondary">
                  No transactions found
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  Your transaction history will appear here
                </Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default Wallet;