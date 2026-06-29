import Box from '@mui/material/Box'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { layoutTokens } from '@/design-system/tokens/layout'
import type { AppTheme } from '@/design-system/theme'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'

export type AnalyticsSurfaceTone = 'success' | 'info' | 'warning' | 'error' | 'neutral'

export function getAnalyticsSurfaceToneStyles(tone: AnalyticsSurfaceTone, theme: AppTheme) {
  const palette = theme.figmaPalette
  const isDark = theme.palette.mode === 'dark'
  const toneMap = {
    success: {
      accent: isDark ? palette.green[900] : palette.green[100],
      value: isDark ? palette.green[200] : palette.green[800],
    },
    info: {
      accent: isDark ? palette.lightBlue[900] : palette.lightBlue[100],
      value: isDark ? palette.lightBlue[200] : palette.lightBlue[900],
    },
    warning: {
      accent: isDark ? palette.amber[900] : palette.amber[100],
      value: isDark ? palette.amber[200] : palette.amber[900],
    },
    error: {
      accent: isDark ? palette.red[900] : palette.red[100],
      value: isDark ? palette.red[200] : palette.red[800],
    },
    neutral: {
      accent: isDark ? palette.grey[700] : palette.grey[200],
      value: isDark ? palette.grey[300] : palette.grey[800],
    },
  } as const
  return toneMap[tone]
}

export function mapKpiTone(tone?: 'positive' | 'negative' | 'neutral'): AnalyticsSurfaceTone {
  if (tone === 'positive') return 'success'
  if (tone === 'negative') return 'error'
  return 'info'
}

export function mapInsightTone(tone: 'info' | 'warning' | 'success' | 'neutral'): AnalyticsSurfaceTone {
  if (tone === 'success') return 'success'
  if (tone === 'warning') return 'warning'
  if (tone === 'info') return 'info'
  return 'neutral'
}

type AnalyticsSurfaceCardProps = {
  tone: AnalyticsSurfaceTone
  children: ReactNode
  sx?: SxProps<Theme>
}

/** Grey stat surface with left accent bar — matches Policy Details Overview stat boxes. */
export function AnalyticsSurfaceCard({ tone, children, sx }: AnalyticsSurfaceCardProps) {
  return (
    <Box
      sx={[
        (theme) => ({
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            px: 2.5,
            py: 2,
            borderRadius: `${layoutTokens.cardRadius}px`,
            bgcolor: surfaceMuted(theme),
          }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Box
        sx={(theme) => ({
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: getAnalyticsSurfaceToneStyles(tone, theme as AppTheme).accent,
          borderRadius: '2px 0 0 2px',
        })}
      />
      {children}
    </Box>
  )
}

export function useAnalyticsSurfaceValueColor(tone: AnalyticsSurfaceTone) {
  return (theme: AppTheme) => getAnalyticsSurfaceToneStyles(tone, theme).value
}
