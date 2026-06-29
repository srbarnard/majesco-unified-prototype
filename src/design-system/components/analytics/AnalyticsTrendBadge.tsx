import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import RemoveIcon from '@mui/icons-material/Remove'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { analyticsBodySx, type AnalyticsTrend } from '@/design-system/components/analytics/analyticsStyles'

type AnalyticsTrendBadgeProps = {
  trend: AnalyticsTrend
  tone?: 'positive' | 'negative' | 'neutral'
}

function resolveTone(trend: AnalyticsTrend, tone?: AnalyticsTrendBadgeProps['tone']) {
  if (tone) return tone
  if (trend.direction === 'up') return 'positive'
  if (trend.direction === 'down') return 'negative'
  return 'neutral'
}

export function AnalyticsTrendBadge({ trend, tone }: AnalyticsTrendBadgeProps) {
  const resolvedTone = resolveTone(trend, tone)
  const color =
    resolvedTone === 'positive'
      ? 'success.main'
      : resolvedTone === 'negative'
        ? 'error.main'
        : 'text.secondary'

  const Icon =
    trend.direction === 'up'
      ? ArrowUpwardIcon
      : trend.direction === 'down'
        ? ArrowDownwardIcon
        : RemoveIcon

  return (
    <Stack direction="row" spacing={0.25} alignItems="center" sx={{ color }}>
      <Icon sx={{ fontSize: 14 }} />
      <Typography variant="caption" sx={{ ...analyticsBodySx, fontSize: '0.75rem', fontWeight: 500 }}>
        {trend.label}
      </Typography>
    </Stack>
  )
}
