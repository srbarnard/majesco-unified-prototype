import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import { alpha, type Theme } from '@mui/material/styles'
import Link from '@mui/material/Link'
import { getFigmaColors } from '@/design-system/tokens/figma-colors'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useRightToolDispatch } from '@/app/contexts/RightToolContext'
import { useTasksStore } from '@/app/contexts/TasksContext'
import { Button as DsButton, CopilotQuickActions } from '@/design-system/components'
import { fadeSlideDownSx } from '@/design-system/tokens/motion'
import { copilotSubtitleSx } from '@/pages/policies/components/copilot/copilotDrawerStyles'
import { insuredIdFromName } from '@/pages/shared/insuredId'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import {
  stashClaimThread,
  type ClaimDrawerIntent,
  type CreateClaimSavedState,
} from '@/pages/claims/data/claimDrawerStore'
import { claimPrefix, getClaim, nextClaimNumber, updateClaim, useClaim } from '@/pages/claims/data/claimsStore'
import { insuredLocations, matchingInsuredLocations } from '@/pages/claims/data/policyLocations'
import {
  CLAIM_CURRENT_USER,
  CLAIM_POLICIES,
  CLAIM_POLICY_NUMBERS,
  CLAIM_QUEUES,
  applyCallerText,
  applyClaimText,
  documentClaimDraft,
  emptyClaimDraft,
  PROPERTY_DAMAGE_PREFIX,
  VEHICLE_DAMAGE_PREFIX,
  formatKnownLossDate,
  formatLossDate,
  parseLossDate,
  type CreateClaimDraft,
} from '@/pages/claims/data/createClaimDraft'
import {
  ClaimDateOfLossEdit,
  ClaimInsuredLocationEdit,
  ClaimRepairEstimateEdit,
  ClaimVehicleDamageEdit,
} from '@/pages/claims/components/ClaimLossEditors'
import { CustomerAddressEditor } from '@/pages/customers/components/CustomerAddressEditor'
import { formatAddress } from '@/pages/customers/data/createCustomerDraft'
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
  DraftNeededList,
  DraftWelcome,
  draftBodySx,
  draftUid,
  splitDraftRows,
  useDebouncedValue,
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
type ItemField = `item-${number}` | `injury-${number}`
type Field = EditKey | ItemField | 'insured' | 'claimant' | 'sources' | 'airbag' | 'damage' | 'assignee' | 'note' | 'task'
type TextKey = Exclude<EditKey, 'policy'>
type StartMode = 'documents' | 'phone' | 'policy'
type DamageField = 'involved' | 'damage' | 'hurt' | 'injury' | 'drivable' | 'estimate'
type DamageItem = {
  involved: 'Vehicle' | 'Property' | null
  damage: string | null
  hurt: boolean | null
  injury: string | null
  /** Optional: never blocks Add damage. */
  drivable: boolean | null
  estimate: string | null
}

const EMPTY_DAMAGE_ITEM: DamageItem = {
  involved: null,
  damage: null,
  hurt: null,
  injury: null,
  drivable: null,
  estimate: null,
}
const DRIVABLE = 'Drivable'
const NOT_DRIVABLE = 'Not drivable'
const PROPERTY_PREFIX = PROPERTY_DAMAGE_PREFIX
const VEHICLE_PREFIX = VEHICLE_DAMAGE_PREFIX

function damageEntryParts(entry: string): { term: 'Vehicle' | 'Property'; body: string } {
  if (entry.startsWith(PROPERTY_PREFIX)) return { term: 'Property', body: entry.slice(PROPERTY_PREFIX.length) }
  if (entry.startsWith(VEHICLE_PREFIX)) return { term: 'Vehicle', body: entry.slice(VEHICLE_PREFIX.length) }
  return { term: 'Vehicle', body: entry }
}

/** Vehicle and injury list items separate the subject from the detail with a comma. */
function damageItemText(value: string) {
  return value.replaceAll(' · ', ', ')
}

const NO_ONE_HURT = 'No one hurt'
const SOMEONE_HURT = 'Someone was hurt'
const ADD_DAMAGE_ITEM = 'Add item'
const BACK_TO_CLAIM = 'Back to claim'

/** e.g. "1 vehicle, 1 injury"; null when nothing has been added. */
function damageSummary(draft: CreateClaimDraft): string | null {
  const properties = draft.vehicles.filter((entry) => entry.startsWith(PROPERTY_PREFIX)).length
  const vehicles = draft.vehicles.length - properties
  const injuries =
    draft.injuries == null ? null : draft.injuries === 'None reported' ? 0 : draft.injuries.split('; ').length
  const parts = [
    vehicles > 0 ? plural(vehicles, 'vehicle') : null,
    properties > 0 ? `${properties} ${properties === 1 ? 'property' : 'properties'}` : null,
    injuries == null ? null : injuries === 0 ? 'no injuries' : `${injuries} ${injuries === 1 ? 'injury' : 'injuries'}`,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : null
}

const FROM_DOCUMENTS = 'From documents'
const CALLER_ON_PHONE = 'Caller on the phone'
const ON_EXISTING_POLICY = 'On an existing policy'
const CREATE_CLAIM = 'Submit claim'
const SAVE_DRAFT = 'Save draft'
const ADD_NOTE = 'Add note'
const CANCEL_CLAIM = 'Cancel'
const ADD_TASK = 'Add task'
const START_ANOTHER_CLAIM = 'Create another claim'

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

/** You first, then the claims queues, then everyone else. */
const CLAIM_ASSIGNEE_OPTIONS = [
  CLAIM_CURRENT_USER,
  ...CLAIM_QUEUES,
  ...ADD_TASK_ASSIGNEES.filter((name) => name !== CLAIM_CURRENT_USER && !/queue/i.test(name)),
]

function assigneeLabel(name: string) {
  return name === CLAIM_CURRENT_USER ? 'You' : name
}

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
  openedFromHistory = false,
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
  /** History reopened this mount. A created claim stays on its completed view. */
  openedFromHistory?: boolean
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
  const [savedDraft, setDraft] = useState<CreateClaimDraft | null>(initialState?.draft ?? null)
  const [created, setCreated] = useState(initialState?.created ?? false)
  const [justCreated, setJustCreated] = useState(false)
  /** A created claim opened from History: the completed view, not a new intake. */
  const [reviewingCompleted, setReviewingCompleted] = useState(
    () => openedFromHistory && Boolean(initialState?.created && initialState.draft),
  )
  const [start, setStart] = useState<StartMode | null>(null)
  const [reading, setReading] = useState<string[] | null>(null)
  const [composerValue, setComposerValue] = useState('')
  const [knownOpen, setKnownOpen] = useState(true)
  const [level, setLevel] = useState<'claim' | 'damage'>('claim')
  const [damageItem, setDamageItem] = useState<DamageItem | null>(null)
  const [damageEditing, setDamageEditing] = useState<DamageField | null>(null)
  const [editingDamageRow, setEditingDamageRow] = useState<string | null>(null)
  const [damageKnownOpen, setDamageKnownOpen] = useState(true)
  const [editing, setEditing] = useState<Field | null>(intentField(initialIntent))
  const [attachRequest, setAttachRequest] = useState(0)
  const readTimer = useRef<number | null>(null)
  const composerRef = useRef<HTMLDivElement>(null)
  /** Fields currently listed under Known facts. Edits there must not collapse that group. */
  const knownFactFields = useRef(new Set<Field>())
  const record = useClaim(savedDraft?.claimNumber)
  /** Submitted this session, or already filed in the Claims table. */
  const filed = created || (record != null && record.status !== 'Draft')
  /** A caller's account reads as it is typed; anything else typed fills the same facts. */
  const callerIntake = start === 'phone' || savedDraft?.reporter?.method === 'Phone'
  const [parsedComposerValue] = useDebouncedValue(composerValue)
  const liveText =
    filed || level === 'damage' || (start === 'documents' && !savedDraft) ? '' : parsedComposerValue.trim()
  /** The draft plus what the composer says so far. Extraction only fills empty facts, so committing it is safe. */
  const draft = useMemo(() => {
    if (!liveText) return savedDraft
    return callerIntake ? applyCallerText(savedDraft, liveText) : applyClaimText(savedDraft ?? emptyClaimDraft(), liveText)
  }, [callerIntake, liveText, savedDraft])

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
    setDraft(update(draft ?? emptyClaimDraft()))

  /** The next unanswered question of an item, in asking order. */
  const nextDamageField = (item: DamageItem): DamageField | null => {
    if (item.involved == null) return 'involved'
    if (item.damage == null) return 'damage'
    if (item.hurt == null) return 'hurt'
    if (item.hurt && item.injury == null) return 'injury'
    return null
  }

  const editDamageItem = (item: DamageItem) => {
    setDamageItem(item)
    setDamageEditing(nextDamageField(item))
  }

  const openDamage = () => {
    setEditing(null)
    setEditingDamageRow(null)
    setLevel('damage')
    if (draft && draft.vehicles.length === 0 && draft.injuries == null) editDamageItem(EMPTY_DAMAGE_ITEM)
  }

  const closeDamage = () => {
    setLevel('claim')
    setDamageItem(null)
    setDamageEditing(null)
    setEditingDamageRow(null)
  }

  const confirmDamageItem = () => {
    if (!damageItem || nextDamageField(damageItem) != null || !damageItem.involved || !damageItem.damage) return
    const { involved, damage, injury, drivable, estimate } = damageItem
    const entry = [
      damage,
      involved === 'Vehicle' && drivable != null ? (drivable ? DRIVABLE : NOT_DRIVABLE) : null,
      estimate ? `Est. ${estimate}` : null,
    ]
      .filter(Boolean)
      .join(', ')
    updateDraft((current) => ({
      ...current,
      vehicles: [...current.vehicles, `${involved === 'Property' ? PROPERTY_PREFIX : VEHICLE_PREFIX}${entry}`],
      injuries:
        damageItem.hurt && injury
          ? [current.injuries === 'None reported' ? null : current.injuries, injury].filter(Boolean).join('; ')
          : (current.injuries ?? 'None reported'),
    }))
    setDamageItem(null)
    setDamageEditing(null)
  }

  /** Short reading state, then the chosen files fill the draft; typed text only fills what is still empty. */
  const readSources = (names: string[], text: string) => {
    setStart(null)
    setReading(names)
    setEditing(null)
    // What was read lands collapsed so Needs attention stays in view.
    setKnownOpen(false)
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
    setReviewingCompleted(false)
    setStart(null)
    setEditing(null)
    setComposerValue('')
    closeDamage()
    onStartOver()
  }

  const handleSend = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    if (level === 'damage') {
      setComposerValue('')
      editDamageItem({ ...(damageItem ?? EMPTY_DAMAGE_ITEM), damage: text })
      return
    }
    // From documents drafts only from an attached file.
    if (start === 'documents' && !savedDraft) return
    setComposerValue('')
    setStart(null)
    setDraft(callerIntake ? applyCallerText(savedDraft, text) : applyClaimText(savedDraft ?? emptyClaimDraft(), text))
  }

  /** A chosen policy is a fact. Changing it from Known facts leaves that group open; the starter lookup keeps it collapsed. */
  const pickPolicy = (policyNumber: string) => {
    const policy = CLAIM_POLICIES.get(policyNumber)
    if (!policy) return
    const insideKnownFacts = editing != null && knownFactFields.current.has(editing)
    setEditing(null)
    setStart((current) => (current === 'policy' ? null : current))
    if (insideKnownFacts) setKnownOpen(true)
    else setKnownOpen(false)
    focusComposer()
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
    if (!draft) return
    if (filed) updateClaim(draft.claimNumber, (claim) => ({ ...claim, assignee }))
    else updateDraft((current) => ({ ...current, assignee }))
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
        ...(draft.description == null ? [blocker('What happened', 'Not described yet', 'description')] : []),
        ...(draft.dateOfLoss == null ? [blocker('Date of loss', 'Not reported yet', 'dateOfLoss')] : []),
        ...(draft.location == null ? [blocker('Location', 'Not reported yet', 'location')] : []),
        ...(draft.vehicles.length === 0 && draft.injuries == null
          ? [{ ...blocker('Damage or injuries', 'None added', 'damage'), chevron: true }]
          : []),
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

  const addedDamage = draft ? damageSummary(draft) : null

  const metaText = (text: string) => (
    <Typography variant="body2" color="text.secondary" sx={{ ...draftBodySx, fontSize: '0.75rem', lineHeight: 1.4 }}>
      {text}
    </Typography>
  )

  const editable = !created
  const editableField = <F extends Field>(field: F) => (editable ? { field } : {})
  const insuredName = draft?.policy?.insured ?? record?.insured ?? null
  /** Who the claim is created assigned to: the draft's pick, the row's owner, or you. */
  const owner =
    draft?.assignee ?? (record && record.assignee !== 'Unassigned' ? record.assignee : CLAIM_CURRENT_USER)
  /** Started from a picked policy: no documents read and no caller, so the other ways in no longer apply. */
  const fromPolicy = draft?.policy != null && draft.sources.length === 0 && !callerIntake
  const policyLocations = fromPolicy && draft?.policy ? insuredLocations(draft.policy) : []
  /** More than one insured site fits the loss, so the thread asks which one. */
  const locationChoices =
    draft?.policy && draft.location == null && liveText
      ? matchingInsuredLocations(liveText, insuredLocations(draft.policy))
      : []
  const insuredLocation = policyLocations.find((location) => location.address === draft?.location)
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
          ? [{ term: 'Date of loss', value: formatKnownLossDate(draft.dateOfLoss), ...editableField('dateOfLoss' as const) }]
          : []),
        ...(draft.location
          ? [
              {
                term: 'Location',
                value: draft.location,
                ...(fromPolicy ? { meta: insuredLocation ? `Insured location · ${insuredLocation.name}` : 'Not an insured location' } : {}),
                ...editableField('location' as const),
              },
            ]
          : []),
        ...(draft.description
          ? [{ term: 'What happened', value: draft.description, ...editableField('description' as const) }]
          : []),
        {
          term: 'Assigned to',
          value: assigneeLabel(owner),
          ...(editable ? { field: 'assignee' as const } : {}),
        },
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
        ...draft.vehicles.map((entry, index) => {
          const parts = damageEntryParts(entry)
          return {
            term: parts.term,
            value: damageItemText(parts.body),
            ...editableField(`item-${index}`),
          }
        }),
        ...(draft.injuries === 'None reported'
          ? [{ term: 'Injuries', value: draft.injuries, ...editableField('injuries') }]
          : (draft.injuries?.split('; ') ?? []).map((injury, index) => ({
              term: 'Injury',
              value: damageItemText(injury),
              ...editableField(`injury-${index}`),
            }))),
        ...(draft.vehicles.length > 0 || draft.injuries
          ? [{ term: 'Damage or injuries', value: addedDamage ?? 'Added', ...editableField('damage'), chevron: true }]
          : []),
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

  knownFactFields.current = new Set(factRows.flatMap((row) => (row.field != null ? [row.field] : [])))
  // Opening a Known facts editor pins the group open, so finishing the edit cannot collapse it.
  useEffect(() => {
    if (editing != null && knownFactFields.current.has(editing)) setKnownOpen(true)
  }, [editing])

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
    if (field.startsWith('item-') || field.startsWith('injury-')) {
      const value = field.startsWith('item-')
        ? damageItemText(damageEntryParts(draft.vehicles[Number(field.slice('item-'.length))] ?? '').body)
        : damageItemText(draft.injuries?.split('; ')[Number(field.slice('injury-'.length))] ?? '')
      if (!value) return null
      const label = field.startsWith('item-') ? damageEntryParts(draft.vehicles[Number(field.slice('item-'.length))] ?? '').term : 'Injury'
      return (
        <DraftInlineTextEdit
          initialValue={value}
          label={label}
          helperText={label === 'Injury' ? 'Who was hurt, and how' : 'What was damaged'}
          confirmable
          onCommit={(next) => commitDamageRow(field, next)}
          onDismiss={() => setEditing(null)}
        />
      )
    }
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
        return (
          <ClaimDateOfLossEdit
            initialValue={draft.dateOfLoss ?? ''}
            onCommit={(iso) => {
              setEditing(null)
              updateDraft((current) => ({ ...current, dateOfLoss: iso }))
            }}
            onDismiss={() => setEditing(null)}
          />
        )
      case 'location':
        if (fromPolicy) {
          return (
            <ClaimInsuredLocationEdit
              locations={policyLocations}
              onCommit={(location) => {
                setEditing(null)
                updateDraft((current) => ({ ...current, location }))
              }}
              onDismiss={() => setEditing(null)}
            />
          )
        }
        return (
          <CustomerAddressEditor
            value={null}
            onSelect={(address) => {
              setEditing(null)
              updateDraft((current) => ({ ...current, location: formatAddress(address) }))
            }}
            onDone={() => setEditing(null)}
            onDismiss={() => setEditing(null)}
          />
        )
      case 'description':
        return editorFor('description', draft.description ?? '')
      case 'assignee':
        return (
          <DraftInlineLookup
            options={CLAIM_ASSIGNEE_OPTIONS}
            optionLabel={(name) => (name === CLAIM_CURRENT_USER ? `${name} (you)` : name)}
            placeholder="Search people or queues"
            onPick={assign}
            onDismiss={() => setEditing(null)}
          />
        )
      default:
        return null
    }
  }

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
  const canSubmit = hasLoss && blockerRows.length === 0
  /** A policy alone is not a claim: the loss stays open until it is described, placed, and its damage or injuries known. */
  const lossOpen =
    draft != null &&
    (draft.description == null ||
      draft.dateOfLoss == null ||
      draft.location == null ||
      (draft.vehicles.length === 0 && draft.injuries == null))
  /** The ways in stay while the loss is open; saving or noting the draft joins them once there is a fact. */
  const intakeActions =
    !factRows.some((row) => row.field !== 'assignee')
      ? [FROM_DOCUMENTS, CALLER_ON_PHONE, ON_EXISTING_POLICY]
      : lossOpen && !fromPolicy
        ? [
            FROM_DOCUMENTS,
            ...(callerIntake ? [] : [CALLER_ON_PHONE]),
            ...(draft?.policy ? [] : [ON_EXISTING_POLICY]),
            SAVE_DRAFT,
            ADD_NOTE,
          ]
        : [SAVE_DRAFT, ADD_NOTE]
  const assignee = record && record.assignee !== 'Unassigned' ? record.assignee : null
  /** Once filed, an unassigned claim (or a row-menu reassign) asks for an owner. */
  const assigneeRows: DraftNeededRow<Field>[] =
    filed && (!assignee || editing === 'assignee')
      ? [{ term: 'Assignee', value: assignee, hint: 'Person or queue', tone: 'error', field: 'assignee' }]
      : []

  const handleThreadAction = (action: string) => {
    if (action === FROM_DOCUMENTS || action === CALLER_ON_PHONE || action === ON_EXISTING_POLICY) {
      handleStartAction(action)
      return
    }
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
    if (action === START_ANOTHER_CLAIM) {
      startOver()
      return
    }
    if (action === CREATE_CLAIM && draft && canSubmit) {
      const submitted = { ...draft, assignee: owner }
      setEditing(null)
      setDraft(submitted)
      setComposerValue('')
      setCreated(true)
      setJustCreated(true)
      onCreate({ draft: submitted, created: true })
    }
  }

  const threadEditors =
    editing === 'note' ? (
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
    ) : null

  /** One surface for every way in: documents, a caller, or a policy all land in the same Known facts. */
  const intakeView = (
    <>
      {draft ? (
        <DraftHeader title={draft.claimNumber} request={headerRequest()} backLabel="Back to what happened" onBack={startOver} />
      ) : reading ? (
        <DraftHeader
          title={documentClaimDraft(reading).claimNumber}
          request="New claim"
          backLabel="Back to what happened"
          onBack={startOver}
        />
      ) : (
        <DraftWelcome title="What happened?" body="Describe the loss, or drop a loss notice, police report, or photos." />
      )}
      {reading ? (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ ...draftBodySx, mb: 1 }}>
            {`Reading ${plural(reading.length, 'source')}…`}
          </Typography>
          <LinearProgress aria-label="Reading sources" sx={{ mb: 1.5, borderRadius: 1 }} />
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {reading.map((name) => (
              <Chip key={name} size="small" label={name} sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.75rem' }} />
            ))}
          </Stack>
        </Box>
      ) : null}
      <DraftAccordions
        known={factRows}
        attention={blockerRows}
        knownOpen={knownOpen}
        onKnownOpenChange={setKnownOpen}
        editingField={editing}
        onToggle={(field) => (field === 'damage' ? openDamage() : toggleEditing(field))}
        renderEditor={renderEditor}
        onGroupToggle={() => setEditing(null)}
      />
      {factRows.length === 0 ? <Divider sx={{ mb: 2 }} /> : null}
      <Box sx={{ mt: factRows.length > 0 ? 2 : 0 }}>
        {canSubmit ? (
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
        {locationChoices.length > 1 ? (
          <CopilotQuickActions
            label="Which location?"
            actions={locationChoices.map((location) => location.name)}
            onAction={(name) => {
              const location = locationChoices.find((item) => item.name === name)
              if (!location) return
              updateDraft((current) => ({ ...current, location: location.address }))
            }}
          />
        ) : null}
        <CopilotQuickActions label="Suggested actions" actions={intakeActions} onAction={handleThreadAction} />
        {start === 'policy' ? <Box sx={{ mt: 1 }}>{policyLookup(() => setStart(null))}</Box> : null}
        {threadEditors}
      </Box>
      <DraftDocumentChips files={sources.map((source) => ({ id: source, label: source }))} onOpen={openDocument} />
    </>
  )

  /** Submitted here and now owned: the thread ends on a confirmation with where to go next. */
  const confirmed = justCreated
  const assignedTo = assignee ?? owner
  const confirmationRows: { term: string; value: string; href?: string }[] = draft
    ? [
        { term: 'Claim', value: draft.claimNumber, href: `/claims/${encodeURIComponent(draft.claimNumber)}` },
        ...(insuredName
          ? [{ term: 'Insured', value: insuredName, href: `/insureds/${insuredIdFromName(insuredName)}` }]
          : []),
        ...(draft.policy
          ? [
              {
                term: 'Policy',
                value: `${draft.policy.policyNumber} · ${draft.policy.product}`,
                href: `/policies/${encodeURIComponent(draft.policy.policyNumber)}`,
              },
            ]
          : []),
        ...(draft.dateOfLoss ? [{ term: 'Date of loss', value: formatLossDate(draft.dateOfLoss) }] : []),
        { term: 'Assigned to', value: assigneeLabel(assignedTo) },
      ]
    : []

  const confirmationView = draft ? (
    <Stack alignItems="center" sx={[{ pt: 4, pb: 2, textAlign: 'center' }, fadeSlideDownSx()]}>
      <Box
        aria-hidden
        sx={(theme) => ({
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.12),
          color: 'success.main',
          mb: 1.5,
        })}
      >
        <InventoryOutlinedIcon sx={{ fontSize: 28 }} />
      </Box>
      <Typography variant="subtitle1" sx={{ ...copilotSubtitleSx, lineHeight: 1.35 }}>
        Claim submitted
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ ...draftBodySx, mt: 0.5 }}>
        {`Claim ${draft.claimNumber} submitted and assigned to ${assignedTo === CLAIM_CURRENT_USER ? 'you' : assignedTo}.`}
      </Typography>

      <Box sx={{ width: '100%', mt: 3, textAlign: 'left' }}>
        {confirmationRows.map(({ term, value, href }, index) => (
          <Stack
            key={term}
            direction="row"
            spacing={1.5}
            alignItems="baseline"
            sx={{ px: 1.5, py: 1, borderRadius: '5px', bgcolor: index % 2 === 0 ? 'action.hover' : 'background.paper' }}
          >
            <Typography variant="caption" color="text.primary" sx={{ ...draftBodySx, fontWeight: 600, width: 84, flexShrink: 0 }}>
              {term}
            </Typography>
            {href ? (
              <Link
                component="button"
                type="button"
                variant="body2"
                underline="hover"
                onClick={() => navigate(href)}
                sx={{ ...draftBodySx, minWidth: 0, textAlign: 'left', wordBreak: 'break-word' }}
              >
                {value}
              </Link>
            ) : (
              <Typography variant="body2" sx={{ ...draftBodySx, minWidth: 0, wordBreak: 'break-word' }}>
                {value}
              </Typography>
            )}
          </Stack>
        ))}
      </Box>

      <Stack direction="row" alignItems="center" justifyContent="center" flexWrap="wrap" gap={0.5} sx={{ mt: 3 }}>
        <DsButton size="small" variant="contained" color="primary" onClick={onClose}>
          Close
        </DsButton>
        <Link
          component="button"
          type="button"
          underline="none"
          color="text.primary"
          onClick={() => handleThreadAction(START_ANOTHER_CLAIM)}
          sx={threadLinkSx}
        >
          <AddCircleOutlineIcon sx={{ fontSize: 16 }} />
          {START_ANOTHER_CLAIM}
        </Link>
      </Stack>
    </Stack>
  ) : null

  /** History of a created claim: the captured facts and what's left to do, without the submit summary. */
  const completedView = draft ? (
    <>
      <DraftAccordions
        known={factRows}
        attention={[]}
        knownOpen={knownOpen}
        onKnownOpenChange={setKnownOpen}
        editingField={editing}
        onToggle={toggleEditing}
        renderEditor={renderEditor}
        onGroupToggle={() => setEditing(null)}
      />
      <Box sx={{ mt: 2 }}>
        <CopilotQuickActions label="Suggested actions" actions={[ADD_NOTE, ADD_TASK]} onAction={handleThreadAction} />
        {threadEditors}
      </Box>
      <DraftDocumentChips files={sources.map((source) => ({ id: source, label: source }))} onOpen={openDocument} />
    </>
  ) : null

  const filedView = draft ? (
    <>
      <DraftHeader
        title={draft.claimNumber}
        request={headerRequest()}
        {...(record && !created ? {} : { backLabel: 'Back to what happened', onBack: startOver })}
      />
      <DraftAccordions
        known={[]}
        attention={assigneeRows}
        hideKnown
        editingField={editing}
        onToggle={toggleEditing}
        renderEditor={renderEditor}
        onGroupToggle={() => setEditing(null)}
      />
      <Box sx={{ mt: 2 }}>
        <CopilotQuickActions label="Suggested actions" actions={[ADD_NOTE, ADD_TASK]} onAction={handleThreadAction} />
        {threadEditors}
      </Box>
      <DraftDocumentChips files={sources.map((source) => ({ id: source, label: source }))} onOpen={openDocument} />
    </>
  ) : null

  const damageItemRows: DraftNeededRow<string>[] = draft
    ? [
        ...draft.vehicles.map((entry, index) => {
          const parts = damageEntryParts(entry)
          return { term: parts.term, value: damageItemText(parts.body), field: `item-${index}` }
        }),
        ...(draft.injuries === 'None reported'
          ? [{ term: 'Injuries', value: draft.injuries, field: 'injuries' }]
          : (draft.injuries?.split('; ') ?? []).map((injury, index) => ({
              term: 'Injury',
              value: damageItemText(injury),
              field: `injury-${index}`,
            }))),
      ]
    : []

  const draftRef = useRef(draft)
  draftRef.current = draft

  const commitDamageRow = (field: string, value: string) => {
    const next = value.trim()
    if (!next) return
    const edit = (current: CreateClaimDraft): CreateClaimDraft | null => {
      const vehicleIndex = /^item-(\d+)$/.exec(field)
      if (vehicleIndex) {
        const index = Number(vehicleIndex[1])
        const entry = current.vehicles[index]
        if (entry == null) return null
        const prefix = entry.startsWith(PROPERTY_PREFIX) ? PROPERTY_PREFIX : entry.startsWith(VEHICLE_PREFIX) ? VEHICLE_PREFIX : ''
        const vehicles = [...current.vehicles]
        vehicles[index] = `${prefix}${next}`
        return { ...current, vehicles }
      }
      if (field === 'injuries') return { ...current, injuries: next }
      const injuryIndex = /^injury-(\d+)$/.exec(field)
      if (!injuryIndex || current.injuries == null) return null
      const parts = current.injuries.split('; ')
      const index = Number(injuryIndex[1])
      if (parts[index] == null) return null
      parts[index] = next
      return { ...current, injuries: parts.join('; ') }
    }
    setDraft((saved) => edit(saved ?? emptyClaimDraft()) ?? edit(draftRef.current ?? emptyClaimDraft()) ?? saved)
    setEditingDamageRow(null)
    setEditing((current) => (current === field ? null : current))
  }

  const renderDamageItemEditor = (field: string) => {
    const row = damageItemRows.find((item) => item.field === field)
    if (!row?.value) return null
    return (
      <DraftInlineTextEdit
        initialValue={row.value}
        label={row.term}
        helperText={row.term === 'Injury' || row.term === 'Injuries' ? 'Who was hurt, and how' : 'What was damaged'}
        confirmable
        onCommit={(value) => commitDamageRow(field, value)}
        onDismiss={() => setEditingDamageRow(null)}
      />
    )
  }

  /** Empty required slots are blockers; empty optional ones are considerations; anything filled is a known fact. */
  const question = (
    term: string,
    value: string | null,
    hint: string,
    field: DamageField,
    optional = false,
  ): DraftNeededRow<DamageField> => ({
    term,
    value,
    hint,
    field,
    ...(value == null ? { tone: optional ? ('warning' as const) : ('error' as const) } : {}),
  })

  const damageQuestionRows: DraftNeededRow<DamageField>[] = damageItem
    ? [
        question('What was involved', damageItem.involved, 'Vehicle or property', 'involved'),
        question(
          'What was damaged',
          damageItem.damage,
          damageItem.involved === 'Property' ? 'e.g. Storefront window and door frame' : 'e.g. 2023 Ford F-250, rear bumper',
          'damage',
        ),
        question('Was anyone hurt', damageItem.hurt == null ? null : damageItem.hurt ? SOMEONE_HURT : NO_ONE_HURT, 'Yes or no', 'hurt'),
        ...(damageItem.hurt ? [question('Who was hurt and how', damageItem.injury, 'e.g. Other driver, neck pain', 'injury')] : []),
        ...(damageItem.involved === 'Vehicle'
          ? [
              question(
                'Drivable',
                damageItem.drivable == null ? null : damageItem.drivable ? DRIVABLE : NOT_DRIVABLE,
                'Optional · can it be driven now',
                'drivable',
                true,
              ),
            ]
          : []),
        question('Repair estimate', damageItem.estimate, 'Optional · a rough figure is fine', 'estimate', true),
      ]
    : []
  const damageRows = splitDraftRows(damageQuestionRows)

  const renderDamageEditor = (field: DamageField) => {
    if (!damageItem) return null
    switch (field) {
      case 'involved':
        return (
          <DraftInlineOptions
            options={['Vehicle', 'Property']}
            selected={damageItem.involved}
            onPick={(option) => editDamageItem({ ...damageItem, involved: option as DamageItem['involved'] })}
          />
        )
      case 'damage':
        return damageItem.involved === 'Vehicle' ? (
          <ClaimVehicleDamageEdit
            initialValue={damageItem.damage ?? ''}
            onCommit={(value) => editDamageItem({ ...damageItem, damage: value })}
            onDismiss={() => setDamageEditing(null)}
          />
        ) : (
          <DraftInlineTextEdit
            initialValue={damageItem.damage ?? ''}
            label="What was damaged"
            helperText={damageItem.involved === 'Property' ? 'The property and what happened to it' : 'Year, make, model, and the damage'}
            confirmable
            onCommit={(value) => editDamageItem({ ...damageItem, damage: value })}
            onDismiss={() => setDamageEditing(null)}
          />
        )
      case 'hurt':
        return (
          <DraftInlineOptions
            options={[NO_ONE_HURT, SOMEONE_HURT]}
            selected={damageItem.hurt == null ? null : damageItem.hurt ? SOMEONE_HURT : NO_ONE_HURT}
            onPick={(option) => {
              const hurt = option === SOMEONE_HURT
              editDamageItem({ ...damageItem, hurt, injury: hurt ? damageItem.injury : null })
            }}
          />
        )
      case 'injury':
        return (
          <DraftInlineTextEdit
            initialValue={damageItem.injury ?? ''}
            label="Who was hurt and how"
            helperText="Who, and the injury"
            confirmable
            onCommit={(value) => editDamageItem({ ...damageItem, injury: value })}
            onDismiss={() => setDamageEditing(null)}
          />
        )
      case 'drivable':
        return (
          <DraftInlineOptions
            options={[DRIVABLE, NOT_DRIVABLE]}
            selected={damageItem.drivable == null ? null : damageItem.drivable ? DRIVABLE : NOT_DRIVABLE}
            onPick={(option) => editDamageItem({ ...damageItem, drivable: option === DRIVABLE })}
          />
        )
      case 'estimate':
        return (
          <ClaimRepairEstimateEdit
            initialValue={damageItem.estimate ?? ''}
            onCommit={(value) => editDamageItem({ ...damageItem, estimate: value })}
            onDismiss={() => setDamageEditing(null)}
          />
        )
    }
  }

  const damageItemComplete = damageItem != null && nextDamageField(damageItem) == null

  const damageView = (
    <>
      <DraftHeader
        title={damageItem ? 'Add damage' : 'Damage or injuries'}
        request={damageItem ? 'One vehicle or property at a time' : (addedDamage ?? 'None added')}
        backLabel={BACK_TO_CLAIM}
        onBack={closeDamage}
      />
      {damageItem ? (
        <>
          <DraftAccordions
            known={damageRows.known}
            attention={damageRows.attention}
            considerations={damageRows.considerations}
            knownOpen={damageKnownOpen}
            onKnownOpenChange={setDamageKnownOpen}
            editingField={damageEditing}
            onToggle={(field) => setDamageEditing((current) => (current === field ? null : field))}
            renderEditor={renderDamageEditor}
            onGroupToggle={() => setDamageEditing(null)}
          />
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <DsButton size="small" variant="contained" color="primary" disabled={!damageItemComplete} onClick={confirmDamageItem}>
              Add damage
            </DsButton>
            <Link component="button" type="button" underline="none" color="text.primary" onClick={closeDamage} sx={threadLinkSx}>
              <CancelOutlinedIcon sx={{ fontSize: 16 }} />
              Cancel
            </Link>
          </Stack>
        </>
      ) : (
        <>
          {damageItemRows.length > 0 ? (
            <DraftNeededList
              rows={damageItemRows}
              editingField={editingDamageRow}
              onToggle={(field) => setEditingDamageRow((current) => (current === field ? null : field))}
              renderEditor={renderDamageItemEditor}
            />
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ ...draftBodySx, mb: 2 }}>
              Nothing added yet.
            </Typography>
          )}
          <CopilotQuickActions
            label="Suggested actions"
            actions={[ADD_DAMAGE_ITEM, BACK_TO_CLAIM]}
            onAction={(action) => (action === ADD_DAMAGE_ITEM ? editDamageItem(EMPTY_DAMAGE_ITEM) : closeDamage())}
          />
        </>
      )}
    </>
  )

  const body = confirmed
    ? confirmationView
    : reviewingCompleted
      ? completedView
      : filed
        ? filedView
        : level === 'damage'
          ? damageView
          : intakeView
  const placeholder =
    level === 'damage'
      ? 'Describe what was damaged…'
      : start === 'phone'
      ? 'Type what the caller is saying…'
      : start === 'documents' && !draft
        ? 'Drop the loss notice, police report, or photos…'
        : draft?.policy && lossOpen
          ? `Describe the loss for ${draft.policy.insured}…`
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
        confirmed || reviewingCompleted ? null : (
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
        )
      }
    >
      {body}
    </DraftDrawerShell>
  )
}
