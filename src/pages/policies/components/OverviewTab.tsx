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
import { useMemo } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
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
  getAnalyticsChartAxisStyle,
  getAnalyticsChartGridStroke,
} from '@/design-system/components/analytics/analyticsStyles'
import type { AppTheme } from '@/design-system/theme'
import { accentSubtle, accentSubtleHover, isDarkMode, surfaceMuted, surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { listDataGridMaxHeight, listDataGridMinHeight } from '@/design-system/tokens/tableLayout'
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

function TransactionsOverTimeChart({ data }: { data: OverviewTimeSeriesPoint[] }) {
  const theme = useTheme()
  const axisStyle = getAnalyticsChartAxisStyle(theme)
  const gridStroke = getAnalyticsChartGridStroke(theme)
  const dark = theme.palette.mode === 'dark'
  const lineColor = dark ? theme.figmaPalette.teal[400] : theme.figmaPalette.teal[500]
  const fillColor = dark ? theme.figmaPalette.teal[900] : theme.figmaPalette.teal[100]
  const dotStroke = theme.palette.background.paper
  const total = useMemo(() => data.reduce((sum, point) => sum + point.value, 0), [data])

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

      <Box sx={{ flex: 1, minHeight: 180, px: 1, pb: 1.5, pt: 0.5 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 16, left: 4, bottom: 4 }}>
            <defs>
              <linearGradient id="transactions-area-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fillColor} stopOpacity={0.85} />
                <stop offset="100%" stopColor={fillColor} stopOpacity={0.05} />
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
              width={40}
              allowDecimals={false}
              label={{
                value: 'Transactions',
                angle: -90,
                position: 'insideLeft',
                style: { ...axisStyle, textAnchor: 'middle' },
              }}
            />
            <Tooltip
              cursor={{ stroke: theme.figmaPalette.grey[400], strokeWidth: 1 }}
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
                      boxShadow:
                        t.palette.mode === 'dark'
                          ? '0 4px 16px rgba(0,0,0,0.45)'
                          : '0 4px 12px rgba(0,0,0,0.08)',
                      minWidth: 140,
                    })}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, display: 'block' }}>
                      {point?.date ?? String(label ?? '')}
                    </Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: lineColor }} />
                      <Typography variant="body2" sx={{ ...bodySx, fontSize: '0.75rem', fontWeight: 600 }}>
                        Transactions {payload[0]?.value ?? 0}
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
              fill="url(#transactions-area-fill)"
              dot={{ r: 3.5, fill: lineColor, stroke: dotStroke, strokeWidth: 1.5 }}
              activeDot={{ r: 5, stroke: dotStroke }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}

const transactionsGridHeightOptions = { headerFilters: false } as const

function TransactionsCard({ transactions }: { transactions: OverviewTransaction[] }) {
  return (
    <Box
      sx={{
        minHeight: listDataGridMinHeight(transactionsGridHeightOptions),
        maxHeight: listDataGridMaxHeight(transactionsGridHeightOptions),
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
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
