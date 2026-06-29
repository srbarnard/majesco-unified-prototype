import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  AnalyticsSurfaceCard,
  mapInsightTone,
} from '@/design-system/components/analytics/AnalyticsSurfaceCard'
import { analyticsHeadingSx, ANALYTICS_GUTTER, analyticsBodySx } from '@/design-system/components/analytics/analyticsStyles'

export type AnalyticsInsight = {
  id: string
  label: string
  detail: string
  tone: 'info' | 'warning' | 'success' | 'neutral'
}

type AnalyticsInsightStripProps = {
  insights: AnalyticsInsight[]
}

export function AnalyticsInsightStrip({ insights }: AnalyticsInsightStripProps) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={ANALYTICS_GUTTER}>
      {insights.map((insight) => (
        <AnalyticsSurfaceCard key={insight.id} tone={mapInsightTone(insight.tone)} sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ ...analyticsHeadingSx, fontSize: '0.875rem', fontWeight: 600 }}>
            {insight.label}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ...analyticsBodySx, display: 'block', mt: 0.5 }}>
            {insight.detail}
          </Typography>
        </AnalyticsSurfaceCard>
      ))}
    </Stack>
  )
}
