import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Grid,
  Paper,
  Button,
  Divider,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

interface DepositCalculatorProps {
  type: 'RD' | 'FD' | 'PIGMY' | 'MIS';
}

const DepositCalculator: React.FC<DepositCalculatorProps> = ({ type }) => {
  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [maturityAmount, setMaturityAmount] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);
  const [totalInvested, setTotalInvested] = useState<number | null>(null);

  const calculateMaturity = () => {
    const P = Number(depositAmount);
    const r = Number(interestRate) / 100;
    const n = Number(tenureMonths);

    if (type === 'FD') {
      // Compounded quarterly: A = P * (1 + r/4)^(4 * n/12)
      const t = n / 12;
      const A = P * Math.pow(1 + r / 4, 4 * t);
      setTotalInvested(P);
      setMaturityAmount(Math.round(A));
      setTotalInterest(Math.round(A - P));
    } else if (type === 'RD') {
      // Monthly RD maturity formula
      const invested = P * n;
      const totalInt = (P * n * (n + 1) * r) / (2 * 12);
      setTotalInvested(invested);
      setMaturityAmount(Math.round(invested + totalInt));
      setTotalInterest(Math.round(totalInt));
    } else if (type === 'PIGMY') {
      // Daily Pigmy (approx 30 days/month)
      const invested = P * 30 * n;
      const totalInt = (invested * r * (n / 12)) / 2;
      setTotalInvested(invested);
      setMaturityAmount(Math.round(invested + totalInt));
      setTotalInterest(Math.round(totalInt));
    } else {
      // MIS (Monthly Income Scheme): Monthly Interest = (P * r) / 12
      const monthlyInt = (P * r) / 12;
      setTotalInvested(P);
      setMaturityAmount(P);
      setTotalInterest(Math.round(monthlyInt * n));
    }
  };

  const handleReset = () => {
    setDepositAmount(5000);
    setTenureMonths(12);
    setInterestRate(8.5);
    setMaturityAmount(null);
    setTotalInterest(null);
    setTotalInvested(null);
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3, md: 4 }, mt: { xs: 7, sm: 8 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 1 }}>
          {type} Maturity & Interest Calculator
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b' }}>
          ESTIMATE RETURNS AND MATURITY AMOUNTS FOR {type} DEPOSITS
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: '16px', bgcolor: '#fff', mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              label={type === 'RD' ? 'Monthly Installment (₹)' : type === 'PIGMY' ? 'Daily Deposit (₹)' : 'Principal Amount (₹)'}
              type="number"
              fullWidth
              size="small"
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Tenure (Months)"
              type="number"
              fullWidth
              size="small"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Interest Rate (%)"
              type="number"
              fullWidth
              size="small"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<CalculateIcon />}
                onClick={calculateMaturity}
                sx={{ backgroundColor: '#1e40af', '&:hover': { backgroundColor: '#1d4ed8' } }}
              >
                Calculate Maturity
              </Button>
              <Button startIcon={<RestartAltIcon />} onClick={handleReset} color="inherit">
                Reset
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {maturityAmount !== null && (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #c7d2fe', borderRadius: '16px', bgcolor: '#f0f4ff' }}>
          <Typography variant="h6" fontWeight={700} color="#1e3a8a" sx={{ mb: 2 }}>
            Calculation Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">Total Invested Principal</Typography>
              <Typography variant="h5" fontWeight={700} color="#1e293b">
                ₹{totalInvested?.toLocaleString('en-IN')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">Total Interest Earned</Typography>
              <Typography variant="h5" fontWeight={700} color="#047857">
                ₹{totalInterest?.toLocaleString('en-IN')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">Estimated Maturity Value</Typography>
              <Typography variant="h4" fontWeight={800} color="#1e40af">
                ₹{maturityAmount?.toLocaleString('en-IN')}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Container>
  );
};

export default DepositCalculator;
