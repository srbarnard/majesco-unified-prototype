import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarIcon from '@mui/icons-material/Star'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { EntityListHomeButton } from '@/design-system/components'
import { sectionTabRowBorderSx } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { QuoteStatusChip } from '@/pages/quotes/components/QuoteStatusChip'
import type { QuoteDetailsRecord } from '@/pages/quotes/data/mockQuoteDetails'
import { QuoteTabs, type QuoteTab } from '@/pages/quotes/components/QuoteTabs'

type QuoteHeaderProps = {
  quote: QuoteDetailsRecord
  activeTab: QuoteTab
  onTabChange: (tab: QuoteTab) => void
  starred?: boolean
  onToggleStar?: () => void
}

export function QuoteHeader({
  quote,
  activeTab,
  onTabChange,
  starred = false,
  onToggleStar,
}: QuoteHeaderProps) {
  const contentPx = `${layoutTokens.contentPaddingX}px`

  return (
    <Box sx={{ bgcolor: 'background.paper', width: '100%' }}>
      <Box sx={{ px: contentPx, pt: layoutTokens.policyHeaderTopPadding, pb: 0.75 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <EntityListHomeButton to="/quotes" label="All quotes" icon={RequestQuoteOutlinedIcon} tone="quotes" />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Typography
                variant="subtitle2"
                component="h1"
                sx={{
                  fontFamily: figmaFontFamilyStack.heading,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  fontSize: { xs: '1rem', md: '1.0625rem' },
                  color: 'text.primary',
                  minWidth: 0,
                  flex: 1,
                }}
                noWrap
              >
                {quote.insuredName}
              </Typography>

              <Stack direction="row" spacing={0.25} alignItems="center" sx={{ flexShrink: 0 }}>
                <Tooltip title="Copy quote number">
                  <IconButton size="small" aria-label="Copy quote number" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                    <ContentCopyOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title={starred ? 'Remove from favorites' : 'Add to favorites'}>
                  <IconButton size="small" onClick={onToggleStar} aria-label="Toggle favorite">
                    {starred ? (
                      <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                    ) : (
                      <StarBorderIcon sx={{ fontSize: 18 }} />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit quote">
                  <IconButton size="small" aria-label="Edit quote" sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="More actions">
                  <IconButton size="small" aria-label="More actions">
                    <MoreHorizIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.125, flexWrap: 'wrap', gap: 0.75 }}>
              <Typography
                variant="subtitle2"
                component="p"
                sx={{
                  fontFamily: figmaFontFamilyStack.heading,
                  fontWeight: 500,
                  lineHeight: 1.3,
                  fontSize: { xs: '0.8125rem', md: '0.875rem' },
                  color: 'text.secondary',
                }}
              >
                Quote #{quote.quoteNumber}
              </Typography>
              <QuoteStatusChip status={quote.status} />
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box sx={sectionTabRowBorderSx}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: contentPx, minHeight: 44, gap: 1 }}
        >
          <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <QuoteTabs value={activeTab} onChange={onTabChange} />
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}
