import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined'
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined'
import type { SvgIconComponent } from '@mui/icons-material'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import type { AppTheme } from '@/design-system/theme'
import { accentSubtle, accentSubtleHover, isDarkMode, surfaceMuted, surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type {
  OverviewQuickAction,
  OverviewStat,
  OverviewStatTone,
  OverviewTimeSeriesPoint,
  OverviewTransaction,
} from '@/pages/policies/data/mockOverview'
import { RecentTransactionsDataGrid } from '@/pages/policies/components/RecentTransactionsDataGrid'

type OverviewTabProps = {
  stats: OverviewStat[]
  transactionsOverTime: OverviewTimeSeriesPoint[]
  transactions: OverviewTransaction[]
  quickActions: OverviewQuickAction[]
}

const GUTTER = 3.125 // 25px at 8px spacing unit

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

function whiteCardSurfaceSx(theme: Theme) {
  return {
    borderRadius: `${layoutTokens.cardRadius}px`,
    bgcolor: 'background.paper',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: isDarkMode(theme) ? 'none' : layoutTokens.cardShadow,
  }
}

function greySurfaceSx(theme: Theme) {
  return {
    borderRadius: `${layoutTokens.cardRadius}px`,
    bgcolor: surfaceMuted(theme),
  }
}

const TRANSACTIONS_CARD_HEIGHT = { xs: 360, md: 400 }

function DashboardCard({
  title,
  icon,
  action,
  children,
  noPadding,
  hideHeaderDivider = false,
  headerSx,
  contentSx,
}: {
  title: string
  icon?: ReactNode
  action?: ReactNode
  children: ReactNode
  noPadding?: boolean
  hideHeaderDivider?: boolean
  headerSx?: SxProps<Theme>
  contentSx?: SxProps<Theme>
}) {
  return (
    <Box
      sx={(theme) => ({
        ...whiteCardSurfaceSx(theme),
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: 'background.paper',
          ...(hideHeaderDivider
            ? {}
            : {
                borderBottom: 1,
                borderColor: 'divider',
              }),
          minHeight: 52,
          ...headerSx,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {icon}
          <Typography variant="subtitle1" sx={{ ...headingSx, fontSize: '0.9375rem' }}>
            {title}
          </Typography>
        </Stack>
        {action}
      </Stack>
      <Box sx={{ flex: 1, ...(noPadding ? {} : { p: 2 }), ...contentSx }}>{children}</Box>
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

function TransactionsOverTimeChart({ data }: { data: OverviewTimeSeriesPoint[] }) {
  const theme = useTheme()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const total = useMemo(() => data.reduce((sum, point) => sum + point.value, 0), [data])
  const maxValue = Math.max(...data.map((point) => point.value), 1)
  const yTicks = [0, Math.ceil(maxValue / 2), maxValue]

  const chartWidth = 720
  const chartHeight = 220
  const padding = { top: 20, right: 24, bottom: 32, left: 52 }
  const plotWidth = chartWidth - padding.left - padding.right
  const plotHeight = chartHeight - padding.top - padding.bottom
  const baseline = padding.top + plotHeight

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

  const lineColor = theme.figmaPalette.teal[500]
  const fillColor = theme.figmaPalette.teal[100]
  const gridColor = theme.palette.divider

  const hoveredPoint = hoverIndex !== null ? data[hoverIndex] : null
  const hoveredCoords = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <Box
      sx={(t) => ({
        ...whiteCardSurfaceSx(t),
        overflow: 'hidden',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1, flexShrink: 0 }}>
        <Typography variant="subtitle1" sx={{ ...headingSx, fontSize: '1rem' }}>
          Transactions Over Time
        </Typography>
        <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 0.75 }}>
          <Typography variant="h4" sx={{ ...headingSx, fontSize: '1.75rem', color: 'success.main', lineHeight: 1 }}>
            {total.toLocaleString()}
          </Typography>
          <Stack direction="row" spacing={0.25} alignItems="center" sx={{ color: 'success.main' }}>
            <ArrowUpwardIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2" sx={{ ...subtitleSx, fontSize: '0.8125rem' }}>
              18% vs prior term
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', px: 1, pb: 1.5, pt: 0.5, minHeight: 0, position: 'relative' }}>
        <Box
          component="svg"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
          sx={{ width: '100%', height: '100%', flex: 1, minHeight: 180, display: 'block', userSelect: 'none' }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="transactions-area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillColor} stopOpacity={0.85} />
              <stop offset="100%" stopColor={fillColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>

          {yTicks.map((tick) => {
            const y = padding.top + plotHeight - (tick / maxValue) * plotHeight
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke={gridColor}
                  strokeWidth={1}
                  strokeDasharray="3 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill={theme.figmaPalette.grey[500]}
                  fontSize={11}
                  fontFamily={figmaFontFamilyStack.body}
                >
                  {tick}
                </text>
              </g>
            )
          })}

          <text
            x={14}
            y={padding.top + plotHeight / 2}
            textAnchor="middle"
            fill={theme.figmaPalette.grey[500]}
            fontSize={11}
            fontFamily={figmaFontFamilyStack.body}
            transform={`rotate(-90 14 ${padding.top + plotHeight / 2})`}
          >
            Transactions
          </text>

          {areaPath && <path d={areaPath} fill="url(#transactions-area-fill)" />}
          {linePath && (
            <path d={linePath} fill="none" stroke={lineColor} strokeWidth={2.5} strokeLinecap="round" />
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
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoverIndex(point.index)}
            />
          ))}

          {hoveredCoords && (
            <line
              x1={hoveredCoords.x}
              y1={padding.top}
              x2={hoveredCoords.x}
              y2={baseline}
              stroke={theme.figmaPalette.grey[400]}
              strokeWidth={1}
            />
          )}

          {data.map((point, index) => {
            if (!point.label) return null
            const x = points[index]?.x ?? padding.left
            return (
              <text
                key={point.label}
                x={x}
                y={chartHeight - 10}
                textAnchor="middle"
                fill={theme.figmaPalette.grey[600]}
                fontSize={11}
                fontFamily={figmaFontFamilyStack.body}
              >
                {point.label}
              </text>
            )
          })}
        </Box>

        {hoveredPoint && hoveredCoords && (
          <Box
            sx={{
              position: 'absolute',
              left: `calc(${(hoveredCoords.x / chartWidth) * 100}% - 72px)`,
              top: `${(hoveredCoords.y / chartHeight) * 100 - 18}%`,
              bgcolor: 'grey.900',
              color: 'common.white',
              borderRadius: 1,
              px: 1.25,
              py: 0.75,
              pointerEvents: 'none',
              minWidth: 140,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <Typography variant="caption" sx={{ ...bodySx, display: 'block', color: 'grey.300', mb: 0.25 }}>
              {hoveredPoint.date ?? hoveredPoint.label}
            </Typography>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: lineColor }} />
              <Typography variant="caption" sx={{ ...bodySx, color: 'common.white' }}>
                Transactions {hoveredPoint.value}
              </Typography>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  )
}

function TransactionsCard({ transactions }: { transactions: OverviewTransaction[] }) {
  return (
    <Box
      sx={{
        height: TRANSACTIONS_CARD_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <DashboardCard
        title="Recent transactions"
        action={
          <Link component="button" variant="body2" underline="hover" sx={{ ...subtitleSx, fontSize: '0.8125rem' }}>
            View all
          </Link>
        }
        noPadding
        hideHeaderDivider
        headerSx={{ py: 1.75, minHeight: 56, flexShrink: 0 }}
        contentSx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          p: 0,
        }}
      >
        <RecentTransactionsDataGrid rows={transactions} />
      </DashboardCard>
    </Box>
  )
}

function QuickActionsPanel({ actions }: { actions: OverviewQuickAction[] }) {
  const actionIcons: Record<string, SvgIconComponent> = {
    endorse: PostAddOutlinedIcon,
    documents: DescriptionOutlinedIcon,
    renewal: AutorenewOutlinedIcon,
    note: NoteAddOutlinedIcon,
    email: EmailOutlinedIcon,
    underwriting: GavelOutlinedIcon,
  }

  return (
    <Box
      sx={(theme) => ({
        ...whiteCardSurfaceSx(theme),
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
        <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, display: 'block', mt: 0.125, fontSize: '0.6875rem' }}>
          Common policy tasks
        </Typography>
      </Box>

      <Stack divider={<Divider />} sx={{ flex: 1, px: 0.75, pb: 0.5, minHeight: 0 }}>
        {actions.map((action) => {
          const Icon = actionIcons[action.id] ?? PostAddOutlinedIcon
          const isPrimary = action.variant === 'contained'

          return (
            <Box
              key={action.id}
              component="button"
              type="button"
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
                  bgcolor: isPrimary ? accentSubtle(theme) : surfaceSubtle(theme),
                  color: isPrimary ? 'primary.main' : 'text.secondary',
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
                  color: isPrimary ? 'primary.main' : 'text.primary',
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

export function OverviewTab({
  stats,
  transactionsOverTime,
  transactions,
  quickActions,
}: OverviewTabProps) {
  return (
    <Box sx={{ width: '100%', minHeight: '100%', bgcolor: 'background.paper', pb: GUTTER }}>
      <Stack spacing={GUTTER}>
        <StatBoxesSection stats={stats} />

        <Grid container spacing={GUTTER} alignItems="stretch">
          <Grid size={{ xs: 12, lg: 8 }} sx={{ display: 'flex' }}>
            <TransactionsOverTimeChart data={transactionsOverTime} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex' }}>
            <QuickActionsPanel actions={quickActions} />
          </Grid>
          <Grid size={{ xs: 12 }} sx={{ mb: GUTTER }}>
            <TransactionsCard transactions={transactions} />
          </Grid>
        </Grid>
      </Stack>
    </Box>
  )
}
