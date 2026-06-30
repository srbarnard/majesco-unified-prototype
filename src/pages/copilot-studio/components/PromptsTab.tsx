import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import type { ComposerSelectorOption } from '@/pages/policies/components/CopilotComposer'
import { PromptCard } from '@/pages/copilot-studio/components/PromptCard'
import { StudioBrowseLayout } from '@/pages/copilot-studio/components/StudioBrowseLayout'
import {
  studioPromptCategories,
  studioPromptsMock,
  type StudioPrompt,
  type StudioPromptCategory,
} from '@/pages/copilot-studio/data/mockCopilotStudio'
import { studioCardSx } from '@/pages/copilot-studio/data/studioCardStyles'
import { accentSubtleHover } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

type PromptsTabProps = {
  selectedPromptId?: string | null
  onPromptSelect?: (prompt: StudioPrompt) => void
}

type PromptTypeFilter = 'Prompts' | 'Actions' | 'View all'

const promptTypeSelectorOptions: ComposerSelectorOption[] = [
  {
    value: 'Prompts',
    label: 'Prompts',
    description: 'Show saved prompts',
    icon: PsychologyOutlinedIcon,
  },
  {
    value: 'Actions',
    label: 'Actions',
    description: 'Show workflow actions',
    icon: BoltOutlinedIcon,
  },
  {
    value: 'View all',
    label: 'View all',
    description: 'Show prompts and actions',
    icon: FilterListOutlinedIcon,
  },
]

export function PromptsTab({ selectedPromptId, onPromptSelect }: PromptsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<StudioPromptCategory>('All products')
  const [typeFilter, setTypeFilter] = useState<PromptTypeFilter>('Prompts')

  const filteredPrompts = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase()
    return studioPromptsMock.filter((prompt) => {
      const matchesCategory = categoryFilter === 'All products' || prompt.category === categoryFilter
      const matchesSearch =
        !normalized ||
        prompt.title.toLowerCase().includes(normalized) ||
        prompt.description.toLowerCase().includes(normalized)
      return matchesCategory && matchesSearch
    })
  }, [searchQuery, categoryFilter])

  const showPrompts = typeFilter === 'Prompts' || typeFilter === 'View all'
  const showActions = typeFilter === 'Actions' || typeFilter === 'View all'

  const handleTypeChange = (value: string) => {
    if (value === 'Prompts' || value === 'Actions' || value === 'View all') {
      setTypeFilter(value)
    }
  }

  return (
    <StudioBrowseLayout
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      composerPlaceholder="Search prompts by title or description"
      selectorValue={typeFilter}
      selectorOptions={promptTypeSelectorOptions}
      onSelectorChange={handleTypeChange}
    >
      <Stack spacing={2.5}>
        <Box
          sx={(theme) => ({
            ...studioCardSx(theme),
            p: 2,
          })}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {studioPromptCategories.map((category) => {
              const selected = categoryFilter === category
              return (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => setCategoryFilter(category)}
                  sx={{
                    fontFamily: figmaFontFamilyStack.body,
                    fontWeight: selected ? 600 : 500,
                    fontSize: '0.8125rem',
                    bgcolor: selected ? 'primary.main' : 'background.paper',
                    color: selected ? 'primary.contrastText' : 'text.secondary',
                    border: '1px solid',
                    borderColor: selected ? 'primary.main' : 'divider',
                    '&:hover': {
                      bgcolor: selected ? 'primary.main' : (theme) => accentSubtleHover(theme),
                    },
                  }}
                />
              )
            })}
          </Stack>
        </Box>

        {showPrompts && (
          <>
            <Grid container spacing={2.5}>
              {filteredPrompts.map((prompt) => (
                <Grid key={prompt.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <PromptCard prompt={prompt} selected={selectedPromptId === prompt.id} onSelect={onPromptSelect} />
                </Grid>
              ))}
            </Grid>

            {filteredPrompts.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontFamily: figmaFontFamilyStack.body, py: 4, textAlign: 'center' }}
              >
                No prompts match your search. Try a different title or category.
              </Typography>
            )}
          </>
        )}

        {showActions && (
          <Box
            sx={(theme) => ({
              ...studioCardSx(theme),
              p: 4,
              textAlign: 'center',
            })}
          >
            <BoltOutlinedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1.5 }} />
            <Typography variant="subtitle1" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, mb: 0.5 }}>
              Workflow actions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body, maxWidth: 420, mx: 'auto' }}>
              Connect agents to policy, billing, and claims workflows. Action templates will appear here as they are configured.
            </Typography>
          </Box>
        )}
      </Stack>
    </StudioBrowseLayout>
  )
}
