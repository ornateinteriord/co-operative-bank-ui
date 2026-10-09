import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import PercentIcon from '@mui/icons-material/Percent';
import { useNavigate } from 'react-router-dom';

const InterestCard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                px: { xs: 2.5, md: 3 },
                py: 2,
                mb: 3,
                mx: { xs: 2, md: 3 },
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
        >
            <Box>
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 700,
                        color: '#0a2558',
                        fontSize: '1rem',
                    }}
                >
                    Interest Rates & Deposit Schemes
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        color: '#64748b',
                        fontSize: '0.85rem',
                    }}
                >
                    Manage interest rates for savings, fixed deposits, and loans
                </Typography>
            </Box>

            <Button
                variant="contained"
                startIcon={<PercentIcon />}
                onClick={() => navigate('/banking/interestrate')}
                sx={{
                    backgroundColor: '#0a2558',
                    color: 'white',
                    fontWeight: 600,
                    px: 2.5,
                    py: 0.9,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                        backgroundColor: '#061638',
                    }
                }}
            >
                Interest Rates
            </Button>
        </Box>
    );
};

export default InterestCard;
