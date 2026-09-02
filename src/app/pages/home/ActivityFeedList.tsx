import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import {
  getActivityDayGroup,
  recentActivityMock,
  type ActivityDayGroup,
  type RecentActivityItem,
  type RecentActivityKind,
} from '@/app/data/homeMock'
import { activityVisuals } from '@/app/pages/home/activityVisuals'
import { accentSubtleHover, surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

const DAY_GROUP_ORDER: ActivityDayGroup[] = ['Today', 'Yesterday', 'Earlier']

const FILTER_OPTIONS: Array<{ id: 'all' | RecentActivityKind; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'policy', label: 'Policy' },
  { id: 'quote', label: 'Quote' },
  { id: 'task', label: 'Task' },
  { id: 'claim', label: 'Claim' },
  { id: 'endorsement', label: 'Endorsement' },
  { id: 'renewal', label: 'Renewal' },
  { id: 'billing', label: 'Billing' },
  { id: 'document', label: 'Document' },
]

function ActivityAvatar({ kind }: { kind: RecentActivityKind }) {
  const { Icon, color, bgcolor } = activityVisuals[kind]

  return (
    <Box
      sx={(theme) => ({
        width: 36,
        height: 36,
        borderRadius: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        bgcolor: bgcolor(theme),
        color: color(theme),
      })}
    >
      <Icon sx={{ fontSize: 20 }} />
    </Box>
  )
}

function ActivityRow({
  item,
  isActive,
  onSelect,
}: {
  item: RecentActivityItem
  isActive: boolean
  onSelect?: (activity: RecentActivityItem) => void
}) {
  return (
    <Stack
      component="button"
      type="button"
      direction="row"
      spacing={1.5}
      alignItems="flex-start"
      onClick={() => onSelect?.(item)}
      aria-pressed={isActive}
      sx={{
        py: 1,
        borderRadius: 1.5,
        mx: -0.5,
        px: 0.5,
        border: 'none',
        bgcolor: 'transparent',
        cursor: onSelect ? 'pointer' : 'default',
        textAlign: 'left',
        width: 'calc(100% + 8px)',
        transition: 'background-color 0.15s ease',
        '& [data-activity-title]': { transition: 'color 0.15s ease' },
        ...(isActive
          ? {
              bgcolor: (theme) => accentSubtleHover(theme),
              '& [data-activity-title]': { color: 'primary.main' },
            }
          : {
              '&:hover': onSelect
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
            sx={{ fontFamily: figmaFontFamilyStack.body, flexShrink: 0, fontSize: '0.6875rem' }}
          >
            {item.timestamp.replace(/^(Today|Yesterday) · /, '')}
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontFamily: figmaFontFamilyStack.body,
            fontSize: '0.8125rem',
            mt: 0.25,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.detail}
        </Typography>
      </Box>
    </Stack>
  )
}

type ActivityFeedListProps = {
  items: RecentActivityItem[]
  activeActivityId?: string | null
  onActivitySelect?: (activity: RecentActivityItem) => void
  showFilters?: boolean
  maxRows?: number
}

export function ActivityFeedList({
  items,
  activeActivityId,
  onActivitySelect,
  showFilters = false,
  maxRows,
}: ActivityFeedListProps) {
  const [kindFilter, setKindFilter] = useState<'all' | RecentActivityKind>('all')

  const filteredItems = useMemo(() => {
    const scoped = kindFilter === 'all' ? items : items.filter((item) => item.kind === kindFilter)
    return maxRows ? scoped.slice(0, maxRows) : scoped
  }, [items, kindFilter, maxRows])

  const grouped = useMemo(() => {
    const map = new Map<ActivityDayGroup, RecentActivityItem[]>()
    for (const group of DAY_GROUP_ORDER) {
      map.set(group, [])
    }
    for (const item of filteredItems) {
      const group = getActivityDayGroup(item.timestamp)
      map.get(group)?.push(item)
    }
    return DAY_GROUP_ORDER.map((group) => ({ group, items: map.get(group) ?? [] })).filter(
      (entry) => entry.items.length > 0,
    )
  }, [filteredItems])

  return (
    <Stack spacing={1}>
      {showFilters && (
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
          {FILTER_OPTIONS.map((option) => {
            const selected = kindFilter === option.id
            return (
              <Chip
                key={option.id}
                label={option.label}
                size="small"
                onClick={() => setKindFilter(option.id)}
                sx={{
                  fontFamily: figmaFontFamilyStack.body,
                  fontWeight: selected ? 600 : 500,
                  fontSize: '0.75rem',
                  height: 26,
                  bgcolor: selected ? 'primary.main' : 'background.paper',
                  color: selected ? 'primary.contrastText' : 'text.secondary',
                  border: '1px solid',
                  borderColor: selected ? 'primary.main' : 'divider',
                }}
              />
            )
          })}
        </Stack>
      )}

      {grouped.map(({ group, items: groupItems }) => (
        <Box key={group}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontFamily: figmaFontFamilyStack.heading,
              fontWeight: 600,
              fontSize: '0.6875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'block',
              mb: 0.5,
              px: 0.5,
            }}
          >
            {group}
          </Typography>
          <Stack spacing={0}>
            {groupItems.map((item) => (
              <ActivityRow
                key={item.id}
                item={item}
                isActive={activeActivityId === item.id}
                onSelect={onActivitySelect}
              />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  )
}

export function useActivityFeedItems(limit?: number) {
  return useMemo(() => (limit ? recentActivityMock.slice(0, limit) : recentActivityMock), [limit])
}
