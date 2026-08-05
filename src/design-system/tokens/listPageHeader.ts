import type { SxProps, Theme } from '@mui/material/styles'

/**
 * List-page primary create/add button: icon-only "+" on phones so the title
 * row stays on one line; full label from `sm` up.
 */
export const listPageCreateButtonSx: SxProps<Theme> = {
  flexShrink: 0,
  alignSelf: 'center',
  minWidth: { xs: 40, sm: 'auto' },
  px: { xs: 1.25, sm: 2 },
  '& .MuiButton-startIcon': {
    marginLeft: 0,
    marginRight: { xs: 0, sm: 0.75 },
  },
  '& .create-btn-label': {
    display: { xs: 'none', sm: 'inline' },
  },
}
