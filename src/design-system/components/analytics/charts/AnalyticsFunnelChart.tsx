import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { analyticsBodySx, analyticsChartColors, analyticsHeadingSx } from '@/design-system/components/analytics/analyticsStyles'
import { figmaPalette } from '@/design-system/tokens/figma-palette'

export type AnalyticsFunnelStage = {
  id: string
  label: string
  value: number
  conversionLabel?: string
}

type AnalyticsFunnelChartProps = {
  stages: AnalyticsFunnelStage[]
  height?: number
}

export function AnalyticsFunnelChart({ stages, height = 220 }: AnalyticsFunnelChartProps) {
  const maxValue = Math.max(...stages.map((stage) => stage.value), 1)

  return (
    <Stack spacing={1.75} sx={{ height, justifyContent: 'center' }}>
      {stages.map((stage, index) => {
        const widthPct = Math.max((stage.value / maxValue) * 100, 18)
        const color = analyticsChartColors[index % analyticsChartColors.length]

        return (
          <Stack key={stage.id} spacing={0.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography variant="body2" sx={{ ...analyticsBodySx, fontSize: '0.8125rem' }}>
                {stage.label}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="baseline">
                <Typography variant="body2" sx={{ ...analyticsHeadingSx, fontSize: '0.875rem' }}>
                  {stage.value.toLocaleString('en-US')}
                </Typography>
                {stage.conversionLabel && (
                  <Typography variant="caption" color="text.secondary" sx={analyticsBodySx}>
                    {stage.conversionLabel}
                  </Typography>
                )}
              </Stack>
            </Stack>
            <Box
              sx={{
                height: 10,
                width: `${widthPct}%`,
                borderRadius: '30px',
                bgcolor: color,
                opacity: 0.92,
                boxShadow: `inset 0 0 0 1px ${figmaPalette.grey[100]}`,
                transition: 'width 0.3s ease',
              }}
            />
          </Stack>
        )
      })}
    </Stack>
  )
}
