import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { SearchField } from '@/design-system/components'
import { chatAuthorAvatarSx, chatPeerAuthorAvatarSx } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { CopilotDrawerSubHeader } from '@/pages/policies/components/copilot/CopilotDrawerSubHeader'
import type { NotesHistoryFilter, NoteThread } from '@/pages/notes/data/noteTypes'
import { NOTE_CURRENT_USER } from '@/pages/notes/data/noteTypes'
import { NotesConversationView } from '@/pages/notes/components/NotesConversationView'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const FILTERS: { id: NotesHistoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'mine', label: 'Mine' },
  { id: 'replies', label: 'Replies' },
  { id: 'private', label: 'Private' },
]

function replyCountLabel(count: number) {
  if (count <= 0) return '0 replies'
  return `${count} ${count === 1 ? 'reply' : 'replies'}`
}

type NotesHistoryListProps = {
  threads: NoteThread[]
  activeThread: NoteThread | null
  /** e.g. “On this policy” when History is record-scoped */
  scopeLabel?: string | null
  onSelectThread: (thread: NoteThread) => void
  onBackFromThread: () => void
}

export function NotesHistoryList({
  threads,
  activeThread,
  scopeLabel = null,
  onSelectThread,
  onBackFromThread,
}: NotesHistoryListProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<NotesHistoryFilter>('all')

  const entries = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    return threads
      .filter((thread) => {
        if (filter === 'mine' && thread.author.name !== NOTE_CURRENT_USER.name) return false
        if (filter === 'replies' && thread.replies.length === 0) return false
        if (filter === 'private' && !thread.isPrivate) return false
        if (!normalized) return true
        return (
          thread.preview.toLowerCase().includes(normalized) ||
          thread.subject.toLowerCase().includes(normalized) ||
          thread.intentLabel.toLowerCase().includes(normalized)
        )
      })
      .slice()
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [filter, search, threads])

  if (activeThread) {
    const messages = [
      ...activeThread.messages.map((message) => ({ ...message, suggestedActions: undefined })),
      ...activeThread.replies.map((reply) => ({ ...reply, kind: 'user' as const })),
    ]
    return (
      <Box>
        <CopilotDrawerSubHeader
          title={activeThread.subject}
          detail={
            [
              activeThread.boundRecord?.reference ?? activeThread.intentLabel,
              activeThread.isPrivate ? 'Private' : null,
              activeThread.isUnboundDraft ? 'Draft' : null,
            ]
              .filter(Boolean)
              .join(' · ')
          }
          onBack={onBackFromThread}
        />
        <Box sx={{ mt: 1 }}>
          <NotesConversationView messages={messages} showEmptyHelper={false} />
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      {scopeLabel ? (
        <Chip
          size="small"
          label={scopeLabel}
          sx={{
            mb: 1.25,
            fontFamily: figmaFontFamilyStack.body,
            fontSize: '0.75rem',
            bgcolor: (t) => t.figmaPalette.blue[50],
            color: 'primary.main',
          }}
        />
      ) : null}
      <SearchField
        fullWidth
        placeholder="Search history"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        sx={{ mb: 1.25 }}
      />
      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75} sx={{ mb: 1.5 }}>
        {FILTERS.map((option) => {
          const selected = filter === option.id
          return (
            <Chip
              key={option.id}
              size="small"
              label={option.label}
              clickable
              onClick={() => setFilter(option.id)}
              sx={{
                fontFamily: figmaFontFamilyStack.body,
                fontWeight: selected ? 600 : 500,
                fontSize: '0.75rem',
                bgcolor: selected ? 'primary.main' : 'background.paper',
                color: selected ? 'primary.contrastText' : 'text.secondary',
                border: 1,
                borderColor: selected ? 'primary.main' : 'divider',
              }}
            />
          )
        })}
      </Stack>

      <Stack sx={{ mx: -2 }}>
        {entries.map((thread) => {
          const isYou = thread.author.name === 'You'
          const peerKey = `${thread.author.initials}|${thread.author.name}`.toLowerCase()
          return (
            <Box
              key={thread.id}
              component="button"
              type="button"
              onClick={() => onSelectThread(thread)}
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.25,
                px: 2,
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
              <Avatar
                sx={(theme) => ({
                  width: 32,
                  height: 32,
                  fontSize: '0.75rem',
                  ...(isYou
                    ? chatAuthorAvatarSx(theme)
                    : chatPeerAuthorAvatarSx(theme, peerKey)),
                })}
              >
                {thread.author.initials}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
                  <Typography variant="body2" noWrap sx={{ ...bodySx, fontWeight: 600, minWidth: 0, flex: 1 }}>
                    {thread.subject}
                  </Typography>
                  {thread.isPrivate ? (
                    <LockOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }} />
                  ) : null}
                  {thread.followUpTask ? (
                    <TaskAltOutlinedIcon sx={{ fontSize: 14, color: 'primary.main', flexShrink: 0 }} />
                  ) : null}
                </Stack>
                <Typography variant="body2" noWrap color="text.secondary" sx={{ ...bodySx, mt: 0.25 }}>
                  {thread.preview}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, display: 'block', mt: 0.5 }}>
                  {[
                    thread.isUnboundDraft ? 'Draft' : null,
                    thread.intentLabel,
                    thread.createdAt,
                    replyCountLabel(thread.replies.length),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Typography>
              </Box>
            </Box>
          )
        })}

        {entries.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ...bodySx, textAlign: 'center', py: 4, px: 2 }}
          >
            {search.trim() ? 'No notes match your search.' : 'No notes yet for this record.'}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  )
}
