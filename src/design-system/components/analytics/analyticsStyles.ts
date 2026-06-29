import type { SxProps, Theme } from '@mui/material/styles'
import { figmaPalette } from '@/design-system/tokens/figma-palette'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack, figmaFontWeights } from '@/design-system/tokens/figma-typography'

export const ANALYTICS_GUTTER = 3.125 // 25px at 8px spacing unit

export const analyticsInputTextSx = {
  fontFamily: figmaFontFamilyStack.body,
  fontSize: '0.875rem',
  lineHeight: 1.5,
} as const

export const analyticsFilterLabelSx = {
  ...analyticsInputTextSx,
  fontWeight: figmaFontWeights.semibold,
  color: 'text.primary',
  whiteSpace: 'nowrap',
} as const

export function analyticsFilterInputSx(theme: Theme) {
  const focusColor = theme.palette.primary.main

  return {
    '& .MuiOutlinedInput-root': {
      ...analyticsInputTextSx,
      minHeight: 40,
      bgcolor: 'background.paper',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.divider,
        borderWidth: 1,
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: focusColor,
      },
      '&.Mui-focused': {
        outline: 'none',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: focusColor,
        borderWidth: 2,
      },
    },
    '& .MuiSelect-select': {
      ...analyticsInputTextSx,
    },
  }
}

export const analyticsMenuItemSx = {
  ...analyticsInputTextSx,
} as const

export const analyticsChartColors = [
  figmaPalette.teal[500],
  figmaPalette.purple[700],
  figmaPalette.green[700],
  figmaPalette.purple[400],
  figmaPalette.blue[500],
  figmaPalette.amber[600],
  figmaPalette.red[500],
  figmaPalette.yellow[600],
  figmaPalette.lightBlue[500],
] as const

export const analyticsHeadingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

export const analyticsBodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

export function analyticsCardSx(theme: Theme): SxProps<Theme> {
  return {
    borderRadius: `${layoutTokens.cardRadius}px`,
    bgcolor: 'background.paper',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: layoutTokens.cardShadow,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }
}

export const analyticsChartAxisStyle = {
  fontFamily: figmaFontFamilyStack.body,
  fontSize: 11,
  fill: figmaPalette.grey[600],
}

export const analyticsChartGridStroke = figmaPalette.grey[200]

export type AnalyticsTrendDirection = 'up' | 'down' | 'neutral'

export type AnalyticsTrend = {
  direction: AnalyticsTrendDirection
  label: string
}

export type AnalyticsKpiMetric = {
  id: string
  title: string
  value: string
  trend: AnalyticsTrend
  tone?: 'positive' | 'negative' | 'neutral'
}

export type AnalyticsTimeSeriesPoint = {
  label: string
  value: number
}

export type AnalyticsComboPoint = {
  label: string
  created: number
  completionRate: number
}

export type AnalyticsDonutSegment = {
  name: string
  value: number
}

export type AnalyticsStackedPoint = {
  label: string
  [seriesKey: string]: string | number
}

export type AnalyticsStackedSeries = {
  key: string
  label: string
  color: string
}

export type AnalyticsStateValue = {
  code: string
  name: string
  value: number
}
