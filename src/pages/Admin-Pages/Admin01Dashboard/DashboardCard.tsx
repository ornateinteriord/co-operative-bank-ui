import { Box, Card, CardContent, Button, SxProps, Theme, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface DashboardCardProps {
  icon?: ReactNode;
  title: string;
  status?: string;
  statusColor?: string;
  description?: string;
  showActionButton?: boolean;
  actionButtonLabel?: string;
  onActionClick?: () => void;
  showFooterContent?: boolean;
  footerContent?: ReactNode;
  sx?: SxProps<Theme>;
}

const DashboardCard = ({
  icon,
  title,
  status,
  statusColor = '#10b981',
  description,
  showActionButton = false,
  actionButtonLabel,
  onActionClick,
  showFooterContent = false,
  footerContent,
  sx,
}: DashboardCardProps) => {
  return (
    <Card
      sx={{
        background: '#0a2558',
        borderRadius: '14px',
        color: 'white',
        minHeight: 140,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        ...sx,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flex: 1 }}>
            {icon && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  '& svg': {
                    fontSize: 24,
                  }
                }}
              >
                {icon}
              </Box>
            )}

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  lineHeight: 1.2,
                }}
              >
                {title}
              </Typography>
              {status && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.75rem',
                    color: statusColor,
                    fontWeight: 500,
                  }}
                >
                  {status}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Action Button */}
          {showActionButton && actionButtonLabel && (
            <Button
              variant="outlined"
              size="small"
              onClick={onActionClick}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                fontSize: '0.75rem',
                textTransform: 'none',
                px: 1.2,
                py: 0.2,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {actionButtonLabel}
            </Button>
          )}
        </Box>

        {/* Amount / Metric Value */}
        {description && (
          <Box
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.75rem' },
              fontWeight: 700,
              color: '#ffffff',
              mt: 1,
              mb: showFooterContent ? 1.5 : 0,
            }}
          >
            {description}
          </Box>
        )}

        {/* Footer Content */}
        {showFooterContent && footerContent && (
          <Box sx={{ mt: 1.5 }}>{footerContent}</Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;