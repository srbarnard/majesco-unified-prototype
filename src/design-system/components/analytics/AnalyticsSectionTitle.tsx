import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { analyticsBodySx, analyticsHeadingSx } from '@/design-system/components/analytics/analyticsStyles'

type AnalyticsSectionTitleProps = {
  title: string
  subtitle?: string
}

export function AnalyticsSectionTitle({ title, subtitle }: AnalyticsSectionTitleProps) {
  return (
    <Box sx={{ pt: 0.5 }}>
      <Typography variant="subtitle1" sx={{ ...analyticsHeadingSx, fontSize: '1.0625rem' }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ ...analyticsBodySx, mt: 0.25 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  )
}
