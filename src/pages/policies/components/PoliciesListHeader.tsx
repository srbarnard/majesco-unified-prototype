import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { layoutTokens } from '@/design-system/tokens/layout'
import { sectionTabRowBorderSx } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { PoliciesListTabs, type PoliciesListTab } from '@/pages/policies/components/PoliciesListTabs'

type PoliciesListHeaderProps = {
  activeTab: PoliciesListTab
  onTabChange: (tab: PoliciesListTab) => void
}

export function PoliciesListHeader({ activeTab, onTabChange }: PoliciesListHeaderProps) {
  const contentPx = `${layoutTokens.contentPaddingX}px`

  return (
    <Box sx={{ bgcolor: 'background.paper', width: '100%', flexShrink: 0 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
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
          Policies
        </Typography>
      </Stack>

      <Box sx={sectionTabRowBorderSx}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: contentPx,
            minHeight: 44,
            gap: 1,
          }}
        >
          <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <PoliciesListTabs value={activeTab} onChange={onTabChange} />
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}
