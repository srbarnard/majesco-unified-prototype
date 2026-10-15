import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, type Theme } from '@mui/material/styles'
import { useMemo, useState } from 'react'
import { Button as DsButton, CopilotQuickActions } from '@/design-system/components'
import { getFigmaColors } from '@/design-system/tokens/figma-colors'
import { fadeSlideDownSx } from '@/design-system/tokens/motion'
import { CopilotComposer, type CopilotAttachedFile } from '@/pages/policies/components/CopilotComposer'
import { copilotSubtitleSx } from '@/pages/policies/components/copilot/copilotDrawerStyles'
import { createUploadedFile } from '@/pages/quotes/utils/quoteWizardDocuments'
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
  draftChipSx,
  draftInputSx,
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
const EMAIL_BLOCKER_ACTION = 'Email blocker'
const REVIEW_ALL_ACTION = 'Review all'
const CREATE_TASK_ACTION = 'Create task'
const SAVE_DRAFT_ACTION = 'Save draft'
const CANCEL_TASK_ACTION = 'Cancel'
const CREATE_ANOTHER_TASK = 'Create another task'
const MAX_SUGGESTED_ACTIONS = 3
const BLOCKER_HINT = 'What’s in the way'

/** Same text-link treatment as Cancel beside Submit claim. */
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
  /** Opens an attached file in the document viewer; the draft is saved so the drawer can resume afterwards. */
  onOpenDocument?: (file: CopilotAttachedFile, state: AddTaskSavedState) => void
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
  onOpenDocument,
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
  const [editing, setEditing] = useState<{ field: EditField; atCreate: boolean } | null>(null)
  const [promptedAtCreate, setPromptedAtCreate] = useState(false)
  const [createdTask, setCreatedTask] = useState<TaskRecord | null>(null)
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

  /** A picked or dropped file attaches to the task straight away; the composer text stays put. */
  const attachFiles = (added: File[]) => {
    const files = added.map(createUploadedFile)
    if (files.length === 0) return
    setMessages((current) => [...current, { id: draftUid('user'), text: '', files: files.map((file) => file.name) }])
    setDraft((current) => ({
      ...current,
      attachments: [
        ...current.attachments,
        ...files.filter((file) => !current.attachments.some((existing) => existing.name === file.name)),
      ],
    }))
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
  /** A title is enough to create; the button replaces Create task in Suggested actions. */
  const canCreate = Boolean(commitDraft.title)
  const suggestedActions = [
    ...(
      previewDraft.blocker
        ? [...(onEmailBlocker ? [EMAIL_BLOCKER_ACTION] : []), ...(holes.length > 0 ? [REVIEW_ALL_ACTION] : [])]
        : hasDraft && !blockerMode
          ? [ADD_BLOCKER_ACTION]
          : []
    ).slice(0, MAX_SUGGESTED_ACTIONS),
    SAVE_DRAFT_ACTION,
  ]

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
      case CREATE_TASK_ACTION:
        handleCreate()
        return
      case SAVE_DRAFT_ACTION:
        onSaveDraft({ draft: buildFinalDraft(), messages })
        return
    }
  }
  const { known, attention, considerations } = splitDraftRows(rows)

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
    const task = buildTaskFromDraft(finalDraft)
    onCreate(task)
    setDraft(finalDraft)
    setComposerValue('')
    setParsedComposerValue('')
    setEditing(null)
    setCreatedTask(task)
  }

  const startAnotherTask = () => {
    setCreatedTask(null)
    resetDraft()
    setTab('new')
  }

  const historyList = (
    <DraftHistoryList
      entries={history.map(({ task, createdAt }) => ({
        id: task.id,
        title: task.taskName,
        subtitle: [task.assignedTo, formatDraftCreatedTime(createdAt)].join(' · '),
      }))}
      emptyText="Tasks you create this session show up here."
      onOpen={onOpenTask}
    />
  )

  if (createdTask) {
    const confirmationRows: { term: string; value: string }[] = [
      { term: 'Task', value: createdTask.taskName },
      { term: 'Number', value: createdTask.refNumber },
      { term: 'Assignee', value: createdTask.assignedTo },
      { term: 'Due', value: createdTask.dueLabel },
      { term: 'Priority', value: createdTask.priority },
      ...(draft.related ? [{ term: 'Related', value: relatedLabel(draft.related) }] : []),
    ]
    return (
      <DraftDrawerShell
        variant="record"
        heading="New task"
        closeLabel="Close new task drawer"
        tab={tab}
        onTabChange={setTab}
        onNewTabClick={startAnotherTask}
        onClose={onClose}
        history={historyList}
        composer={null}
      >
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
            Task created
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ...draftBodySx, mt: 0.5 }}>
            {`Task ${createdTask.refNumber} created for ${createdTask.taskName}.`}
          </Typography>
          <Box sx={{ width: '100%', mt: 3, textAlign: 'left' }}>
            {confirmationRows.map(({ term, value }, index) => (
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
                <Typography variant="body2" sx={{ ...draftBodySx, minWidth: 0, wordBreak: 'break-word' }}>
                  {value}
                </Typography>
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
              onClick={startAnotherTask}
              sx={threadLinkSx}
            >
              <AddCircleOutlineIcon sx={{ fontSize: 16 }} />
              {CREATE_ANOTHER_TASK}
            </Link>
          </Stack>
        </Stack>
      </DraftDrawerShell>
    )
  }

  return (
    <DraftDrawerShell
      heading="New task"
      closeLabel="Close new task drawer"
      tab={tab}
      onTabChange={setTab}
      onClose={onClose}
      history={historyList}
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
          onFilesAdded={attachFiles}
        />
      }
    >
      {!showNeeded ? (
        <>
          <DraftWelcome
            title="What’s the task?"
            body="Describe it in the composer. The assistant will draft the title, assignee, and related record and suggest the next step."
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
          <DraftAccordions
            known={known}
            attention={attention}
            considerations={considerations}
            editingField={editing?.field ?? null}
            onToggle={(field) => toggleEditing(field)}
            renderEditor={renderEditor}
            onGroupToggle={() => setEditing(null)}
          />
          {canCreate ? (
            <Stack direction="row" alignItems="center" spacing={1} sx={[{ mb: 2 }, fadeSlideDownSx()]}>
              <DsButton size="small" variant="contained" color="primary" onClick={handleCreate}>
                {CREATE_TASK_ACTION}
              </DsButton>
              <Link
                component="button"
                type="button"
                underline="none"
                color="text.primary"
                onClick={onClose}
                sx={threadLinkSx}
              >
                <CancelOutlinedIcon sx={{ fontSize: 16 }} />
                {CANCEL_TASK_ACTION}
              </Link>
            </Stack>
          ) : null}
          <CopilotQuickActions label="Suggested actions" actions={suggestedActions} onAction={handleAction} />
          <DraftDocumentChips
            files={previewDraft.attachments.map((file) => ({ id: file.id, label: file.name }))}
            onOpen={(id) => {
              const file = previewDraft.attachments.find((attachment) => attachment.id === id)
              if (file) onOpenDocument?.(file, { draft: buildFinalDraft(), messages })
            }}
          />
        </>
      )}
    </DraftDrawerShell>
  )
}
