import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import type { AppTheme } from '@/design-system/theme'
import { isDarkMode, surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { OverviewStat, OverviewStatTone } from '@/pages/policies/data/mockOverview'

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

const subtitleSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 500,
} as const

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

function getStatToneStyles(tone: OverviewStatTone, theme: AppTheme) {
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
  } as const
  return toneMap[tone]
}

function StatBox({ stat }: { stat: OverviewStat }) {
  const theme = useTheme() as AppTheme
  const toneStyles = getStatToneStyles(stat.tone, theme)

  return (
    <Box
      sx={(t) => ({
        borderRadius: `${layoutTokens.cardRadius}px`,
        bgcolor: surfaceMuted(t),
        position: 'relative',
        overflow: 'hidden',
        px: 2.5,
        py: 2,
        height: '100%',
      })}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: toneStyles.accent,
          borderRadius: '2px 0 0 2px',
        }}
      />
      <Typography
        variant="h4"
        sx={{ ...headingSx, fontSize: '1.75rem', lineHeight: 1.2, color: toneStyles.value, mb: 0.75 }}
      >
        {stat.value}
      </Typography>
      <Typography variant="body2" sx={{ ...subtitleSx, fontSize: '0.875rem', color: 'text.primary' }}>
        {stat.label}
      </Typography>
      {stat.helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, display: 'block', mt: 0.5 }}>
          {stat.helperText}
        </Typography>
      )}
    </Box>
  )
}

type EntityStatGridProps = {
  stats: OverviewStat[]
  spacing?: number
}

export function EntityStatGrid({ stats, spacing = 3.125 }: EntityStatGridProps) {
  return (
    <Grid container spacing={spacing}>
      {stats.map((stat) => (
        <Grid key={stat.id} size={{ xs: 6, md: 3 }}>
          <StatBox stat={stat} />
        </Grid>
      ))}
    </Grid>
  )
}

export function entityDetailCardSx(theme: AppTheme) {
  return {
    borderRadius: `${layoutTokens.cardRadius}px`,
    bgcolor: 'background.paper',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: isDarkMode(theme) ? 'none' : layoutTokens.cardShadow,
  }
}
