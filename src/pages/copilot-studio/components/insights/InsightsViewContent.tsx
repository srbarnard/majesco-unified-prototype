import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMemo, useState, type ReactNode } from 'react'
import { PulseChartControls } from '@/app/pages/home/PulseToolbar'
import {
  getPulsePaletteColors,
  usePulsePreferences,
} from '@/app/pages/home/pulseChartPalettes'
import { StatusChip } from '@/design-system/components'
import { AnalyticsAreaLineChart } from '@/design-system/components/analytics/charts/AnalyticsAreaLineChart'
import { AnalyticsCard } from '@/design-system/components/analytics/AnalyticsCard'
import { AnalyticsSectionTitle } from '@/design-system/components/analytics/AnalyticsSectionTitle'
import { AnalyticsStatBox } from '@/design-system/components/analytics/AnalyticsStatBox'
import {
  ANALYTICS_GUTTER,
  analyticsFilterInputSx,
  analyticsHeadingSx,
  analyticsMenuItemSx,
  type AnalyticsKpiMetric,
  type AnalyticsTimeSeriesPoint,
} from '@/design-system/components/analytics/analyticsStyles'
import { surfaceMuted, surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import {
  InsightsDataGridSection,
  InsightsTableLink,
} from '@/pages/copilot-studio/components/insights/InsightsDataTable'
import { InsightsLabeledBarChart, InsightsChartLegend } from '@/pages/copilot-studio/components/insights/InsightsLabeledBarChart'
import { InsightsPageHeader } from '@/pages/copilot-studio/components/insights/InsightsPageHeader'
import {
  sliceStudioInsightsSeriesByRange,
  studioAgentsKpis,
  studioAgentsTrend,
  studioAgentsUsers,
  studioAssistantsKpis,
  studioAssistantsTrend,
  studioAssistantsUsers,
  studioEmailKpis,
  studioEmailMailboxes,
  studioMcpAuthFailures,
  studioMcpAuthFailureTrend,
  studioMcpDiscoveries,
  studioMcpDiscoveryTrend,
  studioMcpErrors,
  studioMcpErrorTrend,
  studioMcpInvocations,
  studioMcpInvocationTrend,
  studioMcpKpis,
  studioMcpPerUserTrend,
  studioMcpUsers,
  studioOverviewCreditTrend,
  studioOverviewInteractionTrend,
  type StudioInsightsView,
} from '@/pages/copilot-studio/data/studioInsightsData'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { useTheme } from '@mui/material/styles'

function KpiGrid({ metrics, columns = 3 }: { metrics: AnalyticsKpiMetric[]; columns?: 3 | 4 | 6 }) {
  const lgSize = columns === 6 ? 2 : columns === 4 ? 3 : 4

  return (
    <Grid container spacing={ANALYTICS_GUTTER}>
      {metrics.map((metric) => (
        <Grid key={metric.id} size={{ xs: 12, sm: 6, lg: lgSize }}>
          <AnalyticsStatBox metric={metric} />
        </Grid>
      ))}
    </Grid>
  )
}

/** Overview-only: chart inside AnalyticsCard. */
function InsightsBarTrendCard({
  title,
  data,
  legendLabel,
}: {
  title: string
  data: AnalyticsTimeSeriesPoint[]
  legendLabel?: string
}) {
  const theme = useTheme()
  const { palette, paletteId, setPaletteId, range, setRange } = usePulsePreferences()
  const colors = getPulsePaletteColors(palette, theme.palette.mode)
  const barColor = colors[0]
  const chartData = useMemo(() => sliceStudioInsightsSeriesByRange(data, range), [data, range])
  const chartKey = `insights-bar-card-${title}-${range}-${barColor}-${theme.palette.mode}`

  return (
    <AnalyticsCard
      header={
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ width: '100%' }}
        >
          <Typography variant="subtitle2" sx={{ ...analyticsHeadingSx, fontSize: '0.9375rem' }}>
            {title}
          </Typography>
          <Box sx={{ minWidth: 0, width: { xs: '100%', sm: 'auto' } }}>
            <PulseChartControls
              range={range}
              onRangeChange={setRange}
              paletteId={paletteId}
              onPaletteChange={setPaletteId}
            />
          </Box>
        </Stack>
      }
      contentSx={{ pt: 0 }}
    >
      <InsightsLabeledBarChart
        data={chartData}
        barColor={barColor}
        legendLabel={legendLabel}
        chartKey={chartKey}
      />
    </AnalyticsCard>
  )
}

/** Overview-only: chart inside AnalyticsCard. */
function InsightsAreaTrendCard({
  title,
  data,
  legendLabel,
}: {
  title: string
  data: AnalyticsTimeSeriesPoint[]
  legendLabel: string
}) {
  const theme = useTheme()
  const { palette, paletteId, setPaletteId, range, setRange } = usePulsePreferences()
  const colors = getPulsePaletteColors(palette, theme.palette.mode)
  const lineColor = colors[0]
  const chartData = useMemo(() => sliceStudioInsightsSeriesByRange(data, range), [data, range])
  const chartKey = `insights-area-card-${title}-${range}-${lineColor}-${theme.palette.mode}`

  return (
    <AnalyticsCard
      header={
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ width: '100%' }}
        >
          <Typography variant="subtitle2" sx={{ ...analyticsHeadingSx, fontSize: '0.9375rem' }}>
            {title}
          </Typography>
          <Box sx={{ minWidth: 0, width: { xs: '100%', sm: 'auto' } }}>
            <PulseChartControls
              range={range}
              onRangeChange={setRange}
              paletteId={paletteId}
              onPaletteChange={setPaletteId}
            />
          </Box>
        </Stack>
      }
      contentSx={{ pt: 0 }}
    >
      <InsightsChartLegend items={[{ label: legendLabel, color: lineColor }]} />
      <AnalyticsAreaLineChart data={chartData} height={280} color={lineColor} chartKey={chartKey} />
    </AnalyticsCard>
  )
}

const insightsChartSectionGridSx = {
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
} as const

/** Details-screen style: section title + controls, no card chrome. */
function InsightsBarTrendSection({
  title,
  data,
  legendLabel,
}: {
  title: string
  data: AnalyticsTimeSeriesPoint[]
  legendLabel?: string
}) {
  const theme = useTheme()
  const { palette, paletteId, setPaletteId, range, setRange } = usePulsePreferences()
  const colors = getPulsePaletteColors(palette, theme.palette.mode)
  const barColor = colors[0]
  const chartData = useMemo(() => sliceStudioInsightsSeriesByRange(data, range), [data, range])
  const chartKey = `insights-bar-${title}-${range}-${barColor}-${theme.palette.mode}`

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Typography variant="subtitle1" sx={{ ...analyticsHeadingSx, fontSize: '1rem', mb: 2 }}>
        {title}
      </Typography>
      <Box sx={insightsChartSectionGridSx}>
        <Box sx={{ gridArea: 'filters', minWidth: 0 }} />
        <Box sx={{ gridArea: 'controls', minWidth: 0 }}>
          <PulseChartControls
            range={range}
            onRangeChange={setRange}
            paletteId={paletteId}
            onPaletteChange={setPaletteId}
          />
        </Box>
        <Box sx={{ gridArea: 'chart', minWidth: 0 }}>
          <InsightsLabeledBarChart
            data={chartData}
            barColor={barColor}
            legendLabel={legendLabel}
            chartKey={chartKey}
          />
        </Box>
      </Box>
    </Box>
  )
}

/** Details-screen style: optional filter pills + controls, no card chrome. */
function InsightsAreaTrendSection({
  title,
  data,
  legendLabel,
  filters,
}: {
  title?: string
  data: AnalyticsTimeSeriesPoint[]
  legendLabel: string
  filters?: ReactNode
}) {
  const theme = useTheme()
  const { palette, paletteId, setPaletteId, range, setRange } = usePulsePreferences()
  const colors = getPulsePaletteColors(palette, theme.palette.mode)
  const lineColor = colors[0]
  const chartData = useMemo(() => sliceStudioInsightsSeriesByRange(data, range), [data, range])
  const chartKey = `insights-area-${title ?? 'trend'}-${range}-${lineColor}-${theme.palette.mode}`

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      {title ? (
        <Typography variant="subtitle1" sx={{ ...analyticsHeadingSx, fontSize: '1rem', mb: 2 }}>
          {title}
        </Typography>
      ) : null}
      <Box sx={insightsChartSectionGridSx}>
        <Box sx={{ gridArea: 'filters', minWidth: 0 }}>{filters}</Box>
        <Box sx={{ gridArea: 'controls', minWidth: 0 }}>
          <PulseChartControls
            range={range}
            onRangeChange={setRange}
            paletteId={paletteId}
            onPaletteChange={setPaletteId}
          />
        </Box>
        <Box sx={{ gridArea: 'chart', minWidth: 0 }}>
          <InsightsChartLegend items={[{ label: legendLabel, color: lineColor }]} />
          <AnalyticsAreaLineChart data={chartData} height={280} color={lineColor} chartKey={chartKey} />
        </Box>
      </Box>
    </Box>
  )
}

function OverviewView() {
  return (
    <Stack spacing={ANALYTICS_GUTTER}>
      <InsightsPageHeader
        title="Overview"
        subtitle="High-level assistant and agent activity across Copilot Studio."
      />

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="Platform activity"
          subtitle="Combined interaction volume and credit consumption for the selected period."
        />
        <Grid container spacing={ANALYTICS_GUTTER}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <InsightsBarTrendCard title="Interactions" data={studioOverviewInteractionTrend} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <InsightsAreaTrendCard
              title="Credit usage"
              data={studioOverviewCreditTrend}
              legendLabel="Credits used"
            />
          </Grid>
        </Grid>
      </Stack>
    </Stack>
  )
}

function AssistantsView() {
  return (
    <Stack spacing={ANALYTICS_GUTTER}>
      <InsightsPageHeader
        title="Assistants"
        subtitle="Monitor assistant interactions, messages, and user engagement."
      />

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="How are users interacting with Majesco Copilot?"
          subtitle="Interaction volume and messaging patterns in the selected time period."
        />
        <KpiGrid metrics={studioAssistantsKpis} />
      </Stack>

      <InsightsBarTrendSection title="Assistant interactions" data={studioAssistantsTrend} />

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle title="Who are the most engaged users?" />
        <InsightsDataGridSection
          title="Top assistant users"
          exportFileName="assistant-users"
          exportAriaLabel="Download assistant users"
          searchPlaceholder="Search users"
          rows={studioAssistantsUsers}
          getRowId={(row) => row.id}
          getSearchText={(row) => row.user}
          columns={[
            { id: 'user', label: 'User', value: (row) => row.user, render: (row) => row.user },
            {
              id: 'interactions',
              label: 'Total interactions in period',
              align: 'right',
              value: (row) => row.interactions,
              render: (row) => String(row.interactions),
            },
            {
              id: 'messages',
              label: 'Messages',
              align: 'right',
              value: (row) => row.messages ?? 0,
              render: (row) => String(row.messages ?? 0),
            },
            {
              id: 'avgMsg',
              label: 'Avg msg / Interaction',
              align: 'right',
              value: (row) => row.avgMsgPerInteraction ?? '',
              render: (row) => String(row.avgMsgPerInteraction ?? '—'),
            },
            {
              id: 'days',
              label: 'Days active in period',
              align: 'right',
              value: (row) => row.daysActive ?? '',
              render: (row) => String(row.daysActive ?? '—'),
            },
            {
              id: 'duration',
              label: 'Avg duration (s)',
              align: 'right',
              value: (row) => row.avgDurationSeconds ?? '',
              render: (row) => String(row.avgDurationSeconds ?? '—'),
            },
          ]}
        />
      </Stack>
    </Stack>
  )
}

function AgentsView() {
  return (
    <Stack spacing={ANALYTICS_GUTTER}>
      <InsightsPageHeader title="Agents" subtitle="Track agent usage and execution activity." />

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle
          title="How are users leveraging agents?"
          subtitle="Agent interactions and run volume in the selected time period."
        />
        <KpiGrid metrics={studioAgentsKpis} />
      </Stack>

      <InsightsBarTrendSection title="Agent interactions" data={studioAgentsTrend} />

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle title="Who are the most engaged users?" />
        <InsightsDataGridSection
          title="Top agent users"
          exportFileName="agent-users"
          exportAriaLabel="Download agent users"
          searchPlaceholder="Search users"
          rows={studioAgentsUsers}
          getRowId={(row) => row.id}
          getSearchText={(row) => row.user}
          columns={[
            { id: 'user', label: 'User', value: (row) => row.user, render: (row) => row.user },
            {
              id: 'interactions',
              label: 'Interactions',
              align: 'right',
              value: (row) => row.interactions,
              render: (row) => String(row.interactions),
            },
            {
              id: 'runs',
              label: 'Runs',
              align: 'right',
              value: (row) => row.runs ?? 0,
              render: (row) => String(row.runs ?? 0),
            },
            {
              id: 'agents',
              label: 'Agents used',
              align: 'right',
              value: (row) => row.agentsUsed ?? 0,
              render: (row) => String(row.agentsUsed ?? 0),
            },
            {
              id: 'avgRuns',
              label: 'Avg runs / interaction',
              align: 'right',
              value: (row) => row.avgRunsPerInteraction ?? '',
              render: (row) => String(row.avgRunsPerInteraction ?? '—'),
            },
          ]}
        />
      </Stack>
    </Stack>
  )
}

function EmailView() {
  return (
    <Stack spacing={ANALYTICS_GUTTER}>
      <InsightsPageHeader
        title="Email"
        subtitle="Monitor email ingestion, classification, and agent routing."
      />

      <KpiGrid metrics={studioEmailKpis} columns={6} />

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle title="Mailboxes" subtitle="Processing volume and sync health by connected mailbox." />
        <InsightsDataGridSection
          exportFileName="email-mailboxes"
          exportAriaLabel="Download mailboxes"
          searchPlaceholder="Search mailboxes"
          rows={studioEmailMailboxes}
          getRowId={(row) => row.id}
          getSearchText={(row) => `${row.mailbox} ${row.provider} ${row.syncStatus}`}
          columns={[
            {
              id: 'mailbox',
              label: 'Mailbox',
              value: (row) => row.mailbox,
              render: (row) => <InsightsTableLink>{row.mailbox}</InsightsTableLink>,
            },
            { id: 'provider', label: 'Provider', value: (row) => row.provider, render: (row) => row.provider },
            {
              id: 'processed',
              label: 'Processed',
              align: 'right',
              value: (row) => row.processed,
              render: (row) => String(row.processed),
            },
            {
              id: 'clear',
              label: 'Clear',
              align: 'right',
              value: (row) => row.clear,
              render: (row) => String(row.clear),
            },
            {
              id: 'dnp',
              label: 'Do not process',
              align: 'right',
              value: (row) => row.doNotProcess,
              render: (row) => String(row.doNotProcess),
            },
            {
              id: 'spam',
              label: 'Spam',
              align: 'right',
              value: (row) => row.spam,
              render: (row) => String(row.spam),
            },
            {
              id: 'failed',
              label: 'Failed',
              align: 'right',
              value: (row) => row.failed,
              render: (row) => String(row.failed),
            },
            {
              id: 'pending',
              label: 'Pending',
              align: 'right',
              value: (row) => row.pending,
              render: (row) => String(row.pending),
            },
            {
              id: 'duration',
              label: 'Avg. duration',
              align: 'right',
              value: (row) => row.avgDuration,
              render: (row) => row.avgDuration,
            },
            {
              id: 'sync',
              label: 'Sync status',
              value: (row) => row.syncStatus,
              render: (row) => (
                <StatusChip
                  label={row.syncStatus}
                  status={row.syncStatus === 'Healthy' ? 'success' : 'error'}
                />
              ),
            },
          ]}
        />
      </Stack>
    </Stack>
  )
}

const MCP_SIGNAL_PILLS = [
  { id: 'invocations', label: 'Invocations' },
  { id: 'per-user', label: 'Per-user' },
  { id: 'discovery', label: 'Discovery' },
  { id: 'errors', label: 'Errors' },
  { id: 'auth-failures', label: 'Auth failures' },
] as const

type McpSignalPill = (typeof MCP_SIGNAL_PILLS)[number]['id']

function McpSignalPills({ signal, onSignalChange }: { signal: McpSignalPill; onSignalChange: (id: McpSignalPill) => void }) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ minWidth: 0 }}>
      {MCP_SIGNAL_PILLS.map(({ id, label }) => {
        const selected = signal === id
        return (
          <Chip
            key={id}
            label={label}
            onClick={() => onSignalChange(id)}
            sx={{
              fontFamily: figmaFontFamilyStack.body,
              fontWeight: selected ? 600 : 500,
              fontSize: '0.8125rem',
              bgcolor: selected ? 'primary.main' : (theme) => surfaceMuted(theme),
              color: selected ? 'primary.contrastText' : 'text.secondary',
              border: '1px solid',
              borderColor: selected ? 'primary.main' : (theme) => surfaceMuted(theme),
              '&:hover': {
                bgcolor: selected ? 'primary.dark' : (theme) => surfaceSubtle(theme),
                borderColor: selected ? 'primary.dark' : (theme) => surfaceSubtle(theme),
              },
            }}
          />
        )
      })}
    </Stack>
  )
}

function McpView() {
  const [signal, setSignal] = useState<McpSignalPill>('invocations')
  const signalPills = <McpSignalPills signal={signal} onSignalChange={setSignal} />

  return (
    <Stack spacing={ANALYTICS_GUTTER}>
      <InsightsPageHeader
        title="MCP Analytics"
        subtitle="Invocation, discovery, error and auth-failure trends per MCP server."
        extraControl={
          <TextField
            select
            size="small"
            defaultValue="all"
            sx={(theme) => ({
              ...analyticsFilterInputSx(theme),
              minWidth: 160,
              '& .MuiOutlinedInput-root': { borderRadius: 5 },
            })}
          >
            <MenuItem value="all" sx={analyticsMenuItemSx}>
              All MCP servers
            </MenuItem>
          </TextField>
        }
      />

      <KpiGrid metrics={studioMcpKpis} columns={4} />

      {signal === 'invocations' ? (
        <>
          <InsightsAreaTrendSection
            data={studioMcpInvocationTrend}
            legendLabel="Calls"
            filters={signalPills}
          />
          <InsightsDataGridSection
            title="Invocation details"
            exportFileName="mcp-invocations"
            exportAriaLabel="Download MCP invocations"
            searchPlaceholder="Search invocations"
            rows={studioMcpInvocations}
            getRowId={(row) => row.id}
            getSearchText={(row) => `${row.date} ${row.mcp} ${row.tool} ${row.status}`}
            columns={[
              { id: 'date', label: 'Date', value: (row) => row.date, render: (row) => row.date },
              { id: 'mcp', label: 'MCP', value: (row) => row.mcp, render: (row) => row.mcp },
              { id: 'tool', label: 'Tool', value: (row) => row.tool, render: (row) => row.tool },
              {
                id: 'status',
                label: 'Status',
                value: (row) => row.status,
                render: (row) => (
                  <StatusChip label={row.status} status={row.status === 'success' ? 'success' : 'error'} />
                ),
              },
              {
                id: 'total',
                label: 'Total',
                align: 'right',
                value: (row) => row.total,
                render: (row) => String(row.total),
              },
              {
                id: 'success',
                label: 'Success',
                align: 'right',
                value: (row) => row.success,
                render: (row) => String(row.success),
              },
              {
                id: 'failed',
                label: 'Failed',
                align: 'right',
                value: (row) => row.failed,
                render: (row) => String(row.failed),
              },
              {
                id: 'avgMs',
                label: 'Avg ms',
                align: 'right',
                value: (row) => row.avgMs,
                render: (row) => String(row.avgMs),
              },
              {
                id: 'users',
                label: 'Users',
                align: 'right',
                value: (row) => row.users,
                render: (row) => String(row.users),
              },
            ]}
          />
        </>
      ) : null}

      {signal === 'per-user' ? (
        <>
          <InsightsAreaTrendSection
            data={studioMcpPerUserTrend}
            legendLabel="Active users"
            filters={signalPills}
          />
          <InsightsDataGridSection
            title="Per-user activity"
            exportFileName="mcp-per-user"
            exportAriaLabel="Download per-user MCP activity"
            searchPlaceholder="Search users"
            rows={studioMcpUsers}
            getRowId={(row) => row.id}
            getSearchText={(row) => row.user}
            columns={[
              { id: 'user', label: 'User', value: (row) => row.user, render: (row) => row.user },
              {
                id: 'calls',
                label: 'Calls',
                align: 'right',
                value: (row) => row.calls,
                render: (row) => String(row.calls),
              },
              {
                id: 'tools',
                label: 'Tools used',
                align: 'right',
                value: (row) => row.tools,
                render: (row) => String(row.tools),
              },
              {
                id: 'avgMs',
                label: 'Avg ms',
                align: 'right',
                value: (row) => row.avgMs,
                render: (row) => String(row.avgMs),
              },
              {
                id: 'lastActive',
                label: 'Last active',
                value: (row) => row.lastActive,
                render: (row) => row.lastActive,
              },
            ]}
          />
        </>
      ) : null}

      {signal === 'discovery' ? (
        <>
          <InsightsAreaTrendSection
            data={studioMcpDiscoveryTrend}
            legendLabel="Discovery events"
            filters={signalPills}
          />
          <InsightsDataGridSection
            title="Discovery details"
            exportFileName="mcp-discovery"
            exportAriaLabel="Download MCP discovery"
            searchPlaceholder="Search discovery events"
            rows={studioMcpDiscoveries}
            getRowId={(row) => row.id}
            getSearchText={(row) => `${row.date} ${row.mcp} ${row.event} ${row.status}`}
            columns={[
              { id: 'date', label: 'Date', value: (row) => row.date, render: (row) => row.date },
              { id: 'mcp', label: 'MCP', value: (row) => row.mcp, render: (row) => row.mcp },
              { id: 'event', label: 'Event', value: (row) => row.event, render: (row) => row.event },
              {
                id: 'toolsFound',
                label: 'Tools found',
                align: 'right',
                value: (row) => row.toolsFound,
                render: (row) => String(row.toolsFound),
              },
              {
                id: 'status',
                label: 'Status',
                value: (row) => row.status,
                render: (row) => (
                  <StatusChip label={row.status} status={row.status === 'success' ? 'success' : 'error'} />
                ),
              },
            ]}
          />
        </>
      ) : null}

      {signal === 'errors' ? (
        <>
          <InsightsAreaTrendSection
            data={studioMcpErrorTrend}
            legendLabel="Errors"
            filters={signalPills}
          />
          <InsightsDataGridSection
            title="Error details"
            exportFileName="mcp-errors"
            exportAriaLabel="Download MCP errors"
            searchPlaceholder="Search errors"
            rows={studioMcpErrors}
            getRowId={(row) => row.id}
            getSearchText={(row) => `${row.date} ${row.mcp} ${row.tool} ${row.code} ${row.message}`}
            columns={[
              { id: 'date', label: 'Date', value: (row) => row.date, render: (row) => row.date },
              { id: 'mcp', label: 'MCP', value: (row) => row.mcp, render: (row) => row.mcp },
              { id: 'tool', label: 'Tool', value: (row) => row.tool, render: (row) => row.tool },
              { id: 'code', label: 'Code', value: (row) => row.code, render: (row) => row.code },
              {
                id: 'message',
                label: 'Message',
                flex: 1.4,
                minWidth: 200,
                value: (row) => row.message,
                render: (row) => row.message,
              },
              {
                id: 'count',
                label: 'Count',
                align: 'right',
                value: (row) => row.count,
                render: (row) => String(row.count),
              },
            ]}
          />
        </>
      ) : null}

      {signal === 'auth-failures' ? (
        <>
          <InsightsAreaTrendSection
            data={studioMcpAuthFailureTrend}
            legendLabel="Auth failures"
            filters={signalPills}
          />
          <InsightsDataGridSection
            title="Auth failure details"
            exportFileName="mcp-auth-failures"
            exportAriaLabel="Download MCP auth failures"
            searchPlaceholder="Search auth failures"
            rows={studioMcpAuthFailures}
            getRowId={(row) => row.id}
            getSearchText={(row) => `${row.date} ${row.mcp} ${row.user} ${row.reason}`}
            columns={[
              { id: 'date', label: 'Date', value: (row) => row.date, render: (row) => row.date },
              { id: 'mcp', label: 'MCP', value: (row) => row.mcp, render: (row) => row.mcp },
              { id: 'user', label: 'User', value: (row) => row.user, render: (row) => row.user },
              {
                id: 'reason',
                label: 'Reason',
                flex: 1.4,
                minWidth: 180,
                value: (row) => row.reason,
                render: (row) => row.reason,
              },
              {
                id: 'count',
                label: 'Count',
                align: 'right',
                value: (row) => row.count,
                render: (row) => String(row.count),
              },
            ]}
          />
        </>
      ) : null}
    </Stack>
  )
}

export function InsightsViewContent({ view }: { view: StudioInsightsView }) {
  switch (view) {
    case 'overview':
      return <OverviewView />
    case 'assistants':
      return <AssistantsView />
    case 'agents':
      return <AgentsView />
    case 'email':
      return <EmailView />
    case 'mcp':
      return <McpView />
    default:
      return <OverviewView />
  }
}
