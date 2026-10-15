import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ChecklistIcon from '@mui/icons-material/Checklist'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import HubOutlinedIcon from '@mui/icons-material/HubOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import type { SvgIconComponent } from '@mui/icons-material'
import { useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router'
import { useRightToolDispatch } from '@/app/contexts/RightToolContext'
import { useRegisterRightToolRecordContext } from '@/app/hooks/useRightToolRegistration'
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
type FeatureTab = 'all' | 'open' | 'closed' | 'litigation' | 'financials'

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
  const { openTool } = useRightToolDispatch()
  const [tab, setTab] = useState<PageTab>('summary')
  const [policyTab, setPolicyTab] = useState<PolicyTab>('coverages')
  const [featureTab, setFeatureTab] = useState<FeatureTab>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [insightsOpen, setInsightsOpen] = useState(true)
  const [alerts, setAlerts] = useState(detail.alerts)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerKind, setDrawerKind] = useState<CollabKind>('tasks')
  const [drawerFeature, setDrawerFeature] = useState<string | null>(null)

  const financials = claimFinancials(detail)
  const activeAlerts = alerts.filter((alert) => alert.active).length
  const openCollab = (kind: CollabKind, featureId: string | null = null) => {
    setDrawerKind(kind)
    setDrawerFeature(featureId)
    setDrawerOpen(true)
  }
  const showFeatures = (tab === 'summary' || tab === 'financials') && detail.features.length > 0

  return (
    <Box sx={{ flex: 1, minHeight: 0, height: '100%', overflow: 'auto', bgcolor: 'background.default' }}>
      <Box sx={{ px: `${layoutTokens.contentPaddingX}px`, pt: layoutTokens.policyHeaderTopPadding, pb: 2 }}>
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
            sx={{ flex: 1, borderBottom: 1, borderColor: 'divider', minHeight: 40 }}
          >
            <Tab value="summary" label="Summary" />
            <Tab value="policy" label="Policy" />
            <Tab value="financials" label="Financials" />
            <Tab value="alerts" label={activeAlerts > 0 ? `Alerts (${activeAlerts})` : 'Alerts'} />
          </Tabs>
          <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
            <Button size="small" startIcon={<GroupsOutlinedIcon />} onClick={() => openCollab('tasks')}>
              Collaboration
            </Button>
            <Button size="small" startIcon={<GroupsOutlinedIcon />} onClick={() => openCollab('parties')}>
              Parties
            </Button>
            <Button size="small" startIcon={<HubOutlinedIcon />} onClick={() => openTool('copilot')}>
              Copilot
            </Button>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
          <RibbonLink label="Claims" value={detail.claimNumber} onClick={() => setTab('summary')} />
          <RibbonLink label="Customer" value={detail.insured} onClick={() => openCollab('parties')} />
          <RibbonLink label="Policy" value={detail.policyNumber ?? '—'} onClick={() => setTab('policy')} />
          <RibbonFact label="Type" value={sc(detail.claimType)} />
          <RibbonFact label="Date of loss" value={showDate(detail.dateOfLoss)} />
          <RibbonFact label="Date reported" value={showDate(detail.dateReported)} />
          <RibbonFact label="Owner" value={detail.owner} />
        </Stack>
      </Box>

      <Stack spacing={2} sx={{ px: `${layoutTokens.contentPaddingX}px`, pb: 4 }}>
        {tab !== 'alerts' && detail.insights.length > 0 ? (
          <Box sx={{ ...cardSx, p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <HubOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                Claim insights
              </Typography>
              <Box sx={{ flex: 1 }} />
              <Button size="small" onClick={() => setInsightsOpen((open) => !open)}>
                {insightsOpen ? 'Show less' : 'Show more'}
              </Button>
            </Stack>
            {insightsOpen
              ? detail.insights.map((insight) => (
                  <Typography key={`${insight.type}-${insight.description}`} variant="body2" sx={{ mt: 1 }}>
                    <Box component="span" sx={{ fontWeight: 700 }}>{`${sc(insight.type)}: `}</Box>
                    {insight.description}
                  </Typography>
                ))
              : null}
          </Box>
        ) : null}

        {tab === 'summary' ? <SummaryCard detail={detail} financials={financials} onOpen={openCollab} /> : null}
        {tab === 'policy' ? (
          <PolicyCard detail={detail} policyTab={policyTab} onPolicyTab={setPolicyTab} onOpen={openCollab} />
        ) : null}
        {tab === 'financials' ? <FinancialsCard detail={detail} onOpen={openCollab} onViewFeature={(id) => setExpanded(id)} /> : null}
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
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 2, p: 2 }}>
        {fields.map(([label, value]) => (
          <Box key={label}>
            <Typography sx={labelSx}>{label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ px: 2, pb: 2 }}>
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 2, p: 2 }}>
          {fields.map(([label, value]) => (
            <Box key={label}>
              <Typography sx={labelSx}>{label}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {value}
              </Typography>
            </Box>
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
              />
            ) : null}
            {policyTab === 'forms' ? (
              <DataTable
                headers={['Form', 'Description', 'Edition', 'Status']}
                rows={detail.forms.map((row) => [row.form, sc(row.description), row.edition, row.status])}
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
                      View feature
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Claim total</TableCell>
                <TableCell>{money(totals.lossReserve)}</TableCell>
                <TableCell>{money(totals.lossPaid)}</TableCell>
                <TableCell>{money(totals.expenseReserve)}</TableCell>
                <TableCell>{money(totals.expensePaid)}</TableCell>
                <TableCell>{money(totals.recovered)}</TableCell>
                <TableCell>{money(totals.incurred)}</TableCell>
                <TableCell />
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
  const [filter, setFilter] = useState<'active' | 'inactive' | 'all'>('active')
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
    <Stack
      role="alert"
      direction="row"
      spacing={1.5}
      alignItems="flex-start"
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: `${figmaBorderRadius.borderRadius}px`,
        typography: 'body2',
        bgcolor: (theme) =>
          isDarkMode(theme)
            ? `var(--mui-palette-Alert-${active ? 'error' : 'success'}StandardBg)`
            : active
              ? theme.figmaPalette.red[50]
              : theme.figmaPalette.green[50],
        color: (theme) =>
          isDarkMode(theme)
            ? `var(--mui-palette-Alert-${active ? 'error' : 'success'}Color)`
            : active
              ? theme.figmaPalette.red[900]
              : theme.figmaPalette.green[900],
      }}
    >
      <IconButton
        size="small"
        aria-label={active ? 'Mark alert inactive' : 'Reactivate alert'}
        onClick={onToggle}
        sx={{ color: active ? 'error.main' : 'success.main' }}
      >
        {active ? <ErrorOutlineIcon fontSize="small" /> : <CheckCircleOutlineIcon fontSize="small" />}
      </IconButton>
      <Typography variant="body2" sx={{ color: 'inherit' }}>
        {description}
      </Typography>
    </Stack>
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
  const filters: { id: FeatureTab; label: string; test: (feature: DetailFeature) => boolean }[] = [
    { id: 'all', label: `All (${detail.features.length})`, test: () => true },
    { id: 'open', label: `Open (${detail.features.filter((feature) => !closed(feature)).length})`, test: (feature) => !closed(feature) },
    { id: 'closed', label: `Closed (${detail.features.filter(closed).length})`, test: closed },
    { id: 'litigation', label: 'Litigation', test: (feature) => feature.litigation },
    { id: 'financials', label: 'Financials', test: hasMoney },
  ]
  const visible = detail.features.filter((filters.find((item) => item.id === featureTab) ?? filters[0]).test)
  const mine = visible.filter((feature) => feature.mine)
  const others = visible.filter((feature) => !feature.mine)
  return (
    <Box component="section">
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="h6" component="h2" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}>
          Features
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {`Viewing ${visible.length} feature${visible.length === 1 ? '' : 's'} (${mine.length} assigned to you)`}
        </Typography>
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
  detail,
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
  const openTasks = detail.tasks.filter((task) => task.featureId === feature.id && task.status !== 'Completed').length
  const notes = detail.notes.filter((note) => note.featureId === feature.id).length
  const documents = detail.documents.filter((document) => document.featureId === feature.id).length
  return (
    <Box sx={cardSx}>
      <Box sx={{ p: 1.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <Button size="small" aria-label={open ? 'Collapse feature' : 'Expand feature'} onClick={onToggle} sx={{ minWidth: 0, px: 1 }}>
              {open ? '−' : '+'}
            </Button>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {feature.displayName}
            </Typography>
            <Chip size="small" label={feature.status} variant="outlined" />
          </Stack>
          <Stack direction="row" useFlexGap flexWrap="wrap">
            <Button size="small" startIcon={<ChecklistIcon />} onClick={() => onOpen('tasks', feature.id)}>{`Linked tasks (${openTasks})`}</Button>
            <Button size="small" startIcon={<StickyNote2OutlinedIcon />} onClick={() => onOpen('notes', feature.id)}>{`Linked notes (${notes})`}</Button>
            <Button size="small" startIcon={<DescriptionOutlinedIcon />} onClick={() => onOpen('documents', feature.id)}>{`Linked docs (${documents})`}</Button>
          </Stack>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, pl: 5 }}>
          {`Adjuster · ${feature.adjusterName}${feature.adjusterContact ? ` · ${feature.adjusterContact}` : ''}`}
        </Typography>
      </Box>
      {open ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5, p: 1.5, borderTop: 1, borderColor: 'divider' }}>
          {feature.milestones.length > 0 ? (
            <Box sx={{ ...cardSx, p: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Action plan
              </Typography>
              {feature.milestones.map((milestone) => (
                <Typography key={milestone.label} variant="body2">
                  {`${milestone.label} · ${milestone.status}`}
                </Typography>
              ))}
            </Box>
          ) : null}
          {feature.cards.map((card) => (
            <Box key={card.title} sx={{ ...cardSx, p: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                {card.title}
              </Typography>
              {card.fields.map((field) => (
                <Box key={field.label} sx={{ mb: 0.75 }}>
                  <Typography sx={labelSx}>{field.label}</Typography>
                  <Typography variant="body2">{field.value}</Typography>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  )
}

function CardHead({ title, detail, onOpen }: { title: string; detail: ClaimDetailModel; onOpen: (kind: CollabKind) => void }) {
  const pending = detail.tasks.filter((task) => task.status !== 'Completed').length
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="h6" component="h2" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '1rem', flex: 1 }}>
        {title}
      </Typography>
      <Stack direction="row" useFlexGap flexWrap="wrap">
        <HeadLink icon={ChecklistIcon} label={`Tasks (${pending})`} onClick={() => onOpen('tasks')} />
        <HeadLink icon={StickyNote2OutlinedIcon} label={`Notes (${detail.notes.length})`} onClick={() => onOpen('notes')} />
        <HeadLink icon={MailOutlineIcon} label={`Email (${detail.emails.length})`} onClick={() => onOpen('emails')} />
        <HeadLink icon={DescriptionOutlinedIcon} label={`Documents (${detail.documents.length})`} onClick={() => onOpen('documents')} />
      </Stack>
    </Stack>
  )
}

function HeadLink({ icon: Icon, label, onClick }: { icon: SvgIconComponent; label: string; onClick: () => void }) {
  return (
    <Button size="small" startIcon={<Icon sx={{ fontSize: 16 }} />} onClick={onClick}>
      {label}
    </Button>
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

function RibbonLink({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <Box>
      <Typography sx={labelSx}>{label}</Typography>
      <Link component="button" type="button" underline="hover" onClick={onClick} sx={{ fontWeight: 600, fontSize: '0.875rem', verticalAlign: 'baseline' }}>
        {value}
      </Link>
    </Box>
  )
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
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
              <TableCell key={`${headers[index]}-${cell}`}>{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
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
