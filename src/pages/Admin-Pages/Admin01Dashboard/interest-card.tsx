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
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: { xs: 1.5, sm: 2 },
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                px: { xs: 2, md: 3 },
                py: { xs: 1.8, md: 2 },
                mb: 3,
                mx: { xs: 2, md: 3 },
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
        >
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 700,
                        color: '#0a2558',
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                        lineHeight: 1.3,
                    }}
                >
                    Interest Rates & Deposit Schemes
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        color: '#64748b',
                        fontSize: { xs: '0.8rem', sm: '0.85rem' },
                        mt: 0.25,
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
                    background: '#0a2558 !important',
                    backgroundColor: '#0a2558 !important',
                    backgroundImage: 'none !important',
                    color: 'white !important',
                    fontWeight: 600,
                    px: 2.2,
                    py: 0.8,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    alignSelf: { xs: 'stretch', sm: 'auto' },
                    justifyContent: 'center',
                    '&:hover': {
                        background: '#061638 !important',
                        backgroundColor: '#061638 !important',
                        backgroundImage: 'none !important',
                    }
                }}
            >
                Interest Rates
            </Button>
        </Box>
    );
};

export default InterestCard;
