import type { SvgIconComponent } from '@mui/icons-material'
import AddIcon from '@mui/icons-material/Add'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import CheckIcon from '@mui/icons-material/Check'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { useState } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import {
  accentSubtle,
  accentSubtleHover,
  isDarkMode,
  surfaceMuted,
  surfaceSubtle,
} from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

type CopilotMode = 'fast' | 'thinking'

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

const subtitleSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 500,
} as const

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const modeOptions = [
  {
    value: 'fast' as const,
    label: 'Fast',
    description: 'Quick answers for simple tasks',
    icon: BoltOutlinedIcon,
  },
  {
    value: 'thinking' as const,
    label: 'Thinking',
    description: 'More reasoning for complex tasks',
    icon: PsychologyOutlinedIcon,
  },
]

export type ComposerSelectorOption = {
  value: string
  label: string
  description?: string
  icon?: SvgIconComponent
}

function ComposerToolbarSelector({
  value,
  options,
  onChange,
  showModelRow = true,
}: {
  value: string
  options: ComposerSelectorOption[]
  onChange: (value: string) => void
  showModelRow?: boolean
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const activeOption = options.find((option) => option.value === value) ?? options[0]
  const ActiveIcon = activeOption.icon

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          border: 0,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 0.75,
          py: 0.5,
          borderRadius: 1,
          bgcolor: 'transparent',
          color: 'text.primary',
          fontFamily: figmaFontFamilyStack.heading,
          fontWeight: 500,
          fontSize: '0.8125rem',
          lineHeight: 1.2,
          '&:hover': {
            bgcolor: (theme) => surfaceSubtle(theme),
          },
        }}
      >
        {ActiveIcon && <ActiveIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
        {activeOption.label}
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: (theme) => ({
              width: 280,
              borderRadius: `${layoutTokens.cardRadius}px`,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: isDarkMode(theme) ? '0 8px 24px rgba(0, 0, 0, 0.45)' : '0 8px 24px rgba(0, 0, 0, 0.12)',
              mt: -1,
              overflow: 'hidden',
            }),
          },
        }}
      >
        <Stack divider={showModelRow ? <Divider /> : undefined}>
          <Stack sx={{ py: 0.5 }}>
            {options.map((option) => {
              const Icon = option.icon
              const selected = value === option.value
              return (
                <Box
                  key={option.value}
                  component="button"
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setAnchorEl(null)
                  }}
                  sx={{
                    border: 0,
                    width: '100%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.25,
                    px: 1.5,
                    py: 1.25,
                    bgcolor: 'background.paper',
                    textAlign: 'left',
                    '&:hover': {
                      bgcolor: (theme) => surfaceMuted(theme),
                    },
                  }}
                >
                  {Icon && <Icon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.125 }} />}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.875rem' }}>
                      {option.label}
                    </Typography>
                    {option.description && (
                      <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, display: 'block', mt: 0.25 }}>
                        {option.description}
                      </Typography>
                    )}
                  </Box>
                  {selected && <CheckIcon sx={{ fontSize: 18, color: 'success.main', mt: 0.125 }} />}
                </Box>
              )
            })}
          </Stack>

          {showModelRow && (
            <Box
              component="button"
              type="button"
              sx={{
                border: 0,
                width: '100%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1.5,
                py: 1.25,
                bgcolor: 'background.paper',
                textAlign: 'left',
                '&:hover': {
                  bgcolor: (theme) => surfaceMuted(theme),
                },
              }}
            >
              <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.875rem' }}>
                Model
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <SettingsOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ ...subtitleSx, fontSize: '0.8125rem', color: 'text.secondary' }}>
                  Auto
                </Typography>
                <ChevronRightIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
              </Stack>
            </Box>
          )}
        </Stack>
      </Popover>
    </>
  )
}

function ModePopover({
  mode,
  onChange,
}: {
  mode: CopilotMode
  onChange: (mode: CopilotMode) => void
}) {
  return (
    <ComposerToolbarSelector
      value={mode}
      onChange={(next) => onChange(next as CopilotMode)}
      showModelRow
      options={modeOptions.map((option) => ({
        value: option.value,
        label: option.label,
        description: option.description,
        icon: option.icon,
      }))}
    />
  )
}

export type CopilotComposerProps = {
  placeholder?: string
  minRows?: number
  padded?: boolean
  footerAction?: ReactNode
  sx?: SxProps<Theme>
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  clearOnSubmit?: boolean
  showDisclaimer?: boolean
  selectorValue?: string
  selectorOptions?: ComposerSelectorOption[]
  onSelectorChange?: (value: string) => void
  onSubmit?: (message: string) => void
}

export function CopilotComposer({
  placeholder = 'Select a prompt or ask me anything',
  minRows = 2,
  padded = true,
  footerAction,
  sx,
  value,
  onChange,
  onFocus,
  clearOnSubmit = true,
  showDisclaimer = true,
  selectorValue,
  selectorOptions,
  onSelectorChange,
  onSubmit,
}: CopilotComposerProps) {
  const [mode, setMode] = useState<CopilotMode>('fast')
  const [internalMessage, setInternalMessage] = useState('')
  const isControlled = value !== undefined && onChange !== undefined
  const message = isControlled ? value : internalMessage

  const setMessage = (next: string) => {
    if (isControlled) {
      onChange(next)
      return
    }
    setInternalMessage(next)
  }

  const canSubmit = message.trim().length > 0

  const handleSubmit = () => {
    const trimmed = message.trim()
    if (!trimmed) return
    onSubmit?.(trimmed)
    if (clearOnSubmit) {
      setMessage('')
    }
  }

  return (
    <Box sx={[{ ...(padded ? { px: 2, py: 2 } : {}) }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
      <Box
        sx={(theme) => ({
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: `${layoutTokens.cardRadius}px`,
          bgcolor: 'background.paper',
          boxShadow: isDarkMode(theme) ? 'none' : layoutTokens.cardShadow,
          overflow: 'hidden',
          '&:focus-within': {
            borderColor: 'primary.main',
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 0,
          },
        })}
      >
        <TextField
          fullWidth
          multiline
          minRows={minRows}
          maxRows={5}
          variant="standard"
          placeholder={placeholder}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onFocus={onFocus}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              handleSubmit()
            }
          }}
          slotProps={{
            input: {
              disableUnderline: true,
              sx: {
                ...bodySx,
                fontSize: '0.875rem',
                px: 1.75,
                pt: 1.25,
                pb: 1,
                '&.Mui-focused': {
                  outline: 'none',
                },
              },
            },
          }}
        />

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 1,
            py: 0.75,
            bgcolor: 'background.paper',
            gap: 1,
          }}
        >
          <Stack direction="row" spacing={0.25} alignItems="center">
            <IconButton size="small" aria-label="Add attachment">
              <AddIcon sx={{ fontSize: 20 }} />
            </IconButton>
            {selectorOptions && selectorValue !== undefined && onSelectorChange ? (
              <ComposerToolbarSelector
                value={selectorValue}
                options={selectorOptions}
                onChange={onSelectorChange}
                showModelRow={false}
              />
            ) : (
              <ModePopover mode={mode} onChange={setMode} />
            )}
          </Stack>

          <Stack direction="row" spacing={0.25} alignItems="center">
            <IconButton size="small" aria-label="Voice input">
              <MicNoneOutlinedIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Send message"
              disabled={!canSubmit}
              onClick={handleSubmit}
              sx={(theme) => ({
                width: 34,
                height: 34,
                bgcolor: canSubmit ? accentSubtle(theme) : surfaceSubtle(theme),
                color: canSubmit ? 'primary.main' : 'text.disabled',
                '&:hover': {
                  bgcolor: canSubmit ? accentSubtleHover(theme) : surfaceSubtle(theme),
                },
                '&.Mui-disabled': {
                  bgcolor: surfaceSubtle(theme),
                  color: 'text.disabled',
                },
              })}
            >
              <KeyboardArrowUpIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {footerAction}

      {showDisclaimer && (
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ ...bodySx, mt: footerAction ? 0.75 : 1, display: 'block', textAlign: 'center' }}
        >
          Copilot uses AI. Check for mistakes. Terms &amp; conditions.
        </Typography>
      )}
    </Box>
  )
}
