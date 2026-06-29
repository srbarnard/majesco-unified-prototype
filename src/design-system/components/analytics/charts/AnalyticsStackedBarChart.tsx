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
  analyticsChartAxisStyle,
  analyticsChartGridStroke,
  type AnalyticsStackedPoint,
  type AnalyticsStackedSeries,
} from '@/design-system/components/analytics/analyticsStyles'

type AnalyticsStackedBarChartProps = {
  data: AnalyticsStackedPoint[]
  series: AnalyticsStackedSeries[]
  height?: number
  yAxisFormatter?: (value: number) => string
}

function StackedBarTooltip({
  active,
  payload,
  label,
  yAxisFormatter,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; color?: string }>
  label?: string
  yAxisFormatter: (value: number) => string
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
      {payload.map((entry) => (
        <Typography key={entry.name} variant="body2" sx={{ ...analyticsBodySx, fontSize: '0.75rem' }}>
          {entry.name}: {yAxisFormatter(entry.value ?? 0)}
        </Typography>
      ))}
    </Box>
  )
}

export function AnalyticsStackedBarChart({
  data,
  series,
  height = 260,
  yAxisFormatter = (value) => `$${Math.round(value / 1000)}K`,
}: AnalyticsStackedBarChartProps) {
  return (
    <Stack spacing={1.5} sx={{ height: '100%' }}>
      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
        {series.map((item) => (
          <Stack key={item.key} direction="row" spacing={0.5} alignItems="center">
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary" sx={analyticsBodySx}>
              {item.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
      <Box sx={{ width: '100%', height, minHeight: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid stroke={analyticsChartGridStroke} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={analyticsChartAxisStyle}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              tick={analyticsChartAxisStyle}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={yAxisFormatter}
            />
            <Tooltip
              content={({ active, payload, label }) => (
                <StackedBarTooltip
                  active={active}
                  payload={payload as unknown as Array<{ name?: string; value?: number; color?: string }> | undefined}
                  label={String(label ?? '')}
                  yAxisFormatter={yAxisFormatter}
                />
              )}
            />
            {series.map((item) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                name={item.label}
                stackId="premium"
                fill={item.color}
                maxBarSize={36}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Stack>
  )
}
