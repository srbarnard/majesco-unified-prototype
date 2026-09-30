import Divider from '@mui/material/Divider'
import { useMemo, useState } from 'react'
import { CopilotQuickActions } from '@/design-system/components'
import type { CreatedCustomerEntry } from '@/app/contexts/CustomersContext'
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
  draftUid,
  formatDraftCreatedTime,
  useDebouncedValue,
  type DraftNeededRow,
  type DraftTab,
  type DraftThreadMessage,
} from '@/pages/shared/components/DraftDrawer'
import {
  CREATE_CUSTOMER_SEEDS,
  CUSTOMER_ROLES,
  CUSTOMER_TYPES,
  NAICS_OPTIONS,
  buildCustomerFromDraft,
  emptyCreateCustomerDraft,
  findDuplicateCustomer,
  formatAddress,
  formatTaxId,
  inferCustomerFromText,
  mergeCustomerDraft,
  naicsFromLabel,
  naicsLabel,
  parseCustomerField,
  type CreateCustomerDraft,
} from '@/pages/customers/data/createCustomerDraft'
import type { CustomerRecord } from '@/pages/customers/data/mockCustomers'
import {
  RELATED_BY_LABEL,
  RELATED_OPTIONS,
  relatedLabel,
  relatedSearchText,
  type AddTaskPageContext,
} from '@/pages/tasks/data/addTaskDraft'

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

const CANCEL_ACTION = 'Cancel customer'

export type CreateCustomerSavedState = {
  draft: CreateCustomerDraft
  messages: DraftThreadMessage[]
}

type CreateCustomerPanelProps = {
  initialState?: CreateCustomerSavedState | null
  initialTab?: DraftTab
  history: CreatedCustomerEntry[]
  createdCustomers: CustomerRecord[]
  pageContext?: AddTaskPageContext
  onClose: () => void
  onSaveDraft: (state: CreateCustomerSavedState) => void
  onCreate: (customer: CustomerRecord) => void
  onOpenCustomer: (customerId: string) => void
}

export function CreateCustomerPanel({
  initialState,
  initialTab = 'new',
  history,
  createdCustomers,
  pageContext,
  onClose,
  onSaveDraft,
  onCreate,
  onOpenCustomer,
}: CreateCustomerPanelProps) {
  const [tab, setTab] = useState<DraftTab>(initialTab)
  const [draft, setDraft] = useState<CreateCustomerDraft>(initialState?.draft ?? emptyCreateCustomerDraft)
  const [messages, setMessages] = useState<DraftThreadMessage[]>(initialState?.messages ?? [])
  const [composerValue, setComposerValue] = useState('')
  const [composerKey, setComposerKey] = useState(0)
  const [editing, setEditing] = useState<EditField | null>(null)
  const [parsedComposerValue, setParsedComposerValue] = useDebouncedValue(composerValue)

  const infer = (text: string) => inferCustomerFromText(text, pageContext)
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
  const draftHasContent = Object.entries(draft).some(([key, value]) => key !== 'notes' && value != null && value !== '')
  const showNeeded = messages.length > 0 || draftHasContent || Boolean(liveComposerText)
  const originalRequest = messages.find((message) => message.text)?.text ?? ''
  const duplicate = previewDraft.legalName ? findDuplicateCustomer(previewDraft.legalName, createdCustomers) : null
  const canCreate = Boolean(commitDraft.type && commitDraft.legalName)

  const addMessage = (text: string) => {
    setMessages((current) => [...current, { id: draftUid('user'), text }])
    setDraft((current) => ({
      ...mergeCustomerDraft(current, infer(text)),
      notes: current.notes ? `${current.notes}\n${text}` : text,
    }))
  }

  const resetDraft = () => {
    setDraft(emptyCreateCustomerDraft)
    setMessages([])
    setComposerValue('')
    setParsedComposerValue('')
    setComposerKey((key) => key + 1)
    setEditing(null)
  }

  const handleSend = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    setComposerValue('')
    setParsedComposerValue('')
    setEditing(null)
    addMessage(text)
  }

  const applyEdit = (field: EditField, value: string) => {
    setEditing(null)
    setDraft((current) => {
      switch (field) {
        case 'type':
          return { ...current, type: CUSTOMER_TYPES.find((type) => type === value) ?? current.type }
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
        case 'related':
          return { ...current, related: RELATED_BY_LABEL.get(value) ?? current.related }
      }
    })
  }

  const rows: DraftNeededRow<EditField>[] = [
    { term: 'Type', value: previewDraft.type, field: 'type' },
    { term: 'Legal name', value: previewDraft.legalName || null, field: 'legalName' },
    { term: 'DBA', value: previewDraft.dba, field: 'dba' },
    { term: 'Role', value: previewDraft.role, field: 'role' },
    { term: 'Phone', value: previewDraft.phone, field: 'phone' },
    { term: 'Email', value: previewDraft.email, field: 'email' },
    { term: 'Address', value: previewDraft.address ? formatAddress(previewDraft.address) : null, field: 'address' },
    { term: 'Tax ID', value: previewDraft.taxId ? formatTaxId(previewDraft.taxId) : null, field: 'taxId' },
    { term: 'NAICS', value: previewDraft.naics ? naicsLabel(previewDraft.naics) : null, field: 'naics' },
    { term: 'Related', value: previewDraft.related ? relatedLabel(previewDraft.related) : null, field: 'related' },
  ]
  if (duplicate) {
    rows.push({
      term: 'Possible duplicate',
      value: `${duplicate.customerNumber} · ${duplicate.name} already exists`,
      tone: 'error',
    })
  }

  const textEditor = (field: EditField, initialValue: string, label: string) => (
    <DraftInlineTextEdit
      initialValue={initialValue}
      label={label}
      onCommit={(value) => applyEdit(field, value)}
      onDismiss={() => setEditing(null)}
    />
  )

  const renderEditor = (field: EditField) => {
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
        return textEditor('phone', previewDraft.phone ?? '', 'Phone')
      case 'email':
        return textEditor('email', previewDraft.email ?? '', 'Email')
      case 'address':
        return textEditor('address', previewDraft.address ? formatAddress(previewDraft.address) : '', 'Address')
      case 'taxId':
        return textEditor('taxId', previewDraft.taxId ?? '', 'Tax ID (EIN or SSN)')
      case 'naics':
        return (
          <DraftInlineLookup
            options={NAICS_OPTIONS}
            placeholder="Search NAICS code or industry"
            onPick={(value) => applyEdit('naics', value)}
            onDismiss={() => setEditing(null)}
          />
        )
      case 'related':
        return (
          <DraftInlineLookup
            options={RELATED_OPTIONS}
            placeholder="Search policies, quotes, submissions, customers"
            searchText={relatedSearchText}
            onPick={(value) => applyEdit('related', value)}
            onDismiss={() => setEditing(null)}
          />
        )
    }
  }

  const buildFinalDraft = (): CreateCustomerDraft => ({
    ...commitDraft,
    notes: [commitDraft.notes, composerValue.trim()].filter(Boolean).join('\n'),
  })

  const handleCreate = () => {
    const finalDraft = buildFinalDraft()
    if (!finalDraft.type || !finalDraft.legalName) return
    onCreate(buildCustomerFromDraft(finalDraft, createdCustomers))
  }

  return (
    <DraftDrawerShell
      heading="Create customer"
      closeLabel="Close create customer drawer"
      tab={tab}
      onTabChange={setTab}
      onClose={onClose}
      createLabel="Create customer"
      createDisabled={!canCreate}
      onCreate={handleCreate}
      onSaveDraft={() => onSaveDraft({ draft: buildFinalDraft(), messages })}
      history={
        <DraftHistoryList
          entries={history.map(({ customer, createdAt }) => ({
            id: customer.id,
            title: customer.name,
            subtitle: [customer.customerNumber, formatDraftCreatedTime(createdAt)].join(' · '),
          }))}
          emptyText="Customers you create this session show up here."
          onOpen={onOpenCustomer}
        />
      }
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
        />
      }
    >
      {!showNeeded ? (
        <>
          <DraftWelcome
            title="Who’s the customer?"
            body="Describe them in the composer — name, contact details, tax ID, industry. Copilot fills in the fields; Create unlocks once type and legal name are set."
          />
          <Divider sx={{ mb: 2 }} />
          <CopilotQuickActions
            label="Suggested actions"
            actions={CREATE_CUSTOMER_SEEDS.map((seed) => seed.label)}
            onAction={(label) => {
              const seed = CREATE_CUSTOMER_SEEDS.find((item) => item.label === label)
              if (seed) addMessage(seed.prefill)
            }}
          />
        </>
      ) : (
        <>
          <DraftHeader
            title={previewDraft.legalName || 'Unnamed customer'}
            request={originalRequest}
            backLabel="Cancel customer"
            onBack={resetDraft}
          />
          <DraftNeededList
            rows={rows}
            editingField={editing}
            onToggle={(field) => setEditing((current) => (current === field ? null : field))}
            renderEditor={renderEditor}
          />
          <CopilotQuickActions
            label="Suggested actions"
            actions={[CANCEL_ACTION]}
            onAction={(action) => {
              if (action === CANCEL_ACTION) resetDraft()
            }}
          />
        </>
      )}
    </DraftDrawerShell>
  )
}
