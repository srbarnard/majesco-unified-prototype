import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  analyticsBodySx,
  analyticsFilterInputSx,
  analyticsFilterLabelSx,
  analyticsMenuItemSx,
} from '@/design-system/components/analytics/analyticsStyles'
import { accentSubtle } from '@/design-system/theme/themeSurfaces'
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
                fontFamily: analyticsFilterLabelSx.fontFamily,
                fontSize: '0.75rem',
                fontWeight: active ? 600 : 400,
                color: active ? 'primary.main' : 'text.secondary',
                bgcolor: active ? accentSubtle(theme) : 'transparent',
                border: `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
              })}
            >
              {chip}
            </Box>
          )
        })}
      </Stack>

      <Box>
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

      <Grid container spacing={2}>
        {config.filters.map((filter) => (
          <Grid key={filter.id} size={{ xs: 12, md: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography
                component="label"
                htmlFor={`analytics-filter-${filter.id}`}
                sx={{
                  ...analyticsFilterLabelSx,
                  flexShrink: 0,
                  width: { xs: 88, sm: 96 },
                }}
              >
                {filter.label}:
              </Typography>
              <FormControl fullWidth size="small" sx={(theme) => analyticsFilterInputSx(theme)}>
                <Select
                  id={`analytics-filter-${filter.id}`}
                  value={filter.value}
                  displayEmpty
                  inputProps={{ 'aria-label': filter.label }}
                >
                  {filter.options.map((option) => (
                    <MenuItem key={option} value={option} sx={analyticsMenuItemSx}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
