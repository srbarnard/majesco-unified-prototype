import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import type { PulseFilter, PulseRange, PulseDualPoint, PulseTimePoint } from '@/app/data/pulseMock'
import { getPulseChartData } from '@/app/data/pulseMock'
import { type PulseChartPalette } from '@/app/pages/home/pulseChartPalettes'
import { getLabelStep, useChartWidth } from '@/app/pages/home/useChartWidth'
import type { AppTheme } from '@/design-system/theme'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

const CHART_HEIGHT = 240
/** Left inset of the plot (y-axis gutter). Shared with Pulse list alignment. */
export const PULSE_CHART_Y_AXIS_WIDTH = 36
/** Right inset of the plot. Shared with Pulse list alignment. */
export const PULSE_CHART_PLOT_RIGHT = 8
const Y_AXIS_WIDTH = PULSE_CHART_Y_AXIS_WIDTH
const PLOT_RIGHT = PULSE_CHART_PLOT_RIGHT

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

function ChartLegend({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
      {items.map(({ label, color }) => (
        <Stack key={label} direction="row" spacing={0.75} alignItems="center">
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
          <Typography variant="caption" sx={{ ...bodySx, fontSize: '0.6875rem', color: 'text.secondary' }}>
            {label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  )
}

type ChartPoint = { x: number; y: number; index: number }

function buildSmoothLinePath(points: ChartPoint[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpX = (prev.x + curr.x) / 2
    path += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`
  }
  return path
}

function PulseTooltip({
  leftPct,
  topPct,
  title,
  lines,
}: {
  leftPct: number
  topPct: number
  title: string
  lines: string[]
}) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${leftPct}%`,
        top: `${topPct}%`,
        bgcolor: 'grey.900',
        color: 'common.white',
        borderRadius: 1,
        px: 1.25,
        py: 0.75,
        pointerEvents: 'none',
        minWidth: 120,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <Typography variant="caption" sx={{ ...bodySx, display: 'block', color: 'grey.300', mb: 0.25 }}>
        {title}
      </Typography>
      {lines.map((line) => (
        <Typography key={line} variant="caption" sx={{ ...bodySx, display: 'block', color: 'common.white' }}>
          {line}
        </Typography>
      ))}
    </Box>
  )
}

function AreaSeriesChart({
  data,
  yLabel,
  gradientId,
  lineColor,
  chartWidth,
}: {
  data: PulseTimePoint[]
  yLabel: string
  gradientId: string
  lineColor: string
  chartWidth: number
}) {
  const theme = useTheme() as AppTheme
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const chartHeight = CHART_HEIGHT
  const padding = { top: 12, right: PLOT_RIGHT, bottom: 28, left: Y_AXIS_WIDTH }
  const plotWidth = chartWidth - padding.left - padding.right
  const plotHeight = chartHeight - padding.top - padding.bottom
  const baseline = padding.top + plotHeight
  const maxValue = Math.max(...data.map((p) => p.value), 1)
  const labelStep = getLabelStep(data.length, plotWidth)

  const points: ChartPoint[] = data.map((point, index) => ({
    x: padding.left + (index / Math.max(data.length - 1, 1)) * plotWidth,
    y: padding.top + plotHeight - (point.value / maxValue) * plotHeight,
    index,
  }))

  const linePath = buildSmoothLinePath(points)
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`
      : ''

  const hovered = hoverIndex !== null ? data[hoverIndex] : null
  const hoveredCoords = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <ChartLegend items={[{ label: yLabel, color: lineColor }]} />
      <Box sx={{ position: 'relative', width: '100%', height: CHART_HEIGHT }}>
        <Box
          component="svg"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMinYMid meet"
          sx={{ width: '100%', height: '100%', display: 'block', userSelect: 'none' }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0.04} />
            </linearGradient>
          </defs>

        {[0, maxValue / 2, maxValue].map((tick) => {
          const y = padding.top + plotHeight - (tick / maxValue) * plotHeight
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke={theme.palette.divider}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                strokeDasharray="3 4"
              />
              <text
                x={padding.left - 6}
                y={y + 4}
                textAnchor="end"
                fill={theme.figmaPalette.grey[500]}
                fontSize={10}
                fontFamily={figmaFontFamilyStack.body}
                style={{ vectorEffect: 'non-scaling-stroke' }}
              >
                {Math.round(tick)}
              </text>
            </g>
          )
        })}

        {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={lineColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )}

        {points.map((point) => (
          <circle
            key={point.index}
            cx={point.x}
            cy={point.y}
            r={hoverIndex === point.index ? 5 : 3.5}
            fill={lineColor}
            stroke="#fff"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHoverIndex(point.index)}
          />
        ))}

        {data.map((point, index) =>
          index % labelStep === 0 || index === data.length - 1 ? (
            <text
              key={point.label}
              x={points[index]?.x ?? padding.left}
              y={chartHeight - 8}
              textAnchor="middle"
              fill={theme.figmaPalette.grey[600]}
              fontSize={10}
              fontFamily={figmaFontFamilyStack.body}
            >
              {point.label}
            </text>
          ) : null,
        )}
      </Box>

      {hovered && hoveredCoords && (
        <PulseTooltip
          leftPct={(hoveredCoords.x / chartWidth) * 100}
          topPct={(hoveredCoords.y / CHART_HEIGHT) * 100}
          title={hovered.label}
          lines={[`${yLabel}: ${hovered.value}`]}
        />
      )}
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
  chartWidth,
  showGap = false,
}: {
  data: PulseDualPoint[]
  primaryLabel: string
  secondaryLabel: string
  primaryColor: string
  secondaryColor: string
  yFormatter: (v: number) => string
  chartWidth: number
  showGap?: boolean
}) {
  const theme = useTheme() as AppTheme
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const chartHeight = CHART_HEIGHT
  const padding = { top: 12, right: PLOT_RIGHT, bottom: 28, left: Y_AXIS_WIDTH }
  const plotWidth = chartWidth - padding.left - padding.right
  const plotHeight = chartHeight - padding.top - padding.bottom
  const maxValue = Math.max(...data.flatMap((p) => [p.primary, p.secondary]), 1)
  const labelStep = getLabelStep(data.length, plotWidth)

  const toPoint = (value: number, index: number) => ({
    x: padding.left + (index / Math.max(data.length - 1, 1)) * plotWidth,
    y: padding.top + plotHeight - (value / maxValue) * plotHeight,
    index,
  })

  const primaryPoints = data.map((p, i) => toPoint(p.primary, i))
  const secondaryPoints = data.map((p, i) => toPoint(p.secondary, i))
  const primaryPath = buildSmoothLinePath(primaryPoints)
  const secondaryPath = buildSmoothLinePath(secondaryPoints)

  const hovered = hoverIndex !== null ? data[hoverIndex] : null
  const hoveredX = hoverIndex !== null ? primaryPoints[hoverIndex]?.x : null

  const tooltipLines = hovered
    ? [
        `${primaryLabel}: ${yFormatter(hovered.primary)}`,
        `${secondaryLabel}: ${yFormatter(hovered.secondary)}`,
        ...(showGap ? [`Gap: ${yFormatter(hovered.primary - hovered.secondary)}`] : []),
      ]
    : []

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <ChartLegend
        items={[
          { label: primaryLabel, color: primaryColor },
          { label: secondaryLabel, color: secondaryColor },
        ]}
      />
      <Box sx={{ position: 'relative', width: '100%', height: CHART_HEIGHT }}>
      <Box
        component="svg"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="xMinYMid meet"
        sx={{ width: '100%', height: '100%', display: 'block', userSelect: 'none' }}
        onMouseLeave={() => setHoverIndex(null)}
      >
          {[0, maxValue / 2, maxValue].map((tick) => {
            const y = padding.top + plotHeight - (tick / maxValue) * plotHeight
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke={theme.palette.divider}
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray="3 4"
                />
                {showGap ? (
                  <text
                    x={padding.left - 6}
                    y={y + 4}
                    textAnchor="end"
                    fill={theme.figmaPalette.grey[500]}
                    fontSize={10}
                    fontFamily={figmaFontFamilyStack.body}
                  >
                    {yFormatter(Math.round(tick))}
                  </text>
                ) : null}
              </g>
            )
          })}

          <path
            d={secondaryPath}
            fill="none"
            stroke={secondaryColor}
            strokeWidth={2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.85}
          />
          <path
            d={primaryPath}
            fill="none"
            stroke={primaryColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          {primaryPoints.map((point) => (
            <circle
              key={`p-${point.index}`}
              cx={point.x}
              cy={point.y}
              r={hoverIndex === point.index ? 4.5 : 3}
              fill={primaryColor}
              stroke="#fff"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoverIndex(point.index)}
            />
          ))}

          {secondaryPoints.map((point) => (
            <circle
              key={`s-${point.index}`}
              cx={point.x}
              cy={point.y}
              r={hoverIndex === point.index ? 4 : 2.5}
              fill={secondaryColor}
              stroke="#fff"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoverIndex(point.index)}
            />
          ))}

        {data.map((point, index) =>
          index % labelStep === 0 || index === data.length - 1 ? (
            <text
              key={point.label}
              x={primaryPoints[index]?.x ?? padding.left}
              y={chartHeight - 8}
              textAnchor="middle"
              fill={theme.figmaPalette.grey[600]}
              fontSize={10}
              fontFamily={figmaFontFamilyStack.body}
            >
              {point.label}
            </text>
          ) : null,
        )}
      </Box>

      {hovered && hoveredX !== null && (
        <PulseTooltip
          leftPct={(hoveredX / chartWidth) * 100}
          topPct={18}
          title={hovered.label}
          lines={tooltipLines}
        />
      )}
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
  const { ref, width: chartWidth } = useChartWidth()
  const colors = palette.colors

  const chart = useMemo(() => {
    const gradientSuffix = palette.id
    const chartData = getPulseChartData(filter, range)

    switch (chartData.kind) {
      case 'time':
        return (
          <AreaSeriesChart
            data={chartData.data}
            yLabel={chartData.yLabel}
            gradientId={`pulse-${filter}-${gradientSuffix}`}
            lineColor={colors[0]}
            chartWidth={chartWidth}
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
            data={chartData.data}
            primaryLabel={chartData.primaryLabel}
            secondaryLabel={chartData.secondaryLabel}
            primaryColor={dualColors.primary}
            secondaryColor={dualColors.secondary}
            yFormatter={chartData.yFormatter}
            chartWidth={chartWidth}
            showGap={chartData.showGap}
          />
        )
      }
      default:
        return null
    }
  }, [filter, range, palette, colors, chartWidth])

  return (
    <Box ref={ref} sx={{ width: '100%' }}>
      {chart}
    </Box>
  )
}
