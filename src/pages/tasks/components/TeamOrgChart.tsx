import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { teamMembersMock, type TeamMemberRecord } from '@/pages/tasks/data/mockTasks'

type TeamOrgChartProps = {
  searchQuery: string
}

function matchesSearch(member: TeamMemberRecord, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return member.name.toLowerCase().includes(normalized) || member.title.toLowerCase().includes(normalized)
}

function MemberCard({
  member,
  selected,
  onSelect,
}: {
  member: TeamMemberRecord
  selected: boolean
  onSelect: () => void
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onSelect}
      sx={{
        border: 2,
        borderColor: selected ? 'primary.main' : 'divider',
        borderRadius: `${layoutTokens.cardRadius}px`,
        bgcolor: 'background.paper',
        boxShadow: selected ? '0 0 0 1px rgba(25, 118, 210, 0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        p: 0,
        minWidth: 220,
        maxWidth: 260,
        textAlign: 'left',
        overflow: 'hidden',
        '&:hover': {
          borderColor: 'primary.main',
        },
      }}
    >
      <Stack direction="row" sx={{ minHeight: 88 }}>
        <Box
          sx={{
            width: 56,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 0.5,
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 700, fontSize: '1.125rem', lineHeight: 1.1 }}>
            {member.totalTasks}
          </Typography>
          <Typography sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.625rem', lineHeight: 1.2 }}>
            Tasks
          </Typography>
        </Box>
        <Stack spacing={0.25} sx={{ p: 1.25, flex: 1, minWidth: 0 }}>
          <Typography
            noWrap
            sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '0.875rem' }}
          >
            {member.name}
          </Typography>
          <Typography
            noWrap
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block' }}
          >
            {member.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
            {member.directReports} direct reports
          </Typography>
        </Stack>
      </Stack>
      <Box
        sx={{
          px: 1.25,
          py: 0.75,
          bgcolor: (theme) => surfaceMuted(theme),
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.6875rem' }}>
          {member.dueToday} due today |{' '}
          <Box component="span" sx={{ color: member.pastDue > 0 ? 'error.main' : 'inherit', fontWeight: member.pastDue > 0 ? 600 : 400 }}>
            {member.pastDue} past due
          </Box>
        </Typography>
      </Box>
    </Box>
  )
}

export function TeamOrgChart({ searchQuery }: TeamOrgChartProps) {
  const [selectedId, setSelectedId] = useState<string | null>('tm-1')

  const filteredMembers = useMemo(
    () => teamMembersMock.filter((member) => matchesSearch(member, searchQuery)),
    [searchQuery],
  )

  const roots = filteredMembers.filter((member) => !member.managerId)
  const byManager = useMemo(() => {
    const map = new Map<string, TeamMemberRecord[]>()
    for (const member of filteredMembers) {
      if (!member.managerId) continue
      const list = map.get(member.managerId) ?? []
      list.push(member)
      map.set(member.managerId, list)
    }
    return map
  }, [filteredMembers])

  const renderSubtree = (member: TeamMemberRecord, depth: number) => {
    const reports = byManager.get(member.id) ?? []
    return (
      <Stack key={member.id} spacing={2} alignItems="center">
        <MemberCard
          member={member}
          selected={selectedId === member.id}
          onSelect={() => setSelectedId(member.id)}
        />
        {reports.length > 0 && (
          <>
            <Box
              sx={{
                width: 2,
                height: 24,
                bgcolor: 'primary.main',
                opacity: 0.4,
              }}
            />
            <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap" useFlexGap>
              {reports.map((report) => (
                <Stack key={report.id} spacing={1} alignItems="center">
                  <Box sx={{ width: 2, height: 16, bgcolor: 'primary.main', opacity: 0.4 }} />
                  {renderSubtree(report, depth + 1)}
                </Stack>
              ))}
            </Stack>
          </>
        )}
      </Stack>
    )
  }

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        py: 2,
        px: 1,
      }}
    >
      {roots.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
          No team members match your search.
        </Typography>
      ) : (
        <Stack spacing={3} alignItems="center">
          {roots.map((root) => renderSubtree(root, 0))}
        </Stack>
      )}
    </Box>
  )
}
