import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Theme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { CopilotIcon } from '@/design-system/components/CopilotIcon'
import { accentSubtle, isDarkMode } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

export type InsightCalloutVariant = 'copilot' | 'success' | 'warning' | 'error'

type InsightCalloutProps = {
  variant?: InsightCalloutVariant
  title: string
  children: ReactNode
}

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
  fontSize: '0.875rem',
  lineHeight: 1.35,
} as const

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
  fontSize: '0.8125rem',
  lineHeight: 1.55,
} as const

function getVariantStyles(theme: Theme, variant: InsightCalloutVariant) {
  const isLight = theme.palette.mode === 'light'

  if (variant === 'copilot') {
    return {
      bgcolor: accentSubtle(theme),
      borderColor: 'divider',
      titleColor: 'text.primary' as const,
      bodyColor: 'text.primary' as const,
    }
  }

  if (variant === 'success') {
    return {
      bgcolor: isLight ? theme.figmaPalette.green[100] : theme.figmaPalette.green[900],
      borderColor: isLight ? theme.figmaPalette.green[200] : theme.figmaPalette.green[800],
      titleColor: isLight ? theme.figmaPalette.green[800] : theme.figmaPalette.green[200],
      bodyColor: 'text.primary' as const,
    }
  }

  if (variant === 'warning') {
    return {
      bgcolor: isLight ? theme.figmaPalette.amber[100] : theme.figmaPalette.amber[900],
      borderColor: isLight ? theme.figmaPalette.amber[200] : theme.figmaPalette.amber[800],
      titleColor: isLight ? theme.figmaPalette.amber[900] : theme.figmaPalette.amber[200],
      bodyColor: 'text.primary' as const,
    }
  }

  return {
    bgcolor: isLight ? theme.figmaPalette.red[100] : theme.figmaPalette.red[900],
    borderColor: isLight ? theme.figmaPalette.red[200] : theme.figmaPalette.red[800],
    titleColor: isLight ? theme.figmaPalette.red[800] : theme.figmaPalette.red[200],
    bodyColor: 'text.primary' as const,
  }
}

function VariantIcon({ variant }: { variant: InsightCalloutVariant }) {
  const iconSx = { fontSize: 18, flexShrink: 0 } as const

  if (variant === 'copilot') {
    return <CopilotIcon size={18} active />
  }
  if (variant === 'success') {
    return <CheckCircleOutlineIcon sx={iconSx} />
  }
  if (variant === 'warning') {
    return <LightbulbOutlinedIcon sx={iconSx} />
  }
  return <ErrorOutlineIcon sx={iconSx} />
}

/** Quote-flow insight / callout box — Copilot (light blue), success, warning, or error. */
export function InsightCallout({ variant = 'copilot', title, children }: InsightCalloutProps) {
  return (
    <Box
      sx={(theme) => {
        const styles = getVariantStyles(theme, variant)
        return {
          borderRadius: `${layoutTokens.cardRadius}px`,
          bgcolor: styles.bgcolor,
          border: 1,
          borderColor: styles.borderColor,
          boxShadow: isDarkMode(theme) ? 'none' : layoutTokens.cardShadow,
          px: 2,
          py: 1.5,
        }
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box sx={{ mt: 0.125, color: (theme) => getVariantStyles(theme, variant).titleColor }}>
          <VariantIcon variant={variant} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="subtitle2"
            sx={(theme) => ({
              ...headingSx,
              color: getVariantStyles(theme, variant).titleColor,
              mb: children ? 0.75 : 0,
            })}
          >
            {title}
          </Typography>
          {children && (
            <Box sx={(theme) => ({ ...bodySx, color: getVariantStyles(theme, variant).bodyColor })}>
              {children}
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  )
}

/** Light-blue Copilot insight box with sparkle mark — matches quote flow callouts. */
export function CopilotInsightBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <InsightCallout variant="copilot" title={title}>
      {children}
    </InsightCallout>
  )
}
