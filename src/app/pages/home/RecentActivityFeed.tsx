import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router'
import { recentActivityMock, type RecentActivityItem, type RecentActivityKind } from '@/app/data/homeMock'
import { activityVisuals } from '@/app/pages/home/activityVisuals'
import type { AppTheme } from '@/design-system/theme'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { entityDetailCardSx } from '@/pages/shared/components/EntityStatGrid'
import { accentSubtleHover, surfaceMuted } from '@/design-system/theme/themeSurfaces'

const ACTIVITY_CARD_MAX_HEIGHT = { xs: 320, md: 380 }

function ActivityAvatar({ kind }: { kind: RecentActivityKind }) {
  const { Icon, color, bgcolor } = activityVisuals[kind]

  return (
    <Box
      sx={(theme) => ({
        width: 40,
        height: 40,
        borderRadius: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        bgcolor: bgcolor(theme),
        color: color(theme),
      })}
    >
      <Icon sx={{ fontSize: 22 }} />
    </Box>
  )
}

type RecentActivityFeedProps = {
  activeActivityId?: string | null
  onActivitySelect?: (activity: RecentActivityItem) => void
}

export function RecentActivityFeed({ activeActivityId, onActivitySelect }: RecentActivityFeedProps) {
  return (
    <Box
      sx={(theme) => ({
        ...entityDetailCardSx(theme as AppTheme),
        display: 'flex',
        flexDirection: 'column',
        maxHeight: ACTIVITY_CARD_MAX_HEIGHT,
        overflow: 'hidden',
      })}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 2,
          pt: 1.5,
          pb: 1,
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}>
          Recent activity
        </Typography>
        <Typography
          component={Link}
          to="/activity"
          variant="body2"
          color="primary"
          sx={{
            fontFamily: figmaFontFamilyStack.body,
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          View all
        </Typography>
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: 2,
          pb: 1.5,
        }}
      >
        <Stack spacing={0.25}>
          {recentActivityMock.map((item) => {
            const isActive = activeActivityId === item.id

            return (
              <Stack
                key={item.id}
                component="button"
                type="button"
                direction="row"
                spacing={1.5}
                alignItems="flex-start"
                onClick={() => onActivitySelect?.(item)}
                aria-pressed={isActive}
                sx={{
                  py: 1.25,
                  borderRadius: 1.5,
                  mx: -0.5,
                  px: 0.5,
                  border: 'none',
                  bgcolor: 'transparent',
                  cursor: onActivitySelect ? 'pointer' : 'default',
                  textAlign: 'left',
                  width: 'calc(100% + 8px)',
                  transition: 'background-color 0.15s ease',
                  '& [data-activity-title]': {
                    transition: 'color 0.15s ease',
                  },
                  ...(isActive
                    ? {
                        bgcolor: (theme) => accentSubtleHover(theme),
                        '& [data-activity-title]': { color: 'primary.main' },
                      }
                    : {
                        '&:hover': onActivitySelect
                          ? {
                              bgcolor: (theme) => surfaceMuted(theme),
                              '& [data-activity-title]': { color: 'primary.main' },
                            }
                          : {},
                      }),
                  '&:focus-visible': {
                    outline: 2,
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                  },
                }}
              >
                <ActivityAvatar kind={item.kind} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2}>
                    <Typography
                      data-activity-title
                      variant="body2"
                      sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '0.8125rem' }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: figmaFontFamilyStack.body, flexShrink: 0 }}
                    >
                      {item.timestamp}
                    </Typography>
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', mt: 0.25 }}
                  >
                    {item.detail}
                  </Typography>
                </Box>
              </Stack>
            )
          })}
        </Stack>
      </Box>
    </Box>
  )
}
