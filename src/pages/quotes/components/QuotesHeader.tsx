import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useNavigate } from 'react-router'
import { Button } from '@/design-system/components'
import { sectionTabRowBorderSx } from '@/design-system/theme/themeSurfaces'
import { listPageCreateButtonSx } from '@/design-system/tokens/listPageHeader'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { QuotesTabs, type QuotesTab } from './QuotesTabs'

type QuotesHeaderProps = {
  activeTab: QuotesTab
  onTabChange: (tab: QuotesTab) => void
}

export function QuotesHeader({ activeTab, onTabChange }: QuotesHeaderProps) {
  const navigate = useNavigate()
  const contentPx = `${layoutTokens.contentPaddingX}px`

  return (
    <Box sx={{ bgcolor: 'background.paper', width: '100%', flexShrink: 0 }}>
      <Stack
        direction="row"
        alignItems="center"
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
            minWidth: 0,
          }}
        >
          Quotes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          aria-label="Create quote"
          sx={listPageCreateButtonSx}
          onClick={() => navigate('/quotes/new')}
        >
          <span className="create-btn-label">Create quote</span>
        </Button>
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
            <QuotesTabs value={activeTab} onChange={onTabChange} />
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}
