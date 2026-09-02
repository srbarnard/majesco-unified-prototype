import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PulseFilter, PulseRange, PulseDualPoint, PulseTimePoint } from '@/app/data/pulseMock'
import { getPulseChartData } from '@/app/data/pulseMock'
import {
  getPulsePaletteColors,
  type PulseChartPalette,
} from '@/app/pages/home/pulseChartPalettes'
import {
  analyticsBodySx,
  getAnalyticsChartAxisStyle,
  getAnalyticsChartGridStroke,
} from '@/design-system/components/analytics/analyticsStyles'
import { isDarkMode } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

const CHART_HEIGHT = 240

function ChartLegend({ items }: { items: Array<{ label: string; color: string }> }) {
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

function PulseTooltipShell({
  title,
  lines,
}: {
  title: string
  lines: Array<{ label: string; value: string; color?: string }>
}) {
  return (
    <Box
      sx={(theme) => ({
        px: 1.25,
        py: 0.75,
        borderRadius: 1,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: isDarkMode(theme) ? '0 4px 16px rgba(0,0,0,0.45)' : '0 4px 12px rgba(0,0,0,0.08)',
        minWidth: 120,
      })}
    >
      <Typography variant="caption" color="text.secondary" sx={{ ...analyticsBodySx, display: 'block' }}>
        {title}
      </Typography>
      {lines.map((line) => (
        <Stack key={line.label} direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
          {line.color ? (
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: line.color, flexShrink: 0 }} />
          ) : null}
          <Typography
            variant="body2"
            sx={{ ...analyticsBodySx, fontSize: '0.75rem', fontWeight: 600, color: 'text.primary' }}
          >
            {line.label}: {line.value}
          </Typography>
        </Stack>
      ))}
    </Box>
  )
}

function AreaSeriesChart({
  data,
  yLabel,
  gradientId,
  lineColor,
}: {
  data: PulseTimePoint[]
  yLabel: string
  gradientId: string
  lineColor: string
}) {
  const theme = useTheme()
  const axisStyle = getAnalyticsChartAxisStyle(theme)
  const gridStroke = getAnalyticsChartGridStroke(theme)
  const dark = isDarkMode(theme)
  const dotStroke = theme.palette.background.paper
  const fillTopOpacity = dark ? 0.42 : 0.35
  const fillBottomOpacity = dark ? 0.08 : 0.04

  return (
    <Box sx={{ width: '100%' }}>
      <ChartLegend items={[{ label: yLabel, color: lineColor }]} />
      <Box sx={{ width: '100%', height: CHART_HEIGHT, minHeight: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
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
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              width={36}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: lineColor, strokeWidth: 1, strokeOpacity: dark ? 0.5 : 0.35 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <PulseTooltipShell
                    title={String(label ?? '')}
                    lines={[
                      {
                        label: yLabel,
                        value: String(payload[0]?.value ?? 0),
                        color: lineColor,
                      },
                    ]}
                  />
                )
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              name={yLabel}
              stroke={lineColor}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={{ r: 3.5, fill: lineColor, stroke: dotStroke, strokeWidth: 1.5 }}
              activeDot={{ r: 5, stroke: dotStroke }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}

function DualSeriesChart({
  data,
  primaryLabel,
  secondaryLabel,
  primaryColor,
  secondaryColor,
  yFormatter,
  showGap = false,
}: {
  data: PulseDualPoint[]
  primaryLabel: string
  secondaryLabel: string
  primaryColor: string
  secondaryColor: string
  yFormatter: (v: number) => string
  showGap?: boolean
}) {
  const theme = useTheme()
  const axisStyle = getAnalyticsChartAxisStyle(theme)
  const gridStroke = getAnalyticsChartGridStroke(theme)
  const dotStroke = theme.palette.background.paper

  return (
    <Box sx={{ width: '100%' }}>
      <ChartLegend
        items={[
          { label: primaryLabel, color: primaryColor },
          { label: secondaryLabel, color: secondaryColor },
        ]}
      />
      <Box sx={{ width: '100%', height: CHART_HEIGHT, minHeight: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              width={showGap ? 44 : 36}
              tickFormatter={(value: number) => (showGap ? yFormatter(value) : String(value))}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: theme.palette.divider, strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const primary = payload.find((entry) => entry.dataKey === 'primary')
                const secondary = payload.find((entry) => entry.dataKey === 'secondary')
                const primaryValue = Number(primary?.value ?? 0)
                const secondaryValue = Number(secondary?.value ?? 0)
                const lines: Array<{ label: string; value: string; color?: string }> = [
                  {
                    label: primaryLabel,
                    value: yFormatter(primaryValue),
                    color: primaryColor,
                  },
                  {
                    label: secondaryLabel,
                    value: yFormatter(secondaryValue),
                    color: secondaryColor,
                  },
                ]
                if (showGap) {
                  lines.push({
                    label: 'Gap',
                    value: yFormatter(primaryValue - secondaryValue),
                  })
                }
                return <PulseTooltipShell title={String(label ?? '')} lines={lines} />
              }}
            />
            <Line
              type="monotone"
              dataKey="secondary"
              name={secondaryLabel}
              stroke={secondaryColor}
              strokeWidth={2}
              opacity={0.9}
              dot={{ r: 2.5, fill: secondaryColor, stroke: dotStroke, strokeWidth: 1.5 }}
              activeDot={{ r: 4, stroke: dotStroke }}
            />
            <Line
              type="monotone"
              dataKey="primary"
              name={primaryLabel}
              stroke={primaryColor}
              strokeWidth={2.5}
              dot={{ r: 3, fill: primaryColor, stroke: dotStroke, strokeWidth: 1.5 }}
              activeDot={{ r: 4.5, stroke: dotStroke }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}

type PulseChartProps = {
  filter: PulseFilter
  range: PulseRange
  palette: PulseChartPalette
}

export function PulseChart({ filter, range, palette }: PulseChartProps) {
  const theme = useTheme()
  const colors = getPulsePaletteColors(palette, theme.palette.mode)
  const chartKey = `${filter}-${range}-${palette.id}-${theme.palette.mode}`

  const chart = useMemo(() => {
    const chartData = getPulseChartData(filter, range)

    switch (chartData.kind) {
      case 'time':
        return (
          <AreaSeriesChart
            key={chartKey}
            data={chartData.data}
            yLabel={chartData.yLabel}
            gradientId={`pulse-area-${chartKey}`}
            lineColor={colors[0]}
          />
        )
      case 'dual': {
        const dualColors =
          filter === 'renewals'
            ? { primary: colors[0], secondary: colors[1] }
            : filter === 'tasks'
              ? { primary: colors[6], secondary: colors[7] }
              : { primary: colors[4], secondary: colors[5] }
        return (
          <DualSeriesChart
            key={chartKey}
            data={chartData.data}
            primaryLabel={chartData.primaryLabel}
            secondaryLabel={chartData.secondaryLabel}
            primaryColor={dualColors.primary}
            secondaryColor={dualColors.secondary}
            yFormatter={chartData.yFormatter}
            showGap={chartData.showGap}
          />
        )
      }
      default:
        return null
    }
  }, [filter, range, colors, chartKey])

  return (
    <Box sx={{ width: '100%', fontFamily: figmaFontFamilyStack.body }}>
      {chart}
    </Box>
  )
}
