import { createTheme } from '@mui/material/styles';

/**
 * Modern Corporate Banking Theme
 * Tailored for high-trust financial institutions, co-operative banks, and Nidhi organizations.
 */
export const bankingTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0a2558',      // Deep Royal Navy - core bank brand
      dark: '#051430',      // Midnight Navy
      light: '#1e40af',     // Electric Sapphire
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0d9488',      // Precision Teal / Jade
      dark: '#0f766e',
      light: '#14b8a6',
      contrastText: '#ffffff',
    },
    success: {
      main: '#059669',      // Emerald Growth
      dark: '#047857',
      light: '#34d399',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#d97706',      // Sovereign Gold / Amber
      dark: '#b45309',
      light: '#f59e0b',
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626',      // Alert Crimson
      dark: '#b91c1c',
      light: '#f87171',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0284c7',      // Horizon Sky
      dark: '#0369a1',
      light: '#38bdf8',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',   // Crisp slate paper background
      paper: '#ffffff',     // Pure white card surfaces
    },
    text: {
      primary: '#0f172a',   // Obsidian Slate
      secondary: '#64748b', // Subdued Slate
      disabled: '#94a3b8',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: {
      fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
      fontWeight: 800,
      letterSpacing: '-0.03em',
      color: '#0f172a',
    },
    h2: {
      fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
      fontWeight: 800,
      letterSpacing: '-0.025em',
      color: '#0f172a',
    },
    h3: {
      fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#0f172a',
    },
    h4: {
      fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#0f172a',
    },
    h5: {
      fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
      fontWeight: 700,
      letterSpacing: '-0.015em',
      color: '#0f172a',
    },
    h6: {
      fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: '#0f172a',
    },
    subtitle1: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: '#334155',
    },
    subtitle2: {
      fontWeight: 600,
      letterSpacing: '0.01em',
      color: '#64748b',
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
      color: '#1e293b',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.55,
      color: '#475569',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
      color: '#64748b',
    },
    overline: {
      fontSize: '0.7rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#94a3b8',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f8fafc',
          color: '#0f172a',
          fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          padding: '8px 18px',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(10, 37, 88, 0.15)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0a2558 0%, #1e40af 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #051430 0%, #172554 100%)',
            boxShadow: '0 6px 16px rgba(10, 37, 88, 0.25)',
          },
        },
        containedSuccess: {
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
            boxShadow: '0 6px 16px rgba(5, 150, 105, 0.25)',
          },
        },
        outlined: {
          borderColor: '#cbd5e1',
          color: '#0f172a',
          '&:hover': {
            borderColor: '#0a2558',
            backgroundColor: 'rgba(10, 37, 88, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          backgroundColor: '#ffffff',
          backgroundImage: 'none',
          transition: 'all 0.25s ease-in-out',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '14px',
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        },
        elevation2: {
          boxShadow: '0 10px 25px -3px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.04)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          backgroundColor: '#ffffff',
          transition: 'all 0.2s ease',
          '& fieldset': {
            borderColor: '#e2e8f0',
          },
          '&:hover fieldset': {
            borderColor: '#94a3b8',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#0a2558',
            borderWidth: '1.5px',
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(10, 37, 88, 0.1)',
          },
        },
        input: {
          padding: '12px 14px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#f1f5f9',
          padding: '14px 16px',
          fontSize: '0.875rem',
          fontVariantNumeric: 'tabular-nums',
        },
        head: {
          backgroundColor: '#f8fafc',
          color: '#475569',
          fontWeight: 700,
          fontSize: '0.78rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderBottom: '2px solid #e2e8f0',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: 'rgba(241, 245, 249, 0.6) !important',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
        },
      },
    },
  },
});

export default bankingTheme;
