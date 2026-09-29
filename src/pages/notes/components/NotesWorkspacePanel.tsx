import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { layoutTokens } from '@/design-system/tokens/layout'
import { CopilotComposer } from '@/pages/policies/components/CopilotComposer'
import { CopilotContentTransition } from '@/pages/policies/components/copilot/CopilotContentTransition'
import { CopilotDrawerSubHeader } from '@/pages/policies/components/copilot/CopilotDrawerSubHeader'
import {
  copilotDrawerHeadingSx,
  copilotDrawerTabsSx,
} from '@/pages/policies/components/copilot/copilotDrawerStyles'
import {
  classifyNoteIntent,
  fileOnLabel,
  formatNoteTimestamp,
  formatTaskCreatedLine,
  quietBindLine,
  templateActionLabel,
  type NoteIntentDefinition,
} from '@/pages/notes/data/noteIntents'
import { buildHistoryForRecord } from '@/pages/notes/data/mockNoteThreads'
import {
  buildDocumentEmptyBody,
  buildDocumentNoteStarters,
  buildDocumentPulledLine,
  buildHomeNoteStarters,
  buildRecordEmptyBody,
  buildRecordNoteStarters,
  historyScopeLabel,
  HOME_NOTE_EMPTY_BODY,
  resolveStarterBind,
  type NoteEmptyStarter,
} from '@/pages/notes/data/noteEmptyStarters'
import { buildNoteRecordCatalog, recordFromContext } from '@/pages/notes/data/noteRecordCatalog'
import {
  NOTE_CURRENT_USER,
  type NoteAttachment,
  type NoteBoundRecord,
  type NoteFollowUpTask,
  type NoteThread,
  type NoteThreadMessage,
} from '@/pages/notes/data/noteTypes'
import { NotesConversationView } from '@/pages/notes/components/NotesConversationView'
import { NotesHistoryList } from '@/pages/notes/components/NotesHistoryList'
import {
  formatFollowUpDueLabel,
  type FollowUpPriority,
} from '@/pages/submissions/components/ScheduleProducerFollowUpCard'

type NotesTab = 'new' | 'history'

type NotesWorkspacePanelProps = {
  contextTitle?: string | null
  contextSubtitle?: string | null
  seedDocuments?: Array<{ id: string; fileName: string }>
  onClose?: () => void
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/** Default “File on …” target when unbound (Midwest loss-run policy from Daily summary). */
function defaultFileOnRecord(catalog: NoteBoundRecord[]): NoteBoundRecord {
  return (
    catalog.find((row) => row.reference === '01-CP-000017809-0') ??
    catalog.find((row) => row.kind === 'policy') ??
    catalog[0]!
  )
}

function classifiedActions(input: {
  intent: NoteIntentDefinition
  bound: NoteBoundRecord | null
  fileOnTarget: NoteBoundRecord
  isPrivate: boolean
}): string[] {
  const { intent, bound, fileOnTarget, isPrivate } = input
  const privacyAction = isPrivate ? 'Make public' : 'Make private'
  const intentActions = ['Follow-up task', templateActionLabel(intent.label), privacyAction]
  if (!bound) {
    return [fileOnLabel(fileOnTarget), ...intentActions]
  }
  return intentActions
}

function clearSuggestedActions(messages: NoteThreadMessage[]) {
  return messages.map((message) =>
    message.suggestedActions ? { ...message, suggestedActions: undefined } : message,
  )
}

function mergeAttachments(
  current: NoteAttachment[],
  files?: Array<{ id: string; name: string }>,
): NoteAttachment[] {
  if (!files || files.length === 0) return current
  const next = [...current]
  files.forEach((file) => {
    if (!next.some((item) => item.id === file.id)) {
      next.push({ id: file.id, fileName: file.name })
    }
  })
  return next
}

export function NotesWorkspacePanel({
  contextTitle,
  contextSubtitle,
  seedDocuments = [],
  onClose,
}: NotesWorkspacePanelProps) {
  const catalog = useMemo(() => buildNoteRecordCatalog(), [])
  const pageRecord = useMemo(
    () => recordFromContext(contextTitle, contextSubtitle),
    [contextTitle, contextSubtitle],
  )
  const fileOnTarget = useMemo(() => defaultFileOnRecord(catalog), [catalog])
  const hasDocumentContext = seedDocuments.length > 0
  const emptyStarters = useMemo(() => {
    if (hasDocumentContext && pageRecord) {
      return buildDocumentNoteStarters(pageRecord, seedDocuments)
    }
    if (pageRecord) return buildRecordNoteStarters(pageRecord)
    return buildHomeNoteStarters()
  }, [hasDocumentContext, pageRecord, seedDocuments])
  const emptyBody = useMemo(() => {
    if (hasDocumentContext && pageRecord) return buildDocumentEmptyBody(pageRecord, seedDocuments)
    if (pageRecord) return buildRecordEmptyBody(pageRecord)
    return HOME_NOTE_EMPTY_BODY
  }, [hasDocumentContext, pageRecord, seedDocuments])
  const scopeLabel = historyScopeLabel(pageRecord)

  const [notesTab, setNotesTab] = useState<NotesTab>('new')
  const [boundRecord, setBoundRecord] = useState<NoteBoundRecord | null>(pageRecord)
  const [composerMessage, setComposerMessage] = useState('')
  const [messages, setMessages] = useState<NoteThreadMessage[]>([])
  const [intent, setIntent] = useState<NoteIntentDefinition | null>(null)
  const [isPrivate, setIsPrivate] = useState(false)
  const [subject, setSubject] = useState('')
  const [taskCardOpen, setTaskCardOpen] = useState(false)
  const [followUpTask, setFollowUpTask] = useState<NoteFollowUpTask | null>(null)
  const [attachments, setAttachments] = useState<NoteAttachment[]>([])
  const [userText, setUserText] = useState('')
  const [history, setHistory] = useState<NoteThread[]>(() => buildHistoryForRecord(pageRecord?.id))
  const [activeThread, setActiveThread] = useState<NoteThread | null>(null)
  /** Autosaved note id for the current New conversation (patched on later turns). */
  const [persistedNoteId, setPersistedNoteId] = useState<string | null>(null)
  /** Whether document seed chips / pulled line have been applied for this New thread. */
  const documentContextAppliedRef = useRef(false)
  const composerKey = notesTab === 'new' && !activeThread ? 'notes-new' : `notes-${activeThread?.id ?? 'hist'}`

  useEffect(() => {
    setBoundRecord(pageRecord)
    setHistory(buildHistoryForRecord(pageRecord?.id))
  }, [pageRecord])

  const followUpTaskName = useMemo(() => {
    if (boundRecord) {
      return `Follow-up · ${boundRecord.label.split(',')[0]} · ${boundRecord.reference}`
    }
    return 'Follow-up task'
  }, [boundRecord])

  const resetNewConversation = useCallback(() => {
    setIntent(null)
    setIsPrivate(false)
    setSubject('')
    setTaskCardOpen(false)
    setFollowUpTask(null)
    setUserText('')
    setComposerMessage('')
    setPersistedNoteId(null)
    setBoundRecord(pageRecord)
    setAttachments([])
    setMessages([])
    documentContextAppliedRef.current = false
  }, [pageRecord])

  /** On first send/starter with document context: file chips + short pulled line (not empty-state wall). */
  const applyDocumentContextIfNeeded = useCallback(
    (baseMessages: NoteThreadMessage[]): {
      nextMessages: NoteThreadMessage[]
      nextAttachments: NoteAttachment[]
    } => {
      if (!hasDocumentContext || documentContextAppliedRef.current) {
        return { nextMessages: baseMessages, nextAttachments: attachments }
      }
      documentContextAppliedRef.current = true
      const nextAttachments = seedDocuments.map((doc) => ({
        id: doc.id,
        fileName: doc.fileName,
      }))
      setAttachments(nextAttachments)
      const pulled: NoteThreadMessage = {
        id: uid('pulled'),
        kind: 'copilot',
        text: buildDocumentPulledLine(seedDocuments),
        createdAt: formatNoteTimestamp(),
      }
      return {
        nextMessages: [...baseMessages, pulled],
        nextAttachments,
      }
    },
    [attachments, hasDocumentContext, seedDocuments],
  )

  const patchPersistedNote = useCallback(
    (noteId: string, patch: Partial<NoteThread> | ((thread: NoteThread) => NoteThread)) => {
      setHistory((current) =>
        current.map((thread) => {
          if (thread.id !== noteId) return thread
          return typeof patch === 'function' ? patch(thread) : { ...thread, ...patch }
        }),
      )
    },
    [],
  )

  const persistOrPatchNote = useCallback(
    (input: {
      noteId: string | null
      nextBound: NoteBoundRecord | null
      nextIntent: NoteIntentDefinition
      nextSubject: string
      preview: string
      nextMessages: NoteThreadMessage[]
      nextPrivate: boolean
      nextFollowUp: NoteFollowUpTask | null
      nextAttachments: NoteAttachment[]
    }) => {
      const {
        noteId,
        nextBound,
        nextIntent,
        nextSubject,
        preview,
        nextMessages,
        nextPrivate,
        nextFollowUp,
        nextAttachments,
      } = input
      const createdAt = formatNoteTimestamp()
      const isUnboundDraft = !nextBound

      if (noteId) {
        patchPersistedNote(noteId, (thread) => ({
          ...thread,
          boundRecord: nextBound,
          subject: nextSubject,
          preview,
          intent: nextIntent.id,
          intentLabel: nextIntent.label,
          isPrivate: nextPrivate,
          isUnboundDraft,
          followUpTask: nextFollowUp,
          attachments: nextAttachments,
          messages: clearSuggestedActions(nextMessages),
        }))
        return noteId
      }

      const id = uid('note')
      const thread: NoteThread = {
        id,
        boundRecord: nextBound,
        subject: nextSubject,
        preview,
        intent: nextIntent.id,
        intentLabel: nextIntent.label,
        author: NOTE_CURRENT_USER,
        createdAt,
        isPrivate: nextPrivate,
        isUnboundDraft,
        followUpTask: nextFollowUp,
        attachments: nextAttachments,
        messages: clearSuggestedActions(nextMessages),
        replies: [],
      }
      setHistory((current) => [thread, ...current])
      setPersistedNoteId(id)
      return id
    },
    [patchPersistedNote],
  )

  const handleTabChange = (_: unknown, value: NotesTab) => {
    setNotesTab(value)
    setActiveThread(null)
    setTaskCardOpen(false)
  }

  const handleSend = (
    raw: string,
    files?: Array<{ id: string; name: string }>,
    bindOverride?: NoteBoundRecord | null,
  ) => {
    const text = raw.trim()
    const nextAttachments = mergeAttachments(attachments, files)
    if (files && files.length > 0) setAttachments(nextAttachments)
    if (!text && (!files || files.length === 0)) return

    if (activeThread && notesTab === 'history') {
      if (!text) return
      const reply: NoteThreadMessage = {
        id: uid('reply'),
        kind: 'user',
        author: NOTE_CURRENT_USER,
        text,
        createdAt: formatNoteTimestamp(),
      }
      setHistory((current) =>
        current.map((thread) =>
          thread.id === activeThread.id ? { ...thread, replies: [...thread.replies, reply] } : thread,
        ),
      )
      setActiveThread((current) =>
        current ? { ...current, replies: [...current.replies, reply] } : current,
      )
      setComposerMessage('')
      return
    }

    if (!text) return

    const createdAt = formatNoteTimestamp()
    const userMessage: NoteThreadMessage = {
      id: uid('user'),
      kind: 'user',
      author: NOTE_CURRENT_USER,
      text,
      createdAt,
    }

    const nextBound = bindOverride !== undefined ? bindOverride : boundRecord
    if (bindOverride) setBoundRecord(bindOverride)

    // Later replies / edits on an already-autosaved note: append + patch (no re-classify).
    if (persistedNoteId && intent) {
      setUserText(text)
      const nextMessages = [...clearSuggestedActions(messages), userMessage]
      setMessages(nextMessages)
      setComposerMessage('')
      setTaskCardOpen(false)
      persistOrPatchNote({
        noteId: persistedNoteId,
        nextBound,
        nextIntent: intent,
        nextSubject: subject || intent.buildSubject({ text, record: nextBound }),
        preview: text,
        nextMessages,
        nextPrivate: isPrivate,
        nextFollowUp: followUpTask,
        nextAttachments,
      })
      return
    }

    const classified = classifyNoteIntent(text)
    // Silent bind to open record when Notes opened from policy/document.
    const effectiveBound = nextBound ?? pageRecord
    if (!nextBound && pageRecord) setBoundRecord(pageRecord)

    const nextSubject = classified.buildSubject({ text, record: effectiveBound })
    const nextPrivate = classified.id === 'private-scratch' ? true : isPrivate
    setIntent(classified)
    setUserText(text)
    setSubject(nextSubject)
    if (classified.id === 'private-scratch') setIsPrivate(true)

    const bindQuiet = effectiveBound ? `\n\n${quietBindLine(effectiveBound)}` : ''
    const classifyText = `${classified.classifyLine(effectiveBound)}${bindQuiet}`
    const actions = classifiedActions({
      intent: classified,
      bound: effectiveBound,
      fileOnTarget,
      isPrivate: nextPrivate,
    })

    const classifiedMessages = [
      ...clearSuggestedActions(messages),
      userMessage,
      {
        id: uid('copilot'),
        kind: 'copilot' as const,
        text: classifyText,
        createdAt,
        suggestedActions: actions,
      },
    ]
    const { nextMessages, nextAttachments: docAttachments } =
      applyDocumentContextIfNeeded(classifiedMessages)
    const persistAttachments =
      docAttachments.length > nextAttachments.length ? docAttachments : nextAttachments
    setMessages(nextMessages)
    setComposerMessage('')
    setTaskCardOpen(false)

    persistOrPatchNote({
      noteId: persistedNoteId,
      nextBound: effectiveBound,
      nextIntent: classified,
      nextSubject,
      preview: text,
      nextMessages,
      nextPrivate,
      nextFollowUp: followUpTask,
      nextAttachments: persistAttachments,
    })
  }

  const handleStarter = (starter: NoteEmptyStarter) => {
    const bind = resolveStarterBind(starter) ?? pageRecord
    if (bind) setBoundRecord(bind)
    handleSend(starter.prefill, undefined, bind ?? boundRecord)
  }

  const handleBind = (record: NoteBoundRecord) => {
    setBoundRecord(record)
    const nextSubject = intent
      ? intent.buildSubject({ text: userText, record })
      : subject
    setSubject(nextSubject)
    const line = `Filed on ${quietBindLine(record).replace(/^On /, '')}.`
    const actions = intent
      ? classifiedActions({ intent, bound: record, fileOnTarget, isPrivate })
      : undefined
    const nextMessages = [
      ...clearSuggestedActions(messages),
      {
        id: uid('copilot'),
        kind: 'copilot' as const,
        text: line,
        createdAt: formatNoteTimestamp(),
        suggestedActions: actions,
      },
    ]
    setMessages(nextMessages)
    if (persistedNoteId && intent) {
      persistOrPatchNote({
        noteId: persistedNoteId,
        nextBound: record,
        nextIntent: intent,
        nextSubject,
        preview: userText || 'Note',
        nextMessages,
        nextPrivate: isPrivate,
        nextFollowUp: followUpTask,
        nextAttachments: attachments,
      })
    }
  }

  const handleAction = (action: string) => {
    const createdAt = formatNoteTimestamp()

    if (action === fileOnLabel(fileOnTarget)) {
      handleBind(fileOnTarget)
      return
    }
    if (action === 'Attach current document') {
      const toAdd = seedDocuments.filter((doc) => !attachments.some((a) => a.id === doc.id))
      if (toAdd.length === 0) return
      const nextAttachments = [
        ...attachments,
        ...toAdd.map((doc) => ({ id: doc.id, fileName: doc.fileName })),
      ]
      setAttachments(nextAttachments)
      const line = `Attached ${toAdd.map((d) => d.fileName).join(', ')}.`
      const actions = intent
        ? classifiedActions({ intent, bound: boundRecord, fileOnTarget, isPrivate })
        : undefined
      const nextMessages = [
        ...clearSuggestedActions(messages),
        {
          id: uid('attach'),
          kind: 'copilot' as const,
          text: line,
          createdAt,
          suggestedActions: actions,
        },
      ]
      setMessages(nextMessages)
      if (persistedNoteId && intent) {
        persistOrPatchNote({
          noteId: persistedNoteId,
          nextBound: boundRecord,
          nextIntent: intent,
          nextSubject: subject,
          preview: userText || 'Note',
          nextMessages,
          nextPrivate: isPrivate,
          nextFollowUp: followUpTask,
          nextAttachments,
        })
      }
      return
    }
    if (action === 'Make private' || action === 'Make public') {
      setIsPrivate((prev) => {
        const next = !prev
        const line = next
          ? 'Note marked private — only you can see it in History.'
          : 'Note is visible to the team again.'
        const actions = intent
          ? classifiedActions({
              intent,
              bound: boundRecord,
              fileOnTarget,
              isPrivate: next,
            })
          : undefined
        const nextMessages = [
          ...clearSuggestedActions(messages),
          {
            id: uid('privacy'),
            kind: 'copilot' as const,
            text: line,
            createdAt,
            suggestedActions: actions,
          },
        ]
        setMessages(nextMessages)
        if (persistedNoteId && intent) {
          persistOrPatchNote({
            noteId: persistedNoteId,
            nextBound: boundRecord,
            nextIntent: intent,
            nextSubject: subject,
            preview: userText || 'Note',
            nextMessages,
            nextPrivate: next,
            nextFollowUp: followUpTask,
            nextAttachments: attachments,
          })
        }
        return next
      })
      return
    }
    if (action === 'Follow-up task') {
      setTaskCardOpen(true)
      setMessages((current) => clearSuggestedActions(current))
      return
    }
    if (intent && action === templateActionLabel(intent.label)) {
      const draft = intent.buildDraft({ text: userText, record: boundRecord })
      const missing = intent.detectMissing(userText)
      const nextSubject = intent.buildSubject({ text: userText, record: boundRecord })
      setSubject(nextSubject)
      const nextMessages = [
        ...clearSuggestedActions(messages),
        {
          id: uid('draft'),
          kind: 'draft' as const,
          text: draft,
          createdAt,
          missingFields: missing.length > 0 ? missing : undefined,
          suggestedActions: classifiedActions({
            intent,
            bound: boundRecord,
            fileOnTarget,
            isPrivate,
          }),
        },
      ]
      setMessages(nextMessages)
      if (persistedNoteId) {
        persistOrPatchNote({
          noteId: persistedNoteId,
          nextBound: boundRecord,
          nextIntent: intent,
          nextSubject,
          preview: userText || 'Note',
          nextMessages,
          nextPrivate: isPrivate,
          nextFollowUp: followUpTask,
          nextAttachments: attachments,
        })
      }
    }
  }

  const handleCreateTask = (task: {
    name: string
    assignee: string
    priority: FollowUpPriority
    due: Date
    notes: string
  }) => {
    const followUp: NoteFollowUpTask = {
      name: task.name,
      assignee: task.assignee,
      priority: task.priority,
      dueLabel: formatFollowUpDueLabel(task.due),
    }
    setFollowUpTask(followUp)
    setTaskCardOpen(false)
    const line = formatTaskCreatedLine(followUp)
    const actions = intent
      ? classifiedActions({ intent, bound: boundRecord, fileOnTarget, isPrivate })
      : undefined
    const nextMessages = [
      ...clearSuggestedActions(messages),
      {
        id: uid('task'),
        kind: 'task-summary' as const,
        text: line,
        createdAt: formatNoteTimestamp(),
        suggestedActions: actions,
      },
    ]
    setMessages(nextMessages)
    if (persistedNoteId && intent) {
      persistOrPatchNote({
        noteId: persistedNoteId,
        nextBound: boundRecord,
        nextIntent: intent,
        nextSubject: subject,
        preview: userText || 'Note',
        nextMessages,
        nextPrivate: isPrivate,
        nextFollowUp: followUp,
        nextAttachments: attachments,
      })
    }
  }

  const showComposer = notesTab === 'new' || Boolean(activeThread)
  const threadDetail = [
    boundRecord?.reference ?? intent?.label,
    isPrivate ? 'Private' : null,
    !boundRecord && subject ? 'Draft' : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const contentKey = [
    notesTab,
    activeThread?.id ?? 'list',
    boundRecord?.id ?? 'none',
    subject ? 'has-subject' : 'no-subject',
    messages.length,
    taskCardOpen ? 'task' : 'notask',
    followUpTask ? 'has-task' : 'no-task',
  ].join(':')

  const body =
    notesTab === 'history' ? (
      <NotesHistoryList
        threads={history}
        activeThread={activeThread}
        scopeLabel={scopeLabel}
        onSelectThread={setActiveThread}
        onBackFromThread={() => setActiveThread(null)}
      />
    ) : (
      <>
        {subject ? (
          <CopilotDrawerSubHeader
            title={subject}
            detail={threadDetail || undefined}
            onBack={resetNewConversation}
          />
        ) : null}
        <NotesConversationView
          messages={messages}
          attachments={attachments}
          showEmptyHelper
          emptyBody={emptyBody}
          emptyStarters={emptyStarters}
          taskCardOpen={taskCardOpen}
          followUpTask={followUpTask}
          followUpTaskName={followUpTaskName}
          followUpNotesPrefill={userText}
          onAction={handleAction}
          onStarter={handleStarter}
          onCreateTask={handleCreateTask}
          onCancelTask={() => setTaskCardOpen(false)}
        />
      </>
    )

  return (
    <Box
      sx={{
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
          px: 2,
          pt: layoutTokens.policyHeaderTopPadding,
          pb: 0,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" component="h2" sx={copilotDrawerHeadingSx}>
            Notes
          </Typography>
          {onClose ? (
            <IconButton size="small" onClick={onClose} aria-label="Close Notes">
              <CloseIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Box>

        <Tabs value={notesTab} onChange={handleTabChange} sx={copilotDrawerTabsSx}>
          <Tab label="New" value="new" />
          <Tab label="History" value="history" />
        </Tabs>
      </Box>

      <Box
        sx={{
          px: 2,
          py: 2,
          flexGrow: 1,
          overflowY: 'auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <CopilotContentTransition contentKey={contentKey}>{body}</CopilotContentTransition>
      </Box>

      {showComposer ? (
        <Box sx={{ flexShrink: 0 }}>
          <CopilotComposer
            key={composerKey}
            placeholder={activeThread ? 'Write a reply…' : 'Write a note…'}
            value={composerMessage}
            onChange={setComposerMessage}
            attachmentResetKey={boundRecord?.id ?? activeThread?.id ?? 'notes'}
            showModeSelector={false}
            onSubmit={handleSend}
          />
        </Box>
      ) : null}
    </Box>
  )
}
