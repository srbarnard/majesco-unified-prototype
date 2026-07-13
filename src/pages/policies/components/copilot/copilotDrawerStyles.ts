import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

export const copilotDrawerHeadingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

/** Toolbar / context titles in Copilot drawers (e.g. Assist with Submission). */
export const copilotSubtitleSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
  color: 'secondary.main',
  fontSize: '1rem',
} as const

/** Smaller in-content section labels (e.g. At a glance, Key insights). */
export const copilotSectionHeadingSx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 600,
  fontSize: '0.8125rem',
  color: 'text.primary',
} as const

export const copilotDrawerTabsSx = {
  minHeight: 36,
  '& .MuiTabs-flexContainer': {
    justifyContent: 'center',
  },
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    bgcolor: 'primary.main',
  },
  '& .MuiTab-root': {
    minHeight: 36,
    minWidth: 'auto',
    textTransform: 'none',
    fontFamily: figmaFontFamilyStack.heading,
    fontWeight: 500,
    fontSize: '0.875rem',
    color: 'text.secondary',
    px: '30px',
    py: 0.75,
  },
  '& .Mui-selected': {
    color: 'primary.main',
    fontWeight: 600,
  },
} as const
