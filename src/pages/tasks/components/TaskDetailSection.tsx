import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { isDarkMode, surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

const sectionTitleSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
  fontSize: '0.8125rem',
  color: 'text.secondary',
  letterSpacing: '0.01em',
} as const

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontSize: '0.875rem',
  lineHeight: 1.55,
  color: 'text.primary',
} as const

type TaskDetailSectionProps = {
  title: string
  children: ReactNode
  /** When true, wraps content in a subtle card (quote-flow section pattern). */
  card?: boolean
}

export function TaskDetailSection({ title, children, card = false }: TaskDetailSectionProps) {
  const content = (
    <Stack spacing={1}>
      <Typography variant="subtitle2" sx={sectionTitleSx}>
        {title}
      </Typography>
      {children}
    </Stack>
  )

  if (!card) {
    return content
  }

  return (
    <Box
      sx={(theme) => ({
        borderRadius: `${layoutTokens.cardRadius}px`,
        border: 1,
        borderColor: 'divider',
        bgcolor: isDarkMode(theme) ? surfaceMuted(theme) : 'background.paper',
        boxShadow: isDarkMode(theme) ? 'none' : layoutTokens.cardShadow,
        px: 2,
        py: 1.5,
      })}
    >
      {content}
    </Box>
  )
}

export function TaskDetailText({ children }: { children: ReactNode }) {
  return (
    <Typography variant="body2" sx={bodySx}>
      {children}
    </Typography>
  )
}

export function TaskEntityRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="baseline">
      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body, minWidth: 96 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', textAlign: 'right', flex: 1 }}
      >
        {value}
      </Typography>
    </Stack>
  )
}
