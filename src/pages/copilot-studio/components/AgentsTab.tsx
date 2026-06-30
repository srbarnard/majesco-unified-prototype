import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import type { ComposerSelectorOption } from '@/pages/policies/components/CopilotComposer'
import { StudioAgentCard } from '@/pages/copilot-studio/components/StudioAgentCard'
import { StudioBrowseLayout } from '@/pages/copilot-studio/components/StudioBrowseLayout'
import {
  studioAgentsMock,
  type StudioAgent,
  type StudioAgentStatus,
} from '@/pages/copilot-studio/data/mockCopilotStudio'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

type AgentsTabProps = {
  selectedAgentId?: string | null
  onAgentSelect?: (agent: StudioAgent) => void
}

type AgentStatusFilter = StudioAgentStatus | 'View all'

const agentStatusSelectorOptions: ComposerSelectorOption[] = [
  {
    value: 'Active',
    label: 'Active',
    description: 'Show active agents only',
    icon: CheckCircleOutlineIcon,
  },
  {
    value: 'Inactive',
    label: 'Inactive',
    description: 'Show inactive agents',
    icon: CancelOutlinedIcon,
  },
  {
    value: 'View all',
    label: 'View all',
    description: 'Show agents in any status',
    icon: FilterListOutlinedIcon,
  },
]

export function AgentsTab({ selectedAgentId, onAgentSelect }: AgentsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AgentStatusFilter>('Active')
  const [agents, setAgents] = useState(studioAgentsMock)

  const filteredAgents = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    return agents.filter((agent) => {
      const matchesStatus = statusFilter === 'View all' || agent.status === statusFilter
      const matchesSearch =
        !normalized ||
        agent.title.toLowerCase().includes(normalized) ||
        agent.description.toLowerCase().includes(normalized) ||
        agent.category.toLowerCase().includes(normalized)
      return matchesStatus && matchesSearch
    })
  }, [agents, searchQuery, statusFilter])

  const activeCount = agents.filter((agent) => agent.status === 'Active').length

  const handleToggleFavorite = (agent: StudioAgent) => {
    setAgents((current) =>
      current.map((item) => (item.id === agent.id ? { ...item, favorite: !item.favorite } : item)),
    )
  }

  const handleStatusChange = (value: string) => {
    if (value === 'Active' || value === 'Inactive' || value === 'View all') {
      setStatusFilter(value)
    }
  }

  return (
    <StudioBrowseLayout
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      composerPlaceholder="Search agents by name, category, or capability"
      selectorValue={statusFilter}
      selectorOptions={agentStatusSelectorOptions}
      onSelectorChange={handleStatusChange}
    >
      <Stack spacing={2.5}>
        <Typography variant="subtitle1" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}>
          Active agents ({activeCount})
        </Typography>

        <Grid container spacing={2.5}>
          {filteredAgents.map((agent) => (
            <Grid key={agent.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <StudioAgentCard
                agent={agent}
                selected={selectedAgentId === agent.id}
                onSelect={onAgentSelect}
                onToggleFavorite={handleToggleFavorite}
              />
            </Grid>
          ))}
        </Grid>

        {filteredAgents.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontFamily: figmaFontFamilyStack.body, py: 4, textAlign: 'center' }}
          >
            No agents match your search. Try a different name or status filter.
          </Typography>
        )}
      </Stack>
    </StudioBrowseLayout>
  )
}
