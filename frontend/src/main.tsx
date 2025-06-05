import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';
import App from './App.tsx';

const theme = createTheme({
  palette: {
    mode: 'dark', // Set theme mode to dark
    primary: {
      main: '#2563eb', // Modern blue
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#7c3aed', // Modern purple
      light: '#a78bfa',
      dark: '#5b21b6',
    },
    background: {
      default: '#1a1a1a', // Dark background
      paper: '#2d2d2d', // Slightly lighter dark for cards/containers
    },
    text: {
      primary: '#ffffff', // White text for dark background
      secondary: '#b0b0b0', // Muted grey text
    },
    success: {
      main: '#10b981', // Modern green
    },
    error: {
      main: '#ef4444', // Modern red
    },
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 800,
      letterSpacing: '-0.02em',
      marginBottom: '1.5rem',
    },
    h2: {
      fontSize: '2.75rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      marginBottom: '1rem',
    },
    h3: {
      fontSize: '2.25rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.875rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1.125rem',
      lineHeight: 1.75,
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.025em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', // Adjusted shadow for dark mode
          },
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Adjusted shadow for dark mode
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', // Adjusted shadow for dark mode
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)', // Adjusted shadow for dark mode
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(30, 30, 30, 0.8)', // Darker AppBar background
          color: '#ffffff', // White text for AppBar
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            transition: 'all 0.2s ease-in-out',
            backgroundColor: '#2a2a2a', // Darker input background
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#2563eb', // Blue border on hover
              },
            },
            '&.Mui-focused': {
               '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#2563eb', // Blue border when focused
              },
            },
          },
           '& .MuiInputLabel-root': {
             color: '#b0b0b0', // Muted label color
           },
             '& .MuiInputBase-input': {
             color: '#ffffff', // White input text
           },
        },
      },
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);