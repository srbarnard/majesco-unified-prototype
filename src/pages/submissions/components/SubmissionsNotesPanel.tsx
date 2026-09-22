import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useState } from 'react'
import { layoutTokens } from '@/design-system/tokens/layout'
import { CopilotComposer } from '@/pages/policies/components/CopilotComposer'
import { CopilotContentTransition } from '@/pages/policies/components/copilot/CopilotContentTransition'
import {
  copilotDrawerHeadingSx,
  copilotDrawerTabsSx,
} from '@/pages/policies/components/copilot/copilotDrawerStyles'
import { NotesHistoryView, type NotesHistoryGroup } from '@/pages/submissions/components/NotesHistoryView'
import { NotesNewView } from '@/pages/submissions/components/NotesNewView'
import { NotesThreadView } from '@/pages/submissions/components/NotesThreadView'
import {
  buildAllNoteThreads,
  buildNoteThreadsForSubmission,
  formatNoteTimestamp,
  resolveNoteTypeLabel,
  type NoteTemplate,
  type SubmissionNoteThread,
} from '@/pages/submissions/data/mockSubmissionNotes'
import type { SubmissionListRecord } from '@/pages/submissions/data/mockSubmissions'

type NotesTab = 'new' | 'history'

type SubmissionsNotesPanelProps = {
  focusedSubmission?: SubmissionListRecord | null
  submissions?: SubmissionListRecord[]
  /** Open History on this thread (e.g. from Recent activity “Note added”). */
  initialThreadId?: string | null
  onSaveNote?: (submissionId: string, note: string) => void
  /** Return to previous drawer context without closing the tool. */
  onBack?: () => void
  onClose?: () => void
}

function submissionGroupLabel(submission: SubmissionListRecord) {
  return `${submission.submissionNumber} · ${submission.insuredName}`
}

export function SubmissionsNotesPanel({
  focusedSubmission,
  submissions = [],
  initialThreadId = null,
  onSaveNote,
  onBack,
  onClose,
}: SubmissionsNotesPanelProps) {
  const workspaceMode = !focusedSubmission
  const [notesTab, setNotesTab] = useState<NotesTab>('new')
  const [activeThread, setActiveThread] = useState<SubmissionNoteThread | null>(null)
  const [composerMessage, setComposerMessage] = useState('')
  const [activeTemplate, setActiveTemplate] = useState<NoteTemplate | null>(null)
  const [threads, setThreads] = useState<SubmissionNoteThread[]>([])
  const [applyToSubmission, setApplyToSubmission] = useState<SubmissionListRecord | null>(null)

  const targetSubmission = focusedSubmission ?? applyToSubmission

  useEffect(() => {
    const nextThreads = focusedSubmission
      ? buildNoteThreadsForSubmission(focusedSubmission.id, focusedSubmission.notes)
      : buildAllNoteThreads(submissions)

    setComposerMessage('')
    setActiveTemplate(null)
    setApplyToSubmission(null)
    setThreads(nextThreads)

    if (initialThreadId) {
      const thread = nextThreads.find((entry) => entry.id === initialThreadId) ?? null
      setNotesTab('history')
      setActiveThread(thread)
      return
    }

    setNotesTab('new')
    setActiveThread(null)
  }, [focusedSubmission?.id, initialThreadId, submissions])

  const historyGroups = useMemo<NotesHistoryGroup[]>(() => {
    if (!workspaceMode) return []
    const byId = new Map(submissions.map((row) => [row.id, row]))
    const grouped = new Map<string, SubmissionNoteThread[]>()
    threads.forEach((thread) => {
      const current = grouped.get(thread.submissionId) ?? []
      current.push(thread)
      grouped.set(thread.submissionId, current)
    })
    return [...grouped.entries()].map(([id, groupThreads]) => {
      const submission = byId.get(id)
      return {
        id,
        label: submission ? submissionGroupLabel(submission) : id,
        threads: groupThreads,
      }
    })
  }, [submissions, threads, workspaceMode])

  const handleTabChange = (_: unknown, value: NotesTab) => {
    setNotesTab(value)
    setActiveThread(null)
  }

  const handleSelectTemplate = (template: NoteTemplate) => {
    setActiveTemplate(template)
    setComposerMessage(
      template.skeleton({
        submissionNumber: targetSubmission?.submissionNumber ?? 'SUB-',
        insuredName: targetSubmission?.insuredName ?? '',
        draft: composerMessage,
      }),
    )
  }

  const handleSubmitNote = (message: string) => {
    if (!message.trim()) return

    const createdAt = formatNoteTimestamp()

    if (activeThread) {
      const reply = {
        id: `${activeThread.id}-r-${Date.now()}`,
        author: { initials: 'CR', name: 'You' },
        text: message.trim(),
        createdAt,
      }
      setThreads((current) =>
        current.map((thread) =>
          thread.id === activeThread.id ? { ...thread, replies: [...thread.replies, reply] } : thread,
        ),
      )
      setActiveThread((current) => (current ? { ...current, replies: [...current.replies, reply] } : current))
      setComposerMessage('')
      onSaveNote?.(activeThread.submissionId, message.trim())
      return
    }

    if (!targetSubmission) return

    const thread: SubmissionNoteThread = {
      id: `${targetSubmission.id}-note-${Date.now()}`,
      submissionId: targetSubmission.id,
      preview: message.trim(),
      typeLabel: resolveNoteTypeLabel(message, activeTemplate),
      author: { initials: 'CR', name: 'You' },
      createdAt,
      replies: [],
    }
    setThreads((current) => [thread, ...current])
    setActiveTemplate(null)
    setComposerMessage('')
    onSaveNote?.(targetSubmission.id, message.trim())
  }

  const showComposer = notesTab === 'new' || Boolean(activeThread)
  const contentKey = [
    notesTab,
    activeThread ? `thread:${activeThread.id}` : 'list',
    activeTemplate?.id ?? 'none',
    focusedSubmission?.id ?? applyToSubmission?.id ?? 'workspace',
  ].join(':')

  const body =
    notesTab === 'history' && activeThread ? (
      <NotesThreadView thread={activeThread} onBack={() => setActiveThread(null)} />
    ) : notesTab === 'history' ? (
      <NotesHistoryView
        threads={threads}
        groups={workspaceMode ? historyGroups : undefined}
        onSelectThread={setActiveThread}
      />
    ) : (
      <NotesNewView
        submission={targetSubmission}
        submissions={submissions}
        draft={composerMessage}
        activeTemplate={activeTemplate}
        onSelectTemplate={handleSelectTemplate}
        onSelectSubmission={workspaceMode ? setApplyToSubmission : undefined}
      />
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            {onBack ? (
              <IconButton size="small" onClick={onBack} aria-label="Back" sx={{ ml: -0.75 }}>
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            ) : null}
            <Typography variant="subtitle1" component="h2" sx={copilotDrawerHeadingSx}>
              Notes
            </Typography>
          </Box>
          {onClose && (
            <IconButton size="small" onClick={onClose} aria-label="Close Notes">
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
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
        }}
      >
        <CopilotContentTransition contentKey={contentKey}>{body}</CopilotContentTransition>
      </Box>

      {showComposer && (
        <CopilotComposer
          placeholder={
            activeThread
              ? 'Write a reply…'
              : targetSubmission
                ? 'Write a note…'
                : 'Write a note, then apply it to a submission…'
          }
          value={composerMessage}
          onChange={setComposerMessage}
          attachmentResetKey={targetSubmission?.id ?? 'workspace'}
          showModeSelector={false}
          onSubmit={handleSubmitNote}
        />
      )}
    </Box>
  )
}
