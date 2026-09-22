import AddIcon from '@mui/icons-material/Add'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { Button, SearchField } from '@/design-system/components'
import { filterFooterButtonSx } from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { QuoteWizardFormField } from '@/pages/quotes/components/wizard/QuoteWizardFormField'
import { CopilotDrawerSubHeader } from './CopilotDrawerSubHeader'
import {
  copilotDrawerPromptGroups,
  type CopilotDrawerPrompt,
  type CopilotDrawerPromptGroup,
} from './copilotDrawerData'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

type CopilotPromptsViewProps = {
  onBack: () => void
  onSelectPrompt: (prompt: CopilotDrawerPrompt) => void
  onOpenAgents: () => void
}

export function CopilotPromptsView({ onBack, onSelectPrompt, onOpenAgents }: CopilotPromptsViewProps) {
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftBody, setDraftBody] = useState('')
  const [customPrompts, setCustomPrompts] = useState<CopilotDrawerPrompt[]>([])
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    copilotDrawerPromptGroups.forEach((group) => {
      group.prompts.forEach((prompt) => {
        initial[prompt.id] = prompt.favorite
      })
    })
    return initial
  })
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [menuState, setMenuState] = useState<{ anchor: HTMLElement; promptId: string } | null>(null)

  const groups = useMemo(() => {
    const base: CopilotDrawerPromptGroup[] =
      customPrompts.length > 0
        ? [{ id: 'mine', label: 'My prompts', prompts: customPrompts }, ...copilotDrawerPromptGroups]
        : copilotDrawerPromptGroups

    const normalized = search.trim().toLowerCase()
    if (!normalized) return base
    return base
      .map((group) => ({
        ...group,
        prompts: group.prompts.filter((prompt) => prompt.title.toLowerCase().includes(normalized)),
      }))
      .filter((group) => group.prompts.length > 0)
  }, [customPrompts, search])

  const toggleFavorite = (promptId: string) => {
    setFavorites((current) => ({ ...current, [promptId]: !current[promptId] }))
  }

  const toggleCollapsed = (groupId: string) => {
    setCollapsed((current) => ({ ...current, [groupId]: !current[groupId] }))
  }

  const openCreate = () => {
    setCreating(true)
    setDraftTitle('')
    setDraftBody('')
  }

  const cancelCreate = () => {
    setCreating(false)
    setDraftTitle('')
    setDraftBody('')
  }

  const saveCreate = () => {
    const title = draftTitle.trim()
    if (!title) return
    const id = `prompt-custom-${Date.now()}`
    setCustomPrompts((current) => [{ id, title, favorite: false }, ...current])
    setFavorites((current) => ({ ...current, [id]: false }))
    setCreating(false)
    setDraftTitle('')
    setDraftBody('')
  }

  const canSave = draftTitle.trim().length > 0

  if (creating) {
    return (
      <Box>
        <CopilotDrawerSubHeader title="New prompt" onBack={cancelCreate} />

        <Stack spacing={2}>
          <QuoteWizardFormField
            label="Title"
            value={draftTitle}
            onChange={setDraftTitle}
            placeholder="Name this prompt"
            fullWidth
            autoFocus
          />
          <QuoteWizardFormField
            label="Prompt"
            value={draftBody}
            onChange={setDraftBody}
            placeholder="Write the prompt text…"
            multiline
            minRows={4}
            fullWidth
          />
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" color="primary" fullWidth onClick={cancelCreate} sx={filterFooterButtonSx}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={!canSave}
              onClick={saveCreate}
              sx={filterFooterButtonSx}
            >
              Save prompt
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={bodySx}>
            Saved prompts appear under My prompts.
          </Typography>
        </Stack>
      </Box>
    )
  }

  return (
    <Box>
      <CopilotDrawerSubHeader
        title="Prompts"
        onBack={onBack}
        actions={
          <>
            <Tooltip title="New prompt">
              <IconButton size="small" aria-label="New prompt" onClick={openCreate}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Agents">
              <IconButton size="small" aria-label="Agents" onClick={onOpenAgents}>
                <SmartToyOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        }
      />

      <SearchField
        fullWidth
        placeholder="Search prompts"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        sx={{ mb: 1 }}
      />

      <Stack sx={{ mx: -2 }}>
        {groups.map((group) => {
          const isCollapsed = collapsed[group.id] ?? false
          return (
            <Box key={group.id} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Box
                component="button"
                type="button"
                onClick={() => toggleCollapsed(group.id)}
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 2,
                  py: 1.25,
                  border: 'none',
                  bgcolor: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {isCollapsed ? (
                  <KeyboardArrowRightIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                ) : (
                  <ExpandMoreIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                )}
                <Typography
                  variant="body2"
                  sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}
                >
                  {group.label}
                </Typography>
              </Box>

              <Collapse in={!isCollapsed}>
                <Stack sx={{ pb: 0.5 }}>
                  {group.prompts.map((prompt) => (
                    <Stack
                      key={prompt.id}
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      sx={{
                        pl: 4,
                        pr: 1.5,
                        py: 0.75,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Box
                        component="button"
                        type="button"
                        onClick={() => onSelectPrompt(prompt)}
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          border: 'none',
                          bgcolor: 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          p: 0,
                        }}
                      >
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ fontFamily: figmaFontFamilyStack.body }}
                        >
                          {prompt.title}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        aria-label={favorites[prompt.id] ? 'Remove favorite' : 'Add favorite'}
                        onClick={() => toggleFavorite(prompt.id)}
                      >
                        {favorites[prompt.id] ? (
                          <FavoriteIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        ) : (
                          <FavoriteBorderIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label={`More options for ${prompt.title}`}
                        onClick={(event) => setMenuState({ anchor: event.currentTarget, promptId: prompt.id })}
                      >
                        <MoreVertIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              </Collapse>
            </Box>
          )
        })}

        {groups.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontFamily: figmaFontFamilyStack.body, textAlign: 'center', py: 4, px: 2 }}
          >
            No prompts match your search.
          </Typography>
        )}
      </Stack>

      <Menu
        anchorEl={menuState?.anchor ?? null}
        open={Boolean(menuState)}
        onClose={() => setMenuState(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => setMenuState(null)}>Edit</MenuItem>
        <MenuItem onClick={() => setMenuState(null)}>Discard</MenuItem>
      </Menu>
    </Box>
  )
}
