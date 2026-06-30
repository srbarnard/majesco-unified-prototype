import Box from '@mui/material/Box'
import { useState } from 'react'
import { InsightsSidebar } from '@/pages/copilot-studio/components/insights/InsightsSidebar'
import { InsightsViewContent } from '@/pages/copilot-studio/components/insights/InsightsViewContent'
import type { StudioInsightsView } from '@/pages/copilot-studio/data/studioInsightsData'
import { layoutTokens } from '@/design-system/tokens/layout'

const contentPx = `${layoutTokens.contentPaddingX}px`

export function InsightsTab() {
  const [activeView, setActiveView] = useState<StudioInsightsView>('overview')

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <InsightsSidebar activeView={activeView} onViewChange={setActiveView} />

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflowY: 'auto',
          px: contentPx,
          py: layoutTokens.listSectionVerticalGap,
        }}
      >
        <InsightsViewContent view={activeView} />
      </Box>
    </Box>
  )
}
