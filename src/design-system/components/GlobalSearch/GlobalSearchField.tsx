import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import IconButton from '@mui/material/IconButton'
import { useCallback, useState } from 'react'
import { useGlobalSearch } from '@/app/contexts/GlobalSearchContext'
import { SearchField } from '@/design-system/components/SearchField/SearchField'
import { GlobalSearchDropdown } from './GlobalSearchDropdown'

type GlobalSearchFieldProps = {
  fullWidth?: boolean
  placeholder?: string
  autoFocus?: boolean
}

export function GlobalSearchField({
  fullWidth = true,
  placeholder = 'Search P&C Policy',
  autoFocus,
}: GlobalSearchFieldProps) {
  const { runAgenticSearchPrompt } = useGlobalSearch()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const handleClose = useCallback(() => setOpen(false), [])

  const handleSubmit = useCallback(() => {
    const trimmed = query.trim()
    if (!trimmed) return
    runAgenticSearchPrompt(trimmed)
    setOpen(false)
  }, [query, runAgenticSearchPrompt])

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box sx={{ position: 'relative', flex: fullWidth ? 1 : undefined, minWidth: 0 }}>
        <SearchField
          fullWidth={fullWidth}
          placeholder={placeholder}
          value={query}
          onSearchChange={setQuery}
          enableVoice
          autoFocus={autoFocus}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              handleSubmit()
            }
            if (event.key === 'Escape') {
              setOpen(false)
            }
          }}
          endActions={
            query ? (
              <IconButton
                size="small"
                aria-label="Clear search"
                onClick={() => setQuery('')}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            ) : undefined
          }
          sx={{ flex: 1, minWidth: 0, maxWidth: 'none' }}
        />
        {open && <GlobalSearchDropdown query={query} onSelect={handleClose} />}
      </Box>
    </ClickAwayListener>
  )
}
