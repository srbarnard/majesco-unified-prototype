import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#1565c0',
        },
        background: {
          default: '#f4f6f8',
          paper: '#ffffff',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#90caf9',
        },
        background: {
          default: '#0f1419',
          paper: '#1a2027',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      },
    },
  },
})
