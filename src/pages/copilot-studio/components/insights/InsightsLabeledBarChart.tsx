import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  analyticsBodySx,
  getAnalyticsChartAxisStyle,
  getAnalyticsChartGridStroke,
  type AnalyticsTimeSeriesPoint,
} from '@/design-system/components/analytics/analyticsStyles'
import { useTheme } from '@mui/material/styles'

type InsightsLabeledBarChartProps = {
  data: AnalyticsTimeSeriesPoint[]
  barColor: string
  height?: number
  legendLabel?: string
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value?: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null

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
      <Typography variant="caption" color="text.secondary" sx={analyticsBodySx} display="block">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ ...analyticsBodySx, fontWeight: 600 }}>
        {payload[0]?.value ?? 0}
      </Typography>
    </Box>
  )
}

export function InsightsLabeledBarChart({
  data,
  barColor,
  height = 280,
  legendLabel = 'Interactions',
}: InsightsLabeledBarChartProps) {
  const theme = useTheme()
  const axisStyle = getAnalyticsChartAxisStyle(theme)
  const gridStroke = getAnalyticsChartGridStroke(theme)

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ width: '100%', height, minHeight: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={axisStyle} tickLine={false} axisLine={false} />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={36} />
            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTooltip
                  active={active}
                  payload={payload as unknown as Array<{ value?: number }> | undefined}
                  label={label != null ? String(label) : undefined}
                />
              )}
            />
            <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} maxBarSize={56}>
              <LabelList dataKey="value" position="insideTop" fill="#fff" fontSize={11} fontWeight={600} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Stack direction="row" justifyContent="center" sx={{ mt: 1 }}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: barColor }} />
          <Typography variant="caption" color="text.secondary" sx={analyticsBodySx}>
            {legendLabel}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  )
}
