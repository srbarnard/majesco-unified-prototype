import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  analyticsBodySx,
  analyticsChartAxisStyle,
  analyticsChartGridStroke,
  type AnalyticsComboPoint,
} from '@/design-system/components/analytics/analyticsStyles'
import { figmaPalette } from '@/design-system/tokens/figma-palette'

type AnalyticsComboBarLineChartProps = {
  data: AnalyticsComboPoint[]
  height?: number
  barLabel?: string
  lineLabel?: string
  lineValueFormatter?: (value: number) => string
}

function ComboTooltip({
  active,
  payload,
  label,
  barLabel,
  lineLabel,
  lineValueFormatter,
}: {
  active?: boolean
  payload?: Array<{ dataKey?: string; value?: number; color?: string }>
  label?: string
  barLabel: string
  lineLabel: string
  lineValueFormatter: (value: number) => string
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
        <Typography key={entry.dataKey} variant="body2" sx={{ ...analyticsBodySx, fontWeight: 600 }}>
          {entry.dataKey === 'created' ? barLabel : lineLabel}:{' '}
          {entry.dataKey === 'completionRate'
            ? lineValueFormatter(entry.value ?? 0)
            : entry.value?.toLocaleString('en-US')}
        </Typography>
      ))}
    </Box>
  )
}

export function AnalyticsComboBarLineChart({
  data,
  height = 220,
  barLabel = 'Volume',
  lineLabel = 'Rate',
  lineValueFormatter = (value) => `${value}%`,
}: AnalyticsComboBarLineChartProps) {
  const barColor = figmaPalette.teal[500]
  const lineColor = figmaPalette.purple[700]

  return (
    <Stack spacing={1.25} sx={{ height: '100%' }}>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: barColor }} />
          <Typography variant="caption" color="text.secondary" sx={analyticsBodySx}>
            {barLabel}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: lineColor }} />
          <Typography variant="caption" color="text.secondary" sx={analyticsBodySx}>
            {lineLabel}
          </Typography>
        </Stack>
      </Stack>
      <Box sx={{ width: '100%', height, minHeight: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid stroke={analyticsChartGridStroke} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={analyticsChartAxisStyle}
              tickLine={false}
              axisLine={{ stroke: analyticsChartGridStroke }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              yAxisId="left"
              tick={analyticsChartAxisStyle}
              tickLine={false}
              axisLine={false}
              width={44}
              label={{
                value: barLabel,
                angle: -90,
                position: 'insideLeft',
                style: { ...analyticsChartAxisStyle, textAnchor: 'middle' },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={analyticsChartAxisStyle}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(value: number) => lineValueFormatter(value)}
              label={{
                value: lineLabel,
                angle: 90,
                position: 'insideRight',
                style: { ...analyticsChartAxisStyle, textAnchor: 'middle' },
              }}
            />
            <Tooltip
              content={({ active, payload, label }) => (
                <ComboTooltip
                  active={active}
                  payload={payload as unknown as Array<{ dataKey?: string; value?: number; color?: string }> | undefined}
                  label={String(label ?? '')}
                  barLabel={barLabel}
                  lineLabel={lineLabel}
                  lineValueFormatter={lineValueFormatter}
                />
              )}
            />
            <Bar yAxisId="left" dataKey="created" fill={barColor} radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="completionRate"
              stroke={lineColor}
              strokeWidth={2}
              dot={{ r: 3, fill: lineColor, stroke: '#fff', strokeWidth: 1.5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </Stack>
  )
}
