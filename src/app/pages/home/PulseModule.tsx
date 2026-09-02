import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import type { RecentActivityItem } from '@/app/data/homeMock'
import {
  formatPulseTimestamp,
  getPulseActivities,
  PULSE_ACTIVITY_HEADINGS,
  type PulseFilter,
} from '@/app/data/pulseMock'
import { PulseChart } from '@/app/pages/home/PulseChart'
import { PulseToolbar } from '@/app/pages/home/PulseToolbar'
import { usePulsePreferences } from '@/app/pages/home/pulseChartPalettes'
import { accentSubtle } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

type PulseModuleProps = {
  onActivitySelect?: (activity: RecentActivityItem) => void
}

function PulseActivityRow({
  item,
  onSelect,
}: {
  item: RecentActivityItem
  onSelect?: (activity: RecentActivityItem) => void
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={() => onSelect?.(item)}
      sx={{
        display: 'block',
        width: '100%',
        py: 1,
        px: 0,
        border: 'none',
        borderRadius: 1,
        bgcolor: 'transparent',
        cursor: onSelect ? 'pointer' : 'default',
        textAlign: 'left',
        transition: 'background-color 0.15s ease',
        '&:hover': onSelect
          ? {
              bgcolor: (theme) => accentSubtle(theme),
            }
          : {},
        '&:focus-visible': {
          outline: 2,
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2}>
        <Typography
          variant="body2"
          sx={{
            fontFamily: figmaFontFamilyStack.heading,
            fontWeight: 600,
            fontSize: '0.8125rem',
            color: 'text.primary',
            minWidth: 0,
          }}
        >
          {item.label}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontFamily: figmaFontFamilyStack.body, flexShrink: 0, fontSize: '0.6875rem' }}
        >
          {formatPulseTimestamp(item.timestamp)}
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        color="text.secondary"
        noWrap
        sx={{
          fontFamily: figmaFontFamilyStack.body,
          fontSize: '0.8125rem',
          mt: 0.25,
        }}
      >
        {item.detail}
      </Typography>
    </Box>
  )
}

export function PulseModule({ onActivitySelect }: PulseModuleProps) {
  const [filter, setFilter] = useState<PulseFilter>('renewals')
  const { palette, paletteId, setPaletteId, range, setRange } = usePulsePreferences()

  const activities = useMemo(() => getPulseActivities(filter, range, 5), [filter, range])

  return (
    <Box sx={{ width: '100%' }}>
      <PulseToolbar
        filter={filter}
        onFilterChange={setFilter}
        range={range}
        onRangeChange={setRange}
        paletteId={paletteId}
        onPaletteChange={setPaletteId}
      />

      <PulseChart filter={filter} range={range} palette={palette} />

      <Box sx={{ mt: 5 }}>
        <Typography
          component="h3"
          variant="subtitle1"
          sx={{
            fontFamily: figmaFontFamilyStack.heading,
            fontWeight: 600,
            mb: 0.5,
          }}
        >
          {PULSE_ACTIVITY_HEADINGS[filter]}
        </Typography>

        <Box>
          {activities.map((item) => (
            <PulseActivityRow key={item.id} item={item} onSelect={onActivitySelect} />
          ))}
        </Box>
      </Box>
    </Box>
  )
}
