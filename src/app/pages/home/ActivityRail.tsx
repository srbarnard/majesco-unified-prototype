import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import {
  getActivityDayGroup,
  type ActivityDayGroup,
  type RecentActivityItem,
} from '@/app/data/homeMock'
import { formatPulseTimestamp } from '@/app/data/pulseMock'
import { surfaceMuted, surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

const RAIL_WIDTH = 24
const NODE_SIZE = 8
const RAIL_THICKNESS = 2
const DAY_GROUP_ORDER: ActivityDayGroup[] = ['Today', 'Yesterday']

function isNeedsAction(item: RecentActivityItem): boolean {
  const status = item.status.toLowerCase()
  return (
    status.includes('past due') ||
    status.includes('needs action') ||
    item.statusVariant === 'error'
  )
}

function activitySubtitle(item: RecentActivityItem): string {
  if (item.insuredName && item.submissionNumber) {
    return `${item.insuredName} · ${item.submissionNumber}`
  }
  if (item.insuredName && item.policyNumber) {
    return `${item.insuredName} · ${item.policyNumber}`
  }
  if (item.insuredName && item.quoteNumber) {
    return `${item.insuredName} · ${item.quoteNumber}`
  }
  if (item.insuredName && item.claimNumber) {
    return `${item.insuredName} · ${item.claimNumber}`
  }
  return item.insuredName || item.detail
}

type ActivityRailRowProps = {
  item: RecentActivityItem
  showConnector: boolean
  isCopilotActive?: boolean
  onSelect?: (activity: RecentActivityItem) => void
  onAskCopilot?: (activity: RecentActivityItem) => void
  getSubtitle?: (item: RecentActivityItem) => string
}

function ActivityRailRow({
  item,
  showConnector,
  isCopilotActive = false,
  onSelect,
  onAskCopilot,
  getSubtitle = activitySubtitle,
}: ActivityRailRowProps) {
  const theme = useTheme()
  const needsAction = isNeedsAction(item)
  const isDarkMode = theme.palette.mode === 'dark'
  // Copilot focus selects the whole row (clearer than icon-only chrome).
  const rowSelected = isCopilotActive || needsAction
  const railColor = alpha(theme.palette.primary.main, isDarkMode ? 0.55 : 0.35)

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `${RAIL_WIDTH}px 1fr`,
        columnGap: 1.5,
        alignItems: 'stretch',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'relative',
          width: RAIL_WIDTH,
          display: 'flex',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {showConnector ? (
          <Box
            sx={{
              position: 'absolute',
              top: 18,
              bottom: -12,
              left: '50%',
              width: RAIL_THICKNESS,
              ml: `-${RAIL_THICKNESS / 2}px`,
              bgcolor: railColor,
            }}
          />
        ) : null}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            mt: '14px',
            width: NODE_SIZE,
            height: NODE_SIZE,
            borderRadius: '50%',
            boxSizing: 'border-box',
            border: '2px solid',
            borderColor: 'primary.main',
            bgcolor: rowSelected ? 'primary.main' : 'background.paper',
            flexShrink: 0,
          }}
        />
      </Box>

      <Box
        role={onAskCopilot || onSelect ? 'button' : undefined}
        tabIndex={onAskCopilot || onSelect ? 0 : undefined}
        aria-pressed={onAskCopilot ? isCopilotActive : undefined}
        aria-label={
          onAskCopilot
            ? isCopilotActive
              ? `Clear Copilot focus on ${item.label}`
              : `Ask Copilot about ${item.label}`
            : undefined
        }
        onClick={() => {
          // Whole row is the Copilot toggle when available.
          if (onAskCopilot) {
            onAskCopilot(item)
            return
          }
          onSelect?.(item)
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          if (onAskCopilot) {
            onAskCopilot(item)
            return
          }
          onSelect?.(item)
        }}
        sx={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          border: 'none',
          cursor: onAskCopilot || onSelect ? 'pointer' : 'default',
          py: '12px',
          px: '16px',
          borderRadius: '8px',
          // Match chart pill selected state when Copilot is focused on this row.
          bgcolor: rowSelected ? 'primary.main' : (t) => surfaceMuted(t),
          color: rowSelected ? 'primary.contrastText' : 'text.primary',
          mb: 1.5,
          transition: 'background-color 0.15s ease, opacity 0.15s ease',
          '&:hover': onAskCopilot || onSelect
            ? {
                bgcolor: rowSelected ? 'primary.dark' : (t) => surfaceSubtle(t),
              }
            : {},
          '&:focus-visible': {
            outline: 2,
            outlineColor: rowSelected ? 'primary.contrastText' : 'primary.main',
            outlineOffset: 2,
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: figmaFontFamilyStack.heading,
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: 'inherit',
                minWidth: 0,
              }}
            >
              {item.label}
            </Typography>
            <Typography
              variant="body2"
              noWrap
              sx={{
                fontFamily: figmaFontFamilyStack.body,
                fontSize: '0.8125rem',
                mt: 0.25,
                color: rowSelected ? 'inherit' : 'text.secondary',
                opacity: rowSelected ? 0.9 : 1,
              }}
            >
              {getSubtitle(item)}
            </Typography>
          </Box>

          <Typography
            variant="caption"
            sx={{
              fontFamily: figmaFontFamilyStack.body,
              fontSize: '0.6875rem',
              flexShrink: 0,
              color: rowSelected ? 'inherit' : 'text.secondary',
              opacity: rowSelected ? 0.85 : 1,
            }}
          >
            {formatPulseTimestamp(item.timestamp)}
          </Typography>
        </Stack>
      </Box>
    </Box>
  )
}

type ActivityRailProps = {
  items: RecentActivityItem[]
  activeCopilotActivityId?: string | null
  onActivitySelect?: (activity: RecentActivityItem) => void
  onActivityCopilot?: (activity: RecentActivityItem) => void
  /** Defaults to account · record id. Pass detail for record-scoped rails. */
  getSubtitle?: (item: RecentActivityItem) => string
}

export function ActivityRail({
  items,
  activeCopilotActivityId,
  onActivitySelect,
  onActivityCopilot,
  getSubtitle,
}: ActivityRailProps) {
  const groups = DAY_GROUP_ORDER.map((group) => ({
    group,
    items: items.filter((item) => getActivityDayGroup(item.timestamp) === group),
  })).filter((entry) => entry.items.length > 0)

  if (groups.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
        No recent activity
      </Typography>
    )
  }

  return (
    <Stack spacing={2}>
      {groups.map(({ group, items: groupItems }) => {
        return (
          <Box key={group}>
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: figmaFontFamilyStack.heading,
                fontWeight: 600,
                fontSize: '0.875rem',
                mb: 1,
                color: 'text.primary',
              }}
            >
              {group}
            </Typography>
            <Box>
              {groupItems.map((item, index) => {
                const isLastRow = index === groupItems.length - 1
                return (
                  <ActivityRailRow
                    key={item.id}
                    item={item}
                    showConnector={!isLastRow}
                    isCopilotActive={activeCopilotActivityId === item.id}
                    onSelect={onActivitySelect}
                    onAskCopilot={onActivityCopilot}
                    getSubtitle={getSubtitle}
                  />
                )
              })}
            </Box>
          </Box>
        )
      })}
    </Stack>
  )
}
