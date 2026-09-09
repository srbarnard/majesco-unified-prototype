import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Fade from '@mui/material/Fade'
import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { keyframes, useTheme } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router'
import {
  Area,
  AreaChart,
  CartesianGrid,
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
  getAnalyticsChartGridStroke,
} from '@/design-system/components/analytics/analyticsStyles'
import {
  InsightCallout,
  insightStatusToVariant,
} from '@/design-system/components/InsightCallout'
import type { AppTheme } from '@/design-system/theme'
import { isDarkMode, surfaceMuted, surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { ExposureMap } from '@/pages/policies/components/ExposureMap'
import type {
  OverviewStat,
  OverviewStatTone,
  OverviewTimeSeriesPoint,
  OverviewTransaction,
} from '@/pages/policies/data/mockOverview'
import {
  getPolicyTransactionActivity,
  policyTransactionSubtitle,
} from '@/pages/policies/data/mockPolicyActivity'
import type {
  ExposureRangeSnapshot,
  PolicySignalInsight,
} from '@/pages/policies/data/policyOverviewProfiles'

type OverviewTabProps = {
  companyName: string
  policyNumber: string
  stats: OverviewStat[]
  transactionsOverTime: OverviewTimeSeriesPoint[]
  transactions: OverviewTransaction[]
  transactionInsights: Record<PulseRange, PolicySignalInsight>
  exposureByRange: Record<PulseRange, ExposureRangeSnapshot>
  onTransactionSelect?: (activity: RecentActivityItem) => void
  activeTransactionId?: string | null
}

type PolicySignalPill = 'transactions' | 'exposure'

const GUTTER = 3.125 // 25px at 8px spacing unit
const CHART_HEIGHT = 240

const POLICY_SIGNAL_PILLS: Array<{ id: PolicySignalPill; label: string }> = [
  { id: 'transactions', label: 'Transactions' },
  { id: 'exposure', label: 'Exposure map' },
]

/** Point counts for overview monthly series — mirrors Pulse lookback density. */
const RANGE_POINT_COUNTS: Record<PulseRange, number> = {
  '30D': 4,
  '90D': 10,
  '6M': 19,
}

const insightEnter = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

const subtitleSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 500,
} as const

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

function greySurfaceSx(theme: Parameters<typeof surfaceMuted>[0]) {
  return {
    borderRadius: `${layoutTokens.cardRadius}px`,
    bgcolor: surfaceMuted(theme),
  }
}

function sliceTransactionsByRange(
  data: OverviewTimeSeriesPoint[],
  range: PulseRange,
): OverviewTimeSeriesPoint[] {
  const count = Math.min(RANGE_POINT_COUNTS[range], data.length)
  return data.slice(-count)
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

function PolicySignalInsightCallout({
  signal,
  range,
  transactionInsights,
  exposureByRange,
}: {
  signal: PolicySignalPill
  range: PulseRange
  transactionInsights: Record<PulseRange, PolicySignalInsight>
  exposureByRange: Record<PulseRange, ExposureRangeSnapshot>
}) {
  const [visible, setVisible] = useState(true)
  const [displayed, setDisplayed] = useState({ signal, range })
  const insight =
    displayed.signal === 'exposure'
      ? exposureByRange[displayed.range].insight
      : transactionInsights[displayed.range]
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

function getStatToneStyles(tone: OverviewStatTone, theme: AppTheme) {
  const palette = theme.figmaPalette
  const isDark = theme.palette.mode === 'dark'
  const toneMap = {
    success: {
      accent: isDark ? palette.green[900] : palette.green[100],
      value: isDark ? palette.green[200] : palette.green[800],
    },
    info: {
      accent: isDark ? palette.lightBlue[900] : palette.lightBlue[100],
      value: isDark ? palette.lightBlue[200] : palette.lightBlue[900],
    },
    warning: {
      accent: isDark ? palette.amber[900] : palette.amber[100],
      value: isDark ? palette.amber[200] : palette.amber[900],
    },
    error: {
      accent: isDark ? palette.red[900] : palette.red[100],
      value: isDark ? palette.red[200] : palette.red[800],
    },
  } as const
  return toneMap[tone]
}

function StatBox({ stat }: { stat: OverviewStat }) {
  const theme = useTheme() as AppTheme
  const toneStyles = getStatToneStyles(stat.tone, theme)

  return (
    <Box
      sx={(t) => ({
        ...greySurfaceSx(t),
        position: 'relative',
        overflow: 'hidden',
        px: 2.5,
        py: 2,
        height: '100%',
      })}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: toneStyles.accent,
          borderRadius: '2px 0 0 2px',
        }}
      />
      <Typography
        variant="h4"
        sx={{ ...headingSx, fontSize: '1.75rem', lineHeight: 1.2, color: toneStyles.value, mb: 0.75 }}
      >
        {stat.value}
      </Typography>
      <Typography variant="body2" sx={{ ...subtitleSx, fontSize: '0.875rem', color: 'text.primary' }}>
        {stat.label}
      </Typography>
      {stat.helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, display: 'block', mt: 0.5 }}>
          {stat.helperText}
        </Typography>
      )}
    </Box>
  )
}

function StatBoxesSection({ stats }: { stats: OverviewStat[] }) {
  return (
    <Grid container spacing={GUTTER}>
      {stats.map((stat) => (
        <Grid key={stat.id} size={{ xs: 6, md: 3 }}>
          <StatBox stat={stat} />
        </Grid>
      ))}
    </Grid>
  )
}

function TransactionsAreaChart({
  data,
  range,
  lineColor,
}: {
  data: OverviewTimeSeriesPoint[]
  range: PulseRange
  lineColor: string
}) {
  const theme = useTheme()
  const axisStyle = getAnalyticsChartAxisStyle(theme)
  const gridStroke = getAnalyticsChartGridStroke(theme)
  const dark = isDarkMode(theme)
  const dotStroke = theme.palette.background.paper
  const chartKey = `policy-tx-${range}-${lineColor}-${theme.palette.mode}`
  const chartData = useMemo(() => sliceTransactionsByRange(data, range), [data, range])

  return (
    <Box sx={{ width: '100%', fontFamily: figmaFontFamilyStack.body }}>
      <ChartLegend items={[{ label: 'Transactions', color: lineColor }]} />
      <Box sx={{ width: '100%', height: CHART_HEIGHT, minHeight: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            key={chartKey}
            data={chartData}
            margin={{ top: 12, right: 8, left: 0, bottom: 4 }}
          >
            <defs>
              <linearGradient id={`transactions-area-fill-${chartKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={dark ? 0.42 : 0.35} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={dark ? 0.08 : 0.04} />
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
                const point = payload[0]?.payload as OverviewTimeSeriesPoint | undefined
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
                      minWidth: 140,
                    })}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ...analyticsBodySx, display: 'block' }}
                    >
                      {point?.date ?? String(label ?? '')}
                    </Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: lineColor }} />
                      <Typography
                        variant="body2"
                        sx={{ ...analyticsBodySx, fontSize: '0.75rem', fontWeight: 600 }}
                      >
                        Transactions: {payload[0]?.value ?? 0}
                      </Typography>
                    </Stack>
                  </Box>
                )
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              name="Transactions"
              stroke={lineColor}
              strokeWidth={2.5}
              fill={`url(#transactions-area-fill-${chartKey})`}
              dot={{ r: 3.5, fill: lineColor, stroke: dotStroke, strokeWidth: 1.5 }}
              activeDot={{ r: 5, stroke: dotStroke }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}

function PolicySignalsSection({
  data,
  transactionInsights,
  exposureByRange,
}: {
  data: OverviewTimeSeriesPoint[]
  transactionInsights: Record<PulseRange, PolicySignalInsight>
  exposureByRange: Record<PulseRange, ExposureRangeSnapshot>
}) {
  const theme = useTheme()
  const [signal, setSignal] = useState<PolicySignalPill>('transactions')
  const { palette, paletteId, setPaletteId, range, setRange } = usePulsePreferences()
  const colors = getPulsePaletteColors(palette, theme.palette.mode)
  const lineColor = colors[0]
  const exposureSnapshot = exposureByRange[range]

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Typography variant="subtitle1" sx={{ ...headingSx, fontSize: '1rem', mb: 2 }}>
        Policy signals
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
          {POLICY_SIGNAL_PILLS.map(({ id, label }) => {
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
          {signal === 'transactions' ? (
            <TransactionsAreaChart data={data} range={range} lineColor={lineColor} />
          ) : (
            <ExposureMap
              height={260}
              exposureByFips={exposureSnapshot.fips}
              paletteColors={colors}
              ariaLabel="Scheduled units by state"
            />
          )}
          <PolicySignalInsightCallout
            signal={signal}
            range={range}
            transactionInsights={transactionInsights}
            exposureByRange={exposureByRange}
          />
        </Box>
      </Box>
    </Box>
  )
}

function RecentTransactionsSection({
  transactions,
  companyName,
  policyNumber,
  onTransactionSelect,
  activeTransactionId,
}: {
  transactions: OverviewTransaction[]
  companyName: string
  policyNumber: string
  onTransactionSelect?: (activity: RecentActivityItem) => void
  activeTransactionId?: string | null
}) {
  const items = useMemo(
    () =>
      getPolicyTransactionActivity(transactions, {
        policyNumber,
        insuredName: companyName,
      }),
    [companyName, policyNumber, transactions],
  )
  const viewAllTo = `/activity?account=${encodeURIComponent(companyName)}`

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 1.5 }}
      >
        <Typography component="h3" variant="subtitle1" sx={{ ...headingSx }}>
          Recent transactions
        </Typography>
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
      </Stack>
      <ActivityRail
        items={items}
        getSubtitle={policyTransactionSubtitle}
        onActivityCopilot={onTransactionSelect}
        activeCopilotActivityId={activeTransactionId}
      />
    </Box>
  )
}

export function OverviewTab({
  companyName,
  policyNumber,
  stats,
  transactionsOverTime,
  transactions,
  transactionInsights,
  exposureByRange,
  onTransactionSelect,
  activeTransactionId,
}: OverviewTabProps) {
  return (
    <Box sx={{ width: '100%', minHeight: '100%', bgcolor: 'background.paper', pb: GUTTER }}>
      <Stack spacing={GUTTER}>
        <StatBoxesSection stats={stats} />
        <PolicySignalsSection
          data={transactionsOverTime}
          transactionInsights={transactionInsights}
          exposureByRange={exposureByRange}
        />
        <RecentTransactionsSection
          transactions={transactions}
          companyName={companyName}
          policyNumber={policyNumber}
          onTransactionSelect={onTransactionSelect}
          activeTransactionId={activeTransactionId}
        />
      </Stack>
    </Box>
  )
}
