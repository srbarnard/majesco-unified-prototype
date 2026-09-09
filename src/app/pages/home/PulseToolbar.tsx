import CheckIcon from '@mui/icons-material/Check'
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { PULSE_FILTERS, PULSE_RANGES, type PulseFilter, type PulseRange } from '@/app/data/pulseMock'
import {
  getPulsePaletteColors,
  PULSE_CHART_PALETTES,
  PULSE_PALETTE_ORDER,
  type PulseChartPaletteId,
} from '@/app/pages/home/pulseChartPalettes'
import { surfaceMuted, surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

type PulseFilterChipsProps = {
  filter: PulseFilter
  onFilterChange: (filter: PulseFilter) => void
}

export function PulseFilterChips({ filter, onFilterChange }: PulseFilterChipsProps) {
  return (
    <Stack
      direction="row"
      spacing={1}
      flexWrap="wrap"
      useFlexGap
      justifyContent={{ xs: 'center', md: 'flex-start' }}
      sx={{ width: '100%', minWidth: 0 }}
    >
      {PULSE_FILTERS.map(({ id, label }) => {
        const selected = filter === id
        return (
          <Chip
            key={id}
            label={label}
            onClick={() => onFilterChange(id)}
            sx={{
              fontFamily: figmaFontFamilyStack.body,
              fontWeight: selected ? 600 : 500,
              fontSize: '0.8125rem',
              bgcolor: selected ? 'primary.main' : (theme) => surfaceMuted(theme),
              color: selected ? 'primary.contrastText' : 'text.secondary',
              border: '1px solid',
              borderColor: selected ? 'primary.main' : (theme) => surfaceMuted(theme),
              '&:hover': {
                bgcolor: selected ? 'primary.dark' : (theme) => surfaceSubtle(theme),
                borderColor: selected ? 'primary.dark' : (theme) => surfaceSubtle(theme),
              },
            }}
          />
        )
      })}
    </Stack>
  )
}

type PulseChartControlsProps = {
  range: PulseRange
  onRangeChange: (range: PulseRange) => void
  paletteId: PulseChartPaletteId
  onPaletteChange: (id: PulseChartPaletteId) => void
}

type PulsePaletteSwitcherProps = {
  paletteId: PulseChartPaletteId
  onPaletteChange: (id: PulseChartPaletteId) => void
}

/** Shared chart palette menu used by Home Pulse and Submission Risk signals. */
export function PulsePaletteSwitcher({ paletteId, onPaletteChange }: PulsePaletteSwitcherProps) {
  const theme = useTheme()
  const [paletteAnchor, setPaletteAnchor] = useState<null | HTMLElement>(null)
  const paletteOpen = Boolean(paletteAnchor)

  return (
    <>
      <IconButton
        size="small"
        aria-label={`Chart palette: ${PULSE_CHART_PALETTES[paletteId].label}`}
        aria-haspopup="listbox"
        aria-expanded={paletteOpen}
        onClick={(event) => setPaletteAnchor(event.currentTarget)}
        sx={{
          color: 'text.secondary',
          '&:hover': { color: 'text.primary', bgcolor: (t) => surfaceSubtle(t) },
        }}
      >
        <PaletteOutlinedIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <Menu
        anchorEl={paletteAnchor}
        open={paletteOpen}
        onClose={() => setPaletteAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 200,
              mt: 0.75,
            },
          },
        }}
      >
        {PULSE_PALETTE_ORDER.map((id) => {
          const palette = PULSE_CHART_PALETTES[id]
          const selected = id === paletteId
          const swatchColors = getPulsePaletteColors(palette, theme.palette.mode)
          return (
            <MenuItem
              key={id}
              selected={selected}
              onClick={() => {
                onPaletteChange(id)
                setPaletteAnchor(null)
              }}
              sx={{
                fontFamily: figmaFontFamilyStack.body,
                fontSize: '0.875rem',
                fontWeight: 400,
                py: 1,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box component="span" sx={{ textAlign: 'left' }}>
                {palette.label}
              </Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
                <Box sx={{ display: 'flex', gap: 0.375 }} aria-hidden>
                  {swatchColors.slice(0, 4).map((color) => (
                    <Box key={color} sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: color }} />
                  ))}
                </Box>
                {selected ? <CheckIcon sx={{ fontSize: 18, color: 'text.secondary' }} /> : null}
              </Stack>
            </MenuItem>
          )
        })}
      </Menu>
    </>
  )
}

export function PulseChartControls({
  range,
  onRangeChange,
  paletteId,
  onPaletteChange,
}: PulseChartControlsProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent={{ xs: 'center', md: 'flex-end' }}
      spacing={0.25}
      sx={{ width: '100%', flexShrink: 0 }}
    >
      <Stack direction="row" alignItems="center" spacing={1} role="tablist" aria-label="Date range">
        {PULSE_RANGES.map(({ id, label }) => {
          const selected = range === id
          return (
            <Box
              key={id}
              component="button"
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onRangeChange(id)}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                height: 32,
                border: 'none',
                cursor: 'pointer',
                fontFamily: figmaFontFamilyStack.body,
                fontSize: '0.8125rem',
                fontWeight: selected ? 600 : 500,
                lineHeight: 1,
                px: 1.25,
                py: 0,
                borderRadius: 1,
                color: selected ? 'primary.contrastText' : 'text.secondary',
                bgcolor: selected ? 'primary.main' : (theme) => surfaceMuted(theme),
                transition: 'background-color 0.15s ease, color 0.15s ease',
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: selected ? 'primary.dark' : (theme) => surfaceSubtle(theme),
                },
                '&:focus-visible': {
                  outline: 2,
                  outlineColor: 'primary.main',
                  outlineOffset: 2,
                },
              }}
            >
              {label}
            </Box>
          )
        })}
      </Stack>

      <PulsePaletteSwitcher paletteId={paletteId} onPaletteChange={onPaletteChange} />
    </Stack>
  )
}
