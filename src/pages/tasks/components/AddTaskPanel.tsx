import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
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
  draftChipSx,
  draftInputSx,
  draftUid,
  formatDraftCreatedTime,
  useDebouncedValue,
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
  relatedLabel,
  type AddTaskDraft,
  type AddTaskDue,
  type AddTaskPageContext,
  type AddTaskRelated,
} from '@/pages/tasks/data/addTaskDraft'
import type { TaskPriority, TaskRecord } from '@/pages/tasks/data/mockTasks'

const PRIORITY_OPTIONS: TaskPriority[] = ['Low', 'Medium', 'High']

const ADD_BLOCKER_ACTION = 'Add blocker'
const CANCEL_TASK_ACTION = 'Cancel task'

type EditField = 'title' | 'assignee' | 'related' | 'priority' | 'due' | 'description'

export type AddTaskSavedState = {
  draft: AddTaskDraft
  messages: DraftThreadMessage[]
}

export type AddTaskHistoryEntry = {
  task: TaskRecord
  createdAt: Date
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
  const [blockerMode, setBlockerMode] = useState(false)
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
    setBlockerMode(false)
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
    setBlockerMode(false)
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
      if (blockerMode) return { ...current, blocker: text, attachments }
      const notes = current.notes ? `${current.notes}\n${text}` : text
      return { ...mergeDraft(current, infer(text)), notes, attachments }
    })
    setBlockerMode(false)
  }

  const toggleEditing = (field: EditField, atCreate = false) => {
    setBlockerMode(false)
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
      }
    })
  }

  const handleAction = (action: string) => {
    if (action === CANCEL_TASK_ACTION) {
      resetDraft()
      return
    }
    if (action !== ADD_BLOCKER_ACTION) return
    setEditing(null)
    setBlockerMode(true)
  }

  const suggestedActions = [
    ...(!blockerMode && !previewDraft.blocker ? [ADD_BLOCKER_ACTION] : []),
    CANCEL_TASK_ACTION,
  ]

  const description = [previewDraft.notes, liveComposerText].filter(Boolean).join('\n')

  const rows: DraftNeededRow<EditField>[] = [
    { term: 'Title', value: previewDraft.title || null, field: 'title' },
    { term: 'Assignee', value: previewDraft.assignee, field: 'assignee' },
    { term: 'Related', value: previewDraft.related ? relatedLabel(previewDraft.related) : null, field: 'related' },
    { term: 'Priority', value: previewDraft.priority, field: 'priority' },
    { term: 'Due', value: previewDraft.due?.label ?? null, field: 'due' },
  ]
  if (previewDraft.blocker) {
    rows.push({ term: 'Blocker', value: previewDraft.blocker, tone: 'error' })
  } else if (blockerMode) {
    rows.push({ term: 'Blocker', value: null })
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
            body="Describe it in the composer. Copilot will draft the title, assignee, and related record and suggest the next step."
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
          <CopilotQuickActions label="Suggested actions" actions={suggestedActions} onAction={handleAction} />
        </>
      )}
    </DraftDrawerShell>
  )
}
