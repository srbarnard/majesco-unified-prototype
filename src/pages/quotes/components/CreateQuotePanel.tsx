import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { CopilotQuickActions } from '@/design-system/components'
import { accentSubtle, accentSubtleHover } from '@/design-system/theme/themeSurfaces'
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
  type DraftHistoryItem,
  type DraftNeededRow,
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
  isVehicleComplete,
  mergeQuoteDraft,
  missingVehicleFields,
  quoteVehicleId,
  VEHICLE_FIELD_LABELS,
  parseCount,
  parseMoney,
  parseQuoteAddress,
  quoteFileKind,
  quoteLocationId,
  scheduleLocations,
  suggestCoverages,
  withPrimaryLocation,
  type CreateQuoteDraft,
  type QuoteCoverage,
  type QuoteFileKind,
  type QuoteLocation,
  type QuoteLocationType,
  type QuoteVehicle,
} from '@/pages/quotes/data/createQuoteDraft'
import { insuredsMock } from '@/pages/insureds/data/mockInsureds'

type InlineField = 'name' | 'email' | 'address' | 'naics' | 'revenue' | 'employees' | 'payroll'
type CollectionField = 'locations' | 'vehicles' | 'documents'
type InsuredRowField = InlineField | CollectionField
type CoverageRowField = `coverage:${string}`
type InsuredListField = InsuredRowField
type CoverageListField = CoverageRowField | 'vehicles' | 'payroll'
type LocationRowField = 'newLocation' | `location:${string}`
type VehicleRowField = 'newVehicle' | `vehicle:${string}`
type DrawerLevel = 'insured' | 'locations' | 'vehicles' | 'coverages'

const BUSINESS_FIELDS: InlineField[] = ['name', 'email', 'address', 'naics', 'revenue', 'employees', 'payroll']
const INDIVIDUAL_FIELDS: InlineField[] = ['name', 'email', 'address']
/** Continue needs these; empty ones show as pink blockers. */
const BUSINESS_REQUIRED: readonly InlineField[] = ['name', 'address', 'naics']
const INDIVIDUAL_REQUIRED: readonly InlineField[] = ['name', 'address']

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
const UNDER_EXISTING_INSURED = 'Under an existing insured'
const INSUREDS_BY_NAME = new Map(insuredsMock.map((insured) => [insured.name, insured]))
const INSURED_OPTIONS = [...INSUREDS_BY_NAME.keys()]
const ADD_NOTE = 'Add note'
const EMAIL_MISSING_INFO = 'Email for missing info'
const ADD_LOCATION = 'Add location'
const ADD_VEHICLE = 'Add vehicle'
const SAVE_DRAFT = 'Save draft'
const SELECT_COVERAGES = 'Select coverages'
const VIN_PATTERN = /\b[A-HJ-NPR-Z0-9]{17}\b/i

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

export type CreateQuoteMissingInfoEmail = { subject: string; body: string }

type StagedFile = { id: string; file: File; label: string }

const FILE_KIND_LABELS: Partial<Record<QuoteFileKind, string>> = {
  locations: 'Location schedule',
  payroll: 'Payroll',
  vehicles: 'Vehicle schedule',
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

function vehiclesToResolve(vehicles: QuoteVehicle[]) {
  return vehicles.filter((vehicle) => !isVehicleComplete(vehicle)).length
}

function vehiclesCountSummary(vehicles: QuoteVehicle[]) {
  const toResolve = vehiclesToResolve(vehicles)
  return [plural(vehicles.length, 'vehicle'), toResolve > 0 ? `${toResolve} to resolve` : null]
    .filter(Boolean)
    .join(' · ')
}

function vehicleTitle(vehicle: QuoteVehicle) {
  return [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'Vehicle'
}

const captionSx = { fontFamily: figmaFontFamilyStack.body, display: 'block', mt: 0.5 } as const

type VehicleInput = Omit<QuoteVehicle, 'id'>

/** VIN, year, make, model, and garaging location, with explicit ✓ save and ✕ cancel. */
function VehicleEditor({
  initial,
  locations,
  onSave,
  onCancel,
}: {
  initial: QuoteVehicle | null
  locations: QuoteLocation[]
  onSave: (vehicle: VehicleInput) => void
  onCancel: () => void
}) {
  const [vehicle, setVehicle] = useState<VehicleInput>({
    vin: initial?.vin ?? '',
    year: initial?.year ?? '',
    make: initial?.make ?? '',
    model: initial?.model ?? '',
    garagingId: initial?.garagingId ?? (locations.length === 1 ? locations[0].id : null),
  })
  const textField = (field: 'vin' | 'year' | 'make' | 'model', autoFocus = false) => (
    <TextField
      size="small"
      fullWidth
      autoFocus={autoFocus}
      label={VEHICLE_FIELD_LABELS[field]}
      value={vehicle[field]}
      onChange={(event) =>
        setVehicle((current) => ({
          ...current,
          [field]: field === 'vin' ? event.target.value.toUpperCase() : event.target.value,
        }))
      }
      inputProps={field === 'year' ? { inputMode: 'numeric', maxLength: 4 } : field === 'vin' ? { maxLength: 17 } : undefined}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onCancel()
      }}
    />
  )
  const locationLabel = (location: QuoteLocation) => location.address.street || 'Location'
  const garaging = locations.find((location) => location.id === vehicle.garagingId)
  const hasAny = Boolean(vehicle.vin || vehicle.year || vehicle.make || vehicle.model)
  return (
    <Stack spacing={1.25}>
      {textField('vin', true)}
      <Stack direction="row" spacing={1}>
        <Box sx={{ width: 96, flexShrink: 0 }}>{textField('year')}</Box>
        {textField('make')}
      </Stack>
      {textField('model')}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ ...captionSx, mt: 0, mb: 0.75 }}>
          {VEHICLE_FIELD_LABELS.garagingId}
        </Typography>
        {locations.length > 0 ? (
          <DraftInlineOptions
            options={locations.map(locationLabel)}
            selected={garaging ? locationLabel(garaging) : null}
            onPick={(label) =>
              setVehicle((current) => ({
                ...current,
                garagingId: locations.find((location) => locationLabel(location) === label)?.id ?? null,
              }))
            }
          />
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ ...draftBodySx, fontSize: '0.8125rem' }}>
            Add a location first.
          </Typography>
        )}
      </Box>
      <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
        <IconButton size="small" aria-label="Cancel vehicle" onClick={onCancel}>
          <CloseIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          color="primary"
          aria-label="Save vehicle"
          disabled={!hasAny}
          onClick={() => hasAny && onSave(vehicle)}
        >
          <CheckIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Stack>
  )
}

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
  onAddNote,
  onEmailMissingInfo,
  history,
  onOpenHistory,
  onStartOver,
}: {
  initialState?: CreateQuoteSavedState | null
  history: DraftHistoryItem[]
  onOpenHistory: (id: string) => void
  /** Back to "Who is being insured?"; the next Save draft writes a new History row. */
  onStartOver: () => void
  onClose: () => void
  onSaveDraft: (state: CreateQuoteSavedState) => void
  onAddNote: (state: CreateQuoteSavedState) => void
  onEmailMissingInfo: (email: CreateQuoteMissingInfoEmail, state: CreateQuoteSavedState) => void
}) {
  const [tab, setTab] = useState<DraftTab>('new')
  const [level, setLevel] = useState<DrawerLevel>('insured')
  const [draft, setDraft] = useState<CreateQuoteDraft>(() => ({ ...emptyCreateQuoteDraft, ...initialState?.draft }))
  const [messages, setMessages] = useState<DraftThreadMessage[]>(initialState?.messages ?? [])
  const [composerValue, setComposerValue] = useState('')
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([])
  const [sentFiles, setSentFiles] = useState<StagedFile[]>([])
  const [readingFiles, setReadingFiles] = useState(false)
  const [editing, setEditing] = useState<InsuredListField | null>(null)
  const [editingLocation, setEditingLocation] = useState<LocationRowField | null>(null)
  const [editingVehicle, setEditingVehicle] = useState<VehicleRowField | null>(null)
  const [editingCoverage, setEditingCoverage] = useState<CoverageListField | null>(null)
  const [vehiclesParent, setVehiclesParent] = useState<'insured' | 'coverages'>('insured')
  const [toast, setToast] = useState<string | null>(null)
  const [pickingInsured, setPickingInsured] = useState(false)
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
  const orderedFields = useFilledFirstOrder(inlineFields, (field) => inlineValue(previewDraft, field) != null)
  const composerPlaceholder =
    draft.type === 'Individual' ? 'Describe the person, or drop a file…' : 'Describe the business, or drop a file…'
  const resetComposer = () => {
    setComposerValue('')
    setParsedComposerValue('')
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
    if (level === 'vehicles') {
      const vin = text.match(VIN_PATTERN)?.[0]
      if (vin) {
        setDraft((current) => ({
          ...current,
          vehicles: [
            ...current.vehicles,
            { id: quoteVehicleId(), vin: vin.toUpperCase(), year: '', make: '', model: '', garagingId: null },
          ],
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

  const pushVehicles = (from: 'insured' | 'coverages') => {
    setEditing(null)
    setEditingCoverage(null)
    setEditingVehicle(null)
    setVehiclesParent(from)
    setLevel('vehicles')
  }

  const pushCoverages = () => {
    setEditing(null)
    setEditingCoverage(null)
    setLevel('coverages')
  }

  const popToInsured = () => {
    setEditingLocation(null)
    setEditingVehicle(null)
    setEditingCoverage(null)
    setLevel('insured')
  }

  const popFromVehicles = () => {
    setEditingVehicle(null)
    setLevel(vehiclesParent)
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

  const backToStart = () => {
    resetComposer()
    setEditing(null)
    setEditingLocation(null)
    setEditingVehicle(null)
    setStagedFiles([])
    setSentFiles([])
    setMessages([])
    setDraft(emptyCreateQuoteDraft)
    onStartOver()
  }

  const startWithType = (type: CustomerType) => {
    setDraft((current) => ({ ...current, type }))
  }

  const pickInsured = (name: string) => {
    const insured = INSUREDS_BY_NAME.get(name)
    setPickingInsured(false)
    if (!insured) return
    setDraft((current) => ({
      ...current,
      type: insured.insuredType === 'Commercial' ? 'Business' : 'Individual',
      name: insured.name,
      email: insured.contactEmail,
      address: parseQuoteAddress(`${insured.addressLine1}, ${insured.cityStateZip}`),
    }))
  }

  const handleInsuredAction = (action: string) => {
    switch (action) {
      case BUSINESS_SEED:
        startWithType('Business')
        return
      case INDIVIDUAL_SEED:
        startWithType('Individual')
        return
      case UNDER_EXISTING_INSURED:
        setPickingInsured(true)
        return
      case ADD_NOTE:
        onAddNote(savedState())
        return
      case EMAIL_MISSING_INFO:
        onEmailMissingInfo(missingInfoEmail(), savedState())
        return
      case SELECT_COVERAGES:
        pushCoverages()
        return
      case SAVE_DRAFT:
        onSaveDraft(savedState())
        return
    }
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

  const saveVehicle = (field: VehicleRowField, next: VehicleInput) => {
    setEditingVehicle(null)
    setDraft((current) => {
      if (field === 'newVehicle') return { ...current, vehicles: [...current.vehicles, { id: quoteVehicleId(), ...next }] }
      const id = field.slice('vehicle:'.length)
      return {
        ...current,
        vehicles: current.vehicles.map((vehicle) => (vehicle.id === id ? { ...vehicle, ...next } : vehicle)),
      }
    })
  }

  const savedState = (): CreateQuoteSavedState => ({ draft: commitDraft, messages })

  const profileComplete = requiredFields.every((field) => inlineValue(previewDraft, field) != null)
  const autoChosen = coverageChecked(previewDraft, 'Commercial Auto')
  const vehiclesBlocked = previewDraft.vehicles.length === 0 || vehiclesToResolve(previewDraft.vehicles) > 0
  const vehiclesRow: DraftNeededRow<'vehicles'> = {
    term: 'Vehicles',
    value: previewDraft.vehicles.length > 0 ? vehiclesCountSummary(previewDraft.vehicles) : null,
    hint: 'None added',
    field: 'vehicles',
    chevron: true,
    ...(vehiclesBlocked ? { tone: 'error' as const } : {}),
  }
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
    ...(sentFiles.length > 0
      ? [
          {
            term: 'Documents',
            value: readingFiles ? `${plural(sentFiles.length, 'document')} · Reading…` : plural(sentFiles.length, 'document'),
            hint: '',
            field: 'documents' as const,
            expandable: true,
          },
        ]
      : []),
    // A dropped vehicle schedule surfaces here until Commercial Auto is chosen; then it lives under Coverages.
    ...(previewDraft.vehicles.length > 0 && !autoChosen ? [vehiclesRow] : []),
  ]

  const insuredActions = profileComplete
    ? [SELECT_COVERAGES, SAVE_DRAFT, ADD_NOTE]
    : [ADD_NOTE, EMAIL_MISSING_INFO, SAVE_DRAFT]

  const addedCoverages = QUOTE_COVERAGES.filter((coverage) => coverageChecked(previewDraft, coverage))
  const coverageSuggestions = suggestCoverages(previewDraft)
  const suggestedCoverages = new Set(coverageSuggestions.map(({ coverage }) => coverage))
  const payrollValue = inlineValue(previewDraft, 'payroll')
  const payrollRow: DraftNeededRow<'payroll'> = {
    term: FIELD_LABELS.payroll,
    value: payrollValue,
    hint: "Needed for Workers' Compensation",
    field: 'payroll',
    ...(payrollValue == null ? { tone: 'error' as const } : {}),
  }
  // Each selected coverage asks only for what it rates on; General Liability needs nothing beyond the profile.
  const coverageRows: DraftNeededRow<CoverageListField>[] = [
    ...addedCoverages
      .filter((coverage) => !suggestedCoverages.has(coverage))
      .map((coverage) => ({ term: coverage, value: 'Added', field: coverageField(coverage) })),
    ...(coverageChecked(previewDraft, "Workers' Compensation") ? [payrollRow] : []),
    ...(autoChosen ? [vehiclesRow] : []),
  ]
  const missingInfoEmail = (): CreateQuoteMissingInfoEmail => {
    const missing = requiredFields.filter((field) => inlineValue(commitDraft, field) == null).map((field) => FIELD_LABELS[field])
    const name = commitDraft.name || 'your business'
    return {
      subject: `Quote for ${name}: a few details needed`,
      body: [
        'Hi,',
        '',
        `To start the quote for ${name}, please send:`,
        ...missing.map((label) => `• ${label}`),
        '',
        'Thanks,',
      ].join('\n'),
    }
  }

  const renderCoverageEditor = (field: CoverageListField) => {
    if (field === 'payroll') {
      return (
        <DraftInlineTextEdit
          initialValue={payrollValue ?? ''}
          label={FIELD_LABELS.payroll}
          type="text"
          inputMode="decimal"
          helperText={FIELD_HELPERS.payroll}
          confirmable
          onCommit={(value) => {
            setEditingCoverage(null)
            applyInlineEdit('payroll', value)
          }}
          onDismiss={() => setEditingCoverage(null)}
        />
      )
    }
    const coverage = coverageFromField(field)
    if (!coverage) return null
    return (
      <Button
        size="small"
        color="inherit"
        onClick={() => {
          setEditingCoverage(null)
          setCoverage(coverage, false)
        }}
        sx={{ ...draftBodySx, textTransform: 'none', ml: -1 }}
      >
        Remove coverage
      </Button>
    )
  }

  const renderInlineEditor = (field: InsuredListField) => {
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
      case 'documents':
        return documentChips
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
      return {
        term: location.address.street || 'Location',
        value: complete ? locationSummary(location) : null,
        hint: `Address incomplete · ${locationSummary(location)}`,
        field: `location:${location.id}` as const,
        ...(complete ? {} : { tone: 'error' as const }),
      }
    }),
    ...(editingLocation === 'newLocation'
      ? [{ term: 'New location', value: null, hint: '', tone: 'new' as const, field: 'newLocation' as const }]
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

  const vehicleRows: DraftNeededRow<VehicleRowField>[] = [
    ...previewDraft.vehicles.map((vehicle) => {
      const missing = missingVehicleFields(vehicle)
      const garaging = previewDraft.locations.find((location) => location.id === vehicle.garagingId)
      return {
        term: vehicleTitle(vehicle),
        value: missing.length === 0 ? `VIN ${vehicle.vin} · ${garaging?.address.street ?? 'Garaging set'}` : null,
        hint: `Missing ${missing.map((field) => (field === 'vin' ? 'VIN' : VEHICLE_FIELD_LABELS[field].toLowerCase())).join(', ')}`,
        field: `vehicle:${vehicle.id}` as const,
        ...(missing.length === 0 ? {} : { tone: 'error' as const }),
      }
    }),
    ...(editingVehicle === 'newVehicle'
      ? [{ term: 'New vehicle', value: null, hint: '', tone: 'new' as const, field: 'newVehicle' as const }]
      : []),
  ]

  const renderVehicleEditor = (field: VehicleRowField) => (
    <VehicleEditor
      initial={
        field === 'newVehicle' ? null : (previewDraft.vehicles.find((vehicle) => `vehicle:${vehicle.id}` === field) ?? null)
      }
      locations={previewDraft.locations}
      onSave={(next) => saveVehicle(field, next)}
      onCancel={() => setEditingVehicle(null)}
    />
  )

  const documentChips = (
    <Stack direction="row" flexWrap="wrap" alignItems="center" gap={0.75}>
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
    </Stack>
  )

  const insuredLevel = !started ? (
    <>
      <DraftWelcome
        title="Who is being insured?"
        body="Describe the business, or drop an ACORD, payroll file, or location schedule."
      />
      <Divider sx={{ mb: 2 }} />
      <CopilotQuickActions
        label="Suggested actions"
        actions={[BUSINESS_SEED, INDIVIDUAL_SEED, UNDER_EXISTING_INSURED]}
        onAction={handleInsuredAction}
      />
      {pickingInsured ? (
        <DraftInlineLookup
          options={INSURED_OPTIONS}
          optionSubtitle={(name) => INSUREDS_BY_NAME.get(name)?.cityStateZip}
          placeholder="Search insureds"
          onPick={pickInsured}
          onDismiss={() => setPickingInsured(false)}
        />
      ) : null}
    </>
  ) : (
    <>
      <DraftHeader
        title="New quote"
        request={previewDraft.type ?? undefined}
        backLabel="Back to who is being insured"
        onBack={backToStart}
      />
      <DraftNeededList
        rows={insuredRows}
        editingField={editing}
        openRowStyle="none"
        onToggle={(field) => {
          if (field === 'locations') pushLocations()
          else if (field === 'vehicles') pushVehicles('insured')
          else setEditing((current) => (current === field ? null : field))
        }}
        renderEditor={renderInlineEditor}
      />
      <CopilotQuickActions label="Suggested actions" actions={insuredActions} onAction={handleInsuredAction} />
    </>
  )

  const coveragesLevel = (
    <>
      <DraftHeader
        title="Coverages"
        request={addedCoverages.length > 0 ? `${plural(addedCoverages.length, 'coverage')} added` : previewDraft.name || undefined}
        backLabel="Back to quote"
        onBack={popToInsured}
      />
      {coverageSuggestions.length > 0 ? (
        <Box sx={{ mb: 2 }}>
          {coverageSuggestions.map(({ coverage, reason }, index) => {
            const selected = coverageChecked(previewDraft, coverage)
            return (
              <Box
                key={coverage}
                component="label"
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  px: 1.5,
                  py: 1.25,
                  cursor: 'pointer',
                  borderBottom: index === coverageSuggestions.length - 1 ? 'none' : '1px solid',
                  borderColor: 'divider',
                  bgcolor: selected ? accentSubtle(theme) : 'transparent',
                  transition: 'background-color 0.15s ease',
                  '&:hover': { bgcolor: selected ? accentSubtle(theme) : accentSubtleHover(theme) },
                })}
              >
                <Checkbox
                  size="small"
                  checked={selected}
                  onChange={(event) => setCoverage(coverage, event.target.checked)}
                  inputProps={{ 'aria-label': `Select ${coverage}` }}
                  sx={{ p: 0.25, mt: 0.125, flexShrink: 0 }}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: figmaFontFamilyStack.body, fontWeight: 600, fontSize: '0.875rem' }}
                  >
                    {coverage}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.75rem', lineHeight: 1.45, mt: 0.5 }}
                  >
                    {reason}
                  </Typography>
                </Box>
              </Box>
            )
          })}
        </Box>
      ) : null}
      {coverageRows.length > 0 ? (
        <DraftNeededList
          rows={coverageRows}
          editingField={editingCoverage}
          openRowStyle="none"
          onToggle={(field) => {
            if (field === 'vehicles') pushVehicles('coverages')
            else if (field === 'payroll') setEditingCoverage((current) => (current === 'payroll' ? null : 'payroll'))
            else setEditingCoverage((current) => (current === field ? null : field))
          }}
          renderEditor={renderCoverageEditor}
        />
      ) : null}
      <CopilotQuickActions label="Suggested actions" actions={[SAVE_DRAFT]} onAction={() => onSaveDraft(savedState())} />
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
          actions={[ADD_LOCATION, SAVE_DRAFT]}
          onAction={(action) => (action === SAVE_DRAFT ? onSaveDraft(savedState()) : setEditingLocation('newLocation'))}
        />
      ) : null}
    </>
  )

  const vehiclesLevel = (
    <>
      <DraftHeader
        title="Vehicles"
        request={vehiclesCountSummary(previewDraft.vehicles)}
        backLabel={vehiclesParent === 'coverages' ? 'Back to coverages' : 'Back to quote'}
        onBack={popFromVehicles}
      />
      <DraftNeededList
        rows={vehicleRows}
        editingField={editingVehicle}
        openRowStyle="none"
        onToggle={(field) => setEditingVehicle((current) => (current === field ? null : field))}
        renderEditor={renderVehicleEditor}
      />
      {editingVehicle !== 'newVehicle' ? (
        <CopilotQuickActions
          label="Suggested actions"
          actions={[ADD_VEHICLE, SAVE_DRAFT]}
          onAction={(action) => (action === SAVE_DRAFT ? onSaveDraft(savedState()) : setEditingVehicle('newVehicle'))}
        />
      ) : null}
    </>
  )

  const levelContent = {
    insured: insuredLevel,
    locations: locationsLevel,
    vehicles: vehiclesLevel,
    coverages: coveragesLevel,
  }[level]

  const levelPlaceholder = {
    insured: composerPlaceholder,
    locations: 'Type an address, or drop a schedule…',
    vehicles: 'Type a VIN, or drop a vehicle schedule…',
    coverages: 'Name a coverage to add…',
  }[level]

  return (
    <>
      <DraftDrawerShell
        heading="Create quote"
        closeLabel="Close create quote drawer"
        tab={tab}
        onTabChange={setTab}
        onClose={onClose}
        history={
          <DraftHistoryList
            entries={history}
            emptyText="Quotes you start this session show up here."
            onOpen={onOpenHistory}
          />
        }
        composer={
          <Box>
            <CopilotComposer
              key={level}
              placeholder={levelPlaceholder}
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
        {levelContent}
      </DraftDrawerShell>
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
