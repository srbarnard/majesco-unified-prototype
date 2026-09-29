import type { SvgIconComponent } from '@mui/icons-material'
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import CheckIcon from '@mui/icons-material/Check'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import { VoiceInputButton } from '@/design-system/components/SearchField/VoiceInputButton'
import {
  accentSubtle,
  isDarkMode,
  surfaceMuted,
  surfaceSubtle,
} from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { ComposerSendButton } from '@/pages/policies/components/ComposerSendButton'
import type { QuoteWizardUploadedFile } from '@/pages/quotes/data/quoteWizardTypes'
import {
  createUploadedFile,
  isAcceptedWizardFile,
  kindLabel,
  mergeUploadedFiles,
} from '@/pages/quotes/utils/quoteWizardDocuments'

export type CopilotAttachedFile = QuoteWizardUploadedFile

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

const FILE_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.eml,.msg'

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
  /** When true (default), paperclip + drag/drop attachments match New Quote input. */
  enableAttachments?: boolean
  /** Fast / Thinking selector. Hide for non-chat composers such as Notes. */
  showModeSelector?: boolean
  /** Increment / change to programmatically open the file picker (e.g. guided “Upload…”). */
  attachRequestKey?: number | string | null
  /** When this changes, clear staged attachments (e.g. switching Copilot focus). */
  attachmentResetKey?: string | number | null
  onSubmit?: (message: string, files?: CopilotAttachedFile[]) => void
  /** Staged (not yet sent) attachments — lets a parent act on files without a send. */
  onFilesChange?: (files: CopilotAttachedFile[]) => void
  /** Focus the multiline field when the composer mounts (e.g. Notes New tab). */
  autoFocus?: boolean
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
  enableAttachments = true,
  showModeSelector = true,
  attachRequestKey = null,
  attachmentResetKey = null,
  onSubmit,
  onFilesChange,
  autoFocus = false,
}: CopilotComposerProps) {
  const [mode, setMode] = useState<CopilotMode>('fast')
  const [internalMessage, setInternalMessage] = useState('')
  const [files, setFiles] = useState<CopilotAttachedFile[]>([])
  const onFilesChangeRef = useRef(onFilesChange)
  onFilesChangeRef.current = onFilesChange
  useEffect(() => {
    onFilesChangeRef.current?.(files)
  }, [files])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isControlled = value !== undefined && onChange !== undefined
  const message = isControlled ? value : internalMessage

  const setMessage = (next: string) => {
    if (isControlled) {
      onChange(next)
      return
    }
    setInternalMessage(next)
  }

  const handleTranscript = useCallback(
    (transcript: string, isFinal: boolean) => {
      if (!isFinal || !transcript) return
      if (isControlled) {
        onChange(message ? `${message} ${transcript}` : transcript)
        return
      }
      setInternalMessage((current) => (current ? `${current} ${transcript}` : transcript))
    },
    [isControlled, message, onChange],
  )

  const { isListening, isSupported, error, toggleListening } = useSpeechRecognition({
    onTranscript: handleTranscript,
    continuous: false,
  })

  useEffect(() => {
    if (attachRequestKey == null) return
    fileInputRef.current?.click()
  }, [attachRequestKey])

  useEffect(() => {
    setFiles([])
  }, [attachmentResetKey])

  const ingestFileList = useCallback((fileList: FileList | File[]) => {
    if (!enableAttachments) return
    const incoming = Array.from(fileList)
      .filter(isAcceptedWizardFile)
      .map(createUploadedFile)
    if (incoming.length === 0) return
    setFiles((current) => mergeUploadedFiles(current, incoming))
  }, [enableAttachments])

  const handleDrop = (event: React.DragEvent) => {
    if (!enableAttachments) return
    event.preventDefault()
    setDragActive(false)
    if (event.dataTransfer.files?.length) {
      ingestFileList(event.dataTransfer.files)
    }
  }

  const canSubmit = message.trim().length > 0 || files.length > 0

  const handleSubmit = () => {
    const trimmed = message.trim()
    if (!trimmed && files.length === 0) return
    onSubmit?.(trimmed, files)
    if (clearOnSubmit) {
      setMessage('')
      setFiles([])
    }
  }

  return (
    <Box sx={[{ ...(padded ? { px: 2, py: 2 } : {}) }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
      <Box
        onDragEnter={(event) => {
          if (!enableAttachments) return
          event.preventDefault()
          setDragActive(true)
        }}
        onDragOver={(event) => {
          if (!enableAttachments) return
          event.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={(event) => {
          if (!enableAttachments) return
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setDragActive(false)
          }
        }}
        onDrop={handleDrop}
        sx={(theme) => ({
          border: `1px solid ${dragActive ? theme.palette.primary.main : theme.palette.divider}`,
          borderRadius: `${layoutTokens.cardRadius}px`,
          bgcolor: dragActive ? accentSubtle(theme) : 'background.paper',
          boxShadow: isDarkMode(theme) ? 'none' : layoutTokens.cardShadow,
          overflow: 'hidden',
          transition: 'border-color 0.15s ease, background-color 0.15s ease',
          '&:focus-within': {
            borderColor: 'primary.main',
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 0,
          },
        })}
      >
        {dragActive && enableAttachments && (
          <Box
            sx={{
              px: 2,
              py: 0.75,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: (theme) => accentSubtle(theme),
            }}
          >
            <Typography
              variant="caption"
              color="primary"
              sx={{ fontFamily: figmaFontFamilyStack.body, fontWeight: 500 }}
            >
              Drop ACORDs, schedules, loss runs, or broker emails to attach
            </Typography>
          </Box>
        )}

        <TextField
          fullWidth
          multiline
          minRows={minRows}
          maxRows={5}
          variant="standard"
          placeholder={isListening ? 'Listening…' : placeholder}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onFocus={onFocus}
          autoFocus={autoFocus}
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
                pb: files.length > 0 ? 0.75 : 1,
                // Outer composer shell owns focus — suppress InputBase ring / underline.
                '&.Mui-focused': {
                  outline: 'none',
                },
                '&:before, &:after': {
                  display: 'none',
                },
              },
            },
          }}
        />

        {files.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ px: 1.75, pb: 1 }}>
            {files.map((file) => (
              <Chip
                key={file.id}
                size="small"
                label={`${kindLabel(file.kind)} · ${file.name}`}
                onDelete={() => setFiles((current) => current.filter((item) => item.id !== file.id))}
                deleteIcon={<CloseIcon sx={{ fontSize: '14px !important' }} />}
                sx={{
                  maxWidth: '100%',
                  fontFamily: figmaFontFamilyStack.body,
                  fontSize: '0.75rem',
                  '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
                }}
              />
            ))}
          </Stack>
        )}

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
          <Stack direction="row" spacing={0.25} alignItems="center" sx={{ minWidth: 0, flexWrap: 'wrap' }}>
            {enableAttachments && (
              <>
                <IconButton
                  size="small"
                  aria-label="Attach documents"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AttachFileOutlinedIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: figmaFontFamilyStack.body, mr: 0.5 }}
                >
                  {files.length > 0 ? `${files.length} attached` : 'Drop files here'}
                </Typography>
              </>
            )}
            {selectorOptions && selectorValue !== undefined && onSelectorChange ? (
              <ComposerToolbarSelector
                value={selectorValue}
                options={selectorOptions}
                onChange={onSelectorChange}
                showModelRow={false}
              />
            ) : showModeSelector ? (
              <ModePopover mode={mode} onChange={setMode} />
            ) : null}
          </Stack>

          <Stack direction="row" spacing={0.25} alignItems="center">
            <VoiceInputButton
              isListening={isListening}
              isSupported={isSupported}
              error={error}
              onToggle={toggleListening}
            />
            <ComposerSendButton canSubmit={canSubmit} onClick={handleSubmit} />
          </Stack>
        </Stack>

        {enableAttachments && (
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            accept={FILE_ACCEPT}
            onChange={(event) => {
              if (event.target.files) ingestFileList(event.target.files)
              event.target.value = ''
            }}
          />
        )}
      </Box>

      {footerAction}

      {isListening && (
        <Typography variant="caption" color="primary" sx={{ ...bodySx, mt: 0.5, display: 'block' }}>
          Listening… speak naturally to continue.
        </Typography>
      )}

      {showDisclaimer && (
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ ...bodySx, mt: footerAction || isListening ? 0.75 : 1, display: 'block', textAlign: 'center' }}
        >
          Copilot uses AI. Check for mistakes. Terms &amp; conditions.
        </Typography>
      )}
    </Box>
  )
}
