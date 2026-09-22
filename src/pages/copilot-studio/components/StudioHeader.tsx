import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { StudioTabs } from '@/pages/copilot-studio/components/StudioTabs'
import type { StudioTab } from '@/pages/copilot-studio/data/mockCopilotStudio'
import { sectionTabRowBorderSx } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

type StudioHeaderProps = {
  activeTab: StudioTab
  onTabChange: (tab: StudioTab) => void
}

export function StudioHeader({ activeTab, onTabChange }: StudioHeaderProps) {
  const contentPx = `${layoutTokens.contentPaddingX}px`

  return (
    <Box sx={{ bgcolor: 'background.paper', width: '100%', flexShrink: 0 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: contentPx, pt: layoutTokens.policyHeaderTopPadding, pb: 1.5 }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontFamily: figmaFontFamilyStack.heading,
            fontWeight: 600,
            fontSize: { xs: '1.25rem', md: '1.375rem' },
            lineHeight: 1.3,
          }}
        >
          Copilot Studio
        </Typography>
      </Stack>

      <Box sx={sectionTabRowBorderSx}>
        <Box
          sx={{
            px: contentPx,
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <StudioTabs value={activeTab} onChange={onTabChange} />
        </Box>
      </Box>
    </Box>
  )
}
