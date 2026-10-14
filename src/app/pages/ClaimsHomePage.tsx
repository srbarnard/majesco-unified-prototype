import AccountTreeIcon from '@mui/icons-material/AccountTree'
import AddIcon from '@mui/icons-material/Add'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ChecklistIcon from '@mui/icons-material/Checklist'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'
import CycloneIcon from '@mui/icons-material/Cyclone'
import DescriptionIcon from '@mui/icons-material/Description'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import EventIcon from '@mui/icons-material/Event'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FlagIcon from '@mui/icons-material/Flag'
import ForumIcon from '@mui/icons-material/Forum'
import GavelIcon from '@mui/icons-material/Gavel'
import HealingIcon from '@mui/icons-material/Healing'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import PaymentsIcon from '@mui/icons-material/Payments'
import PersonIcon from '@mui/icons-material/Person'
import PsychologyIcon from '@mui/icons-material/Psychology'
import RemoveIcon from '@mui/icons-material/Remove'
import ScheduleIcon from '@mui/icons-material/Schedule'
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTheme, type Theme } from '@mui/material/styles'
import type { SvgIconComponent } from '@mui/icons-material'
import { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useRightToolDispatch } from '@/app/contexts/RightToolContext'
import {
  FIGMA_METRIC_LABELS,
  HOME_PAGE_SIZE,
  HOME_PERSONA,
  HOME_TODAY,
  METRIC_VISUALIZATIONS,
  addDays,
  claimAlerts,
  claimManagementMetrics,
  dueState,
  escalations,
  featureName,
  fmtLongDay,
  fmtMonthDayLong,
  homeClaims,
  humanDue,
  initialApprovals,
  isoDate,
  mondayFor,
  nextMilestone,
  nextOpenTask,
  openTasks,
  overdueDays,
  parseIsoDate,
  sortedClaims,
  workloadMoves,
  workloadRows,
  type ClaimMetric,
  type DueState,
  type HomeClaim,
  type HomeMilestone,
  type HomeNote,
  type HomeTask,
} from '@/app/data/claimsHomeMock'
import { useRegisterRightToolCopilotCustom } from '@/app/hooks/useRightToolRegistration'
import { CopilotDrawerShell } from '@/pages/policies/components/copilot/CopilotDrawerShell'
import { analyticsBodySx, analyticsChartColors, getAnalyticsChartAxisStyle, getAnalyticsChartGridStroke, getChartTooltipSx } from '@/design-system/components/analytics/analyticsStyles'
import { accentSubtle, isDarkMode } from '@/design-system/theme/themeSurfaces'
import { figmaBorderRadius } from '@/design-system/tokens/figma-border-radius'
import { figmaPalette } from '@/design-system/tokens/figma-palette'
import { figmaSpacing } from '@/design-system/tokens/figma-spacing'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { layoutTokens } from '@/design-system/tokens/layout'

/**
 * Majesco One (MejB450AvNMSC9sQaswS9T) light tokens, scoped to this page only.
 * One has no recorded text/secondary or info/main; secondary text uses the app theme's value.
 */
const one = {
  primary: '#005dbf',
  primaryHover: '#005dbf0a',
  primaryOutlinedBorder: '#005dbf80',
  error: '#a82626',
  success: '#0f5c29',
  warningText: '#663c00',
  warningBg: '#fff4e5',
  divider: '#0000001f',
  paper: '#ffffff',
  textPrimary: '#000000de',
  radius: `${figmaBorderRadius.borderRadius}px`,
} as const

/* ---- shared pieces ---- */
const cardSx = { border: 1, borderColor: 'divider', borderRadius: one.radius, bgcolor: 'background.paper' } as const
const chipRadiusSx = { borderRadius: `${figmaBorderRadius.pillRadius}px` } as const
const tagChipSx = { borderColor: 'divider', color: 'text.primary', ...chipRadiusSx } as const

const textLinkSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
  fontSize: '0.875rem',
  textAlign: 'left',
  verticalAlign: 'baseline',
} as const
const warningChipSx = { bgcolor: one.warningBg, color: one.warningText, ...chipRadiusSx } as const
const dueColor = (state: DueState) =>
  state === 'overdue' ? one.error : state === 'today' || state === 'soon' ? one.warningText : 'text.secondary'

const NoticeContext = createContext<(message: string) => void>(() => undefined)

function ClaimLink({ children, sx }: { children: string; sx?: object }) {
  const notify = useContext(NoticeContext)
  return (
    <Link
      component="button"
      type="button"
      underline="hover"
      onClick={() => notify(`Claim ${children} isn't available yet.`)}
      sx={{ ...textLinkSx, ...sx }}
    >
      {children}
    </Link>
  )
}

function CountChip({ label }: { label: ReactNode }) {
  return (
    <Chip
      size="small"
      variant="outlined"
      color="primary"
      label={label}
      sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 500, ...chipRadiusSx }}
    />
  )
}

function ModuleHeader({ title, count, id, children }: { title: string; count?: ReactNode; id?: string; children?: ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minHeight: 40, mb: 1.5, flexWrap: 'wrap' }}>
      <Typography variant="h2" component="h2" id={id}>
        {title}
      </Typography>
      {count != null ? <CountChip label={count} /> : null}
      <Box sx={{ flex: 1 }} />
      {children}
    </Stack>
  )
}

function ShowMore({
  expanded,
  onClick,
  more,
  less,
  icons = [ExpandMoreIcon, ExpandLessIcon],
}: {
  expanded: boolean
  onClick: () => void
  more: string
  less: string
  icons?: [SvgIconComponent, SvgIconComponent]
}) {
  const Icon = expanded ? icons[1] : icons[0]
  return (
    <Button size="small" startIcon={<Icon />} onClick={onClick}>
      {expanded ? less : more}
    </Button>
  )
}

/** Same height motion as the drawer accordions (MuiCollapse uses the drawer timing). */
function Reveal({ open, children, sx }: { open: boolean; children: ReactNode; sx?: object }) {
  const latest = useRef(children)
  if (children) latest.current = children
  return (
    <Collapse in={open} appear unmountOnExit sx={sx}>
      {open ? children : latest.current}
    </Collapse>
  )
}

function InsightsButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <Button size="small" startIcon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />} onClick={onClick}>
      {count} Insights
    </Button>
  )
}

type SectionInsight = {
  id: string
  title: string
  ask: string
  points: string[]
}

/** Claims desk briefing. Stays put — no daily or policy summary. */
const CLAIMS_COPILOT_POINTS = [
  'Open claims are 74, up 3 from last week.',
  'Average claim lifecycle is 42 days, 6 days above the 36-day target.',
  '11 claims are past the target lifecycle.',
  'CL-90345612-221 is active: projected injury exposure is approaching the available policy limit.',
  '7 claims are unassigned, including 4 older than 24 hours.',
]

function ClaimsCopilotPanel({ onClose }: { onClose: () => void }) {
  return (
    <CopilotDrawerShell
      onClose={onClose}
      contentKey="claims-summary"
      composerPlaceholder="Ask about claims"
      toolbarLeading={<Typography variant="subtitle2">Claims summary</Typography>}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Here is what needs attention on your claims desk.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
        {CLAIMS_COPILOT_POINTS.map((point) => (
          <Typography component="li" variant="body2" key={point} sx={{ mb: 0.75 }}>
            {point}
          </Typography>
        ))}
      </Box>
    </CopilotDrawerShell>
  )
}

function ClaimsSectionInsightPanel({ insight, onClose }: { insight: SectionInsight; onClose: () => void }) {
  const points = insight.points.length > 0 ? insight.points : ['Nothing requires attention right now.']
  return (
    <CopilotDrawerShell
      onClose={onClose}
      contentKey={insight.id}
      toolbarLeading={
        <Stack direction="row" spacing={0.75} alignItems="center">
          <AutoAwesomeIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          <Typography variant="subtitle2">{insight.title}</Typography>
        </Stack>
      }
    >
      <Typography variant="caption" color="text.secondary" display="block">
        You asked
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {insight.ask}
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
        {points.map((point) => (
          <Typography component="li" variant="body2" key={point} sx={{ mb: 0.75 }}>
            {point}
          </Typography>
        ))}
      </Box>
    </CopilotDrawerShell>
  )
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
      {children}
    </Typography>
  )
}

function CloseButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <IconButton size="small" onClick={onClick} aria-label={label}>
      <CloseIcon fontSize="small" />
    </IconButton>
  )
}

function NoteCard({ note }: { note: HomeNote }) {
  return (
    <Box sx={{ ...cardSx, p: 1.5 }}>
      <Typography variant="caption" color="text.secondary">
        <b>{note.author}</b> · {note.date}
      </Typography>
      <Typography variant="body2">{note.text}</Typography>
    </Box>
  )
}

/* ---- Daily Brief ---- */
function chartTooltipValue(payload: unknown): number | undefined {
  if (!Array.isArray(payload) || payload.length === 0) return undefined
  const value = (payload[0] as { value?: unknown }).value
  return typeof value === 'number' ? value : undefined
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: unknown
  label?: string | number
}) {
  const value = chartTooltipValue(payload)
  const tip = getChartTooltipSx(useTheme())
  if (!active || value == null) return null
  return (
    <Box sx={tip.box}>
      {label != null && label !== '' ? (
        <Typography variant="caption" sx={{ ...analyticsBodySx, color: tip.labelColor }} display="block">
          {label}
        </Typography>
      ) : null}
      <Typography variant="body2" sx={{ ...analyticsBodySx, fontWeight: 600, color: tip.valueColor }}>
        {typeof value === 'number' ? value.toLocaleString('en-US') : ''}
      </Typography>
    </Box>
  )
}

function ClaimsHealthDonut({ pct }: { pct: number }) {
  const data = [
    { name: 'Claims health', value: pct },
    { name: 'Remaining', value: 100 - pct },
  ]
  return (
    <Box role="img" aria-label={`Claims health ${pct} percent`} sx={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={26} outerRadius={38} startAngle={90} endAngle={-270} stroke="none" {...chartMotion}>
            <Cell fill={analyticsChartColors[0]} />
            <Cell fill={figmaPalette.grey[200]} />
          </Pie>
          <Tooltip content={(props) => <ChartTooltip active={props.active} payload={props.payload} label={props.label} />} />
        </PieChart>
      </ResponsiveContainer>
      <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
        <Typography variant="h4" component="b">
          {pct}%
        </Typography>
      </Box>
    </Box>
  )
}

const overnightRows: [SvgIconComponent, string, string][] = [
  [AddCircleOutlineIcon, '6 new claims', ' were reported overnight; 2 are still unassigned'],
  [CycloneIcon, '1 CAT event update', ' added 4 potentially affected claims'],
  [PaymentsIcon, '3 material reserve/payment changes', ' exceeded review thresholds'],
  [GavelIcon, '2 new litigation/SIU signals', ' were generated for supervisor review'],
]

function DailyBrief() {
  const [expanded, setExpanded] = useState(false)
  const closure = Number(String(claimManagementMetrics.find((m) => m.id === 'closureRate')?.value ?? '').replace('%', ''))
  const pct = Number.isFinite(closure) && closure > 0 ? Math.round(closure) : 75
  const attentionHead = escalations.slice(0, 3)
  const attentionMore = escalations.slice(3)
  const sectionTitle = (text: string) => (
    <Typography variant="h4" component="h3" sx={{ mb: 1 }}>
      {text}
    </Typography>
  )
  return (
    <Box
      component="section"
      aria-labelledby="dailyBriefTitle"
      sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: one.radius, bgcolor: (theme) => accentSubtle(theme) }}
    >
      <ModuleHeader title="Daily Brief" id="dailyBriefTitle">
        {escalations.length > 3 ? (
          <ShowMore expanded={expanded} onClick={() => setExpanded((v) => !v)} more="Show more" less="Show less" icons={[AddIcon, RemoveIcon]} />
        ) : null}
      </ModuleHeader>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: '16px 24px' }}>
        <Box sx={{ px: 1 }}>
          {sectionTitle('Claims Health')}
          <Stack direction="row" spacing={2} alignItems="center">
            <ClaimsHealthDonut pct={pct} />
            <Box component="ul" sx={{ m: 0, pl: 2.25, typography: 'body2', '& li': { mb: 1 } }}>
              <li>
                Open inventory is <b>3 claims higher</b> than last week.
              </li>
              <li>
                <b>11 claims</b> are past target lifecycle; 3 need near-term review.
              </li>
              <li>
                Large-loss exposure is concentrated in <b>6 claims</b>.
              </li>
            </Box>
          </Stack>
        </Box>
        <Box sx={{ px: 1 }}>
          {sectionTitle(`Overnight activity (${overnightRows.length})`)}
          <Stack component="ul" spacing={1} sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {overnightRows.map(([Icon, bold, rest]) => (
              <Stack component="li" key={bold} direction="row" spacing={1} alignItems="flex-start" sx={{ typography: 'body2' }}>
                <Icon sx={{ fontSize: 20, color: one.primary, flexShrink: 0 }} />
                <span>
                  <b>{bold}</b>
                  {rest}
                </span>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Box sx={{ px: 1 }}>
          {sectionTitle(`Needs attention (${escalations.length})`)}
          <Stack component="ul" spacing={1} sx={{ m: 0, p: 0, listStyle: 'none' }}>
            {attentionHead.map((x) => (
              <Stack component="li" key={x.claim} direction="row" spacing={1} alignItems="baseline" sx={{ typography: 'body2' }}>
                <Box sx={{ flexShrink: 0 }}>
                  <ClaimLink>{x.claim}</ClaimLink>
                </Box>
                <span>{x.description}</span>
              </Stack>
            ))}
            <Reveal open={expanded}>
              <Stack component="ul" spacing={1} sx={{ m: 0, p: 0, listStyle: 'none' }}>
                {attentionMore.map((x) => (
                  <Stack component="li" key={x.claim} direction="row" spacing={1} alignItems="baseline" sx={{ typography: 'body2' }}>
                    <Box sx={{ flexShrink: 0 }}>
                      <ClaimLink>{x.claim}</ClaimLink>
                    </Box>
                    <span>{x.description}</span>
                  </Stack>
                ))}
              </Stack>
            </Reveal>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}

/* ---- Key Metrics ---- */
const chartCaptionSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
  fontSize: '0.75rem',
  color: 'text.secondary',
  mb: 1.5,
} as const

/** Same motion as the prototype bar and line charts. */
const chartMotion = {
  isAnimationActive: true,
  animationBegin: 0,
  animationDuration: 700,
  animationEasing: 'ease-out' as const,
}

function MetricChart({ id }: { id: string }) {
  const theme = useTheme()
  const axisStyle = getAnalyticsChartAxisStyle(theme)
  const gridStroke = getAnalyticsChartGridStroke(theme)
  const series = analyticsChartColors[0]
  const v = METRIC_VISUALIZATIONS[id]
  if (!v) return null
  const barRadius = figmaBorderRadius.borderRadius
  const foot = (left: string, right: string | null) => (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="caption" color="text.secondary">
        {left}
      </Typography>
      {right ? (
        <Typography variant="caption" color="text.secondary">
          {right}
        </Typography>
      ) : null}
    </Stack>
  )
  const tooltip = (
    <Tooltip
      content={(props) => (
        <ChartTooltip active={props.active} payload={props.payload} label={props.label} />
      )}
    />
  )
  if (v.type === 'progress') {
    const pct = Math.max(0, Math.min(100, v.value))
    const target = Math.max(0, Math.min(100, v.target))
    return (
      <Box>
        <Typography sx={chartCaptionSx}>{v.label}</Typography>
        <Box sx={{ height: 72 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={[{ name: v.label, value: pct }]} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={axisStyle} tickLine={false} axisLine={{ stroke: gridStroke }} />
              <YAxis type="category" dataKey="name" hide />
              {tooltip}
              <Bar dataKey="value" fill={series} barSize={12} radius={[barRadius, barRadius, barRadius, barRadius]} {...chartMotion} />
              <ReferenceLine x={target} stroke={theme.palette.text.secondary} strokeDasharray="3 3" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
        {foot(`${pct}%`, `Target ${target}%`)}
      </Box>
    )
  }
  if (v.type === 'bars') {
    const data = v.values.map((value, i) => ({ name: v.categories[i] ?? String(value), value }))
    const max = Math.max(...v.values, 1)
    return (
      <Box>
        <Typography sx={chartCaptionSx}>{v.label}</Typography>
        <Box sx={{ height: 96 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={{ stroke: gridStroke }}
                tickLine={false}
                interval={0}
                tick={{ ...axisStyle, fontSize: 9 }}
                tickFormatter={(value: string | number) => {
                  const label = String(value)
                  return label.length > 5 ? `${label.slice(0, 2)}...` : label
                }}
              />
              <YAxis hide domain={[0, max]} />
              {tooltip}
              <Bar dataKey="value" fill={series} radius={[barRadius, barRadius, 0, 0]} {...chartMotion} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    )
  }
  const data = v.values.map((value, i) => ({ name: String(i + 1), value }))
  const values = v.target != null ? [...v.values, v.target] : v.values
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = Math.max((max - min) * 0.25, 1)
  return (
    <Box>
      <Typography sx={chartCaptionSx}>{v.label}</Typography>
      <Box sx={{ height: 96 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={{ stroke: gridStroke }} />
            <YAxis width={32} domain={[min - pad, max + pad]} tick={axisStyle} tickLine={false} axisLine={false} />
            {tooltip}
            {v.target != null ? <ReferenceLine y={v.target} stroke={theme.palette.text.secondary} strokeDasharray="3 3" /> : null}
            <Line type="linear" dataKey="value" stroke={series} strokeWidth={2} dot={{ r: 2, fill: series }} {...chartMotion} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      {foot('Recent periods', v.target != null ? `Target ${v.target}` : null)}
    </Box>
  )
}

function MetricCard({ metric, onAction }: { metric: ClaimMetric; onAction: (metric: ClaimMetric) => void }) {
  const agent = metric.actionType === 'agent'
  return (
    <Box component="article" sx={{ ...cardSx, display: 'flex', flexDirection: 'column', minHeight: 203 }}>
      <Box
        sx={{
          flex: 1,
          p: 2,
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
          gap: 2,
          alignItems: 'stretch',
          minHeight: 116,
        }}
      >
        <Box>
          <Typography variant="h4" component="div">
            {FIGMA_METRIC_LABELS[metric.id] ?? metric.label}
          </Typography>
          <Typography variant="h1" component="div" sx={{ my: 0.5 }}>
            {metric.value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {metric.support}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {metric.trend}
          </Typography>
        </Box>
        <Box
          sx={(theme) => ({
            borderLeft: { md: `1px solid ${theme.palette.divider}` },
            borderTop: { xs: `1px solid ${theme.palette.divider}`, md: 0 },
            pl: { md: 2 },
            pt: { xs: 1.5, md: 0 },
          })}
        >
          <MetricChart id={metric.id} />
        </Box>
      </Box>
      <Divider />
      <Box sx={{ px: 1, py: 0.5, display: 'flex', justifyContent: 'center' }}>
        <Button size="small" startIcon={agent ? <PsychologyIcon /> : <ForumIcon />} onClick={() => onAction(metric)}>
          {agent ? 'Run agent' : 'Ask Copilot'}
        </Button>
      </Box>
    </Box>
  )
}

function workloadDeltaLabel(current: number, projected: number) {
  if (projected > current) return 'receives work'
  if (projected < current) return 'work reduced'
  return 'unchanged'
}

const agentBorder = (theme: Theme) => (isDarkMode(theme) ? theme.figmaPalette.blue[800] : theme.figmaPalette.blue[200])

function AgentShell({
  title,
  onClose,
  closeLabel,
  children,
}: {
  title: string
  onClose: () => void
  closeLabel: string
  children: ReactNode
}) {
  return (
    <Box
      sx={{
        mt: 1.5,
        border: 1,
        borderColor: agentBorder,
        borderRadius: one.radius,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1.5}
        sx={{
          px: 1.75,
          py: 1.375,
          bgcolor: (theme) => accentSubtle(theme),
          borderBottom: 1,
          borderColor: agentBorder,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={0.875} alignItems="center">
            <PsychologyIcon sx={{ fontSize: 17, color: 'primary.main' }} />
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'primary.main', lineHeight: 1.3 }}>{title}</Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 3, mt: '2px' }}>
            Agent analysis · recommendation only
          </Typography>
        </Box>
        <CloseButton onClick={onClose} label={closeLabel} />
      </Stack>
      <Box sx={{ p: 1.75 }}>{children}</Box>
    </Box>
  )
}

function WorkloadStateBlock({ projected }: { projected: boolean }) {
  return (
    <Box
      sx={{
        border: 1,
        borderRadius: one.radius,
        px: 1.5,
        py: 1.25,
        borderColor: (theme) =>
          projected
            ? isDarkMode(theme)
              ? theme.figmaPalette.green[700]
              : theme.figmaPalette.green[200]
            : theme.palette.divider,
        bgcolor: (theme) =>
          projected
            ? isDarkMode(theme)
              ? theme.figmaPalette.green[900]
              : theme.figmaPalette.green[50]
            : isDarkMode(theme)
              ? theme.palette.background.paper
              : theme.figmaPalette.grey[50],
      }}
    >
      <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', mb: 0.75 }}>
        {projected ? 'Projected state' : 'Current state'}
      </Typography>
      {workloadRows.map((row, index) => (
        <Box
          key={row.name}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 28px 84px',
            columnGap: '7px',
            alignItems: 'center',
            minHeight: 28,
            borderTop: index === 0 ? 0 : 1,
            borderColor: 'divider',
          }}
        >
          <Typography sx={{ fontSize: 12 }}>{row.name}</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>
            {projected ? row.projected : row.current}
          </Typography>
          <Typography sx={{ fontSize: 10, lineHeight: 1.2, textAlign: 'right', color: 'text.secondary' }}>
            {projected ? (
              workloadDeltaLabel(row.current, row.projected)
            ) : (
              <>
                {row.complexity}
                <br />
                complexity
              </>
            )}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

function SuggestionRow({ claim, from, to, why }: { claim: string; from: string; to: string; why: string }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '160px 1fr 1fr' },
        gap: 1,
        alignItems: 'center',
        py: 0.75,
        borderBottom: 1,
        borderColor: one.divider,
      }}
    >
      <ClaimLink>{claim}</ClaimLink>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ typography: 'body2' }}>
        <b>{from}</b>
        <ChevronRightIcon sx={{ fontSize: 16 }} />
        <b>{to}</b>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {why}
      </Typography>
    </Box>
  )
}

function AgentPanel({ metric, onClose }: { metric: ClaimMetric; onClose: () => void }) {
  if (metric.id === 'avgClaims') {
    return (
      <AgentShell title="Workload balancing recommendation" onClose={onClose} closeLabel="Close workload recommendation">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 36px minmax(0, 1fr)' },
            gap: 1.25,
            alignItems: 'center',
          }}
        >
          <WorkloadStateBlock projected={false} />
          <Box sx={{ display: 'flex', justifyContent: 'center', color: 'primary.main', transform: { xs: 'rotate(90deg)', md: 'none' } }}>
            <ArrowForwardIcon sx={{ fontSize: 22 }} />
          </Box>
          <WorkloadStateBlock projected />
        </Box>
        <Typography sx={{ fontSize: 13, fontWeight: 700, mt: '14px', mb: '7px' }}>Suggested reassignments</Typography>
        <Stack spacing={0.75}>
          {workloadMoves.map((mv) => (
            <Box
              key={mv.claim}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '145px minmax(220px, 0.8fr) minmax(0, 1fr)' },
                gap: 1.5,
                alignItems: 'center',
                border: 1,
                borderColor: 'divider',
                borderRadius: one.radius,
                px: 1.25,
                py: 1,
              }}
            >
              <ClaimLink>{mv.claim}</ClaimLink>
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ typography: 'caption', fontWeight: 700 }}>
                <Box component="b">{mv.from}</Box>
                <ArrowForwardIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Box component="b">{mv.to}</Box>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {mv.reason}
              </Typography>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ mt: 1.25 }}>
          <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary', mt: '1px' }} />
          <Typography variant="caption" color="text.secondary">
            This prototype recommendation is for review only. No assignments will be changed.
          </Typography>
        </Stack>
      </AgentShell>
    )
  }
  return (
    <AgentShell title={metric.actionTitle || metric.label} onClose={onClose} closeLabel="Close agent panel">
      <Stack direction="row" spacing={0.75} alignItems="flex-start" sx={{ mb: 1.75 }}>
        <AutoAwesomeIcon sx={{ fontSize: 14, color: 'text.secondary', mt: '1px' }} />
        <Typography variant="caption" color="text.secondary">
          <b>
            {metric.label}: {metric.value}
          </b>
          <br />
          {metric.support}. {metric.trend}. This simulated agent would rank the underlying claims, explain the drivers, and propose
          reviewable next actions.
        </Typography>
      </Stack>
      <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25px', textTransform: 'uppercase', color: 'text.secondary', mb: 0.875 }}>
        Suggested review
      </Typography>
      <Stack spacing={0.75}>
        <SuggestionRow claim="CL-90345612-221" from="Priority" to="Review" why="Material exposure and timing make this a useful first candidate." />
        <SuggestionRow claim="CL-40218856-002" from="Priority" to="Follow up" why="Open work is beyond target and requires a near-term action." />
      </Stack>
    </AgentShell>
  )
}

function KeyMetrics({ onCopilot }: { onCopilot: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [agentId, setAgentId] = useState<string | null>(null)
  const metricHead = claimManagementMetrics.slice(0, 4)
  const metricMore = claimManagementMetrics.slice(4)
  const visibleCount = expanded ? claimManagementMetrics.length : metricHead.length
  const agentMetric = claimManagementMetrics.find((m) => m.id === agentId)
  const onAction = (metric: ClaimMetric) => {
    if (metric.actionType === 'copilot') onCopilot()
    else setAgentId((current) => (current === metric.id ? null : metric.id))
  }
  return (
    <Box component="section" aria-labelledby="keyMetricsTitle" sx={{ mb: 3 }}>
      <ModuleHeader title="Key Metrics" id="keyMetricsTitle" count={`${visibleCount} Metrics`}>
        {claimManagementMetrics.length > 4 ? (
          <ShowMore
            expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            more={`Show more metrics (${claimManagementMetrics.length - 4})`}
            less="Show fewer metrics"
            icons={[AddIcon, RemoveIcon]}
          />
        ) : null}
      </ModuleHeader>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
          gap: `${figmaSpacing[2]}px`,
        }}
      >
        {metricHead.map((m) => (
          <MetricCard key={m.id} metric={m} onAction={onAction} />
        ))}
      </Box>
      <Reveal open={agentMetric != null}>
        {agentMetric ? <AgentPanel metric={agentMetric} onClose={() => setAgentId(null)} /> : null}
      </Reveal>
      <Reveal open={expanded}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
            gap: `${figmaSpacing[2]}px`,
            mt: 2,
          }}
        >
          {metricMore.map((m) => (
            <MetricCard key={m.id} metric={m} onAction={onAction} />
          ))}
        </Box>
      </Reveal>
    </Box>
  )
}

/* ---- claim cards ---- */
function dueLabel(date: string) {
  const state = dueState(date)
  const hd = humanDue(date)
  const text = state === 'overdue' ? `Overdue by ${overdueDays(date)}` : hd === 'Tomorrow' ? 'Due tomorrow' : hd === 'Today' ? 'Today' : `Due ${hd}`
  return { state, text }
}

function DueMark({ date }: { date: string }) {
  const { state, text } = dueLabel(date)
  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: dueColor(state), flexShrink: 0 }}>
      <ScheduleIcon sx={{ fontSize: 16 }} />
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'inherit' }}>
        {text}
      </Typography>
    </Stack>
  )
}

function NextLine({
  kind,
  item,
  onOpen,
}: {
  kind: 'task' | 'milestone'
  item: HomeTask | HomeMilestone | null
  onOpen?: () => void
}) {
  const isTask = kind === 'task'
  const Icon = isTask ? ChecklistIcon : FlagIcon
  const label = item == null ? 'None' : 'description' in item ? item.description : item.label
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" useFlexGap flexWrap="wrap" sx={{ minWidth: 0 }}>
      <Icon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
        {isTask ? 'Next task' : 'Next milestone'}
      </Typography>
      {item && onOpen ? (
        <Link
          component="button"
          type="button"
          underline="hover"
          onClick={onOpen}
          sx={{ ...textLinkSx, minWidth: 0 }}
        >
          {label}
        </Link>
      ) : (
        <Typography variant="body2" noWrap sx={{ minWidth: 0 }}>
          {label}
        </Typography>
      )}
      {item ? <DueMark date={item.dueDate} /> : null}
    </Stack>
  )
}

function TaskCard({ task }: { task: HomeTask }) {
  const state = dueState(task.dueDate)
  return (
    <Box sx={{ ...cardSx, p: 1.5, display: 'flex', gap: 2, borderLeft: 4, borderLeftColor: state === 'overdue' ? one.error : one.divider }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {task.description}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ typography: 'caption', color: 'text.secondary' }}>
          <PersonIcon sx={{ fontSize: 14 }} />
          <span>
            Assigned to <b>{task.assignedTo}</b>
          </span>
        </Stack>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
          {task.tags.map((x) => (
            <Chip key={x} size="small" variant="outlined" label={x} sx={tagChipSx} />
          ))}
        </Stack>
      </Box>
      <Stack alignItems="flex-end" spacing={0.5}>
        <Chip size="small" label={task.status} sx={warningChipSx} />
        <Typography variant="caption" sx={{ color: dueColor(state), fontWeight: 600 }}>
          {humanDue(task.dueDate)}
        </Typography>
      </Stack>
    </Box>
  )
}

function ActivityPanel({ title, Icon, onClose, children }: { title: string; Icon: SvgIconComponent; onClose: () => void; children: ReactNode }) {
  return (
    <Box sx={{ ...cardSx, mt: 1, p: 1.5, bgcolor: one.primaryHover }}>
      <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
        <Icon sx={{ fontSize: 20, mr: 1, color: one.primary }} />
        <Typography variant="h5" component="h4" sx={{ flex: 1 }}>
          {title}
        </Typography>
        <CloseButton onClick={onClose} label={`Close ${title.toLowerCase()}`} />
      </Stack>
      <Stack spacing={1}>{children}</Stack>
    </Box>
  )
}

function ClaimCard({ claim }: { claim: HomeClaim }) {
  const [panel, setPanel] = useState<'tasks' | 'notes' | 'features' | null>(null)
  const [featureFocus, setFeatureFocus] = useState<{ id: string; kind: 'notes' | 'tasks' } | null>(null)
  const nt = nextOpenTask(claim)
  const nm = nextMilestone(claim)
  const myFeatures = claim.features.filter((f) => f.assignedTo === HOME_PERSONA.name)
  const toggle = (name: 'tasks' | 'notes' | 'features') => {
    setFeatureFocus(null)
    setPanel((current) => (current === name ? null : name))
  }
  const linkButton = (Icon: SvgIconComponent, label: string, onClick: () => void) => (
    <Button
      size="small"
      startIcon={<Icon sx={{ fontSize: 16 }} />}
      onClick={onClick}
      sx={{ justifyContent: 'flex-start', minWidth: 0, px: 1, py: 0.25 }}
    >
      {label}
    </Button>
  )
  return (
    <Box sx={{ ...cardSx, overflow: 'hidden', gridColumn: panel ? { md: '1 / -1' } : undefined }}>
      <Box sx={{ px: 2, py: 1.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <ClaimLink>{claim.claim}</ClaimLink>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {claim.insured}
              </Typography>
              <Chip size="small" variant="outlined" label="Open" sx={tagChipSx} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {`${claim.type} · ${claim.detail}`}
            </Typography>
          </Box>
          <Stack alignItems="flex-start" sx={{ flexShrink: 0 }}>
            {linkButton(ChecklistIcon, `Linked tasks (${claim.tasks.length})`, () => toggle('tasks'))}
            {linkButton(StickyNote2OutlinedIcon, `Linked notes (${claim.notes.length})`, () => toggle('notes'))}
            {linkButton(AccountTreeIcon, `Linked features (${claim.features.length})`, () => toggle('features'))}
          </Stack>
        </Stack>
        <Stack spacing={0.5} sx={{ mt: 1.5 }}>
          <NextLine kind="task" item={nt} onOpen={nt ? () => toggle('tasks') : undefined} />
          <NextLine kind="milestone" item={nm} />
        </Stack>
      </Box>
      <Reveal open={panel === 'tasks'}>
        <Box sx={{ px: 2, pb: 1.5 }}>
          <ActivityPanel title="Tasks" Icon={TaskAltIcon} onClose={() => setPanel(null)}>
            {claim.tasks.length ? (
              [...claim.tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map((t) => <TaskCard key={t.id} task={t} />)
            ) : (
              <EmptyNote>No tasks.</EmptyNote>
            )}
          </ActivityPanel>
        </Box>
      </Reveal>
      <Reveal open={panel === 'notes'}>
        <Box sx={{ px: 2, pb: 1.5 }}>
          <ActivityPanel title="Notes" Icon={StickyNote2OutlinedIcon} onClose={() => setPanel(null)}>
            {claim.notes.length ? claim.notes.map((n, i) => <NoteCard key={i} note={n} />) : <EmptyNote>No notes.</EmptyNote>}
          </ActivityPanel>
        </Box>
      </Reveal>
      <Reveal open={panel === 'features'}>
        <Box sx={{ px: 2, py: 1.5, bgcolor: (theme) => accentSubtle(theme) }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <AccountTreeIcon sx={{ fontSize: 20, color: one.primary }} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              My Features
            </Typography>
            <CountChip label={myFeatures.length} />
          </Stack>
          {myFeatures.length ? (
            <Stack spacing={1.5}>
              {myFeatures.map((f) => {
                const FeatureIcon = f.typeIcon === 'home_work' ? HomeWorkIcon : HealingIcon
                const focus = featureFocus?.id === f.id ? featureFocus.kind : null
                const toggleFocus = (kind: 'notes' | 'tasks') =>
                  setFeatureFocus((current) => (current?.id === f.id && current.kind === kind ? null : { id: f.id, kind }))
                return (
                  <Box key={f.id}>
                    <Stack spacing={0.75}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <FeatureIcon sx={{ fontSize: 20, color: one.primary, flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {featureName(f)}
                        </Typography>
                        <Chip size="small" label={f.featureStatus} sx={warningChipSx} />
                        <Box sx={{ flex: 1 }} />
                        <Stack direction="row" sx={{ flexShrink: 0 }}>
                          {linkButton(StickyNote2OutlinedIcon, `${f.notes.length} Note${f.notes.length === 1 ? '' : 's'}`, () => toggleFocus('notes'))}
                          {linkButton(ChecklistIcon, `${f.tasks.length} Task${f.tasks.length === 1 ? '' : 's'}`, () => toggleFocus('tasks'))}
                        </Stack>
                      </Stack>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 0.5, md: 3 }} alignItems={{ md: 'center' }}>
                        <NextLine kind="task" item={nextOpenTask(f)} onOpen={() => toggleFocus('tasks')} />
                        <NextLine kind="milestone" item={nextMilestone(f)} />
                      </Stack>
                    </Stack>
                    <Reveal open={focus === 'tasks'}>
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        {f.tasks.length ? (
                          [...f.tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map((t) => <TaskCard key={t.id} task={t} />)
                        ) : (
                          <EmptyNote>No tasks.</EmptyNote>
                        )}
                      </Stack>
                    </Reveal>
                    <Reveal open={focus === 'notes'}>
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        {f.notes.length ? f.notes.map((n, i) => <NoteCard key={i} note={n} />) : <EmptyNote>No notes.</EmptyNote>}
                      </Stack>
                    </Reveal>
                  </Box>
                )
              })}
            </Stack>
          ) : (
            <EmptyNote>No Features on this claim are assigned to you.</EmptyNote>
          )}
        </Box>
      </Reveal>
    </Box>
  )
}

function ClaimList({ items }: { items: HomeClaim[] }) {
  const [expanded, setExpanded] = useState(false)
  const sorted = sortedClaims(items)
  const claimHead = sorted.slice(0, HOME_PAGE_SIZE)
  const claimMore = sorted.slice(HOME_PAGE_SIZE)
  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: `${figmaSpacing[2]}px`, alignItems: 'start' }}>
        {claimHead.map((c) => (
          <ClaimCard key={c.claim} claim={c} />
        ))}
        <Reveal open={expanded} sx={{ gridColumn: '1 / -1' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: `${figmaSpacing[2]}px`, alignItems: 'start' }}>
            {claimMore.map((c) => (
              <ClaimCard key={c.claim} claim={c} />
            ))}
          </Box>
        </Reveal>
      </Box>
      {sorted.length > HOME_PAGE_SIZE ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <ShowMore
            expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            more={`Show all ${sorted.length} claims`}
            less="Show fewer claims"
          />
        </Box>
      ) : null}
    </>
  )
}

/* ---- Schedule ---- */
type ScheduleSelection = { type: 'pastDue' } | { type: 'day'; date: string }

function Schedule({ claims }: { claims: HomeClaim[] }) {
  const [weekStart, setWeekStart] = useState(() => mondayFor(parseIsoDate(HOME_TODAY)))
  const [selection, setSelection] = useState<ScheduleSelection | null>(null)
  const [showAll, setShowAll] = useState(false)
  const tasks = claims.flatMap((c) => openTasks(c).map((t) => ({ ...t, claim: c.claim, insured: c.insured })))
  const miles = claims.flatMap((c) =>
    c.features.flatMap((f) =>
      f.milestones.filter((m) => m.status !== 'complete').map((m) => ({ ...m, claim: c.claim, feature: featureName(f) })),
    ),
  )
  const pastDue = tasks.filter((t) => t.dueDate < HOME_TODAY).length + miles.filter((m) => m.dueDate < HOME_TODAY).length
  const days = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i))
  const currentMonday = isoDate(mondayFor(parseIsoDate(HOME_TODAY)))
  const select = (next: ScheduleSelection) => {
    setShowAll(false)
    setSelection((current) =>
      current &&
      current.type === next.type &&
      (current.type === 'pastDue' || (next.type === 'day' && current.date === next.date))
        ? null
        : next,
    )
  }
  const moveWeek = (start: Date) => {
    setWeekStart(start)
    setSelection(null)
  }

  let detail: ReactNode = null
  if (selection) {
    const byDate = (x: { dueDate: string }) => (selection.type === 'pastDue' ? x.dueDate < HOME_TODAY : x.dueDate === selection.date)
    const vt = tasks.filter(byDate).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    const vm = miles.filter(byDate).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    const total = vt.length + vm.length
    const budget = showAll ? total : HOME_PAGE_SIZE
    const shownTasks = vt.slice(0, budget)
    const shownMiles = vm.slice(0, Math.max(0, budget - shownTasks.length))
    const dueMark = (date: string) => {
      const state = dueState(date)
      const Icon = state === 'overdue' ? ErrorOutlineIcon : EventIcon
      return (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: dueColor(state), flexShrink: 0 }}>
          <Icon sx={{ fontSize: 16 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'inherit' }}>
            {humanDue(date)}
          </Typography>
        </Stack>
      )
    }
    detail = (
      <Box
        sx={{
          mt: 1.5,
          border: 1,
          borderColor: agentBorder,
          borderRadius: one.radius,
          overflow: 'hidden',
          bgcolor: (theme) => accentSubtle(theme),
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.875}
          sx={{ px: 1.75, py: 1.25, borderBottom: 1, borderColor: agentBorder }}
        >
          <EventIcon sx={{ fontSize: 17, color: 'primary.main' }} />
          <Typography component="h3" sx={{ flex: 1, fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>
            {selection.type === 'pastDue' ? 'Past Due' : fmtLongDay(parseIsoDate(selection.date))}
          </Typography>
          <CloseButton onClick={() => setSelection(null)} label="Close schedule detail" />
        </Stack>
        <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="body2" component="h4" sx={{ fontWeight: 700 }}>
                Tasks
              </Typography>
              <CountChip label={vt.length} />
            </Stack>
            <Stack spacing={1}>
              {shownTasks.length ? (
                shownTasks.map((t) => (
                  <Box key={`${t.claim}-${t.id}`} sx={{ ...cardSx, p: 1.5, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {t.description}
                      </Typography>
                      <Stack direction="row" spacing={0.75} alignItems="baseline" sx={{ typography: 'caption', color: 'text.secondary', mt: 0.5 }}>
                        <ClaimLink>{t.claim}</ClaimLink>
                        <span>·</span>
                        <span>{t.insured}</span>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5, typography: 'caption', color: 'text.secondary' }}>
                        <PersonIcon sx={{ fontSize: 14 }} />
                        <span>
                          Assigned to <b>{t.assignedTo}</b>
                        </span>
                      </Stack>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                        <Chip size="small" label={t.status} sx={warningChipSx} />
                        {t.tags.map((x) => (
                          <Chip key={x} size="small" variant="outlined" label={x} sx={tagChipSx} />
                        ))}
                      </Stack>
                    </Box>
                    {dueMark(t.dueDate)}
                  </Box>
                ))
              ) : (
                <EmptyNote>No tasks.</EmptyNote>
              )}
            </Stack>
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="body2" component="h4" sx={{ fontWeight: 700 }}>
                Milestones
              </Typography>
              <CountChip label={vm.length} />
            </Stack>
            <Stack spacing={1}>
              {shownMiles.length ? (
                shownMiles.map((m) => (
                  <Stack key={m.id} direction="row" spacing={1.5} alignItems="center" sx={{ ...cardSx, p: 1.5 }}>
                    <FlagIcon sx={{ fontSize: 17, color: 'primary.main' }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="baseline">
                        <ClaimLink>{m.claim}</ClaimLink>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {m.feature}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {m.label}
                      </Typography>
                    </Box>
                    {dueMark(m.dueDate)}
                  </Stack>
                ))
              ) : (
                <EmptyNote>No milestones.</EmptyNote>
              )}
            </Stack>
          </Box>
          {total > HOME_PAGE_SIZE ? (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ShowMore expanded={showAll} onClick={() => setShowAll((v) => !v)} more={`Show all ${total}`} less="Show fewer" />
            </Box>
          ) : null}
        </Box>
      </Box>
    )
  }

  return (
    <Box component="section" aria-labelledby="scheduleTitle" sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minHeight: 40, mb: 1.5, flexWrap: 'wrap' }}>
        <Typography variant="h2" component="h2" id="scheduleTitle">
          Schedule
        </Typography>
        <Chip
          clickable
          size="small"
          variant={selection?.type === 'pastDue' ? 'filled' : 'outlined'}
          color="primary"
          label={`${pastDue} Past due`}
          onClick={() => select({ type: 'pastDue' })}
        />
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton size="small" aria-label="Previous work week" onClick={() => moveWeek(addDays(weekStart, -7))} sx={{ bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.grey[800] : theme.figmaPalette.grey[100]) }}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          {isoDate(weekStart) !== currentMonday ? (
            <Button size="small" onClick={() => moveWeek(mondayFor(parseIsoDate(HOME_TODAY)))}>
              Today
            </Button>
          ) : null}
          <Typography variant="subtitle2" component="span">
            {`${fmtMonthDayLong(days[0])} – ${fmtMonthDayLong(days[4])}`}
          </Typography>
          <IconButton size="small" aria-label="Next work week" onClick={() => moveWeek(addDays(weekStart, 7))} sx={{ bgcolor: (theme) => (isDarkMode(theme) ? theme.figmaPalette.grey[800] : theme.figmaPalette.grey[100]) }}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(5, minmax(0, 1fr))' },
          gap: `${figmaSpacing[2]}px`,
        }}
      >
        {days.map((day) => {
          const date = isoDate(day)
          const tc = tasks.filter((t) => t.dueDate === date).length
          const mc = miles.filter((m) => m.dueDate === date).length
          const isToday = date === HOME_TODAY
          const selected = selection?.type === 'day' && selection.date === date
          return (
            <ButtonBase
              key={date}
              onClick={() => select({ type: 'day', date })}
              aria-pressed={selected}
              sx={{
                ...cardSx,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                textAlign: 'left',
                p: selected ? '15px' : 2,
                borderWidth: selected ? 2 : 1,
                borderStyle: 'solid',
                borderColor: selected ? 'primary.main' : 'divider',
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: one.primaryHover },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <Typography variant="body2" component="span">
                  {day.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}
                </Typography>
                <Typography variant="h3" component="span" color="text.primary">
                  {day.getUTCDate()}
                </Typography>
              </Stack>
              {isToday ? (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'primary.main', fontWeight: 600 }}>
                  Today
                </Typography>
              ) : null}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" component="div" color="text.secondary">
                  {tc} task{tc === 1 ? '' : 's'}
                </Typography>
                <Typography variant="body2" component="div" color="text.secondary">
                  {mc} milestone{mc === 1 ? '' : 's'}
                </Typography>
              </Box>
            </ButtonBase>
          )
        })}
      </Box>
      <Reveal open={selection != null}>{detail}</Reveal>
    </Box>
  )
}

/* ---- Approvals ---- */
type ApprovalPanel = 'notes' | 'attachments' | 'approve' | 'reject'

function Approvals({ onInsights }: { onInsights: (insight: SectionInsight) => void }) {
  const [items, setItems] = useState(initialApprovals)
  const [panels, setPanels] = useState<Record<string, ApprovalPanel | null>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [showAll, setShowAll] = useState(false)
  const pending = items.filter((a) => a.status === 'Pending').sort((a, b) => a.requested.localeCompare(b.requested))
  const visible = showAll ? pending : pending.slice(0, HOME_PAGE_SIZE)
  const setPanel = (id: string, panel: ApprovalPanel) =>
    setPanels((current) => ({ ...current, [id]: current[id] === panel ? null : panel }))
  return (
    <Box component="section" sx={{ mb: 3 }}>
      <ModuleHeader title="Approvals">
        <InsightsButton
          count={pending.length}
          onClick={() =>
            onInsights({
              id: 'approvals',
              title: 'Approvals awaiting your decision',
              ask: 'Summarize the approvals waiting on me.',
              points: pending.map((a) => `${a.type} of $${a.amount.toLocaleString()} on ${a.claim} — ${a.reason}.`),
            })
          }
        />
      </ModuleHeader>
      {pending.length === 0 ? (
        <EmptyNote>No pending approvals.</EmptyNote>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: `${figmaSpacing[2]}px`, alignItems: 'start' }}>
        {visible.map((a) => {
          const panel = panels[a.id]
          return (
            <Box key={a.id} sx={{ ...cardSx, p: 2 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }}>
                <Stack direction="row" spacing={2} alignItems="baseline" flexWrap="wrap" useFlexGap>
                  <Typography variant="h4" component="span">
                    {a.type}
                  </Typography>
                  <Typography variant="h2" component="span">{`$${a.amount.toLocaleString()}`}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {`Requesting ${fmtMonthDayLong(parseIsoDate(a.requested))}`}
                  </Typography>
                </Stack>
                <Stack direction="row">
                  <Button size="small" startIcon={<StickyNote2OutlinedIcon sx={{ fontSize: 16 }} />} onClick={() => setPanel(a.id, 'notes')}>
                    {`Linked notes (${a.notes.length})`}
                  </Button>
                  <Button size="small" startIcon={<DescriptionIcon sx={{ fontSize: 16 }} />} onClick={() => setPanel(a.id, 'attachments')}>
                    {`Linked docs (${a.attachments.length})`}
                  </Button>
                </Stack>
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 2, my: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Claim
                  </Typography>
                  <ClaimLink>{a.claim}</ClaimLink>
                </Box>
                {(
                  [
                    ['Feature', a.feature],
                    ['Requestor', a.requestor],
                    ['Reason', a.reason],
                  ] as const
                ).map(([term, value]) => (
                  <Box key={term}>
                    <Typography variant="body2" color="text.secondary">
                      {term}
                    </Typography>
                    <Typography variant="body2">{value}</Typography>
                  </Box>
                ))}
              </Box>
              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button size="small" startIcon={<CloseIcon />} onClick={() => setPanel(a.id, 'reject')}>
                  Reject
                </Button>
                <Button size="small" variant="outlined" startIcon={<CheckCircleOutlineIcon />} onClick={() => setPanel(a.id, 'approve')}>
                  Approve
                </Button>
              </Stack>
              <Reveal open={panel === 'notes'}>
                <ActivityPanel title="Notes" Icon={StickyNote2OutlinedIcon} onClose={() => setPanel(a.id, 'notes')}>
                  {a.notes.map((n, i) => (
                    <NoteCard key={i} note={n} />
                  ))}
                </ActivityPanel>
              </Reveal>
              <Reveal open={panel === 'attachments'}>
                <ActivityPanel title="Attachments" Icon={DescriptionIcon} onClose={() => setPanel(a.id, 'attachments')}>
                  {a.attachments.map((x) => (
                    <Stack key={x.name} direction="row" spacing={1.5} alignItems="center" sx={{ ...cardSx, p: 1.5 }}>
                      <DescriptionIcon sx={{ color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {x.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {x.type} · {x.date}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </ActivityPanel>
              </Reveal>
              <Reveal open={panel === 'approve' || panel === 'reject'}>
                {panel === 'approve' || panel === 'reject' ? (
                <ActivityPanel
                  title={`${panel === 'approve' ? 'Approve' : 'Reject'} Approval`}
                  Icon={panel === 'approve' ? CheckCircleOutlineIcon : CancelOutlinedIcon}
                  onClose={() => setPanel(a.id, panel)}
                >
                  <TextField
                    size="small"
                    multiline
                    minRows={2}
                    label="Comment"
                    placeholder="Add a comment…"
                    value={comments[a.id] ?? ''}
                    onChange={(event) => setComments((current) => ({ ...current, [a.id]: event.target.value }))}
                  />
                  <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Button size="small" onClick={() => setPanel(a.id, panel)}>
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        setItems((current) =>
                          current.map((x) =>
                            x.id === a.id
                              ? { ...x, status: panel === 'approve' ? 'Approved' : 'Rejected', decisionComment: comments[a.id] ?? '' }
                              : x,
                          ),
                        )
                        setPanels((current) => ({ ...current, [a.id]: null }))
                      }}
                    >
                      Save
                    </Button>
                  </Stack>
                </ActivityPanel>
                ) : null}
              </Reveal>
            </Box>
          )
        })}
        </Box>
      )}
      {pending.length > HOME_PAGE_SIZE ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <ShowMore expanded={showAll} onClick={() => setShowAll((v) => !v)} more={`Show all ${pending.length}`} less="Show fewer" />
        </Box>
      ) : null}
    </Box>
  )
}

/* ---- Claim Alerts ---- */
type AlertFilter = 'active' | 'inactive' | 'all'

function ClaimAlerts({ claims, onInsights }: { claims: HomeClaim[]; onInsights: (insight: SectionInsight) => void }) {
  const [filter, setFilter] = useState<AlertFilter>('active')
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})
  const [showAll, setShowAll] = useState(false)
  const scope = new Set(claims.map((c) => c.claim))
  const all = claimAlerts.filter((a) => scope.has(a.claimNumber))
  const isActive = (a: (typeof all)[number]) => (a.id in overrides ? overrides[a.id] : a.active)
  const nActive = all.filter(isActive).length
  const rows = all.filter((a) => (filter === 'all' ? true : filter === 'active' ? isActive(a) : !isActive(a)))
  const visible = showAll ? rows : rows.slice(0, HOME_PAGE_SIZE)
  return (
    <Box component="section" sx={{ mb: 3 }}>
      <ModuleHeader title="Claim Alerts" count={nActive}>
        <InsightsButton
          count={nActive}
          onClick={() =>
            onInsights({
              id: 'claimAlerts',
              title: 'Active claim alerts',
              ask: 'Explain the active claim alerts.',
              points: all.filter(isActive).map((a) => `${a.claimNumber} — ${a.description}`),
            })
          }
        />
      </ModuleHeader>
      <Tabs
        value={filter}
        onChange={(_, v: AlertFilter) => {
          setFilter(v)
          setShowAll(false)
        }}
        sx={{ borderBottom: 1, borderColor: one.divider, mb: 1.5 }}
      >
        <Tab value="active" label={`Active (${nActive})`} />
        <Tab value="inactive" label="Inactive" />
        <Tab value="all" label="All" />
      </Tabs>
      {rows.length ? (
        visible.map((a) => {
          const active = isActive(a)
          return (
            <Stack
              key={a.id}
              role="alert"
              direction="row"
              spacing={1.5}
              alignItems="flex-start"
              sx={{
                mb: 1,
                px: 2,
                py: 1.5,
                borderRadius: one.radius,
                border: 0,
                typography: 'body2',
                bgcolor: (theme) => (active ? theme.figmaPalette.red[50] : theme.figmaPalette.green[50]),
                color: (theme) => (active ? theme.figmaPalette.red[900] : theme.figmaPalette.green[900]),
              }}
            >
              <IconButton
                size="small"
                aria-label={`${active ? 'Deactivate' : 'Reactivate'} alert`}
                onClick={() => setOverrides((current) => ({ ...current, [a.id]: !active }))}
                sx={{ color: active ? one.error : one.success, alignSelf: 'flex-start', mt: 0.25 }}
              >
                {active ? <ErrorOutlineIcon fontSize="small" /> : <CheckCircleOutlineIcon fontSize="small" />}
              </IconButton>
              <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
                <ClaimLink sx={{ color: 'primary.main' }}>{a.claimNumber}</ClaimLink>
                <Typography variant="body2" sx={{ color: 'inherit' }}>
                  {a.description}
                </Typography>
              </Stack>
            </Stack>
          )
        })
      ) : (
        <EmptyNote>{`No ${filter === 'all' ? '' : `${filter} `}claim alerts.`}</EmptyNote>
      )}
      {rows.length > HOME_PAGE_SIZE ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <ShowMore expanded={showAll} onClick={() => setShowAll((v) => !v)} more={`Show all ${rows.length}`} less="Show fewer" />
        </Box>
      ) : null}
    </Box>
  )
}

/* ---- My claims ---- */
type MyClaimsTab = 'my' | 'fnol' | 'unassigned'

function MyClaims({ claims, onInsights }: { claims: HomeClaim[]; onInsights: (insight: SectionInsight) => void }) {
  const [tab, setTab] = useState<MyClaimsTab>('my')
  return (
    <Box component="section" sx={{ mb: 3 }}>
      <ModuleHeader title="My claims">
        <InsightsButton
          count={claims.length}
          onClick={() =>
            onInsights({
              id: 'myClaims',
              title: 'My claims summary',
              ask: 'Summarize my claims and what needs attention.',
              points: sortedClaims(claims)
                .slice(0, 4)
                .map((c) => {
                  const task = nextOpenTask(c)
                  return `${c.claim} — ${task ? `${task.description} (${humanDue(task.dueDate)})` : 'no open tasks'}.`
                }),
            })
          }
        />
      </ModuleHeader>
      <Tabs value={tab} onChange={(_, v: MyClaimsTab) => setTab(v)} sx={{ borderBottom: 1, borderColor: one.divider, mb: 1.5 }}>
        <Tab value="my" label="My claims" />
        <Tab value="fnol" label="Pending FNOL" />
        <Tab value="unassigned" label="Unassigned claims" />
      </Tabs>
      {tab === 'my' ? (
        <ClaimList items={claims} />
      ) : (
        <EmptyNote>{tab === 'fnol' ? 'No pending FNOL submissions.' : 'No unassigned claims.'}</EmptyNote>
      )}
    </Box>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const MY_CLAIMS = homeClaims.injury

/** Joan's claims home. New Claim opens the shell's Create claim drawer, the same one as + → Claim. */
export function ClaimsHomePage() {
  const { openTool, closeTool } = useRightToolDispatch()
  const [notice, setNotice] = useState<string | null>(null)
  const [sectionInsight, setSectionInsight] = useState<SectionInsight | null>(null)
  const openCopilot = () => {
    setSectionInsight(null)
    openTool('copilot')
  }
  const openSectionInsights = (insight: SectionInsight) => {
    setSectionInsight(insight)
    openTool('copilot')
  }
  const closeCopilot = () => {
    setSectionInsight(null)
    closeTool()
  }

  useRegisterRightToolCopilotCustom(
    sectionInsight ? (
      <ClaimsSectionInsightPanel insight={sectionInsight} onClose={closeCopilot} />
    ) : (
      <ClaimsCopilotPanel onClose={closeCopilot} />
    ),
    [sectionInsight?.id, sectionInsight?.points?.join('\n')],
  )

  return (
    <NoticeContext.Provider value={setNotice}>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', bgcolor: 'background.paper' }}>
        <Box sx={{ px: `${figmaSpacing[3]}px`, pt: layoutTokens.policyHeaderTopPadding, pb: 6 }}>
          <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
            {`${getGreeting()}, ${HOME_PERSONA.name.split(' ')[0]}`}
          </Typography>
          <Box component="section" aria-label="Actions" sx={{ mb: 3 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openTool('newClaim')}>
              New Claim
            </Button>
          </Box>
          <DailyBrief />
          <KeyMetrics onCopilot={openCopilot} />
          <Schedule claims={MY_CLAIMS} />
          <Approvals onInsights={openSectionInsights} />
          <ClaimAlerts claims={MY_CLAIMS} onInsights={openSectionInsights} />
          <MyClaims claims={MY_CLAIMS} onInsights={openSectionInsights} />
        </Box>
      </Box>
      <Snackbar open={notice != null} autoHideDuration={3500} onClose={() => setNotice(null)} message={notice} />
    </NoticeContext.Provider>
  )
}
