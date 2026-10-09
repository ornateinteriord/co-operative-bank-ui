import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

interface AccountBreakdown {
    type: string;
    amount: number;
}

interface WalletCardProps {
    balance: string | number;
    onClick: () => void;
    breakdown?: AccountBreakdown[];
}

const WalletCard: React.FC<WalletCardProps> = ({ balance, onClick, breakdown }) => {
    return (
        <Card
            onClick={onClick}
            sx={{
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #061638 0%, #0a2558 50%, #1e40af 100%)',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 10px 32px rgba(10, 37, 88, 0.28)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 16px 40px rgba(10, 37, 88, 0.35)',
                },
                minHeight: '160px',
                width: '100%',
                maxWidth: '600px',
                display: 'flex',
                alignItems: 'center',
                mx: 'auto',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.4) 0%, rgba(245,158,11,0.6) 50%, rgba(255,255,255,0.1) 100%)',
                }
            }}
        >
            <CardContent sx={{ zIndex: 1, textAlign: 'center', width: '100%', py: 3.5, px: 3 }}>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#f59e0b',
                        mx: 'auto',
                        mb: 1.5,
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                    }}
                >
                    <AccountBalanceWalletIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography
                    variant="h3"
                    sx={{
                        fontFamily: 'Outfit, sans-serif',
                        fontWeight: 900,
                        mb: 0.5,
                        fontVariantNumeric: 'tabular-nums',
                        fontSize: { xs: '1.8rem', sm: '2.4rem' },
                        letterSpacing: '-0.5px',
                    }}
                >
                    {balance}
                </Typography>
                <Typography
                    variant="subtitle1"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        mb: breakdown && breakdown.length > 0 ? 2 : 0,
                    }}
                >
                    Net Vault & Reserve Balance
                </Typography>

                {/* Account Breakdown Chips */}
                {breakdown && breakdown.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mt: 2 }}>
                        {breakdown.map((acc, index) => (
                            <Chip
                                key={index}
                                label={`${acc.type} - ₹${acc.amount.toFixed(2)}`}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.12)',
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                }}
                            />
                        ))}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default WalletCard;
