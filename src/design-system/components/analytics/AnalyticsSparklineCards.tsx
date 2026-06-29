import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { AnalyticsCard } from '@/design-system/components/analytics/AnalyticsCard'
import { AnalyticsMetricHeader } from '@/design-system/components/analytics/AnalyticsMetricHeader'
import { AnalyticsSparkline } from '@/design-system/components/analytics/charts/AnalyticsSparkline'
import { analyticsBodySx } from '@/design-system/components/analytics/analyticsStyles'
import type { AnalyticsSparklineCard } from '@/design-system/components/analytics/types'

type AnalyticsSparklineCardsProps = {
  cards: AnalyticsSparklineCard[]
}

export function AnalyticsSparklineCards({ cards }: AnalyticsSparklineCardsProps) {
  return (
    <>
      {cards.map((card) => (
        <AnalyticsCard key={card.id} contentSx={{ px: 2.5, pt: 2, pb: 2 }}>
          <Stack spacing={1.25}>
            <AnalyticsMetricHeader metric={card} compact />
            <AnalyticsSparkline data={card.sparkline} />
            <Typography variant="caption" color="text.disabled" sx={analyticsBodySx}>
              Trend over selected period
            </Typography>
          </Stack>
        </AnalyticsCard>
      ))}
    </>
  )
}
