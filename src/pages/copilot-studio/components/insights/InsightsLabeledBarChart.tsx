import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import { isDarkMode } from '@/design-system/theme/themeSurfaces'

type InsightsLabeledBarChartProps = {
  data: AnalyticsTimeSeriesPoint[]
  barColor: string
  height?: number
  legendLabel?: string
  chartKey?: string
}

/** Matches details-screen ChartLegend (Pulse / Quotes / Insureds). */
export function InsightsChartLegend({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
      {items.map(({ label, color }) => (
        <Stack key={label} direction="row" spacing={0.75} alignItems="center">
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
          <Typography
            variant="caption"
            sx={{ ...analyticsBodySx, fontSize: '0.6875rem', color: 'text.secondary' }}
          >
            {label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  )
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
        boxShadow: isDarkMode(theme)
          ? '0 4px 16px rgba(0,0,0,0.45)'
          : '0 4px 12px rgba(0,0,0,0.08)',
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
  chartKey,
}: InsightsLabeledBarChartProps) {
  const theme = useTheme()
  const dark = isDarkMode(theme)
  const axisStyle = getAnalyticsChartAxisStyle(theme)
  const gridStroke = getAnalyticsChartGridStroke(theme)
  const remountKey = chartKey ?? `insights-bar-${barColor}-${theme.palette.mode}`

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <InsightsChartLegend items={[{ label: legendLabel, color: barColor }]} />
      <Box sx={{ width: '100%', height, minHeight: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            key={remountKey}
            data={data}
            margin={{ top: 12, right: 8, left: 0, bottom: 4 }}
          >
            <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={36} />
            <Tooltip
              cursor={{ fill: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
              content={({ active, payload, label }) => (
                <ChartTooltip
                  active={active}
                  payload={payload as unknown as Array<{ value?: number }> | undefined}
                  label={label != null ? String(label) : undefined}
                />
              )}
            />
            <Bar dataKey="value" fill={barColor} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}
