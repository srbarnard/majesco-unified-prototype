import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useGlobalSearch } from '@/app/contexts/GlobalSearchContext'
import {
  AGENTIC_SEARCHES,
  QUICK_LOOKUPS,
  RECENT_SEARCHES,
  type AgenticSearchId,
  type QuickLookupId,
} from '@/app/navigation/globalSearchConfig'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

type GlobalSearchDropdownProps = {
  query: string
  onSelect: () => void
}

const sectionLabelSx = {
  px: 2,
  pt: 1.5,
  pb: 0.5,
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
  fontSize: '0.6875rem',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'text.secondary',
} as const

export function GlobalSearchDropdown({ query, onSelect }: GlobalSearchDropdownProps) {
  const { runQuickLookup, runAgenticSearch, runAgenticSearchPrompt } = useGlobalSearch()

  const normalizedQuery = query.trim().toLowerCase()

  const filteredLookups = normalizedQuery
    ? QUICK_LOOKUPS.filter(
        (item) =>
          item.label.toLowerCase().includes(normalizedQuery) ||
          item.description.toLowerCase().includes(normalizedQuery),
      )
    : QUICK_LOOKUPS

  const filteredAgentic = normalizedQuery
    ? AGENTIC_SEARCHES.filter((item) => item.label.toLowerCase().includes(normalizedQuery))
    : AGENTIC_SEARCHES

  const handleQuickLookup = (id: QuickLookupId) => {
    runQuickLookup(id)
    onSelect()
  }

  const handleAgentic = (id: AgenticSearchId) => {
    runAgenticSearch(id)
    onSelect()
  }

  const handleRecent = (label: string) => {
    const agenticMatch = AGENTIC_SEARCHES.find((item) => item.label === label)
    if (agenticMatch) {
      runAgenticSearch(agenticMatch.id)
    } else {
      runAgenticSearchPrompt(label)
    }
    onSelect()
  }

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'absolute',
        top: 'calc(100% + 6px)',
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.modal,
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        overflow: 'hidden',
        maxHeight: 420,
        overflowY: 'auto',
      }}
    >
      {!normalizedQuery && (
        <>
          <List dense disablePadding sx={{ py: 0.5 }}>
            {RECENT_SEARCHES.map((label) => (
              <ListItemButton
                key={label}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleRecent(label)}
                sx={{ py: 0.75, px: 2 }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <HistoryOutlinedIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontFamily: figmaFontFamilyStack.body,
                    fontSize: '0.875rem',
                    noWrap: true,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
          <Divider />
        </>
      )}

      <Typography component="div" sx={sectionLabelSx}>
        Quick lookups
      </Typography>
      <List dense disablePadding sx={{ pb: 0.5 }}>
        {filteredLookups.map((item) => (
          <ListItemButton
            key={item.id}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => handleQuickLookup(item.id)}
            sx={{ py: 0.75, px: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <SearchOutlinedIcon fontSize="small" color="action" />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              secondary={item.description}
              primaryTypographyProps={{
                fontFamily: figmaFontFamilyStack.heading,
                fontWeight: 500,
                fontSize: '0.875rem',
              }}
              secondaryTypographyProps={{
                fontFamily: figmaFontFamilyStack.body,
                fontSize: '0.75rem',
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      <Typography component="div" sx={sectionLabelSx}>
        Ask Copilot
      </Typography>
      <List dense disablePadding sx={{ pb: 0.5 }}>
        {filteredAgentic.map((item) => (
          <ListItemButton
            key={item.id}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => handleAgentic(item.id)}
            sx={{ py: 0.75, px: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <AutoAwesomeOutlinedIcon fontSize="small" sx={{ color: 'primary.main' }} />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontFamily: figmaFontFamilyStack.body,
                fontSize: '0.875rem',
              }}
            />
            <ChevronRightIcon fontSize="small" color="action" />
          </ListItemButton>
        ))}
      </List>

      {normalizedQuery && filteredLookups.length === 0 && filteredAgentic.length === 0 && (
        <Box sx={{ px: 2, py: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
            No matching suggestions. Press Enter to ask Copilot.
          </Typography>
        </Box>
      )}
    </Paper>
  )
}
