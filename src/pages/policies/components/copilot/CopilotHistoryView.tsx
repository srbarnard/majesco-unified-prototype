import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { SearchField } from '@/design-system/components'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import {
  copilotHistoryEntries,
  type CopilotHistoryEntry,
  type CopilotHistoryKind,
} from './copilotDrawerData'

function HistoryKindIcon({ kind }: { kind: CopilotHistoryKind }) {
  const iconSx = { fontSize: 18, color: 'text.secondary' }
  if (kind === 'agent') return <SmartToyOutlinedIcon sx={iconSx} />
  if (kind === 'action') return <PostAddOutlinedIcon sx={iconSx} />
  return <ChatBubbleOutlineIcon sx={iconSx} />
}

type CopilotHistoryViewProps = {
  onSelectEntry: (entry: CopilotHistoryEntry) => void
}

export function CopilotHistoryView({ onSelectEntry }: CopilotHistoryViewProps) {
  const [search, setSearch] = useState('')

  const entries = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) return copilotHistoryEntries
    return copilotHistoryEntries.filter((entry) => entry.title.toLowerCase().includes(normalized))
  }, [search])

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
        {entries.map((entry) => (
          <Box
            key={entry.id}
            component="button"
            type="button"
            onClick={() => onSelectEntry(entry)}
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
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
            <HistoryKindIcon kind={entry.kind} />
            <Typography
              variant="body2"
              noWrap
              sx={{ fontFamily: figmaFontFamilyStack.body, flex: 1, minWidth: 0 }}
            >
              {entry.title}
            </Typography>
          </Box>
        ))}

        {entries.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontFamily: figmaFontFamilyStack.body, textAlign: 'center', py: 4, px: 2 }}
          >
            No conversations match your search.
          </Typography>
        )}
      </Stack>
    </Box>
  )
}
