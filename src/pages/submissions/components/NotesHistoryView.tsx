import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { SearchField } from '@/design-system/components'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import {
  replyCountLabel,
  type SubmissionNoteThread,
} from '@/pages/submissions/data/mockSubmissionNotes'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 500,
} as const

export type NotesHistoryGroup = {
  id: string
  label: string
  threads: SubmissionNoteThread[]
}

type NotesHistoryViewProps = {
  threads: SubmissionNoteThread[]
  onSelectThread: (thread: SubmissionNoteThread) => void
  groups?: NotesHistoryGroup[]
}

function ThreadRow({
  thread,
  onSelect,
  indented,
}: {
  thread: SubmissionNoteThread
  onSelect: (thread: SubmissionNoteThread) => void
  indented?: boolean
}) {
  const replies = replyCountLabel(thread.replies.length)

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onSelect(thread)}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 2,
        pl: indented ? 4 : 2,
        py: indented ? 1.25 : 1.5,
        border: 'none',
        borderBottom: indented ? 'none' : 1,
        borderColor: 'divider',
        bgcolor: 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <ChatBubbleOutlineIcon sx={{ fontSize: 18, color: 'text.secondary', flexShrink: 0 }} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" noWrap sx={{ ...bodySx, minWidth: 0 }}>
          {thread.preview}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ ...bodySx, display: 'block', mt: 0.25 }}
        >
          {[thread.typeLabel, thread.createdAt, replies].filter(Boolean).join(' · ')}
        </Typography>
      </Box>
    </Box>
  )
}

export function NotesHistoryView({ threads, onSelectThread, groups }: NotesHistoryViewProps) {
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const grouped = Boolean(groups)

  const normalized = search.trim().toLowerCase()

  const visibleGroups = useMemo(() => {
    if (!groups) return []
    if (!normalized) return groups
    return groups
      .map((group) => {
        const labelMatch = group.label.toLowerCase().includes(normalized)
        const matchingThreads = group.threads.filter(
          (thread) =>
            thread.preview.toLowerCase().includes(normalized) ||
            thread.typeLabel.toLowerCase().includes(normalized),
        )
        return {
          ...group,
          threads: labelMatch ? group.threads : matchingThreads,
        }
      })
      .filter((group) => group.threads.length > 0)
  }, [groups, normalized])

  const entries = useMemo(() => {
    if (grouped) return []
    if (!normalized) return threads
    return threads.filter(
      (thread) =>
        thread.preview.toLowerCase().includes(normalized) ||
        thread.typeLabel.toLowerCase().includes(normalized),
    )
  }, [grouped, normalized, threads])

  const toggleCollapsed = (groupId: string) => {
    setCollapsed((current) => ({ ...current, [groupId]: !(current[groupId] ?? true) }))
  }

  const emptyMessage = normalized
    ? 'No notes match your search.'
    : grouped
      ? 'No notes yet.'
      : 'No notes yet for this submission.'

  const isEmpty = grouped ? visibleGroups.length === 0 : entries.length === 0

  return (
    <Box>
      <SearchField
        fullWidth
        placeholder="Search history"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        sx={{ mb: 1.5 }}
      />

      <Stack sx={{ mx: -2 }}>
        {grouped
          ? visibleGroups.map((group) => {
              const isCollapsed = normalized ? false : (collapsed[group.id] ?? true)
              return (
                <Box key={group.id} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => toggleCollapsed(group.id)}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 2,
                      py: 1.25,
                      border: 'none',
                      bgcolor: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {isCollapsed ? (
                      <KeyboardArrowRightIcon fontSize="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
                    ) : (
                      <ExpandMoreIcon fontSize="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
                    )}
                    <Typography variant="body2" noWrap sx={{ ...headingSx, minWidth: 0, flex: 1 }}>
                      {group.label}
                    </Typography>
                  </Box>
                  <Collapse in={!isCollapsed}>
                    <Stack sx={{ pb: 0.5 }}>
                      {group.threads.map((thread) => (
                        <ThreadRow
                          key={thread.id}
                          thread={thread}
                          onSelect={onSelectThread}
                          indented
                        />
                      ))}
                    </Stack>
                  </Collapse>
                </Box>
              )
            })
          : entries.map((thread) => (
              <ThreadRow key={thread.id} thread={thread} onSelect={onSelectThread} />
            ))}

        {isEmpty && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ...bodySx, textAlign: 'center', py: 4, px: 2 }}
          >
            {emptyMessage}
          </Typography>
        )}
      </Stack>
    </Box>
  )
}
