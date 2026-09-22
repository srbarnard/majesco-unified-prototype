import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { PulseChartControls } from '@/app/pages/home/PulseToolbar'
import {
  getPulsePaletteColors,
  usePulsePreferences,
} from '@/app/pages/home/pulseChartPalettes'
import type { PulseRange } from '@/app/data/pulseMock'
import { StatusChip } from '@/design-system/components'
import { AnalyticsAreaLineChart } from '@/design-system/components/analytics/charts/AnalyticsAreaLineChart'
import { AnalyticsCard } from '@/design-system/components/analytics/AnalyticsCard'
import { AnalyticsSectionTitle } from '@/design-system/components/analytics/AnalyticsSectionTitle'
import { AnalyticsStatBox } from '@/design-system/components/analytics/AnalyticsStatBox'
import {
  ANALYTICS_GUTTER,
  analyticsBodySx,
  analyticsFilterInputSx,
  analyticsHeadingSx,
  analyticsMenuItemSx,
  type AnalyticsKpiMetric,
  type AnalyticsTimeSeriesPoint,
} from '@/design-system/components/analytics/analyticsStyles'
import { tableActionIconButtonSx } from '@/design-system/components/Table/DataTable'
import { sectionTabRowBorderSx } from '@/design-system/theme/themeSurfaces'
import { InsightsDataTable, InsightsTableLink } from '@/pages/copilot-studio/components/insights/InsightsDataTable'
import { InsightsLabeledBarChart } from '@/pages/copilot-studio/components/insights/InsightsLabeledBarChart'
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
  studioMcpInvocations,
  studioMcpInvocationTrend,
  studioMcpKpis,
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

function InsightsChartCardHeader({
  title,
  range,
  onRangeChange,
  paletteId,
  onPaletteChange,
}: {
  title: string
  range: PulseRange
  onRangeChange: (range: PulseRange) => void
  paletteId: ReturnType<typeof usePulsePreferences>['paletteId']
  onPaletteChange: ReturnType<typeof usePulsePreferences>['setPaletteId']
}) {
  return (
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
          onRangeChange={onRangeChange}
          paletteId={paletteId}
          onPaletteChange={onPaletteChange}
        />
      </Box>
    </Stack>
  )
}

function InsightsDownloadCardHeader({ title, downloadLabel }: { title: string; downloadLabel: string }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ width: '100%' }}>
      <Typography variant="subtitle2" sx={{ ...analyticsHeadingSx, fontSize: '0.9375rem' }}>
        {title}
      </Typography>
      <Tooltip title="Download">
        <IconButton size="small" aria-label={downloadLabel} sx={tableActionIconButtonSx}>
          <FileDownloadOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}

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
  const chartKey = `insights-bar-${title}-${range}-${barColor}-${theme.palette.mode}`

  return (
    <AnalyticsCard
      header={
        <InsightsChartCardHeader
          title={title}
          range={range}
          onRangeChange={setRange}
          paletteId={paletteId}
          onPaletteChange={setPaletteId}
        />
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

function InsightsAreaTrendCard({
  title,
  data,
  legendLabel,
  comingSoon,
}: {
  title: string
  data: AnalyticsTimeSeriesPoint[]
  legendLabel: string
  comingSoon?: boolean
}) {
  const theme = useTheme()
  const { palette, paletteId, setPaletteId, range, setRange } = usePulsePreferences()
  const colors = getPulsePaletteColors(palette, theme.palette.mode)
  const lineColor = colors[0]
  const chartData = useMemo(() => sliceStudioInsightsSeriesByRange(data, range), [data, range])
  const chartKey = `insights-area-${title}-${range}-${lineColor}-${theme.palette.mode}`

  return (
    <AnalyticsCard
      header={
        <InsightsChartCardHeader
          title={comingSoon ? `${title} (coming soon)` : title}
          range={range}
          onRangeChange={setRange}
          paletteId={paletteId}
          onPaletteChange={setPaletteId}
        />
      }
      contentSx={{ pt: 0 }}
    >
      <AnalyticsAreaLineChart data={chartData} height={280} color={lineColor} chartKey={chartKey} />
      <Stack direction="row" justifyContent="center" sx={{ mt: 1 }}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: lineColor }} />
          <Typography variant="caption" color="text.secondary" sx={analyticsBodySx}>
            {legendLabel}
          </Typography>
        </Stack>
      </Stack>
    </AnalyticsCard>
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
              comingSoon
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

      <InsightsBarTrendCard title="Assistant interactions" data={studioAssistantsTrend} />

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle title="Who are the most engaged users?" />
        <AnalyticsCard
          contentSx={{ pt: 0, px: 0, pb: 0 }}
          header={<InsightsDownloadCardHeader title="Top assistant users" downloadLabel="Download assistant users" />}
        >
          <InsightsDataTable
            rows={studioAssistantsUsers}
            getRowId={(row) => row.id}
            columns={[
              { id: 'user', label: 'User', render: (row) => row.user },
              { id: 'interactions', label: 'Total interactions in period', align: 'right', render: (row) => String(row.interactions) },
              { id: 'messages', label: 'Messages', align: 'right', render: (row) => String(row.messages ?? 0) },
              { id: 'avgMsg', label: 'Avg msg / Interaction', align: 'right', render: (row) => String(row.avgMsgPerInteraction ?? '—') },
              { id: 'days', label: 'Days active in period', align: 'right', render: (row) => String(row.daysActive ?? '—') },
              { id: 'duration', label: 'Avg duration (s)', align: 'right', render: (row) => String(row.avgDurationSeconds ?? '—') },
            ]}
          />
        </AnalyticsCard>
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

      <InsightsBarTrendCard title="Agent interactions" data={studioAgentsTrend} />

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle title="Who are the most engaged users?" />
        <AnalyticsCard
          contentSx={{ pt: 0, px: 0, pb: 0 }}
          header={<InsightsDownloadCardHeader title="Top agent users" downloadLabel="Download agent users" />}
        >
          <InsightsDataTable
            rows={studioAgentsUsers}
            getRowId={(row) => row.id}
            columns={[
              { id: 'user', label: 'User', render: (row) => row.user },
              { id: 'interactions', label: 'Interactions', align: 'right', render: (row) => String(row.interactions) },
              { id: 'runs', label: 'Runs', align: 'right', render: (row) => String(row.runs ?? 0) },
              { id: 'agents', label: 'Agents used', align: 'right', render: (row) => String(row.agentsUsed ?? 0) },
              { id: 'avgRuns', label: 'Avg runs / interaction', align: 'right', render: (row) => String(row.avgRunsPerInteraction ?? '—') },
            ]}
          />
        </AnalyticsCard>
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
        <AnalyticsCard contentSx={{ pt: 0, px: 0, pb: 0 }}>
          <InsightsDataTable
            rows={studioEmailMailboxes}
            getRowId={(row) => row.id}
            columns={[
              { id: 'mailbox', label: 'Mailbox', render: (row) => <InsightsTableLink>{row.mailbox}</InsightsTableLink> },
              { id: 'provider', label: 'Provider', render: (row) => row.provider },
              { id: 'processed', label: 'Processed', align: 'right', render: (row) => String(row.processed) },
              { id: 'clear', label: 'Clear', align: 'right', render: (row) => String(row.clear) },
              { id: 'dnp', label: 'Do not process', align: 'right', render: (row) => String(row.doNotProcess) },
              { id: 'spam', label: 'Spam', align: 'right', render: (row) => String(row.spam) },
              { id: 'failed', label: 'Failed', align: 'right', render: (row) => String(row.failed) },
              { id: 'pending', label: 'Pending', align: 'right', render: (row) => String(row.pending) },
              { id: 'duration', label: 'Avg. duration', align: 'right', render: (row) => row.avgDuration },
              {
                id: 'sync',
                label: 'Sync status',
                render: (row) => (
                  <StatusChip
                    label={row.syncStatus}
                    status={row.syncStatus === 'Healthy' ? 'success' : 'error'}
                  />
                ),
              },
            ]}
          />
        </AnalyticsCard>
      </Stack>
    </Stack>
  )
}

const mcpTabs = ['INVOCATIONS', 'PER-USER', 'DISCOVERY', 'ERRORS', 'AUTH FAILURES'] as const

function McpView() {
  const [activeTab, setActiveTab] = useState<(typeof mcpTabs)[number]>('INVOCATIONS')

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

      <Box sx={sectionTabRowBorderSx}>
        <Tabs
          value={activeTab}
          onChange={(_, value: (typeof mcpTabs)[number]) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              minHeight: 44,
              textTransform: 'uppercase',
              fontFamily: figmaFontFamilyStack.body,
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
            },
          }}
        >
          {mcpTabs.map((tab) => (
            <Tab key={tab} label={tab} value={tab} />
          ))}
        </Tabs>
      </Box>

      {activeTab === 'INVOCATIONS' ? (
        <>
          <InsightsAreaTrendCard title="Invocations per day" data={studioMcpInvocationTrend} legendLabel="Calls" />

          <AnalyticsCard
            contentSx={{ pt: 0, px: 0, pb: 0 }}
            header={<InsightsDownloadCardHeader title="Invocation details" downloadLabel="Download MCP invocations" />}
          >
            <InsightsDataTable
              rows={studioMcpInvocations}
              getRowId={(row) => row.id}
              columns={[
                { id: 'date', label: 'Date', render: (row) => row.date },
                { id: 'mcp', label: 'MCP', render: (row) => row.mcp },
                { id: 'tool', label: 'Tool', render: (row) => row.tool },
                {
                  id: 'status',
                  label: 'Status',
                  render: (row) => <StatusChip label={row.status} status={row.status === 'success' ? 'success' : 'error'} />,
                },
                { id: 'total', label: 'Total', align: 'right', render: (row) => String(row.total) },
                { id: 'success', label: 'Success', align: 'right', render: (row) => String(row.success) },
                { id: 'failed', label: 'Failed', align: 'right', render: (row) => String(row.failed) },
                { id: 'avgMs', label: 'Avg ms', align: 'right', render: (row) => String(row.avgMs) },
                { id: 'users', label: 'Users', align: 'right', render: (row) => String(row.users) },
              ]}
            />
          </AnalyticsCard>
        </>
      ) : (
        <AnalyticsCard contentSx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
            {activeTab.replace('-', ' ').toLowerCase()} data will appear here as MCP telemetry is collected.
          </Typography>
        </AnalyticsCard>
      )}
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
