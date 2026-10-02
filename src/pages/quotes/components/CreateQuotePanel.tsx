import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo, useRef, useState } from 'react'
import { CopilotQuickActions } from '@/design-system/components'
import { getFigmaColors } from '@/design-system/tokens/figma-colors'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { CustomerAddressEditor } from '@/pages/customers/components/CustomerAddressEditor'
import { extractCustomerFromFile, customerDocumentTypeLabel } from '@/pages/customers/data/customerDocumentExtraction'
import {
  NAICS_OPTIONS,
  formatAddress,
  naicsFromLabel,
  naicsLabel,
  naicsSubtitle,
  type CustomerAddress,
  type CustomerType,
} from '@/pages/customers/data/createCustomerDraft'
import { CopilotComposer } from '@/pages/policies/components/CopilotComposer'
import {
  DraftDrawerShell,
  DraftHeader,
  DraftHistoryList,
  DraftInlineLookup,
  DraftInlineOptions,
  DraftInlineTextEdit,
  DraftNeededList,
  DraftWelcome,
  draftBodySx,
  draftUid,
  useDebouncedValue,
  useFilledFirstOrder,
  type DraftNeededRow,
  type DraftRowBadge,
  type DraftTab,
  type DraftThreadMessage,
} from '@/pages/shared/components/DraftDrawer'
import {
  QUOTE_COVERAGES,
  QUOTE_LOCATION_TYPES,
  coverageChecked,
  emptyCreateQuoteDraft,
  formatMoney,
  applyPayrollSchedule,
  applyVehicleSchedule,
  inferQuoteFromText,
  isAddressComplete,
  mergeQuoteDraft,
  parseCount,
  parseMoney,
  parseQuoteAddress,
  quoteFileKind,
  quoteLocationId,
  scheduleLocations,
  withPrimaryLocation,
  type CreateQuoteDraft,
  type QuoteCoverage,
  type QuoteFileKind,
  type QuoteLocation,
  type QuoteLocationType,
} from '@/pages/quotes/data/createQuoteDraft'

type InlineField = 'name' | 'email' | 'address' | 'naics' | 'revenue' | 'employees' | 'payroll'
type CollectionField = 'locations' | 'vehicles'
type InsuredRowField = InlineField | CollectionField
type CoverageRowField = `coverage:${string}`
type InsuredListField = InsuredRowField | CoverageRowField
type LocationRowField = 'newLocation' | `location:${string}`
type DrawerLevel = 'insured' | 'locations' | 'coverages'

const BUSINESS_FIELDS: InlineField[] = ['name', 'email', 'address', 'naics', 'revenue', 'employees', 'payroll']
const INDIVIDUAL_FIELDS: InlineField[] = ['name', 'email', 'address']
/** Continue needs these; empty ones show as pink blockers. */
const BUSINESS_REQUIRED: readonly InlineField[] = ['name', 'email', 'address', 'naics']
const INDIVIDUAL_REQUIRED: readonly InlineField[] = ['name', 'email', 'address']

const FIELD_LABELS: Record<InlineField, string> = {
  name: 'Name',
  email: 'Email',
  address: 'Address',
  naics: 'Industry / NAICS',
  revenue: 'Estimated annual revenue',
  employees: 'Employees',
  payroll: 'Payroll',
}

/** Shown under the open input only; the row's badge carries required vs optional. */
const FIELD_HELPERS: Record<InlineField, string> = {
  name: 'Legal or DBA name',
  email: 'Contact email',
  address: 'Mailing address',
  naics: 'Search by industry or 6-digit code',
  revenue: 'Annual estimate, e.g. $4.2M',
  employees: 'Full-time headcount',
  payroll: 'Annual payroll, e.g. $850K',
}

const BUSINESS_SEED = 'Business'
const INDIVIDUAL_SEED = 'Individual'
const UPLOAD_SCHEDULE = 'Upload schedule'
const MORE_COVERAGES = 'More coverages'
const ADD_LOCATION = 'Add location'
const MAX_SUGGESTED_ACTIONS = 3
/** Level 1 suggests only these; the rest of QUOTE_COVERAGES live behind "More coverages". */
const PRIMARY_COVERAGES: readonly QuoteCoverage[] = ['General Liability', "Workers' Compensation", 'Commercial Auto']
const MORE_COVERAGE_OPTIONS = QUOTE_COVERAGES.filter((coverage) => !PRIMARY_COVERAGES.includes(coverage))

function coverageField(coverage: QuoteCoverage): CoverageRowField {
  return `coverage:${coverage}`
}

function coverageFromField(field: string): QuoteCoverage | null {
  return QUOTE_COVERAGES.find((coverage) => coverageField(coverage) === field) ?? null
}

export type CreateQuoteSavedState = {
  draft: CreateQuoteDraft
  messages: DraftThreadMessage[]
}

type StagedFile = { id: string; file: File; label: string }

const FILE_KIND_LABELS: Partial<Record<QuoteFileKind, string>> = {
  locations: 'Location schedule',
  payroll: 'Payroll',
  vehicles: 'Vehicle schedule',
}

const LOCATION_TYPE_BADGES: Partial<Record<QuoteLocationType, DraftRowBadge>> = {
  Office: { icon: <BusinessOutlinedIcon />, label: 'Office', color: 'teal' },
  Warehouse: { icon: <WarehouseOutlinedIcon />, label: 'Warehouse', color: 'green' },
}

function plural(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}

function stagedFileLabel(fileName: string) {
  const type = FILE_KIND_LABELS[quoteFileKind(fileName)] ?? customerDocumentTypeLabel(fileName)
  return [fileName, type].filter(Boolean).join(' · ')
}

function inlineValue(draft: CreateQuoteDraft, field: InlineField): string | null {
  switch (field) {
    case 'name':
      return draft.name || null
    case 'email':
      return draft.email || null
    case 'address':
      return draft.address ? formatAddress(draft.address) : null
    case 'naics':
      return draft.naics ? naicsLabel(draft.naics) : null
    case 'revenue':
      return draft.revenue != null ? formatMoney(draft.revenue) : null
    case 'employees':
      return draft.employees != null ? draft.employees.toLocaleString('en-US') : null
    case 'payroll':
      return draft.payroll != null ? formatMoney(draft.payroll) : null
  }
}

function locationSummary(location: QuoteLocation) {
  const { city, state, zip } = location.address
  const locality = [city, [state, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')
  return [locality, location.type ?? 'Type not set'].filter(Boolean).join(' · ')
}

function locationsToResolve(locations: QuoteLocation[]) {
  return locations.filter((location) => !isAddressComplete(location.address)).length
}

function locationsCountSummary(locations: QuoteLocation[]) {
  const toResolve = locationsToResolve(locations)
  return [plural(locations.length, 'location'), toResolve > 0 ? `${toResolve} to resolve` : null]
    .filter(Boolean)
    .join(' · ')
}

const captionSx = { fontFamily: figmaFontFamilyStack.body, display: 'block', mt: 0.5 } as const

/** Address lookup + type, with explicit ✓ save and ✕ cancel. */
function LocationEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: QuoteLocation | null
  onSave: (location: { address: CustomerAddress; type: QuoteLocationType | null }) => void
  onCancel: () => void
}) {
  const [address, setAddress] = useState<CustomerAddress | null>(initial?.address ?? null)
  const [type, setType] = useState<QuoteLocationType | null>(initial?.type ?? null)
  return (
    <Stack spacing={1.25}>
      {address ? (
        <Typography variant="body2" sx={{ ...draftBodySx, fontSize: '0.8125rem' }}>
          {formatAddress(address)}
        </Typography>
      ) : null}
      <CustomerAddressEditor
        value={address && isAddressComplete(address) ? address : null}
        onSelect={setAddress}
        onDone={() => undefined}
        onDismiss={onCancel}
      />
      <DraftInlineOptions
        options={QUOTE_LOCATION_TYPES.filter((option) => option !== 'Primary' || initial?.type === 'Primary')}
        selected={type}
        onPick={(next) => setType(QUOTE_LOCATION_TYPES.find((option) => option === next) ?? null)}
      />
      <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
        <IconButton size="small" aria-label="Cancel location" onClick={onCancel}>
          <CloseIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          color="primary"
          aria-label="Save location"
          disabled={!address || !isAddressComplete(address)}
          onClick={() => address && isAddressComplete(address) && onSave({ address, type })}
        >
          <CheckIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Stack>
  )
}

export function CreateQuotePanel({
  initialState,
  onClose,
  onSaveDraft,
}: {
  initialState?: CreateQuoteSavedState | null
  onClose: () => void
  onSaveDraft: (state: CreateQuoteSavedState) => void
}) {
  const [tab, setTab] = useState<DraftTab>('new')
  const [level, setLevel] = useState<DrawerLevel>('insured')
  const [draft, setDraft] = useState<CreateQuoteDraft>(initialState?.draft ?? emptyCreateQuoteDraft)
  const [messages, setMessages] = useState<DraftThreadMessage[]>(initialState?.messages ?? [])
  const [composerValue, setComposerValue] = useState('')
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([])
  const [sentFiles, setSentFiles] = useState<StagedFile[]>([])
  const [readingFiles, setReadingFiles] = useState(false)
  const [editing, setEditing] = useState<InsuredListField | null>(null)
  const [editingLocation, setEditingLocation] = useState<LocationRowField | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const composerBoxRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [parsedComposerValue, setParsedComposerValue] = useDebouncedValue(composerValue)

  const onInsured = level === 'insured'
  const liveComposerText = onInsured ? parsedComposerValue.trim() : ''
  const previewDraft = useMemo(
    () => withPrimaryLocation(mergeQuoteDraft(draft, inferQuoteFromText(liveComposerText))),
    [draft, liveComposerText],
  )
  const commitDraft = useMemo(
    () => withPrimaryLocation(mergeQuoteDraft(draft, onInsured ? inferQuoteFromText(composerValue) : {})),
    [composerValue, draft, onInsured],
  )
  const started =
    messages.length > 0 ||
    sentFiles.length > 0 ||
    Boolean(liveComposerText) ||
    draft.type != null ||
    Boolean(draft.name) ||
    draft.locations.length > 0
  const isIndividual = previewDraft.type === 'Individual'
  const inlineFields = isIndividual ? INDIVIDUAL_FIELDS : BUSINESS_FIELDS
  const requiredFields = isIndividual ? INDIVIDUAL_REQUIRED : BUSINESS_REQUIRED
  const canContinue = requiredFields.every((field) => inlineValue(commitDraft, field) != null)
  const orderedFields = useFilledFirstOrder(inlineFields, (field) => inlineValue(previewDraft, field) != null)
  const composerPlaceholder =
    draft.type === 'Individual' ? 'Describe the person, or drop a file…' : 'Describe the business, or drop a file…'
  const resetComposer = () => {
    setComposerValue('')
    setParsedComposerValue('')
  }

  const focusComposer = () => {
    window.requestAnimationFrame(() => {
      composerBoxRef.current?.querySelector<HTMLTextAreaElement>('textarea:not([aria-hidden="true"])')?.focus()
    })
  }

  const readDocuments = (files: File[], text: string) => {
    setReadingFiles(true)
    void Promise.all(files.map((file) => extractCustomerFromFile(file))).then((results) => {
      setReadingFiles(false)
      const inferred: Partial<CreateQuoteDraft>[] = results.map(({ inferred: customer }) => ({
        type: customer.type ?? undefined,
        name: customer.legalName,
        email: customer.email ?? undefined,
        address: customer.address ?? undefined,
        naics: customer.naics ?? undefined,
      }))
      setDraft((current) =>
        [...inferred, inferQuoteFromText(text)].reduce<CreateQuoteDraft>(mergeQuoteDraft, current),
      )
    })
  }

  const stageFiles = (files: File[]) => {
    setStagedFiles((current) => {
      const seen = new Set(current.map((staged) => staged.file.name.toLowerCase()))
      const incoming = files
        .filter((file) => !seen.has(file.name.toLowerCase()))
        .map((file) => ({ id: draftUid('file'), file, label: stagedFileLabel(file.name) }))
      return [...current, ...incoming]
    })
  }

  /** On submit: staged chips move to the thread, then fill what they can. Locations update the summary without pushing level 2. */
  const sendFiles = (staged: StagedFile[], text: string) => {
    setSentFiles((current) => [...current, ...staged])
    setMessages((current) => [...current, { id: draftUid('user'), text, files: staged.map((s) => s.file.name) }])
    const files = staged.map((s) => s.file)
    const kinds = files.map((file) => quoteFileKind(file.name))
    setDraft((current) => {
      let next = current
      if (kinds.includes('locations')) next = { ...next, locations: [...next.locations, ...scheduleLocations()] }
      if (kinds.includes('payroll')) next = applyPayrollSchedule(next)
      if (kinds.includes('vehicles')) next = applyVehicleSchedule(next)
      return next
    })
    const documents = files.filter((_, index) => kinds[index] === 'document')
    if (documents.length > 0) readDocuments(documents, text)
  }

  const handleSend = (raw: string) => {
    const text = raw.trim()
    const staged = stagedFiles
    if (!text && staged.length === 0) return
    resetComposer()
    setEditing(null)
    if (staged.length > 0) {
      setStagedFiles([])
      sendFiles(staged, onInsured ? text : '')
    }
    if (!text) return

    if (level === 'coverages') {
      const named = QUOTE_COVERAGES.filter((coverage) => text.toLowerCase().includes(coverage.toLowerCase()))
      for (const coverage of named) setCoverage(coverage, true)
      return
    }
    if (level === 'locations') {
      const address = parseQuoteAddress(text)
      if (address) {
        setDraft((current) => ({
          ...current,
          locations: [...current.locations, { id: quoteLocationId(), address, type: null }],
        }))
      }
      return
    }
    if (staged.length === 0) setMessages((current) => [...current, { id: draftUid('user'), text }])
    setDraft((current) => mergeQuoteDraft(current, inferQuoteFromText(text)))
  }

  const pushLocations = () => {
    setEditing(null)
    setEditingLocation(null)
    setLevel('locations')
  }

  const pushCoverages = () => {
    setEditing(null)
    setEditingLocation(null)
    setLevel('coverages')
  }

  const popToInsured = () => {
    setEditingLocation(null)
    setLevel('insured')
  }

  const setCoverage = (coverage: QuoteCoverage, checked: boolean) =>
    setDraft((current) => ({ ...current, coverageChoices: { ...current.coverageChoices, [coverage]: checked } }))

  const applyInlineEdit = (field: InlineField, value: string) => {
    setEditing(null)
    setDraft((current) => {
      switch (field) {
        case 'name':
          return { ...current, name: value }
        case 'email':
          return { ...current, email: value }
        case 'naics':
          return { ...current, naics: naicsFromLabel(value) ?? current.naics }
        case 'revenue':
          return { ...current, revenue: parseMoney(value) ?? parseCount(value) ?? current.revenue }
        case 'payroll':
          return { ...current, payroll: parseMoney(value) ?? parseCount(value) ?? current.payroll }
        case 'employees':
          return { ...current, employees: parseCount(value) ?? current.employees }
        case 'address':
          return current
      }
    })
  }

  const startWithType = (type: CustomerType) => {
    setDraft((current) => ({ ...current, type }))
  }

  const handleInsuredAction = (action: string) => {
    switch (action) {
      case BUSINESS_SEED:
        startWithType('Business')
        return
      case INDIVIDUAL_SEED:
        startWithType('Individual')
        return
      case UPLOAD_SCHEDULE:
        focusComposer()
        fileInputRef.current?.click()
        return
    }
    if (action.startsWith(MORE_COVERAGES)) {
      pushCoverages()
      return
    }
    const coverage = PRIMARY_COVERAGES.find((option) => option === action)
    if (coverage) setCoverage(coverage, true)
  }

  const saveLocation = (field: LocationRowField, next: { address: CustomerAddress; type: QuoteLocationType | null }) => {
    setEditingLocation(null)
    setDraft((raw) => {
      const current = withPrimaryLocation(raw)
      if (field === 'newLocation') {
        return { ...current, locations: [...current.locations, { id: quoteLocationId(), ...next }] }
      }
      const id = field.slice('location:'.length)
      return {
        ...current,
        locations: current.locations.map((location) => (location.id === id ? { ...location, ...next } : location)),
      }
    })
  }

  const savedState = (): CreateQuoteSavedState => ({ draft: commitDraft, messages })

  const insuredRows: DraftNeededRow<InsuredListField>[] = [
    ...orderedFields.map((field): DraftNeededRow<InsuredListField> => {
      const value = inlineValue(previewDraft, field)
      return {
        term: FIELD_LABELS[field],
        value,
        hint: '',
        field,
        ...(value == null ? { tone: requiredFields.includes(field) ? ('error' as const) : ('warning' as const) } : {}),
      }
    }),
    {
      term: 'Locations',
      value: previewDraft.locations.length > 0 ? locationsCountSummary(previewDraft.locations) : null,
      hint: 'None added',
      field: 'locations',
      chevron: true,
      ...(previewDraft.locations.length === 0
        ? { tone: 'warning' as const }
        : locationsToResolve(previewDraft.locations) > 0
          ? { tone: 'error' as const }
          : {}),
    },
    {
      term: 'Vehicles',
      value: previewDraft.vehicleCount > 0 ? plural(previewDraft.vehicleCount, 'vehicle') : null,
      hint: 'None added',
      field: 'vehicles',
      chevron: true,
      ...(previewDraft.vehicleCount > 0 ? {} : { tone: 'warning' as const }),
    },
    ...PRIMARY_COVERAGES.filter((coverage) => coverageChecked(previewDraft, coverage)).map(
      (coverage): DraftNeededRow<InsuredListField> => ({ term: coverage, value: 'Added', field: coverageField(coverage) }),
    ),
  ]

  const moreCoveragesAdded = MORE_COVERAGE_OPTIONS.filter((coverage) => coverageChecked(previewDraft, coverage)).length
  const insuredActions = [
    ...PRIMARY_COVERAGES.filter((coverage) => !coverageChecked(previewDraft, coverage)).slice(0, MAX_SUGGESTED_ACTIONS),
    moreCoveragesAdded > 0 ? `${MORE_COVERAGES} (${moreCoveragesAdded} added)` : MORE_COVERAGES,
  ]

  const renderInlineEditor = (field: InsuredListField) => {
    const coverage = coverageFromField(field)
    if (coverage) {
      return (
        <Button
          size="small"
          color="inherit"
          onClick={() => {
            setEditing(null)
            setCoverage(coverage, false)
          }}
          sx={{ ...draftBodySx, textTransform: 'none', ml: -1 }}
        >
          Remove coverage
        </Button>
      )
    }
    switch (field) {
      case 'address':
        return (
          <Box>
            <CustomerAddressEditor
              value={previewDraft.address}
              onSelect={(address) => setDraft((current) => ({ ...current, address }))}
              onDone={() => setEditing(null)}
              onDismiss={() => setEditing(null)}
            />
            <Typography variant="caption" color="text.secondary" sx={captionSx}>
              {FIELD_HELPERS.address}
            </Typography>
          </Box>
        )
      case 'naics':
        return (
          <DraftInlineLookup
            options={NAICS_OPTIONS}
            optionSubtitle={naicsSubtitle}
            placeholder="Search NAICS code or industry"
            hint={FIELD_HELPERS.naics}
            onPick={(value) => applyInlineEdit('naics', value)}
            onDismiss={() => setEditing(null)}
          />
        )
      case 'locations':
      case 'vehicles':
        return null
      case 'name':
      case 'email':
      case 'revenue':
      case 'employees':
      case 'payroll': {
        const numeric = field === 'revenue' || field === 'payroll' || field === 'employees'
        const initial =
          field === 'name'
            ? previewDraft.name
            : field === 'email'
              ? (previewDraft.email ?? '')
              : (inlineValue(previewDraft, field) ?? '')
        return (
          <DraftInlineTextEdit
            initialValue={initial}
            label={FIELD_LABELS[field]}
            type={field === 'email' ? 'email' : 'text'}
            inputMode={numeric ? (field === 'employees' ? 'numeric' : 'decimal') : undefined}
            helperText={FIELD_HELPERS[field]}
            confirmable
            onCommit={(value) => applyInlineEdit(field, value)}
            onDismiss={() => setEditing(null)}
          />
        )
      }
      default:
        return null
    }
  }

  const locationRows: DraftNeededRow<LocationRowField>[] = [
    ...previewDraft.locations.map((location) => {
      const complete = isAddressComplete(location.address)
      const badge = complete && location.type ? LOCATION_TYPE_BADGES[location.type] : undefined
      return {
        term: location.address.street || 'Location',
        value: complete && location.type ? locationSummary(location) : null,
        hint: complete ? locationSummary(location) : `Address incomplete · ${locationSummary(location)}`,
        field: `location:${location.id}` as const,
        ...(!complete
          ? { tone: 'error' as const }
          : badge
            ? { badge }
            : location.type
              ? {}
              : { tone: 'warning' as const }),
      }
    }),
    ...(editingLocation === 'newLocation'
      ? [{ term: 'New location', value: null, hint: '', tone: 'warning' as const, field: 'newLocation' as const }]
      : []),
  ]

  const renderLocationEditor = (field: LocationRowField) => (
    <LocationEditor
      initial={
        field === 'newLocation'
          ? null
          : (previewDraft.locations.find((location) => `location:${location.id}` === field) ?? null)
      }
      onSave={(next) => saveLocation(field, next)}
      onCancel={() => setEditingLocation(null)}
    />
  )

  const fileChips =
    sentFiles.length > 0 ? (
      <Stack
        direction="row"
        flexWrap="wrap"
        alignItems="center"
        gap={0.75}
        sx={{ px: 2, pt: 1.5, mb: 1, borderTop: 1, borderColor: 'divider' }}
      >
        {sentFiles.map((sent) => (
          <Chip
            key={sent.id}
            size="small"
            label={sent.label}
            sx={{
              maxWidth: '100%',
              fontFamily: figmaFontFamilyStack.body,
              fontSize: '0.75rem',
              '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
            }}
          />
        ))}
        {readingFiles ? (
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
            Reading…
          </Typography>
        ) : null}
      </Stack>
    ) : null

  const insuredLevel = !started ? (
    <>
      <DraftWelcome
        title="Who is being insured?"
        body="Describe the business, or drop an ACORD, payroll file, or location schedule."
      />
      <Divider sx={{ mb: 2 }} />
      <CopilotQuickActions
        label="Suggested actions"
        actions={[BUSINESS_SEED, INDIVIDUAL_SEED, UPLOAD_SCHEDULE]}
        onAction={handleInsuredAction}
      />
    </>
  ) : (
    <>
      <DraftHeader title={previewDraft.name || 'New quote'} request={previewDraft.type ?? undefined} />
      <DraftNeededList
        rows={insuredRows}
        editingField={editing}
        openRowStyle="none"
        onToggle={(field) => {
          if (field === 'locations') pushLocations()
          else if (field === 'vehicles') setToast('Vehicles next.')
          else setEditing((current) => (current === field ? null : field))
        }}
        renderEditor={renderInlineEditor}
      />
      <CopilotQuickActions label="Suggested actions" actions={insuredActions} onAction={handleInsuredAction} />
    </>
  )

  const coverageRows: DraftNeededRow<CoverageRowField>[] = MORE_COVERAGE_OPTIONS.map((coverage) => {
    const added = coverageChecked(previewDraft, coverage)
    return { term: coverage, value: added ? 'Added' : null, hint: added ? undefined : 'Tap to add', field: coverageField(coverage) }
  })

  const coveragesLevel = (
    <>
      <DraftHeader
        title="More coverages"
        request={plural(moreCoveragesAdded, 'coverage') + ' added'}
        backLabel="Back to quote"
        onBack={popToInsured}
      />
      <DraftNeededList
        rows={coverageRows}
        editingField={null}
        openRowStyle="none"
        onToggle={(field) => {
          const coverage = coverageFromField(field)
          if (coverage) setCoverage(coverage, !coverageChecked(previewDraft, coverage))
        }}
        renderEditor={() => null}
      />
    </>
  )

  const locationsLevel = (
    <>
      <DraftHeader
        title="Locations"
        request={locationsCountSummary(previewDraft.locations)}
        backLabel="Back to quote"
        onBack={popToInsured}
      />
      <DraftNeededList
        rows={locationRows}
        editingField={editingLocation}
        openRowStyle="none"
        onToggle={(field) => setEditingLocation((current) => (current === field ? null : field))}
        renderEditor={renderLocationEditor}
      />
      {editingLocation !== 'newLocation' ? (
        <CopilotQuickActions
          label="Suggested actions"
          actions={[ADD_LOCATION]}
          onAction={() => setEditingLocation('newLocation')}
        />
      ) : null}
    </>
  )

  return (
    <>
      <DraftDrawerShell
        heading="Create quote"
        closeLabel="Close create quote drawer"
        tab={tab}
        onTabChange={setTab}
        onClose={onClose}
        createLabel={onInsured ? 'Continue' : 'Done'}
        createDisabled={onInsured ? !canContinue : false}
        onCreate={() => (onInsured ? setToast('Coverage details next.') : popToInsured())}
        onSaveDraft={() => onSaveDraft(savedState())}
        history={
          <DraftHistoryList entries={[]} emptyText="Quotes you start this session show up here." onOpen={() => undefined} />
        }
        composer={
          <Box ref={composerBoxRef}>
            {fileChips}
            <CopilotComposer
              key={level}
              placeholder={
                onInsured
                  ? composerPlaceholder
                  : level === 'coverages'
                    ? 'Name a coverage to add…'
                    : 'Type an address, or drop a schedule…'
              }
              value={composerValue}
              onChange={setComposerValue}
              minRows={1}
              showModeSelector={false}
              showDisclaimer={false}
              onSubmit={(text) => handleSend(text)}
              onFilesAdded={stageFiles}
              stagedChips={stagedFiles}
              onRemoveStagedChip={(id) => setStagedFiles((current) => current.filter((staged) => staged.id !== id))}
            />
          </Box>
        }
      >
        {onInsured ? insuredLevel : level === 'coverages' ? coveragesLevel : locationsLevel}
      </DraftDrawerShell>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.eml,.msg,.vcf,.txt"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          event.target.value = ''
          stageFiles(files)
        }}
      />
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{
          sx: (theme) => ({
            bgcolor: getFigmaColors(theme.palette.mode).components.snackbarFill,
            color: 'common.white',
            fontFamily: 'inherit',
          }),
        }}
      />
    </>
  )
}
