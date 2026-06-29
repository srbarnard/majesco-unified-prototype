import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import {
  analyticsBodySx,
  analyticsChartColors,
  type AnalyticsDonutSegment,
} from '@/design-system/components/analytics/analyticsStyles'

type AnalyticsDonutChartProps = {
  data: AnalyticsDonutSegment[]
  height?: number
}

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number }>
}) {
  if (!active || !payload?.length) return null
  const item = payload[0]

  return (
    <Box
      sx={(theme) => ({
        px: 1.25,
        py: 0.75,
        borderRadius: 1,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      })}
    >
      <Typography variant="body2" sx={{ ...analyticsBodySx, fontWeight: 600 }}>
        {item.name}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={analyticsBodySx}>
        {item.value?.toLocaleString('en-US')}
      </Typography>
    </Box>
  )
}

export function AnalyticsDonutChart({ data, height = 240 }: AnalyticsDonutChartProps) {
  const visibleLegend = data.slice(0, 4)

  return (
    <Stack spacing={1.5} sx={{ height: '100%' }}>
      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ px: 0.5 }}>
        {visibleLegend.map((segment, index) => (
          <Stack key={segment.name} direction="row" spacing={0.5} alignItems="center">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: analyticsChartColors[index % analyticsChartColors.length],
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" color="text.secondary" noWrap sx={{ ...analyticsBodySx, maxWidth: 88 }}>
              {segment.name}
            </Typography>
          </Stack>
        ))}
      </Stack>
      <Box sx={{ width: '100%', height, minHeight: height, flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={1}
              stroke="#fff"
              strokeWidth={2}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={analyticsChartColors[index % analyticsChartColors.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => (
                <DonutTooltip active={active} payload={payload as unknown as Array<{ name?: string; value?: number }> | undefined} />
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Stack>
  )
}
