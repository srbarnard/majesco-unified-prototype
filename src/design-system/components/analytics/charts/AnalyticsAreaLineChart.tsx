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

type AnalyticsAreaLineChartProps = {
  data: AnalyticsTimeSeriesPoint[]
  yAxisLabel?: string
  valueFormatter?: (value: number) => string
  height?: number
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
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
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
}: AnalyticsAreaLineChartProps) {
  const theme = useTheme()
  const axisStyle = getAnalyticsChartAxisStyle(theme)
  const gridStroke = getAnalyticsChartGridStroke(theme)
  const lineColor = figmaPalette.teal[500]
  const fillColor = theme.palette.mode === 'dark' ? figmaPalette.teal[900] : figmaPalette.teal[100]

  return (
    <Box sx={{ width: '100%', height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id="analyticsAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillColor} stopOpacity={0.85} />
              <stop offset="100%" stopColor={fillColor} stopOpacity={0.15} />
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
            cursor={{ stroke: figmaPalette.teal[300], strokeWidth: 1 }}
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
            fill="url(#analyticsAreaFill)"
            dot={{ r: 3, fill: lineColor, stroke: '#fff', strokeWidth: 1.5 }}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  )
}
