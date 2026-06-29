import Grid from '@mui/material/Grid2'
import { AnalyticsStatBox } from '@/design-system/components/analytics/AnalyticsStatBox'
import { ANALYTICS_GUTTER, type AnalyticsKpiMetric } from '@/design-system/components/analytics/analyticsStyles'

type AnalyticsKpiStripProps = {
  metrics: AnalyticsKpiMetric[]
}

export function AnalyticsKpiStrip({ metrics }: AnalyticsKpiStripProps) {
  return (
    <Grid container spacing={ANALYTICS_GUTTER}>
      {metrics.map((metric) => (
        <Grid key={metric.id} size={{ xs: 12, sm: 6, lg: 3 }}>
          <AnalyticsStatBox metric={metric} />
        </Grid>
      ))}
    </Grid>
  )
}
