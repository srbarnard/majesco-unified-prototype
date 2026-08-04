import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCallback, useRef, useState } from 'react'
import { VoiceInputButton } from '@/design-system/components/SearchField/VoiceInputButton'
import { accentSubtle, isDarkMode } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { QuoteWizardUploadedFile } from '@/pages/quotes/data/quoteWizardTypes'
import {
  createUploadedFile,
  isAcceptedWizardFile,
  kindLabel,
} from '@/pages/quotes/utils/quoteWizardDocuments'
import { ComposerSendButton } from '@/pages/policies/components/ComposerSendButton'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

type QuoteWizardNaturalLanguageInputProps = {
  value: string
  placeholder: string
  files?: QuoteWizardUploadedFile[]
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  onFilesAdd?: (files: QuoteWizardUploadedFile[]) => void
  onFileRemove?: (fileId: string) => void
  enableAttachments?: boolean
}

export function QuoteWizardNaturalLanguageInput({
  value,
  placeholder,
  files = [],
  onChange,
  onSubmit,
  onFilesAdd,
  onFileRemove,
  enableAttachments = true,
}: QuoteWizardNaturalLanguageInputProps) {
  const [draft, setDraft] = useState(value)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTranscript = useCallback(
    (transcript: string, isFinal: boolean) => {
      if (isFinal && transcript) {
        setDraft((current) => {
          const next = current ? `${current} ${transcript}` : transcript
          onChange(next)
          return next
        })
      }
    },
    [onChange],
  )

  const { isListening, isSupported, error, toggleListening } = useSpeechRecognition({
    onTranscript: handleTranscript,
    continuous: false,
  })

  const canSubmit = draft.trim().length > 0 || files.length > 0

  const handleSubmit = () => {
    const trimmed = draft.trim()
    if (!trimmed && files.length === 0) return
    if (trimmed) onSubmit(trimmed)
    onChange(trimmed)
  }

  const ingestFileList = useCallback(
    (fileList: FileList | File[]) => {
      if (!enableAttachments || !onFilesAdd) return
      const incoming = Array.from(fileList)
        .filter(isAcceptedWizardFile)
        .map(createUploadedFile)
      if (incoming.length > 0) onFilesAdd(incoming)
    },
    [enableAttachments, onFilesAdd],
  )

  const handleDrop = (event: React.DragEvent) => {
    if (!enableAttachments) return
    event.preventDefault()
    setDragActive(false)
    if (event.dataTransfer.files?.length) {
      ingestFileList(event.dataTransfer.files)
    }
  }

  return (
    <Box sx={{ mb: 2 }}>
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
            <Typography variant="caption" color="primary" sx={{ fontFamily: figmaFontFamilyStack.body, fontWeight: 500 }}>
              Drop ACORDs, schedules, loss runs, or broker emails to attach
            </Typography>
          </Box>
        )}

        <TextField
          fullWidth
          multiline
          minRows={3}
          maxRows={6}
          variant="standard"
          placeholder={isListening ? 'Listening…' : placeholder}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            onChange(event.target.value)
          }}
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
                fontFamily: figmaFontFamilyStack.body,
                fontSize: '0.9375rem',
                px: 2,
                pt: 1.75,
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

        {files.length > 0 && onFileRemove && (
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ px: 2, pb: 1 }}>
            {files.map((file) => (
              <Chip
                key={file.id}
                size="small"
                label={`${kindLabel(file.kind)} · ${file.name}`}
                onDelete={() => onFileRemove(file.id)}
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

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, py: 0.75 }}>
          <Stack direction="row" spacing={0.25} alignItems="center">
            {enableAttachments && (
              <>
                <IconButton size="small" aria-label="Attach documents" onClick={() => fileInputRef.current?.click()}>
                  <AttachFileOutlinedIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
                  {files.length > 0 ? `${files.length} attached` : 'Drop files here'}
                </Typography>
              </>
            )}
          </Stack>
          <Stack direction="row" spacing={0.25} alignItems="center">
            <VoiceInputButton
              isListening={isListening}
              isSupported={isSupported}
              error={error}
              onToggle={toggleListening}
            />
            <ComposerSendButton
              canSubmit={canSubmit}
              onClick={handleSubmit}
              ariaLabel="Apply description"
            />
          </Stack>
        </Stack>

        {enableAttachments && (
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.eml,.msg"
            onChange={(event) => {
              if (event.target.files) ingestFileList(event.target.files)
              event.target.value = ''
            }}
          />
        )}
      </Box>
      {isListening && (
        <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>
          Listening… speak naturally to describe the account.
        </Typography>
      )}
    </Box>
  )
}
