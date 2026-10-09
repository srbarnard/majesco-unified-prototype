import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import type { Theme } from '@mui/material/styles'
import Link from '@mui/material/Link'
import { getFigmaColors } from '@/design-system/tokens/figma-colors'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useRightToolDispatch } from '@/app/contexts/RightToolContext'
import { useTasksStore } from '@/app/contexts/TasksContext'
import { Button as DsButton, CopilotQuickActions } from '@/design-system/components'
import { fadeSlideDownSx } from '@/design-system/tokens/motion'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import {
  stashClaimThread,
  type ClaimDrawerIntent,
  type CreateClaimSavedState,
} from '@/pages/claims/data/claimDrawerStore'
import { claimPrefix, getClaim, nextClaimNumber, updateClaim, useClaim } from '@/pages/claims/data/claimsStore'
import {
  CLAIM_POLICIES,
  CLAIM_POLICY_NUMBERS,
  applyClaimText,
  documentClaimDraft,
  emptyClaimDraft,
  formatLossDate,
  parseLossDate,
  phoneClaimDraft,
  policyClaimDraft,
  type CreateClaimDraft,
} from '@/pages/claims/data/createClaimDraft'
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
  type DraftHistoryItem,
  type DraftNeededRow,
  type DraftTab,
} from '@/pages/shared/components/DraftDrawer'
import { draftDocument } from '@/pages/shared/data/draftDocuments'
import { ADD_TASK_ASSIGNEES, buildTaskFromDraft, emptyAddTaskDraft, findRelated } from '@/pages/tasks/data/addTaskDraft'

type EditKey =
  | 'policy'
  | 'dateOfLoss'
  | 'location'
  | 'description'
  | 'claimantName'
  | 'claimantEmail'
  | 'reporter'
  | 'policeReport'
  | 'driver'
  | 'vehicles'
  | 'injuries'
type Field = EditKey | 'insured' | 'claimant' | 'sources' | 'airbag' | 'assignee' | 'note' | 'task'
type TextKey = Exclude<EditKey, 'policy'>
type StartMode = 'documents' | 'phone' | 'policy'

const FROM_DOCUMENTS = 'From documents'
const CALLER_ON_PHONE = 'Caller on the phone'
const ON_EXISTING_POLICY = 'On an existing policy'
const CREATE_CLAIM = 'Submit claim'
const SAVE_DRAFT = 'Save draft'
const ADD_NOTE = 'Add note'
const CANCEL_CLAIM = 'Cancel'
const ADD_TASK = 'Add task'

/** Text link in the thread with the Suggested actions hover. */
const threadLinkSx = (theme: Theme) => ({
  ...draftBodySx,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  px: 1,
  py: 0.5,
  borderRadius: 1.5,
  transition: 'background-color 0.15s ease, color 0.15s ease',
  '&:hover': {
    bgcolor: getFigmaColors(theme.palette.mode).primary.hover,
    color: 'primary.main',
  },
  '&:active': { bgcolor: getFigmaColors(theme.palette.mode).primary.selected },
})
const REFER_COVERAGE = 'Refer to coverage'
const READING_MS = 1400

const EDIT_LABELS: Record<TextKey, { label: string; helper: string }> = {
  dateOfLoss: { label: 'Date of loss', helper: 'e.g. 07/14/2026' },
  location: { label: 'Loss location', helper: 'Road, city, and state' },
  description: { label: 'What happened', helper: 'A sentence or two is enough' },
  claimantName: { label: 'Claimant name', helper: 'The other party' },
  claimantEmail: { label: 'Claimant email', helper: 'Used to acknowledge the claim' },
  reporter: { label: 'Reported by', helper: 'Who reported the loss' },
  policeReport: { label: 'Police report', helper: 'Agency and report number' },
  driver: { label: 'Driver', helper: 'Who was driving the insured vehicle' },
  vehicles: { label: 'Vehicles and damage', helper: 'One vehicle per line' },
  injuries: { label: 'Injuries', helper: 'Who was hurt, or "None reported"' },
}

const MULTILINE_KEYS = new Set<TextKey>(['description', 'vehicles', 'injuries'])

function plural(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}

const AIRBAG_LABELS = { unknown: 'Unknown', deployed: 'Yes', 'not deployed': 'No' } as const
const AIRBAG_BY_LABEL = { Unknown: 'unknown', Yes: 'deployed', No: 'not deployed' } as const
const AIRBAG_OPTIONS = Object.keys(AIRBAG_BY_LABEL)

function intentField(intent: ClaimDrawerIntent | undefined): Field | null {
  if (intent === 'assign') return 'assignee'
  if (intent === 'note') return 'note'
  if (intent === 'task') return 'task'
  return null
}

function nowLabel() {
  return new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function CreateClaimPanel({
  initialState,
  initialIntent,
  history,
  onOpenHistory,
  onStartOver,
  onClose,
  onSaveDraft,
  onCreate,
  onDiscard,
}: {
  initialState?: CreateClaimSavedState | null
  /** Row action that opened the drawer on this claim (Assign, Add note, Add task). */
  initialIntent?: ClaimDrawerIntent
  history: DraftHistoryItem[]
  onOpenHistory: (id: string) => void
  /** Back to "What happened?"; the next save writes a new History row. */
  onStartOver: () => void
  onClose: () => void
  onSaveDraft: (state: CreateClaimSavedState) => void
  /** Confirms the draft and adds it to the Claims table; the drawer stays on the thread. */
  onCreate: (state: CreateClaimSavedState) => void
  /** Throws the draft away and closes the drawer. */
  onDiscard: (claimNumber: string | null) => void
}) {
  const { createTask } = useTasksStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { openTool } = useRightToolDispatch()
  const [tab, setTab] = useState<DraftTab>('new')
  const [draft, setDraft] = useState<CreateClaimDraft | null>(initialState?.draft ?? null)
  const [created, setCreated] = useState(initialState?.created ?? false)
  const [justCreated, setJustCreated] = useState(false)
  const [start, setStart] = useState<StartMode | null>(null)
  const [reading, setReading] = useState<string[] | null>(null)
  const [composerValue, setComposerValue] = useState('')
  const [editing, setEditing] = useState<Field | null>(intentField(initialIntent))
  const [attachRequest, setAttachRequest] = useState(0)
  const readTimer = useRef<number | null>(null)
  const composerRef = useRef<HTMLDivElement>(null)
  const record = useClaim(draft?.claimNumber)

  useEffect(() => () => {
    if (readTimer.current != null) window.clearTimeout(readTimer.current)
  }, [])

  // Closing the composer's file picker without a file goes back to the question.
  useEffect(() => {
    const input = composerRef.current?.querySelector<HTMLInputElement>('input[type="file"]')
    if (!input) return
    const handleCancel = () => setStart((current) => (current === 'documents' ? null : current))
    input.addEventListener('cancel', handleCancel)
    return () => input.removeEventListener('cancel', handleCancel)
  }, [])

  const focusComposer = () =>
    window.requestAnimationFrame(() =>
      composerRef.current?.querySelector<HTMLTextAreaElement>('textarea:not([aria-hidden="true"])')?.focus(),
    )

  const updateDraft = (update: (current: CreateClaimDraft) => CreateClaimDraft) =>
    setDraft((current) => update(current ?? emptyClaimDraft()))

  /** Short reading state, then the chosen files fill the draft; typed text only fills what is still empty. */
  const readSources = (names: string[], text: string) => {
    setStart(null)
    setReading(names)
    setEditing(null)
    readTimer.current = window.setTimeout(() => {
      readTimer.current = null
      setReading(null)
      setDraft((current) => {
        const base =
          current?.policy != null
            ? { ...current, sources: [...current.sources, ...names] }
            : documentClaimDraft([...(current?.sources ?? []), ...names])
        return text ? applyClaimText(base, text) : base
      })
    }, READING_MS)
  }

  const startOver = () => {
    if (readTimer.current != null) window.clearTimeout(readTimer.current)
    readTimer.current = null
    setReading(null)
    setDraft(null)
    setCreated(false)
    setJustCreated(false)
    setStart(null)
    setEditing(null)
    setComposerValue('')
    onStartOver()
  }

  const awaitingLoss =
    start === 'policy' && draft != null && !draft.description && !draft.dateOfLoss && !draft.location

  const handleSend = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    // From documents drafts only from an attached file.
    if (start === 'documents' && !draft) return
    setComposerValue('')
    if (start === 'phone' && !draft) {
      setStart(null)
      setDraft(phoneClaimDraft(text))
      return
    }
    setStart(null)
    updateDraft((current) => applyClaimText(current, text))
  }

  const pickPolicy = (policyNumber: string) => {
    const policy = CLAIM_POLICIES.get(policyNumber)
    if (!policy) return
    setEditing(null)
    if (start === 'policy' && !draft) {
      setDraft(policyClaimDraft(policy))
      focusComposer()
      return
    }
    updateDraft((current) => ({
      ...current,
      policy,
      claimNumber:
        getClaim(current.claimNumber) || current.claimNumber.startsWith(claimPrefix(policy.product))
          ? current.claimNumber
          : nextClaimNumber(claimPrefix(policy.product)),
    }))
  }

  const commitEdit = (key: TextKey, value: string) => {
    // Claimant name and email edit together; the row stays open until dismissed.
    setEditing((current) => (current === 'claimant' ? current : null))
    updateDraft((current) => {
      switch (key) {
        case 'dateOfLoss':
          return { ...current, dateOfLoss: parseLossDate(value) ?? current.dateOfLoss }
        case 'location':
          return { ...current, location: value }
        case 'description':
          return { ...current, description: value }
        case 'claimantName':
          return { ...current, claimant: { name: value, email: current.claimant?.email ?? null } }
        case 'claimantEmail':
          return current.claimant ? { ...current, claimant: { ...current.claimant, email: value } } : current
        case 'reporter':
          return { ...current, reporter: { name: value, method: current.reporter?.method ?? 'Phone' } }
        case 'policeReport':
          return { ...current, policeReport: value }
        case 'driver':
          return current.driver ? { ...current, driver: { ...current.driver, name: value } } : current
        case 'vehicles':
          return { ...current, vehicles: value.split('\n').map((line) => line.trim()).filter(Boolean) }
        case 'injuries':
          return { ...current, injuries: value }
      }
    })
  }

  const handleStartAction = (action: string) => {
    setEditing(null)
    if (action === FROM_DOCUMENTS) {
      setStart('documents')
      setAttachRequest((current) => current + 1)
    } else if (action === CALLER_ON_PHONE) {
      setStart('phone')
      focusComposer()
    } else if (action === ON_EXISTING_POLICY) {
      setStart('policy')
    }
  }

  const assign = (assignee: string) => {
    setEditing(null)
    if (draft) updateClaim(draft.claimNumber, (claim) => ({ ...claim, assignee }))
  }

  const addNote = (text: string) => {
    setEditing(null)
    if (!draft || !text.trim()) return
    if (!record) {
      const note = { id: draftUid('note'), text: text.trim(), at: nowLabel() }
      updateDraft((current) => ({ ...current, notes: [...(current.notes ?? []), note] }))
      return
    }
    updateClaim(draft.claimNumber, (claim) => ({
      ...claim,
      notes: [...claim.notes, { id: draftUid('note'), text, at: nowLabel() }],
    }))
  }

  const addTask = (title: string) => {
    setEditing(null)
    if (!draft || !record) return
    const related = record.policyNumber
      ? findRelated('Policy', record.policyNumber, [record.insured])
      : findRelated('Insured', record.insured, [record.insured])
    const built = buildTaskFromDraft({
      ...emptyAddTaskDraft,
      title,
      assignee: record.assignee === 'Unassigned' ? null : record.assignee,
      related,
      notes: `${title} · Claim ${record.claimNumber}`,
    })
    const task = { ...built, relatedEntities: { ...built.relatedEntities, claimNumber: record.claimNumber } }
    createTask(task)
    updateClaim(record.claimNumber, (claim) => ({
      ...claim,
      tasks: [...claim.tasks, { id: task.id, title, assignee: task.assignedTo, dueLabel: task.dueLabel }],
    }))
  }

  /** Refers the off-schedule driver to coverage: status, line, and a review task. */
  const referCoverage = () => {
    if (!draft?.driver) return
    const { driver, policy, claimNumber } = draft
    const title = `Coverage review: ${driver.name} not on the DOL driver schedule`
    const insured = policy?.insured ?? record?.insured ?? null
    const related = policy
      ? findRelated('Policy', policy.policyNumber, [policy.insured])
      : insured
        ? findRelated('Insured', insured, [insured])
        : null
    const built = buildTaskFromDraft({
      ...emptyAddTaskDraft,
      title,
      related,
      priority: 'High',
      notes: `${title} · Claim ${claimNumber}`,
    })
    const task = { ...built, relatedEntities: { ...built.relatedEntities, claimNumber } }
    createTask(task)
    const claimTask = { id: task.id, title, assignee: task.assignedTo, dueLabel: task.dueLabel }
    updateDraft((current) => ({
      ...current,
      driver: current.driver ? { ...current.driver, status: 'referred' } : current.driver,
      tasks: [...current.tasks, claimTask],
    }))
    if (record) {
      updateClaim(claimNumber, (claim) => ({
        ...claim,
        status: 'Coverage referral',
        tasks: [...claim.tasks, claimTask],
      }))
    }
  }

  const savedState = (): CreateClaimSavedState => ({ draft, created })

  const editorFor = (key: TextKey, initialValue: string) => (
    <DraftInlineTextEdit
      initialValue={initialValue}
      label={EDIT_LABELS[key].label}
      helperText={EDIT_LABELS[key].helper}
      multiline={MULTILINE_KEYS.has(key)}
      type={key === 'claimantEmail' ? 'email' : 'text'}
      confirmable={!MULTILINE_KEYS.has(key)}
      onCommit={(value) => commitEdit(key, value)}
      onDismiss={() => setEditing(null)}
    />
  )

  const policyLookup = (onDismiss: () => void) => (
    <DraftInlineLookup
      options={CLAIM_POLICY_NUMBERS}
      optionLabel={(policyNumber) => CLAIM_POLICIES.get(policyNumber)?.insured ?? policyNumber}
      optionSubtitle={(policyNumber) => {
        const policy = CLAIM_POLICIES.get(policyNumber)
        return policy ? `${policy.policyNumber} · ${policy.product}` : undefined
      }}
      searchText={(policyNumber) => {
        const policy = CLAIM_POLICIES.get(policyNumber)
        return policy ? `${policy.insured} ${policy.policyNumber} ${policy.product}` : policyNumber
      }}
      placeholder="Search policy number or insured"
      onPick={pickPolicy}
      onDismiss={onDismiss}
    />
  )

  /** Unresolved items stay open as rows; clicking one opens its edit in place. */
  const blocker = (term: string, hint: string, field: Field): DraftNeededRow<Field> => ({
    term,
    value: null,
    hint,
    tone: 'error',
    field,
  })

  const blockerRows: DraftNeededRow<Field>[] = draft
    ? [
        ...(draft.policy == null ? [blocker('Policy', 'Not matched to a policy yet', 'policy')] : []),
        ...(draft.dateOfLoss == null ? [blocker('Date of loss', 'Not reported yet', 'dateOfLoss')] : []),
        ...(draft.description == null ? [blocker('What happened', 'Not described yet', 'description')] : []),
        ...(draft.claimant && !draft.claimant.email
          ? [blocker('Claimant email missing', `${draft.claimant.name} · not in the loss notice`, 'claimantEmail')]
          : []),
        ...(draft.airbag === 'missing'
          ? [blocker('Airbag deployment unknown', 'Not in the police report or photos', 'airbag')]
          : []),
        ...(draft.driver?.status === 'off-schedule'
          ? [
              blocker(
                'Driver not on the DOL schedule',
                `${draft.driver.name} is not on the driver schedule for ${draft.dateOfLoss ? formatLossDate(draft.dateOfLoss) : 'the date of loss'}`,
                'driver',
              ),
            ]
          : []),
      ]
    : []

  const metaText = (text: string) => (
    <Typography variant="body2" color="text.secondary" sx={{ ...draftBodySx, fontSize: '0.75rem', lineHeight: 1.4 }}>
      {text}
    </Typography>
  )

  const editable = !created
  const editableField = <F extends Field>(field: F) => (editable ? { field } : {})
  const insuredName = draft?.policy?.insured ?? record?.insured ?? null
  const factRows: DraftNeededRow<Field>[] = draft
    ? [
        ...(draft.reporter
          ? [
              {
                term: 'Reported by',
                value: `${draft.reporter.name ?? 'Caller'} · ${draft.reporter.method === 'Phone' ? 'by phone' : 'loss notice'}`,
                ...editableField('reporter' as const),
              },
            ]
          : []),
        ...(insuredName ? [{ term: 'Insured', value: insuredName, ...editableField('insured' as const) }] : []),
        ...(draft.policy
          ? [{ term: 'Policy', value: `${draft.policy.policyNumber} · ${draft.policy.product}`, ...editableField('policy' as const) }]
          : []),
        ...(draft.dateOfLoss
          ? [{ term: 'Date of loss', value: formatLossDate(draft.dateOfLoss), ...editableField('dateOfLoss' as const) }]
          : []),
        ...(draft.location ? [{ term: 'Location', value: draft.location, ...editableField('location' as const) }] : []),
        ...(draft.description
          ? [{ term: 'What happened', value: draft.description, ...editableField('description' as const) }]
          : []),
        ...(draft.claimant
          ? [
              {
                term: 'Claimant',
                value: draft.claimant.email ? `${draft.claimant.name} · ${draft.claimant.email}` : draft.claimant.name,
                ...editableField('claimant' as const),
              },
            ]
          : []),
        ...(draft.driver && draft.driver.status !== 'off-schedule'
          ? [
              {
                term: 'Driver',
                value: draft.driver.status === 'referred' ? 'Referred to coverage' : draft.driver.name,
                ...(draft.driver.status === 'referred'
                  ? { meta: metaText(`${draft.driver.name} · not on the DOL driver schedule`) }
                  : {}),
                ...editableField('driver' as const),
              },
            ]
          : []),
        ...(draft.vehicles.length > 0
          ? [{ term: 'Vehicles and damage', value: draft.vehicles.join('; '), ...editableField('vehicles' as const) }]
          : []),
        ...(draft.injuries ? [{ term: 'Injuries', value: draft.injuries, ...editableField('injuries' as const) }] : []),
        ...(draft.airbag && draft.airbag !== 'missing'
          ? [{ term: 'Airbag deployment', value: AIRBAG_LABELS[draft.airbag], ...editableField('airbag' as const) }]
          : []),
        ...(draft.policeReport
          ? [{ term: 'Police report', value: draft.policeReport, ...editableField('policeReport' as const) }]
          : []),
        ...(record?.tasks ?? draft.tasks).map((task) => ({
          term: 'Task',
          value: task.title,
          meta: metaText(`${task.assignee} · Due ${task.dueLabel}`),
        })),
        ...(record?.notes ?? draft.notes ?? []).map((note) => ({ term: 'Note', value: note.text, meta: metaText(note.at) })),
      ]
    : []

  const sources = draft?.sources ?? []

  const openDocument = (fileName: string) => {
    if (!draft) return
    const document = draftDocument(`claim-${draft.claimNumber}`, fileName, {
      kind: 'Claim',
      label: `Claim ${draft.claimNumber}`,
      recordTitle: insuredName ?? `Claim ${draft.claimNumber}`,
      recordSubtitle: draft.claimNumber,
      path: location.pathname,
      reopen: () => openTool('newClaim'),
    })
    stashClaimThread(savedState())
    navigate(`/claims/${draft.claimNumber}/documents/${document.id}`)
  }

  const toggleEditing = (field: Field) => setEditing((current) => (current === field ? null : field))

  const textValue = (key: 'reporter' | 'policeReport' | 'driver' | 'vehicles' | 'injuries') => {
    if (!draft) return ''
    switch (key) {
      case 'reporter':
        return draft.reporter?.name ?? ''
      case 'policeReport':
        return draft.policeReport ?? ''
      case 'driver':
        return draft.driver?.name ?? ''
      case 'vehicles':
        return draft.vehicles.join('\n')
      case 'injuries':
        return draft.injuries ?? ''
    }
  }

  const renderEditor = (field: Field) => {
    if (!draft) return null
    switch (field) {
      case 'policy':
      case 'insured':
        return policyLookup(() => setEditing(null))
      case 'claimant':
        return (
          <Stack spacing={1.25}>
            {editorFor('claimantName', draft.claimant?.name ?? '')}
            {editorFor('claimantEmail', draft.claimant?.email ?? '')}
          </Stack>
        )
      case 'claimantEmail':
        return editorFor('claimantEmail', draft.claimant?.email ?? '')
      case 'driver':
        if (draft.driver?.status === 'off-schedule') {
          return (
            <DraftInlineOptions
              options={[REFER_COVERAGE]}
              selected={null}
              onPick={() => {
                setEditing(null)
                referCoverage()
              }}
            />
          )
        }
        return editorFor(field, textValue(field))
      case 'reporter':
      case 'policeReport':
      case 'vehicles':
      case 'injuries':
        return editorFor(field, textValue(field))
      case 'airbag':
        return (
          <DraftInlineOptions
            options={AIRBAG_OPTIONS}
            selected={draft.airbag && draft.airbag !== 'missing' ? AIRBAG_LABELS[draft.airbag] : null}
            onPick={(label) => {
              setEditing(null)
              updateDraft((current) => ({ ...current, airbag: AIRBAG_BY_LABEL[label as keyof typeof AIRBAG_BY_LABEL] }))
            }}
          />
        )
      case 'dateOfLoss':
        return editorFor('dateOfLoss', draft.dateOfLoss ? formatLossDate(draft.dateOfLoss) : '')
      case 'location':
        return editorFor('location', draft.location ?? '')
      case 'description':
        return editorFor('description', draft.description ?? '')
      case 'assignee':
        return (
          <DraftInlineLookup
            options={ADD_TASK_ASSIGNEES}
            placeholder="Search people or queues"
            onPick={assign}
            onDismiss={() => setEditing(null)}
          />
        )
      default:
        return null
    }
  }

  const readingView = reading ? (
    <>
      <DraftHeader title={draft?.claimNumber ?? 'New claim'} request={`Reading ${plural(reading.length, 'source')}…`} />
      <LinearProgress aria-label="Reading sources" sx={{ mb: 1.5, borderRadius: 1 }} />
      <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 2 }}>
        {reading.map((name) => (
          <Chip key={name} size="small" label={name} sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.75rem' }} />
        ))}
      </Stack>
    </>
  ) : null

  const backToQuestion = { backLabel: 'Back to what happened', onBack: () => setStart(null) }

  const startView =
    start === 'documents' ? (
      <DraftHeader
        title={FROM_DOCUMENTS}
        request="Choose the loss notice, police report, or photos."
        {...backToQuestion}
      />
    ) : start === 'phone' ? (
      <DraftHeader title={CALLER_ON_PHONE} request="Who is calling, and what happened?" {...backToQuestion} />
    ) : start === 'policy' ? (
      <>
        <DraftHeader title={ON_EXISTING_POLICY} request="Search a policy number or insured." {...backToQuestion} />
        {policyLookup(() => setStart(null))}
      </>
    ) : (
      <>
        <DraftWelcome title="What happened?" body="Describe the loss, or drop a loss notice, police report, or photos." />
        <Divider sx={{ mb: 2 }} />
        <CopilotQuickActions
          label="Suggested actions"
          actions={[FROM_DOCUMENTS, CALLER_ON_PHONE, ON_EXISTING_POLICY]}
          onAction={handleStartAction}
        />
      </>
    )

  const headerRequest = () => {
    if (!draft) return undefined
    if (justCreated) {
      return ['Created · added to Claims', insuredName, assignee && `Assigned to ${assignee}`].filter(Boolean).join(' · ')
    }
    const summary = [insuredName, draft.policy?.product ?? record?.product].filter(Boolean).join(' · ')
    if (record) return [summary, record.status].filter(Boolean).join(' · ')
    if (draft.driver?.status === 'referred') return [summary || 'New claim', 'Coverage referral'].join(' · ')
    return summary || 'New claim'
  }

  /** Submit needs a loss (what happened) and an empty Needs attention; any open blocker holds it back. */
  const hasLoss = draft?.description != null
  const canSubmit = hasLoss && !awaitingLoss && blockerRows.length === 0
  /** Submitted this session, or already filed in the Claims table. */
  const filed = created || (record != null && record.status !== 'Draft')
  const threadActions = filed ? [ADD_NOTE, ADD_TASK] : [SAVE_DRAFT, ADD_NOTE]
  const assignee = record && record.assignee !== 'Unassigned' ? record.assignee : null
  /** Once filed, an unassigned claim (or a row-menu reassign) asks for an owner. */
  const assigneeRows: DraftNeededRow<Field>[] =
    filed && (!assignee || editing === 'assignee')
      ? [{ term: 'Assignee', value: assignee, hint: 'Person or queue', tone: 'error', field: 'assignee' }]
      : []

  const handleThreadAction = (action: string) => {
    if (action === SAVE_DRAFT) {
      onSaveDraft(savedState())
      return
    }
    if (action === ADD_NOTE) {
      setEditing('note')
      return
    }
    if (action === ADD_TASK) {
      setEditing('task')
      return
    }
    if (action === CANCEL_CLAIM) {
      onDiscard(draft?.claimNumber ?? null)
      return
    }
    if (action === CREATE_CLAIM && draft && canSubmit) {
      setEditing(null)
      setCreated(true)
      setJustCreated(true)
      onCreate({ draft, created: true })
    }
  }

  const draftView = draft ? (
    <>
      <DraftHeader
        title={draft.claimNumber}
        request={headerRequest()}
        {...(record && !created ? {} : { backLabel: 'Back to what happened', onBack: startOver })}
      />
      <DraftAccordions
        known={filed ? [] : factRows}
        attention={filed ? assigneeRows : awaitingLoss ? [] : blockerRows}
        hideKnown={filed}
        editingField={editing}
        onToggle={toggleEditing}
        renderEditor={renderEditor}
        onGroupToggle={() => setEditing(null)}
      />
      {awaitingLoss ? (
        <DraftWelcome title="What happened?" body="When and where did it happen, and what was damaged or who was hurt?" />
      ) : null}
      <Box sx={{ mt: 2 }}>
        {!filed && canSubmit ? (
          <Stack direction="row" alignItems="center" spacing={1} sx={[{ mb: 2 }, fadeSlideDownSx()]}>
            <DsButton size="small" variant="contained" color="primary" onClick={() => handleThreadAction(CREATE_CLAIM)}>
              {CREATE_CLAIM}
            </DsButton>
            <Link
              component="button"
              type="button"
              underline="none"
              color="text.primary"
              onClick={() => handleThreadAction(CANCEL_CLAIM)}
              sx={threadLinkSx}
            >
              <CancelOutlinedIcon sx={{ fontSize: 16 }} />
              {CANCEL_CLAIM}
            </Link>
          </Stack>
        ) : null}
        <CopilotQuickActions label="Suggested actions" actions={threadActions} onAction={handleThreadAction} />
        {editing === 'note' ? (
          <DraftInlineTextEdit
            initialValue=""
            label="Note"
            helperText="Saved on the claim"
            multiline
            onCommit={addNote}
            onDismiss={() => setEditing(null)}
          />
        ) : editing === 'task' && record ? (
          <DraftInlineTextEdit
            initialValue=""
            label="Task"
            helperText={`Assigned to ${assignee ?? 'no one yet'} · due in 3 days`}
            confirmable
            onCommit={addTask}
            onDismiss={() => setEditing(null)}
          />
        ) : null}
      </Box>
      <DraftDocumentChips files={sources.map((source) => ({ id: source, label: source }))} onOpen={openDocument} />
    </>
  ) : null

  const body = readingView ?? draftView ?? startView
  const placeholder =
    start === 'phone' && !draft
      ? 'Who is calling, and what happened?'
      : start === 'documents' && !draft
        ? 'Drop the loss notice, police report, or photos…'
        : awaitingLoss
          ? 'What happened?'
          : 'Describe the loss, or drop a file…'

  return (
    <DraftDrawerShell
      heading="Create claim"
      closeLabel="Close create claim drawer"
      tab={tab}
      onTabChange={setTab}
      onClose={onClose}
      variant={created ? 'record' : 'draft'}
      onNewTabClick={() => {
        if (created) startOver()
      }}
      history={
        <DraftHistoryList
          entries={history}
          emptyText="Claims you start this session show up here."
          onOpen={(id) => {
            setTab('new')
            onOpenHistory(id)
          }}
        />
      }
      composer={
        <Box ref={composerRef}>
          <CopilotComposer
            placeholder={placeholder}
            value={composerValue}
            onChange={setComposerValue}
            minRows={1}
            showModeSelector={false}
            showDisclaimer={false}
            clearOnSubmit={!(start === 'documents' && !draft)}
            onSubmit={(text) => handleSend(text)}
            attachRequestKey={attachRequest > 0 ? attachRequest : null}
            onFilesAdded={(files) => {
              // From documents: the chosen file is the loss notice, report, or photos, so read it now.
              if (start === 'documents' && !draft) {
                readSources(
                  files.map((file) => file.name),
                  composerValue.trim(),
                )
                setComposerValue('')
                return
              }
              // Otherwise the file is read into the draft now; the composer text stays put.
              const known = new Set(draft?.sources.map((source) => source.toLowerCase()))
              const names = files.map((file) => file.name).filter((name) => !known.has(name.toLowerCase()))
              if (names.length > 0) readSources(names, '')
            }}
          />
        </Box>
      }
    >
      {body}
    </DraftDrawerShell>
  )
}
