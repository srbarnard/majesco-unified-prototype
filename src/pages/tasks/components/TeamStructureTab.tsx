import CheckIcon from '@mui/icons-material/Check'
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useState } from 'react'
import { SearchField } from '@/design-system/components'
import { accentSubtle, accentSubtleHover } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { TeamOrgChart } from '@/pages/tasks/components/TeamOrgChart'
import { TeamStructureOverview } from '@/pages/tasks/components/TeamStructureOverview'

export type TeamStructureView = 'overview' | 'org-chart'

export function TeamStructureTab() {
  const [view, setView] = useState<TeamStructureView>('overview')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={view}
          onChange={(_, next: TeamStructureView | null) => {
            if (next) setView(next)
          }}
          sx={{
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              fontFamily: figmaFontFamilyStack.heading,
              fontWeight: 500,
              fontSize: '0.8125rem',
              px: 1.5,
              py: 0.75,
              borderColor: 'divider',
              color: 'text.secondary',
              gap: 0.75,
              '&.Mui-selected': {
                bgcolor: (theme) => accentSubtle(theme),
                color: 'primary.main',
                borderColor: 'primary.main',
                '&:hover': {
                  bgcolor: (theme) => accentSubtleHover(theme),
                },
              },
            },
          }}
        >
          <ToggleButton value="overview">
            {view === 'overview' && <CheckIcon sx={{ fontSize: 16 }} />}
            Overview
          </ToggleButton>
          <ToggleButton value="org-chart">
            {view === 'org-chart' && <CheckIcon sx={{ fontSize: 16 }} />}
            <AccountTreeOutlinedIcon sx={{ fontSize: 16 }} />
            Org chart
          </ToggleButton>
        </ToggleButtonGroup>
        <SearchField
          placeholder="Search Team members"
          value={searchQuery}
          onSearchChange={setSearchQuery}
          sx={{ width: { xs: '100%', sm: 240, md: 280 }, flexShrink: 0 }}
        />
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {view === 'overview' ? (
          <TeamStructureOverview searchQuery={searchQuery} />
        ) : (
          <TeamOrgChart searchQuery={searchQuery} />
        )}
      </Box>
    </Box>
  )
}
