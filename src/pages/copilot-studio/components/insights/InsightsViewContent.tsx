import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { StatusChip } from '@/design-system/components'
import { AnalyticsAreaLineChart } from '@/design-system/components/analytics/charts/AnalyticsAreaLineChart'
import { AnalyticsCard } from '@/design-system/components/analytics/AnalyticsCard'
import { AnalyticsMetricHeader } from '@/design-system/components/analytics/AnalyticsMetricHeader'
import { AnalyticsSectionTitle } from '@/design-system/components/analytics/AnalyticsSectionTitle'
import { AnalyticsStatBox } from '@/design-system/components/analytics/AnalyticsStatBox'
import {
  ANALYTICS_GUTTER,
  analyticsBodySx,
  analyticsFilterInputSx,
  analyticsMenuItemSx,
  type AnalyticsKpiMetric,
} from '@/design-system/components/analytics/analyticsStyles'
import { sectionTabRowBorderSx } from '@/design-system/theme/themeSurfaces'
import { InsightsDataTable, InsightsTableLink } from '@/pages/copilot-studio/components/insights/InsightsDataTable'
import { InsightsLabeledBarChart } from '@/pages/copilot-studio/components/insights/InsightsLabeledBarChart'
import { InsightsPageHeader } from '@/pages/copilot-studio/components/insights/InsightsPageHeader'
import {
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
import { figmaPalette } from '@/design-system/tokens/figma-palette'
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

function OverviewView() {
  const theme = useTheme()
  const barColor = theme.figmaPalette.blue[700]

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
            <AnalyticsCard title="Interactions" contentSx={{ pt: 0 }}>
              <InsightsLabeledBarChart data={studioOverviewInteractionTrend} barColor={barColor} />
            </AnalyticsCard>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <AnalyticsCard
              header={
                <Stack spacing={0.25}>
                  <Typography variant="subtitle2" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}>
                    Credit usage (coming soon)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
                    Daily credit consumption across agents and assistants
                  </Typography>
                </Stack>
              }
              contentSx={{ pt: 0 }}
            >
              <AnalyticsAreaLineChart data={studioOverviewCreditTrend} height={280} />
              <Stack direction="row" justifyContent="center" sx={{ mt: 1 }}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: figmaPalette.teal[500] }} />
                  <Typography variant="caption" color="text.secondary" sx={analyticsBodySx}>
                    Credits used
                  </Typography>
                </Stack>
              </Stack>
            </AnalyticsCard>
          </Grid>
        </Grid>
      </Stack>
    </Stack>
  )
}

function AssistantsView() {
  const theme = useTheme()
  const barColor = theme.figmaPalette.blue[700]
  const interactionMetric = studioAssistantsKpis[0]

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

      <AnalyticsCard
        header={interactionMetric ? <AnalyticsMetricHeader metric={{ ...interactionMetric, title: `${interactionMetric.value} Assistant interactions` }} compact /> : undefined}
        contentSx={{ pt: 0 }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', mb: 1.5 }}>
          Chat messages, summarizations, and AI answers in the selected period
        </Typography>
        <InsightsLabeledBarChart data={studioAssistantsTrend} barColor={barColor} />
      </AnalyticsCard>

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle title="Who are the most engaged users?" />
        <AnalyticsCard
          contentSx={{ pt: 0, px: 0, pb: 0 }}
          header={
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ px: 2.5, pt: 2, pb: 1 }}>
              <Stack spacing={0.25}>
                <Typography variant="subtitle2" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}>
                  Top assistant users
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
                  in the selected time period
                </Typography>
              </Stack>
              <IconButton size="small" aria-label="Download assistant users">
                <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>
          }
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
  const theme = useTheme()
  const barColor = theme.figmaPalette.green[700]
  const interactionMetric = studioAgentsKpis[0]

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

      <AnalyticsCard
        header={interactionMetric ? <AnalyticsMetricHeader metric={{ ...interactionMetric, title: `${interactionMetric.value} Agent interactions` }} compact /> : undefined}
        contentSx={{ pt: 0 }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', mb: 1.5 }}>
          Agent interactions in the selected period
        </Typography>
        <InsightsLabeledBarChart data={studioAgentsTrend} barColor={barColor} />
      </AnalyticsCard>

      <Stack spacing={1.5}>
        <AnalyticsSectionTitle title="Who are the most engaged users?" />
        <AnalyticsCard
          contentSx={{ pt: 0, px: 0, pb: 0 }}
          header={
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ px: 2.5, pt: 2, pb: 1 }}>
              <Stack spacing={0.25}>
                <Typography variant="subtitle2" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}>
                  Top agent users
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
                  in the selected time period
                </Typography>
              </Stack>
              <IconButton size="small" aria-label="Download agent users">
                <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>
          }
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
          <AnalyticsCard title="Invocations per day" contentSx={{ pt: 0 }}>
            <AnalyticsAreaLineChart data={studioMcpInvocationTrend} height={280} />
            <Stack direction="row" justifyContent="center" sx={{ mt: 1 }}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: figmaPalette.teal[500] }} />
                <Typography variant="caption" color="text.secondary" sx={analyticsBodySx}>
                  Calls
                </Typography>
              </Stack>
            </Stack>
          </AnalyticsCard>

          <AnalyticsCard
            contentSx={{ pt: 0, px: 0, pb: 0 }}
            header={
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2.5, pt: 2, pb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}>
                  Invocation details
                </Typography>
                <IconButton size="small" aria-label="Download MCP invocations">
                  <FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>
            }
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
