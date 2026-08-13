import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { GridApi } from '@mui/x-data-grid-premium'
import type { MutableRefObject } from 'react'
import { ExpandableSearchField, ListDataGridToolbarActions } from '@/design-system/components'
import {
  filterInputSx,
  filterInputTextSx,
  filterMenuItemSx,
} from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { InsuredType } from '@/pages/insureds/data/mockInsureds'

export type InsuredTypeFilter = 'All' | InsuredType

type InsuredsToolbarProps = {
  apiRef: MutableRefObject<GridApi>
  searchQuery: string
  onSearchChange: (query: string) => void
  insuredType: InsuredTypeFilter
  onInsuredTypeChange: (value: InsuredTypeFilter) => void
}

const TYPE_OPTIONS: InsuredTypeFilter[] = ['All', 'Commercial', 'Non-commercial']

export function InsuredsToolbar({
  apiRef,
  searchQuery,
  onSearchChange,
  insuredType,
  onInsuredTypeChange,
}: InsuredsToolbarProps) {
  return (
    <ExpandableSearchField
      placeholder="Search insureds"
      value={searchQuery}
      onSearchChange={onSearchChange}
      desktopWidth={{ sm: 220, lg: 280 }}
      startContent={
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{ fontFamily: figmaFontFamilyStack.body, fontWeight: 500, whiteSpace: 'nowrap' }}
          >
            Insured type:
          </Typography>
          <FormControl size="small" sx={(theme) => ({ minWidth: 148, ...filterInputSx(theme) })}>
            <Select
              value={insuredType}
              onChange={(event) => onInsuredTypeChange(event.target.value as InsuredTypeFilter)}
              renderValue={(selected) => (
                <Typography component="span" sx={filterInputTextSx}>
                  {selected}
                </Typography>
              )}
              inputProps={{ 'aria-label': 'Insured type' }}
            >
              {TYPE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option} sx={filterMenuItemSx}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      }
      endContent={
        <ListDataGridToolbarActions
          apiRef={apiRef}
          exportFileName="insureds"
          exportAriaLabel="Download insureds"
        />
      }
    />
  )
}
