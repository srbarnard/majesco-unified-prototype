import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { AnalyticsTrendBadge } from '@/design-system/components/analytics/AnalyticsTrendBadge'
import { analyticsHeadingSx, type AnalyticsKpiMetric } from '@/design-system/components/analytics/analyticsStyles'

type AnalyticsMetricHeaderProps = {
  metric: AnalyticsKpiMetric
  compact?: boolean
}

export function AnalyticsMetricHeader({ metric, compact = false }: AnalyticsMetricHeaderProps) {
  const valueColor =
    metric.tone === 'positive'
      ? 'success.main'
      : metric.tone === 'negative'
        ? 'error.main'
        : 'text.primary'

  return (
    <Stack spacing={compact ? 0.25 : 0.5}>
      <Typography variant="subtitle2" sx={{ ...analyticsHeadingSx, fontSize: compact ? '0.875rem' : '0.9375rem' }}>
        {metric.title}
      </Typography>
      <Stack direction="row" spacing={1.25} alignItems="baseline" flexWrap="wrap" useFlexGap>
        <Typography
          variant={compact ? 'h6' : 'h5'}
          sx={{
            ...analyticsHeadingSx,
            fontSize: compact ? '1.25rem' : '1.5rem',
            lineHeight: 1.1,
            color: valueColor,
          }}
        >
          {metric.value}
        </Typography>
        <AnalyticsTrendBadge trend={metric.trend} tone={metric.tone} />
      </Stack>
    </Stack>
  )
}
