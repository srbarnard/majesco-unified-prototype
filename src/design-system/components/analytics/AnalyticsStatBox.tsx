import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { AnalyticsTrendBadge } from '@/design-system/components/analytics/AnalyticsTrendBadge'
import {
  AnalyticsSurfaceCard,
  mapKpiTone,
  getAnalyticsSurfaceToneStyles,
} from '@/design-system/components/analytics/AnalyticsSurfaceCard'
import { analyticsHeadingSx, type AnalyticsKpiMetric } from '@/design-system/components/analytics/analyticsStyles'
import type { AppTheme } from '@/design-system/theme'

type AnalyticsStatBoxProps = {
  metric: AnalyticsKpiMetric
}

/** KPI stat box — value-first layout matching Policy Details Overview stat boxes. */
export function AnalyticsStatBox({ metric }: AnalyticsStatBoxProps) {
  const theme = useTheme() as AppTheme
  const surfaceTone = mapKpiTone(metric.tone)
  const toneStyles = getAnalyticsSurfaceToneStyles(surfaceTone, theme)

  return (
    <AnalyticsSurfaceCard tone={surfaceTone}>
      <Stack direction="row" spacing={1.25} alignItems="baseline" flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
        <Typography
          variant="h4"
          sx={{
            ...analyticsHeadingSx,
            fontSize: '1.75rem',
            lineHeight: 1.2,
            color: toneStyles.value,
          }}
        >
          {metric.value}
        </Typography>
        <AnalyticsTrendBadge trend={metric.trend} tone={metric.tone} />
      </Stack>
      <Typography variant="body2" sx={{ ...analyticsHeadingSx, fontSize: '0.875rem', fontWeight: 500, color: 'text.primary' }}>
        {metric.title}
      </Typography>
    </AnalyticsSurfaceCard>
  )
}
