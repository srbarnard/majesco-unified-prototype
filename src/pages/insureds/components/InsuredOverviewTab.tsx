import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined'
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
  Bar,
  BarChart,
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
import { InsightCallout, insightStatusToVariant } from '@/design-system/components/InsightCallout'
import { isDarkMode, surfaceMuted, surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import { figmaBorderRadius } from '@/design-system/tokens/figma-border-radius'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { InsuredDetailsRecord } from '@/pages/insureds/data/mockInsuredDetails'
import {
  insuredActivitySubtitle,
  type InsuredOverviewClaim,
  type InsuredOverviewPolicy,
} from '@/pages/insureds/data/mockInsuredOverview'
import {
  insuredPremiumMixSeries,
  insuredRiskInsights,
  insuredRiskScoreSeries,
  sliceInsuredSeriesByRange,
  type InsuredPremiumMixPoint,
  type InsuredRiskSignalPill,
} from '@/pages/insureds/data/insuredRiskSignals'
import type { OverviewStat, OverviewTimeSeriesPoint } from '@/pages/policies/data/mockOverview'
import { EntityStatGrid } from '@/pages/shared/components/EntityStatGrid'

const GUTTER = 3.125
const CHART_HEIGHT = 240

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const RISK_SIGNAL_PILLS: { id: InsuredRiskSignalPill; label: string }[] = [
  { id: 'risk', label: 'Risk score' },
  { id: 'premium', label: 'Premium mix' },
]

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

function GroupedStack({ children }: { children: ReactNode }) {
  return <Stack spacing="3px">{children}</Stack>
}

function groupedRowSx(index: number, total: number) {
  const radius = `${layoutTokens.cardRadius}px`
  const isFirst = index === 0
  const isLast = index === total - 1
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    width: '100%',
    textAlign: 'left' as const,
    border: 'none',
    py: 1.5,
    px: 2,
    borderTopLeftRadius: isFirst ? radius : 0,
    borderTopRightRadius: isFirst ? radius : 0,
    borderBottomLeftRadius: isLast ? radius : 0,
    borderBottomRightRadius: isLast ? radius : 0,
    bgcolor: (theme: Parameters<typeof surfaceMuted>[0]) => surfaceMuted(theme),
    color: 'text.primary',
    transition: 'background-color 0.15s ease',
  }
}

function ToneIcon({
  tone,
  children,
}: {
  tone: 'info' | 'warning' | 'error' | 'success'
  children: ReactNode
}) {
  return (
    <Box
      sx={(theme) => {
        const isLight = theme.palette.mode === 'light'
        const palette =
          tone === 'error'
            ? theme.figmaPalette.red
            : tone === 'warning'
              ? theme.figmaPalette.amber
              : tone === 'success'
                ? theme.figmaPalette.green
                : theme.figmaPalette.lightBlue
        return {
          width: 32,
          height: 32,
          borderRadius: `${figmaBorderRadius.borderRadius}px`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          bgcolor: isLight ? palette[100] : palette[900],
          color: isLight ? palette[800] : palette[200],
        }
      }}
    >
      {children}
    </Box>
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

function PoliciesSection({ policies }: { policies: InsuredOverviewPolicy[] }) {
  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <SectionHeader title="Policies" />
      <GroupedStack>
        {policies.map((policy, index) => {
          const hasClaims = policy.openClaimsCount > 0
          return (
            <Box
              key={policy.id}
              component={RouterLink}
              to={`/policies/${encodeURIComponent(policy.policyNumber)}`}
              sx={{
                ...groupedRowSx(index, policies.length),
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: (t) => surfaceSubtle(t),
                },
                '&:focus-visible': {
                  outline: 2,
                  outlineColor: 'primary.main',
                  outlineOffset: 2,
                },
              }}
            >
              <ToneIcon tone={hasClaims ? 'warning' : 'info'}>
                <PolicyOutlinedIcon sx={{ fontSize: 18 }} />
              </ToneIcon>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.875rem', lineHeight: 1.35 }}>
                  {policy.policyNumber}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ ...bodySx, fontSize: '0.8125rem', lineHeight: 1.4, mt: 0.25, color: 'text.secondary' }}
                >
                  {policy.product} · {policy.status} · {policy.premium}
                  {hasClaims
                    ? ` · ${policy.openClaimsCount} open claim${policy.openClaimsCount === 1 ? '' : 's'}`
                    : ''}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </GroupedStack>
    </Box>
  )
}

function ClaimsSection({ claims }: { claims: InsuredOverviewClaim[] }) {
  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <SectionHeader title="Claims" />
      {claims.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, fontSize: '0.8125rem' }}>
          No claims on this account.
        </Typography>
      ) : (
        <GroupedStack>
          {claims.map((claim, index) => {
            const isOpen = claim.status === 'Open'
            return (
              <Box key={claim.id} sx={groupedRowSx(index, claims.length)}>
                <ToneIcon tone={isOpen ? 'error' : 'success'}>
                  <GavelOutlinedIcon sx={{ fontSize: 18 }} />
                </ToneIcon>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.875rem', lineHeight: 1.35 }}>
                    {claim.claimNumber} · {claim.status}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ ...bodySx, fontSize: '0.8125rem', lineHeight: 1.4, mt: 0.25, color: 'text.secondary' }}
                  >
                    {claim.lossType} · {claim.policyNumber} · {claim.reserve} · DOL {claim.dateOfLoss}
                  </Typography>
                </Box>
              </Box>
            )
          })}
        </GroupedStack>
      )}
    </Box>
  )
}

function RiskScoreAreaChart({
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
  const chartKey = `insured-risk-${range}-${lineColor}-${theme.palette.mode}`
  const chartData = useMemo(() => sliceInsuredSeriesByRange(data, range), [data, range])

  return (
    <Box sx={{ width: '100%', fontFamily: figmaFontFamilyStack.body }}>
      <ChartLegend items={[{ label: 'Risk score', color: lineColor }]} />
      <Box sx={{ width: '100%', height: CHART_HEIGHT, minHeight: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart key={chartKey} data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id={`insured-risk-fill-${chartKey}`} x1="0" y1="0" x2="0" y2="1">
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
              domain={[0, 100]}
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
                        Risk score: {payload[0]?.value ?? 0}
                      </Typography>
                    </Stack>
                  </Box>
                )
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              name="Risk score"
              stroke={lineColor}
              strokeWidth={2.5}
              fill={`url(#insured-risk-fill-${chartKey})`}
              dot={{ r: 3.5, fill: lineColor, stroke: dotStroke, strokeWidth: 1.5 }}
              activeDot={{ r: 5, stroke: dotStroke }}
              isAnimationActive
              animationBegin={0}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}

function PremiumMixStackedBarChart({
  data,
  range,
  colors,
}: {
  data: InsuredPremiumMixPoint[]
  range: PulseRange
  colors: readonly string[]
}) {
  const theme = useTheme()
  const axisStyle = getAnalyticsChartAxisStyle(theme)
  const gridStroke = getAnalyticsChartGridStroke(theme)
  const dark = isDarkMode(theme)
  const autoColor = colors[0] ?? '#0DA3A6'
  const liabilityColor = colors[1] ?? '#5229BC'
  const wcColor = colors[2] ?? '#137835'
  const chartKey = `insured-mix-bar-${range}-${autoColor}-${theme.palette.mode}`
  const chartData = useMemo(() => sliceInsuredSeriesByRange(data, range), [data, range])

  const series = [
    { key: 'auto', label: 'Commercial Auto', color: autoColor },
    { key: 'liability', label: 'General Liability', color: liabilityColor },
    { key: 'workersComp', label: 'Workers Comp', color: wcColor },
  ] as const

  return (
    <Box sx={{ width: '100%', fontFamily: figmaFontFamilyStack.body }}>
      <ChartLegend items={series.map(({ label, color }) => ({ label, color }))} />
      <Box sx={{ width: '100%', height: CHART_HEIGHT, minHeight: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart key={chartKey} data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
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
              width={44}
              tickFormatter={(value: number) => `$${value}K`}
            />
            <Tooltip
              cursor={{ fill: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const point = payload[0]?.payload as InsuredPremiumMixPoint | undefined
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
            {series.map(({ key, label, color }, index) => (
              <Bar
                key={key}
                dataKey={key}
                name={label}
                stackId="mix"
                fill={color}
                radius={index === series.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                isAnimationActive
                animationBegin={0}
                animationDuration={700}
                animationEasing="ease-out"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}

function InsuredRiskInsightCallout({
  signal,
  range,
}: {
  signal: InsuredRiskSignalPill
  range: PulseRange
}) {
  const [visible, setVisible] = useState(true)
  const [displayed, setDisplayed] = useState({ signal, range })
  const insight = insuredRiskInsights[displayed.signal][displayed.range]
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

function RiskProfileSection() {
  const theme = useTheme()
  const [signal, setSignal] = useState<InsuredRiskSignalPill>('risk')
  const { palette, paletteId, setPaletteId, range, setRange } = usePulsePreferences()
  const colors = getPulsePaletteColors(palette, theme.palette.mode)

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Typography variant="subtitle1" sx={{ ...headingSx, fontSize: '1rem', mb: 2 }}>
        Risk profile
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
          {RISK_SIGNAL_PILLS.map(({ id, label }) => {
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
          {signal === 'risk' ? (
            <RiskScoreAreaChart data={insuredRiskScoreSeries} range={range} lineColor={colors[0]} />
          ) : (
            <PremiumMixStackedBarChart data={insuredPremiumMixSeries} range={range} colors={colors} />
          )}
          <InsuredRiskInsightCallout signal={signal} range={range} />
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
        getSubtitle={insuredActivitySubtitle}
        onActivityCopilot={onActivitySelect}
        activeCopilotActivityId={activeActivityId}
      />
    </Box>
  )
}

type InsuredOverviewTabProps = {
  insured: InsuredDetailsRecord
  stats: OverviewStat[]
  policies: InsuredOverviewPolicy[]
  claims: InsuredOverviewClaim[]
  recentActivity: RecentActivityItem[]
  onActivitySelect?: (activity: RecentActivityItem) => void
  activeActivityId?: string | null
}

export function InsuredOverviewTab({
  insured,
  stats,
  policies,
  claims,
  recentActivity,
  onActivitySelect,
  activeActivityId,
}: InsuredOverviewTabProps) {
  return (
    <Box sx={{ width: '100%', minHeight: '100%', bgcolor: 'background.paper', pb: GUTTER }}>
      <Stack spacing={GUTTER}>
        <EntityStatGrid stats={stats} />
        <RiskProfileSection />
        <PoliciesSection policies={policies} />
        <ClaimsSection claims={claims} />
        <RecentActivitySection
          items={recentActivity}
          insuredName={insured.name}
          onActivitySelect={onActivitySelect}
          activeActivityId={activeActivityId}
        />
      </Stack>
    </Box>
  )
}
