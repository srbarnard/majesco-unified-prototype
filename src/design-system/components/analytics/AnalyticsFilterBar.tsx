import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { analyticsBodySx } from '@/design-system/components/analytics/analyticsStyles'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

import type { AnalyticsFilterBarConfig } from '@/design-system/components/analytics/types'

type AnalyticsFilterBarProps = {
  config: AnalyticsFilterBarConfig
}

export function AnalyticsFilterBar({ config }: AnalyticsFilterBarProps) {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
        {config.periodChips.map((chip) => {
          const active = chip === config.activePeriod
          return (
            <Box
              key={chip}
              component="span"
              sx={(theme) => ({
                px: 1.25,
                py: 0.5,
                borderRadius: 1,
                fontFamily: figmaFontFamilyStack.body,
                fontSize: '0.75rem',
                fontWeight: active ? 600 : 400,
                color: active ? 'primary.main' : 'text.secondary',
                bgcolor: active ? theme.figmaPalette.blue[50] : 'transparent',
                border: `1px solid ${active ? theme.figmaPalette.blue[200] : theme.palette.divider}`,
              })}
            >
              {chip}
            </Box>
          )
        })}
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems={{ lg: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 240 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
            <Typography variant="caption" color="text.secondary" sx={analyticsBodySx}>
              {config.dateRangeLabel}
            </Typography>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
          </Stack>
          <Slider
            size="small"
            defaultValue={[25, 75]}
            sx={{
              color: 'primary.main',
              '& .MuiSlider-thumb': { width: 12, height: 12 },
            }}
          />
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', lg: 'auto' } }}>
          {config.filters.map((filter) => (
            <TextField
              key={filter.id}
              select
              size="small"
              label={filter.label}
              value={filter.value}
              sx={{ minWidth: 160 }}
              InputLabelProps={{ sx: { fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' } }}
            >
              {filter.options.map((option) => (
                <MenuItem key={option} value={option} sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' }}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          ))}
        </Stack>
      </Stack>
    </Stack>
  )
}
