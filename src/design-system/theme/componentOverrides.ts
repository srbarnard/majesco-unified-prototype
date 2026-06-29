import type { Theme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'
import { getFigmaColors } from '@/design-system/tokens/figma-colors'
import { figmaFontFamilyStack, figmaFontWeights } from '@/design-system/tokens/figma-typography'
import { borderRadius } from '@/design-system/tokens/shape'
import { shadows } from '@/design-system/tokens/shadows'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'

function primaryFocusColor(theme: Theme) {
  return getFigmaColors(theme.palette.mode).primary.main
}

function inputFocusRing(theme: Theme) {
  const color = primaryFocusColor(theme)
  return {
    outline: `2px solid ${color}`,
    outlineOffset: 0,
  }
}

export const componentOverrides: ThemeOptions['components'] = {
  MuiCssBaseline: {
    styleOverrides: {
      html: ({ theme }) => ({
        colorScheme: theme.palette.mode,
      }),
      body: ({ theme }) => ({
        margin: 0,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }),
      '#root': {
        minHeight: '100vh',
      },
      'input:not([type=checkbox]):not([type=radio]):focus-visible, textarea:focus-visible, select:focus-visible': ({
        theme,
      }) => ({
        ...inputFocusRing(theme),
      }),
    },
  },
  MuiAppBar: {
    defaultProps: {
      color: 'inherit',
      elevation: 0,
    },
    styleOverrides: {
      root: ({ theme }) => {
        const tokens = getFigmaColors(theme.palette.mode)
        return {
          backgroundColor: tokens.components.appBar,
          border: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
          borderRadius: 0,
          boxShadow: 'none',
        }
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
      }),
    },
  },
  MuiToolbar: {
    styleOverrides: {
      root: {
        minHeight: 64,
        paddingLeft: 16,
        paddingRight: 16,
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: ({ theme }) => {
        const tokens = getFigmaColors(theme.palette.mode)
        return {
          borderRadius: borderRadius.default,
          marginBottom: 4,
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: tokens.primary.hover,
          },
          '&.active': {
            backgroundColor: tokens.primary.selected,
            color: tokens.primary.main,
            '& .MuiListItemIcon-root': {
              color: tokens.primary.main,
            },
          },
        }
      },
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: ({ theme }) => ({
        minWidth: 40,
        color: theme.palette.text.secondary,
      }),
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: borderRadius.default,
        padding: '8px 20px',
        textTransform: 'none',
        fontFamily: figmaFontFamilyStack.heading,
        fontWeight: figmaFontWeights.medium,
      },
      containedPrimary: ({ theme }) => {
        const tokens = getFigmaColors(theme.palette.mode)
        return {
          backgroundColor: tokens.primary.main,
          color: tokens.primary.contrastText,
          '&:hover': {
            backgroundColor: tokens.primary.dark,
          },
        }
      },
      containedSecondary: ({ theme }) => {
        const tokens = getFigmaColors(theme.palette.mode)
        return {
          backgroundColor: tokens.secondary.main,
          color: tokens.secondary.contrastText,
          '&:hover': {
            backgroundColor: tokens.secondary.dark,
          },
        }
      },
      outlinedPrimary: ({ theme }) => {
        const tokens = getFigmaColors(theme.palette.mode)
        return {
          borderColor: tokens.primary.outlinedBorder,
          color: tokens.primary.main,
          '&:hover': {
            backgroundColor: tokens.primary.hover,
            borderColor: tokens.primary.outlinedBorder,
          },
        }
      },
      textPrimary: ({ theme }) => {
        const tokens = getFigmaColors(theme.palette.mode)
        return {
          color: tokens.primary.main,
          '&:hover': {
            backgroundColor: tokens.primary.hover,
          },
        }
      },
      sizeSmall: {
        padding: '4px 12px',
        fontSize: '0.875rem',
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => {
        const tokens = getFigmaColors(theme.palette.mode)
        return {
          borderRadius: borderRadius.default,
          '&:hover': {
            backgroundColor: tokens.primary.hover,
          },
        }
      },
    },
  },
  MuiPaper: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        backgroundImage: 'none',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: borderRadius.default,
      }),
      elevation1: ({ theme }) => ({
        boxShadow: theme.palette.mode === 'dark' ? 'none' : shadows[2],
      }),
      elevation2: ({ theme }) => ({
        boxShadow: theme.palette.mode === 'dark' ? 'none' : shadows[3],
      }),
    },
  },
  MuiCard: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: borderRadius.default,
        boxShadow: 'none',
      }),
    },
  },
  MuiCardHeader: {
    styleOverrides: {
      root: {
        padding: '20px 24px 0',
      },
      title: {
        fontSize: '1rem',
        fontWeight: 600,
      },
      subheader: {
        fontSize: '0.875rem',
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: '16px 24px 24px',
        '&:last-child': {
          paddingBottom: 24,
        },
      },
    },
  },
  MuiCardActions: {
    styleOverrides: {
      root: {
        padding: '8px 16px 16px',
      },
    },
  },
  MuiTableContainer: {
    styleOverrides: {
      root: ({ theme }) => ({
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: borderRadius.default,
      }),
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: surfaceMuted(theme),
        '& .MuiTableCell-root': {
          fontWeight: 600,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
        },
      }),
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: '12px 16px',
      '&.MuiTableCell-paddingCheckbox': {
        width: 52,
        minWidth: 52,
        maxWidth: 52,
        padding: '12px 0 12px 16px',
      },
      }),
      head: {
        fontSize: '0.875rem',
      },
      body: {
        fontSize: '0.875rem',
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:last-child td': {
          borderBottom: 0,
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 30,
        fontWeight: 500,
        fontSize: '0.75rem',
      },
      filled: ({ theme }) => {
        const isLight = theme.palette.mode === 'light'
        return {
          '&.MuiChip-colorSuccess': {
            backgroundColor: isLight
              ? theme.figmaPalette.green[100]
              : theme.figmaPalette.green[900],
            color: isLight
              ? theme.figmaPalette.green[800]
              : theme.figmaPalette.green[200],
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: isLight
              ? theme.figmaPalette.amber[100]
              : theme.figmaPalette.amber[900],
            color: isLight
              ? theme.figmaPalette.amber[900]
              : theme.figmaPalette.amber[200],
          },
          '&.MuiChip-colorError': {
            backgroundColor: isLight
              ? theme.figmaPalette.red[100]
              : theme.figmaPalette.red[900],
            color: isLight
              ? theme.figmaPalette.red[800]
              : theme.figmaPalette.red[200],
          },
          '&.MuiChip-colorInfo': {
            backgroundColor: isLight
              ? theme.figmaPalette.lightBlue[100]
              : theme.figmaPalette.lightBlue[900],
            color: isLight
              ? theme.figmaPalette.lightBlue[900]
              : theme.figmaPalette.lightBlue[200],
          },
        }
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: getFigmaColors(theme.palette.mode).components.avatarFill,
        color: theme.palette.common.white,
        fontSize: '0.875rem',
        fontWeight: 600,
      }),
    },
  },
  MuiTextField: {
    defaultProps: {
      size: 'small',
      variant: 'outlined',
    },
  },
  MuiInputBase: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&.Mui-focused': {
          ...inputFocusRing(theme),
        },
        '&.MuiOutlinedInput-root.Mui-focused, &.MuiFilledInput-root.Mui-focused': {
          outline: 'none',
        },
      }),
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: borderRadius.default,
        backgroundColor: theme.palette.background.paper,
        '& .MuiOutlinedInput-notchedOutline': {
          borderWidth: 1,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: primaryFocusColor(theme),
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: primaryFocusColor(theme),
          borderWidth: 2,
        },
        '&.Mui-focused': {
          outline: 'none',
        },
      }),
      notchedOutline: ({ theme }) => ({
        borderColor: theme.palette.divider,
        borderWidth: 1,
      }),
    },
  },
  MuiFilledInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: borderRadius.default,
        '&.Mui-focused': {
          outline: 'none',
          backgroundColor: theme.palette.background.paper,
        },
        '&.Mui-focused:after': {
          borderBottom: `2px solid ${primaryFocusColor(theme)}`,
        },
        '&:before': {
          borderBottom: `1px solid ${theme.palette.divider}`,
        },
      }),
    },
  },
  MuiInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&.Mui-focused:after': {
          borderBottom: `2px solid ${primaryFocusColor(theme)}`,
        },
      }),
      underline: ({ theme }) => ({
        '&:before': {
          borderBottomColor: theme.palette.divider,
        },
        '&:hover:not(.Mui-disabled):before': {
          borderBottomColor: primaryFocusColor(theme),
        },
      }),
    },
  },
  MuiSelect: {
    styleOverrides: {
      select: ({ theme }) => ({
        '&:focus': {
          ...inputFocusRing(theme),
          backgroundColor: 'transparent',
        },
      }),
    },
  },
  MuiTabs: {
    styleOverrides: {
      indicator: ({ theme }) => ({
        backgroundColor: getFigmaColors(theme.palette.mode).primary.main,
      }),
    },
  },
  MuiTab: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&.Mui-selected': {
          color: getFigmaColors(theme.palette.mode).primary.main,
        },
      }),
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderColor: theme.palette.divider,
      }),
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        backgroundImage: 'none',
        border: `1px solid ${theme.palette.divider}`,
      }),
    },
  },
  MuiPopover: {
    styleOverrides: {
      paper: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        backgroundImage: 'none',
        border: `1px solid ${theme.palette.divider}`,
      }),
    },
  },
  MuiAutocomplete: {
    styleOverrides: {
      paper: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        backgroundImage: 'none',
        border: `1px solid ${theme.palette.divider}`,
      }),
      listbox: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
      }),
    },
  },
  MuiTypography: {
    styleOverrides: {
      gutterBottom: {
        marginBottom: 8,
      },
    },
  },
}
