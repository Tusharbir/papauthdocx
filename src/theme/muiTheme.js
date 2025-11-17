import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const baseColors = {
  primary: {
    main: '#0066FF',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#00C4B4',
    contrastText: '#0B1C2C',
  },
  background: {
    default: '#F4F8FB',
    paper: 'rgba(255,255,255,0.8)',
  },
  darkBackground: '#111827',
};

const buildTheme = (mode = 'light') => {
  const palette =
    mode === 'light'
      ? { ...baseColors, mode: 'light' }
      : {
          mode: 'dark',
          primary: baseColors.primary,
          secondary: baseColors.secondary,
          background: { default: '#0B1220', paper: 'rgba(15,23,42,0.9)' },
        };

  const theme = createTheme({
    palette,
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      h3: { fontWeight: 700 },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.08)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            paddingInline: 20,
            boxShadow: '0 15px 40px rgba(0,102,255,0.15)',
          },
        },
      },
    },
  });

  return responsiveFontSizes(theme);
};

export default buildTheme;
