import SearchIcon from '@mui/icons-material/Search'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useState, type ReactNode } from 'react'
import { SearchField, type SearchFieldProps } from './SearchField'

type ExpandableSearchFieldProps = SearchFieldProps & {
  /** Content to the left of the search control (export, bulk actions, etc.). */
  startContent?: ReactNode
  /** Show the full field from this breakpoint up; icon-only below. Default `sm`. */
  expandFrom?: 'sm' | 'md' | 'lg'
  desktopWidth?: number | { sm?: number; md?: number; lg?: number }
}

/**
 * List/toolbar search that matches global search UX: magnifying-glass toggle on
 * narrow viewports (expands a full-width field below), full input on larger screens.
 */
export function ExpandableSearchField({
  startContent,
  expandFrom = 'sm',
  desktopWidth = { sm: 220, lg: 280 },
  sx,
  ...searchProps
}: ExpandableSearchFieldProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const hiddenBelow = { xs: 'none', [expandFrom]: 'block' } as const
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
        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5} sx={{ flexShrink: 0 }}>
          <IconButton
            size="small"
            aria-label={mobileOpen ? 'Close search' : 'Open search'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            sx={{ display: shownBelow }}
          >
            <SearchIcon fontSize="small" />
          </IconButton>
          <SearchField
            {...searchProps}
            sx={{
              display: hiddenBelow,
              minWidth: 0,
              ...widthSx,
              ...sx,
            }}
          />
        </Stack>
      </Stack>
      <Collapse in={mobileOpen} unmountOnExit sx={{ display: collapseBelow, width: '100%' }}>
        <SearchField
          {...searchProps}
          fullWidth
          autoFocus={mobileOpen}
          sx={{
            width: '100%',
            minWidth: 0,
            ...sx,
          }}
        />
      </Collapse>
    </Stack>
  )
}
