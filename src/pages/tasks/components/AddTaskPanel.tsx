import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { CopilotQuickActions } from '@/design-system/components'
import { CopilotComposer, type CopilotAttachedFile } from '@/pages/policies/components/CopilotComposer'
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
  draftChipSx,
  draftInputSx,
  draftUid,
  formatDraftCreatedTime,
  useDebouncedValue,
  useFilledFirstOrder,
  type DraftNeededRow,
  type DraftTab,
  type DraftThreadMessage,
} from '@/pages/shared/components/DraftDrawer'
import {
  ADD_TASK_ASSIGNEES,
  ADD_TASK_SEEDS,
  RELATED_BY_LABEL,
  RELATED_OPTIONS,
  relatedSearchText,
  buildDueOptions,
  buildTaskFromDraft,
  emptyAddTaskDraft,
  formatDueLabel,
  inferFromText,
  mergeDraft,
  type AddTaskDraft,
  type AddTaskDue,
  type AddTaskPageContext,
  type AddTaskRelated,
} from '@/pages/tasks/data/addTaskDraft'
import type { TaskPriority, TaskRecord } from '@/pages/tasks/data/mockTasks'

const PRIORITY_OPTIONS: TaskPriority[] = ['Low', 'Medium', 'High']

const ADD_BLOCKER_ACTION = 'Add blocker'
const EMAIL_BLOCKER_ACTION = 'Email blocker'
const REVIEW_ALL_ACTION = 'Review all'
const MAX_SUGGESTED_ACTIONS = 3
const BLOCKER_HINT = 'What’s in the way'

type EditField = 'title' | 'assignee' | 'related' | 'priority' | 'due' | 'description' | 'blocker'
type WorkField = Exclude<EditField, 'description' | 'blocker'>

const WORK_FIELDS: WorkField[] = ['title', 'assignee', 'priority', 'due', 'related']

const WORK_TERMS: Record<WorkField, string> = {
  title: 'Title',
  assignee: 'Assignee',
  priority: 'Priority',
  due: 'Due',
  related: 'Related',
}

const WORK_HINTS: Record<WorkField, string> = {
  title: 'Short label',
  assignee: 'Person or queue',
  priority: 'Low, medium, or high',
  due: 'Date',
  related: 'Quote, policy, submission, or customer',
}

function relatedOptionName(label: string) {
  return RELATED_BY_LABEL.get(label)?.name ?? label
}

function relatedOptionSubtitle(label: string) {
  const record = RELATED_BY_LABEL.get(label)
  if (!record) return undefined
  return record.ref === record.name ? record.kind : `${record.kind} · ${record.ref}`
}

export type AddTaskSavedState = {
  draft: AddTaskDraft
  messages: DraftThreadMessage[]
}

export type AddTaskHistoryEntry = {
  task: TaskRecord
  createdAt: Date
}

export type AddTaskBlockerEmail = {
  subject: string
  body: string
  related: AddTaskRelated | null
}

type AddTaskPanelProps = {
  initialState?: AddTaskSavedState | null
  initialTab?: DraftTab
  history: AddTaskHistoryEntry[]
  onClose: () => void
  onSaveDraft: (state: AddTaskSavedState) => void
  onCreate: (task: TaskRecord) => void
  onOpenTask: (taskId: string) => void
  pageContext?: AddTaskPageContext
  /** Record from a row menu or the selected grid row; starts a fresh draft with only Related set. */
  initialRelated?: AddTaskRelated | null
  /** Hands the blocker to the mail rail; the draft is saved so the drawer can resume afterwards. */
  onEmailBlocker?: (email: AddTaskBlockerEmail, state: AddTaskSavedState) => void
}

function FileChip({ name }: { name: string }) {
  return (
    <Chip
      size="small"
      variant="outlined"
      icon={<AttachFileOutlinedIcon sx={{ fontSize: 16 }} />}
      label={name}
      sx={{ ...draftChipSx, height: 24, borderColor: 'divider', bgcolor: 'background.paper' }}
    />
  )
}

function BlockerEmailedTag({ to, sentAt }: { to: string; sentAt: Date }) {
  const label = `Emailed${to ? ` to ${to}` : ''} · ${formatDraftCreatedTime(sentAt)}`
  return (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary', minWidth: 0 }}>
      <MailOutlineIcon sx={{ fontSize: 14, flexShrink: 0 }} />
      <Typography variant="caption" noWrap title={label} sx={{ ...draftBodySx, lineHeight: 1.35 }}>
        {label}
      </Typography>
    </Stack>
  )
}

const CUSTOM_DUE = 'Custom'

function toDateInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function DueEditor({
  presets,
  due,
  onPickPreset,
  onPickDate,
}: {
  presets: AddTaskDue[]
  due: AddTaskDue | null
  onPickPreset: (label: string) => void
  onPickDate: (date: Date) => void
}) {
  const isCustom = due != null && !presets.some((preset) => preset.label === due.label)
  const [showPicker, setShowPicker] = useState(isCustom)
  const today = toDateInputValue(new Date())

  return (
    <Stack spacing={1.25}>
      <Stack direction="row" flexWrap="wrap" useFlexGap gap={0.75}>
        {[...presets.map((preset) => preset.label), CUSTOM_DUE].map((option) => {
          const isSelected = option === CUSTOM_DUE ? showPicker || isCustom : option === due?.label && !showPicker
          return (
            <Chip
              key={option}
              label={option}
              clickable
              color={isSelected ? 'primary' : 'default'}
              variant={isSelected ? 'filled' : 'outlined'}
              aria-expanded={option === CUSTOM_DUE ? showPicker : undefined}
              onClick={() => (option === CUSTOM_DUE ? setShowPicker((open) => !open) : onPickPreset(option))}
              sx={{ ...draftChipSx, ...(isSelected ? {} : { borderColor: 'divider' }) }}
            />
          )
        })}
      </Stack>
      {showPicker ? (
        <TextField
          type="date"
          size="small"
          defaultValue={isCustom && due ? toDateInputValue(due.date) : ''}
          inputProps={{ min: today, 'aria-label': 'Custom due date' }}
          onChange={(event) => {
            const [year, month, day] = event.target.value.split('-').map(Number)
            if (!year || year < 1000 || !month || !day) return
            onPickDate(new Date(year, month - 1, day))
          }}
          sx={{ ...draftInputSx, maxWidth: 200 }}
        />
      ) : null}
    </Stack>
  )
}

export function AddTaskPanel({
  initialState,
  initialTab = 'new',
  history,
  onClose,
  onSaveDraft,
  onCreate,
  onOpenTask,
  pageContext,
  initialRelated,
  onEmailBlocker,
}: AddTaskPanelProps) {
  const [tab, setTab] = useState<DraftTab>(initialTab)
  const [draft, setDraft] = useState<AddTaskDraft>(() =>
    initialRelated
      ? { ...emptyAddTaskDraft, related: initialRelated }
      : (initialState?.draft ?? emptyAddTaskDraft),
  )
  const [messages, setMessages] = useState<DraftThreadMessage[]>(() =>
    initialRelated ? [] : (initialState?.messages ?? []),
  )
  const [composerValue, setComposerValue] = useState('')
  const [composerKey, setComposerKey] = useState(0)
  const [stagedFiles, setStagedFiles] = useState<CopilotAttachedFile[]>([])
  const [editing, setEditing] = useState<{ field: EditField; atCreate: boolean } | null>(null)
  const [promptedAtCreate, setPromptedAtCreate] = useState(false)
  const blockerMode = editing?.field === 'blocker'
  const dueOptions = useMemo(() => buildDueOptions(), [])
  const [parsedComposerValue, setParsedComposerValue] = useDebouncedValue(composerValue)

  // A linked record (prefilled or picked) outranks the page's own record; text naming another record still wins.
  const inferContext = useMemo<AddTaskPageContext>(
    () => ({
      kind: pageContext?.kind ?? null,
      record: draft.related ?? pageContext?.record ?? null,
    }),
    [draft.related, pageContext],
  )
  const infer = (text: string) => inferFromText(text, inferContext)
  const liveComposerText = blockerMode ? '' : parsedComposerValue.trim()
  const liveInference = useMemo(
    () => inferFromText(liveComposerText, inferContext),
    [liveComposerText, inferContext],
  )
  const previewDraft = useMemo(() => mergeDraft(draft, liveInference), [draft, liveInference])
  // Create / Save read the composer without the debounce so nothing typed is lost.
  const commitDraft = useMemo(
    () => mergeDraft(draft, blockerMode ? {} : inferFromText(composerValue, inferContext)),
    [blockerMode, composerValue, draft, inferContext],
  )
  const hasThread = messages.length > 0
  const draftHasContent =
    Boolean(draft.title || draft.notes || draft.assignee || draft.related || draft.blocker) ||
    draft.attachments.length > 0
  const showNeeded = hasThread || draftHasContent || Boolean(liveComposerText)
  const originalRequest = messages.find((message) => message.text)?.text ?? ''

  const applySeed = (label: string, prefill: string) => {
    setEditing(null)
    setMessages((current) => [...current, { id: draftUid('user'), text: label }])
    setDraft((current) => ({ ...mergeDraft(current, infer(prefill)), notes: prefill }))
  }

  const resetDraft = () => {
    setDraft(emptyAddTaskDraft)
    setMessages([])
    setComposerValue('')
    setParsedComposerValue('')
    setStagedFiles([])
    setComposerKey((key) => key + 1)
    setPromptedAtCreate(false)
    setEditing(null)
  }

  const handleSend = (raw: string, files: CopilotAttachedFile[] = []) => {
    const text = raw.trim()
    if (!text && files.length === 0) return
    setMessages((current) => [
      ...current,
      { id: draftUid('user'), text, files: files.length > 0 ? files.map((file) => file.name) : undefined },
    ])
    setComposerValue('')
    setParsedComposerValue('')
    setEditing(null)

    setDraft((current) => {
      const attachments = [
        ...current.attachments,
        ...files.filter((file) => !current.attachments.some((existing) => existing.id === file.id)),
      ]
      if (!text) return { ...current, attachments }
      if (blockerMode) {
        const blockerEmail = text === current.blocker ? current.blockerEmail : null
        return { ...current, blocker: text, blockerEmail, attachments }
      }
      const notes = current.notes ? `${current.notes}\n${text}` : text
      return { ...mergeDraft(current, infer(text)), notes, attachments }
    })
  }

  const toggleEditing = (field: EditField, atCreate = false) => {
    setEditing((current) => (current?.field === field && !atCreate ? null : { field, atCreate }))
  }

  const applyEdit = (field: EditField, value: string) => {
    setEditing(null)
    setDraft((current) => {
      switch (field) {
        case 'title':
          return { ...current, title: value }
        case 'description':
          return { ...current, notes: value }
        case 'assignee':
          return { ...current, assignee: value }
        case 'related':
          return { ...current, related: RELATED_BY_LABEL.get(value) ?? current.related }
        case 'priority':
          return { ...current, priority: PRIORITY_OPTIONS.find((p) => p === value) ?? current.priority }
        case 'due':
          return { ...current, due: dueOptions.find((d) => d.label === value) ?? current.due }
        case 'blocker':
          return { ...current, blocker: value, blockerEmail: value === current.blocker ? current.blockerEmail : null }
      }
    })
  }

  const description = [previewDraft.notes, liveComposerText].filter(Boolean).join('\n')

  const workValue = (field: WorkField): string | null => {
    switch (field) {
      case 'title':
        return previewDraft.title || null
      case 'assignee':
        return previewDraft.assignee
      case 'priority':
        return previewDraft.priority
      case 'due':
        return previewDraft.due?.label ?? null
      case 'related':
        return previewDraft.related?.name ?? null
    }
  }
  const orderedWorkFields = useFilledFirstOrder(WORK_FIELDS, (field) => workValue(field) != null)
  const rows: DraftNeededRow<EditField>[] = orderedWorkFields.map((field) => {
    const value = workValue(field)
    return {
      term: WORK_TERMS[field],
      value,
      field,
      hint: WORK_HINTS[field],
      ...(value == null ? { tone: field === 'title' ? ('error' as const) : ('warning' as const) } : {}),
    }
  })
  const blockerText = previewDraft.blocker ?? (blockerMode ? parsedComposerValue.trim() || null : null)
  if (blockerText || blockerMode) {
    const firstLine = blockerText?.split('\n').find((line) => line.trim())?.trim() ?? null
    const emailed = previewDraft.blocker ? previewDraft.blockerEmail : null
    rows.push({
      term: 'Blocker',
      value: firstLine,
      field: 'blocker',
      hint: BLOCKER_HINT,
      tone: 'error',
      meta: emailed ? <BlockerEmailedTag to={emailed.to} sentAt={emailed.sentAt} /> : undefined,
    })
  }

  const holes = orderedWorkFields.filter((field) => workValue(field) == null)
  const hasDraft = hasThread || Boolean(previewDraft.title)
  const suggestedActions = (
    previewDraft.blocker
      ? [...(onEmailBlocker ? [EMAIL_BLOCKER_ACTION] : []), ...(holes.length > 0 ? [REVIEW_ALL_ACTION] : [])]
      : hasDraft && !blockerMode
        ? [ADD_BLOCKER_ACTION]
        : []
  ).slice(0, MAX_SUGGESTED_ACTIONS)

  const handleAction = (action: string) => {
    switch (action) {
      case ADD_BLOCKER_ACTION:
        setEditing({ field: 'blocker', atCreate: false })
        return
      case EMAIL_BLOCKER_ACTION:
        if (!previewDraft.blocker) return
        onEmailBlocker?.(
          {
            subject: previewDraft.title || 'Untitled task',
            body: previewDraft.blocker,
            related: previewDraft.related,
          },
          { draft: buildFinalDraft(), messages },
        )
        return
      case REVIEW_ALL_ACTION:
        if (holes[0]) setEditing({ field: holes[0], atCreate: false })
        return
    }
  }
  if (previewDraft.attachments.length > 0) {
    rows.push({
      term: 'Files',
      value: `${previewDraft.attachments.length} attached`,
      extra: (
        <Stack direction="row" flexWrap="wrap" useFlexGap gap={0.5}>
          {previewDraft.attachments.map((file) => (
            <FileChip key={file.id} name={file.name} />
          ))}
        </Stack>
      ),
    })
  }

  const renderEditor = (field: EditField) => {
    const atCreateHint = editing?.atCreate ? 'Optional — select Create task again to skip.' : undefined
    switch (field) {
      case 'title':
        return (
          <DraftInlineTextEdit
            initialValue={previewDraft.title}
            label="Task title"
            onCommit={(value) => applyEdit('title', value)}
            onDismiss={() => setEditing(null)}
          />
        )
      case 'description':
        return (
          <DraftInlineTextEdit
            multiline
            initialValue={description}
            label="Task description"
            onCommit={(value) => applyEdit('description', value)}
            onDismiss={() => setEditing(null)}
          />
        )
      case 'blocker':
        return (
          <DraftInlineTextEdit
            multiline
            initialValue={previewDraft.blocker ?? ''}
            label="Blocker"
            placeholder={BLOCKER_HINT}
            onCommit={(value) => applyEdit('blocker', value)}
            onDismiss={() => setEditing(null)}
          />
        )
      case 'assignee':
        return (
          <DraftInlineLookup
            key={`assignee-${editing?.atCreate}`}
            options={ADD_TASK_ASSIGNEES}
            placeholder="Search people or queues"
            hint={atCreateHint}
            onPick={(value) => applyEdit('assignee', value)}
            onDismiss={() => setEditing(null)}
          />
        )
      case 'related':
        return (
          <DraftInlineLookup
            key={`related-${editing?.atCreate}`}
            options={RELATED_OPTIONS}
            placeholder="Search policies, quotes, submissions, customers"
            hint={atCreateHint}
            searchText={relatedSearchText}
            optionLabel={relatedOptionName}
            optionSubtitle={relatedOptionSubtitle}
            onPick={(value) => applyEdit('related', value)}
            onDismiss={() => setEditing(null)}
          />
        )
      case 'priority':
        return (
          <DraftInlineOptions
            options={PRIORITY_OPTIONS}
            selected={previewDraft.priority}
            onPick={(value) => applyEdit('priority', value)}
          />
        )
      case 'due':
        return (
          <DueEditor
            presets={dueOptions}
            due={previewDraft.due}
            onPickPreset={(value) => applyEdit('due', value)}
            onPickDate={(date) => setDraft((current) => ({ ...current, due: { label: formatDueLabel(date), date } }))}
          />
        )
    }
  }

  const buildFinalDraft = (): AddTaskDraft => ({
    ...commitDraft,
    notes: [commitDraft.notes, blockerMode ? '' : composerValue.trim()].filter(Boolean).join('\n'),
    attachments: [
      ...commitDraft.attachments,
      ...stagedFiles.filter((file) => !commitDraft.attachments.some((existing) => existing.id === file.id)),
    ],
  })

  const handleCreate = () => {
    const finalDraft = buildFinalDraft()
    if (!finalDraft.title) return
    // Offer one lookup for a missing assignee / related record; a second Create commits as-is.
    const missing: EditField | null = !finalDraft.assignee ? 'assignee' : !finalDraft.related ? 'related' : null
    if (missing && !promptedAtCreate) {
      setPromptedAtCreate(true)
      toggleEditing(missing, true)
      return
    }
    onCreate(buildTaskFromDraft(finalDraft))
  }

  return (
    <DraftDrawerShell
      heading="New task"
      closeLabel="Close new task drawer"
      tab={tab}
      onTabChange={setTab}
      onClose={onClose}
      createLabel="Create task"
      createDisabled={!commitDraft.title}
      onCreate={handleCreate}
      onSaveDraft={() => onSaveDraft({ draft: buildFinalDraft(), messages })}
      history={
        <DraftHistoryList
          entries={history.map(({ task, createdAt }) => ({
            id: task.id,
            title: task.taskName,
            subtitle: [task.assignedTo, formatDraftCreatedTime(createdAt)].join(' · '),
          }))}
          emptyText="Tasks you create this session show up here."
          onOpen={onOpenTask}
        />
      }
      composer={
        <CopilotComposer
          key={composerKey}
          placeholder={blockerMode ? 'Describe the blocker…' : 'Describe the task…'}
          value={composerValue}
          onChange={setComposerValue}
          minRows={1}
          showModeSelector={false}
          showDisclaimer={false}
          onSubmit={handleSend}
          onFilesChange={setStagedFiles}
        />
      }
    >
      {!showNeeded ? (
        <>
          <DraftWelcome
            title="What’s the task?"
            body="Describe it in the composer. Chat will draft the title, assignee, and related record and suggest the next step."
          />
          <Divider sx={{ mb: 2 }} />
          <CopilotQuickActions
            label="Suggested actions"
            actions={ADD_TASK_SEEDS.map((seed) => seed.label)}
            onAction={(label) => {
              const seed = ADD_TASK_SEEDS.find((item) => item.label === label)
              if (seed) applySeed(seed.label, seed.prefill)
            }}
          />
        </>
      ) : (
        <>
          <DraftHeader
            title={previewDraft.title || 'Untitled task'}
            request={originalRequest}
            backLabel="Cancel task"
            onBack={resetDraft}
          />
          <DraftNeededList
            rows={rows}
            editingField={editing?.field ?? null}
            onToggle={(field) => toggleEditing(field)}
            renderEditor={renderEditor}
          />
          {suggestedActions.length > 0 ? (
            <CopilotQuickActions label="Suggested actions" actions={suggestedActions} onAction={handleAction} />
          ) : null}
        </>
      )}
    </DraftDrawerShell>
  )
}
