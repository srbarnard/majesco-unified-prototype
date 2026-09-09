import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import BlockIcon from '@mui/icons-material/Block'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined'
import type { SvgIconComponent } from '@mui/icons-material'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { keyframes, useTheme } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Link as RouterLink } from 'react-router'
import type { RecentActivityItem } from '@/app/data/homeMock'
import { ActivityRail } from '@/app/pages/home/ActivityRail'
import { PulsePaletteSwitcher } from '@/app/pages/home/PulseToolbar'
import {
  getPulsePaletteColors,
  usePulsePreferences,
  type PulseChartPalette,
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
import {
  accentSubtleHover,
  isDarkMode,
  surfaceMuted,
  surfaceSubtle,
} from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { OverviewQuickAction, OverviewStatTone } from '@/pages/policies/data/mockOverview'
import {
  resolvePremiumStructureOptions,
  type PremiumEstimate,
} from '@/pages/submissions/data/mockSubmissions'
import { getSubmissionActivity } from '@/pages/submissions/data/mockSubmissionActivity'
import { getSubmissionRiskSignals } from '@/pages/submissions/data/submissionRiskSignals'
import type { SubmissionDetailsRecord } from '@/pages/submissions/data/resolveSubmissionContext'

const GUTTER = 3.125

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

export const submissionOverviewQuickActions: OverviewQuickAction[] = [
  { id: 'documents', label: 'Request missing docs' },
  { id: 'assign', label: 'Assign' },
  { id: 'note', label: 'Add note' },
  { id: 'email', label: 'Send email' },
  { id: 'summarize', label: 'Summarize for underwriter' },
]

const STRUCTURE_HELPER: Record<PremiumEstimate['label'], string> = {
  Optimized: 'Leaner rate, tighter terms',
  Balanced: 'Recommended',
  Conservative: 'More limit / load',
}

const STRUCTURE_TONE: Record<PremiumEstimate['label'], OverviewStatTone> = {
  Optimized: 'info',
  Balanced: 'success',
  Conservative: 'warning',
}

const RISK_CHART_HEIGHT = 240

type RiskSignalPill = 'loss' | 'revenue'
type RiskChartRange = '3Y' | '5Y'

const RISK_SIGNAL_PILLS: Array<{ id: RiskSignalPill; label: string }> = [
  { id: 'loss', label: 'Loss history' },
  { id: 'revenue', label: 'Revenue vs exposure' },
]

const RISK_RANGES: Array<{ id: RiskChartRange; label: string }> = [
  { id: '3Y', label: '3Y' },
  { id: '5Y', label: '5Y' },
]

function sliceRiskYears<T>(data: readonly T[], range: RiskChartRange): T[] {
  return range === '3Y' ? data.slice(-3) : [...data]
}

function formatUsdK(value: number) {
  if (value >= 1000) return `$${Math.round(value / 1000)}K`
  return `$${value}`
}

function formatUsdM(value: number) {
  return `$${value.toFixed(1)}M`
}

const riskInsightEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

function RiskSignalInsight({
  signal,
  submissionNumber,
}: {
  signal: RiskSignalPill
  submissionNumber: string
}) {
  const [visible, setVisible] = useState(true)
  const [displayedSignal, setDisplayedSignal] = useState(signal)
  const riskSignals = useMemo(
    () => getSubmissionRiskSignals(submissionNumber),
    [submissionNumber],
  )
  const insight =
    displayedSignal === 'loss' ? riskSignals.lossInsight : riskSignals.revenueInsight
  const variant = insightStatusToVariant(insight.status)

  useEffect(() => {
    if (signal === displayedSignal) return

    setVisible(false)
    const timeoutId = window.setTimeout(() => {
      setDisplayedSignal(signal)
      setVisible(true)
    }, 140)

    return () => window.clearTimeout(timeoutId)
  }, [signal, displayedSignal])

  return (
    <Box sx={{ mt: 1.5, minHeight: 72 }}>
      <Fade in={visible} timeout={{ enter: 220, exit: 140 }}>
        <Box
          key={`${submissionNumber}-${displayedSignal}`}
          sx={{
            animation: visible ? `${riskInsightEnter} 280ms ease-out` : 'none',
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

function RiskChartLegend({ items }: { items: Array<{ label: string; color: string }> }) {
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

function RiskTooltipShell({
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

function whiteCardSurfaceSx(theme: AppTheme) {
  return {
    borderRadius: `${layoutTokens.cardRadius}px`,
    bgcolor: 'background.paper',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: isDarkMode(theme) ? 'none' : layoutTokens.cardShadow,
  }
}

function greySurfaceSx(theme: AppTheme) {
  return {
    borderRadius: `${layoutTokens.cardRadius}px`,
    bgcolor: surfaceMuted(theme),
  }
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

function formatStructureRange(range: string) {
  return range.replace(/\s*-\s*/g, '–')
}

function submissionActivitySubtitle(item: RecentActivityItem) {
  const who = item.performedBy.split(' · ')[0]?.trim()
  return who ? `${who} · ${item.detail}` : item.detail
}

function StructureStatBox({ option }: { option: PremiumEstimate }) {
  const theme = useTheme() as AppTheme
  const tone = STRUCTURE_TONE[option.label]
  const toneStyles = getStatToneStyles(tone, theme)
  const helperText =
    option.label === 'Balanced' && option.recommended
      ? STRUCTURE_HELPER.Balanced
      : STRUCTURE_HELPER[option.label]

  return (
    <Box
      sx={(t) => ({
        ...greySurfaceSx(t as AppTheme),
        position: 'relative',
        overflow: 'hidden',
        px: 2.5,
        py: 2,
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
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
        {formatStructureRange(option.range)}
      </Typography>
      <Typography variant="body2" sx={{ ...subtitleSx, fontSize: '0.875rem', color: 'text.primary' }}>
        {option.label}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, display: 'block', mt: 0.5 }}>
        {helperText}
      </Typography>
    </Box>
  )
}

function BlockedStatBoxes({ submission }: { submission: SubmissionDetailsRecord }) {
  const theme = useTheme() as AppTheme
  const openBlocking = submission.issues.filter(
    (issue) => issue.severity === 'blocking' && !issue.resolvedAt,
  ).length
  const openWarnings = submission.issues.filter(
    (issue) => issue.severity === 'warning' && !issue.resolvedAt,
  ).length

  const boxes: Array<{ label: string; value: string; helper: string; tone: OverviewStatTone }> = [
    {
      label: 'Status',
      value: submission.status,
      helper: openBlocking > 0 ? `${openBlocking} blocking` : 'Needs clearance',
      tone: 'error',
    },
    {
      label: 'Blockers',
      value: String(openBlocking),
      helper: openWarnings > 0 ? `${openWarnings} warning${openWarnings === 1 ? '' : 's'}` : 'Open holds',
      tone: openBlocking > 0 ? 'error' : 'warning',
    },
    {
      label: 'Confidence',
      value: `${submission.confidence}%`,
      helper: 'Intake complete',
      tone: submission.confidence >= 70 ? 'warning' : 'error',
    },
  ]

  return (
    <Grid container spacing={GUTTER}>
      {boxes.map((box) => {
        const toneStyles = getStatToneStyles(box.tone, theme)
        return (
          <Grid key={box.label} size={{ xs: 12, sm: 4 }}>
            <Box
              sx={(t) => ({
                ...greySurfaceSx(t as AppTheme),
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
                sx={{
                  ...headingSx,
                  fontSize: '1.75rem',
                  lineHeight: 1.2,
                  color: toneStyles.value,
                  mb: 0.75,
                }}
              >
                {box.value}
              </Typography>
              <Typography variant="body2" sx={{ ...subtitleSx, fontSize: '0.875rem', color: 'text.primary' }}>
                {box.label}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ...bodySx, display: 'block', mt: 0.5 }}
              >
                {box.helper}
              </Typography>
            </Box>
          </Grid>
        )
      })}
    </Grid>
  )
}

function RiskSignalsChart({
  signal,
  range,
  submissionNumber,
  palette,
}: {
  signal: RiskSignalPill
  range: RiskChartRange
  submissionNumber: string
  palette: PulseChartPalette
}) {
  const theme = useTheme()
  const colors = getPulsePaletteColors(palette, theme.palette.mode)
  const primaryColor = colors[0]
  const secondaryColor = colors[1]
  const axisStyle = getAnalyticsChartAxisStyle(theme)
  const gridStroke = getAnalyticsChartGridStroke(theme)
  const dotStroke = theme.palette.background.paper
  const riskSignals = useMemo(
    () => getSubmissionRiskSignals(submissionNumber),
    [submissionNumber],
  )

  const lossData = useMemo(
    () =>
      sliceRiskYears(riskSignals.lossYears, range).map((point) => ({
        label: point.year,
        primary: point.onFile ? point.incurred : null,
        onFile: point.onFile,
      })),
    [range, riskSignals.lossYears],
  )

  const revenueData = useMemo(
    () =>
      sliceRiskYears(riskSignals.revenueExposure, range).map((point) => ({
        label: point.year,
        primary: point.revenue,
        secondary: point.exposure,
      })),
    [range, riskSignals.revenueExposure],
  )

  const showGate = signal === 'loss' && lossData.some((point) => point.label === '2024')

  if (signal === 'loss') {
    return (
      <Box sx={{ width: '100%', fontFamily: figmaFontFamilyStack.body }}>
        <RiskChartLegend
          items={[
            { label: 'Incurred losses', color: primaryColor },
            { label: 'Years on file / required gate', color: secondaryColor },
          ]}
        />
        <Box sx={{ width: '100%', height: RISK_CHART_HEIGHT, minHeight: RISK_CHART_HEIGHT }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lossData} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
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
                tickFormatter={(value: number) => formatUsdK(value)}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ stroke: theme.palette.divider, strokeWidth: 1 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  const row = payload[0]?.payload as (typeof lossData)[number]
                  return (
                    <RiskTooltipShell
                      title={String(label ?? '')}
                      lines={[
                        {
                          label: 'Incurred losses',
                          value:
                            row.primary == null
                              ? '—'
                              : formatUsdK(Number(row.primary)),
                          color: primaryColor,
                        },
                        {
                          label: 'On file',
                          value: row.onFile ? 'Yes' : 'No',
                          color: secondaryColor,
                        },
                      ]}
                    />
                  )
                }}
              />
              {showGate ? (
                <ReferenceLine
                  x="2024"
                  stroke={secondaryColor}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
              ) : null}
              <Line
                type="monotone"
                dataKey="primary"
                name="Incurred losses"
                stroke={primaryColor}
                strokeWidth={2.5}
                connectNulls={false}
                dot={{ r: 3, fill: primaryColor, stroke: dotStroke, strokeWidth: 1.5 }}
                activeDot={{ r: 4.5, stroke: dotStroke }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', fontFamily: figmaFontFamilyStack.body }}>
      <RiskChartLegend
        items={[
          { label: 'Revenue', color: primaryColor },
          { label: 'Scheduled exposure', color: secondaryColor },
        ]}
      />
      <Box sx={{ width: '100%', height: RISK_CHART_HEIGHT, minHeight: RISK_CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={revenueData} margin={{ top: 12, right: 8, left: 0, bottom: 4 }}>
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
              tickFormatter={(value: number) => formatUsdM(value)}
              allowDecimals
            />
            <Tooltip
              cursor={{ stroke: theme.palette.divider, strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const primary = payload.find((entry) => entry.dataKey === 'primary')
                const secondary = payload.find((entry) => entry.dataKey === 'secondary')
                return (
                  <RiskTooltipShell
                    title={String(label ?? '')}
                    lines={[
                      {
                        label: 'Revenue',
                        value: formatUsdM(Number(primary?.value ?? 0)),
                        color: primaryColor,
                      },
                      {
                        label: 'Scheduled exposure',
                        value: formatUsdM(Number(secondary?.value ?? 0)),
                        color: secondaryColor,
                      },
                    ]}
                  />
                )
              }}
            />
            <Line
              type="monotone"
              dataKey="secondary"
              name="Scheduled exposure"
              stroke={secondaryColor}
              strokeWidth={2}
              opacity={0.9}
              dot={{ r: 2.5, fill: secondaryColor, stroke: dotStroke, strokeWidth: 1.5 }}
              activeDot={{ r: 4, stroke: dotStroke }}
            />
            <Line
              type="monotone"
              dataKey="primary"
              name="Revenue"
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

function RiskSignalsCard({
  submission,
}: {
  submission: SubmissionDetailsRecord
}) {
  const isReady = submission.status === 'Ready'
  const openBlockers = submission.issues.filter(
    (issue) => issue.severity === 'blocking' && !issue.resolvedAt,
  )
  const [signal, setSignal] = useState<RiskSignalPill>('loss')
  const [range, setRange] = useState<RiskChartRange>('5Y')
  const { palette, paletteId, setPaletteId } = usePulsePreferences()

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Typography variant="subtitle1" sx={{ ...headingSx, fontSize: '1rem', mb: 2 }}>
        Risk signals
      </Typography>

      {isReady ? (
        <Box sx={{ width: '100%', minWidth: 0 }}>
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

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.25}
              sx={{
                gridArea: 'controls',
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                minWidth: 0,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                role="tablist"
                aria-label="Risk chart range"
              >
                {RISK_RANGES.map(({ id, label }) => {
                  const selected = range === id
                  return (
                    <Box
                      key={id}
                      component="button"
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setRange(id)}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxSizing: 'border-box',
                        height: 32,
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: figmaFontFamilyStack.body,
                        fontSize: '0.8125rem',
                        fontWeight: selected ? 600 : 500,
                        lineHeight: 1,
                        px: 1.25,
                        py: 0,
                        borderRadius: 1,
                        color: selected ? 'primary.contrastText' : 'text.secondary',
                        bgcolor: selected ? 'primary.main' : (t) => surfaceMuted(t),
                        transition: 'background-color 0.15s ease, color 0.15s ease',
                        whiteSpace: 'nowrap',
                        '&:hover': {
                          bgcolor: selected ? 'primary.dark' : (t) => surfaceSubtle(t),
                        },
                        '&:focus-visible': {
                          outline: 2,
                          outlineColor: 'primary.main',
                          outlineOffset: 2,
                        },
                      }}
                    >
                      {label}
                    </Box>
                  )
                })}
              </Stack>
              <PulsePaletteSwitcher paletteId={paletteId} onPaletteChange={setPaletteId} />
            </Stack>

            <Box sx={{ gridArea: 'chart', minWidth: 0 }}>
              <RiskSignalsChart
                signal={signal}
                range={range}
                submissionNumber={submission.submissionNumber}
                palette={palette}
              />
              <RiskSignalInsight
                key={submission.submissionNumber}
                signal={signal}
                submissionNumber={submission.submissionNumber}
              />
            </Box>
          </Box>
        </Box>
      ) : openBlockers.length > 0 ? (
        <Stack spacing={1.25}>
          {openBlockers.map((issue) => (
            <Stack key={issue.id} direction="row" spacing={1} alignItems="flex-start">
              <BlockIcon sx={{ fontSize: 18, color: 'error.main', mt: 0.125 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.8125rem' }}>
                  {issue.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ...bodySx, fontSize: '0.75rem' }}
                >
                  {issue.summary}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, fontSize: '0.8125rem' }}>
          No open risk signals.
        </Typography>
      )}
    </Box>
  )
}

export function QuickActionsPanel({
  actions,
  onQuickAction,
}: {
  actions: OverviewQuickAction[]
  onQuickAction?: (actionId: string) => void
}) {
  const actionIcons: Record<string, SvgIconComponent> = {
    documents: DescriptionOutlinedIcon,
    assign: AssignmentIndOutlinedIcon,
    note: NoteAddOutlinedIcon,
    email: EmailOutlinedIcon,
    summarize: AutoAwesomeOutlinedIcon,
  }

  return (
    <Box
      sx={(theme) => ({
        ...whiteCardSurfaceSx(theme as AppTheme),
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      })}
    >
      <Box sx={{ px: 1.75, pt: 1.5, pb: 0.5, flexShrink: 0 }}>
        <Typography variant="subtitle1" sx={{ ...headingSx, fontSize: '0.875rem' }}>
          Quick actions
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ ...bodySx, display: 'block', mt: 0.125, fontSize: '0.6875rem' }}
        >
          Common submission tasks
        </Typography>
      </Box>

      <Stack divider={<Divider />} sx={{ flex: 1, px: 0.75, pb: 0.5, minHeight: 0 }}>
        {actions.map((action) => {
          const Icon = actionIcons[action.id] ?? DescriptionOutlinedIcon

          return (
            <Box
              key={action.id}
              component="button"
              type="button"
              onClick={() => onQuickAction?.(action.id)}
              sx={(theme) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                border: 0,
                bgcolor: 'transparent',
                cursor: 'pointer',
                px: 0.75,
                py: 0.75,
                borderRadius: `${layoutTokens.cardRadius}px`,
                textAlign: 'left',
                transition: 'background-color 0.15s ease',
                '&:hover': {
                  bgcolor: accentSubtleHover(theme),
                },
              })}
            >
              <Box
                sx={(theme) => ({
                  width: 28,
                  height: 28,
                  borderRadius: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  bgcolor: surfaceSubtle(theme),
                  color: 'text.secondary',
                })}
              >
                <Icon sx={{ fontSize: 16 }} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  ...subtitleSx,
                  flex: 1,
                  fontSize: '0.75rem',
                  lineHeight: 1.3,
                  color: 'text.primary',
                }}
              >
                {action.label}
              </Typography>
              <ChevronRightIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}

function SubmissionOverviewActivity({ submission }: { submission: SubmissionDetailsRecord }) {
  const items = getSubmissionActivity(submission)
  const viewAllTo = `/activity?account=${encodeURIComponent(submission.insuredName)}`

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 1.5 }}
      >
        <Typography
          component="h3"
          variant="subtitle1"
          sx={{
            fontFamily: figmaFontFamilyStack.heading,
            fontWeight: 600,
          }}
        >
          Recent activity
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
      <ActivityRail items={items} getSubtitle={submissionActivitySubtitle} />
    </Box>
  )
}

type SubmissionOverviewTabProps = {
  submission: SubmissionDetailsRecord
}

export function SubmissionOverviewTab({
  submission,
}: SubmissionOverviewTabProps) {
  const structureOptions = useMemo(
    () =>
      resolvePremiumStructureOptions(submission.premiumEstimates, {
        linesOfBusiness: submission.linesOfBusiness,
        confidence: submission.confidence,
      }),
    [submission.confidence, submission.linesOfBusiness, submission.premiumEstimates],
  )

  const showStructureBoxes = structureOptions.length > 0

  return (
    <Box sx={{ width: '100%', minHeight: '100%', bgcolor: 'background.paper', pb: GUTTER }}>
      <Stack spacing={GUTTER}>
        {showStructureBoxes ? (
          <Grid container spacing={GUTTER}>
            {structureOptions.map((option) => (
              <Grid key={option.label} size={{ xs: 12, sm: 4 }}>
                <StructureStatBox option={option} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <BlockedStatBoxes submission={submission} />
        )}

        <RiskSignalsCard submission={submission} />

        <SubmissionOverviewActivity submission={submission} />
      </Stack>
    </Box>
  )
}
