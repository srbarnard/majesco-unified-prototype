import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BlockIcon from '@mui/icons-material/Block'
import CheckIcon from '@mui/icons-material/Check'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import CloseIcon from '@mui/icons-material/Close'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Button, CopilotQuickActions } from '@/design-system/components'
import { filterFooterButtonSx } from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { layoutTokens } from '@/design-system/tokens/layout'
import { CopilotComposer, type CopilotAttachedFile } from '@/pages/policies/components/CopilotComposer'
import {
  copilotDrawerHeadingSx,
  copilotDrawerTabsSx,
  copilotSubtitleSx,
} from '@/pages/policies/components/copilot/copilotDrawerStyles'
import {
  ADD_TASK_ASSIGNEES,
  ADD_TASK_RELATED,
  ADD_TASK_SEEDS,
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

const panelPx = 2

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
  fontSize: '0.875rem',
  lineHeight: 1.55,
} as const

const chipSx = {
  fontFamily: figmaFontFamilyStack.body,
  fontSize: '0.75rem',
  height: 28,
  maxWidth: '100%',
  '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
} as const

const inputSx = {
  '& .MuiInputBase-input': { fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' },
} as const

const PRIORITY_OPTIONS: TaskPriority[] = ['Low', 'Medium', 'High']
const backRowSx = {
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr)',
  columnGap: 0.5,
  alignItems: 'center',
} as const

const ADD_BLOCKER_ACTION = 'Add blocker'
const CANCEL_TASK_ACTION = 'Cancel task'
const LIVE_PARSE_DEBOUNCE_MS = 300

type EditField = 'title' | 'assignee' | 'related' | 'priority' | 'due' | 'description'

type ThreadMessage = { id: string; text: string; files?: string[] }

export type AddTaskSavedState = {
  draft: AddTaskDraft
  messages: ThreadMessage[]
}

export type AddTaskHistoryEntry = {
  task: TaskRecord
  createdAt: Date
}

type AddTaskPanelProps = {
  initialState?: AddTaskSavedState | null
  initialTab?: 'new' | 'history'
  history: AddTaskHistoryEntry[]
  onClose: () => void
  onSaveDraft: (state: AddTaskSavedState) => void
  onCreate: (task: TaskRecord) => void
  onOpenTask: (taskId: string) => void
  pageContext?: AddTaskPageContext
  /** Record from a row menu or the selected grid row; starts a fresh draft with only Related set. */
  initialRelated?: AddTaskRelated | null
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const RELATED_BY_LABEL = new Map(ADD_TASK_RELATED.map((record) => [relatedLabel(record), record]))
const RELATED_OPTIONS = [...RELATED_BY_LABEL.keys()]

function relatedSearchText(label: string) {
  const record = RELATED_BY_LABEL.get(label)
  return record ? `${label} ${record.names.join(' ')}` : label
}

function formatCreatedTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const prefersFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(pointer: fine)').matches === true

function FileChip({ name }: { name: string }) {
  return (
    <Chip
      size="small"
      variant="outlined"
      icon={<AttachFileOutlinedIcon sx={{ fontSize: 16 }} />}
      label={name}
      sx={{ ...chipSx, height: 24, borderColor: 'divider', bgcolor: 'background.paper' }}
    />
  )
}

function InlineOptions({
  options,
  selected,
  onPick,
}: {
  options: string[]
  selected: string | null
  onPick: (option: string) => void
}) {
  return (
    <Stack direction="row" flexWrap="wrap" useFlexGap gap={0.75}>
      {options.map((option) => {
        const isSelected = option === selected
        return (
          <Chip
            key={option}
            label={option}
            clickable
            color={isSelected ? 'primary' : 'default'}
            variant={isSelected ? 'filled' : 'outlined'}
            onClick={() => onPick(option)}
            sx={{ ...chipSx, ...(isSelected ? {} : { borderColor: 'divider' }) }}
          />
        )
      })}
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
              sx={{ ...chipSx, ...(isSelected ? {} : { borderColor: 'divider' }) }}
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
          sx={{ ...inputSx, maxWidth: 200 }}
        />
      ) : null}
    </Stack>
  )
}

function InlineLookup({
  options,
  placeholder,
  hint,
  searchText,
  onPick,
  onDismiss,
}: {
  options: string[]
  placeholder: string
  hint?: string
  /** Extra text an option matches on beyond its label (e.g. producer names). */
  searchText?: (option: string) => string
  onPick: (option: string) => void
  onDismiss: () => void
}) {
  const filterOptions = useMemo(
    () => (searchText ? createFilterOptions<string>({ stringify: searchText }) : undefined),
    [searchText],
  )
  return (
    <Box>
      <Autocomplete
        size="small"
        options={options}
        filterOptions={filterOptions}
        openOnFocus
        autoHighlight
        onChange={(_, next) => {
          if (next) onPick(next)
        }}
        onClose={(_, reason) => {
          if (reason === 'escape') onDismiss()
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            autoFocus={prefersFinePointer()}
            inputProps={{ ...params.inputProps, 'aria-label': placeholder }}
            sx={inputSx}
          />
        )}
        slotProps={{ listbox: { sx: { fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' } } }}
      />
      {hint ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', mt: 0.5 }}
        >
          {hint}
        </Typography>
      ) : null}
    </Box>
  )
}

function InlineTextEdit({
  initialValue,
  multiline = false,
  label,
  onCommit,
  onDismiss,
}: {
  initialValue: string
  multiline?: boolean
  label: string
  onCommit: (value: string) => void
  onDismiss: () => void
}) {
  const [value, setValue] = useState(initialValue)
  const commit = () => {
    const next = value.trim()
    if (next) onCommit(next)
    else onDismiss()
  }
  return (
    <TextField
      size="small"
      fullWidth
      multiline={multiline}
      minRows={multiline ? 3 : undefined}
      value={value}
      autoFocus={prefersFinePointer()}
      onChange={(event) => setValue(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onDismiss()
        if (event.key === 'Enter' && (!multiline || event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          commit()
        }
      }}
      inputProps={{ 'aria-label': label }}
      sx={inputSx}
    />
  )
}

function HistoryList({
  entries,
  onOpenTask,
}: {
  entries: AddTaskHistoryEntry[]
  onOpenTask: (taskId: string) => void
}) {
  if (entries.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, textAlign: 'center', py: 4 }}>
        Tasks you create this session show up here.
      </Typography>
    )
  }
  return (
    <Stack sx={{ mx: -panelPx, mt: -1 }}>
      {entries.map(({ task, createdAt }) => (
        <Box
          key={task.id}
          component="button"
          type="button"
          onClick={() => onOpenTask(task.id)}
          sx={{
            width: '100%',
            display: 'block',
            px: panelPx,
            py: 1.5,
            border: 'none',
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Typography variant="body2" noWrap sx={{ ...bodySx, fontWeight: 600 }}>
            {task.taskName}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', mt: 0.25 }}
          >
            {[task.assignedTo, formatCreatedTime(createdAt)].join(' · ')}
          </Typography>
        </Box>
      ))}
    </Stack>
  )
}

type NeededRow = {
  term: string
  /** Plain text for the row; null = still needed. */
  value: string | null
  field?: EditField
  tone?: 'error'
  extra?: ReactNode
}

function NeededStatusBadge({ tone }: { tone: 'success' | 'error' | 'empty' }) {
  return (
    <Box
      aria-label={tone === 'empty' ? 'Still needed' : tone === 'error' ? 'Blocker' : 'Filled'}
      sx={(theme) => {
        const isLight = theme.palette.mode === 'light'
        const palette =
          tone === 'error'
            ? theme.figmaPalette.red
            : tone === 'success'
              ? theme.figmaPalette.green
              : null
        return {
          width: 32,
          height: 32,
          borderRadius: '10px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          bgcolor: palette ? (isLight ? palette[100] : palette[900]) : 'action.hover',
          color: palette ? (isLight ? palette[800] : palette[200]) : 'text.disabled',
        }
      }}
    >
      {tone === 'error' ? (
        <BlockIcon sx={{ fontSize: 18 }} />
      ) : tone === 'success' ? (
        <CheckIcon sx={{ fontSize: 18 }} />
      ) : (
        <RadioButtonUncheckedIcon sx={{ fontSize: 18 }} />
      )}
    </Box>
  )
}

function NeededItem({
  row,
  expanded,
  onToggle,
  children,
}: {
  row: NeededRow
  expanded: boolean
  onToggle?: () => void
  children?: ReactNode
}) {
  const missing = row.value == null
  const line = (
    <>
      <NeededStatusBadge tone={row.tone === 'error' ? 'error' : missing ? 'empty' : 'success'} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="body2"
          sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.35 }}
        >
          {row.term}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ ...bodySx, fontSize: '0.8125rem', lineHeight: 1.4, mt: 0.25, overflowWrap: 'anywhere' }}
        >
          {missing ? 'still needed' : row.value}
        </Typography>
      </Box>
    </>
  )
  const lineSx = {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1.25,
    px: 2,
    py: 1.5,
    textAlign: 'left',
  } as const

  return (
    <Box
      component="li"
      sx={{
        listStyle: 'none',
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: (theme) => (expanded ? `inset 3px 0 0 ${theme.palette.primary.main}` : 'none'),
      }}
    >
      {onToggle ? (
        <ButtonBase
          disableRipple
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={`${missing ? 'Set' : 'Edit'} ${row.term.toLowerCase()}`}
          sx={{
            ...lineSx,
            color: 'text.primary',
            '&.Mui-focusVisible': { outline: 2, outlineColor: 'primary.main', outlineOffset: -2 },
          }}
        >
          {line}
        </ButtonBase>
      ) : (
        <Box sx={{ ...lineSx, color: 'text.primary' }}>{line}</Box>
      )}
      {row.extra || children ? (
        <Box sx={{ pl: 7.25, pr: 2, pb: 2, pt: 0.5 }}>
          {row.extra}
          {children ? <Box sx={{ mt: row.extra ? 0.75 : 0 }}>{children}</Box> : null}
        </Box>
      ) : null}
    </Box>
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
  const [tab, setTab] = useState<'new' | 'history'>(initialTab)
  const [draft, setDraft] = useState<AddTaskDraft>(() =>
    initialRelated
      ? { ...emptyAddTaskDraft, related: initialRelated }
      : (initialState?.draft ?? emptyAddTaskDraft),
  )
  const [messages, setMessages] = useState<ThreadMessage[]>(() =>
    initialRelated ? [] : (initialState?.messages ?? []),
  )
  const [composerValue, setComposerValue] = useState('')
  const [composerKey, setComposerKey] = useState(0)
  const [stagedFiles, setStagedFiles] = useState<CopilotAttachedFile[]>([])
  const [editing, setEditing] = useState<{ field: EditField; atCreate: boolean } | null>(null)
  const [promptedAtCreate, setPromptedAtCreate] = useState(false)
  const [blockerMode, setBlockerMode] = useState(false)
  const dueOptions = useMemo(() => buildDueOptions(), [])

  const [parsedComposerValue, setParsedComposerValue] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => setParsedComposerValue(composerValue), LIVE_PARSE_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [composerValue])

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
    setMessages((current) => [...current, { id: uid('user'), text: label }])
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
      { id: uid('user'), text, files: files.length > 0 ? files.map((file) => file.name) : undefined },
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

  const rows: NeededRow[] = [
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
          <InlineTextEdit
            initialValue={previewDraft.title}
            label="Task title"
            onCommit={(value) => applyEdit('title', value)}
            onDismiss={() => setEditing(null)}
          />
        )
      case 'description':
        return (
          <InlineTextEdit
            multiline
            initialValue={description}
            label="Task description"
            onCommit={(value) => applyEdit('description', value)}
            onDismiss={() => setEditing(null)}
          />
        )
      case 'assignee':
        return (
          <InlineLookup
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
          <InlineLookup
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
          <InlineOptions
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
    // Offer one lookup for a missing assignee / policy; a second Create commits as-is.
    const missing: EditField | null = !finalDraft.assignee ? 'assignee' : !finalDraft.related ? 'related' : null
    if (missing && !promptedAtCreate) {
      setPromptedAtCreate(true)
      toggleEditing(missing, true)
      return
    }
    onCreate(buildTaskFromDraft(finalDraft))
  }

  const handleSaveDraft = () => {
    onSaveDraft({ draft: buildFinalDraft(), messages })
  }

  return (
    <Box
      sx={{
        flex: 1,
        alignSelf: 'stretch',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: panelPx,
          pt: layoutTokens.policyHeaderTopPadding,
          pb: 0,
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography variant="subtitle1" component="h2" sx={{ ...copilotDrawerHeadingSx, flex: 1 }}>
            New task
          </Typography>
          <IconButton size="small" onClick={onClose} aria-label="Close new task drawer">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Tabs value={tab} onChange={(_, next) => setTab(next)} sx={copilotDrawerTabsSx}>
          <Tab label="New" value="new" />
          <Tab label="History" value="history" />
        </Tabs>
      </Box>

      <Box
        sx={{
          px: panelPx,
          pt: 2,
          pb: 2,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
        }}
      >
        {tab === 'history' ? (
          <HistoryList entries={history} onOpenTask={onOpenTask} />
        ) : (
          <>
            {!showNeeded ? (
              <>
                <Typography variant="subtitle1" sx={{ ...copilotSubtitleSx, lineHeight: 1.35, mb: 0.75 }}>
                  What’s the task?
                </Typography>
                <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, mb: 2, color: 'text.primary' }}>
                  Describe it in the composer. Copilot will draft the title, assignee, and related record and
                  suggest the next step.
                </Typography>
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
                <Box sx={{ ...backRowSx, mb: 1 }}>
                  <IconButton size="small" onClick={resetDraft} aria-label="Cancel task" sx={{ ml: -0.75 }}>
                    <ArrowBackIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="subtitle1" sx={{ ...copilotSubtitleSx, lineHeight: 1.35 }}>
                    {previewDraft.title || 'Untitled task'}
                  </Typography>
                  {originalRequest ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ ...bodySx, gridColumn: 2, lineHeight: 1.5, overflowWrap: 'anywhere' }}
                    >
                      {originalRequest}
                    </Typography>
                  ) : null}
                </Box>
                <Box
                  component="ul"
                  sx={{ m: 0, p: 0, mx: -panelPx, mb: 2 }}
                >
                  {rows.map((row) => {
                    const field = row.field
                    const expanded = field != null && editing?.field === field
                    return (
                      <NeededItem
                        key={row.term}
                        row={row}
                        expanded={expanded}
                        onToggle={field ? () => toggleEditing(field) : undefined}
                      >
                        {expanded && field ? renderEditor(field) : null}
                      </NeededItem>
                    )
                  })}
                </Box>

                <CopilotQuickActions label="Suggested actions" actions={suggestedActions} onAction={handleAction} />
              </>
            )}
          </>
        )}
      </Box>

      <Box sx={{ display: tab === 'new' ? 'contents' : 'none' }}>
        <Box sx={{ flexShrink: 0 }}>
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
        </Box>

        <Box sx={{ px: panelPx, pb: 2, pt: 0.5, flexShrink: 0 }}>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" color="primary" fullWidth onClick={handleSaveDraft} sx={filterFooterButtonSx}>
              Save draft
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={!commitDraft.title}
              onClick={handleCreate}
              sx={filterFooterButtonSx}
            >
              Create task
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}
