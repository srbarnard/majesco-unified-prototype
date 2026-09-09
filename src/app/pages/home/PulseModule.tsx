import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import type { RecentActivityItem } from '@/app/data/homeMock'
import { getPulseRailActivities, type PulseFilter } from '@/app/data/pulseMock'
import { ActivityRail } from '@/app/pages/home/ActivityRail'
import { PulseChart } from '@/app/pages/home/PulseChart'
import { PulseChartControls, PulseFilterChips } from '@/app/pages/home/PulseToolbar'
import { usePulsePreferences } from '@/app/pages/home/pulseChartPalettes'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

type PulseModuleProps = {
  onActivitySelect?: (activity: RecentActivityItem) => void
  onActivityCopilot?: (activity: RecentActivityItem) => void
  activeCopilotActivityId?: string | null
}

export function PulseModule({
  onActivitySelect,
  onActivityCopilot,
  activeCopilotActivityId,
}: PulseModuleProps) {
  const [filter, setFilter] = useState<PulseFilter>('renewals')
  const { palette, paletteId, setPaletteId, range, setRange } = usePulsePreferences()

  const activities = useMemo(() => getPulseRailActivities(filter, 6), [filter])

  return (
    <Box sx={{ width: '100%', minWidth: 0, maxWidth: '100%' }}>
      <Box
        sx={{
          display: 'grid',
          columnGap: 1.5,
          rowGap: 2,
          gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
          gridTemplateAreas: {
            xs: `
              "filters"
              "chart"
              "controls"
            `,
            md: `
              "filters controls"
              "chart chart"
            `,
          },
          alignItems: 'center',
        }}
      >
        <Box sx={{ gridArea: 'filters', minWidth: 0 }}>
          <PulseFilterChips filter={filter} onFilterChange={setFilter} />
        </Box>

        <Box sx={{ gridArea: 'controls', minWidth: 0 }}>
          <PulseChartControls
            range={range}
            onRangeChange={setRange}
            paletteId={paletteId}
            onPaletteChange={setPaletteId}
          />
        </Box>

        <Box sx={{ gridArea: 'chart', minWidth: 0 }}>
          <PulseChart filter={filter} range={range} palette={palette} />
        </Box>
      </Box>

      <Box sx={{ mt: 5, width: '100%', minWidth: 0 }}>
        <Typography
          component="h3"
          variant="subtitle1"
          sx={{
            fontFamily: figmaFontFamilyStack.heading,
            fontWeight: 600,
            mb: 1.5,
          }}
        >
          Recent activity
        </Typography>

        <ActivityRail
          items={activities}
          onActivitySelect={onActivitySelect}
          onActivityCopilot={onActivityCopilot}
          activeCopilotActivityId={activeCopilotActivityId}
        />
      </Box>
    </Box>
  )
}
