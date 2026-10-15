import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ChecklistIcon from '@mui/icons-material/Checklist'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import HubOutlinedIcon from '@mui/icons-material/HubOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import RefreshIcon from '@mui/icons-material/Refresh'
import RemoveIcon from '@mui/icons-material/Remove'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useState, type ReactNode } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router'
import { useRightToolDispatch } from '@/app/contexts/RightToolContext'
import { useRegisterRightToolParties, useRegisterRightToolRecordContext } from '@/app/hooks/useRightToolRegistration'
import { PartiesPanel } from '@/pages/policies/components/PartiesPanel'
import type { PolicyParty } from '@/pages/policies/data/mockPolicyDetails'
import { ClaimCollaborationDrawer, type CollabKind } from '@/pages/claims/components/ClaimCollaborationDrawer'
import {
  claimDetailFromCatalog,
  claimDetailFromStore,
  claimFinancials,
  incurredFor,
  money,
  type ClaimDetailModel,
  type DetailFeature,
} from '@/pages/claims/data/claimDetailCatalog'
import { useClaim } from '@/pages/claims/data/claimsStore'
import { sc } from '@/pages/claims/data/sentenceCase'
import { isDarkMode } from '@/design-system/theme/themeSurfaces'
import { figmaBorderRadius } from '@/design-system/tokens/figma-border-radius'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { layoutTokens } from '@/design-system/tokens/layout'

const cardSx = { border: 1, borderColor: 'divider', borderRadius: `${figmaBorderRadius.borderRadius}px`, bgcolor: 'background.paper' } as const
const labelSx = { fontSize: '0.75rem', color: 'text.secondary', display: 'block' } as const

type PageTab = 'summary' | 'policy' | 'financials' | 'alerts'
type PolicyTab = 'coverages' | 'history' | 'forms'
type FeatureTab = 'all' | 'open' | 'closed' | 'approvals' | 'litigation' | 'financials' | 'subrogation' | 'salvage'

const INSIGHTS_RUN = 'Sep 30, 2026 · 8:00 AM'
const ADD_TO_CLAIM = ['New feature', 'Arbitration', 'Litigation', 'Negotiation', 'Salvage', 'Subrogation']

export function ClaimDetails() {
  const { claimNumber } = useParams<{ claimNumber: string }>()
  const number = claimNumber ? decodeURIComponent(claimNumber) : ''
  const stored = useClaim(number || null)
  const detail = claimDetailFromCatalog(number) ?? (stored ? claimDetailFromStore(stored) : null)
  useRegisterRightToolRecordContext(
    detail ? { title: detail.insured, subtitle: detail.claimNumber, kind: 'claim' } : null,
    [detail?.insured, detail?.claimNumber],
  )

  if (!detail) {
    return (
      <Box sx={{ px: `${layoutTokens.contentPaddingX}px`, pt: layoutTokens.policyHeaderTopPadding }}>
        <Typography variant="body2">Claim {number} was not found.</Typography>
        <Link component={RouterLink} to="/claims" variant="body2">
          Back to claims
        </Link>
      </Box>
    )
  }

  return <ClaimDetailBody key={detail.claimNumber} detail={detail} />
}

function ClaimDetailBody({ detail }: { detail: ClaimDetailModel }) {
  const navigate = useNavigate()
  const { openTool, closeTool } = useRightToolDispatch()
  const [tab, setTab] = useState<PageTab>('summary')
  const [policyTab, setPolicyTab] = useState<PolicyTab>('coverages')
  const [featureTab, setFeatureTab] = useState<FeatureTab>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const showFeature = (id: string) => {
    setTab('financials')
    setExpanded(id)
    requestAnimationFrame(() => document.getElementById(`feature-${id}`)?.scrollIntoView({ block: 'nearest' }))
  }
  const [insightsOpen, setInsightsOpen] = useState(true)
  const [lastRun, setLastRun] = useState(INSIGHTS_RUN)
  const [alerts, setAlerts] = useState(detail.alerts)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerKind, setDrawerKind] = useState<CollabKind>('tasks')
  const [drawerFeature, setDrawerFeature] = useState<string | null>(null)
  useRegisterRightToolParties(<PartiesPanel parties={claimParties(detail)} onClose={closeTool} />, [detail.claimNumber, closeTool])

  const financials = claimFinancials(detail)
  const activeAlerts = alerts.filter((alert) => alert.active).length
  const openCollab = (kind: CollabKind, featureId: string | null = null) => {
    setDrawerKind(kind)
    setDrawerFeature(featureId)
    setDrawerOpen(true)
  }
  const showFeatures = (tab === 'summary' || tab === 'financials') && detail.features.length > 0
  const runInsight = (action: ClaimDetailModel['insights'][number]['action']) => {
    if (action === 'Ask Copilot') openTool('copilot')
    if (action === 'Create task') openCollab('tasks')
    if (action === 'Open litigation') {
      setTab('summary')
      setFeatureTab('litigation')
      const litigated = detail.features.find((feature) => feature.litigation)
      if (litigated) setExpanded(litigated.id)
    }
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, height: '100%', overflow: 'auto', bgcolor: 'background.default' }}>
      <Box sx={{ px: `${layoutTokens.contentPaddingX}px`, pt: layoutTokens.policyHeaderTopPadding, pb: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 180 }}>
            <IconButton size="small" aria-label="Back to claims" onClick={() => navigate('/claims')}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="h5" component="h1" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '1.375rem' }}>
              Claim details
            </Typography>
          </Stack>
          <Tabs
            value={tab}
            onChange={(_, next: PageTab) => setTab(next)}
            variant="scrollable"
            sx={{ flex: 1, minHeight: 40, '& .MuiTabs-flexContainer': { justifyContent: { md: 'center' } } }}
          >
            <Tab value="summary" label="Summary" />
            <Tab value="policy" label="Policy" />
            <Tab value="financials" label="Financials" />
            <Tab value="alerts" label={activeAlerts > 0 ? `Alerts (${activeAlerts})` : 'Alerts'} />
          </Tabs>
          <Button size="small" startIcon={<GroupsOutlinedIcon />} onClick={() => openTool('parties')}>
            Parties
          </Button>
        </Stack>

        <Stack direction="row" spacing={3} useFlexGap flexWrap="wrap" sx={{ mt: 1.5 }}>
          <RibbonLink label="Claims" value={detail.claimNumber} info="Claim details" onClick={() => setTab('summary')} />
          <RibbonLink label="Customer" value={detail.insured} info="Customer details" onClick={() => openTool('parties')} />
          <RibbonLink label="Policy" value={detail.policyNumber ?? '—'} info="Policy details" onClick={() => setTab('policy')} />
          <RibbonFact label="Type" value={sc(detail.claimType)} />
          <RibbonFact label="Date of loss" value={showDate(detail.dateOfLoss)} />
          <RibbonFact label="Date reported" value={showDate(detail.dateReported)} />
          <RibbonFact label="Owner" value={detail.owner} />
        </Stack>
      </Box>

      <Stack spacing={2} sx={{ px: `${layoutTokens.contentPaddingX}px`, py: 2, pb: 4 }}>
        {tab !== 'alerts' && detail.insights.length > 0 ? (
          <InsightsPanel
            insights={detail.insights}
            open={insightsOpen}
            lastRun={lastRun}
            onToggle={() => setInsightsOpen((current) => !current)}
            onRefresh={() =>
              setLastRun(
                new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).replace(',', ' ·'),
              )
            }
            onAction={runInsight}
          />
        ) : null}

        {tab === 'summary' ? <SummaryCard detail={detail} financials={financials} onOpen={openCollab} /> : null}
        {tab === 'policy' ? (
          <PolicyCard detail={detail} policyTab={policyTab} onPolicyTab={setPolicyTab} onOpen={openCollab} />
        ) : null}
        {tab === 'financials' ? <FinancialsCard detail={detail} onOpen={openCollab} onViewFeature={showFeature} /> : null}
        {tab === 'alerts' ? (
          <AlertsCard
            alerts={alerts}
            onToggle={(id) => setAlerts((current) => current.map((alert) => (alert.id === id ? { ...alert, active: !alert.active } : alert)))}
          />
        ) : null}

        {showFeatures ? (
          <FeaturesSection
            detail={detail}
            featureTab={featureTab}
            onFeatureTab={setFeatureTab}
            expanded={expanded}
            onToggle={(id) => setExpanded((current) => (current === id ? null : id))}
            onOpen={openCollab}
          />
        ) : null}
      </Stack>

      <ClaimCollaborationDrawer
        open={drawerOpen}
        kind={drawerKind}
        featureId={drawerFeature}
        detail={detail}
        onClose={() => setDrawerOpen(false)}
        onKind={setDrawerKind}
        onClearFeature={() => setDrawerFeature(null)}
      />
    </Box>
  )
}

function SummaryCard({
  detail,
  financials,
  onOpen,
}: {
  detail: ClaimDetailModel
  financials: ReturnType<typeof claimFinancials>
  onOpen: (kind: CollabKind) => void
}) {
  const fields = [
    ['Policy', detail.policyNumber ?? '—'],
    ['Date of loss', showDate(detail.dateOfLoss)],
    ['Date reported', showDate(detail.dateReported)],
    ['Claim type', sc(detail.claimType)],
    ['Loss status', detail.status],
    ['Loss reserve', money(financials.lossReserve)],
    ['Loss paid', money(financials.lossPaid)],
    ['Expense reserve', money(financials.expenseReserve)],
    ['Expense paid', money(financials.expensePaid)],
  ] as const
  return (
    <Box sx={cardSx}>
      <CardHead title={detail.claimNumber} detail={detail} onOpen={onOpen} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(9, minmax(0, 1fr))' }, gap: 2, p: 2 }}>
        {fields.map(([label, value]) => (
          <Field key={label} label={label} value={value} />
        ))}
      </Box>
      <Box sx={{ px: 2, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography sx={labelSx}>Loss description</Typography>
        <Typography variant="body2">{detail.lossDescription ?? '—'}</Typography>
      </Box>
    </Box>
  )
}

function PolicyCard({
  detail,
  policyTab,
  onPolicyTab,
  onOpen,
}: {
  detail: ClaimDetailModel
  policyTab: PolicyTab
  onPolicyTab: (tab: PolicyTab) => void
  onOpen: (kind: CollabKind) => void
}) {
  const fields = [
    ['Policy number', detail.policyNumber ?? '—'],
    ['Policy type', detail.policyType ? sc(detail.policyType) : '—'],
    ['Effective', showDate(detail.policyEffective)],
    ['Expiration', showDate(detail.policyExpiration)],
    ['Named insured', detail.insured],
  ] as const
  const hasTables = detail.coverages.length > 0 || detail.policyHistory.length > 0 || detail.forms.length > 0
  return (
    <Stack spacing={2}>
      <Box sx={cardSx}>
        <CardHead title="General policy details" detail={detail} onOpen={onOpen} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, p: 2 }}>
          {fields.map(([label, value]) => (
            <Field key={label} label={label} value={value} />
          ))}
        </Box>
      </Box>
      {hasTables ? (
        <Box sx={cardSx}>
          <Tabs value={policyTab} onChange={(_, next: PolicyTab) => onPolicyTab(next)} sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}>
            {detail.coverages.length > 0 ? <Tab value="coverages" label="Coverages" /> : null}
            {detail.policyHistory.length > 0 ? <Tab value="history" label="Claim history" /> : null}
            {detail.forms.length > 0 ? <Tab value="forms" label="Forms" /> : null}
          </Tabs>
          <Box sx={{ overflow: 'auto' }}>
            {policyTab === 'coverages' ? (
              <DataTable
                headers={['Coverage', 'Amount', 'Type', 'Consumed / eroded']}
                rows={detail.coverages.map((coverage) => [sc(coverage.name), money(coverage.limit), sc(coverage.limitType), money(coverage.consumed)])}
              />
            ) : null}
            {policyTab === 'history' ? (
              <DataTable
                headers={['Claim', 'Date of loss', 'Type', 'Status', 'Paid']}
                rows={detail.policyHistory.map((row) => [row.claim, row.dateOfLoss, sc(row.type), row.status, row.paid])}
                chips={[3]}
              />
            ) : null}
            {policyTab === 'forms' ? (
              <DataTable
                headers={['Form', 'Description', 'Edition', 'Status']}
                rows={detail.forms.map((row) => [row.form, sc(row.description), row.edition, row.status])}
                chips={[3]}
              />
            ) : null}
          </Box>
        </Box>
      ) : null}
    </Stack>
  )
}

function FinancialsCard({
  detail,
  onOpen,
  onViewFeature,
}: {
  detail: ClaimDetailModel
  onOpen: (kind: CollabKind) => void
  onViewFeature: (id: string) => void
}) {
  const totals = claimFinancials(detail)
  return (
    <Stack spacing={2}>
      <Box sx={cardSx}>
        <CardHead title="Financials" detail={detail} onOpen={onOpen} />
        <Box sx={{ overflow: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Features', 'Loss reserve', 'Loss paid', 'Expense reserve', 'Expense paid', 'Recovered', 'Incurred', 'Action'].map((header) => (
                  <TableCell key={header}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {detail.features.map((feature) => (
                <TableRow key={feature.id}>
                  <TableCell>{feature.displayName}</TableCell>
                  <TableCell>{money(feature.financials.lossReserve)}</TableCell>
                  <TableCell>{money(feature.financials.lossPaid)}</TableCell>
                  <TableCell>{money(feature.financials.expenseReserve)}</TableCell>
                  <TableCell>{money(feature.financials.expensePaid)}</TableCell>
                  <TableCell>{money(feature.financials.recovered)}</TableCell>
                  <TableCell>{money(incurredFor(feature.financials))}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => onViewFeature(feature.id)}>
                      View transaction
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Claim total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{money(totals.lossReserve)}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{money(totals.lossPaid)}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{money(totals.expenseReserve)}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{money(totals.expensePaid)}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{money(totals.recovered)}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{money(totals.incurred)}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => document.getElementById('claim-features')?.scrollIntoView({ block: 'nearest' })}>
                    View transaction
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Box>
      {detail.approvals.length > 0 ? (
        <Box sx={{ ...cardSx, p: 2 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600, fontSize: '1rem', mb: 1 }}>
            Pending approvals
          </Typography>
          <Stack spacing={1}>
            {detail.approvals.map((approval) => (
              <Typography key={approval.id} variant="body2">
                {`${approval.type} · ${money(approval.amount)} · ${approval.feature} · ${approval.status} · ${approval.reason}`}
              </Typography>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Stack>
  )
}

function AlertsCard({ alerts, onToggle }: { alerts: ClaimDetailModel['alerts']; onToggle: (id: string) => void }) {
  const [filter, setFilter] = useState<'active' | 'inactive' | 'all'>('all')
  const active = alerts.filter((alert) => alert.active)
  const inactive = alerts.filter((alert) => !alert.active)
  const rows = filter === 'active' ? active : filter === 'inactive' ? inactive : alerts
  return (
    <Box sx={cardSx}>
      <Tabs value={filter} onChange={(_, next: typeof filter) => setFilter(next)} sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}>
        <Tab value="active" label={`Active (${active.length})`} />
        <Tab value="inactive" label={`Inactive (${inactive.length})`} />
        <Tab value="all" label={`All (${alerts.length})`} />
      </Tabs>
      <Stack spacing={1} sx={{ p: 2 }}>
        {rows.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {`No ${filter === 'all' ? '' : `${filter} `}alerts.`}
          </Typography>
        ) : (
          rows.map((alert) => <AlertRow key={alert.id} active={alert.active} description={alert.description} onToggle={() => onToggle(alert.id)} />)
        )}
      </Stack>
    </Box>
  )
}

function AlertRow({ active, description, onToggle }: { active: boolean; description: string; onToggle: () => void }) {
  return (
    <Alert
      severity={active ? 'warning' : 'success'}
      icon={active ? <WarningAmberIcon fontSize="small" /> : <CheckCircleOutlineIcon fontSize="small" />}
      onClick={onToggle}
      sx={{ cursor: 'pointer', alignItems: 'center' }}
    >
      {description}
    </Alert>
  )
}

function FeaturesSection({
  detail,
  featureTab,
  onFeatureTab,
  expanded,
  onToggle,
  onOpen,
}: {
  detail: ClaimDetailModel
  featureTab: FeatureTab
  onFeatureTab: (tab: FeatureTab) => void
  expanded: string | null
  onToggle: (id: string) => void
  onOpen: (kind: CollabKind, featureId: string | null) => void
}) {
  const closed = (feature: DetailFeature) => feature.status.toLowerCase() === 'closed'
  const hasMoney = (feature: DetailFeature) => feature.financials.lossReserve != null || feature.financials.lossPaid != null
  const approvalText = detail.approvals.map((approval) => approval.feature.toLowerCase()).join(' ')
  const filters: { id: FeatureTab; label: string; test: (feature: DetailFeature) => boolean }[] = [
    { id: 'all', label: `All (${detail.features.length})`, test: () => true },
    { id: 'open', label: `Open (${detail.features.filter((feature) => !closed(feature)).length})`, test: (feature) => !closed(feature) },
    { id: 'closed', label: `Closed (${detail.features.filter(closed).length})`, test: closed },
    { id: 'approvals', label: 'Approvals', test: (feature) => approvalText.includes(feature.displayName.toLowerCase()) },
    { id: 'litigation', label: 'Litigation', test: (feature) => feature.litigation },
    { id: 'financials', label: 'Financials', test: hasMoney },
    { id: 'subrogation', label: 'Subrogation', test: () => false },
    { id: 'salvage', label: 'Salvage', test: () => false },
  ]
  const visible = detail.features.filter((filters.find((item) => item.id === featureTab) ?? filters[0]).test)
  const mine = visible.filter((feature) => feature.mine)
  const others = visible.filter((feature) => !feature.mine)
  return (
    <Box id="claim-features" component="section">
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="h6" component="h2" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '1rem', textTransform: 'none', letterSpacing: 'normal', flex: 1 }}>
          Features
        </Typography>
        <AddToClaimButton />
      </Stack>
      <Tabs value={featureTab} onChange={(_, next: FeatureTab) => onFeatureTab(next)} variant="scrollable" sx={{ borderBottom: 1, borderColor: 'divider', mb: 1.5 }}>
        {filters.map((filter) => (
          <Tab key={filter.id} value={filter.id} label={filter.label} />
        ))}
      </Tabs>
      {visible.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No features in this view.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {mine.length > 0 ? <FeatureGroup label="Assigned to you" features={mine} expanded={expanded} onToggle={onToggle} onOpen={onOpen} detail={detail} /> : null}
          {others.length > 0 ? <FeatureGroup label="Assigned to others" features={others} expanded={expanded} onToggle={onToggle} onOpen={onOpen} detail={detail} /> : null}
        </Stack>
      )}
    </Box>
  )
}

function FeatureGroup({
  label,
  features,
  expanded,
  onToggle,
  onOpen,
  detail,
}: {
  label: string
  features: DetailFeature[]
  expanded: string | null
  onToggle: (id: string) => void
  onOpen: (kind: CollabKind, featureId: string | null) => void
  detail: ClaimDetailModel
}) {
  return (
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      {features.map((feature) => (
        <FeatureRow key={feature.id} feature={feature} detail={detail} open={expanded === feature.id} onToggle={() => onToggle(feature.id)} onOpen={onOpen} />
      ))}
    </Stack>
  )
}

function FeatureRow({
  feature,
  open,
  onToggle,
  onOpen,
}: {
  feature: DetailFeature
  detail: ClaimDetailModel
  open: boolean
  onToggle: () => void
  onOpen: (kind: CollabKind, featureId: string | null) => void
}) {
  const Icon = feature.kind === 'vehicle' ? DirectionsCarOutlinedIcon : feature.kind === 'property' ? HomeWorkOutlinedIcon : HealingOutlinedIcon
  const complete = feature.milestones.filter((milestone) => milestone.status.toLowerCase() === 'complete').length
  const progress = feature.milestones.length ? Math.round((complete / feature.milestones.length) * 100) : 0
  const contact = (label: string, name: string, extra: string) =>
    name ? (
      <Typography variant="body2" color="text.secondary" component="span">
        <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{label}</Box>
        {` • ${name}${extra ? ` • ${extra.replaceAll(' · ', ' • ')}` : ''}`}
      </Typography>
    ) : null
  return (
    <Box id={`feature-${feature.id}`} sx={cardSx}>
      <Box sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <IconButton size="small" aria-label={open ? 'Collapse feature' : 'Expand feature'} onClick={onToggle}>
            {open ? <RemoveIcon fontSize="small" /> : <AddIcon fontSize="small" />}
          </IconButton>
          <IconTile>
            <Icon sx={{ fontSize: 18 }} />
          </IconTile>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', flex: 1 }}>
                {feature.displayName}
              </Typography>
              <StatusChip label={feature.status} />
              <ActionsMenu
                label="Actions"
                items={[
                  ['Tasks', () => onOpen('tasks', feature.id)],
                  ['Notes', () => onOpen('notes', feature.id)],
                  ['Documents', () => onOpen('documents', feature.id)],
                ]}
              />
            </Stack>
            <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
              {contact('Adjuster', feature.adjusterName, feature.adjusterContact)}
              {contact('Supervisor', feature.supervisorName, feature.supervisorContact)}
            </Stack>
          </Box>
        </Stack>
      </Box>
      {open ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5, p: 1.5, pt: 0 }}>
          {feature.milestones.length > 0 ? (
            <Box sx={{ ...cardSx, p: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Action plan
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1, textAlign: 'right' }}>
                  {`${progress}% complete`}
                </Typography>
              </Stack>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['Milestone', 'Status', 'Goal'].map((header) => (
                      <TableCell key={header} sx={{ color: 'text.secondary' }}>{header}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feature.milestones.map((milestone) => (
                    <TableRow key={milestone.label}>
                      <TableCell>{milestone.label}</TableCell>
                      <TableCell><StatusChip label={milestone.status} /></TableCell>
                      <TableCell>{milestone.goal ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ) : null}
          {feature.cards.map((card) => (
            <Box key={card.title} sx={{ ...cardSx, p: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {card.title}
                </Typography>
                {card.status ? <StatusChip label={card.status} /> : null}
                <Box sx={{ flex: 1 }} />
                <ActionsMenu label="Actions" items={[['Notes', () => onOpen('notes', feature.id)]]} />
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1.5 }}>
                {card.fields.map((field) => (
                  <Field key={field.label} label={field.label} value={field.value} />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  )
}

function CardHead({ title, detail, onOpen }: { title: string; detail: ClaimDetailModel; onOpen: (kind: CollabKind) => void }) {
  const pending = detail.tasks.filter((task) => task.status !== 'Completed').length
  const items: [string, () => void][] = [
    [`Tasks (${pending})`, () => onOpen('tasks')],
    [`Notes (${detail.notes.length})`, () => onOpen('notes')],
    [`Email (${detail.emails.length})`, () => onOpen('emails')],
    [`Documents (${detail.documents.length})`, () => onOpen('documents')],
  ]
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="h6" component="h2" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '1rem', textTransform: 'none', letterSpacing: 'normal', flex: 1 }}>
        {title}
      </Typography>
      <ActionsMenu label="Actions" items={items} />
    </Stack>
  )
}

function RibbonFact({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography sx={labelSx}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  )
}

function RibbonLink({ label, value, info, onClick }: { label: string; value: string; info: string; onClick: () => void }) {
  return (
    <Box>
      <Typography sx={labelSx}>{label}</Typography>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Link component="button" type="button" underline="hover" onClick={onClick} sx={{ fontWeight: 600, fontSize: '0.875rem', verticalAlign: 'baseline' }}>
          {value}
        </Link>
        <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} aria-label={info} />
      </Stack>
    </Box>
  )
}

function DataTable({ headers, rows, chips = [] }: { headers: string[]; rows: string[][]; chips?: number[] }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          {headers.map((header) => (
            <TableCell key={header}>{header}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.join('|')}>
            {row.map((cell, index) => (
              <TableCell key={`${headers[index]}-${cell}`}>{chips.includes(index) ? <StatusChip label={cell} /> : cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={labelSx}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  )
}

function IconTile({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: `${figmaBorderRadius.borderRadius}px`,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
        color: 'primary.main',
        bgcolor: (theme) => (isDarkMode(theme) ? alpha(theme.palette.primary.main, 0.16) : theme.figmaPalette.blue[100]),
      }}
    >
      {children}
    </Box>
  )
}

function statusTone(label: string): 'success' | 'warning' | 'info' | 'neutral' {
  const value = label.toLowerCase()
  if (value.includes('progress')) return 'info'
  if (/(complete|closed|active|eligible|^match$|no suit)/.test(value)) return 'success'
  if (value === 'open' || value.includes('pending') || value.includes('not started')) return 'warning'
  return 'neutral'
}

function StatusChip({ label }: { label: string }) {
  const tone = statusTone(label)
  return (
    <Chip
      size="small"
      label={label}
      sx={{
        height: 24,
        fontWeight: 600,
        border: 0,
        borderRadius: `${figmaBorderRadius.borderRadius}px`,
        bgcolor: (theme) => {
          const dark = isDarkMode(theme)
          if (tone === 'success') return dark ? theme.figmaPalette.green[900] : theme.figmaPalette.green[50]
          if (tone === 'warning') return dark ? theme.figmaPalette.amber[900] : theme.figmaPalette.amber[50]
          if (tone === 'info') return dark ? theme.figmaPalette.lightBlue[900] : theme.figmaPalette.lightBlue[50]
          return dark ? theme.palette.action.selected : theme.figmaPalette.grey[100]
        },
        color: (theme) => {
          const dark = isDarkMode(theme)
          if (tone === 'success') return dark ? theme.figmaPalette.green[200] : theme.figmaPalette.green[800]
          if (tone === 'warning') return dark ? theme.figmaPalette.amber[200] : theme.figmaPalette.amber[900]
          if (tone === 'info') return dark ? theme.figmaPalette.lightBlue[200] : theme.figmaPalette.lightBlue[800]
          return 'text.secondary'
        },
      }}
    />
  )
}

function ActionsMenu({ label, items }: { label: string; items: [string, () => void][] }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  return (
    <>
      <Button
        size="small"
        startIcon={<MoreVertIcon sx={{ fontSize: 18 }} />}
        aria-haspopup="menu"
        aria-expanded={anchor != null}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{ fontWeight: 600, flexShrink: 0 }}
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchor}
        open={anchor != null}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {items.map(([item, onClick]) => (
          <MenuItem
            key={item}
            onClick={() => {
              setAnchor(null)
              onClick()
            }}
          >
            {item}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

function AddToClaimButton() {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  return (
    <>
      <Button size="small" variant="outlined" startIcon={<AddIcon />} aria-haspopup="menu" onClick={(event) => setAnchor(event.currentTarget)}>
        Add to claim
      </Button>
      <Menu anchorEl={anchor} open={anchor != null} onClose={() => setAnchor(null)}>
        {ADD_TO_CLAIM.map((item) => (
          <MenuItem key={item} disabled>
            {item}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

function InsightsPanel({
  insights,
  open,
  lastRun,
  onToggle,
  onRefresh,
  onAction,
}: {
  insights: ClaimDetailModel['insights']
  open: boolean
  lastRun: string
  onToggle: () => void
  onRefresh: () => void
  onAction: (action: ClaimDetailModel['insights'][number]['action']) => void
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: `${figmaBorderRadius.borderRadius}px`,
        bgcolor: (theme) => (isDarkMode(theme) ? alpha(theme.palette.primary.main, 0.16) : theme.figmaPalette.blue[100]),
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconTile>
            <HubOutlinedIcon sx={{ fontSize: 18 }} />
          </IconTile>
          <Typography variant="h6" component="h2" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 700, fontSize: '1rem', textTransform: 'none', letterSpacing: 'normal' }}>
            Claim Insights
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
          <Typography variant="body2">{`Last run ${lastRun}`}</Typography>
          <Button size="small" startIcon={<RefreshIcon />} onClick={onRefresh}>
            Refresh
          </Button>
        </Stack>
        <Box sx={{ flex: 1 }} />
        <Button size="small" startIcon={open ? <RemoveIcon /> : <AddIcon />} onClick={onToggle}>
          {open ? 'Show less' : 'Show more'}
        </Button>
      </Stack>
      {open
        ? insights.map((insight) => (
            <Stack key={`${insight.action ?? insight.type}-${insight.description}`} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} sx={{ mt: 1 }}>
              <Typography variant="body2" component="div" sx={{ flex: 1 }}>
                <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                  <li>
                    <Box component="span" sx={{ fontWeight: 700 }}>{`${insight.type}: `}</Box>
                    {insight.description}
                  </li>
                </Box>
              </Typography>
              {insight.action ? (
                <Button
                  size="small"
                  startIcon={insight.action === 'Open litigation' ? <GavelOutlinedIcon /> : insight.action === 'Create task' ? <ChecklistIcon /> : <HubOutlinedIcon />}
                  onClick={() => onAction(insight.action)}
                >
                  {insight.action}
                </Button>
              ) : null}
            </Stack>
          ))
        : null}
    </Box>
  )
}

function claimParties(detail: ClaimDetailModel): PolicyParty[] {
  return detail.parties.map((party, index) => {
    const bits = party.contact.split('·').map((part) => part.trim()).filter((part) => part && part !== '—')
    const email = bits.find((part) => part.includes('@'))
    const phone = bits.find((part) => part !== email && /\d/.test(part))
    return { id: `${detail.claimNumber}-${index}`, role: party.role, name: party.name, email, phone, defaultExpanded: index === 0 }
  })
}

function showDate(value: string | null): string {
  if (!value) return '—'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export default ClaimDetails
