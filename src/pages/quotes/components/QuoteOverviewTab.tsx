import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { keyframes, useTheme } from '@mui/material/styles'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link as RouterLink } from 'react-router'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { RecentActivityItem } from '@/app/data/homeMock'
import type { PulseRange } from '@/app/data/pulseMock'
import { ActivityRail } from '@/app/pages/home/ActivityRail'
import { PulseChartControls } from '@/app/pages/home/PulseToolbar'
import {
  getPulsePaletteColors,
  usePulsePreferences,
} from '@/app/pages/home/pulseChartPalettes'
import {
  analyticsBodySx,
  getAnalyticsChartAxisStyle,
} from '@/design-system/components/analytics/analyticsStyles'
import { InsightCallout, insightStatusToVariant } from '@/design-system/components/InsightCallout'
import { isDarkMode, surfaceMuted, surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { OverviewStat } from '@/pages/policies/data/mockOverview'
import { quoteActivitySubtitle } from '@/pages/quotes/data/mockQuoteActivity'
import type { QuoteDetailsRecord } from '@/pages/quotes/data/mockQuoteDetails'
import {
  quoteCoverageInsights,
  quoteCoverageMixSeries,
  quoteCoverageShareSeries,
  sliceQuoteSeriesByRange,
  type QuoteCoverageMixPoint,
  type QuoteCoverageSharePoint,
  type QuoteCoverageSignalPill,
} from '@/pages/quotes/data/quoteCoverageSignals'
import { EntityStatGrid } from '@/pages/shared/components/EntityStatGrid'

const GUTTER = 3.125
const CHART_HEIGHT = 240

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

const COVERAGE_SIGNAL_PILLS: { id: QuoteCoverageSignalPill; label: string }[] = [
  { id: 'mix', label: 'Premium mix' },
  { id: 'share', label: 'Line share' },
]

const COVERAGE_SERIES = [
  { key: 'liability', label: 'CSL liability' },
  { key: 'comprehensive', label: 'Comprehensive' },
  { key: 'collision', label: 'Collision' },
  { key: 'uninsured', label: 'Uninsured motorist' },
] as const

const insightEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 1.5 }}
    >
      <Typography component="h3" variant="subtitle1" sx={headingSx}>
        {title}
      </Typography>
      {action}
    </Stack>
  )
}

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

function CoverageInsightCallout({
  signal,
  range,
}: {
  signal: QuoteCoverageSignalPill
  range: PulseRange
}) {
  const [visible, setVisible] = useState(true)
  const [displayed, setDisplayed] = useState({ signal, range })
  const insight = quoteCoverageInsights[displayed.signal][displayed.range]
  const variant = insightStatusToVariant(insight.status)
  const insightKey = `${displayed.signal}-${displayed.range}-${insight.title}`

  useEffect(() => {
    if (signal === displayed.signal && range === displayed.range) return

    setVisible(false)
    const timeoutId = window.setTimeout(() => {
      setDisplayed({ signal, range })
      setVisible(true)
    }, 140)

    return () => window.clearTimeout(timeoutId)
  }, [signal, range, displayed.signal, displayed.range])

  return (
    <Box sx={{ mt: 1.5, minHeight: 72 }}>
      <Fade in={visible} timeout={{ enter: 220, exit: 140 }}>
        <Box
          key={insightKey}
          sx={{
            animation: visible ? `${insightEnter} 280ms ease-out` : 'none',
          }}
        >
          <InsightCallout variant={variant} title={insight.title}>
            {insight.body}
          </InsightCallout>
        </Box>
      </Fade>
    </Box>
  )
}

function PremiumMixRibbonChart({
  data,
  range,
  colors,
}: {
  data: QuoteCoverageMixPoint[]
  range: PulseRange
  colors: readonly string[]
}) {
  const theme = useTheme()
  const axisStyle = getAnalyticsChartAxisStyle(theme)
  const dark = isDarkMode(theme)
  const chartKey = `quote-mix-${range}-${colors[0]}-${theme.palette.mode}`
  const chartData = useMemo(() => sliceQuoteSeriesByRange(data, range), [data, range])

  const series = COVERAGE_SERIES.map((entry, index) => ({
    ...entry,
    color: colors[index % colors.length] ?? '#0DA3A6',
  }))

  return (
    <Box sx={{ width: '100%', fontFamily: figmaFontFamilyStack.body }}>
      <ChartLegend items={series.map(({ label, color }) => ({ label, color }))} />
      <Box sx={{ width: '100%', height: CHART_HEIGHT, minHeight: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            key={chartKey}
            data={chartData}
            stackOffset="silhouette"
            margin={{ top: 16, right: 8, left: 0, bottom: 4 }}
          >
            <defs>
              {series.map(({ key, color }) => (
                <linearGradient key={key} id={`quote-mix-${key}-${chartKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={dark ? 0.92 : 0.88} />
                  <stop offset="100%" stopColor={color} stopOpacity={dark ? 0.55 : 0.62} />
                </linearGradient>
              ))}
            </defs>
            <XAxis
              dataKey="label"
              tick={axisStyle}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={28}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ stroke: series[0]?.color, strokeWidth: 1, strokeOpacity: dark ? 0.45 : 0.3 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const point = payload[0]?.payload as QuoteCoverageMixPoint | undefined
                return (
                  <Box
                    sx={(t) => ({
                      px: 1.25,
                      py: 0.75,
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      border: `1px solid ${t.palette.divider}`,
                      boxShadow: isDarkMode(t)
                        ? '0 4px 16px rgba(0,0,0,0.45)'
                        : '0 4px 12px rgba(0,0,0,0.08)',
                      minWidth: 160,
                    })}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ...analyticsBodySx, display: 'block', mb: 0.5 }}
                    >
                      {point?.date ?? String(label ?? '')}
                    </Typography>
                    {series.map(({ key, label: seriesLabel, color }) => (
                      <Stack key={key} direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
                        <Typography
                          variant="body2"
                          sx={{ ...analyticsBodySx, fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          {seriesLabel}: ${(point?.[key] ?? 0).toLocaleString('en-US')}K
                        </Typography>
                      </Stack>
                    ))}
                  </Box>
                )
              }}
            />
            {series.map(({ key, label, color }) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={label}
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#quote-mix-${key}-${chartKey})`}
                fillOpacity={1}
                stackId="ribbon"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 1.5 }}
                isAnimationActive
                animationBegin={0}
                animationDuration={900}
                animationEasing="ease-out"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}

function LineShareStackedChart({
  data,
  range,
  colors,
}: {
  data: QuoteCoverageSharePoint[]
  range: PulseRange
  colors: readonly string[]
}) {
  const theme = useTheme()
  const axisStyle = getAnalyticsChartAxisStyle(theme)
  const dark = isDarkMode(theme)
  const chartKey = `quote-share-${range}-${colors[0]}-${theme.palette.mode}`
  const chartData = useMemo(() => sliceQuoteSeriesByRange(data, range), [data, range])

  const series = COVERAGE_SERIES.map((entry, index) => ({
    ...entry,
    color: colors[index % colors.length] ?? '#0DA3A6',
  }))

  return (
    <Box sx={{ width: '100%', fontFamily: figmaFontFamilyStack.body }}>
      <ChartLegend items={series.map(({ label, color }) => ({ label, color }))} />
      <Box sx={{ width: '100%', height: CHART_HEIGHT, minHeight: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            key={chartKey}
            data={chartData}
            stackOffset="expand"
            margin={{ top: 12, right: 8, left: 0, bottom: 4 }}
          >
            <defs>
              {series.map(({ key, color }) => (
                <linearGradient key={key} id={`quote-share-${key}-${chartKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={dark ? 0.85 : 0.8} />
                  <stop offset="100%" stopColor={color} stopOpacity={dark ? 0.45 : 0.55} />
                </linearGradient>
              ))}
            </defs>
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
              tickFormatter={(value: number) => `${Math.round(value * 100)}%`}
            />
            <Tooltip
              cursor={{ stroke: series[0]?.color, strokeWidth: 1, strokeOpacity: dark ? 0.45 : 0.3 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const point = payload[0]?.payload as QuoteCoverageSharePoint | undefined
                return (
                  <Box
                    sx={(t) => ({
                      px: 1.25,
                      py: 0.75,
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      border: `1px solid ${t.palette.divider}`,
                      boxShadow: isDarkMode(t)
                        ? '0 4px 16px rgba(0,0,0,0.45)'
                        : '0 4px 12px rgba(0,0,0,0.08)',
                      minWidth: 160,
                    })}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ...analyticsBodySx, display: 'block', mb: 0.5 }}
                    >
                      {point?.date ?? String(label ?? '')}
                    </Typography>
                    {series.map(({ key, label: seriesLabel, color }) => (
                      <Stack key={key} direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
                        <Typography
                          variant="body2"
                          sx={{ ...analyticsBodySx, fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          {seriesLabel}: {point?.[key] ?? 0}%
                        </Typography>
                      </Stack>
                    ))}
                  </Box>
                )
              }}
            />
            {series.map(({ key, label, color }) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                name={label}
                stroke={color}
                strokeWidth={1.25}
                fill={`url(#quote-share-${key}-${chartKey})`}
                fillOpacity={1}
                stackId="share"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 1.5 }}
                isAnimationActive
                animationBegin={0}
                animationDuration={900}
                animationEasing="ease-out"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}

function CoverageBreakdownSection() {
  const theme = useTheme()
  const [signal, setSignal] = useState<QuoteCoverageSignalPill>('mix')
  const { palette, paletteId, setPaletteId, range, setRange } = usePulsePreferences()
  const colors = getPulsePaletteColors(palette, theme.palette.mode)

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Typography variant="subtitle1" sx={{ ...headingSx, fontSize: '1rem', mb: 2 }}>
        Coverage breakdown
      </Typography>

      <Box
        sx={{
          display: 'grid',
          columnGap: 1.5,
          rowGap: 2,
          gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
          gridTemplateAreas: {
            xs: `
              "filters"
              "chart"
              "controls"
            `,
            md: `
              "filters controls"
              "chart chart"
            `,
          },
          alignItems: 'center',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{ gridArea: 'filters', minWidth: 0 }}
        >
          {COVERAGE_SIGNAL_PILLS.map(({ id, label }) => {
            const selected = signal === id
            return (
              <Chip
                key={id}
                label={label}
                onClick={() => setSignal(id)}
                sx={{
                  fontFamily: figmaFontFamilyStack.body,
                  fontWeight: selected ? 600 : 500,
                  fontSize: '0.8125rem',
                  bgcolor: selected ? 'primary.main' : (t) => surfaceMuted(t),
                  color: selected ? 'primary.contrastText' : 'text.secondary',
                  border: '1px solid',
                  borderColor: selected ? 'primary.main' : (t) => surfaceMuted(t),
                  '&:hover': {
                    bgcolor: selected ? 'primary.dark' : (t) => surfaceSubtle(t),
                    borderColor: selected ? 'primary.dark' : (t) => surfaceSubtle(t),
                  },
                }}
              />
            )
          })}
        </Stack>

        <Box sx={{ gridArea: 'controls', minWidth: 0 }}>
          <PulseChartControls
            range={range}
            onRangeChange={setRange}
            paletteId={paletteId}
            onPaletteChange={setPaletteId}
          />
        </Box>

        <Box sx={{ gridArea: 'chart', minWidth: 0 }}>
          {signal === 'mix' ? (
            <PremiumMixRibbonChart data={quoteCoverageMixSeries} range={range} colors={colors} />
          ) : (
            <LineShareStackedChart data={quoteCoverageShareSeries} range={range} colors={colors} />
          )}
          <CoverageInsightCallout signal={signal} range={range} />
        </Box>
      </Box>
    </Box>
  )
}

function RecentActivitySection({
  items,
  insuredName,
  onActivitySelect,
  activeActivityId,
}: {
  items: RecentActivityItem[]
  insuredName: string
  onActivitySelect?: (activity: RecentActivityItem) => void
  activeActivityId?: string | null
}) {
  const viewAllTo = `/activity?account=${encodeURIComponent(insuredName)}`

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <SectionHeader
        title="Recent activity"
        action={
          <Typography
            component={RouterLink}
            to={viewAllTo}
            variant="body2"
            color="primary"
            sx={{
              fontFamily: figmaFontFamilyStack.body,
              textDecoration: 'none',
              fontSize: '0.8125rem',
              flexShrink: 0,
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            View all
          </Typography>
        }
      />
      <ActivityRail
        items={items}
        getSubtitle={quoteActivitySubtitle}
        onActivityCopilot={onActivitySelect}
        activeCopilotActivityId={activeActivityId}
      />
    </Box>
  )
}

type QuoteOverviewTabProps = {
  quote: QuoteDetailsRecord
  stats: OverviewStat[]
  recentActivity: RecentActivityItem[]
  onActivitySelect?: (activity: RecentActivityItem) => void
  activeActivityId?: string | null
}

export function QuoteOverviewTab({
  quote,
  stats,
  recentActivity,
  onActivitySelect,
  activeActivityId,
}: QuoteOverviewTabProps) {
  return (
    <Box sx={{ width: '100%', minHeight: '100%', bgcolor: 'background.paper', pb: GUTTER }}>
      <Stack spacing={GUTTER}>
        <EntityStatGrid stats={stats} />
        <CoverageBreakdownSection />
        <RecentActivitySection
          items={recentActivity}
          insuredName={quote.insuredName}
          onActivitySelect={onActivitySelect}
          activeActivityId={activeActivityId}
        />
      </Stack>
    </Box>
  )
}
