import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarIcon from '@mui/icons-material/Star'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { EmergencyHomeIcon, EntityListHomeButton, StatusChip } from '@/design-system/components'
import { sectionTabRowBorderSx } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { InsuredDetailsRecord } from '@/pages/insureds/data/mockInsuredDetails'
import { InsuredTabs, type InsuredTab } from '@/pages/insureds/components/InsuredTabs'

type InsuredHeaderProps = {
  insured: InsuredDetailsRecord
  activeTab: InsuredTab
  onTabChange: (tab: InsuredTab) => void
  starred?: boolean
  onToggleStar?: () => void
  emergency?: boolean
  onToggleEmergency?: () => void
}

function insuredStatusVariant(status: InsuredDetailsRecord['status']) {
  if (status === 'Active') return 'success' as const
  if (status === 'Prospect') return 'info' as const
  return 'default' as const
}

export function InsuredHeader({
  insured,
  activeTab,
  onTabChange,
  starred = false,
  onToggleStar,
  emergency = false,
  onToggleEmergency,
}: InsuredHeaderProps) {
  const contentPx = `${layoutTokens.contentPaddingX}px`

  return (
    <Box sx={{ bgcolor: 'background.paper', width: '100%' }}>
      <Box sx={{ px: contentPx, pt: layoutTokens.policyHeaderTopPadding, pb: 0.75 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <EntityListHomeButton to="/insureds" label="All insureds" icon={GroupsOutlinedIcon} tone="insureds" />
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
                {insured.name}
              </Typography>

              <Stack direction="row" spacing={0.25} alignItems="center" sx={{ flexShrink: 0 }}>
                <Tooltip title="Copy insured name">
                  <IconButton size="small" aria-label="Copy insured name" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
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
                <Tooltip title={emergency ? 'Remove high risk flag' : 'Mark as high risk'}>
                  <IconButton
                    size="small"
                    onClick={onToggleEmergency}
                    aria-label="Toggle high risk"
                    aria-pressed={emergency}
                    sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                  >
                    <EmergencyHomeIcon active={emergency} sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit insured">
                  <IconButton size="small" aria-label="Edit insured" sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
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
                Insured · {insured.policyCount} {insured.policyCount === 1 ? 'policy' : 'policies'}
              </Typography>
              <StatusChip label={insured.status} status={insuredStatusVariant(insured.status)} />
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
          <InsuredTabs value={activeTab} onChange={onTabChange} />
        </Stack>
      </Box>
    </Box>
  )
}
