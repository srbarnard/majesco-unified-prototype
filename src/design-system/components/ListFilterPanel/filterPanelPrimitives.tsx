import CloseIcon from '@mui/icons-material/Close'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { Theme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { useId } from 'react'
import { Button } from '@/design-system/components/Button'
import type { PresetOption } from '@/design-system/filters/listFilterTypes'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack, figmaFontWeights } from '@/design-system/tokens/figma-typography'
import { accentSubtle, surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { borderRadius } from '@/design-system/tokens/shape'

export const filterHeadingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

export const filterInputTextSx = {
  fontFamily: figmaFontFamilyStack.body,
  fontSize: '0.875rem',
  lineHeight: 1.5,
} as const

export function filterInputSx(theme: Theme) {
  const focusColor = theme.palette.primary.main

  return {
    '& .MuiOutlinedInput-root': {
      ...filterInputTextSx,
      minHeight: 40,
      bgcolor: 'background.paper',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.divider,
        borderWidth: 1,
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: focusColor,
      },
      '&.Mui-focused': {
        outline: 'none',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: focusColor,
        borderWidth: 2,
      },
    },
    '& .MuiInputLabel-root': {
      display: 'none',
    },
    '& .MuiAutocomplete-input': {
      ...filterInputTextSx,
    },
    '& .MuiSelect-select': {
      ...filterInputTextSx,
    },
  }
}

export const filterMenuItemSx = {
  ...filterInputTextSx,
} as const

export const filterChipSx = {
  bgcolor: (theme: Theme) => accentSubtle(theme),
  color: 'primary.main',
  fontFamily: figmaFontFamilyStack.body,
  fontSize: '0.875rem',
  height: 26,
  '& .MuiChip-label': {
    px: 0.75,
  },
  '& .MuiChip-deleteIcon': {
    color: 'primary.main',
    fontSize: 16,
    '&:hover': {
      color: 'primary.dark',
    },
  },
} as const

export const filterFooterButtonSx = {
  py: 1,
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: figmaFontWeights.medium,
  fontSize: '0.875rem',
  borderRadius: `${borderRadius.default}px`,
} as const

export function FilterFieldLabel({ fieldId, children }: { fieldId: string; children: string }) {
  return (
    <Typography
      component="label"
      htmlFor={fieldId}
      sx={{
        display: 'block',
        fontFamily: figmaFontFamilyStack.body,
        fontWeight: figmaFontWeights.regular,
        fontSize: '0.875rem',
        lineHeight: 1.5,
        color: 'text.primary',
        mb: '7px',
      }}
    >
      {children}
    </Typography>
  )
}

export function FilterMultiSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly string[]
  value: string[]
  onChange: (value: string[]) => void
}) {
  const fieldId = useId()

  return (
    <Box>
      <FilterFieldLabel fieldId={fieldId}>{label}</FilterFieldLabel>
      <Autocomplete
        multiple
        disableCloseOnSelect
        id={fieldId}
        options={[...options]}
        value={value}
        onChange={(_, next) => onChange(next)}
        getOptionLabel={(option) => option}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={value.length === 0 ? 'Select' : undefined}
            size="small"
            sx={(theme) => filterInputSx(theme)}
          />
        )}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index })
            return <Chip key={key} label={option} size="small" sx={filterChipSx} {...tagProps} />
          })
        }
        slotProps={{
          paper: {
            sx: {
              borderRadius: `${borderRadius.default}px`,
              mt: 0.5,
              '& .MuiAutocomplete-option': filterMenuItemSx,
            },
          },
        }}
        sx={{
          '& .MuiAutocomplete-inputRoot': {
            flexWrap: 'wrap',
            gap: 0.5,
            py: value.length > 0 ? 0.75 : undefined,
          },
        }}
      />
    </Box>
  )
}

type PresetFieldProps = {
  label: string
  preset: string
  start: string
  end: string
  presetOptions: readonly PresetOption[]
  onPresetChange: (value: string) => void
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  customRange?: 'date' | 'number'
  customStartLabel?: string
  customEndLabel?: string
}

export function FilterPresetField({
  label,
  preset,
  start,
  end,
  presetOptions,
  onPresetChange,
  onStartChange,
  onEndChange,
  customRange = 'date',
  customStartLabel,
  customEndLabel,
}: PresetFieldProps) {
  const presetFieldId = useId()
  const startFieldId = useId()
  const endFieldId = useId()
  const startLabel = customStartLabel ?? (customRange === 'date' ? 'Start date' : 'Min days')
  const endLabel = customEndLabel ?? (customRange === 'date' ? 'End date' : 'Max days')

  return (
    <Box>
      <FilterFieldLabel fieldId={presetFieldId}>{label}</FilterFieldLabel>
      <FormControl fullWidth size="small" sx={(theme) => filterInputSx(theme)}>
        <Select
          id={presetFieldId}
          value={preset}
          displayEmpty
          onChange={(event) => onPresetChange(event.target.value)}
          renderValue={(selected) => {
            if (!selected) {
              return (
                <Typography component="span" color="text.secondary" sx={filterInputTextSx}>
                  Select
                </Typography>
              )
            }
            return (
              <Typography component="span" sx={filterInputTextSx}>
                {presetOptions.find((option) => option.value === selected)?.label ?? selected}
              </Typography>
            )
          }}
        >
          {presetOptions.map((option) => (
            <MenuItem key={option.value || 'select'} value={option.value} sx={filterMenuItemSx}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {preset === 'custom' && (
        <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <FilterFieldLabel fieldId={startFieldId}>{startLabel}</FilterFieldLabel>
            <TextField
              id={startFieldId}
              type={customRange}
              size="small"
              fullWidth
              value={start}
              onChange={(event) => onStartChange(event.target.value)}
              inputProps={{ 'aria-label': startLabel }}
              sx={(theme) => filterInputSx(theme)}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <FilterFieldLabel fieldId={endFieldId}>{endLabel}</FilterFieldLabel>
            <TextField
              id={endFieldId}
              type={customRange}
              size="small"
              fullWidth
              value={end}
              onChange={(event) => onEndChange(event.target.value)}
              inputProps={{ 'aria-label': endLabel }}
              sx={(theme) => filterInputSx(theme)}
            />
          </Box>
        </Stack>
      )}
    </Box>
  )
}

type FilterPanelShellProps = {
  onClose?: () => void
  onClearAll: () => void
  onApply: () => void
  children: ReactNode
}

export function FilterPanelShell({ onClose, onClearAll, onApply, children }: FilterPanelShellProps) {
  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', overflow: 'hidden' }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 2,
          pt: layoutTokens.policyHeaderTopPadding,
          pb: 1.5,
          bgcolor: (theme) => surfaceMuted(theme),
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle1" sx={{ ...filterHeadingSx, fontSize: '0.9375rem' }}>
          Filter
        </Typography>
        {onClose && (
          <IconButton size="small" onClick={onClose} aria-label="Close filter panel">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>

      <Stack spacing={2} sx={{ px: 2, py: 2, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {children}
      </Stack>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          px: 2,
          py: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: (theme) => surfaceMuted(theme),
          flexShrink: 0,
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          onClick={onClearAll}
          sx={{
            ...filterFooterButtonSx,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          }}
        >
          Clear all
        </Button>
        <Button variant="contained" color="primary" fullWidth onClick={onApply} sx={filterFooterButtonSx}>
          Apply filters
        </Button>
      </Stack>
    </Box>
  )
}
