import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import {
  Area,
  AreaChart,
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
import { figmaPalette } from '@/design-system/tokens/figma-palette'
import { useTheme } from '@mui/material/styles'
import { isDarkMode } from '@/design-system/theme/themeSurfaces'

type AnalyticsAreaLineChartProps = {
  data: AnalyticsTimeSeriesPoint[]
  yAxisLabel?: string
  valueFormatter?: (value: number) => string
  height?: number
  /** Series stroke/fill color — defaults to teal; pass Pulse palette color on details-style charts. */
  color?: string
  chartKey?: string
}

function defaultValueFormatter(value: number) {
  return value.toLocaleString('en-US')
}

function ChartTooltipContent({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean
  payload?: Array<{ value?: number }>
  label?: string
  valueFormatter: (value: number) => string
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
        {valueFormatter(payload[0]?.value ?? 0)}
      </Typography>
    </Box>
  )
}

export function AnalyticsAreaLineChart({
  data,
  yAxisLabel,
  valueFormatter = defaultValueFormatter,
  height = 220,
  color,
  chartKey,
}: AnalyticsAreaLineChartProps) {
  const theme = useTheme()
  const dark = isDarkMode(theme)
  const axisStyle = getAnalyticsChartAxisStyle(theme)
  const gridStroke = getAnalyticsChartGridStroke(theme)
  const lineColor = color ?? figmaPalette.teal[500]
  const fillTopOpacity = dark ? 0.42 : 0.35
  const fillBottomOpacity = dark ? 0.08 : 0.04
  const gradientId = `analyticsAreaFill-${(chartKey ?? lineColor).replace(/[^a-zA-Z0-9]/g, '')}`
  const remountKey = chartKey ?? `area-${lineColor}-${theme.palette.mode}`

  return (
    <Box sx={{ width: '100%', height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart key={remountKey} data={data} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={fillTopOpacity} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={fillBottomOpacity} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={axisStyle}
            tickLine={false}
            axisLine={{ stroke: gridStroke }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(value: number) => valueFormatter(value)}
            label={
              yAxisLabel
                ? {
                    value: yAxisLabel,
                    angle: -90,
                    position: 'insideLeft',
                    style: { ...axisStyle, textAnchor: 'middle' },
                  }
                : undefined
            }
          />
          <Tooltip
            cursor={{ stroke: lineColor, strokeWidth: 1, strokeOpacity: dark ? 0.5 : 0.35 }}
            content={({ active, payload, label }) => (
              <ChartTooltipContent
                active={active}
                payload={payload as unknown as Array<{ value?: number }> | undefined}
                label={String(label ?? '')}
                valueFormatter={valueFormatter}
              />
            )}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={{ r: 3, fill: lineColor, stroke: theme.palette.background.paper, strokeWidth: 1.5 }}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  )
}
