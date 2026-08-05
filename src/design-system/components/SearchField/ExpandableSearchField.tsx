import SearchIcon from '@mui/icons-material/Search'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useState, type ReactNode } from 'react'
import { SearchField, type SearchFieldProps } from './SearchField'

type ExpandableSearchFieldProps = SearchFieldProps & {
  /** Content on the left (bulk actions, etc.). */
  startContent?: ReactNode
  /**
   * Content grouped with search on the right (columns, export).
   * Rendered before the search field, flush to the trailing edge.
   */
  endContent?: ReactNode
  /** Show the full field from this breakpoint up; icon-only below. Default `sm`. */
  expandFrom?: 'sm' | 'md' | 'lg'
  desktopWidth?: number | { sm?: number; md?: number; lg?: number }
}

/**
 * List/toolbar search that matches global search UX: magnifying-glass toggle on
 * narrow viewports (expands a full-width field below), full input on larger screens.
 * Columns/export sit with search on the right (DataGrid Premium-style).
 */
export function ExpandableSearchField({
  startContent,
  endContent,
  expandFrom = 'sm',
  desktopWidth = { sm: 220, lg: 280 },
  sx,
  ...searchProps
}: ExpandableSearchFieldProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const hiddenBelow = { xs: 'none', [expandFrom]: 'flex' } as const
  const shownBelow = { xs: 'inline-flex', [expandFrom]: 'none' } as const
  const collapseBelow = { xs: 'block', [expandFrom]: 'none' } as const

  const widthSx =
    typeof desktopWidth === 'number'
      ? { width: { [expandFrom]: desktopWidth } }
      : {
          width: {
            [expandFrom]: desktopWidth.sm ?? desktopWidth.md ?? desktopWidth.lg ?? 220,
            ...(desktopWidth.md != null ? { md: desktopWidth.md } : {}),
            ...(desktopWidth.lg != null ? { lg: desktopWidth.lg } : {}),
          },
        }

  return (
    <Stack spacing={1} sx={{ width: '100%', alignItems: 'stretch' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        sx={{ width: '100%', minWidth: 0 }}
      >
        {startContent ? (
          <Stack direction="row" alignItems="center" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ minWidth: 0 }}>
            {startContent}
          </Stack>
        ) : (
          <span />
        )}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
          spacing={0.5}
          sx={{ ml: 'auto', flexShrink: 0 }}
        >
          {endContent}
          <IconButton
            size="small"
            aria-label={mobileOpen ? 'Close search' : 'Open search'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            sx={{ display: shownBelow }}
          >
            <SearchIcon fontSize="small" />
          </IconButton>
          <Stack
            sx={{
              display: hiddenBelow,
              minWidth: 0,
              ...widthSx,
            }}
          >
            <SearchField
              {...searchProps}
              fullWidth
              sx={{
                minWidth: 0,
                width: '100%',
                ...sx,
              }}
            />
          </Stack>
        </Stack>
      </Stack>
      <Collapse in={mobileOpen} unmountOnExit sx={{ display: collapseBelow, width: '100%' }}>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ width: '100%' }}>
          {endContent}
          <SearchField
            {...searchProps}
            fullWidth
            autoFocus={mobileOpen}
            sx={{
              width: '100%',
              minWidth: 0,
              flex: 1,
              ...sx,
            }}
          />
        </Stack>
      </Collapse>
    </Stack>
  )
}
