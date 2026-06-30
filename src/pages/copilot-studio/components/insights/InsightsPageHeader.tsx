import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import {
  analyticsFilterInputSx,
  analyticsMenuItemSx,
} from '@/design-system/components/analytics/analyticsStyles'
import { studioInsightsLastUpdated } from '@/pages/copilot-studio/data/studioInsightsData'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

type InsightsPageHeaderProps = {
  title: string
  subtitle: string
  extraControl?: ReactNode
}

export function InsightsPageHeader({ title, subtitle, extraControl }: InsightsPageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ md: 'flex-start' }}
      justifyContent="space-between"
      spacing={1.5}
    >
      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
        <Typography variant="h6" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
          {subtitle}
        </Typography>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} sx={{ flexShrink: 0 }}>
        {extraControl}
        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body, whiteSpace: 'nowrap' }}>
          Last updated on {studioInsightsLastUpdated}
        </Typography>
        <TextField
          select
          size="small"
          defaultValue="7d"
          sx={(theme) => ({
            ...analyticsFilterInputSx(theme),
            minWidth: 140,
            '& .MuiOutlinedInput-root': { borderRadius: 5 },
          })}
        >
          <MenuItem value="7d" sx={analyticsMenuItemSx}>
            Last 7 days
          </MenuItem>
          <MenuItem value="30d" sx={analyticsMenuItemSx}>
            Last 30 days
          </MenuItem>
          <MenuItem value="90d" sx={analyticsMenuItemSx}>
            Last 90 days
          </MenuItem>
        </TextField>
      </Stack>
    </Stack>
  )
}
