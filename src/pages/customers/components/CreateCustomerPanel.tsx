import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router'
import { customerDetailsPath } from '@/pages/customers/data/customerRoutes'
import { CopilotQuickActions, InfoBanner } from '@/design-system/components'
import { entranceMotion, fadeSlideDownSx } from '@/design-system/tokens/motion'
import type { CreatedCustomerEntry } from '@/app/contexts/CustomersContext'
import { CopilotComposer } from '@/pages/policies/components/CopilotComposer'
import {
  DraftAccordions,
  DraftDocumentChips,
  DraftDrawerShell,
  DraftHeader,
  DraftHistoryList,
  DraftInlineLookup,
  DraftInlineOptions,
  DraftInlineTextEdit,
  DraftWelcome,
  draftBodySx,
  draftUid,
  formatDraftCreatedTime,
  useDebouncedValue,
  useFilledFirstOrder,
  type DraftNeededRow,
  splitDraftRows,
  type DraftTab,
  type DraftThreadMessage,
} from '@/pages/shared/components/DraftDrawer'
import {
  customerDocumentTypeLabel,
  extractCustomerFromFile,
} from '@/pages/customers/data/customerDocumentExtraction'
import {
  CREATE_CUSTOMER_TYPE_SEEDS,
  CUSTOMER_RELATED_BY_NAME,
  CUSTOMER_RELATED_OPTIONS,
  CUSTOMER_ROLES,
  CUSTOMER_TYPES,
  NAICS_OPTIONS,
  PARENT_CUSTOMER_OPTIONS,
  PRODUCER_OPTIONS,
  UNDER_EXISTING_CUSTOMER_SEED,
  buildCustomerFromDraft,
  buildQuotePrefillFromDraft,
  customerFieldsFor,
  customerRelatedSubtitle,
  customerRelatedValue,
  emptyCreateCustomerDraft,
  findDuplicateCustomer,
  formatAddress,
  formatTaxId,
  inferCustomerFromText,
  mergeCustomerDraft,
  naicsFromLabel,
  naicsLabel,
  naicsSubtitle,
  normalizeCustomerDraft,
  parseCustomerField,
  type CreateCustomerDraft,
} from '@/pages/customers/data/createCustomerDraft'
import type { CustomerRecord } from '@/pages/customers/data/mockCustomers'
import type { QuoteWizardFormData } from '@/pages/quotes/data/quoteWizardTypes'
import {
  findRelated,
  type AddTaskPageContext,
  type AddTaskRelated,
} from '@/pages/tasks/data/addTaskDraft'
import { CustomerAddressEditor } from './CustomerAddressEditor'

type StagedFile = { id: string; file: File; label: string; inferred?: Partial<CreateCustomerDraft> }

function stagedFileLabel(fileName: string) {
  return [fileName, customerDocumentTypeLabel(fileName)].filter(Boolean).join(' · ')
}

type EditField =
  | 'type'
  | 'legalName'
  | 'dba'
  | 'role'
  | 'phone'
  | 'email'
  | 'address'
  | 'taxId'
  | 'naics'
  | 'related'
  | 'producer'
  | 'newLocation'
  | `location:${number}`

type CapturedField = ReturnType<typeof customerFieldsFor>[number]
type WorkField = 'type' | CapturedField

const FIELD_LABELS: Record<CapturedField, string> = {
  legalName: 'Legal name',
  phone: 'Phone',
  email: 'Email',
  address: 'Address',
  taxId: 'Tax ID',
  naics: 'NAICS',
  related: 'Related',
}

/** Shown under an empty row instead of "still needed" — the badge already carries required vs optional. */
const FIELD_HINTS: Record<CapturedField | 'type' | 'role', string> = {
  type: 'Business or individual',
  role: 'Insured, payor, or subsidiary',
  legalName: 'Legal or DBA name',
  phone: 'Primary number',
  email: 'Contact email',
  address: 'Mailing address',
  taxId: 'EIN or SSN last 4',
  naics: 'Industry code',
  related: 'Producer or parent',
}

const REQUEST_FROM_PRODUCER = 'Request from producer'
const CREATE_TASK = 'Create task'
const REVIEW_ALL = 'Review all'
const CREATE_CUSTOMER = 'Create customer'
const SAVE_DRAFT = 'Save draft'
const START_QUOTE = 'Start quote'
const ADD_LOCATION = 'Add location'
const ADD_TASK = 'Add task'
const CREATED_BANNER_MS = 6000
const START_QUOTE_REQUEST = /\b(?:start|begin|new|create)\s+(?:a\s+)?quote\b/i

export type CreateCustomerSavedState = {
  draft: CreateCustomerDraft
  messages: DraftThreadMessage[]
  sentFiles?: StagedFile[]
}

type ProducerRequest = { producer: string; fields: string[]; at: Date }

type CreateCustomerPanelProps = {
  initialState?: CreateCustomerSavedState | null
  history: CreatedCustomerEntry[]
  createdCustomers: CustomerRecord[]
  pageContext?: AddTaskPageContext
  onClose: () => void
  onSaveDraft: (state: CreateCustomerSavedState) => void
  onCreate: (customer: CustomerRecord) => void
  /** Details added from the record view after Create. */
  onUpdate: (customer: CustomerRecord) => void
  onStartQuote: (prefill: Partial<QuoteWizardFormData>) => void
  /** Leaves the drawer for New task; a draft is saved first so it's waiting on return. */
  onOpenTask: (related: AddTaskRelated, draftToKeep: CreateCustomerSavedState | null) => void
  onOpenCustomer: (customerId: string) => void
  /** Opens a sent file in the document viewer; the draft is saved so the drawer can resume afterwards. */
  onOpenDocument?: (file: File, state: CreateCustomerSavedState) => void
}

function locationIndex(field: EditField) {
  return field.startsWith('location:') ? Number(field.slice('location:'.length)) : null
}

/** Required to create; missing ones show as pink blockers. Keep in sync with `canCreate`. */
const BLOCKING_FIELDS: readonly EditField[] = ['type', 'legalName', 'address']

function capturedValue(draft: CreateCustomerDraft, field: CapturedField): string | null {
  switch (field) {
    case 'legalName':
      return draft.legalName || null
    case 'phone':
      return draft.phone
    case 'email':
      return draft.email
    case 'address':
      return draft.address ? formatAddress(draft.address) : null
    case 'taxId':
      return draft.taxId ? formatTaxId(draft.taxId) : null
    case 'naics':
      return draft.naics ? naicsLabel(draft.naics) : null
    case 'related':
      return draft.related ? customerRelatedValue(draft.related) : null
  }
}

export function CreateCustomerPanel({
  initialState,
  history,
  createdCustomers,
  pageContext,
  onClose,
  onSaveDraft,
  onCreate,
  onUpdate,
  onStartQuote,
  onOpenTask,
  onOpenCustomer,
  onOpenDocument,
}: CreateCustomerPanelProps) {
  const [tab, setTab] = useState<DraftTab>('new')
  const [knownOpen, setKnownOpen] = useState(false)
  const [draft, setDraft] = useState<CreateCustomerDraft>(initialState?.draft ?? emptyCreateCustomerDraft)
  const [messages, setMessages] = useState<DraftThreadMessage[]>(initialState?.messages ?? [])
  const [composerValue, setComposerValue] = useState('')
  const [composerKey, setComposerKey] = useState(0)
  const [editing, setEditing] = useState<EditField | null>(null)
  const [pickingParent, setPickingParent] = useState(false)
  const [readingFiles, setReadingFiles] = useState<string[]>([])
  const [sentFiles, setSentFiles] = useState<StagedFile[]>(initialState?.sentFiles ?? [])
  const [producerRequest, setProducerRequest] = useState<ProducerRequest | null>(null)
  const [record, setRecord] = useState<CustomerRecord | null>(null)
  const [createdBannerOpen, setCreatedBannerOpen] = useState(false)
  // True only right after Create, so the entrance plays once — not on every revisit of the record.
  const [recordIntro, setRecordIntro] = useState(false)

  useEffect(() => {
    if (!createdBannerOpen) return
    const timer = window.setTimeout(() => setCreatedBannerOpen(false), CREATED_BANNER_MS)
    return () => window.clearTimeout(timer)
  }, [createdBannerOpen])

  useEffect(() => {
    if (!recordIntro) return
    const timer = window.setTimeout(() => setRecordIntro(false), 1500)
    return () => window.clearTimeout(timer)
  }, [recordIntro])
  const [parsedComposerValue, setParsedComposerValue] = useDebouncedValue(composerValue)
  // Bumped on reset so a file that finishes reading after Cancel doesn't repopulate the draft.
  const draftGeneration = useRef(0)

  const liveComposerText = parsedComposerValue.trim()
  const previewDraft = useMemo(
    () => mergeCustomerDraft(draft, inferCustomerFromText(liveComposerText, pageContext)),
    [draft, liveComposerText, pageContext],
  )
  // Create / Save read the composer without the debounce so nothing typed is lost.
  const commitDraft = useMemo(
    () => mergeCustomerDraft(draft, inferCustomerFromText(composerValue, pageContext)),
    [composerValue, draft, pageContext],
  )
  const started =
    messages.length > 0 ||
    Boolean(liveComposerText) ||
    Object.entries(draft).some(
      ([key, value]) => key !== 'notes' && key !== 'locations' && value != null && value !== '',
    )
  const lastMessage = messages[messages.length - 1]
  // File names live only on the chips, so the grey line is the typed sentence (if any).
  const headerLine = lastMessage?.text || (readingFiles.length > 0 ? 'Reading…' : undefined)
  const duplicate = previewDraft.legalName ? findDuplicateCustomer(previewDraft.legalName, createdCustomers) : null
  const canCreate = Boolean(commitDraft.type && commitDraft.legalName && commitDraft.address)
  const capturedFields = customerFieldsFor(previewDraft.type)
  const missingFields = capturedFields.filter((field) => capturedValue(previewDraft, field) == null)
  const workFields: WorkField[] = ['type', ...capturedFields]
  const workValue = (field: WorkField) =>
    field === 'type' ? previewDraft.type : capturedValue(previewDraft, field)
  const orderedWorkFields = useFilledFirstOrder(workFields, (field) => workValue(field) != null)

  // Details added on the record view flow back to the created customer (and the grid).
  useEffect(() => {
    if (!record) return
    const rebuilt = buildCustomerFromDraft(draft, [])
    const next: CustomerRecord = {
      ...record,
      email: rebuilt.email,
      contactPhone: rebuilt.contactPhone,
      address: rebuilt.address,
      city: rebuilt.city,
      state: rebuilt.state,
      zip: rebuilt.zip,
    }
    if (JSON.stringify(next) === JSON.stringify(record)) return
    setRecord(next)
    onUpdate(next)
  }, [draft, record, onUpdate])

  const buildFinalDraft = (): CreateCustomerDraft => commitDraft
  const savedState = (): CreateCustomerSavedState => ({ draft: buildFinalDraft(), messages, sentFiles })

  const addMessage = (text: string) => {
    setMessages((current) => [...current, { id: draftUid('user'), text }])
    setDraft((current) => mergeCustomerDraft(current, inferCustomerFromText(text, pageContext)))
  }

  /** A picked or dropped file is read straight into the draft; the composer text stays put. */
  const handleFilesAdded = (added: File[]) => {
    const files = added.map((file) => ({ id: draftUid('file'), file, label: stagedFileLabel(file.name) }))
    if (files.length === 0) return
    setEditing(null)
    setPickingParent(false)
    readFiles(files, '')
  }

  const resetDraft = () => {
    draftGeneration.current += 1
    setDraft(emptyCreateCustomerDraft)
    setMessages([])
    setReadingFiles([])
    setSentFiles([])
    setProducerRequest(null)
    setComposerValue('')
    setParsedComposerValue('')
    setComposerKey((key) => key + 1)
    setEditing(null)
    setPickingParent(false)
    setKnownOpen(false)
  }

  const handleSend = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    setComposerValue('')
    setParsedComposerValue('')
    setEditing(null)
    setPickingParent(false)
    addMessage(text)
  }

  const readFiles = (files: StagedFile[], text: string) => {
    const names = files.map((staged) => staged.file.name)
    const generation = draftGeneration.current
    setSentFiles((current) => [
      ...current.filter((sent) => !names.includes(sent.file.name)),
      ...files,
    ])
    setMessages((current) => [...current, { id: draftUid('user'), text, files: names }])
    setReadingFiles(names)
    void Promise.all(files.map((staged) => extractCustomerFromFile(staged.file, pageContext))).then((results) => {
      if (generation !== draftGeneration.current) return
      setReadingFiles([])
      setSentFiles((current) =>
        current.map((sent) => {
          const index = files.findIndex((staged) => staged.id === sent.id)
          return index < 0 ? sent : { ...sent, inferred: results[index]!.inferred }
        }),
      )
      // Typed text in the same send is merged last so it wins over the documents.
      const inferred = [...results.map((result) => result.inferred), inferCustomerFromText(text, pageContext)]
      setDraft((current) => inferred.reduce<CreateCustomerDraft>(mergeCustomerDraft, current))
    })
  }

  const requestFromProducer = (producer: string) => {
    setProducerRequest({ producer, fields: missingFields.map((field) => FIELD_LABELS[field]), at: new Date() })
  }

  const applyEdit = (field: EditField, value: string) => {
    setEditing(null)
    if (field === 'producer') {
      const producer = CUSTOMER_RELATED_BY_NAME.get(value)
      if (!producer) return
      setDraft((current) => (current.related ? current : { ...current, related: producer }))
      requestFromProducer(producer.name)
      return
    }
    const index = locationIndex(field)
    setDraft((current) => {
      if (field === 'newLocation' || index != null) {
        const address = value.trim() ? parseCustomerField('address', value) : null
        const locations = [...current.locations]
        if (index == null) {
          if (address) locations.push(address)
        } else if (address) {
          locations[index] = address
        } else {
          locations.splice(index, 1)
        }
        return { ...current, locations }
      }
      switch (field) {
        case 'type':
          return normalizeCustomerDraft({
            ...current,
            type: CUSTOMER_TYPES.find((type) => type === value) ?? current.type,
          })
        case 'role':
          return { ...current, role: CUSTOMER_ROLES.find((role) => role === value) ?? current.role }
        case 'legalName':
          return { ...current, legalName: value }
        case 'dba':
          return { ...current, dba: value }
        case 'phone':
        case 'email':
        case 'address':
        case 'taxId':
          return { ...current, [field]: parseCustomerField(field, value) }
        case 'naics':
          return { ...current, naics: naicsFromLabel(value) ?? current.naics }
        case 'related': {
          const related = CUSTOMER_RELATED_BY_NAME.get(value)
          if (!related) return current
          return { ...current, related, role: related.kind === 'Customer' ? 'Subsidiary' : current.role }
        }
      }
      return current
    })
  }

  const pickParent = (name: string) => {
    const parent = CUSTOMER_RELATED_BY_NAME.get(name)
    setPickingParent(false)
    if (parent) setDraft((current) => ({ ...current, related: parent, role: 'Subsidiary' }))
  }

  const capturedRow = (field: CapturedField): DraftNeededRow<EditField> => ({
    term: FIELD_LABELS[field],
    value: capturedValue(previewDraft, field),
    hint: FIELD_HINTS[field],
    field,
  })

  const pendingRows: DraftNeededRow<EditField>[] = [
    ...(editing === 'newLocation'
      ? [{ term: `Location ${previewDraft.locations.length + 2}`, value: null, field: 'newLocation' as const }]
      : []),
    ...(editing === 'producer' ? [{ term: 'Producer', value: null, field: 'producer' as const }] : []),
  ]
  const duplicateRow: DraftNeededRow<EditField>[] = duplicate
    ? [{ term: 'Possible duplicate', value: `${duplicate.customerNumber} · ${duplicate.name} already exists`, tone: 'warning' }]
    : []
  const withIssueTone = (row: DraftNeededRow<EditField>): DraftNeededRow<EditField> =>
    row.tone || row.value != null
      ? row
      : { ...row, tone: row.field && BLOCKING_FIELDS.includes(row.field) ? 'error' : 'warning' }
  const isIndividual = previewDraft.type === 'Individual'
  const locationRows: DraftNeededRow<EditField>[] = previewDraft.locations.map((location, index) => ({
    term: `Location ${index + 2}`,
    value: formatAddress(location),
    field: `location:${index}` as const,
  }))

  const workRow = (field: WorkField): DraftNeededRow<EditField> =>
    field === 'type'
      ? { term: 'Type', value: previewDraft.type, hint: FIELD_HINTS.type, field: 'type' }
      : capturedRow(field)

  const workRows: DraftNeededRow<EditField>[] = [
    ...orderedWorkFields.map(workRow),
    ...pendingRows,
    ...duplicateRow,
  ].map(withIssueTone)

  const reviewRows: DraftNeededRow<EditField>[] = [
    { term: 'Type', value: previewDraft.type, hint: FIELD_HINTS.type, field: 'type' },
    capturedRow('legalName'),
    ...(isIndividual ? [] : [{ term: 'DBA', value: previewDraft.dba, field: 'dba' as const }]),
    { term: 'Role', value: previewDraft.role, hint: FIELD_HINTS.role, field: 'role' },
    capturedRow('phone'),
    capturedRow('email'),
    capturedRow('address'),
    ...locationRows,
    ...(isIndividual ? [] : [capturedRow('taxId'), capturedRow('naics')]),
    capturedRow('related'),
    ...(previewDraft.notes ? [{ term: 'Notes', value: previewDraft.notes }] : []),
    ...pendingRows,
    ...duplicateRow,
  ].map(withIssueTone)

  const textEditor = (
    field: EditField,
    initialValue: string,
    label: string,
    type: 'text' | 'tel' | 'email' = 'text',
  ) => (
    <DraftInlineTextEdit
      initialValue={initialValue}
      label={label}
      type={type}
      onCommit={(value) => applyEdit(field, value)}
      onDismiss={() => setEditing(null)}
    />
  )

  const lookup = (
    field: EditField,
    options: string[],
    placeholder: string,
    optionSubtitle?: (option: string) => string | undefined,
  ) => (
    <DraftInlineLookup
      options={options}
      optionSubtitle={optionSubtitle}
      placeholder={placeholder}
      onPick={(value) => applyEdit(field, value)}
      onDismiss={() => setEditing(null)}
    />
  )

  const renderEditor = (field: EditField) => {
    const index = locationIndex(field)
    if (index != null) {
      const location = previewDraft.locations[index]
      return textEditor(field, location ? formatAddress(location) : '', 'Location address')
    }
    switch (field) {
      case 'type':
        return (
          <DraftInlineOptions
            options={CUSTOMER_TYPES}
            selected={previewDraft.type}
            onPick={(value) => applyEdit('type', value)}
          />
        )
      case 'role':
        return (
          <DraftInlineOptions
            options={[...CUSTOMER_ROLES]}
            selected={previewDraft.role}
            onPick={(value) => applyEdit('role', value)}
          />
        )
      case 'legalName':
        return textEditor('legalName', previewDraft.legalName, 'Legal name')
      case 'dba':
        return textEditor('dba', previewDraft.dba ?? '', 'Doing business as')
      case 'phone':
        return textEditor('phone', previewDraft.phone ?? '', 'Phone', 'tel')
      case 'email':
        return textEditor('email', previewDraft.email ?? '', 'Email', 'email')
      case 'address':
        return (
          <CustomerAddressEditor
            value={previewDraft.address}
            onSelect={(address) => setDraft((current) => ({ ...current, address }))}
            onDone={() => setEditing(null)}
            onDismiss={() => setEditing(null)}
          />
        )
      case 'newLocation':
        return textEditor('newLocation', '', 'Location address')
      case 'taxId':
        return textEditor('taxId', previewDraft.taxId ?? '', 'EIN')
      case 'naics':
        return lookup('naics', NAICS_OPTIONS, 'Search NAICS code or industry', naicsSubtitle)
      case 'related':
        return lookup('related', CUSTOMER_RELATED_OPTIONS, 'Search producers or parent customers', customerRelatedSubtitle)
      case 'producer':
        return lookup(
          'producer',
          PRODUCER_OPTIONS,
          'Which producer should supply the missing details?',
          customerRelatedSubtitle,
        )
    }
    return null
  }

  const handleCreate = () => {
    const finalDraft = buildFinalDraft()
    if (!finalDraft.type || !finalDraft.legalName || !finalDraft.address) return null
    const customer = buildCustomerFromDraft(finalDraft, createdCustomers)
    onCreate(customer)
    setDraft(finalDraft)
    setComposerValue('')
    setParsedComposerValue('')
    setEditing(null)
    setRecord(customer)
    setCreatedBannerOpen(true)
    setRecordIntro(true)
    return { customer, finalDraft }
  }

  const handleWorkAction = (action: string) => {
    switch (action) {
      case REQUEST_FROM_PRODUCER:
        if (previewDraft.related?.kind === 'Producer') requestFromProducer(previewDraft.related.name)
        else setEditing('producer')
        return
      case CREATE_TASK: {
        const name = previewDraft.legalName || 'New customer'
        onOpenTask(findRelated('Customer', name, [name]), savedState())
        return
      }
      case REVIEW_ALL:
        setKnownOpen(true)
        return
      case CREATE_CUSTOMER:
        handleCreate()
        return
      case SAVE_DRAFT:
        onSaveDraft(savedState())
        return
      case START_QUOTE: {
        const created = handleCreate()
        if (created) onStartQuote(buildQuotePrefillFromDraft(created.finalDraft, created.customer.customerNumber))
      }
    }
  }

  const hasHoles = workRows.some((row) => row.value == null || row.tone)
  const producerCanFill =
    previewDraft.related?.kind === 'Producer' ||
    missingFields.some((field) => field === 'address' || field === 'taxId' || field === 'naics')
  const workActions = [
    ...(canCreate ? [CREATE_CUSTOMER] : []),
    ...(hasHoles
      ? [...(producerCanFill ? [REQUEST_FROM_PRODUCER] : []), CREATE_TASK, ...(knownOpen ? [] : [REVIEW_ALL])]
      : [...(knownOpen ? [] : [REVIEW_ALL]), ...(canCreate ? [START_QUOTE] : [])]),
    SAVE_DRAFT,
  ]
  // Known facts: everything filled in (incl. DBA, role, locations, notes). Needs attention: the work list's open items.
  const knownRows = splitDraftRows(reviewRows).known
  const { attention: attentionRows, considerations: considerationRows } = splitDraftRows(workRows)

  const handleRecordAction = (action: string, recordDraft = draft) => {
    if (!record) return
    setCreatedBannerOpen(false)
    if (action === START_QUOTE) onStartQuote(buildQuotePrefillFromDraft(recordDraft, record.customerNumber))
    else if (action === ADD_LOCATION) setEditing('newLocation')
    else if (action === ADD_TASK) onOpenTask(findRelated('Customer', record.customerNumber, [record.name]), null)
  }

  /** Record composer: same field parse as the draft, but the saved name and type don't change. */
  const handleRecordSend = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    setComposerValue('')
    setParsedComposerValue('')
    setEditing(null)
    setCreatedBannerOpen(false)
    const next = {
      ...mergeCustomerDraft(draft, inferCustomerFromText(text, pageContext)),
      type: draft.type,
      legalName: draft.legalName,
    }
    setDraft(next)
    if (START_QUOTE_REQUEST.test(text)) handleRecordAction(START_QUOTE, next)
  }

  const toggleEditing = (field: EditField) => {
    if (record) setCreatedBannerOpen(false)
    setEditing((current) => (current === field ? null : field))
  }

  const startAnotherCustomer = () => {
    setRecord(null)
    setCreatedBannerOpen(false)
    resetDraft()
    setTab('new')
  }

  const historyList = (
    <DraftHistoryList
      entries={history.map(({ customer, createdAt }) => ({
        id: customer.id,
        title: customer.name,
        subtitle: [customer.customerNumber, formatDraftCreatedTime(createdAt)].join(' · '),
      }))}
      emptyText="Customers you create this session show up here."
      onOpen={onOpenCustomer}
    />
  )

  if (record) {
    const recordFacts: DraftNeededRow<EditField>[] = [
      { term: 'Type', value: draft.type },
      { term: 'Legal name', value: draft.legalName || null },
      { term: 'DBA', value: draft.dba },
      { term: 'Role', value: draft.role },
      { term: 'Phone', value: draft.phone },
      { term: 'Email', value: draft.email },
      { term: 'Address', value: draft.address ? formatAddress(draft.address) : null },
      ...draft.locations.map((location, index) => ({ term: `Location ${index + 2}`, value: formatAddress(location) })),
      { term: 'Tax ID', value: draft.taxId ? formatTaxId(draft.taxId) : null },
      { term: 'NAICS', value: draft.naics ? naicsLabel(draft.naics) : null },
      { term: 'Related', value: draft.related ? customerRelatedValue(draft.related) : null },
      { term: 'Notes', value: draft.notes || null },
    ].filter((fact) => fact.value != null)
    const recordPendingRows: DraftNeededRow<EditField>[] =
      editing === 'newLocation'
        ? [{ term: `Location ${draft.locations.length + 2}`, value: null, field: 'newLocation' }]
        : []
    const recordOptionalFields: ('phone' | 'email' | 'taxId')[] =
      draft.type === 'Individual' ? ['phone', 'email'] : ['phone', 'email', 'taxId']
    const recordMissingRows: DraftNeededRow<EditField>[] = recordOptionalFields
      .filter((field) => capturedValue(draft, field) == null)
      .map((field) => ({ term: FIELD_LABELS[field], value: null, hint: FIELD_HINTS[field], field, tone: 'warning' }))
    return (
      <DraftDrawerShell
        variant="record"
        heading="Create customer"
        closeLabel="Close create customer drawer"
        tab={tab}
        onTabChange={setTab}
        onNewTabClick={startAnotherCustomer}
        onClose={onClose}
        history={historyList}
        composer={
          <CopilotComposer
            key={composerKey}
            placeholder="Add details or start a quote…"
            value={composerValue}
            onChange={setComposerValue}
            minRows={1}
            showModeSelector={false}
            showDisclaimer={false}
            enableAttachments={false}
            onSubmit={handleRecordSend}
          />
        }
      >
        <DraftHeader
          title={record.name}
          request={
            <Link
              component={RouterLink}
              to={customerDetailsPath(record.customerNumber)}
              underline="hover"
              color="primary"
            >
              {record.customerNumber}
            </Link>
          }
          backLabel="Start another customer"
          onBack={startAnotherCustomer}
        />
        <Collapse in={createdBannerOpen} timeout={entranceMotion.enterMs} unmountOnExit>
          <InfoBanner
            onDismiss={() => setCreatedBannerOpen(false)}
            sx={[{ mb: 1.5 }, recordIntro ? fadeSlideDownSx() : {}]}
          >
            Customer created.
          </InfoBanner>
        </Collapse>
        <DraftAccordions
          known={recordFacts}
          attention={recordPendingRows}
          considerations={recordMissingRows}
          editingField={editing}
          onToggle={toggleEditing}
          renderEditor={renderEditor}
        />
        <CopilotQuickActions
          label="Suggested actions"
          actions={[START_QUOTE, ADD_LOCATION, ADD_TASK]}
          onAction={(action) => handleRecordAction(action)}
        />
      </DraftDrawerShell>
    )
  }

  return (
    <DraftDrawerShell
      heading="Create customer"
      closeLabel="Close create customer drawer"
      tab={tab}
      onTabChange={setTab}
      onClose={onClose}
      history={historyList}
      composer={
        <CopilotComposer
          key={composerKey}
          placeholder="Describe the customer…"
          value={composerValue}
          onChange={setComposerValue}
          minRows={1}
          showModeSelector={false}
          showDisclaimer={false}
          onSubmit={(text) => handleSend(text)}
          onFilesAdded={handleFilesAdded}
        />
      }
    >
      {!started ? (
        <>
          <DraftWelcome
            title="Who’s the customer?"
            body="Describe them, or drop an ACORD / broker email / PDF / vCard."
          />
          <Divider sx={{ mb: 2 }} />
          <CopilotQuickActions
            label="Suggested actions"
            actions={[...CREATE_CUSTOMER_TYPE_SEEDS, UNDER_EXISTING_CUSTOMER_SEED]}
            onAction={(action) => {
              if (action === UNDER_EXISTING_CUSTOMER_SEED) {
                setPickingParent(true)
                return
              }
              const type = CREATE_CUSTOMER_TYPE_SEEDS.find((seed) => seed === action)
              if (type) setDraft((current) => normalizeCustomerDraft({ ...current, type }))
            }}
          />
          {pickingParent ? (
            <DraftInlineLookup
              options={PARENT_CUSTOMER_OPTIONS}
              optionSubtitle={customerRelatedSubtitle}
              placeholder="Search the parent customer"
              onPick={pickParent}
              onDismiss={() => setPickingParent(false)}
            />
          ) : null}
        </>
      ) : (
        <>
          <DraftHeader
            title={previewDraft.legalName || 'New customer'}
            request={headerLine}
            backLabel="Cancel customer"
            onBack={resetDraft}
          />
          <DraftAccordions
            known={knownRows}
            attention={attentionRows}
            considerations={considerationRows}
            editingField={editing}
            onToggle={toggleEditing}
            renderEditor={renderEditor}
            knownOpen={knownOpen}
            onKnownOpenChange={setKnownOpen}
            onGroupToggle={() => setEditing(null)}
          />
          {producerRequest ? (
            <Typography variant="body2" color="text.secondary" sx={{ ...draftBodySx, mb: 2 }}>
              {producerRequest.fields.length > 0
                ? `Requested ${producerRequest.fields.join(', ')} from ${producerRequest.producer}`
                : `Asked ${producerRequest.producer} to confirm the details`}
              {` · ${formatDraftCreatedTime(producerRequest.at)}`}
            </Typography>
          ) : null}
          <CopilotQuickActions
            label="Suggested actions"
            actions={workActions}
            onAction={handleWorkAction}
          />
          <DraftDocumentChips
            files={sentFiles.map((sent) => ({ id: sent.id, label: sent.file.name }))}
            onOpen={(id) => {
              const sent = sentFiles.find((file) => file.id === id)
              if (sent) onOpenDocument?.(sent.file, savedState())
            }}
          />
        </>
      )}
    </DraftDrawerShell>
  )
}
