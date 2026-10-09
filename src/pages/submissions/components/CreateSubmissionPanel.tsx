import Box from '@mui/material/Box'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import type { Theme } from '@mui/material/styles'
import { useState } from 'react'
import { Button as DsButton, CopilotQuickActions } from '@/design-system/components'
import { getFigmaColors } from '@/design-system/tokens/figma-colors'
import { fadeSlideDownSx } from '@/design-system/tokens/motion'
import type { CustomerAddress } from '@/pages/customers/data/createCustomerDraft'
import { CopilotComposer } from '@/pages/policies/components/CopilotComposer'
import { QuoteLocationEditor } from '@/pages/quotes/components/QuoteLocationEditor'
import {
  isAddressComplete,
  locationSummary,
  locationsCountSummary,
  parseQuoteAddress,
  quoteLocationId,
  type QuoteLocationType,
} from '@/pages/quotes/data/createQuoteDraft'
import {
  DraftAccordions,
  DraftDocumentChips,
  DraftDrawerShell,
  DraftHeader,
  DraftHistoryList,
  DraftInlineLookup,
  DraftInlineTextEdit,
  DraftNeededList,
  draftBodySx,
  splitDraftRows,
  type DraftHistoryItem,
  type DraftNeededRow,
  type DraftTab,
} from '@/pages/shared/components/DraftDrawer'
import {
  SUBMISSION_CLASS_OPTIONS,
  applySubmissionDocuments,
  applySubmissionText,
  emptySubmissionDraft,
  formatMoney,
  intakeRows,
  submissionRecordFromDraft,
  type CreateSubmissionDraft,
  type SubmissionIntakeField,
} from '@/pages/submissions/data/createSubmissionDraft'
import { nextSubmissionNumber, upsertSubmissionRecord } from '@/pages/submissions/data/mockSubmissions'

export type CreateSubmissionSavedState = {
  draft: CreateSubmissionDraft
  created: { id: string; submissionNumber: string; submittedAt: string } | null
}

type TextField = Exclude<SubmissionIntakeField, 'classCode' | 'locations' | 'documents'>
type LocationRowField = 'newLocation' | `location:${string}`

const CREATE_SUBMISSION = 'Create submission'
const ADD_LOCATION = 'Add location'
const CANCEL = 'Cancel'
const REQUEST_FROM_PRODUCER = 'Request from producer'
const SAVE_DRAFT = 'Save draft'
const ADD_NOTE = 'Add note'
const START_ANOTHER = 'Start another submission'
const ASSIGNED_TO = 'Underwriting Queue'

const TEXT_EDIT: Record<TextField, { placeholder: string; inputMode?: 'decimal' }> = {
  account: { placeholder: 'e.g. Harborline Freight Co.' },
  payroll: { placeholder: 'e.g. $1,240,000', inputMode: 'decimal' },
  employees: { placeholder: 'e.g. 48', inputMode: 'decimal' },
  lossHistory: { placeholder: 'e.g. 3 years · 2 claims, 1 open' },
}

const linkSx = (theme: Theme) => ({
  ...draftBodySx,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  px: 1,
  py: 0.5,
  borderRadius: 1.5,
  transition: 'background-color 0.15s ease, color 0.15s ease',
  '&:hover': { bgcolor: getFigmaColors(theme.palette.mode).primary.hover, color: 'primary.main' },
  '&:active': { bgcolor: getFigmaColors(theme.palette.mode).primary.selected },
})

function localTimestamp(date = new Date()) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 19)
}

function normalizeValue(field: TextField, value: string) {
  if (field === 'payroll' && /^\$?\s*[\d,.]+\s*(k|m|mm|million)?$/i.test(value)) return formatMoney(value)
  if (field === 'employees' && /^\d[\d,]*$/.test(value)) return `${value.replace(/,/g, '')} employees`
  return value
}

export function CreateSubmissionPanel({
  initialState,
  history,
  onOpenHistory,
  onStartOver,
  onClose,
  onSaveDraft,
  onAddNote,
  onOpenDocument,
  onEmailMissingInfo,
}: {
  initialState: CreateSubmissionSavedState | null
  history: DraftHistoryItem[]
  onOpenHistory: (id: string) => void
  onStartOver: () => void
  onClose: () => void
  onSaveDraft: (state: CreateSubmissionSavedState) => void
  onAddNote: (state: CreateSubmissionSavedState) => void
  onOpenDocument: (fileName: string, state: CreateSubmissionSavedState) => void
  onEmailMissingInfo: (email: { subject: string; body: string }, state: CreateSubmissionSavedState) => void
}) {
  const [draft, setDraft] = useState<CreateSubmissionDraft>(initialState?.draft ?? emptySubmissionDraft)
  const [created, setCreated] = useState(initialState?.created ?? null)
  const [justCreated, setJustCreated] = useState(false)
  const [editing, setEditing] = useState<SubmissionIntakeField | null>(null)
  const [level, setLevel] = useState<'intake' | 'locations'>('intake')
  const [editingLocation, setEditingLocation] = useState<LocationRowField | null>(null)
  const [tab, setTab] = useState<DraftTab>('new')
  const [composerValue, setComposerValue] = useState('')
  const [attachRequest, setAttachRequest] = useState(0)

  const state = (): CreateSubmissionSavedState => ({ draft, created })

  const recordFor = (next: CreateSubmissionDraft, createdAs: NonNullable<typeof created>) =>
    submissionRecordFromDraft(next, {
      id: createdAs.id,
      submissionNumber: createdAs.submissionNumber,
      assignedTo: ASSIGNED_TO,
      submittedAt: createdAs.submittedAt,
      notes: [],
    })

  /** Every change lands on the draft; once created, the Submissions row follows it. */
  const update = (next: CreateSubmissionDraft) => {
    setDraft(next)
    if (created) upsertSubmissionRecord(recordFor(next, created))
  }

  const setField = (field: SubmissionIntakeField, value: string) => {
    setEditing(null)
    update({ ...draft, [field]: value })
  }

  const rows = intakeRows(draft)
  const blockers = rows.filter((row) => row.state === 'blocker')
  const needed: DraftNeededRow<SubmissionIntakeField>[] = rows.map((row) => ({
    term: row.term,
    value: row.value,
    hint: row.hint || undefined,
    tone: row.state === 'blocker' ? 'error' : row.state === 'warning' ? 'warning' : undefined,
    meta: row.state === 'warning' && row.value ? row.hint : undefined,
    field: row.field,
    chevron: row.field === 'locations' || undefined,
  }))

  const saveLocation = (field: LocationRowField, next: { address: CustomerAddress; type: QuoteLocationType | null }) => {
    setEditingLocation(null)
    const locations =
      field === 'newLocation'
        ? [...draft.locations, { id: quoteLocationId(), ...next }]
        : draft.locations.map((location) => (`location:${location.id}` === field ? { ...location, ...next } : location))
    update({ ...draft, locations })
  }

  const locationRows: DraftNeededRow<LocationRowField>[] = [
    ...draft.locations.map((location) => {
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
    <QuoteLocationEditor
      initial={field === 'newLocation' ? null : (draft.locations.find((location) => `location:${location.id}` === field) ?? null)}
      onSave={(next) => saveLocation(field, next)}
      onCancel={() => setEditingLocation(null)}
    />
  )
  const { known, attention, considerations } = splitDraftRows(needed)

  const startOver = () => {
    onStartOver()
    setDraft(emptySubmissionDraft())
    setCreated(null)
    setJustCreated(false)
    setEditing(null)
    setLevel('intake')
    setEditingLocation(null)
    setComposerValue('')
  }

  const createSubmission = () => {
    const submissionNumber = nextSubmissionNumber()
    const next = { id: submissionNumber.toLowerCase(), submissionNumber, submittedAt: localTimestamp() }
    upsertSubmissionRecord(recordFor(draft, next))
    setCreated(next)
    setJustCreated(true)
    setEditing(null)
  }

  const requestFromProducer = () => {
    const account = draft.account ?? 'the new submission'
    const missing = blockers.map((row) => `- ${row.term}: ${row.hint}`).join('\n')
    onEmailMissingInfo(
      {
        subject: `Missing information for ${account}`,
        body: `Hi,\n\nTo quote ${account}, we still need:\n\n${missing}\n\nThank you.`,
      },
      state(),
    )
  }

  const handleAction = (action: string) => {
    if (action === CREATE_SUBMISSION) createSubmission()
    else if (action === CANCEL) {
      startOver()
      onClose()
    } else if (action === REQUEST_FROM_PRODUCER) requestFromProducer()
    else if (action === SAVE_DRAFT) onSaveDraft(state())
    else if (action === ADD_NOTE) onAddNote(state())
    else if (action === START_ANOTHER) startOver()
  }

  const toggleRow = (field: SubmissionIntakeField) => {
    if (field === 'documents') {
      setEditing(null)
      setAttachRequest((current) => current + 1)
      return
    }
    if (field === 'locations') {
      setEditing(null)
      setEditingLocation(null)
      setLevel('locations')
      return
    }
    setEditing((current) => (current === field ? null : field))
  }

  const renderEditor = (field: SubmissionIntakeField) => {
    if (field === 'documents' || field === 'locations') return null
    if (field === 'classCode') {
      return (
        <DraftInlineLookup
          options={SUBMISSION_CLASS_OPTIONS}
          placeholder="Search class codes"
          onPick={(option) => setField('classCode', option)}
          onDismiss={() => setEditing(null)}
        />
      )
    }
    const config = TEXT_EDIT[field]
    const row = rows.find((entry) => entry.field === field)
    return (
      <DraftInlineTextEdit
        initialValue={draft[field] ?? ''}
        label={row?.term ?? ''}
        placeholder={config.placeholder}
        inputMode={config.inputMode}
        confirmable
        onCommit={(value) => setField(field, normalizeValue(field, value))}
        onDismiss={() => setEditing(null)}
      />
    )
  }

  const status = blockers.length > 0 ? 'Blocked' : 'Ready'
  const headerRequest = created
    ? [justCreated ? 'Created · added to Submissions' : null, created.submissionNumber, status, ASSIGNED_TO]
        .filter(Boolean)
        .join(' · ')
    : blockers.length > 0
      ? `${blockers.length} missing before quoting`
      : 'Ready to quote'

  const actions = [
    ...(blockers.length > 0 ? [REQUEST_FROM_PRODUCER] : []),
    ...(created ? [ADD_NOTE, START_ANOTHER] : [SAVE_DRAFT, ADD_NOTE]),
  ]

  const intakeLevel = (
    <>
      <DraftHeader title={draft.account ?? 'New submission'} request={headerRequest} />
      <Box sx={{ mt: 1.5 }}>
        <DraftAccordions
          known={known}
          attention={attention}
          considerations={considerations}
          editingField={editing}
          onToggle={toggleRow}
          onGroupToggle={() => setEditing(null)}
          renderEditor={renderEditor}
        />
        {!created && draft.account ? (
          <Stack direction="row" alignItems="center" spacing={1} sx={[{ mb: 2 }, fadeSlideDownSx()]}>
            <DsButton size="small" variant="contained" color="primary" onClick={() => handleAction(CREATE_SUBMISSION)}>
              {CREATE_SUBMISSION}
            </DsButton>
            <Link
              component="button"
              type="button"
              underline="none"
              color="text.primary"
              onClick={() => handleAction(CANCEL)}
              sx={linkSx}
            >
              <CancelOutlinedIcon sx={{ fontSize: 16 }} />
              {CANCEL}
            </Link>
          </Stack>
        ) : null}
        <CopilotQuickActions label="Suggested actions" actions={actions} onAction={handleAction} />
      </Box>
      <DraftDocumentChips
        files={draft.documents.map((name) => ({ id: name, label: name }))}
        onOpen={(name) => onOpenDocument(name, state())}
      />
    </>
  )

  const locationsLevel = (
    <>
      <DraftHeader
        title="Locations"
        request={locationsCountSummary(draft.locations)}
        backLabel="Back to submission"
        onBack={() => {
          setEditingLocation(null)
          setLevel('intake')
        }}
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
          actions={created ? [ADD_LOCATION] : [ADD_LOCATION, SAVE_DRAFT]}
          onAction={(action) => (action === SAVE_DRAFT ? onSaveDraft(state()) : setEditingLocation('newLocation'))}
        />
      ) : null}
    </>
  )

  return (
    <DraftDrawerShell
      heading="Create submission"
      closeLabel="Close create submission drawer"
      tab={tab}
      onTabChange={setTab}
      onClose={onClose}
      onNewTabClick={() => {
        if (created) startOver()
      }}
      history={
        <DraftHistoryList
          entries={history}
          emptyText="Submissions you save as drafts show up here."
          onOpen={(id) => {
            setTab('new')
            onOpenHistory(id)
          }}
        />
      }
      composer={
        <CopilotComposer
          placeholder={
            level === 'locations'
              ? 'Type an address, or drop a schedule…'
              : 'Describe the account, or attach an ACORD, loss runs, or payroll report…'
          }
          value={composerValue}
          onChange={setComposerValue}
          minRows={1}
          showModeSelector={false}
          showDisclaimer={false}
          onSubmit={(text) => {
            setEditing(null)
            if (level === 'locations') {
              const address = parseQuoteAddress(text)
              if (address) update({ ...draft, locations: [...draft.locations, { id: quoteLocationId(), address, type: null }] })
              return
            }
            update(applySubmissionText(draft, text))
          }}
          attachRequestKey={attachRequest > 0 ? attachRequest : null}
          onFilesAdded={(files) => update(applySubmissionDocuments(draft, files.map((file) => file.name)))}
        />
      }
    >
      {level === 'locations' ? locationsLevel : intakeLevel}
    </DraftDrawerShell>
  )
}
