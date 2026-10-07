import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Overdraft = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3, maxWidth: '800px', margin: '0 auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
        {/* <Typography variant="h4" sx={{ fontWeight: 900, color: '#0a2558', mb: 2 }}>
          OVERDRAFT
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
          This section is currently under development. Please check back later for Overdraft facilities.
        </Typography> */}
        <Box sx={{
          p: 4,
          bgcolor: '#f8fafc',
          borderRadius: '16px',
          border: '1px dashed #cbd5e1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#475569' }}>
            Facility Not Active
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', color: '#64748b' }}>
            Overdraft facility is not enabled for this account. Please visit your branch to check eligibility and submit an application.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Overdraft;
