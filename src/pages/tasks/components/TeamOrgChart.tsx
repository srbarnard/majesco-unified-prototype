import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Theme } from '@mui/material/styles'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { isDarkMode, surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import {
  getTeamSubtreeNames,
  teamMembersMock,
  type TeamMemberRecord,
} from '@/pages/tasks/data/mockTasks'

type TeamOrgChartProps = {
  searchQuery: string
  onMemberSelect?: (assignees: string[]) => void
}

const CARD_WIDTH = 204
/** Vertical gap between a manager card and the horizontal bus to their reports. */
const LINK_GAP = 20
const LINE_WIDTH = 2

function matchesSearch(member: TeamMemberRecord, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return member.name.toLowerCase().includes(normalized) || member.title.toLowerCase().includes(normalized)
}

function lineColor(theme: Theme) {
  return isDarkMode(theme) ? theme.figmaPalette.grey[700] : theme.figmaPalette.grey[300]
}

/**
 * Classic CSS tree connectors: each report draws half of the horizontal bus plus its drop line;
 * each nested list draws the stem down from its manager.
 */
function treeSx(theme: Theme) {
  const border = `${LINE_WIDTH}px solid ${lineColor(theme)}`
  return {
    '& ul': {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      listStyle: 'none',
      m: 0,
      p: 0,
      pt: `${LINK_GAP}px`,
    },
    '& ul::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '50%',
      height: LINK_GAP,
      borderLeft: border,
      transform: `translateX(-${LINE_WIDTH / 2}px)`,
    },
    '& li': {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      px: 1,
      pt: `${LINK_GAP}px`,
    },
    '& li::before, & li::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: '50%',
      width: '50%',
      height: LINK_GAP,
      borderTop: border,
    },
    '& li::after': {
      right: 'auto',
      left: '50%',
      borderLeft: border,
      transform: `translateX(-${LINE_WIDTH / 2}px)`,
    },
    '& li:first-of-type::before, & li:last-of-type::after': { border: 'none' },
    '& li:last-of-type::before': {
      borderRight: border,
      borderTopRightRadius: 8,
      transform: `translateX(${LINE_WIDTH / 2}px)`,
    },
    '& li:first-of-type::after': { borderTopLeftRadius: 8 },
    // A single report is a straight drop — no bus.
    '& li:only-child::before': { display: 'none' },
    '& li:only-child::after': { borderTop: 'none', borderLeft: border, borderTopLeftRadius: 0 },
    // Top-level people have no manager line above them.
    '& > ul': { pt: 0 },
    '& > ul::before': { display: 'none' },
    '& > ul > li': { pt: 0 },
    '& > ul > li::before, & > ul > li::after': { display: 'none' },
  } as const
}

function MemberCard({ member, onSelect }: { member: TeamMemberRecord; onSelect: () => void }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onSelect}
      aria-label={`Show tasks for ${member.name} and their team`}
      sx={{
        position: 'relative',
        zIndex: 1,
        width: CARD_WIDTH,
        border: 1,
        borderColor: 'divider',
        borderRadius: `${layoutTokens.cardRadius}px`,
        bgcolor: 'background.paper',
        boxShadow: layoutTokens.cardShadow,
        cursor: 'pointer',
        p: 0,
        textAlign: 'left',
        overflow: 'hidden',
        font: 'inherit',
        color: 'text.primary',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
        '&:hover, &:focus-visible': {
          borderColor: 'primary.main',
          boxShadow: '0 4px 14px rgba(0,0,0,0.10)',
          outline: 'none',
        },
        '@media (prefers-reduced-motion: no-preference)': {
          '&:hover': { transform: 'translateY(-1px)' },
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ px: 1.25, py: 1.25 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 700, fontSize: '1rem', lineHeight: 1.1 }}
          >
            {member.totalTasks}
          </Typography>
          <Typography sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.5625rem', lineHeight: 1.2 }}>
            Tasks
          </Typography>
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            noWrap
            title={member.name}
            sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.35 }}
          >
            {member.name}
          </Typography>
          <Typography
            noWrap
            title={member.title}
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', lineHeight: 1.3 }}
          >
            {member.title}
          </Typography>
        </Box>
      </Stack>
      <Box
        sx={{
          px: 1.25,
          py: 0.625,
          bgcolor: (theme) => surfaceMuted(theme),
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.6875rem' }}>
          {member.dueToday} due today ·{' '}
          <Box
            component="span"
            sx={{
              color: member.pastDue > 0 ? 'error.main' : 'inherit',
              fontWeight: member.pastDue > 0 ? 600 : 400,
            }}
          >
            {member.pastDue} past due
          </Box>
        </Typography>
      </Box>
    </Box>
  )
}

export function TeamOrgChart({ searchQuery, onMemberSelect }: TeamOrgChartProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const filteredMembers = useMemo(
    () => teamMembersMock.filter((member) => matchesSearch(member, searchQuery)),
    [searchQuery],
  )

  const { roots, byManager } = useMemo(() => {
    const visible = new Set(filteredMembers.map((member) => member.id))
    const map = new Map<string, TeamMemberRecord[]>()
    const topLevel: TeamMemberRecord[] = []
    for (const member of filteredMembers) {
      if (member.managerId && visible.has(member.managerId)) {
        const list = map.get(member.managerId) ?? []
        list.push(member)
        map.set(member.managerId, list)
      } else {
        topLevel.push(member)
      }
    }
    return { roots: topLevel, byManager: map }
  }, [filteredMembers])

  // Wide trees overflow; start scrolled so the top of the hierarchy is centered.
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2)
  }, [filteredMembers])

  const renderNode = (member: TeamMemberRecord) => {
    const reports = byManager.get(member.id) ?? []
    return (
      <li key={member.id}>
        <MemberCard member={member} onSelect={() => onMemberSelect?.(getTeamSubtreeNames(member.id))} />
        {reports.length > 0 ? <ul>{reports.map(renderNode)}</ul> : null}
      </li>
    )
  }

  return (
    <Box ref={scrollRef} sx={{ height: '100%', minHeight: 0, overflow: 'auto', pb: 2 }}>
      {roots.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
          No team members match your search.
        </Typography>
      ) : (
        <>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ fontFamily: figmaFontFamilyStack.body, mb: 2 }}
          >
            Select a person to see their team’s tasks.
          </Typography>
          <Box sx={{ display: 'flex', minWidth: 'max-content', justifyContent: 'center', px: 1 }}>
            <Box sx={(theme) => treeSx(theme)}>
              <ul>{roots.map(renderNode)}</ul>
            </Box>
          </Box>
        </>
      )}
    </Box>
  )
}
